'use strict';
module.exports = function(Sub) {
	//validations
	Sub.validatesPresenceOf('StudentId', {
		message: 'Customer ID cannot be blank'
	});
	Sub.validatesPresenceOf('CourseId', {
		message: 'Batch cannot be blank'
	});
	Sub.validatesPresenceOf('PaymentDate', {
		message: 'PaymentDate cannot be blank'
	});
	Sub.observe("before save", function(ctx, next) {
		//console.log("Context kya hai" + ctx.instance.StudentId  + "   " +  ctx.instance.CourseId);

		if (ctx.instance && ctx.instance.StudentId && ctx.instance.CourseId) {
			Sub.findOne({
					where: {
						and: [{
							StudentId: ctx.instance.StudentId
						}, {
							CourseId: ctx.instance.CourseId
						}]
					},
					limit: 1
				})
				.then(function(subs) {
					//console.log(ctx.instance.EmailId  + ctx.instance.CourseName );
					if (subs) {
						if ((ctx.instance.PendingAmount === 0) || (!ctx.instance.PendingAmount)) {
							ctx.instance.PartialPayment = false; //payment completed
						} else {
							ctx.instance.PartialPayment = true;
						}
						if(ctx.instance.CourseId.toString()	=== "5f971b523fb2a86ca4ad946e" ||
						ctx.instance.CourseId.toString()	=== "5f9718653fb2a86ca4ad946b"){
							return next();
						}
						if (ctx.instance.UpdatePayment === false) {
							//console.log(JSON.stringify(subs));
							var err = new Error(".Subscription already exist, Added on " + subs.CreatedOn.toString() + ' Created by : ' + subs.CreatedBy.toString());
							err.statusCode = 400;
							//console.log(err.toString());
							next(err);
						} else {
							//do nothing
							return next();
						}
					} else {
						//do nothing
						return next();
					}
				});
		} else {
			next();
		}
	});

	Sub.observe("after save", function(ctx, next) {
		var app = require('../../server/server');
		var Inquiry = app.models.Inquiry;
		var Student = app.models.Student;
		var Course = app.models.Course;
		if(ctx.isNewInstance === false){
			next();
		}
		var id_Stu = ctx.instance.__data.StudentId.toString();
		var id_Cour = ctx.instance.__data.CourseId.toString();
		if (ctx.instance.UpdatePayment === false) {
			if (ctx.instance && ctx.instance.StudentId && ctx.instance.CourseId) {
				Student.findOne({
						where: {
							id: id_Stu
						},
						limit: 1
					})
					.then(function(Stu) {
						var v_EmailId  = Stu.GmailId;
						var v_EmailId1 = Stu.OtherEmail1;
						var v_EmailId2 = Stu.OtherEmail2;
						Course.findOne({
								where: {
									id: id_Cour
								},
								limit: 1
							})
							.then(function(Cour) {
								var v_CourseName = Cour.Name;
								if (v_EmailId && v_CourseName) {
									Inquiry.findOne({
											where: {
												and: [{
													EmailId: v_EmailId
												}, {
													CourseName: v_CourseName
												}]
											},
											limit: 1
										})
										.then(function(inq) {
											//console.log(ctx.instance.EmailId + ctx.instance.CourseName);
											if (inq) {
												//	console.log(JSON.stringify(inq));
												if (!inq.SoftDelete) {
													inq.SoftDelete = true;
													inq.ChangedOn = new Date();
													inq.ChangedBy = "Needs To be Passed";
													inq.updateAttributes(inq, function() {
														console.log("The student inquiry is now soft deleted");
														return next();
													});
												}else {
													//do nothing
													console.log("Iquiry already deleted");
													return next();
												}
											} else {
												//do nothing
												console.log("No Iquiry found for this");
												return next();
											}
										});
								} else {
									next();
								}



								if (v_EmailId1 && v_CourseName) {
									Inquiry.findOne({
											where: {
												and: [{
													EmailId: v_EmailId1
												}, {
													CourseName: v_CourseName
												}]
											},
											limit: 1
										})
										.then(function(inq) {
											//console.log(ctx.instance.EmailId + ctx.instance.CourseName);
											if (inq) {
												//	console.log(JSON.stringify(inq));
												if (!inq.SoftDelete) {
													inq.SoftDelete = true;
													inq.ChangedOn = new Date();
													inq.ChangedBy = "Needs To be Passed";
													inq.updateAttributes(inq, function() {
														console.log("The student inquiry is now soft deleted");
														return next();
													});
												}else {
													//do nothing
													console.log("Iquiry already deleted");
													return next();
												}
											} else {
												//do nothing
												console.log("No Iquiry found for this");
												return next();
											}
										});
								} else {
									next();
								}

								if (v_EmailId2 && v_CourseName) {
									Inquiry.findOne({
											where: {
												and: [{
													EmailId: v_EmailId2
												}, {
													CourseName: v_CourseName
												}]
											},
											limit: 1
										})
										.then(function(inq) {
											//console.log(ctx.instance.EmailId + ctx.instance.CourseName);
											if (inq) {
												//	console.log(JSON.stringify(inq));
												if (!inq.SoftDelete) {
													inq.SoftDelete = true;
													inq.ChangedOn = new Date();
													inq.ChangedBy = "Needs To be Passed";
													inq.updateAttributes(inq, function() {
														console.log("The student inquiry is now soft deleted");
														return next();
													});
												}else {
													//do nothing
													console.log("Iquiry already deleted");
													return next();
												}
											} else {
												//do nothing
												console.log("No Iquiry found for this");
												return next();
											}
										});
								} else {
									next();
								}




							});
					});
			}
			     else {
			     	next();
			}
		} else {
			//var v_partPay = ctx.instance.__data.PartialPayment;
			// if (v_partPay === false) { //means it's the last payment
			// 	Sub.find({
			// 			where: {
			// 				and: [{
			// 					StudentId: ctx.instance.StudentId
			// 				}, {
			// 					CourseId: ctx.instance.CourseId
			// 				}]
			// 			}
			// 		})
			// 		.then(function(subs) {
			// 			console.log(subs);
			// 			var numberOfEntries = subs.length;
			// 			for (var i = 0; i < numberOfEntries; i++) {
			// 				if (subs[i].PartialPayment === true) {
			// 					subs[i].PartialPayment = false;
			// 					subs[i].ChangedOn = new Date();
			// 					subs[i].ChangedBy = "Needs To be Passed";
			// 					subs[i].updateAttributes(subs[i], function() {
			// 						console.log("Payment Record completed");
			// 						return next();
			// 					});
			// 				}
			// 			}
			// 		});
			// }
			next();
		}
	});
};
