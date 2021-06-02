var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var studentPortalAPI = require("./api_student_portal");
var express = require('express');
var fs = require('fs');
var app = express();
app = module.exports = loopback();
// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({
	secret: 'anubhavApp'
}));
app.use(fileUpload());
app.start = function() {
	// start the web server
	return app.listen(function() {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath;
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
		}

		var Server = app.models.Server;
		var ServerPay = app.models.ServerPay;

		app.get('/ServerDownload', function(req, res) {

			Server.find({})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

							sheet.addRow().values = Object.keys(Records[0].__data);

							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}

							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									if (err) {
										console.log('---------- error downloading file: ', err);
									}
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});
		app.get("/getStudentPortalStudents", async function(req, res) {
			var r = await studentPortalAPI.studentPortal("GET", "students");
			res.send(r);
		});
		app.get("/replicateStudentsToStudentPortal", function(req, res) {
			var Students = app.models.Student;
			Students.find().then(function(results) {
				portalRecords = [];
				results.forEach(function(item) {
					portalRecords.push({
						"name": item.Name,
						"email": item.GmailId,
						"companyMail": item.CompanyMail === "null" ? undefined : item.CompanyMail,
						"otherEmail1": item.OtherEmail1 === "null" ? undefined : item.OtherEmail1,
						"otherEmail2": item.OtherEmail2 === "null" ? undefined : item.OtherEmail2,
						// "gender": null,
						"contactNo": item.ContactNo === "null" ? undefined : item.ContactNo.toString(),
						// "officecontactNo": null,
						// "experience": null,
						"address": item.Address === "null" ? undefined : item.Address,
						"city": item.City === "null" ? undefined : item.City,
						// "state": null,
						"country": item.Country === "null" ? undefined : item.Country,
						"designation": item.Designation === "null" ? undefined : item.Designation,
						"star": item.Star === "null" ? undefined : item.Star,
						// "draft": null,
						// "draftRejection": null,
						// "draftRejectionReason": null,
						"defaulter": item.Defaulter,
						"highServerUsage": item.HighServerUsage,
						"Skills": item.Skills === "null" ? undefined : item.Skills,
						"Resume": item.Resume === "null" ? undefined : item.Resume,
						// "Photo": null,
						"extra1": item.Extra1 === "null" ? undefined : item.Extra1,
						"extra2": item.Extra2 === "null" ? undefined : item.Extra2,
						"GSTIN": item.GSTIN === "null" ? undefined : item.GSTIN,
						"company": item.Company === "null" ? undefined : item.Company,
						"GSTCharge": item.GSTCharge === "null" ? undefined : item.GSTCharge,
						"CreatedOn": item.CreatedOn,
						"ChangedOn": item.ChangedOn,
						"CreatedBy": item.CreatedBy,
						"ChangedBy": item.ChangedBy,
						// "userId": null,
					});
				});

				// portalRecords.forEach(async function(item) {
				// 	try {
				// 		await studentPortalAPI.studentPortal("POST", "students", item);
				// 	} catch (err) {
				// 		console.log(err.responseJSON.error.message);
				// 	}
				// });
				var response = {
					newRecordsAdded: 0,
					error: {}
				};
				async function postRecord(items, index = 0) {
					if (items.length > index) {
						try {
							await studentPortalAPI.studentPortal("POST", "students", items[index]);
							response.newRecordsAdded += 1;
						} catch (err) {
							if (response.error[err.responseJSON.error.message]) {
								response.error[err.responseJSON.error.message] += 1;
							} else {
								response.error[err.responseJSON.error.message] = 1;
							}
						}
						postRecord(items, ++index);
					} else {
						res.send(response);
					}
				}
				postRecord(portalRecords);
			}).catch(function(oError) {
				res.send(oError.responseJSON.error.message);
			});
		});
		app.get("/replicateBatchesToStudentPortal", function(req, res) {
			var Courses = app.models.Course;
			Courses.find().then(function(results) {
				var portalRecords = [];
				results.forEach(function(item) {
					portalRecords.push({
						Name: item.Name,
						BatchNo: item.BatchNo,
						DemoStartDate: item.DemoStartDate,
						StartDate: item.StartDate,
						EndDate: item.EndDate,
						BlogEndDate: item.BlogEndDate,
						Link: item.Link,
						Weekend: item.Weekend,
						Timings: item.Timings === 'null' ? undefined : item.Timings,
						Fee: item.Fee,
						Extra: item.Extra === 'null' ? undefined : item.Extra,
						Extra1: item.Extra1 === 'null' ? undefined : item.Extra1,
						CalendarId: item.CalendarId === 'null' ? undefined : item.CalendarId,
						EventId: item.EventId === 'null' ? undefined : item.EventId,
						DriveId: item.DriveId === 'null' ? undefined : item.DriveId,
						hidden: item.hidden,
						CreatedOn: item.CreatedOn,
						CreatedBy: item.CreatedBy,
						ChangedOn: item.ChangedOn,
						ChangedBy: item.ChangedBy,
						analysis: item.analysis,
						status: item.status === ' ' ? undefined : item.status
					});
				});
				// portalRecords.forEach(async function(item) {
				// 	try {
				// 		await studentPortalAPI.studentPortal("POST", "students", item);
				// 	} catch (err) {
				// 		console.log(err.responseJSON.error.message);
				// 	}
				// });
				var response = {
					newRecordsAdded: 0,
					error: {}
				};
				async function postRecord(items, index = 0) {
					if (items.length > index) {
						try {
							await studentPortalAPI.studentPortal("POST", "batches", items[index]);
							response.newRecordsAdded += 1;
						} catch (err) {
							if (response.error[err.responseJSON.error.message]) {
								response.error[err.responseJSON.error.message] += 1;
							} else {
								response.error[err.responseJSON.error.message] = 1;
							}
						}
						postRecord(items, ++index);
					} else {
						res.send(response);
					}
				}
				postRecord(portalRecords);
			}).catch(function(oError) {
				res.send(oError.responseJSON.error.message);
			});
		});
		app.get("/replicateSubsToStudentPortal", function(req, res) {
			var Subs = app.models.Sub;
			Subs.find().then(function(results) {
				debugger;
				portalRecords = [];
				results.forEach(function(item) {
					portalRecords.push({
						"StudentId": item.StudentId,
						"CourseId": item.CourseId,
						"PaymentDate": item.PaymentDate,
						"Mode": item.Mode === "null" ? undefined : item.Mode,
						"StartDate": item.StartDate,
						"EndDate": item.EndDate,
						"PaymentMode": item.PaymentMode === "null" ? undefined : item.PaymentMode,
						"BankName": item.BankName === "null" ? undefined : item.BankName,
						"AccountName": item.AccountName === "null" ? undefined : item.AccountName,
						"Amount": item.Amount,
						"Reference": item.Reference === "null" ? undefined : item.Reference,
						"Remarks": item.Remarks === "null" ? undefined : item.Remarks,
						"PendingAmount": item.PendingAmount,
						"Waiver": item.Waiver,
						"DropOut": item.DropOut,
						"PaymentScreenshot": item.PaymentScreenshot === "null" ? undefined : item.PaymentScreenshot,
						"PartialPayment": item.PartialPayment,
						"Extended": item.Extended,
						"PaymentDueDate": item.PaymentDueDate,
						"InvoiceNo": item.InvoiceNo === "null" ? undefined : item.InvoiceNo,
						"USDAmount": item.USDAmount,
						"CurrencyCode": item.CurrencyCode === "null" ? undefined : item.CurrencyCode,
						"Exchange": item.Exchange,
						"Charges": item.Charges,
						"SettleDate": item.SettleDate,
						"SettleAmount": item.SettleAmount,
						"ValidationDone": item.ValidationDone,
						"Extra1": item.Extra1 === "null" ? undefined : item.Extra1,
						"Extra2": item.Extra2 === "null" ? undefined : item.Extra2,
						"ExtraN1": item.ExtraN1,
						"ExtraN2": item.ExtraN2,
						"ExtraN3": item.ExtraN3,
						"UpdatePayment": item.UpdatePayment,
						"MostRecent": item.MostRecent,
						"CreatedOn": item.CreatedOn,
						"CreatedBy": item.CreatedBy === "null" ? undefined : item.CreatedBy,
						"ChangedOn": item.ChangedOn === "null" ? undefined : item.ChangedOn,
						"ChangedBy": item.ChangedBy === "null" ? undefined : item.ChangedBy,
						"Status": item.Status === "null" ? undefined : item.Status,
						"ChartedValid": item.ChartedValid
					});
				});

				// portalRecords.forEach(async function(item) {
				// 	try {
				// 		await studentPortalAPI.studentPortal("POST", "students", item);
				// 	} catch (err) {
				// 		console.log(err.responseJSON.error.message);
				// 	}
				// });
				var response = {
					newRecordsAdded: 0,
					error: {}
				};
				async function postRecord(items, index = 0) {
					if (items.length > index) {
						try {
							await studentPortalAPI.studentPortal("POST", "subscriptions", items[index]);
							response.newRecordsAdded += 1;
						} catch (err) {
							if (response.error[err.responseJSON.error.message]) {
								response.error[err.responseJSON.error.message] += 1;
							} else {
								response.error[err.responseJSON.error.message] = 1;
							}
						}
						postRecord(items, ++index);
					} else {
						res.send(response);
					}
				}
				postRecord(portalRecords);
			}).catch(function(oError) {
				res.send(oError.responseJSON.error.message);
			});
		});
		app.post('/replicateOneStudentToStudentPortal', async function(req, res) {
			var mailId = req.body.mailId;
			var Students = app.models.Student;
			Students.find({
				where: {
					or: [{
							GmailId: mailId
						},
						{
							OtherEmail1: mailId
						},
						{
							OtherEmail2: mailId
						}
					]
				}
			}).then(function(results) {
				portalRecords = [];
				results.forEach(function(item) {
					portalRecords.push({
						"name": item.Name,
						"email": item.GmailId,
						"companyMail": item.CompanyMail === "null" ? undefined : item.CompanyMail,
						"otherEmail1": item.OtherEmail1 === "null" ? undefined : item.OtherEmail1,
						"otherEmail2": item.OtherEmail2 === "null" ? undefined : item.OtherEmail2,
						// "gender": null,
						"contactNo": item.ContactNo === "null" ? undefined : item.ContactNo.toString(),
						// "officecontactNo": null,
						// "experience": null,
						"address": item.Address === "null" ? undefined : item.Address,
						"city": item.City === "null" ? undefined : item.City,
						// "state": null,
						"country": item.Country === "null" ? undefined : item.Country,
						"designation": item.Designation === "null" ? undefined : item.Designation,
						"star": item.Star === "null" ? undefined : item.Star,
						// "draft": null,
						// "draftRejection": null,
						// "draftRejectionReason": null,
						"defaulter": item.Defaulter,
						"highServerUsage": item.HighServerUsage,
						"Skills": item.Skills === "null" ? undefined : item.Skills,
						"Resume": item.Resume === "null" ? undefined : item.Resume,
						// "Photo": null,
						"extra1": item.Extra1 === "null" ? undefined : item.Extra1,
						"extra2": item.Extra2 === "null" ? undefined : item.Extra2,
						"GSTIN": item.GSTIN === "null" ? undefined : item.GSTIN,
						"company": item.Company === "null" ? undefined : item.Company,
						"GSTCharge": item.GSTCharge === "null" ? undefined : item.GSTCharge,
						"CreatedOn": item.CreatedOn,
						"ChangedOn": item.ChangedOn,
						"CreatedBy": item.CreatedBy,
						"ChangedBy": item.ChangedBy,
					});
				});
				var response = {
					newRecordsAdded: 0,
					error: {}
				};
				async function postRecord(items, index = 0) {
					if (items.length > index) {
						try {
							await studentPortalAPI.studentPortal("POST", "students", items[index]);
							response.newRecordsAdded += 1;
						} catch (err) {
							if (response.error[err.responseJSON.error.message]) {
								response.error[err.responseJSON.error.message] += 1;
							} else {
								response.error[err.responseJSON.error.message] = 1;
							}
						}
						postRecord(items, ++index);
					} else {
						res.send(response);
					}
				}
				postRecord(portalRecords);
			}).catch(function(oError) {
				res.send(oError.responseJSON.error.message);
			});
		});
		app.get("/replicateBatchesToStudentPortal", function(req, res) {
			var Courses = app.models.Course;
			Courses.find().then(function(results) {
				var portalRecords = [];
				results.forEach(function(item) {
					portalRecords.push({
						Name: item.Name,
						BatchNo: item.BatchNo,
						DemoStartDate: item.DemoStartDate,
						StartDate: item.StartDate,
						EndDate: item.EndDate,
						BlogEndDate: item.BlogEndDate,
						Link: item.Link,
						Weekend: item.Weekend,
						Timings: item.Timings === 'null' ? undefined : item.Timings,
						Fee: item.Fee,
						Extra: item.Extra === 'null' ? undefined : item.Extra,
						Extra1: item.Extra1 === 'null' ? undefined : item.Extra1,
						CalendarId: item.CalendarId === 'null' ? undefined : item.CalendarId,
						EventId: item.EventId === 'null' ? undefined : item.EventId,
						DriveId: item.DriveId === 'null' ? undefined : item.DriveId,
						hidden: item.hidden,
						CreatedOn: item.CreatedOn,
						CreatedBy: item.CreatedBy,
						ChangedOn: item.ChangedOn,
						ChangedBy: item.ChangedBy,
						analysis: item.analysis,
						status: item.status === ' ' ? undefined : item.status
					});
				});
				// portalRecords.forEach(async function(item) {
				// 	try {
				// 		await studentPortalAPI.studentPortal("POST", "students", item);
				// 	} catch (err) {
				// 		console.log(err.responseJSON.error.message);
				// 	}
				// });
				var response = {
					newRecordsAdded: 0,
					error: {}
				};
				async function postRecord(items, index = 0) {
					if (items.length > index) {
						try {
							await studentPortalAPI.studentPortal("POST", "batches", items[index]);
							response.newRecordsAdded += 1;
						} catch (err) {
							if (response.error[err.responseJSON.error.message]) {
								response.error[err.responseJSON.error.message] += 1;
							} else {
								response.error[err.responseJSON.error.message] = 1;
							}
						}
						postRecord(items, ++index);
					} else {
						res.send(response);
					}
				}
				postRecord(portalRecords);
			}).catch(function(oError) {
				res.send(oError.responseJSON.error.message);
			});
		});
		app.post('/replicateOneBatchToStudentPortal', async function(req, res) {
			const name = req.body.Name;
			const batchNo = req.body.BatchNo;
			var Courses = app.models.Course;
			Courses.find({
				where: {
					and: [{
							Name: name
						},
						{
							BatchNo: batchNo
						}
					]
				}
			}).then(function(results) {
				portalRecords = [];
				results.forEach(function(item) {
					portalRecords.push({
						Name: item.Name,
						BatchNo: item.BatchNo,
						DemoStartDate: item.DemoStartDate,
						StartDate: item.StartDate,
						EndDate: item.EndDate,
						BlogEndDate: item.BlogEndDate,
						Link: item.Link,
						Weekend: item.Weekend,
						Timings: item.Timings === 'null' ? undefined : item.Timings,
						Fee: item.Fee,
						Extra: item.Extra === 'null' ? undefined : item.Extra,
						Extra1: item.Extra1 === 'null' ? undefined : item.Extra1,
						CalendarId: item.CalendarId === 'null' ? undefined : item.CalendarId,
						EventId: item.EventId === 'null' ? undefined : item.EventId,
						DriveId: item.DriveId === 'null' ? undefined : item.DriveId,
						hidden: item.hidden,
						CreatedOn: item.CreatedOn,
						CreatedBy: item.CreatedBy,
						ChangedOn: item.ChangedOn,
						ChangedBy: item.ChangedBy,
						analysis: item.analysis,
						status: item.status === ' ' ? undefined : item.status
					});
				});
				var response = {
					newRecordsAdded: 0,
					error: {}
				};
				async function postRecord(items, index = 0) {
					if (items.length > index) {
						try {
							await studentPortalAPI.studentPortal("POST", "batches", items[index]);
							response.newRecordsAdded += 1;
						} catch (err) {
							if (response.error[err.responseJSON.error.message]) {
								response.error[err.responseJSON.error.message] += 1;
							} else {
								response.error[err.responseJSON.error.message] = 1;
							}
						}
						postRecord(items, ++index);
					} else {
						res.send(response);
					}
				}
				postRecord(portalRecords);
			}).catch(function(oError) {
				res.send(oError.responseJSON.error.message);
			});
		});
		app.get("/todayInquiry", function(req, res) {

			var date1 = new Date();
			var date2 = new Date();
			if (req.query.date) {
				date1 = new Date(req.query.date);
				date2 = new Date(req.query.date);
			}
			date1.setDate(date1.getDate() - 1);
			date1.setHours(24, 0, 0, 0);
			date2.setHours(23, 59, 59, 999);
			var Inquiry = app.models.Inquiry;
			Inquiry.find({
					where: {
						and: [{
							CreatedOn: {
								gte: date1
							}
						}, {
							CreatedOn: {
								lte: date2
							}
						}]
					},
					fields: {
						"CreatedBy": true
					}
				})
				.then(function(all) {

					// 5c187036dba2681834ffe305 --> sonal
					// 5c187035dba2681834ffe301 --> ANubhav
					// 5d947c3dab189706a40faade --> Servers
					// 5dd6a6aea5f9e83c781b7ac0 --> shanu
					// 5ea2f01d7854a13c148f18cd	 --> Manish
					// 5db594b9b06bff3ffcbba53c --> shalu
					// 5dcf9f7183f22e7da0acdfe4 --> vaishali
					// 5ecc968586321064989cdc3f --> kajol
					// 5f1331f2e0b8524af830fa20 --> shalini
					// 5f4d01c50815a314ec9238d2 --> khushbu
					var lv_manish = 0,
						lv_khushbu = 0,
						lv_shalu = 0,
						lv_shanu = 0,
						lv_sonal = 0,
						lv_vaishali = 0,
						lv_kajol = 0;
					for (var i = 0; i < all.length; i++) {
						switch (all[i].CreatedBy.toString()) {
							case "5dd6a6aea5f9e83c781b7ac0":
								lv_shanu = lv_shanu + 1;
								break;
							case "5dcf9f7183f22e7da0acdfe4":
								lv_vaishali = lv_vaishali + 1;
								break;
							case "5db594b9b06bff3ffcbba53c":
								lv_shalu = lv_shalu + 1;
								break;
							case "5c187036dba2681834ffe305":
								lv_sonal = lv_sonal + 1;
								break;
							case "5f1331f2e0b8524af830fa20":
								lv_manish = lv_manish + 1;
								break;
							case "5ecc968586321064989cdc3f":
								lv_kajol = lv_kajol + 1;
								break;
							case "5f4d01c50815a314ec9238d2":
								lv_khushbu = lv_khushbu + 1;
								break;
							default:

						}
					}
					var coll = [{
							"name": "shanu",
							count: lv_shanu
						},
						{
							"name": "vaishali",
							count: lv_vaishali
						},
						{
							"name": "shalu",
							count: lv_shalu
						},
						{
							"name": "sonal",
							count: lv_sonal
						},
						{
							"name": "shalini",
							count: lv_manish
						},
						{
							"name": "kajol",
							count: lv_kajol
						},
						{
							"name": "khushbu",
							count: lv_khushbu
						}
					];
					res.send(coll);
				});
		});
		app.post('/checkStudentById', function(req, res) {

			var emailId = req.body.emailId;
			var lv_countries = "";
			var completeData = {};
			var Inquiry = app.models.Inquiry;
			Inquiry.find({
					where: {
						EmailId: emailId
					}
				})
				.then(function(Records, err) {
					if (Records) {
						for (var i = 0; i < Records.length; i++) {
							lv_countries = lv_countries + ", " + Records[i].Country;
							completeData = Records[i];
						}
					}
					var Subs = app.models.Student;
					Subs.find({
							where: {
								GmailId: emailId
							}
						})
						.then(function(Records, err) {
							if (Records) {
								for (var i = 0; i < Records.length; i++) {
									lv_countries = lv_countries + ", " + Records[i].Country;
									completeData.subs = Records[i];
								}
							}
							res.send({
								country: lv_countries,
								inq: completeData
							});
						});
				});


		});
		app.get('/ServerDownloadAct', function(req, res) {
			var date = new Date();
			Server.find({
					where: {
						and: [{
							EndDate: {
								gt: date
							}
						}, {
							UserEndDate: {
								gt: date
							}
						}]
					}
				})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

							sheet.addRow().values = Object.keys(Records[0].__data);

							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}

							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									if (err) {
										console.log('---------- error downloading file: ', err);
									}
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});

		app.post("/inquiryLookup", function(req, res) {
			var staffId = req.body.staffId;
			var course = req.body.course;
			var startDate = new Date(req.body.startDate);
			var endDate = new Date(req.body.endDate);
			var oFilter = {
				and: [{
					Date: {
						gt: startDate
					}
				}, {
					Date: {
						lt: endDate
					}
				}, {
					CreatedBy: staffId
				}]
			};
			if (course) {
				oFilter.and.push({
					CourseName: course
				});
			}
			var Inquiry = app.models.Inquiry;
			Inquiry.find({
					where: oFilter,
					fields: {
						"Date": true
					}
				})
				.then(function(all) {
					var countMap = new Map();
					all.forEach(function(item) {
						if (countMap.has(item.Date.toDateString())) {
							countMap.set(item.Date.toDateString(), countMap.get(item.Date.toDateString()) + 1);
						} else {
							countMap.set(item.Date.toDateString(), 1);
						}
					});
					var result = [];
					countMap.forEach(function(c, d) {
						result.push({
							count: c,
							date: d
						});
					});
					res.send(result);
				});
		});

		app.post('/requestMessage', function(req, res) {

			var msg = "";
			var typeMsg = req.body.msgType;
			switch (typeMsg) {
				case "inquiry":
					msg = "Dear #FirstName#, Greetings from www.anubhavtrainings.com, #COURSE# details sent to your email id, please write to us on contact@anubhavtrainings.com.";
					msg = msg.replace("#COURSE#", req.body.courseName);
					break;
				case "courseapprove":
					msg = 'Dear #FirstName#, Greetings www.anubhavtrainings.com, your course details have been sent to your email id. mail us on contact@anubhavtrainings.com for more queries';;
					break;
				case "courseextend":
					msg = "Dear #FirstName#, Greetings www.anubhavtrainings.com, the course is extended till #EXTENDDATE#. mail us on contact@anubhavtrainings.com for more queries";
					msg = msg.replace("#EXTENDDATE#", req.body.extendDate);
					break;
				default:
					return;

			}
			msg = msg.replace("#FirstName#", req.body.userName);
			var http = require('http');
			var urlencode = require('urlencode');
			msg = urlencode(msg);
			var number = req.body.Number;
			//var username='anubhav.abap@gmail.com';
			var username = 'anubhav.abap@gmail.com';
			var hash = 'faffa687d5142e5af59d8e892b9802651a63fd3185d4fdcc5aad716065320bf7'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
			//var hash = 'eef684d01be7535d39d7f409a1b8e888f874e9a05243b4fb3db2426f99aed5ba';
			//var sender='ONLTRN';
			var sender = "ONLTRN";
			var data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + number + '&message=' + msg
			var options = {
				host: 'api.textlocal.in',
				path: '/send?' + data
			};
			callback = function(response) {
				var str = '';
				response.on('data', function(chunk) {
					str += chunk;
				});

				//the whole response has been recieved, so we just print it out here
				response.on('end', function() {
					res.send("message sent");
					console.log(str);
				});
			}
			//console.log('hello js'))
			http.request(options, callback).end();
		});



		app.get('/ServerDownloadInAct', function(req, res) {

			var date = new Date();
			Server.find({
					where: {
						and: [{
							EndDate: {
								gt: date
							}
						}, {
							UserEndDate: {
								lt: date
							}
						}]
					}
				})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

							sheet.addRow().values = Object.keys(Records[0].__data);

							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}

							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									if (err) {
										console.log('---------- error downloading file: ', err);
									}
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});
		app.get('/getExcelForGST', function(req, res) {
			var Records = [];
			var accountNo = req.query.AccountNo;
			// var accountNo = "123456998";
			var startDate = new Date(req.query.StartDate);
			var endDate = new Date(req.query.EndDate);
			// var startDate = new Date("01.01.2016");
			// var endDate = new Date("01.01.2021");
			var Subs = app.models.Sub;
			var Students = app.models.Student;
			var Courses = app.models.Course;
			var subsMap = new Map();
			subsMap.set("subs", new Map());
			subsMap.set("course", new Map());
			subsMap.set("student", new Map());
			var oFilter = {
				"AccountName": accountNo,
				and: [{
					"PaymentDate": {
						gte: startDate
					}
				}, {
					"PaymentDate": {
						lte: endDate
					}
				}]
			};
			if (req.body.PaymentMode === "PAYPAL") {
				oFilter.PaymentMode = {
					like: 'PAYPAL'
				};
			} else if (req.body.PaymentMode === "NON-PAYPAL") {
				oFilter.PaymentMode = {
					nlike: 'PAYPAL'
				};
			}
			var studentIds = [];
			var courseIds = [];
			var async = require('async');
			async.waterfall([
					function(callback) {
						Subs.find({
							where: oFilter,
							fields: {
								"AccountName": true,
								"StudentId": true,
								"CourseId": true,
								"PaymentDate": true,
								"Reference": true,
								"USDAmount": true,
								"CurrencyCode": true,
								"Exchange": true,
								"Charges": true,
								"SettleDate": true,
								"SettleAmount": true,
								"PaymentMode": true,
								"Amount": true,
								"InvoiceNo": true,
								"id": true
							}
						}).then(function(subcriptions) {
							subcriptions.forEach((item) => {
								studentIds.push(item.StudentId);
								courseIds.push(item.CourseId);
								subsMap.get("subs").set(item.id.toString(), {
									"AccountName": item.AccountName,
									"StudentId": item.StudentId.toString(),
									"CourseId": item.CourseId.toString(),
									"PaymentDate": item.PaymentDate,
									"Reference": item.Reference,
									"USDAmount": item.USDAmount,
									"CurrencyCode": item.CurrencyCode,
									"Exchange": item.Exchange,
									"Charges": item.Charges,
									"SettleDate": (item.SettleDate ? item.SettleDate.toDateString().slice(4) : ""),
									"SettleAmount": item.SettleAmount,
									"PaymentMode": item.PaymentMode,
									"Amount": item.Amount,
									"InvoiceNo": item.InvoiceNo,
									"id": item.id
								});
								subsMap.get("course").set(item.CourseId.toString(), null);
								subsMap.get("student").set(item.StudentId.toString(), null);
							});
							callback(null, subcriptions);
						});
					},
					function(subcriptions, callback) {

						Courses.find({
								where: {
									id: {
										inq: courseIds
									}
								},
								fields: {
									"Name": true,
									"BatchNo": true,
									"id": true
								}
							})
							.then(function(courses, err) {
								courses.forEach((item) => {
									if (subsMap.get("course").has(item.id.toString())) {
										subsMap.get("course").set(item.id.toString(), {
											"Name": item.Name,
											"BatchNo": item.BatchNo
										});
									}
								});
								callback(null, subcriptions, courses);
							});

					},
					function(subcriptions, courses, callback) {
						// arg1 now equals 'three'
						Students.find({
								where: {
									id: {
										inq: studentIds
									}
								},
								fields: {
									"GmailId": true,
									"Name": true,
									"ContactNo": true,
									"GSTIN": true,
									"Address": true,
									"Country": true,
									"City": true,
									"id": true
								}
							})
							.then(function(students, err) {
								students.forEach((item) => {
									if (subsMap.get("student").has(item.id.toString())) {
										subsMap.get("student").set(item.id.toString(), {
											"Name": item.Name,
											"GmailId": item.GmailId,
											"ContactNo": item.ContactNo,
											"GSTIN": item.GSTIN,
											"Address": item.Address,
											"Country": item.Country,
											"City": item.City
										});
									}
								});
								callback(null, subcriptions, courses, students);
							});
					}
				],
				function(err, accountRecords, accountBalances, Records) {
					// result now equals 'done'
					var Records = [];
					var gstBeginDate = new Date("10.17.2020");
					try {
						subsMap.get("subs").forEach((item) => {
							var paymentDate = new Date(item.PaymentDate);
							var isGST = (gstBeginDate <= paymentDate);
							var isWallet = false;
							if (item.PaymentMode === "PAYPAL" || item.PaymentMode === "PAYU") {
								isWallet = true;
							}
							if (isWallet && parseInt(item.Exchange) > 1) {
								isGST = false;
							}
							var amount = (isWallet ? item.SettleAmount : item.Amount);

							if (!isGST) {
								var gst = 0.00;
							} else {
								var gst = amount * 9 / 118;
								amount = amount * 100 / 118;
							}
							Records.push({
								"PaymentDate": (new Date(item.PaymentDate)).toDateString().slice(4),
								"Email": subsMap.get("student").get(item.StudentId).GmailId,
								"Name": subsMap.get("student").get(item.StudentId).Name.replace(" null", ""),
								"ContactNo": subsMap.get("student").get(item.StudentId).ContactNo,
								"CourseName": subsMap.get("course").get(item.CourseId).Name,
								"BatchNo": subsMap.get("course").get(item.CourseId).BatchNo,
								"GSTIN": subsMap.get("student").get(item.StudentId).GSTIN,
								"Address": subsMap.get("student").get(item.StudentId).Address,
								"Country": subsMap.get("student").get(item.StudentId).Country,
								"City": subsMap.get("student").get(item.StudentId).City,
								"PaymentMode": item.PaymentMode,
								"FullAmount": item.Amount,
								"USDAmount": item.USDAmount,
								"CurrencyCode": item.CurrencyCode,
								"Exchange": item.Exchange,
								"Charges": item.Charges,
								"SettleDate": item.SettleDate,
								"SettleAmount": item.SettleAmount,
								"Amount": amount.toFixed(2),
								"SGST": gst.toFixed(2),
								"CGST": gst.toFixed(2),
								"Reference": item.Reference,
								"InvoiceNo": item.InvoiceNo
							});
						});

						Records.sort((obj1, obj2) => {
							return new Date(obj1.PaymentDate) - new Date(obj2.PaymentDate);
						});
						var excel = require('exceljs');
						var workbook = new excel.Workbook(); //creating workbook
						var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
						sheet.addRow().values = Object.keys(Records[0]);

						for (var i = 0; i < Records["length"]; i++) {
							sheet.addRow().values = Object.values(Records[i]);
						}

						var tempfile = require('tempfile');
						var tempFilePath = tempfile('.xlsx');
						console.log("tempFilePath : ", tempFilePath);
						workbook.xlsx.writeFile(tempFilePath).then(function() {
							res.sendFile(tempFilePath, function(err) {
								if (err) {
									console.log('---------- error downloading file: ', err);
								}
							});
							console.log('file is written @ ' + tempFilePath);
						});
					} catch (e) {

					} finally {

					}
				}
			);
		});
		app.post('/getAmountForAccount', function(req, res) {
			var responseData = [];
			var accountNo = req.body.AccountNo;

			var startDate = new Date(req.body.StartDate);
			var endDate = new Date(req.body.EndDate);
			var Subs = app.models.Sub;
			var Students = app.models.Student;
			var Courses = app.models.Course;
			var subsMap = new Map();
			subsMap.set("subs", new Map());
			subsMap.set("course", new Map());
			subsMap.set("student", new Map());
			var oFilter = {
				"AccountName": accountNo,
				and: [{
					"PaymentDate": {
						gte: startDate
					}
				}, {
					"PaymentDate": {
						lte: endDate
					}
				}]
			};
			if (req.body.PaymentMode === "PAYPAL") {
				oFilter.PaymentMode = {
					like: 'PAYPAL'
				};
			} else if (req.body.PaymentMode === "NON-PAYPAL") {
				oFilter.PaymentMode = {
					nlike: 'PAYPAL'
				};
			}
			var studentIds = [];
			var courseIds = [];
			var async = require('async');
			async.waterfall([
					function(callback) {
						Subs.find({
							where: oFilter,
							fields: {
								"AccountName": true,
								"StudentId": true,
								"CourseId": true,
								"PaymentDate": true,
								"Reference": true,
								"USDAmount": true,
								"CurrencyCode": true,
								"Exchange": true,
								"Charges": true,
								"SettleDate": true,
								"SettleAmount": true,
								"PaymentMode": true,
								"Amount": true,
								"ChartedValid": true,
								"InvoiceNo": true,
								"CreatedBy": true,
								"id": true
							}
						}).then(function(subcriptions) {
							subcriptions.forEach((item) => {
								studentIds.push(item.StudentId);
								courseIds.push(item.CourseId);
								subsMap.get("subs").set(item.id.toString(), {
									"AccountName": item.AccountName,
									"StudentId": item.StudentId.toString(),
									"CourseId": item.CourseId.toString(),
									"PaymentDate": item.PaymentDate,
									"Reference": item.Reference,
									"USDAmount": item.USDAmount,
									"CurrencyCode": item.CurrencyCode,
									"Exchange": item.Exchange,
									"Charges": item.Charges,
									"SettleDate": (item.SettleDate ? item.SettleDate.toDateString().slice(4) : ""),
									"SettleAmount": item.SettleAmount,
									"PaymentMode": item.PaymentMode,
									"Amount": item.Amount,
									"ChartedValid": item.ChartedValid,
									"InvoiceNo": item.InvoiceNo,
									"CreatedBy": item.CreatedBy,
									"id": item.id
								});
								subsMap.get("course").set(item.CourseId.toString(), null);
								subsMap.get("student").set(item.StudentId.toString(), null);
							});
							callback(null, subcriptions);
						});
					},
					function(subcriptions, callback) {

						Courses.find({
								where: {
									id: {
										inq: courseIds
									}
								},
								fields: {
									"Name": true,
									"BatchNo": true,
									"id": true
								}
							})
							.then(function(courses, err) {
								courses.forEach((item) => {
									if (subsMap.get("course").has(item.id.toString())) {
										subsMap.get("course").set(item.id.toString(), {
											"Name": item.Name,
											"BatchNo": item.BatchNo
										});
									}
								});
								callback(null, subcriptions, courses);
							});

					},
					function(subcriptions, courses, callback) {
						// arg1 now equals 'three'
						// var date = new Date("2020-04-01");
						// date.setHours(0,0,0,0);
						Students.find({
								where: {
									id: {
										inq: studentIds
									}
								},
								fields: {
									"GmailId": true,
									"Name": true,
									"ContactNo": true,
									"GSTIN": true,
									"Address": true,
									"Country": true,
									"City": true,
									"id": true
								}
							})
							.then(function(students, err) {
								students.forEach((item) => {
									if (subsMap.get("student").has(item.id.toString())) {
										subsMap.get("student").set(item.id.toString(), {
											"Name": item.Name,
											"GmailId": item.GmailId,
											"ContactNo": item.ContactNo,
											"GSTIN": item.GSTIN,
											"Address": item.Address,
											"Country": item.Country,
											"City": item.City
										});
									}
								});
								callback(null, subcriptions, courses, students);
							});
					}
				],
				function(err, accountRecords, accountBalances, Records) {
					// result now equals 'done'
					var responseData = [];
					var gstBeginDate = new Date("10.17.2020");
					try {
						subsMap.get("subs").forEach((item) => {
							var paymentDate = new Date(item.PaymentDate);
							var isWallet = false;
							if (item.PaymentMode === "PAYPAL" || item.PaymentMode === "PAYU" || item.PaymentMode === "FOREIGN") {
								isWallet = true;
							}
							var isGST = (gstBeginDate <= paymentDate);
							if (isWallet && item.Exchange > 1) {
								isGST = false;
							}
							var amount = (isWallet ? item.USDAmount * item.Exchange : item.Amount);

							if (!isGST) {
								var gst = 0.00;
							} else {
								var gst = amount * 9 / 118;
								amount = amount * 100 / 118;
							}

							responseData.push({
								"Email": subsMap.get("student").get(item.StudentId).GmailId,
								"Name": subsMap.get("student").get(item.StudentId).Name.replace(" null", ""),
								"ContactNo": subsMap.get("student").get(item.StudentId).ContactNo,
								"GSTIN": (isGST ? subsMap.get("student").get(item.StudentId).GSTIN : ""),
								"Address": subsMap.get("student").get(item.StudentId).Address,
								"Country": subsMap.get("student").get(item.StudentId).Country,
								"City": subsMap.get("student").get(item.StudentId).City,
								"CourseName": (item.Amount < 7000 ? subsMap.get("course").get(item.CourseId).Name + "(Ex.)" : subsMap.get("course").get(item.CourseId).Name),
								"BatchNo": subsMap.get("course").get(item.CourseId).BatchNo,
								"PaymentMode": item.PaymentMode,
								"InvoiceNo": item.InvoiceNo,
								"PaymentDate": item.PaymentDate,
								"FullAmount": item.Amount,
								"USDAmount": item.USDAmount,
								"CurrencyCode": item.CurrencyCode,
								"Exchange": item.Exchange,
								"Charges": item.Charges,
								"SettleDate": item.SettleDate,
								"SettleAmount": item.SettleAmount,
								"Amount": amount.toFixed(2),
								"ChartedValid": item.ChartedValid,
								"SGST": gst.toFixed(2),
								"CGST": gst.toFixed(2),
								"Reference": item.Reference,
								"IsWallet": isWallet,
								"IsGST": isGST,
								"CreatedBy": item.CreatedBy,
								"id": item.id
							});
						});
						responseData.sort((obj1, obj2) => {
							return new Date(obj1.PaymentDate) - new Date(obj2.PaymentDate);
						});
						res.send(responseData);
					} catch (e) {

					} finally {

					}
				}
			);
		});

		app.post('/getInvoiceNoInvoiceBuilder', function(req, res) {
			var responseData = [];
			var date = new Date(req.body.PaymentDate);
			var subId = req.body.SubcriptionId;
			var accountNo = req.body.AccountNo;
			var startDate = new Date(new Date(date.getFullYear(), date.getMonth(), 1));
			var endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			var cDate = new Date(req.body.PaymentDate);
			var month = (cDate.getMonth() < 9 ? "0" + (cDate.getMonth() + 1) : cDate.getMonth() + 1);
			var year = cDate.getFullYear();
			var Subs = app.models.Sub;
			var oFilter = {
				"AccountName": accountNo,
				and: [{
					"PaymentDate": {
						gte: startDate
					}
				}, {
					"PaymentDate": {
						lte: endDate
					}
				}]
			};
			Subs.find({
				where: oFilter,
				fields: {
					"PaymentDate": true,
					"InvoiceNo": true,
					"id": true
				}
			}).then(function(subcriptions) {
				subcriptions.sort((obj1, obj2) => {
					return new Date(obj1.PaymentDate) - new Date(obj2.PaymentDate);
				});
				var invoiceNo;
				for (var i = 0; i < subcriptions.length; i++) {
					if (subcriptions[i].id.toString() === subId) {
						invoiceNo = i;
						invoiceNo += 1;
						break;
					}
				}
				var orderNo = "INV-" + year + "" + month + "-" + (invoiceNo < 10 ? "0" + invoiceNo : invoiceNo);
				res.send(orderNo);
			});
		});

		app.get('/getStudentPerBatch', function(req, res) {
			var responseData = [];
			var app = require('../server/server');
			var Sub = app.models.Sub;
			var Courses = app.models.Course;
			var aCourses = [];
			// step 1: get all the batches which are marked for analysis analysis=true
			// Courses.find({where: { analysis=true}}).then(function(data){
			Courses.find().then(function(data) {
				// console.log("Test Course")
				aCourses = data;
				// dynamic where
				var aOrCond = []
				for (var i = 0; i < data.length; i++) {
					// var oCourse = {};
					var oCond = {}
					oCond.eq = data[i].id;
					aOrCond.push({
						CourseId: oCond
					});
				}
				// Sub.find({where : dynamic where}).then(function(data){
				Sub.find({
					where: {
						or: aOrCond
					}
				}).then(function(data) {
					ObjectId = require('mongodb').ObjectID;
					var oSubCounter = {};
					data.forEach(function(obj) {
						var key = obj.CourseId;
						oSubCounter[key] = (oSubCounter[key] || 0) + 1
					})

					var responseData = [];
					Object.keys(oSubCounter).forEach(function(key) {
						var oObjId = ObjectId(key);
						// console.log(key, oSubCounter[key]);
						var oRecFil = aCourses.filter(function(oRecord) {
							return oRecord.id.toString() === oObjId.toString();
						});

						if (oRecFil.length > 0) {
							responseData.push({
								"BatchName": oRecFil[0].BatchNo,
								"Count": oSubCounter[key]
							})
						}
					});

					//--- Calculate total per batch, prepare json and return
					res.send(responseData);
				})
			});

		});

		app.get('/getAmountPerAccount', function(req, res) {
			var responseData = [];
			var oSubCounter = {};
			var Subs = app.models.Sub;
			var Account = app.models.Account;
			var AccountEntry = app.models.AccountBalance;

			var async = require('async');

			async.waterfall([
					function(callback) {
						Account.find({
							fields: {
								"accountName": true,
								"accountNo": true,
								"ifsc": true,
								"current": true,
								"counter": true,
								"counterall": true,
								"key": true,
								"id": true
							}
						}).then(function(accountRecords) {
							callback(null, accountRecords);
						});
					},
					function(accountRecords, callback) {
						// arg1 now equals 'one' and arg2 now equals 'two'
						var date = new Date("2020-04-01");
						date.setHours(0, 0, 0, 0);
						AccountEntry.find({
								where: {
									and: [{
										CreatedOn: {
											gte: date
										}
									}]
								},
								fields: {
									"AccountNo": true,
									"Amount": true
								}
							})
							.then(function(accountBalances, err) {
								callback(null, accountRecords, accountBalances);
							});

					},
					function(accountRecords, accountBalances, callback) {
						// arg1 now equals 'three'
						var date = new Date("2020-04-01");
						date.setHours(0, 0, 0, 0);
						Subs.find({
								where: {
									and: [{
										PaymentDate: {
											gte: date
										}
									}]
								},
								fields: {
									"AccountName": true,
									"Amount": true

								}
							})
							.then(function(Records, err) {


								callback(null, accountRecords, accountBalances, Records);
							});
					}
				],
				function(err, accountRecords, accountBalances, Records) {
					// result now equals 'done'

					try {
						var responseData = [];
						for (var i = 0; i < accountRecords.length; i++) {
							try {
								var totalAmount = 0,
									newDeposits = 0;
								for (var j = 0; j < accountBalances.length; j++) {

									if (accountBalances[j].AccountNo.toString() === accountRecords[i].accountNo.toString()) {
										totalAmount
											= totalAmount +
											accountBalances[j].Amount;
									}

								}
								for (var k = 0; k < Records.length; k++) {
									if (Records[k].AccountName.toString() === accountRecords[i].accountNo.toString()) {
										totalAmount
											= totalAmount +
											Records[k].Amount;
										newDeposits = Records[k].Amount + newDeposits;
									}

								}
								if (accountRecords[i].key !== "Check Nahi Karna") {
									responseData.push({
										"AccountNo": accountRecords[i].accountNo,
										"AccountName": accountRecords[i].accountName + " - " + accountRecords[i].ifsc,
										"NewDeposit": newDeposits,
										"Amount": totalAmount,
										"current": accountRecords[i].current,
										"counter": accountRecords[i].counter,
										"counterall": accountRecords[i].counterall,
										"key": accountRecords[i].key,
										"id": accountRecords[i].id
									});
								}

								totalAmount, newDeposits = 0;
							} catch (e) {

							} finally {

							}
						}

						res.send(responseData);
					} catch (e) {

					} finally {

					}
				}
			);
		});

		app.get('/getBatchPerCourse', function(req, res) {
			var responseData = [];
			var fs = require('fs');
			var aCources = JSON.parse(fs.readFileSync('../OFTProject/client/models/mockData/sampledata.json', 'utf8'));

			var oSubCounter = {};

			var Courses = app.models.Course;

			Courses.find().then(function(data) {
				// console.log("Test Course")
				aCourses = data;
				aCources.courses.forEach(function(oRec) {
					oSubCounter[oRec.courseName] = 0;
				})

				Object.keys(oSubCounter).forEach(function(key) {

					var oCount = data.filter(function(oRec) {
						return key === oRec.Name;
					})

					responseData.push({
						"CourseName": key,
						"Count": oCount.length
					})

				})
				//--- Calculate total per batch, prepare json and return
				res.send(responseData);
			})
		});

		app.get('/getStudentPerCourse', function(req, res) {
			var responseData = [];
			var fs = require('fs');
			var aCources = JSON.parse(fs.readFileSync('../OFTProject/client/models/mockData/sampledata.json', 'utf8'));
			var aCourseFinal = [];

			var Courses = app.models.Course;
			var Sub = app.models.Sub;

			Courses.find().then(function(data) {
				aCourcesFind = data;

				aCources.courses.forEach(function(oCouRec) {
					var oSubCounter = {};
					// oSubCounter[oCouRec.courseName] = 0;
					oSubCounter["Name"] = oCouRec.courseName;
					var aBatches = data.filter(function(oRec) {
						return oCouRec.courseName === oRec.Name;
					})
					oSubCounter["Batches"] = aBatches;
					aCourseFinal.push(oSubCounter);
				})

				Sub.find({

				}).then(function(data) {

					for (i = 0; i < aCourseFinal.length; i++) {
						var aSubBatches = [];
						for (j = 0; j < aCourseFinal[i].Batches.length; j++) {
							aSubBatches = data.filter(function(oRec) {
								return aCourseFinal[i].Batches[j].id.toString() === oRec.CourseId.toString();
							})
						}

						responseData.push({
							"CourseName": aCourseFinal[i].Name,
							"Count": aSubBatches.length
						})
					}
					res.send(responseData);
				})
			})
		});

		app.get('/getCountLastMonths', function(req, res) {
			var responseData = [];
			var app = require('../server/server');
			var Sub = app.models.Sub;

			function getMonths() {
				var iCount = 4;
				var aMonths = [];

				while (iCount > -1) {
					var oDate = new Date();
					oDate.setMonth(oDate.getMonth() - iCount);
					var oStartDate = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
					var oEndDate = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0);

					aMonths.push({
						StartDate: oStartDate,
						EndDate: oEndDate
					})

					iCount = iCount - 1;
				}

				return aMonths;
			}

			var aMonths = getMonths();
			var oPeriodStartDate = aMonths[4].StartDate;
			var oPeriodEnddate = aMonths[0].EndDate;
			Sub.find({
				// where: {
				// 	or: aOrCond
				// }
			}).then(function(data) {
				Date.prototype.getMonthText = function() {
					var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
					return months[this.getMonth()];
				}
				// var aStudents = [];
				for (var j = 0; j < aMonths.length; j++) {

					aStudents = data.filter(function(oRec) {
						return oRec.CreatedOn >= aMonths[j].StartDate && oRec.CreatedOn <= aMonths[j].EndDate
					})

					responseData.push({
						Month: aMonths[j].StartDate.getMonthText(),
						Count: aStudents.length
					})

				}
				res.send(responseData);

			})

		});

		app.get('/ServerDownloadExp', function(req, res) {
			var date = new Date();
			Server.find({
					where: {
						and: [{
							EndDate: {
								lt: date
							}
						}, {
							UserEndDate: {
								lt: date
							}
						}]
					}
				})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
							sheet.addRow().values = Object.keys(Records[0].__data);

							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}

							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									if (err) {
										console.log('---------- error downloading file: ', err);
									}
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});


		app.post('/TakeBackup', function(req, res) {

			var dbUri = "mongodb://anubhav:GbPOHnk2JSfbe44g@oft-shard-00-00-kyg3j.mongodb.net:27017/prod";

			const MongoDB = require('backup-manager').MongoDBPlugin;

			// path should be created before creating an instance
			var sPath = "./";
			const mongo = new MongoDB({
				debug: true,
				path: sPath
			});
			mongo.backup(['--host mongodb://anubhav:GbPOHnk2JSfbe44g@oft-shard-00-00-kyg3j.mongodb.net:27017', '--db test', '--gzip'], error => console.log(error));

			console.log("backup done");
			res.send("backup completed success");

		});

		app.get('/ServerPayDownload', function(req, res) {

			ServerPay.find({})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

							sheet.addRow().values = Object.keys(Records[0].__data);

							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}

							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									console.log('---------- error downloading file: ', err);
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});

		var Inquiry = app.models.Inquiry;
		app.get('/InquiryDownload', function(req, res) {
			var where = {};
			var startDate = new Date(new Date(parseInt(req.query.date)));
			if (startDate.toDateString() !== (new Date()).toDateString()) {
				var where = {
					Date: {
						gte: startDate
					}
				};
			}
			Inquiry.find({
					where: where
				})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
							sheet.addRow().values = Object.keys(Records[0].__data);
							Records.sort(function(a, b) {
								return new Date(b.__data.Date) - new Date(a.__data.Date)
							})
							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = (Object.values(Records[i].__data));
							}
							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									console.log('---------- error downloading file: ', err);
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});
		var Block = app.models.Block;
		app.get('/BlackDownload', function(req, res) {

			Block.find({})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
							sheet.addRow().values = Object.keys(Records[0].__data);
							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}
							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									console.log('---------- error downloading file: ', err);
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});
		app.get('/SubNotExpired', function(req, res) {

			var app = require('../server/server');
			var Sub = app.models.Sub;
			var Students = app.models.Student;
			var Courses = app.models.Course;
			var async = require('async');

			async.waterfall([
				function(callback) {
					Students.find().then(function(students) {
						var allStudents = [];
						for (var i = 0; i < students.length; i++) {
							allStudents[students[i].id] = students[i];
						}
						callback(null, allStudents);
					});

				},
				function(students, callback) {
					// arg1 now equals 'one' and arg2 now equals 'two'
					Courses.find().then(function(courses) {
						var allCourses = [];
						for (var i = 0; i < courses.length; i++) {
							allCourses[courses[i].id] = courses[i];
						}
						callback(null, students, allCourses);
					});

				},
				function(students, courses, callback) {
					// arg1 now equals 'three'
					var today = new Date();

					Sub.find({
						where: {
							and: [{
									MostRecent: true
								},
								{
									EndDate: {
										gte: today
									}
								}
							]
						}
					}).then(function(Subs) {
						var allSubs = [];
						for (var i = 0; i < Subs.length; i++) {
							var record = Subs[i];
							try {
								allSubs.push({
									"BlogEndDate": record.EndDate,
									"Batch": courses[record.CourseId].BatchNo,
									"Student": students[record.StudentId].GmailId,
									"IsDue": record.PartialPayment,
									"Name": students[record.StudentId].Name,
									"Course": courses[record.CourseId].Name,
									"DueAmount": record.PendingAmount,
									"DueDate": record.PaymentDueDate
								});
							} catch (e) {

							}
						}
						callback(null, allSubs);
					});

				}
			], function(err, Records) {
				// result now equals 'done'
				try {

					var excel = require('exceljs');
					var workbook = new excel.Workbook(); //creating workbook
					var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
					sheet.addRow().values = Object.keys(Records[0]);

					for (var i = 0; i < Records["length"]; i++) {
						sheet.addRow().values = Object.values(Records[i]);
					}

					var tempfile = require('tempfile');
					var tempFilePath = tempfile('.xlsx');
					console.log("tempFilePath : ", tempFilePath);
					workbook.xlsx.writeFile(tempFilePath).then(function() {
						res.sendFile(tempFilePath, function(err) {
							if (err) {
								console.log('---------- error downloading file: ', err);
							}
						});
						console.log('file is written @ ' + tempFilePath);
					});
				} catch (e) {

				} finally {

				}
			});
		});

		app.get('/SubDownload', function(req, res) {

			var app = require('../server/server');
			var Sub = app.models.Sub;
			var Students = app.models.Student;
			var Courses = app.models.Course;
			var async = require('async');

			async.waterfall([
				function(callback) {
					Students.find({
						where: {
							Defaulter: false
						}
					}).then(function(students) {
						var allStudents = [];
						for (var i = 0; i < students.length; i++) {
							allStudents[students[i].id] = students[i];
						}
						callback(null, allStudents);
					});

				},
				function(students, callback) {
					// arg1 now equals 'one' and arg2 now equals 'two'
					Courses.find().then(function(courses) {
						var allCourses = [];
						for (var i = 0; i < courses.length; i++) {
							allCourses[courses[i].id] = courses[i];
						}
						callback(null, students, allCourses);
					});

				},
				function(students, courses, callback) {
					// arg1 now equals 'three'
					Sub.find({
						where: {
							MostRecent: true
						}
					}).then(function(Subs) {
						var allSubs = [];
						for (var i = 0; i < Subs.length; i++) {
							var record = Subs[i];
							try {
								allSubs.push({
									"Batch": courses[record.CourseId].BatchNo,
									"Student": students[record.StudentId].GmailId,
									"IsDue": record.PartialPayment,
									"Name": students[record.StudentId].Name,
									"Course": courses[record.CourseId].Name,
									"DueAmount": record.PendingAmount,
									"DueDate": record.PaymentDueDate
								});
							} catch (e) {

							}
						}
						callback(null, allSubs);
					});

				}
			], function(err, Records) {
				// result now equals 'done'
				try {

					var excel = require('exceljs');
					var workbook = new excel.Workbook(); //creating workbook
					var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
					sheet.addRow().values = Object.keys(Records[0]);

					for (var i = 0; i < Records["length"]; i++) {
						sheet.addRow().values = Object.values(Records[i]);
					}

					var tempfile = require('tempfile');
					var tempFilePath = tempfile('.xlsx');
					console.log("tempFilePath : ", tempFilePath);
					workbook.xlsx.writeFile(tempFilePath).then(function() {
						res.sendFile(tempFilePath, function(err) {
							if (err) {
								console.log('---------- error downloading file: ', err);
							}
						});
						console.log('file is written @ ' + tempFilePath);
					});
				} catch (e) {

				} finally {

				}
			});
		});

		var Stud = app.models.Student;

		app.get('/StudentDownload', function(req, res) {

			Stud.find({})
				.then(function(Records, err) {
						if (Records) {

							var excel = require('exceljs');
							var workbook = new excel.Workbook(); //creating workbook
							var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
							sheet.addRow().values = Object.keys(Records[0].__data);
							for (var i = 0; i < Records["length"]; i++) {
								sheet.addRow().values = Object.values(Records[i].__data);
							}

							var tempfile = require('tempfile');
							var tempFilePath = tempfile('.xlsx');
							console.log("tempFilePath : ", tempFilePath);
							workbook.xlsx.writeFile(tempFilePath).then(function() {
								res.sendFile(tempFilePath, function(err) {
									if (err) {
										console.log('---------- error downloading file: ', err);
									}
								});
								console.log('file is written @ ' + tempFilePath);
							});

						}
					}

				);
		});

		app.post('/fillColl',
			function(req, res) {
				var app = require('../server/server');
				var Students = app.models.Student;
				var Courses = app.models.Course;
				this.students = [];
				this.courses = [];
				Students.find().then(function(students) {
					for (var i = 0; i < students.length; i++) {
						this.students[students[i].id] = students[i];
					}
				});
				Courses.find().then(function(courses) {
					for (var i = 0; i < courses.length; i++) {
						this.courses[courses[i].id] = courses[i];
					}
				});
			});
		app.post('/getAllForAccount',
			function(req, res) {
				var app = require('../server/server');
				var Sub = app.models.Sub;
				var date = new Date();
				date.setDate(date.getDate() - 7);
				Sub.find({
					where: {
						and: [{
								AccountName: req.body.AccountNo
							}
							// ,
							// {
							// 	PaymentDate: {
							// 		gt: date
							// 	}
							// }
						]
					},
					fields: {
						"PaymentDate": true,
						"Amount": true,
						"Remarks": true
					}
				}).then(function(data) {
					res.send(data);
				});
			}
		);
		app.post('/getAllStudents',
			function(req, res) {
				var app = require('../server/server');
				var colls = req.body.allStudents;
				var Students = app.models.Student;
				var Courses = app.models.Course;
				this.students = [];
				this.courses = [];
				Students.find({
					where: {
						id: {
							inq: colls
						}
					},
					fields: {
						id: true,
						GmailId: true
					}
				}).then(function(students) {
					return res.send(students);
				});



			});

		app.post('/markCheckedAccount',
			function(req, res) {
				var app = require('../server/server');
				var Account = app.models.Account;
				var boolVal = req.body.State;
				Account.findOne({
						where: {
							accountNo: req.body.AccountNo
						}
					}).then(function(item) {
						if (item) {
							var app = require('../server/server');
							var Account = app.models.Account;
							var id = item.id;
							var updateObj = {
								current: boolVal
							};
							Account.findById(id).then(function(instance) {
								instance.updateAttributes(updateObj);
								return res.send("done");
							});
						}
					})
					.catch(function(err) {
						console.log(err);
					});
			}
		);
		app.post('/updateSubcriptionAmount',
			function(req, res) {
				var app = require('../server/server');
				var Sub = app.models.Sub;
				var sId = req.body.id;
				delete req.body.id;
				if (req.body.SettleDate) {
					var settleDate = new Date(req.body.SettleDate);
					delete req.body.SettleDate;
					req.body.SettleDate = settleDate;
				} else {
					delete req.body.SettleDate;
				}
				req.body.ChangedOn = new Date();
				var updateObj = req.body;
				// Sub.upsertWithWhere({id : sId}, updateObj).then(function() {
				// 	console.log("done");
				// res.send("done");
				// }).catch(function(err) {
				// 	console.log(err);
				// res.send("error");
				// });
				Sub.findById(sId).then(function(instance) {
					instance.updateAttributes(updateObj);
					res.send("done");
				}).catch(function(err) {
					res.send("error");
				});
			}
		);
		app.post('/getInvoiceNo',
			function(req, res) {
				var app = require('../server/server');
				var subId = req.body.SubcriptionId;
				var userId = req.body.UserId;
				var InvoiceNo = app.models.InvoiceNo;
				var Sub = app.models.Sub;
				var cDate = new Date(req.body.PaymentDate);
				var month = (cDate.getMonth() < 9 ? "0" + (cDate.getMonth() + 1) : cDate.getMonth() + 1);
				var year = cDate.getFullYear();
				InvoiceNo.findOrCreate({
					where: {
						Month: month,
						Year: year
					},
					fields: {
						InvoiceNo: true,
						id: true
					}
				}, {
					Year: year,
					Month: month,
					InvoiceNo: 0,
					CreatedOn: new Date(),
					CreatedBy: userId
				}).then(function(inq) {
					var invoiceNo = inq[0].InvoiceNo + 1;
					InvoiceNo.findById(inq[0].id).then(function(instance) {
						instance.updateAttributes({
							InvoiceNo: invoiceNo,
							ChangedOn: new Date(),
							ChangedBy: userId
						});
						var orderNo = "INV-" + year + "" + month + "-" + (invoiceNo < 10 ? "0" + invoiceNo : invoiceNo);
						var oUpdate = {
							InvoiceNo: orderNo
						};
						Sub.findById(subId).then(function(sInstance) {
							sInstance.updateAttributes(oUpdate);
							res.send(orderNo);
						});
					});
				});
			}
		);
		app.post('/clearInvoiceHistory',
			function(req, res) {
				var app = require('../server/server');
				var Subs = app.models.Sub;
				var InvoiceNo = app.models.InvoiceNo;
				var baseDate = new Date(req.body.StartDate);
				// var accountNo = req.body.AccountNo;
				var userId = req.body.UserId;
				var startDate = new Date(baseDate.getFullYear(), baseDate.getMonth());
				var endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
				var month = (baseDate.getMonth() < 9 ? "0" + (baseDate.getMonth() + 1) : baseDate.getMonth() + 1);
				var year = baseDate.getFullYear();
				var oFilter = {
					// "AccountName": accountNo,
					and: [{
						"PaymentDate": {
							gte: startDate
						}
					}, {
						"PaymentDate": {
							lte: endDate
						}
					}]
				};
				InvoiceNo.find({
					where: {
						Month: month,
						Year: year
					},
					fields: {
						InvoiceNo: true,
						id: true
					}
				}).then(function(inq) {
					InvoiceNo.findById(inq[0].id).then(function(instance) {
						instance.updateAttributes({
							InvoiceNo: 0,
							ChangedOn: new Date(),
							ChangedBy: userId
						});
						Subs.find({
							where: oFilter,
							fields: {
								"PaymentDate": true,
								"id": true
							}
						}).then(function(subcriptions) {
							subcriptions.forEach((item) => {
								var oUpdate = {
									InvoiceNo: "null"
								};
								Subs.findById(item.id).then(function(sInstance) {
									sInstance.updateAttributes(oUpdate);
								});
							});
							res.send("success");
						});
					});
				});
			}
		);
		app.post('/ChartedValidRating',
			function(req, res) {
				var app = require('../server/server');
				var Subs = app.models.Sub;
				var chartedValid = req.body.ChartedValid;
				var id = req.body.id;
				var oUpdate = {
					"ChartedValid": chartedValid
				};
				Subs.findById(id).then(function(sInstance) {
					sInstance.updateAttributes(oUpdate);
					res.send("success");
				});
			}
		);
		app.get('/getLogo',
			function(req, res) {
				var app = require('../server/server');
				var logo = fs.readFileSync('./server/invoice/logo.png', 'base64');
				res.send(logo);
			}
		);
		app.get('/getAnubhavTrainingsLogo',
			function(req, res) {
				var app = require('../server/server');
				var logo = fs.readFileSync('./server/invoice/AnubhavTrainings.png', 'base64');
				res.send(logo);
			}
		);
		app.get('/getSignature',
			function(req, res) {
				var app = require('../server/server');
				var signature = fs.readFileSync('./server/invoice/signature.png', 'base64');
				res.send(signature);
			}
		);
		app.get('/getSoyuzSignature',
			function(req, res) {
				var app = require('../server/server');
				var signature = fs.readFileSync('./server/invoice/soyuz Stamp.png', 'base64');
				res.send(signature);
			}
		);
		app.get('/getAnubhavTrainingsSignature',
			function(req, res) {
				var app = require('../server/server');
				var signature = fs.readFileSync('./server/invoice/AnubhavTrainingsSignature.png', 'base64');
				res.send(signature);
			}
		);
		app.post('/ResetPassword',
			function(req, res) {
				var app = require('../server/server');
				var Account = app.models.Account;
				var id = req.body.id;
				var updateObj = {
					key: req.body.key
				};
				Account.findById(id).then(function(instance) {
					instance.updateAttributes(updateObj);
					console.log("done");
					res.send("done");
				});
			}
		);
		app.post('/ResetCounter',
			function(req, res) {
				var app = require('../server/server');
				var Account = app.models.Account;
				var id = req.body.id;
				var updateObj = {
					counterall: 0
				};
				Account.findById(id).then(function(instance) {
					instance.updateAttributes(updateObj);
					console.log("done");
					res.send("done");
				});
			}
		);
		app.post('/MoveNextAc',
			function(req, res) {
				var app = require('../server/server');
				var Account = app.models.Account;
				Account.find({
						where: {
							current: true
						}
					})
					.then(function(allAc) {
						allAc = allAc.sort(function(a, b) {
							return a.counterall > b.counterall;
						});
						allAc = allAc.sort(function(a, b) {
							return a.counterall > b.counterall;
						});
						var item = allAc[0];
						var app = require('../server/server');
						var Account = app.models.Account;
						var id = item.id;
						var updateObj = {
							counter: item.counter + 1,
							counterall: item.counterall + 1
						};
						Account.findById(id).then(function(instance) {
							instance.updateAttributes(updateObj);
							console.log(instance);
							res.send(instance);
						});
					})
					.catch(function(err) {
						console.log(err);
					});
			}
		);
		app.post('/updateInq',
			function(req, res) {
				var app = require('../server/server');
				var Subs = app.models.Sub;
				Subs.find()
					.then(function(subs) {
						for (var i = 0; i < subs.length; i++) {
							var item = subs[i];
							//console.log("found course for student id " + item.StudentId + " course id " + item.CourseId);
							// var app = require('../server/server');
							// var Student = app.models.Student;
							// var Course = app.models.Course;
							// Student.findById(item.StudentId).then(function(singleStu){
							//     console.log(singleStu.GmailId);
							// });
							// Course.findById(item.CourseId).then(function(singleStu){
							//     console.log(singleStu.BatchNo);
							// });
							var app = require('../server/server');
							var Subs = app.models.Sub;
							var id = item.id;
							var updateObj = {
								Status: "Access granted"
							};
							Subs.findById(id).then(function(instance) {
								return instance.updateAttributes(updateObj);
							});
						}
					})
					.catch(function(err) {
						console.log(err);
					});




			}
		);
		//https://emojipedia.org/
		app.post('/sendServerEmail',
			function(req, res) {
				var payload = req.body;
				var that = this;
				var templateName = "";
				this.password = req.body.password;
				this.isServer2 = req.body.isServer2;

				if (req.body.isServer2 === "false") {
					templateName = 'Server';
				} else {
					templateName = 'Server2';
				}
				var Template = app.models.Template;

				Template.findOne({
					where: {
						and: [{
							CourseName: templateName
						}]
					}
				}).then(function(data) {
					if (!data) {
						res.status(500).send('Template Not found for the course');
					}
					this.mailContent = data.Template;
					//this.mailContent = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + 'server.html', 'utf8');
					//if partial payment is true update the due amount and due values
					Date.prototype.toShortFormat = function() {
						var month_names = ["Jan", "Feb", "Mar",
							"Apr", "May", "Jun",
							"Jul", "Aug", "Sep",
							"Oct", "Nov", "Dec"
						];

						var day = this.getDate();
						var month_index = this.getMonth();
						var year = this.getFullYear();

						return "" + day + "-" + month_names[month_index] + "-" + year;
					}
					var x = new Date(payload.EndDate);
					this.mailContent = this.mailContent.replace("$$IP_ADDRESS$$", data.DemoInvite);
					this.mailContent = this.mailContent.replace("$$EndDate$$", x.toShortFormat());
					this.mailContent = this.mailContent.replace("$$UserName$$", '<b href="http://www.anubhavtrainings.com">' + payload.User + '</a>');
					this.mailContent = this.mailContent.replace("$$Password$$", '<b href="http://www.anubhavtrainings.com/sap-technical-training">' + payload.PassRDP + '</a>');
					var app = require('../server/server');
					var Student = app.models.Student;
					this.StudentId = req.body.StudentId;
					Student.findById(this.StudentId).then(function(singleStu) {
						that.studentEmailId = singleStu.GmailId;
						that.studentName = singleStu.Name.split(" ")[0];
						///Replace the link in the contents
						that.studentName = that.studentName.replace(/([A-Z])/g, " $1");
						that.studentName = that.studentName.charAt(0).toUpperCase() + that.studentName.slice(1);
						if (studentName === "" || studentName === undefined || studentName === "null") {
							studentName = "Sir";
						}
						var nodemailer = require('nodemailer');
						var smtpTransport = require('nodemailer-smtp-transport');
						// var transporter = nodemailer.createTransport(smtpTransport({
						// 	service: 'Godaddy',
						// 	host: 'smtpout.secureserver.net',
						// 	secureConnection: true,
						// 	auth: {
						// 		user: 'server@anubhavtrainings.com',
						// 		pass: that.password
						// 	}
						// }));
						var transporter = nodemailer.createTransport(smtpTransport({
							service: 'gmail',
							host: 'smtp.gmail.com',
							auth: {
								user: 'server@anubhavtrainings.com',
								pass: that.password
							}
						}));
						var Subject = "[CONFIDENTIAL] 🚀 SAP Server Subscription";
						//https://myaccount.google.com/lesssecureapps?pli=1
						that.mailContent = that.mailContent.replace('$$Name$$', that.studentName)
						var ccs = ["contact@anubhavtrainings.com"];
						var mailOptions = {
							from: 'server@anubhavtrainings.com',
							cc: ccs,
							to: that.studentEmailId, //that2.studentEmailId
							subject: Subject,
							html: that.mailContent
						};

						transporter.sendMail(mailOptions, function(error, info) {
							if (error) {
								console.log(error);
								if (error.code === "EAUTH") {
									res.status(500).send('Username and Password not accepted, Please try again.');
								} else {
									res.status(500).send('Internal Error while Sending the email, Please try again.');
								}
							} else {
								console.log('Email sent: ' + info.response);
								res.send("email sent");
							}
						});
					});
				});
			});

		app.get("/chala", function() {
			const fs = require('fs');
			const readline = require('readline');
			const {
				google
			} = require('googleapis');

			// If modifying these scopes, delete token.json.
			const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
			// The file token.json stores the user's access and refresh tokens, and is
			// created automatically when the authorization flow completes for the first
			// time.
			const TOKEN_PATH = 'token.json';

			// Load client secrets from a local file.
			fs.readFile('server/credentials.json', (err, content) => {
				if (err) return console.log('Error loading client secret file:', err);
				// Authorize a client with credentials, then call the Google Drive API.
				console.log(JSON.parse(content));
				authorize(JSON.parse(content), listFiles);
			});

			/**
			 * Create an OAuth2 client with the given credentials, and then execute the
			 * given callback function.
			 * @param {Object} credentials The authorization client credentials.
			 * @param {function} callback The callback to call with the authorized client.
			 */
			function authorize(credentials, callback) {
				const {
					client_secret,
					client_id,
					redirect_uris
				} = credentials.web;
				const oAuth2Client = new google.auth.OAuth2(
					client_id, client_secret, redirect_uris[0]);

				// Check if we have previously stored a token.
				fs.readFile(TOKEN_PATH, (err, token) => {
					if (err) return getAccessToken(oAuth2Client, callback);
					oAuth2Client.setCredentials(JSON.parse(token));
					callback(oAuth2Client);
				});
			}

			/**
			 * Get and store new token after prompting for user authorization, and then
			 * execute the given callback with the authorized OAuth2 client.
			 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
			 * @param {getEventsCallback} callback The callback for the authorized client.
			 */
			function getAccessToken(oAuth2Client, callback) {
				const authUrl = oAuth2Client.generateAuthUrl({
					access_type: 'offline',
					scope: SCOPES,
				});
				console.log('Authorize this app by visiting this url:', authUrl);
				const rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout,
				});
				rl.question('Enter the code from that page here: ', (code) => {
					rl.close();
					oAuth2Client.getToken(code, (err, token) => {
						if (err) return console.error('Error retrieving access token', err);
						oAuth2Client.setCredentials(token);
						// Store the token to disk for later program executions
						fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
							if (err) return console.error(err);
							console.log('Token stored to', TOKEN_PATH);
						});
						callback(oAuth2Client);
					});
				});
			}

			/**
			 * Lists the names and IDs of up to 10 files.
			 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
			 */
			function listFiles(auth) {
				const drive = google.drive({
					version: 'v3',
					auth
				});
				drive.files.list({
					pageSize: 10,
					fields: 'nextPageToken, files(id, name)',
				}, (err, res) => {
					if (err) return console.log('The API returned an error: ' + err);
					const files = res.data.files;
					if (files.length) {
						console.log('Files:');
						files.map((file) => {
							console.log(`${file.name} (${file.id})`);
						});
					} else {
						console.log('No files found.');
					}
				});
			}
		});
		app.get('/grantTrainingAccess',
			function(req, res) {
				//playground for google api anubhav
				///https://console.cloud.google.com/apis/api/calendar-json.googleapis.com/overview?project=driveintegration-309712&folder=&organizationId=
				//https://console.cloud.google.com/home/dashboard?folder=&organizationId=&project=driveintegration-309712
				//https://developers.google.com/oauthplayground/
				//https://cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateAccessToken
				//https://developers.google.com/drive/api/v3/quickstart/nodejs
				const fs = require('fs');
				const readline = require('readline');
				const {
					google
				} = require('googleapis');
				var xoauth2 = require("xoauth2"),
					xoauth2gen;
				var googleAuth = require('google-auth-library');
				// If modifying these scopes, delete token.json.
				const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
					'https://www.googleapis.com/auth/drive.activity',
					'https://www.googleapis.com/auth/drive.file'
				];
				// The file token.json stores the user's access and refresh tokens, and is
				// created automatically when the authorization flow completes for the first
				// time.
				const TOKEN_PATH = 'token.json';
				const key = require('./drive.json');
				// Load client secrets from a local file.
				console.log(key);
				xoauth2gen = xoauth2.createXOAuth2Generator({
					user: key.user,
					clientId: key.clientId,
					clientSecret: key.clientSecret,
					refreshToken: key.refreshToken,
					scope: 'https://www.googleapis.com/auth/calendar'
				});
				const oauth2Client = new google.auth.OAuth2();
				// HTTP
				console.log(xoauth2gen);
				xoauth2gen.getToken(function(err, token, accessToken) {
					console.log(token + ' ==============>>> ' + accessToken)
					if (err) {
						return console.log(err);
					}
					console.log("Authorization: Bearer " + accessToken);
					var tokenAuth = {
						"access_token": accessToken,
						"scope": "https://www.googleapis.com/auth/calendar",
						"token_type": "Bearer",
						"expires_in": 3599,
						"refresh_token": "1//042hiHkGE2_rNCgYIARAAGAQSNwF-L9IreRafAuNV2vcj5EIkGXI84V-5uFmvZInyVlaz1K8S7YcUdtMJ4gZ_vwqGL-MH9V3bImg"
					};
					accessToken = "Bearer " + accessToken;
					oauth2Client.setCredentials(tokenAuth);

					const calendar = google.calendar({
						version: 'v3',
						auth: oauth2Client,
					});
					// calendar.events.list({
					// 		calendarId: 'primary',
					// 		timeMin: (new Date()).toISOString(),
					// 		maxResults: 10,
					// 		singleEvents: true,
					// 		orderBy: 'startTime',
					// 	}, (err, res) => {
					// 		console.log(res);
					// 		if (err) return console.log('The API returned an error: ' + err);
					//
					// 		const events = res.data.items;
					// 		if (events.length) {
					// 			console.log('Upcoming 10 events:');
					// 			events.map((event, i) => {
					// 				const start = event.start.dateTime || event.start.date;
					// 				console.log(`${start} - ${event.summary}`);
					// 			});
					// 		} else {
					// 			console.log('No upcoming events found.');
					// 		}
					// 	});
					// const drive = google.drive({
					// 	version: 'v3',
					// 	auth: oauth2Client
					// });
					//
					// drive.files.list({
					// 	pageSize: 10,
					// 	fields: 'nextPageToken, files(id, name)',
					// }, (err, res) => {
					// 	console.log(res);
					// 	if (err) return console.log('The API returned an error: ' + err);
					// 	const files = res.data.files;
					// 	if (files.length) {
					// 		console.log('Files:');
					// 		files.map((file) => {
					// 			console.log(`${file.name} (${file.id})`);
					// 		});
					// 	} else {
					// 		console.log('No files found.');
					// 	}
					// });
				});
				//singapore


			});

		app.post('/sendInquiryEmail',
			function(req, res) {
				//https://developers.google.com/oauthplayground/
				//https://cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateAccessToken
				//

				var nodemailer = require('nodemailer');
				var smtpTransport = require('nodemailer-smtp-transport');
				const xoauth2 = require('xoauth2');
				const key = require('./samples.json');
				console.log(req.body);

				if (req.body.IsMinakshi === "X") {
					var transporter = nodemailer.createTransport(smtpTransport({
						service: 'gmail',
						host: 'smtp.gmail.com',
						auth: {
							user: 'install.abap@gmail.com',
							pass: req.body.password
						}
					}));
				} else {
					var transporter = nodemailer.createTransport(smtpTransport({
						service: 'gmail',
						host: 'smtp.gmail.com',
						auth: {
							xoauth2: xoauth2.createXOAuth2Generator({
								user: key.user,
								clientId: key.clientId,
								clientSecret: key.clientSecret,
								refreshToken: key.refreshToken
							})
						}
					}));
				}


				var Subject = req.body.Subject;

				if (Subject === "" || Subject === "null") {
					//Subject = req.body.CourseName + " training";
					switch (req.body.CourseName) {
						case "ABAP on HANA":
							Subject = "AoH CDS and S4 technical training";
							break;
						case "UI5 and Fiori":
							Subject = "UI5 WebIDE and OData training";
							break;
						case "HANA XS":
							Subject = "XS and Native xsodata training";
							break;
						case "Launchpad":
							Subject = "Launchpad, Security & Extensions training";
							break;
						case "Hybris C4C":
							Subject = "C4 Customer Experience training";
							break;
						case "SAP Cloud Platform":
							Subject = "Cloud Platform - Cloud Fondary CAPM Training";
							break;
						case "S4HANA Extension":
							Subject = "S4 Cloud Extensions training";
							break;
						case "HANA Cloud Integration":
							Subject = "Cloud Platform Integration training";
							break;
						case "ABAP on Cloud":
							Subject = "RESTful Programming in Cloud training";
							break;
						case "Analytics Cloud":
							Subject = "Analytics Cloud training";
							break;
						case "SAC Premium":
							Subject = "SAC Premium training";
							break;
						case "ABAP":
							Subject = "Core ABAP Training";
							break;
						case "OOPS ABAP":
							Subject = "OOPS ABAP and Design pattern Training";
							break;
						case "Webdynpro":
							Subject = "Webdynrpo training";
							break;
						case "Workflow":
							Subject = "Workflow training";
							break;
						case "FPM":
							Subject = "FPM training";
							break;
						case "BRF":
							Subject = "BRF+ training";
							break;
						default:
							Subject = req.body.CourseName + " training";
							break;
					}
				}
				//https://myaccount.google.com/lesssecureapps?pli=1
				if (req.body.CourseName != "ABAP on HANA" && req.body.CourseName != "UI5 and Fiori" &&
					req.body.CourseName != "HANA XS" &&
					req.body.CourseName != "Launchpad" && req.body.CourseName != "Hybris C4C" &&
					req.body.CourseName != "S4HANA Extension" &&
					req.body.CourseName != "HANA Cloud Integration" &&
					req.body.CourseName != "SimpleLogistics" &&
					req.body.CourseName != "ABAP on Cloud" &&
					req.body.CourseName != "Analytics Cloud" &&
					req.body.CourseName != "SAC Premium" &&
					req.body.CourseName != "SAP Cloud Platform" &&
					req.body.CourseName != "ABAP" &&
					req.body.CourseName != "OOPS ABAP" &&
					req.body.CourseName != "Webdynpro" &&
					req.body.CourseName != "Workflow" &&
					req.body.CourseName != "FPM" &&
					req.body.CourseName != "BRF" &&
					req.body.CourseName != "Google Blockly" && req.body.CourseName != "SimpleFinance") {
					req.body.CourseName = "Generic";
					if (Subject === "" || Subject === "null") {
						Subject = "[REPLY] Regarding training Course 🟢";
					}
				}
				if (req.body.FirstName === "" || req.body.FirstName == "null") {
					req.body.FirstName = "Sir";
				}


				if (req.body.mailType === "" || req.body.FirstName == "null" || req.body.mailType === undefined) {
					req.body.mailType = "R";
				}
				if (req.body.CourseName === "Generic") {
					req.body.CourseName = "Other";
				}

				var app = require('../server/server');
				var Template = app.models.Template;

				var CourseName = req.body.CourseName;
				if (req.body.source === "L" || req.body.source === "F") {
					CourseName = "Linkedin";
				}
				Template.findOne({
					where: {
						and: [{
							Type: req.body.mailType
						}, {
							CourseName: CourseName
						}]
					}
				}).then(function(data) {
					//var contents = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + req.body.CourseName + '.html', 'utf8');

					if (!data) {
						res.status(500).send('Template Not found for the course');
					}
					var contents = data.Template;
					var demoDate = new Date(data.DemoDate);
					Date.prototype.toShortFormat = function() {
						var month_names = ["Jan", "Feb", "Mar",
							"Apr", "May", "Jun",
							"Jul", "Aug", "Sep",
							"Oct", "Nov", "Dec"
						];

						var day = this.getDate();
						var month_index = this.getMonth();
						var year = this.getFullYear();

						return "" + day + "-" + month_names[month_index] + "-" + year;
					}
					if (req.body.mailType === "A") {
						contents = contents.replace('$$BatchDate$$', demoDate.toShortFormat());
						contents = contents.replace('$$BatchTime$$', data.ClassTiming);
						contents = contents.replace('$$DemoLink$$', data.VideoLink);
						contents = contents.replace('%24%24DemoLink%24%24', data.VideoLink);
						contents = contents.replace('$$NextClass$$', data.NextClass);

					} else if (req.body.mailType === "B") {
						//yet to code
						contents = contents.replace('$$BatchDate$$', demoDate.toShortFormat());
						contents = contents.replace('$$BatchTime$$', data.ClassTiming);
						contents = contents.replace('$$DemoLink$$', data.VideoLink);
						contents = contents.replace('%24%24DemoLink%24%24', data.VideoLink);
						contents = contents.replace('$$NextClass$$', data.FirstName);
						contents = contents.replace('$$CALLink$$', data.Extra1);
						contents = contents.replace('%24%24CALLink%24%24', data.Extra1);
					}
					contents = contents.replace('$$Extra1$$', data.Extra2);
					var result = req.body.FirstName.replace(/([A-Z])/g, " $1");
					req.body.FirstName = result.charAt(0).toUpperCase() + result.slice(1);
					contents = contents.replace('$$Name$$', req.body.FirstName)

					if (req.body.fees !== "null" && req.body.fees !== "") {
						if (req.body.source === "L" || req.body.source === "F") {
							// contents = contents.replace("The course fee is $$fees$$ $$currency$$ (same for any option as mentioned below)", "");
							// contents = contents.replace("Please consider the fee for the course as $$fees$$ $$currency$$. (same fee for any option chosen)", "");
							// contents = contents.replace("The course fee is $$fees$$ $$currency$$ (same for any option as mentioned below)", "");
							// contents = contents.replace("The course fee is $$fees$$ $$currency$$.", "");
							//contents = fs.readFileSync(process.cwd() + "\\server\\sampledata\\promotion.html", 'utf8');
							Subject = "Hey " + req.body.FirstName + "!! Boost your skills"
						} else {
							contents = contents.replace("$$fees$$", req.body.fees);
							contents = contents.replace("$$currency$$", req.body.currency);
						}

					}
					var ccs = [];
					if (req.body.CourseName === "SimpleLogistics") {
						ccs.push("paramsaddy@gmail.com");
					} else if (req.body.CourseName === "SimpleFinance") {
						ccs.push("info@gaurav-consulting.com");
					}
					var mailOptions = {};

					if (req.body.IsMinakshi === "X") {
						ccs.push("contact@anubhavtrainings.com");
						mailOptions = {
							from: 'install.abap@gmail.com',
							to: req.body.EmailId, //req.body.EmailId    FirstName  CourseName
							cc: ccs,
							subject: 'Re: ' + Subject + " 🟢",
							html: contents
						};
					} else {
						mailOptions = {
							from: 'contact@anubhavtrainings.com',
							to: req.body.EmailId, //req.body.EmailId    FirstName  CourseName
							cc: ccs,
							subject: 'Re: ' + Subject + " 🟢",
							html: contents
						};
					}


					transporter.sendMail(mailOptions, function(error, info) {
						if (error) {
							console.log(error);
							if (error.code === "EAUTH") {
								res.status(500).send('Username and Password not accepted, Please try again.');
							} else {
								res.status(500).send('Internal Error while Sending the email, Please try again.');
							}
						} else {
							console.log('Email sent: ' + info.response);
							res.send("email sent");
						}
					});
				});



			});
		app.post('/sendInquiryEmail',
			function(req, res) {
				//https://developers.google.com/oauthplayground/
				//https://cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateAccessToken
				//

				var nodemailer = require('nodemailer');
				var smtpTransport = require('nodemailer-smtp-transport');
				const xoauth2 = require('xoauth2');
				const key = require('./samples.json');
				console.log(req.body);

				if (req.body.IsMinakshi === "X") {
					var transporter = nodemailer.createTransport(smtpTransport({
						service: 'gmail',
						host: 'smtp.gmail.com',
						auth: {
							user: 'install.abap@gmail.com',
							pass: req.body.password
						}
					}));
				} else {
					var transporter = nodemailer.createTransport(smtpTransport({
						service: 'gmail',
						host: 'smtp.gmail.com',
						auth: {
							xoauth2: xoauth2.createXOAuth2Generator({
								user: key.user,
								clientId: key.clientId,
								clientSecret: key.clientSecret,
								refreshToken: key.refreshToken
							})
						}
					}));
				}


				var Subject = req.body.Subject;

				if (Subject === "" || Subject === "null") {
					//Subject = req.body.CourseName + " training";
					switch (req.body.CourseName) {
						case "ABAP on HANA":
							Subject = "AoH CDS and S4 technical training";
							break;
						case "UI5 and Fiori":
							Subject = "UI5 WebIDE and OData training";
							break;
						case "HANA XS":
							Subject = "XS and Native xsodata training";
							break;
						case "Launchpad":
							Subject = "Launchpad, Security & Extensions training";
							break;
						case "Hybris C4C":
							Subject = "C4 Customer Experience training";
							break;
						case "SAP Cloud Platform":
							Subject = "Cloud Platform - Cloud Fondary CAPM Training";
							break;
						case "S4HANA Extension":
							Subject = "S4 Cloud Extensions training";
							break;
						case "HANA Cloud Integration":
							Subject = "Cloud Platform Integration training";
							break;
						case "ABAP on Cloud":
							Subject = "RESTful Programming in Cloud training";
							break;
						case "Analytics Cloud":
							Subject = "Analytics Cloud training";
							break;
						case "SAC Premium":
							Subject = "SAC Premium training";
							break;
						case "ABAP":
							Subject = "Core ABAP Training";
							break;
						case "OOPS ABAP":
							Subject = "OOPS ABAP and Design pattern Training";
							break;
						case "Webdynpro":
							Subject = "Webdynrpo training";
							break;
						case "Workflow":
							Subject = "Workflow training";
							break;
						case "FPM":
							Subject = "FPM training";
							break;
						case "BRF":
							Subject = "BRF+ training";
							break;
						default:
							Subject = req.body.CourseName + " training";
							break;
					}
				}
				//https://myaccount.google.com/lesssecureapps?pli=1
				if (req.body.CourseName != "ABAP on HANA" && req.body.CourseName != "UI5 and Fiori" &&
					req.body.CourseName != "HANA XS" &&
					req.body.CourseName != "Launchpad" && req.body.CourseName != "Hybris C4C" &&
					req.body.CourseName != "S4HANA Extension" &&
					req.body.CourseName != "HANA Cloud Integration" &&
					req.body.CourseName != "SimpleLogistics" &&
					req.body.CourseName != "ABAP on Cloud" &&
					req.body.CourseName != "Analytics Cloud" &&
					req.body.CourseName != "SAC Premium" &&
					req.body.CourseName != "SAP Cloud Platform" &&
					req.body.CourseName != "ABAP" &&
					req.body.CourseName != "OOPS ABAP" &&
					req.body.CourseName != "Webdynpro" &&
					req.body.CourseName != "Workflow" &&
					req.body.CourseName != "FPM" &&
					req.body.CourseName != "BRF" &&
					req.body.CourseName != "Google Blockly" && req.body.CourseName != "SimpleFinance") {
					req.body.CourseName = "Generic";
					if (Subject === "" || Subject === "null") {
						Subject = "[REPLY] Regarding training Course 🟢";
					}
				}
				if (req.body.FirstName === "" || req.body.FirstName == "null") {
					req.body.FirstName = "Sir";
				}


				if (req.body.mailType === "" || req.body.FirstName == "null" || req.body.mailType === undefined) {
					req.body.mailType = "R";
				}
				if (req.body.CourseName === "Generic") {
					req.body.CourseName = "Other";
				}

				var app = require('../server/server');
				var Template = app.models.Template;

				var CourseName = req.body.CourseName;
				if (req.body.source === "L" || req.body.source === "F") {
					CourseName = "Linkedin";
				}
				Template.findOne({
					where: {
						and: [{
							Type: req.body.mailType
						}, {
							CourseName: CourseName
						}]
					}
				}).then(function(data) {
					//var contents = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + req.body.CourseName + '.html', 'utf8');

					if (!data) {
						res.status(500).send('Template Not found for the course');
					}
					var contents = data.Template;
					var demoDate = new Date(data.DemoDate);
					Date.prototype.toShortFormat = function() {
						var month_names = ["Jan", "Feb", "Mar",
							"Apr", "May", "Jun",
							"Jul", "Aug", "Sep",
							"Oct", "Nov", "Dec"
						];

						var day = this.getDate();
						var month_index = this.getMonth();
						var year = this.getFullYear();

						return "" + day + "-" + month_names[month_index] + "-" + year;
					}
					if (req.body.mailType === "A") {
						contents = contents.replace('$$BatchDate$$', demoDate.toShortFormat());
						contents = contents.replace('$$BatchTime$$', data.ClassTiming);
						contents = contents.replace('$$DemoLink$$', data.VideoLink);
						contents = contents.replace('%24%24DemoLink%24%24', data.VideoLink);
						contents = contents.replace('$$NextClass$$', data.NextClass);

					} else if (req.body.mailType === "B") {
						//yet to code
						contents = contents.replace('$$BatchDate$$', demoDate.toShortFormat());
						contents = contents.replace('$$BatchTime$$', data.ClassTiming);
						contents = contents.replace('$$DemoLink$$', data.VideoLink);
						contents = contents.replace('%24%24DemoLink%24%24', data.VideoLink);
						contents = contents.replace('$$NextClass$$', data.FirstName);
						contents = contents.replace('$$CALLink$$', data.Extra1);
						contents = contents.replace('%24%24CALLink%24%24', data.Extra1);
					}
					contents = contents.replace('$$Extra1$$', data.Extra2);
					var result = req.body.FirstName.replace(/([A-Z])/g, " $1");
					req.body.FirstName = result.charAt(0).toUpperCase() + result.slice(1);
					contents = contents.replace('$$Name$$', req.body.FirstName)

					if (req.body.fees !== "null" && req.body.fees !== "") {
						if (req.body.source === "L" || req.body.source === "F") {
							// contents = contents.replace("The course fee is $$fees$$ $$currency$$ (same for any option as mentioned below)", "");
							// contents = contents.replace("Please consider the fee for the course as $$fees$$ $$currency$$. (same fee for any option chosen)", "");
							// contents = contents.replace("The course fee is $$fees$$ $$currency$$ (same for any option as mentioned below)", "");
							// contents = contents.replace("The course fee is $$fees$$ $$currency$$.", "");
							//contents = fs.readFileSync(process.cwd() + "\\server\\sampledata\\promotion.html", 'utf8');
							Subject = "Hey " + req.body.FirstName + "!! Boost your skills"
						} else {
							contents = contents.replace("$$fees$$", req.body.fees);
							contents = contents.replace("$$currency$$", req.body.currency);
						}

					}
					var ccs = [];
					if (req.body.CourseName === "SimpleLogistics") {
						ccs.push("paramsaddy@gmail.com");
					} else if (req.body.CourseName === "SimpleFinance") {
						ccs.push("info@gaurav-consulting.com");
					}
					var mailOptions = {};

					if (req.body.IsMinakshi === "X") {
						ccs.push("contact@anubhavtrainings.com");
						mailOptions = {
							from: 'install.abap@gmail.com',
							to: req.body.EmailId, //req.body.EmailId    FirstName  CourseName
							cc: ccs,
							subject: 'Re: ' + Subject + " 🟢",
							html: contents
						};
					} else {
						mailOptions = {
							from: 'contact@anubhavtrainings.com',
							to: req.body.EmailId, //req.body.EmailId    FirstName  CourseName
							cc: ccs,
							subject: 'Re: ' + Subject + " 🟢",
							html: contents
						};
					}


					transporter.sendMail(mailOptions, function(error, info) {
						if (error) {
							console.log(error);
							if (error.code === "EAUTH") {
								res.status(500).send('Username and Password not accepted, Please try again.');
							} else {
								res.status(500).send('Internal Error while Sending the email, Please try again.');
							}
						} else {
							console.log('Email sent: ' + info.response);
							res.send("email sent");
						}
					});
				});



			});
		mailContent: "",
			app.post('/sendSubscriptionEmail',
				function(req, res) {

					//if partial payment is true update the due amount and due values
					Date.prototype.toShortFormat = function() {
						var month_names = ["Jan", "Feb", "Mar",
							"Apr", "May", "Jun",
							"Jul", "Aug", "Sep",
							"Oct", "Nov", "Dec"
						];

						var day = this.getDate();
						var month_index = this.getMonth();
						var year = this.getFullYear();

						return "" + day + "-" + month_names[month_index] + "-" + year;
					}
					//console.log(req.body);
					var payload = req.body;
					var that = this;
					this.mailContent = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + 'payment.html', 'utf8');
					if (payload.includeX.indexOf("Renewal") !== -1) {
						this.mailContent = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + 'renewalPayment.html', 'utf8');
						var x = new Date(payload.EndDate);
						this.mailContent = this.mailContent.replace("$$DueDate$$", x.toShortFormat());
					}
					if (payload.PartialPayment === "true") {

						var x = new Date(payload.PaymentDueDate);
						this.mailContent = this.mailContent.replace("$$DueDate$$", x.toShortFormat());
						this.mailContent = this.mailContent.replace("$$DueAmount$$", payload.PendingAmount);
					} else {
						//else : remove the line
						this.mailContent = this.mailContent.replace("<p>Please note that your next payment is due on $$DueDate$$ with amount $$DueAmount$$ INR.</p>", "");
					}

					var app = require('../server/server');
					var Student = app.models.Student;
					this.StudentId = req.body.StudentId;
					this.CourseId = req.body.CourseId;
					this.password = payload.password;
					this.includeX = payload.includeX;
					this.giveAccess = payload.giveAccess;
					Student.findById(this.StudentId).then(function(singleStu) {
						var app = require('../server/server');
						var Course = app.models.Course;
						var that2 = that;
						that.studentEmailId = singleStu.GmailId;
						that.studentEmail1 = singleStu.OtherEmail1
						that.studentEmail2 = singleStu.OtherEmail2
						that.studentName = singleStu.Name.split(" ")[0];
						Course.findById(that.CourseId).then(function(courseStr) {
							console.log(that2.studentEmailId + "," + that2.studentName);
							console.log(courseStr);
							console.log(that2.mailContent);
							if (courseStr.Name === "ABAP" ||
								courseStr.Name === "OOPS ABAP" ||
								courseStr.Name === "Webdynpro" ||
								courseStr.Name === "Workflow" ||
								courseStr.Name === "FPM" ||
								courseStr.Name === "BRF" ||
								courseStr.Name === "Adobe Forms") {
								that2.mailContent = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + 'otherPayment.html', 'utf8');;
								that2.mailContent = that2.mailContent.replace("$$MLink$$", '<a href="' + courseStr.DriveId + '">' + courseStr.DriveId + '</a>');
							}

							///Replace the link in the contents
							that2.mailContent = that2.mailContent.replace("$$Link$$", '<a href="' + courseStr.Link + '">' + courseStr.Link + '</a>');
							that2.studentName = that2.studentName.replace(/([A-Z])/g, " $1");
							that2.studentName = that2.studentName.charAt(0).toUpperCase() + that2.studentName.slice(1);
							var endDate = new Date(courseStr.EndDate);
							var abhi = new Date();
							if (abhi > endDate) {
								that2.isCalRequire = false;
								//delete line for calendar invite
								that2.mailContent = that2.mailContent.replace("<p>Additionally, google <a href=\"http://calendar.google.com\">calendar invite</a> is also sent to your email id.", "").replace("<em>Please note that, We have given you access of latest content (on going batch), So more videos will come as we progress with regular classes.</em>", "");
								that2.mailContent = that2.mailContent.replace("<p>Additionally, google <a href='http://calendar.google.com'>calendar invite</a> is also sent to your email id. <em>Please note that it is an ongoing LIVE batch hence more videos will be added to the blog as and when course progress. You can cover the available videos and by that time you will get new videos</em>.</p>", "");
							} else {
								that2.isCalRequire = true;
							}
							var nodemailer = require('nodemailer');
							var smtpTransport = require('nodemailer-smtp-transport');


							var transporter = nodemailer.createTransport(smtpTransport({
								service: 'gmail',
								host: 'smtp.gmail.com',
								secureConnection: true,
								auth: {
									user: 'no-reply@anubhavtrainings.com',
									pass: that.password
								}
							}));

							var Subject = "[Welcome Onboard] ✈️" + courseStr.Name + " Training Subscription";
							//https://myaccount.google.com/lesssecureapps?pli=1
							that2.mailContent = that2.mailContent.replace('$$Name$$', that2.studentName)
							var ccs = ["anubhav.abap@gmail.com"];
							if (that2.includeX === "true" || that2.includeX === "Renewal-true") {
								ccs.push("contact@anubhavtrainings.com");
							} else if (that2.includeX === "Renewal") {
								//change content of the email here - anu
							}
							if (courseStr.Name === "Hybris C4C" ||
								courseStr.Name === "HANA Cloud Integration") {
								ccs.push("sam4dsouza@gmail.com");
							}
							var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
							if (emailPattern.test(that2.studentEmail1)) {
								ccs.push(that2.studentEmail1);
							}
							if (emailPattern.test(that2.studentEmail2)) {
								ccs.push(that2.studentEmail2);
							}
							var mailOptions = {
								from: 'no-reply@anubhavtrainings.com',
								to: that2.studentEmailId, //that2.studentEmailId
								cc: ccs,
								subject: Subject,
								html: that2.mailContent
							};

							transporter.sendMail(mailOptions, function(error, info) {
								if (error) {
									console.log(error);
									if (error.code === "EAUTH") {
										res.status(500).send('Username and Password not accepted, Please try again.');
									} else {
										res.status(500).send('Internal Error while Sending the email, Please try again.');
									}
								} else {
									console.log('Email sent: ' + info.response);
									res.send("email sent");
								}
							});

						});
					});




				});

		app.post("/clearToken", function(req, res) {

			const sampleClient = require('../google/sampleclient');
			sampleClient.clearToken();
			res.send("Success");

		});

		app.post('/loadBatchHolders',
			function(req, res) {
				var app = require('../server/server');
				var Course = app.models.Course;
				this.CourseId = req.body.CourseId;
				var that = this;
				Course.findById(this.CourseId).then(function(courseDetails) {
					var app = require('../server/server');
					var Subs = app.models.Sub;
					var that2 = that;
					var endDatex = new Date(courseDetails.EndDate);
					var abhix = new Date();
					if (abhix > endDatex) {
						that2.isCalRequire = false;
					} else {
						that2.isCalRequire = true;
					}
					that.CalendarId = courseDetails.CalendarId;
					that.EventId = courseDetails.EventId;
					that.DriveId = courseDetails.DriveId;
					Subs.find({
						where: {
							CourseId: that.CourseId
						}
					}).then(function(allSubscriptions) {
						var that3 = that2;
						that2.allSubscriptions = allSubscriptions;
						var Student = app.models.Student;


						var studentsOfBatch = [];
						for (var i = 0; i < allSubscriptions.length; i++) {
							studentsOfBatch.push(allSubscriptions[i].StudentId);
						}
						Student.find({
							where: {
								//student belongs to this courses
								id: {
									inq: studentsOfBatch
								}
								//and course access has not yet expired
							}

						}).then(function(allStudents) {
							if (that3.isCalRequire === true &&
								(that3.CalendarId != "null" && that3.CalendarId != "" &&
									that3.EventId != "null" && that3.EventId != "")
							) {

							}
							var prepared = [];
							for (var i = 0; i < that3.allSubscriptions.length; i++) {
								for (var j = 0; j < allStudents.length; j++) {
									if (allStudents[j].id.toString() === that3.allSubscriptions[i].StudentId.toString()) {
										var endDate = new Date(that3.allSubscriptions[i].EndDate);
										var abhi = new Date();
										var lvended = false;
										//if student expiry end date is grater than today's date he still has access
										if (abhi > endDate) {
											lvended = true;
										}
										prepared.push({
											name: allStudents[j].name,
											gmailid: allStudents[j].GmailId,
											country: allStudents[j].Country,
											defaulter: allStudents[j].Defaulter,
											startDate: that3.allSubscriptions[i].StartDate,
											endDate: that3.allSubscriptions[i].EndDate,
											ended: lvended,
											partialPayment: that3.allSubscriptions[i].PartialPayment,
											PendingAmount: that3.allSubscriptions[i].PendingAmount,
											MostRecent: that3.allSubscriptions[i].MostRecent
										});
										break;
									}
								}

							}
							res.send(prepared);

						});
					});
				});
			});
		app.post('/loadBatchHoldersLink',
			function(req, res) {
				var app = require('../server/server');
				var Course = app.models.Course;
				this.CourseId = req.body.CourseId;
				var that = this;
				Course.findById(this.CourseId).then(function(courseDetails) {
					var app = require('../server/server');
					var Subs = app.models.Sub;
					var that2 = that;
					var endDatex = new Date(courseDetails.EndDate);
					var abhix = new Date();
					if (abhix > endDatex) {
						that2.isCalRequire = false;
					} else {
						that2.isCalRequire = true;
					}
					that.CalendarId = courseDetails.CalendarId;
					that.EventId = courseDetails.EventId;
					that.DriveId = courseDetails.DriveId;
					Subs.find({
						where: {
							and: [{
								CourseId: that.CourseId
							}, {
								PartialPayment: false
							}]
						}
					}).then(function(allSubscriptions) {
						var that3 = that2;
						that2.allSubscriptions = allSubscriptions;
						var Student = app.models.Student;


						var studentsOfBatch = [];
						for (var i = 0; i < allSubscriptions.length; i++) {
							studentsOfBatch.push(allSubscriptions[i].StudentId);
						}
						Student.find({
							where: {
								//student belongs to this courses
								id: {
									inq: studentsOfBatch
								}
								//and course access has not yet expired
							}

						}).then(function(allStudents) {
							if (that3.isCalRequire === true &&
								(that3.CalendarId != "null" && that3.CalendarId != "" &&
									that3.EventId != "null" && that3.EventId != "")
							) {

							}
							var prepared = [];
							for (var i = 0; i < that3.allSubscriptions.length; i++) {
								for (var j = 0; j < allStudents.length; j++) {
									if (allStudents[j].id.toString() === that3.allSubscriptions[i].StudentId.toString()) {
										var endDate = new Date(that3.allSubscriptions[i].EndDate);
										var abhi = new Date();
										var lvended = false;
										//if student expiry end date is grater than today's date he still has access
										if (abhi > endDate) {
											lvended = true;
										}
										prepared.push({
											name: allStudents[j].name,
											gmailid: allStudents[j].GmailId,
											country: allStudents[j].Country,
											defaulter: allStudents[j].Defaulter,
											startDate: that3.allSubscriptions[i].StartDate,
											endDate: that3.allSubscriptions[i].EndDate,
											ended: lvended,
											partialPayment: that3.allSubscriptions[i].PartialPayment,
											PendingAmount: that3.allSubscriptions[i].PendingAmount,
											MostRecent: that3.allSubscriptions[i].MostRecent
										});
										break;
									}
								}

							}
							res.send(prepared);

						});
					});
				});
			});

		app.post('/refreshAccess',
			function(req, res) {
				var app = require('../server/server');
				var Course = app.models.Course;
				this.CourseId = req.body.CourseId;
				var that = this;
				Course.findById(this.CourseId).then(function(courseDetails) {
					var app = require('../server/server');
					var Subs = app.models.Sub;
					var that2 = that;
					var endDatex = new Date(courseDetails.EndDate);
					var abhix = new Date();
					if (abhix > endDatex) {
						that2.isCalRequire = false;
					} else {
						that2.isCalRequire = true;
					}
					that.CalendarId = courseDetails.CalendarId;
					that.EventId = courseDetails.EventId;
					that.DriveId = courseDetails.DriveId;
					Subs.find({
						where: {
							and: [{
								CourseId: that.CourseId
							}, {
								PartialPayment: false
							}]
						}
					}).then(function(allSubscriptions) {
						var that3 = that2;
						var Student = app.models.Student;
						var abhi = new Date();

						var studentsOfBatch = [];
						for (var i = 0; i < allSubscriptions.length; i++) {
							var endDate = new Date(allSubscriptions[i].EndDate);
							//if student expiry end date is grater than today's date he still has access
							if (abhi <= endDate) {
								studentsOfBatch.push(allSubscriptions[i].StudentId);
								//these students are still having access to the course
							} else {

							}

						}
						Student.find({
							where: {
								//student belongs to this courses
								id: {
									inq: studentsOfBatch
								}
								//and course access has not yet expired
							}

						}).then(function(allStudents) {
							const {
								google
							} = require('googleapis');
							const sampleClient = require('../google/sampleclient');
							const drive = google.drive({
								version: 'v3',
								auth: sampleClient.oAuth2Client,
							});

							if (that3.isCalRequire === true &&
								(that3.CalendarId != "null" && that3.CalendarId != "" &&
									that3.EventId != "null" && that3.EventId != "")
							) {
								const calendar = google.calendar({
									version: 'v3',
									auth: sampleClient.oAuth2Client,
								});
								that3.calendar = calendar;
							}
							var that4 = that3;
							that3.allStudents = allStudents;

							function runSample(query) {
								//grant the drive access
								var async = require('async');

								async.waterfall([
									function retrievePermissions(callback) {
										drive.permissions.list({
											'fileId': that3.DriveId
										}).then(function(resp) {
												callback(null, resp.data.permissions);
											},
											function(err) {

											}
										);
									},
									function _function0(items, callback) {
										var fileId = that3.DriveId;
										var permissions = [];
										for (var i = 0; i < items.length; i++) {
											if (items[i].role !== "owner") {
												permissions.push(items[i].id);
											}
										}
										async.eachSeries(permissions, function(permission, permissionCallback) {
											drive.permissions.delete({
												fileId: fileId,
												permissionId: permission,
												sendNotificationEmail: false
											}, function(err, res) {
												if (err) {
													// Handle error...
													console.error(err);
													permissionCallback(err);
												} else {
													//console.log('Permission ID: ', res.id)
													permissionCallback();
												}
											});
										}, function(err) {
											if (err) {
												// Handle error
												console.log("Deletion of permission failed");
												callback(err, null, null);
											} else {
												// All permissions inserted
												console.error("All permissions deleted");
												callback(null, null, null);
											}
										});

									},
									function _function1(oErr, args2, callback) {

										var fileId = that3.DriveId;
										var permissions = [];
										for (var i = 0; i < allStudents.length; i++) {
											var perms = {
												'type': 'user',
												'role': 'reader',
												'emailAddress': allStudents[i].GmailId
											};
											permissions.push(perms);
										}
										// Using the NPM module 'async'
										async.eachSeries(permissions, function(permission, permissionCallback) {
											drive.permissions.create({
												resource: permission,
												fileId: fileId,
												sendNotificationEmail: false
												//fields: 'id',
											}, function(err, res) {
												if (err) {
													// Handle error...
													console.error(err);
													permissionCallback(err);
												} else {
													//console.log('Permission ID: ', res.id)
													permissionCallback();
												}
											});
										}, function(err) {
											if (err) {
												// Handle error
												console.error(err);
												callback(err, null, null, null);
											} else {
												// All permissions inserted
												console.log("All permissions inserted ");
												callback(null, null, null, null);
											}
										});
									},
									function _function2(oErr, args2, args3, args4, callback) {

										if (that3.isCalRequire === true &&
											(that3.CalendarId != "null" && that3.CalendarId != "" &&
												that3.EventId != "null" && that3.EventId != "")) {
											that3.calendar.events.get({
												calendarId: that3.CalendarId + 'roup.calendar.google.com',
												eventId: that3.EventId
											}, function(err, something) {
												if (err) {
													console.log("CALENDAR NOT FOUND");
													res.send("access has been provided, with calendar not found");
													//return;
												}
												something.data.attendees = [];
												for (var i = 0; i < allStudents.length; i++) {
													something.data.attendees.push({
														"email": allStudents[i].GmailId
													});
												}
												that3.calendar.events.patch({
													calendarId: that3.CalendarId + 'roup.calendar.google.com',
													eventId: that3.EventId,
													resource: {
														attendees: something.data.attendees,
														recurrence: something.data.recurrence,
														end: something.data.end,
														start: something.data.start
													}
												}, function(err, args1, args2, args3, args4) {
													if (err) {
														console.error(err);
														//callback(null);
													} else {
														//res.send("calendar access granted");
														console.log("access granted for calendar to All");
														//callback(null);
													}
												});
											});
										}


									}
								], function(error) {
									//grant the access of calendarId
									res.send("access has been provided");
								});




							}
							if (module === require.main) {
								const scopes = [
									'https://www.googleapis.com/auth/drive',
									'https://www.googleapis.com/auth/calendar.events'
								];
								sampleClient
									.authenticate(scopes)
									.then(runSample)
									.catch(console.error);
							}


						});


					});
				});
			});

		app.post('/giveAccess',
			function(req, res) {
				var app = require('../server/server');
				var Student = app.models.Student;
				this.StudentId = req.body.StudentId;
				this.CourseId = req.body.CourseId;
				var that = this;
				Student.findById(this.StudentId).then(function(singleStu) {
					var app = require('../server/server');
					var Course = app.models.Course;
					var that2 = that;
					that.studentEmailId = singleStu.GmailId;
					that.studentName = singleStu.Name.split(" ")[0];
					Course.findById(that.CourseId).then(function(courseStr) {
						console.log(that2.studentEmailId + "," + that2.studentName);
						console.log(courseStr);
						console.log(that2.mailContent);
						var endDate = new Date(courseStr.EndDate);
						var abhi = new Date();
						if (abhi > endDate) {
							that2.isCalRequire = false;
						} else {
							that2.isCalRequire = true;
						}
						const {
							google
						} = require('googleapis');
						const sampleClient = require('../google/sampleclient');

						const drive = google.drive({
							version: 'v3',
							auth: sampleClient.oAuth2Client,
						});


						if (that2.isCalRequire === true &&
							(courseStr.CalendarId != "null" && courseStr.CalendarId != "" &&
								courseStr.EventId != "null" && courseStr.EventId != "")
						) {
							const calendar = google.calendar({
								version: 'v3',
								auth: sampleClient.oAuth2Client,
							});
							that2.CalendarId = courseStr.CalendarId;
							that2.EventId = courseStr.EventId;
							that2.calendar = calendar;
						}

						that2.DriveId = courseStr.DriveId;

						var that3 = that2;

						async function runSample(query) {
							drive.permissions.create({
								fileId: that3.DriveId,
								sendNotificationEmail: false,
								resource: {
									role: 'reader',
									type: 'user',
									emailAddress: that3.studentEmailId,
								}
							}, (error, permissionResponse) => {
								if (error) {
									console.log(error);
								} else {
									res.send("drive access granted");
								}
							});

							if (that2.isCalRequire === true &&
								(courseStr.CalendarId != "null" && courseStr.CalendarId != "" &&
									courseStr.EventId != "null" && courseStr.EventId != "")) {
								that2.calendar.events.get({
									calendarId: that2.CalendarId + 'roup.calendar.google.com',
									eventId: that2.EventId
								}, function(err, something) {
									if (err) {
										console.log("CALENDAR NOT FOUND");
										res.send("calendar not found");
										return;
									}
									something.data.attendees.push({
										"email": that3.studentEmailId
									});
									that3.calendar.events.patch({
										calendarId: that3.CalendarId + 'roup.calendar.google.com',
										eventId: that3.EventId,
										resource: {
											attendees: something.data.attendees,
											recurrence: something.data.recurrence,
											end: something.data.end,
											start: something.data.start
										}
									}, function(err, something) {
										if (err) {
											console.error(err);
										} else {
											res.send("calendar access granted");
										}
									});
								});
							}
						}
						if (module === require.main) {
							const scopes = [
								'https://www.googleapis.com/auth/drive',
								'https://www.googleapis.com/auth/calendar.events'
							];
							sampleClient
								.authenticate(scopes)
								.then(runSample)
								.catch(console.error);
						}
					});
				});
			});

		app.post('/giveAccessNew',
			function(req, res) {
				var app = require('../server/server');
				var Student = app.models.Student;
				this.StudentId = req.body.StudentId;
				this.CourseId = req.body.CourseId;
				var that = this;
				Student.findById(this.StudentId).then(function(singleStu) {
					var app = require('../server/server');
					var Course = app.models.Course;
					var that2 = that;
					that.studentEmailId = singleStu.GmailId;
					that.studentName = singleStu.Name.split(" ")[0];
					Course.findById(that.CourseId).then(function(courseStr) {
						console.log(that2.studentEmailId + "," + that2.studentName);
						console.log(courseStr);
						console.log(that2.mailContent);
						var endDate = new Date(courseStr.EndDate);
						var abhi = new Date();
						if (abhi > endDate) {
							that2.isCalRequire = false;
						} else {
							that2.isCalRequire = true;
						}
						//const sampleClient = require('../google/sampleclient');
						//new codee starts OtherEmail1
						const fs = require('fs');
						const {
							google
						} = require('googleapis');
						var xoauth2 = require("xoauth2"),
							xoauth2gen;
						// If modifying these scopes, delete token.json.
						const SCOPES = ['https://www.googleapis.com/auth/calendar',
							'https://www.googleapis.com/auth/drive'
						];
						const key = require('./drive.json');
						// Load client secrets from a local file.
						console.log(key);
						xoauth2gen = xoauth2.createXOAuth2Generator({
							user: key.user,
							clientId: key.clientId,
							clientSecret: key.clientSecret,
							refreshToken: key.refreshToken,
							scope: SCOPES
						});
						const oauth2Client = new google.auth.OAuth2();
						xoauth2gen.getToken(function(err, token, accessToken) {
							//console.log(token + ' ==============>>> ' + accessToken)
							if (err) {
								return console.log(err);
							}
							//console.log("Authorization: Bearer " + accessToken);
							var tokenAuth = {
								"access_token": accessToken,
								"scope": ["https://www.googleapis.com/auth/drive",
									"https://www.googleapis.com/auth/calendar"
								],
								"token_type": "Bearer",
								"expires_in": 3599,
								"refresh_token": "1//042hiHkGE2_rNCgYIARAAGAQSNwF-L9IreRafAuNV2vcj5EIkGXI84V-5uFmvZInyVlaz1K8S7YcUdtMJ4gZ_vwqGL-MH9V3bImg"
							};
							//accessToken = "Bearer " + accessToken;
							oauth2Client.setCredentials(tokenAuth);
							const drive = google.drive({
								version: 'v3',
								auth: oauth2Client
							});
							if (that2.isCalRequire === true &&
								(courseStr.CalendarId != "null" && courseStr.CalendarId != "" &&
									courseStr.EventId != "null" && courseStr.EventId != "")
							) {
								const calendar = google.calendar({
									version: 'v3',
									auth: oauth2Client
								});
								that2.CalendarId = courseStr.CalendarId;
								that2.EventId = courseStr.EventId;
								that2.calendar = calendar;
							}

							that2.DriveId = courseStr.DriveId;

							var that3 = that2;
							drive.permissions.create({
								fileId: that3.DriveId,
								sendNotificationEmail: false,
								resource: {
									role: 'reader',
									type: 'user',
									emailAddress: that3.studentEmailId,
								}
							}, (error, permissionResponse) => {
								if (error) {
									console.log(error);
								} else {
									res.send("drive access granted");
								}
							});

							if (that2.isCalRequire === true &&
								(courseStr.CalendarId != "null" && courseStr.CalendarId != "" &&
									courseStr.EventId != "null" && courseStr.EventId != "")) {
								that2.calendar.events.get({
									calendarId: that2.CalendarId + 'roup.calendar.google.com',
									eventId: that2.EventId
								}, function(err, something) {
									if (err) {
										console.log("CALENDAR NOT FOUND");
										res.send("calendar not found");
										return;
									}
									something.data.attendees.push({
										"email": that3.studentEmailId
									});
									that3.calendar.events.patch({
										calendarId: that3.CalendarId + 'roup.calendar.google.com',
										eventId: that3.EventId,
										resource: {
											attendees: something.data.attendees,
											recurrence: something.data.recurrence,
											end: something.data.end,
											start: something.data.start
										}
									}, function(err, something) {
										if (err) {
											console.error(err);
										} else {
											res.send("calendar access granted");
										}
									});
								});
							}

						});


						///new code ends OtherEmail1
						// const drive = google.drive({
						// 	version: 'v3',
						// 	auth: sampleClient.oAuth2Client,
						// });
					});
				});
			});

		app.post('/updateAllInq',
			function(req, res) {
				var Course = app.models.Course;
				Course.updateAll({}, {
					"CalendarId": "null",
					"DriveId": "null",
					"EventId": ""
				}, function() {
					console.log("done");
				});

			});

		app.post('/gtest',
			function(req, res) {
				const {
					google
				} = require('googleapis');
				const sampleClient = require('../google/sampleclient');

				const drive = google.drive({
					version: 'v3',
					auth: sampleClient.oAuth2Client,
				});
				const calendar = google.calendar({
					version: 'v3',
					auth: sampleClient.oAuth2Client,
				});
				async function runSample(query) {
					drive.permissions.create({
						fileId: '1fqDCnW01Say3JmRkCRFw1flUpYmp_xlj',
						sendNotificationEmail: false,
						resource: {
							role: 'reader',
							type: 'user',
							emailAddress: 'deepakoftcom@gmail.com',
						}
					}, (error, permissionResponse) => {
						if (error) {
							console.log(error);
						} else {
							console.log(permissionResponse);
						}
					});
					var that = this;
					this.calId = "20ldbaatoi4sb59gaunjk609pk@group.calendar.google.com";
					this.eveId = "2fag90e6fp9mk3gv07bceuq0rl";
					this.calendar = calendar;
					this.calendar.events.get({
						calendarId: this.calId,
						eventId: this.eveId
					}, function(err, something) {
						something.data.attendees.push({
							"email": "deepakoftcom@gmail.com"
						});
						that.calendar.events.patch({
							calendarId: that.calId,
							eventId: that.eveId,
							resource: {
								attendees: something.data.attendees,
								recurrence: something.data.recurrence,
								end: something.data.end,
								start: something.data.start
							}
						}, function(err, something) {
							if (err) {
								console.error(err);
							} else {
								console.log(something);
							}
						});
					});
				}
				if (module === require.main) {
					const scopes = [
						'https://www.googleapis.com/auth/calendar',
						'https://www.googleapis.com/auth/drive',
						'https://www.googleapis.com/auth/calendar.events'
					];
					sampleClient
						.authenticate(scopes)
						.then(runSample)
						.catch(console.error);
				}

				module.exports = {
					runSample,
					client: sampleClient.oAuth2Client,
				};
			});

		app.post('/updateBalanceInAccount', function(req, res) {
			var payload = req.body;
			var that = this;
			this.accountNo = req.body.AccountNo;
			this.amount = req.body.Amount;
			var app = require('../server/server');
			var AccountBalance = app.models.AccountBalance;
			AccountBalance.findOne({
					where: {
						and: [{
							Remarks: "AUTOSERVERBALANCE"
						}, {
							AccountNo: this.accountNo
						}]
					}
				})
				.then(function(record) {

					var app = require('../server/server');
					var AccountBalance = app.models.AccountBalance;
					if (record) {
						var id = record.id;
						var updateObj = {
							Amount: parseInt(record.Amount) + parseInt(that.amount),
							CreatedOn: new Date()
						};
						AccountBalance.findById(id).then(function(instance) {
							return instance.updateAttributes(updateObj);
						});
					} else {
						var newRec = {};
						newRec.CreatedOn = new Date();
						newRec.AccountNo = that.accountNo;
						newRec.Remarks = "AUTOSERVERBALANCE";
						newRec.Amount = that.amount;
						AccountBalance.findOrCreate({
								where: {
									Remarks: "AUTOSERVERBALANCE",
									AccountNo: this.accountNo
								}
							}, newRec)
							.then(function(inq) {

								console.log("created successfully");
							})
							.catch(function(err) {
								console.log(err);
							});
					}
				});


		});
		app.post('/upload',
			function(req, res) {

				if (!req.files.myFileUpload) {
					res.send('No files were uploaded.');
					return;
				}

				var sampleFile;
				var exceltojson;

				sampleFile = req.files.myFileUpload;
				var createdBy = req.body.createdBy;
				if (createdBy === "" || createdBy === null) {
					res.json({
						error_code: 1,
						err_desc: "Name is empty"
					});
					return "Error";
				}
				sampleFile.mv('./uploads/' + req.files.myFileUpload.name, function(err) {
					if (err) {
						console.log("eror saving");
					} else {
						console.log("saved");
						if (req.files.myFileUpload.name.split('.')[req.files.myFileUpload.name.split('.').length - 1] === 'xlsx') {
							exceltojson = xlsxtojson;
							console.log("xlxs");
						} else {
							exceltojson = xlstojson;
							console.log("xls");
						}
						try {
							exceltojson({
								input: './uploads/' + req.files.myFileUpload.name,
								output: null, //since we don't need output.json
								lowerCaseHeaders: true
							}, function(err, result) {
								if (err) {
									return res.json({
										error_code: 1,
										err_desc: err,
										data: null
									});
								}
								res.json({
									error_code: 0,
									err_desc: null,
									data: result
								});

								var getMyDate = function(strDate) {
									var qdat = new Date();
									var x = strDate;
									qdat.setYear(parseInt(x.substr(0, 4)));
									qdat.setMonth(parseInt(x.substr(4, 2)) - 1);
									qdat.setDate(parseInt(x.substr(6, 2)));
									return qdat;
								};
								var Inquiry = app.models.Inquiry;
								var Student = app.models.Student;
								var Batch = app.models.Course;
								var Account = app.models.Account;
								var Subs = app.models.Sub;
								var uploadType = "Inquiry";
								///*****Code to update the batchs
								this.allResult = [];
								// switch (uploadType) {
								// 	case "Email":
								// 		for (var j = 0; j < result.length; j++) {
								// 			this.allResult[result[j].email] = result[j];
								// 		}
								// 		break;
								// 	case "Server":
								// 		for (var j = 0; j < result.length; j++) {
								// 			this.allResult[result[j].email] = result[j];
								// 		}
								// 		break;
								// 	default:
								//
								// }

								///Process the result json and send to mongo for creating all inquiries
								for (var j = 0; j < result.length; j++) {
									var singleRec = result[j];

									switch (uploadType) {
										case "Check":
											var GmailId = singleRec.email;
											Student.find({
													where: {
														GmailId: singleRec.email
													}
												})
												.then(function(stu) {
													if (stu.length > 0) {

														console.log(stu[0].GmailId + " found");
													}
												});
											break;
										case "Server":
											var GmailId = singleRec.email;
											Student.findOne({
													where: {
														GmailId: singleRec.email
													}
												})
												.then(function(stu) {
													if (stu) {
														var app = require('../server/server');
														var Student = app.models.Student;
														var Server = app.models.Server;
														var newRecord = {};

														newRecord.CreatedOn = getMyDate("20180101");
														newRecord.CreatedBy = "5c187035dba2681834ffe301";
														newRecord.ChangedOn = getMyDate("20180101");
														newRecord.ChangedBy = "5c187035dba2681834ffe301";
														newRecord.User = this.allResult[stu.GmailId].mobuser.toUpperCase();
														newRecord.StudentId = stu.id;
														newRecord.PaymentDate = getMyDate(this.allResult[stu.GmailId].paydate);
														newRecord.StartDate = getMyDate(this.allResult[stu.GmailId].startdate);
														newRecord.EndDate = getMyDate(this.allResult[stu.GmailId].enddate);
														newRecord.UserEndDate = getMyDate(this.allResult[stu.GmailId].userenddate);
														newRecord.Amount = this.allResult[stu.GmailId].amount;
														newRecord.Mode = "Online";
														newRecord.PassRDP = this.allResult[stu.GmailId].password;
														newRecord.Remarks = "Created by Anubhav";
														newRecord.source = "P";
														newRecord.Extr1 = this.allResult[stu.GmailId].email
														Server.findOrCreate({
																"where": {
																	"and": [{
																			"StudentId": newRecord.StudentId
																		},
																		{
																			"User": newRecord.User
																		}
																	]
																}
															}, newRecord)
															.then(function(batch) {
																console.log("created server successfully");
															})
															.catch(function(err) {
																console.log(err);
															});
													}
												})
												.catch(function(err) {
													console.log(err);
												});
											break;
										case "Email":
											this.newRec = {};
											this.newRec.GmailId = singleRec.email;
											this.newRec.OtherEmail1 = singleRec.email1;
											this.newRec.OtherEmail2 = singleRec.email2;
											var GmailId = singleRec.email;
											var that = this;
											Student.findOne({
													where: {
														GmailId: singleRec.email
													}
												})
												.then(function(stu) {
													if (stu) {

														var app = require('../server/server');
														var Student = app.models.Student;
														var id = stu.id;
														console.log(this.allResult[stu.GmailId]);
														stu.OtherEmail1 = this.allResult[stu.GmailId].email1;
														stu.OtherEmail2 = this.allResult[stu.GmailId].email2;
														var updateObj = {
															OtherEmail1: this.allResult[stu.GmailId].email1,
															OtherEmail2: this.allResult[stu.GmailId].email2
														};
														Student.findById(id).then(function(instance) {
															return instance.updateAttributes(updateObj);
														});
														//Student.update(stu);
														// stu.updateAttributes({
														//   OtherEmail1: this.allResult[stu.GmailId].OtherEmail1,
														//   OtherEmail2: this.allResult[stu.GmailId].OtherEmail2
														// });
														// console.log("update successfully");
													}
												})
												.catch(function(err) {
													console.log(err);
												});
											///*****End of code to update batches
											break;
										case "Account":
											var newRec = {};
											newRec.accountName = singleRec.accountname;
											newRec.ifsc = singleRec.ifsc;
											newRec.accountNo = singleRec.accountno;
											newRec.limit = singleRec.limit;
											newRec.white = singleRec.white;
											newRec.userId = singleRec.userid;
											newRec.registeredNo = singleRec.mobile;
											newRec.email = "null";
											newRec.counter = 0;
											newRec.current = false;
											Account.findOrCreate({
													where: {
														accountNo: newRec.accountNo
													}
												}, newRec)
												.then(function(inq) {

													console.log("created successfully");
												})
												.catch(function(err) {
													console.log(err);
												});
											///*****End of code to update batches
											break;
										case "Batch":
											var newRec = {};
											newRec.CreatedOn = getMyDate(singleRec.startdate);
											newRec.CreatedBy = "5c187035dba2681834ffe301";
											newRec.ChangedOn = getMyDate(singleRec.startdate);
											newRec.ChangedBy = "5c187035dba2681834ffe301";
											newRec.Extra = "null";
											newRec.Extra1 = "null";
											newRec.Name = singleRec.name;
											newRec.BatchNo = singleRec.batchno;
											newRec.StartDate = getMyDate(singleRec.startdate);
											newRec.DemoStartDate = getMyDate(singleRec.startdate);
											newRec.EndDate = getMyDate(singleRec.enddate);
											newRec.ReminderDate = getMyDate(singleRec.reminderdate);
											newRec.BlogEndDate = getMyDate(singleRec.blogenddate);
											newRec.Link = singleRec.link;
											newRec.Weekend = singleRec.weekend;
											newRec.Timings = singleRec.timings;
											newRec.Fee = singleRec.fee;

											Batch.findOrCreate({
													where: {
														BatchNo: newRec.BatchNo
													}
												}, newRec)
												.then(function(inq) {

													console.log("created successfully");
												})
												.catch(function(err) {
													console.log(err);
												});
											///*****End of code to update batches
											break;
										case "Inquiry":
											// if (singleRec.pending) {
											// 	if (singleRec.pending !== "") {
											// 		continue;
											// 	}
											// }
											/////****Code to update Inquiries one by one file and also created
											///cusromer based on TRUE flag
											var newRec = {};
											newRec.EmailId = singleRec.email.toLowerCase();
											if (singleRec.url.indexOf("abap-on-hana-training") !== -1) {
												singleRec.url = "ABAP on HANA";
												if (singleRec.country_code === "IN") {
													newRec.fees = "20 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "350";
													newRec.currency = "USD";
												}
											} else if (singleRec.url.indexOf("abap-on-cloud-training") !== -1) {
												singleRec.url = "ABAP on Cloud";
												if (singleRec.country_code === "IN") {
													newRec.fees = "20 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "280";
													newRec.currency = "USD";
												}
											} else if (singleRec.url.indexOf("sap-analytics-cloud-training") !== -1) {
												singleRec.url = "Analytics Cloud";
												if (singleRec.country_code === "IN") {
													newRec.fees = "25 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											} else if (singleRec.url.indexOf("hana-cloud-integration-training") !== -1) {
												singleRec.url = "HANA Cloud Integration";
												if (singleRec.country_code === "IN") {
													newRec.fees = "25 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											} else if (singleRec.url.indexOf("launchpad") !== -1) {
												singleRec.url = "Launchpad";
												if (singleRec.country_code === "IN") {
													newRec.fees = "25 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											} else if (singleRec.url.indexOf("hybris-c4c-training") !== -1) {
												singleRec.url = "Hybris C4C";
												if (singleRec.country_code === "IN") {
													newRec.fees = "22 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											} else {
												singleRec.url = "UI5 and Fiori";
												if (singleRec.country_code === "IN") {
													newRec.fees = "20 k";
													newRec.currency = "INR";
												} else {
													newRec.fees = "350";
													newRec.currency = "USD";
												}
											}
											newRec.CourseName = singleRec.url;
											newRec.FirstName = singleRec.first_name;
											if (newRec.FirstName === "") {
												newRec.FirstName = "Sir";
											}
											newRec.LastName = singleRec.last_name;
											newRec.Country = singleRec.country_code;
											newRec.Date = new Date();
											//newRec.Subject = singleRec.coursename;
											//newRec.Message = singleRec.coursename;

											newRec.CreatedBy = createdBy;
											newRec.CreatedOn = new Date();
											newRec.ChangedBy = createdBy;
											newRec.ChangedOn = new Date();
											newRec.SoftDelete = false;
											newRec.Phone = 0;
											//singleRec.Date = getMyDate(singleRec.Date);
											Inquiry.findOrCreate({
													where: {
														and: [{
															EmailId: newRec.EmailId
														}, {
															CourseName: newRec.CourseName
														}]
													}
												}, newRec)
												.then(function(inq) {

													console.log("created successfully");
												})
												.catch(function(err) {
													console.log(err);
												});
											// newRec.EmailId = singleRec.emailid.toLowerCase();
											// newRec.CourseName = singleRec.coursename;
											// newRec.FirstName = singleRec.firstname;
											// newRec.LastName = singleRec.lastname;
											// newRec.Country = singleRec.country;
											// newRec.Date = getMyDate(singleRec.date);
											// newRec.Subject = singleRec.coursename;
											// newRec.Message = singleRec.coursename;
											// newRec.SoftDelete = singleRec.softdelete;
											// newRec.Phone = singleRec.phone;
											//
											// Inquiry.findOrCreate({
											// 		where: {
											// 			and: [{
											// 				EmailId: newRec.EmailId
											// 			}, {
											// 				CourseName: newRec.CourseName
											// 			}]
											// 		}
											// 	}, newRec)
											// 	.then(function(inq) {
											//
											// 		console.log("created successfully");
											// 	})
											// 	.catch(function(err) {
											// 		console.log(err);
											// 	});
											//
											// if (newRec.SoftDelete === "TRUE") {
											// 	var studentRec = {};
											// 	studentRec.CreatedOn = getMyDate(singleRec.date);
											// 	studentRec.CreatedBy = "5c187035dba2681834ffe301";
											// 	studentRec.ChangedOn = getMyDate(singleRec.date);
											// 	studentRec.ChangedBy = "5c187035dba2681834ffe301";
											// 	studentRec.GmailId = singleRec.emailid.toLowerCase();
											// 	studentRec.Name = singleRec.firstname + " " + singleRec.lastname;
											// 	studentRec.CompanyMail = "null";
											// 	studentRec.OtherEmail1 = "null";
											// 	studentRec.OtherEmail2 = "null";
											// 	studentRec.ContactNo = singleRec.phone;
											// 	studentRec.Country = singleRec.country;
											// 	studentRec.Designation = "null";
											// 	studentRec.Star = false;
											// 	studentRec.Defaulter = false;
											// 	studentRec.HighServerUsage = false;
											// 	studentRec.Skills = singleRec.coursename;
											// 	studentRec.Resume = "null";
											// 	studentRec.Extra1 = "null";
											// 	studentRec.Extra2 = "null";
											// 	Student.findOrCreate({
											// 			where: {
											// 				and: [{
											// 					GmailId: newRec.EmailId
											// 				}]
											// 			}
											// 		}, studentRec)
											// 		.then(function(inq) {
											//
											// 			console.log("Student also created successfully");
											// 		})
											// 		.catch(function(err) {
											// 			console.log(err);
											// 		});
											// }
											////****end of changes
											break;
										case "Students":
											var Batchs = Batch;
											singleRec.studentid = singleRec.studentid.toLowerCase();

											///****create student rather lookups
											var studentEmail = singleRec.studentid.toLowerCase();
											var courseFee = singleRec.amount;
											var remarker = "";
											if (singleRec.remarks) {
												remarker = singleRec.remarks;
											}

											Batchs.findOne({
													"where": {
														"BatchNo": singleRec.courseid
													}
												})
												.then(function(batch) {
													var batchid = batch.id;
													var newRec = {};
													newRec.StartDate = batch.StartDate;
													newRec.EndDate = batch.EndDate;
													newRec.PaymentDate = batch.StartDate;
													newRec.PaymentDueDate = batch.EndDate;
													newRec.CourseId = batch.id;
													newRec.Mode = "L";
													newRec.PaymentMode = "IMPS";
													newRec.BankName = "null";
													newRec.AccountName = "null";
													newRec.Amount = courseFee;
													newRec.Reference = "null";
													newRec.Remarks = "Auto Created ";
													if (remarker === "X") {
														newRec.Remarks = "Again WebIDE02: Auto Created ";
													}
													newRec.PendingAmount = 0;
													newRec.Waiver = false;
													newRec.DropOut = false;
													newRec.PaymentScreenshot = "null";
													newRec.PartialPayment = false;
													newRec.Extended = false;
													newRec.Extra1 = "null";
													newRec.Extra2 = "null";
													newRec.ExtraN1 = 0;
													newRec.ExtraN2 = 0;
													newRec.ExtraN3 = 0;
													newRec.UpdatePayment = false;
													newRec.MostRecent = true
													newRec.CreatedBy = "5c187035dba2681834ffe301";
													newRec.ChangedBy = "5c187035dba2681834ffe301";
													//newRec.StudentId = studentsx;
													newRec.CourseId = batchid;

													var studentRec = {};
													studentRec.CreatedOn = batch.StartDate;
													studentRec.CreatedBy = "5c187035dba2681834ffe301";
													studentRec.ChangedOn = batch.StartDate;
													studentRec.ChangedBy = "5c187035dba2681834ffe301";
													studentRec.GmailId = studentEmail;
													studentRec.Name = "Auto CreatedSub";
													studentRec.CompanyMail = "null";
													studentRec.OtherEmail1 = "null";
													studentRec.OtherEmail2 = "null";
													studentRec.ContactNo = 0;
													studentRec.Country = "IN";
													studentRec.Designation = "null";
													studentRec.Star = false;
													studentRec.Defaulter = false;
													studentRec.HighServerUsage = false;
													studentRec.Skills = batch.Name;
													studentRec.Resume = "null";
													studentRec.Extra1 = "null";
													studentRec.Extra2 = "null";
													var finalSub = newRec;
													Student.findOrCreate({
															where: {
																and: [{
																	GmailId: studentEmail
																}]
															}
														}, studentRec)
														.then(function(inq) {

															console.log("Student also created successfully");
														})
														.catch(function(err) {
															console.log(err);
														});
													// Student.findOrCreate({where: {and: [{GmailId: studentEmail}]}},studentRec)
													//   .then(function (student) {
													//     finalSub.StudentId = student[0].id;
													//     var studentsx = student[0].id;
													//     var studentsemail = student[0].GmailId;
													//     console.log('batch id ', batchid, 'student email ', studentsemail,
													//                 'studentid', studentsx );
													//   })
													//   .catch(function(err){
													//     console.log(err);
													//   });


												})
												.catch(function(err) {
													console.log(err);
												});
											break;
										case "Subscription":
											var Batchs = Batch;
											singleRec.studentid = singleRec.studentid.toLowerCase();
											var gmailId = singleRec.studentid.toLowerCase();
											var studentRec = {};
											studentRec.CreatedOn = getMyDate("20180101");
											studentRec.CreatedBy = "5c187035dba2681834ffe301";
											studentRec.ChangedOn = getMyDate("20180101");
											studentRec.ChangedBy = "5c187035dba2681834ffe301";
											studentRec.GmailId = singleRec.studentid.toLowerCase();
											studentRec.Name = "Auto CreatedSub";
											studentRec.CompanyMail = "null";
											studentRec.OtherEmail1 = "null";
											studentRec.OtherEmail2 = "null";
											studentRec.ContactNo = 0;
											studentRec.Country = "IN";
											studentRec.Designation = "null";
											studentRec.Star = false;
											studentRec.Defaulter = false;
											studentRec.HighServerUsage = false;
											studentRec.Skills = "null";
											studentRec.Resume = "null";
											studentRec.Extra1 = "null";
											studentRec.Extra2 = "null";
											if (!gmailId) {
												console.log("gmail id blank @ ", j.toString());
												continue;
											}
											Student.findOrCreate({
													where: {
														and: [{
															GmailId: gmailId
														}]
													}
												}, studentRec)
												.then(function(student) {
													if (student[0].GmailId) {
														var students = student[0].id;
														var studentsemail = student[0].GmailId.toLowerCase();
													}

													var singleRec1 = singleRec;
													var Sub = Subs;
													Batchs.findOne({
															"where": {
																"BatchNo": singleRec1.courseid
															}
														})
														.then(function(batch) {
															var batchid = batch.id;
															var newRec = {};
															newRec.StartDate = batch.StartDate;
															newRec.EndDate = batch.EndDate;
															newRec.PaymentDate = batch.StartDate;
															newRec.PaymentDueDate = batch.EndDate;
															newRec.StudentId = students.id;
															newRec.CourseId = batch.id;

															newRec.Mode = "L";
															newRec.PaymentMode = "IMPS";
															newRec.BankName = "null";
															newRec.AccountName = "null";
															newRec.Amount = singleRec.amount;
															newRec.Reference = "null";
															newRec.Remarks = "Auto Created ";
															if (singleRec1.remarks) {
																if (singleRec1.remarks === "X") {
																	newRec.Remarks = "Again WebIDE02: Auto Created ";
																}
															}
															newRec.PendingAmount = 0;
															newRec.Waiver = false;
															newRec.DropOut = singleRec.dropout;
															newRec.PaymentScreenshot = "null";
															newRec.PartialPayment = false;
															newRec.Extended = false;
															newRec.Extra1 = "null";
															newRec.Extra2 = "null";
															newRec.ExtraN1 = 0;
															newRec.ExtraN2 = 0;
															newRec.ExtraN3 = 0;
															newRec.UpdatePayment = false;
															newRec.MostRecent = true
															newRec.CreatedBy = "5c187035dba2681834ffe301";
															newRec.ChangedBy = "5c187035dba2681834ffe301";
															var studentsx = students;
															console.log('batch id ', batchid, 'student email ', studentsemail,
																'studentid', studentsx);
															newRec.StudentId = studentsx;
															newRec.CourseId = batchid;

															Sub.findOrCreate({
																	"where": {
																		"and": [{
																				"CourseId": batchid
																			},
																			{
																				"StudentId": studentsx
																			}
																		]
																	}
																}, newRec)
																.then(function(batch) {
																	console.log("created subscription successfully");
																})
																.catch(function(err) {
																	console.log(err);
																});

														})
														.catch(function(err) {
															console.log(err);
														});
												}).catch(function(err) {
													console.log(err);
												});
											break;

									}
								}

							});
						} catch (e) {
							console.log("error");
							res.json({
								error_code: 1,
								err_desc: "Corupted excel file"
							});
						}

					}
				})
			}
		);



	});
};


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
	if (err) throw err;

	// start the server if `$ node server.js`
	if (require.main === module)
		app.start();
});
