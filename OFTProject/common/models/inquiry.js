'use strict';

module.exports = function(Inquiry) {

	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	//validations
	Inquiry.validatesPresenceOf('FirstName', {
		message: 'Name Cannot be blank'
	});

	Inquiry.validatesFormatOf('EmailId', {
		with: re,
		message: 'invalid email id'
	});
	// Inquiry.validatesInclusionOf('CourseName', {
	//     in: ["UI5 and Fiori", "ABAP on HANA", "Launchpad", "HANA XS",  "Hybris C4C",
	//          ,"HANA Cloud Integration","SAP Cloud Platform","ABAP", "OOPS ABAP", "Webdynpro", "Workflow", "FPM", "Other"
	//          ,"ABAP on Cloud","S4HANA Extension","BRF", "SimpleLogistics","SimpleFinance", "Google Blockly", "Leonardo ML"], message: 'Course Name is not allowed'
	// });
	//anubhav push from atom
	///Parse microsoft ISO Date while read : /Date(1540319400000)/
	//jsonDate = "/Date(1540319400000)/"; var date = new Date(parseInt(jsonDate.substr(6)));
	Inquiry.observe("before save", function(ctx, next) {
		var app = require('../../server/server');
		var AppUser = app.models.AppUser;
		var Block = app.models.Block;
		//console.log("Context kya hai" + ctx.instance.EmailId  + "   " +   ctx.instance.CourseName);
		if (ctx.instance && ctx.instance.EmailId && ctx.instance.CourseName) {
			// debugger;
			Block.findOne({
					where: {
						EmailId: ctx.instance.EmailId
					},
					limit: 1
				})
				.then(function(block) {
					console.log(ctx.instance.EmailId);
					if (!block) {
						// and: [{EmailId: ctx.instance.EmailId}, {CourseName: ctx.instance.CourseName}]
						Inquiry.find({
								where: {
									EmailId: ctx.instance.EmailId
								}
							})
							.then(function(inqs) {
								console.log(ctx.instance.EmailId + ctx.instance.CourseName);
								// debugger;
								var exist = false,
									inq;
								inqs.forEach(function(item, index) {
									if (item.CourseName === ctx.instance.CourseName || item.source === "L" || item.source === "N" || item.source === "F") {
										exist = true;
										inq = inqs[index];
									}
								});
								if (exist) {
									//console.log(JSON.stringify(inq));
									AppUser.findOne({
										where: {
											and: [{
												TechnicalId: ctx.instance.CreatedBy.toString()
											}]
										},
										limit: 1
									}).then(function(appUser) {
										if (inq.SoftDelete) {
											var err = new Error(".Student already took this course, Singed up on " + inq.ChangedOn + ' Created by : ' + inq.ChangedBy);
										} else {
											///known limitation: if a student already taken course w/o inquiry the message will be this
											//good practice such student create an inquiry first then create course
											var err = new Error(".Inquiry already exist, Inquired on " + inq.CreatedOn + ' From Country  : ' + inq.Country + ' & Created by : ' + inq.CreatedBy);
										}

										err.statusCode = 400;
										console.log(err);
										next(err);
									});

								} else {
									//do nothing
									return next();
								}
							});
					} else {
						var err = new Error(".Emaild id is Fraud, Inquired on " + block.CreatedOn + ' From Country  : ' + block.Country + ' & Created by : ' + block.CreatedBy);
						err.statusCode = 400;
						console.log(err);
						next(err);
					}
				});

		} else {
			next();
		}
	});


};
