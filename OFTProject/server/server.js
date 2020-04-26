var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
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



				app.post('/requestMessage', function(req, res) {
					debugger;
					var msg = "";
					var typeMsg = req.body.msgType;
					switch (typeMsg) {
						case "inquiry":
							msg = "Dear #FirstName#, Greetings from www.anubhavtrainings.com, #COURSE# details sent to your email id, please write to us on install.abap@gmail.com.";
							msg = msg.replace("#COURSE#", req.body.courseName);
							break;
						case "courseapprove":
								msg = 'Dear #FirstName#, Greetings www.anubhavtrainings.com, your course details have been sent to your email id. mail us on install.abap@gmail.com for more queries';;
								break;
						case "courseextend":
								msg = "Dear #FirstName#, Greetings www.anubhavtrainings.com, the course is extended till #EXTENDDATE#. mail us on install.abap@gmail.com for more queries";
								msg = msg.replace("#EXTENDDATE#", req.body.extendDate);
							  break;
						default:
							return;

					}
						msg = msg.replace("#FirstName#", req.body.userName);
						var http = require('http');
						var urlencode = require('urlencode');
						msg=urlencode(msg);
						var number=req.body.Number;
						//var username='anubhav.abap@gmail.com';
						var username='anubhav.abap@gmail.com';
						var hash='faffa687d5142e5af59d8e892b9802651a63fd3185d4fdcc5aad716065320bf7'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
						//var hash = 'eef684d01be7535d39d7f409a1b8e888f874e9a05243b4fb3db2426f99aed5ba';
						//var sender='ONLTRN';
						var sender = "ONLTRN";
						var data='username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+number+'&message='+msg
						var options = {
				 				 host: 'api.textlocal.in',
					  	 	 path: '/send?'+data
						};
						callback = function(response) {
						  var str = '';
						  response.on('data', function (chunk) {
						  str += chunk;
						  });

						  //the whole response has been recieved, so we just print it out here
						  response.on('end', function () {
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

			// Courses.find().then(function(data) {
			// 	// console.log("Test Course")
			// 	aCourses = data;
			// 	aCources.courses.forEach(function(oRec) {
			// 		oSubCounter[oRec.courseName] = 0;
			// 	})
			//
			// 	Object.keys(oSubCounter).forEach(function(key) {
			//
			// 		var oCount = data.filter(function(oRec) {
			// 			return key === oRec.Name;
			// 		})
			//
			// 		responseData.push({
			// 			"CourseName": key,
			// 			"Count": oCount.length
			// 		})
			//
			// 	})
				//--- Calculate total per batch, prepare json and return
				var responseData = [];
				var oSubCounter = {};
				var Subs = app.models.Sub;
				var Account = app.models.Account;
				var AccountEntry = app.models.AccountBalance;

				var async = require('async');
				debugger;
				async.waterfall([
					function(callback) {
						Account.find({
						  fields:{
								"accountName": true,
								"accountNo": true,
								"ifsc": true,
								"current": true,
								"counter": true,
								"counterall": true,
								"key": true,
								"id":true
							}
						}).then(function(accountRecords){
								callback(null, accountRecords);
						});
					},
					function(accountRecords, callback) {
						// arg1 now equals 'one' and arg2 now equals 'two'
						var date = new Date("2020-04-01");
						date.setHours(0,0,0,0);
						AccountEntry.find({
							where: {
								and: [{
									CreatedOn: {
										gte: date
									}
								}]
							},
						  fields:{
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
						date.setHours(0,0,0,0);
						Subs.find({
							where: {
								and: [{
									PaymentDate: {
										gte: date
									}
								}]
							},
							fields:{
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
					debugger;
					try {
						var responseData = [];
						for (var i = 0; i < accountRecords.length; i++) {
							try {
								var totalAmount = 0, newDeposits = 0;
								for (var j = 0; j < accountBalances.length; j++) {

									if(accountBalances[j].AccountNo.toString() === accountRecords[i].accountNo.toString()){
										totalAmount
										= totalAmount +
											accountBalances[j].Amount;
									}

								}
								for (var k = 0; k < Records.length; k++) {
									if(Records[k].AccountName.toString() === accountRecords[i].accountNo.toString()){
										totalAmount
										= totalAmount +
											Records[k].Amount;
										newDeposits = Records[k].Amount + newDeposits;
									}

								}

								responseData.push({ "AccountNo": accountRecords[i].accountNo,
																		 "AccountName":  accountRecords[i].accountName + " - " + accountRecords[i].ifsc,
																		 "NewDeposit": newDeposits,
																		 "Amount": totalAmount,
																		 "current": accountRecords[i].current,
																		 "counter":accountRecords[i].counter,
																		 "counterall":accountRecords[i].counterall,
																		 "key":accountRecords[i].key,
																		 "id":accountRecords[i].id
								});
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

			Inquiry.find({})
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
			debugger;
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
					debugger;
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
			debugger;
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
					debugger;
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
							id:{
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
						Account.findOne({where: {
							accountNo: req.body.AccountNo
						}}).then(function(item) {
								if(item){
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
				app.post('/getAllForAccount',
						function(req, res) {
							var app = require('../server/server');
							var Sub = app.models.Sub;
							var date = new Date();
							date.setDate( date.getDate() - 7 );
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
								  fields:{
										"PaymentDate": true,
										"Amount": true,
										"Remarks": true
									}
								}
						).then(function(data) {
								res.send(data);
							});
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
							where:{
								current: true
							}
						})
							.then(function(allAc) {
								allAc = allAc.sort(function(a, b){
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

		app.post('/sendServerEmail',
			function(req, res) {
				var payload = req.body;
				var that = this;
				this.password = req.body.password;
				this.mailContent = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + 'server.html', 'utf8');
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
					var transporter = nodemailer.createTransport(smtpTransport({
						service: 'Godaddy',
						host: 'smtpout.secureserver.net',
						secureConnection: true,
						auth: {
							user: 'server@anubhavtrainings.com',
							pass: that.password
						}
					}));
					var Subject = "[CONFIDENTIAL] SAP Server Subscription";
					//https://myaccount.google.com/lesssecureapps?pli=1
					that.mailContent = that.mailContent.replace('$$Name$$', that.studentName)
					var ccs = ["install.abap@gmail.com"];
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
							if(error.code === "EAUTH"){
									res.status(500).send('Username and Password not accepted, Please try again.');
							}else{
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
				var nodemailer = require('nodemailer');
				var smtpTransport = require('nodemailer-smtp-transport');
				console.log(req.body);
				var transporter = nodemailer.createTransport(smtpTransport({
					service: 'gmail',
					host: 'smtp.gmail.com',
					auth: {
						user: 'install.abap@gmail.com',
						pass: req.body.password
					}
				}));
				var Subject = req.body.Subject;
				if (Subject === "" || Subject === "null") {
					Subject = req.body.CourseName + " training";
				}
				//https://myaccount.google.com/lesssecureapps?pli=1
				if (req.body.CourseName != "ABAP on HANA" && req.body.CourseName != "UI5 and Fiori" &&
					req.body.CourseName != "HANA XS" &&
					req.body.CourseName != "Launchpad" && req.body.CourseName != "Hybris C4C"
					&&  req.body.CourseName != "S4HANA Extension"
					&&  req.body.CourseName != "HANA Cloud Integration"
					&& req.body.CourseName != "SimpleLogistics"
					&& req.body.CourseName != "ABAP on Cloud"
					&& req.body.CourseName != "Google Blockly" && req.body.CourseName != "SimpleFinance") {
					req.body.CourseName = "Generic";

					if (Subject === "" || Subject === "null") {
						Subject = "[REPLY] Regarding SAP training";
					}
				}
				if (req.body.FirstName === "" || req.body.FirstName == "null") {
					req.body.FirstName = "Sir";
				}


				if(req.body.mailType === "" || req.body.FirstName == "null" || req.body.mailType === undefined){
					req.body.mailType = "R";
				}
				if(req.body.CourseName === "Generic"){
					req.body.CourseName = "Other";
				}

				var app = require('../server/server');
				var Template = app.models.Template;
				debugger;
				Template.findOne({
					where: {and: [{
													Type : req.body.mailType
												}, {
													CourseName: req.body.CourseName
												}]
					}
				}).then(function(data){
					//var contents = fs.readFileSync(process.cwd() + "\\server\\sampledata\\" + req.body.CourseName + '.html', 'utf8');
					debugger;
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
					}else if(req.body.mailType === "B"){
						//yet to code
						contents = contents.replace('$$BatchDate$$', data.FirstName);
						contents = contents.replace('$$BatchTime$$', data.FirstName);
						contents = contents.replace('$$DemoLink$$', data.DemoInvite);
						contents = contents.replace('%24%24DemoLink%24%24', data.DemoInvite);
						contents = contents.replace('$$NextClass$$', data.FirstName);
					}

					var result = req.body.FirstName.replace(/([A-Z])/g, " $1");
					req.body.FirstName = result.charAt(0).toUpperCase() + result.slice(1);
					contents = contents.replace('$$Name$$', req.body.FirstName)
					debugger;
					if(req.body.fees !== "null" && req.body.fees !== ""){
	 				 contents = contents.replace("$$fees$$", req.body.fees);
	  				 contents = contents.replace("$$currency$$", req.body.currency);
	 			  }
					var ccs = [];
					if(req.body.CourseName === "SimpleLogistics"){
							ccs.push("paramsaddy@gmail.com");
					}else if (req.body.CourseName === "SimpleFinance") {
						ccs.push("info@gaurav-consulting.com");
					}
					var mailOptions = {
						from: 'install.abap@gmail.com',
						to: req.body.EmailId, //req.body.EmailId    FirstName  CourseName
						cc: ccs,
						subject: 'Re: ' + Subject,
						html: contents
					};
					transporter.sendMail(mailOptions, function(error, info) {
						if (error) {
							console.log(error);
							if(error.code === "EAUTH"){
									res.status(500).send('Username and Password not accepted, Please try again.');
							}else{
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
					if(payload.includeX.indexOf("Renewal") !== -1){
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
								that2.mailContent = that2.mailContent.replace("<p>Additionally, google <a href=\"http://calendar.google.com\">calendar invite</a> is also sent to your email id.", "").replace("<em>Please note that, We have given you access of latest content (on going batch), So more videos will come as we progress with regular classes.</em>","");
								that2.mailContent = that2.mailContent.replace("<p>Additionally, google <a href='http://calendar.google.com'>calendar invite</a> is also sent to your email id. <em>Please note that it is an ongoing LIVE batch hence more videos will be added to the blog as and when course progress. You can cover the available videos and by that time you will get new videos</em>.</p>","");
							} else {
								that2.isCalRequire = true;
							}
							var nodemailer = require('nodemailer');
							var smtpTransport = require('nodemailer-smtp-transport');


							var transporter = nodemailer.createTransport(smtpTransport({
								service: 'Godaddy',
								host: 'smtpout.secureserver.net',
								secureConnection: true,
								auth: {
									user: 'no-reply@anubhavtrainings.com',
									pass: that.password
								}
							}));

							var Subject = "[Welcome Onboard] " + courseStr.Name + " Training Subscription";
							//https://myaccount.google.com/lesssecureapps?pli=1
							that2.mailContent = that2.mailContent.replace('$$Name$$', that2.studentName)
							var ccs = ["anubhav.abap@gmail.com"];
							if (that2.includeX === "true" || that2.includeX === "Renewal-true") {
								ccs.push("install.abap@gmail.com");
							}else if (that2.includeX === "Renewal") {
									//change content of the email here - anu
							}
							if(courseStr.Name === "Hybris C4C" ||
							courseStr.Name === "HANA Cloud Integration"){
									ccs.push("sam4dsouza@gmail.com");
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
									if(error.code === "EAUTH"){
											res.status(500).send('Username and Password not accepted, Please try again.');
									}else{
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

		app.post("/clearToken", function(req,res){

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
							CourseId : that.CourseId
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
								id : {inq : studentsOfBatch}
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
									if(allStudents[j].id.toString() === that3.allSubscriptions[i].StudentId.toString()){
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
											PendingAmount : that3.allSubscriptions[i].PendingAmount,
											MostRecent : that3.allSubscriptions[i].MostRecent
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
							where: {and: [{
								CourseId : that.CourseId
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
								where:  {
									//student belongs to this courses
									id : {inq : studentsOfBatch}
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
										if(allStudents[j].id.toString() === that3.allSubscriptions[i].StudentId.toString()){
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
												PendingAmount : that3.allSubscriptions[i].PendingAmount,
												MostRecent : that3.allSubscriptions[i].MostRecent
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
						where: { and: [{
							CourseId : that.CourseId
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
								id : {inq : studentsOfBatch}
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
															function(err){

															}
														);
													},
													function _function0 (items, callback) {
														var fileId = that3.DriveId;
														var permissions = [];
														for (var i = 0; i < items.length; i++) {
															if(items[i].role !== "owner"){
																	permissions.push(items[i].id);
															}
														}
														async.eachSeries(permissions, function (permission, permissionCallback) {
															drive.permissions.delete({
																fileId : fileId,
																permissionId: permission,
																sendNotificationEmail: false
															}, function (err, res) {
														    if (err) {
														      // Handle error...
														      console.error(err);
														      permissionCallback(err);
														    } else {
														      //console.log('Permission ID: ', res.id)
														      permissionCallback();
														    }
														  });
														}, function (err) {
														  if (err) {
														    // Handle error
																console.log("Deletion of permission failed");
																callback (err, null, null);
														  } else {
														    // All permissions inserted
																console.error("All permissions deleted");
																callback (null, null, null);
														  }
														});

													},
													function _function1 (oErr, args2, callback) {

														var fileId = that3.DriveId;
														var permissions = [];
														for (var i = 0; i < allStudents.length; i++) {
															var perms =
															  {
															    'type': 'user',
															    'role': 'reader',
															    'emailAddress': allStudents[i].GmailId
															  };
														  permissions.push(perms);
														}
														// Using the NPM module 'async'
														async.eachSeries(permissions, function (permission, permissionCallback) {
														  drive.permissions.create({
														    resource: permission,
														    fileId: fileId,
																sendNotificationEmail: false
														    //fields: 'id',
														  }, function (err, res) {
														    if (err) {
														      // Handle error...
														      console.error(err);
														      permissionCallback(err);
														    } else {
														      //console.log('Permission ID: ', res.id)
														      permissionCallback();
														    }
														  });
														}, function (err) {
														  if (err) {
														    // Handle error
														    console.error(err);
																callback (err, null , null, null);
														  } else {
														    // All permissions inserted
																console.log("All permissions inserted ");
																callback (null, null , null, null);
														  }
														});
													},
													function _function2(oErr, args2, args3, args4, callback){

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
									    ], function (error) {
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

						debugger;
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
					debugger;
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
					}else{
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
								debugger;
								console.log("created successfully");
							})
							.catch(function(err) {
								console.log(err);
							});
					}}
			);


		});
		app.post('/upload',
			function(req, res) {
debugger;
				if (!req.files.myFileUpload) {
					res.send('No files were uploaded.');
					return;
				}

				var sampleFile;
				var exceltojson;

				sampleFile = req.files.myFileUpload;
				var createdBy = req.body.createdBy;
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
														debugger;
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
														debugger;
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
														debugger;
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
													debugger;
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
													debugger;
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
											var newRec ={};
											newRec.EmailId = singleRec.email.toLowerCase();
											if (singleRec.url.indexOf("abap-on-hana-training") !== -1) {
 												singleRec.url = "ABAP on HANA";
												if (singleRec.country_code === "IN") {
													newRec.fees = "18 k";
													newRec.currency = "INR";
												}else{
													newRec.fees = "350";
													newRec.currency = "USD";
												}
											}else if (singleRec.url.indexOf("abap-on-cloud-training") !== -1){
 												singleRec.url = "ABAP on Cloud";
												if (singleRec.country_code === "IN") {
													newRec.fees = "15 k";
													newRec.currency = "INR";
												}else{
													newRec.fees = "280";
													newRec.currency = "USD";
												}
											}else if (singleRec.url.indexOf("hana-cloud-integration-training") !== -1){
 												singleRec.url = "HANA Cloud Integration";
												if (singleRec.country_code === "IN") {
													newRec.fees = "22 k";
													newRec.currency = "INR";
												}else{
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											}else if (singleRec.url.indexOf("launchpad") !== -1){
 												singleRec.url = "Launchpad";
												if (singleRec.country_code === "IN") {
													newRec.fees = "25 k";
													newRec.currency = "INR";
												}else{
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											}else if (singleRec.url.indexOf("hybris-c4c-training") !== -1){
 												singleRec.url = "Hybris C4C";
												if (singleRec.country_code === "IN") {
													newRec.fees = "22 k";
													newRec.currency = "INR";
												}else{
													newRec.fees = "400";
													newRec.currency = "USD";
												}
											}else{
 												singleRec.url = "UI5 and Fiori";
												if (singleRec.country_code === "IN") {
													newRec.fees = "18 k";
													newRec.currency = "INR";
												}else{
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
													debugger;
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
											// 		debugger;
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
											// 			debugger;
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
															debugger;
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
															debugger;
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
