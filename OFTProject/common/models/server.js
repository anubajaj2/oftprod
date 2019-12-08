'use strict';
var MongoClient = require('mongodb').MongoClient;
module.exports = function(Server) {
	//vallidations
	var app = require('../../server/server');
	var Student = app.models.Student;
	var ServerPay = app.models.ServerPay;

	Server.validatesPresenceOf('PaymentDate', {
		message: 'Payment Date can not be blank'
	});
	Server.validatesPresenceOf('User', {
		message: 'Server User Id Cannot be blank '
	});
	Server.validatesPresenceOf('StudentId', {
		message: 'Customer Id Cannot be blank '
	});
	Server.observe("before delete", function(ctx, next) {
		var data = ctx.where;
		var app = require('../../server/server');
		var Student = app.models.Student;
		var ServerPay = app.models.ServerPay;
		next();
	});

	Server.observe("after delete", function(ctx, next) {
		var data = ctx.where;
		var app = require('../../server/server');
 	var ServerPay = app.models.ServerPay;

		ServerPay.find({
				where: {
					ServerId: data.id.toString()
				}

			})
			.then(function(SerRec, Err) {
				if(SerRec.length == 1){
				ServerPay.destroyAll({ServerId:data.id.toString()},function(){
						console.log(ServerPay);
						next();
				});
				}else{
					next();
				}

			});
	});
	Server.observe("after save", function(ctx, next) {
		var data = ctx.instance.__data || ctx.data;
		var ServerPay = app.models.ServerPay;
		var SerPay = {};
		var currentDate = new Date();
		SerPay.CreatedOn = currentDate;
		SerPay.ChangedOn = currentDate;
		SerPay.Type = "Assignment";
		SerPay.PaymentDate = data.PaymentDate;
		SerPay.StudentId = data.StudentId;
		SerPay.ServerId = data.id.toString();

		if (data.Usage) {
			// if (data.Update == "U") {

			SerPay.Remarks = "Assigned to" + data.User + " User";
			ServerPay.find({
					where: {
						or: [{
							Type: "Payment"
						}, {
							Type: "Assignment"
						}]
					}

				})
				.then(function(SerRec, SerPayerr) {

					if (data.Update == "U") {
								ServerPay.find({
				where: {
					ServerId: data.id.toString()
				}
			}).then(function(serPayUp,errUp){
				if(serPayUp.length == 0){
					next();
				}else{
					if (SerRec.length == 0 ) {
							ServerPay.updateAll({
								ServerId: data.id.toString()
							}, {
								Amount: -data.Usage
							}, {
								Extra: -data.Usage
							}, {
								Update:"U"
							},function(ServerPay, error) {
								console.log(error);
								next();
							});
						} else {
							ServerPay.updateAll({
								ServerId: data.id.toString()
							}, {
								Amount: -data.Usage
							}, {
								Update:"U"
							}
							,function(ServerPay, error) {
								console.log(error);
								next();
							});
						}}
			});

					} else {
						if (SerRec["length"] == 0) {
							SerPay.Extra = -data.Usage;
						} else {
							SerPay.Extra = -data.Usage + SerRec[0].__data.Extra;
						}
						SerPay.Amount = -data.Usage;
						ServerPay.create(SerPay)
							.then(function(ServerPay) {
									next();
								console.log(ServerPay);
							});


					}
				});
			// } else {
			// 	next();
			// }
		}else{next();}
	});

	Server.observe("before save", function(ctx, next) {
		var app = require('../../server/server');
		var Student = app.models.Student;
		var ServerPay = app.models.ServerPay;
		var err_flag;
		var data = ctx.instance || ctx.data;
		var today = new Date();
		if (data.PaymentDate > today) {
			err_flag = 'X';
			var err = new Error(
				"ValidationError: The `Server` instance is not valid. Details: `PaymentDate` The payment date of server cannot be in the future.");

			err.statusCode = 400;
			next(err);
		} else {
			if (data.EndDate < data.StartDate) {
				err_flag = 'X';
				var err = new Error(
					"ValidationError: The `Server` instance is not valid. Details: `EndDate` The end date of the server cannot be before the start date."
				);
				err.statusCode = 400;
				next(err);

			} else {
				if (!data.FreeAccess && data.Amount == 0) {
					err_flag = 'X';
					var err = new Error(
						"ValidationError: The `Server` instance is not valid. Details: `Amount` The amount of server must not be 0 ."
					);
					err.statusCode = 400;
					next(err);
				}
			}
		}

		var date = new Date();

		if (!err_flag) {
			if (data.Update == 'U') {
				next();
				// ServerPay.find({
				// 		where: {
				// 			and: [{
				// 				ServerId: data.id.toString()
				// 			}]
				// 		}

				// 	})
				// 	.then(function(SerRec, SerPayerr) {
				// 		if (SerRec["length"] == 0) {

				// 			var err = new Error(".Reference Payment entry not found");
				// 			err.statusCode = 400;
				// 			next(err);
				// 		} else {
				// 			next();
				// 		}

				// 	});

			} else {
				Server.find({
						where: {
							and: [{
								User: data.User
							}, {
								EndDate: {
									gte: data.StartDate.toDateString()
								}
							}]
						}
					})
					.then(function(Records, Serr) {
						var app = require('../../server/server');
						if (Serr) {
							next(Serr);
						} else {

							var Ucount = 0;
							var studentId = [];
							var usrValidity = [];
							var Amount;
							var Duplicate;
							var SerPay = {};
							var currentDate = new Date();

							if (Records["length"] == 0) {
								next();
							} else {

								for (var i = 0; i < Records["length"]; i++) {

									if (Records[i].__data.StudentId.toString() == data.StudentId.toString()) {
										Duplicate = 'X';
										studentId.push(Records[i].__data.StudentId);
										usrValidity = Records[i].__data;
										// break;
									} else {
										if (Records[i].__data.StudentId.toString() == data.ReassignStd.toString()) {
											continue;
										} else {
											if (Records[i].__data.StartDate.toDateString() != data.StartDate.toDateString()) {
												var StartDatDif = 'X';
												var StartDateStd = Records[i].__data.StudentId;
												studentId.push(Records[i].__data.StudentId);
												usrValidity = Records[i].__data;
												// break;
											} else {
												Ucount = Ucount + 1;
												studentId.push(Records[i].__data.StudentId);
												usrValidity = Records[i].__data;
											}
										}
									}
								}

								if (studentId["length"] == 0) {
									next();
									SerPay.CreatedOn = currentDate;
									SerPay.ChangedOn = currentDate;
									SerPay.Type = "Assignment";
									SerPay.PaymentDate = data.PaymentDate;
									SerPay.StudentId = data.StudentId;

									// SerPay.Extra="";

									ServerPay.find({
											where: {
												or: [{
													Type: "Payment"
												}, {
													Type: "Assignment"
												}]
											}
										})
										.then(function(SerRec, SerPayerr) {
											if (SerRec["length"] != 0) {
												if (SerRec[0].__data.Type.toString() != "Assignment") {
													for (var i = 0; i < SerRec["length"]; i++) {
														if (SerRec[i].__data.Type.toString() == "Assignment") {
															SerPay = SerRec[i].__data;
															Amount = data.Amount + SerPay.Extra;
															break;
														}
													}
												} else {
													Amount = data.Amount + SerRec[0].__data.Extra;
												}
												SerPay.Count = SerRec[0].__data.Count;

												if (Amount >= 2000) {
													SerPay.Extra = Amount % 2000;
													SerPay.Count = SerPay.Count - Math.floor(Amount / 2000);
													SerPay.Amount = -(Amount - SerPay.Extra);
												} else {
													SerPay.Extra = data.Amount;
												}
											} else {
												if (data.Amount >= 2000) {
													SerPay.Count = -Math.floor(data.Amount / 2000);
													SerPay.Extra = data.Amount % 2000;
													SerPay.Amount = -(data.Amount - SerPay.Extra);
												} else {
													SerPay.Extra = Amount % 2000;
												}

											}

											// ServerPay.ServerId = data.id.toString();
											ServerPay.create(SerPay)
												.then(function(ServerPay) {
													console.log(ServerPay);
												});

										});

								} else {
									Student.find({
										// where: {
										// 	and: [{
										// 		id: data.StudentId.toString()
										// 	}]
										// }
									})

									.then(function(StuRec, err) {

										if (err) {
											next(err);
										} else {
											var StuRecN;
											var StuRecOld;
											var stdGmail;
											var HighUsageO;
											var HighUsageOGmail;
											var StartDateStdGmail;
											var brk;

											for (var i = 0; i < StuRec["length"]; i++) {

												for (var j = 0; j < studentId["length"]; j++) {
													if (StuRec[i].__data.id.toString() == data.StudentId.toString()) {
														StuRecN = StuRec[i].__data;
														if (StuRecN.HighServerUsage == true) {
															var HighUsageN = 'X';
															brk = 'X';
															break;
														}
													} else if (StuRec[i].__data.id.toString() == StartDateStd) {
														StartDateStdGmail = StuRec[i].__data.GmailId;
														StuRecN = StuRec[i].__data;
														brk = 'X';
														break;
													} else if (StuRec[i].__data.id.toString() == studentId[j].toString()) {
														// StuRecOld.push(Records[j].__data);
														if (stdGmail) {
															stdGmail = stdGmail + " " + StuRec[i].__data.GmailId;
														} else {
															stdGmail = StuRec[i].__data.GmailId;
														}
														if (StuRec[i].__data.HighServerUsage == true) {
															HighUsageO = 'X';
															HighUsageOGmail = StuRec[i].__data.GmailId;
															brk = 'X';
															break;
														}

													} else {
														continue;
													}
												}
												if (brk == 'X') {
													break;
												}
											}

											if (Ucount >= 3) {
												var err = new Error(".User " + data.User + " already assigned to " + stdGmail + " with validity " + usrValidity.StartDate +
													"-" +
													usrValidity.EndDate);
												err.statusCode = 400;
												console.log(err.toString());
												next(err);
											} else {

												if (Duplicate == 'X') {
													var err = new Error(".The Student " + StuRecN.GmailId.toString() + " already owning the " + data.User +
														" user with validity " + usrValidity.StartDate +
														"-" + usrValidity.EndDate);
													err.statusCode = 400;
													console.log(err.toString());
													next(err);
												} else if (StartDatDif == 'X') {
													var err = new Error(".The User already assgined to Student " + StartDateStdGmail + " with validity " + usrValidity.StartDate +
														"-" + usrValidity.EndDate);
													err.statusCode = 400;
													console.log(err.toString());
													next(err);
												} else {
													if (HighUsageN == 'X' || HighUsageO == 'X') {
														if (HighUsageN == 'X') {
															var err = new Error(".The " + data.User + " user can not be assigned to " + StuRecN.GmailId + " because " + StuRecN.GmailId +
																" is High Server Usage Student");
															err.statusCode = 400;
															console.log(err.toString());
															next(err);
														} else if (HighUsageO == 'X') {
															var err = new Error(".The " + data.User + " user can not be assigned because High Server Usage Student " +
																HighUsageOGmail + " is already assigned with validity " + usrValidity.StartDate +
																"-" + usrValidity.EndDate);
															err.statusCode = 400;
															console.log(err.toString());
															next(err);
														}

													} else {
														next();
													}

												}
											}

										}

									});
								}

							}

						}
					});
				console.log(data.User);

			}
		}

		console.log("Context kya hai" + data.User + "   " + data.StudentId);

	});
};
