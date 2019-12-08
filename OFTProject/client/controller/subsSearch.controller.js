var oTableData;
var course_id;
var course_Guid;
var student_id;
var SubId_upd;
var part_pay;
var subsId;
var portClicked = false;
sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, FilterOperator, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.subsSearch", {
			formatter: Formatter,
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf oft.fiori.view.View2
			 */
			onInit: function() {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.attachRoutePatternMatched(this.herculis, this);
				this.totalCount = 0;
				var currentUser = this.getModel("local").getProperty("/CurrentUser");
				loginUser = "Hey " + loginUser;
				if (currentUser) {
					var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				}
				this.getView().byId("idUser").setText(loginUser);

				var oModelJsonCC = new sap.ui.model.json.JSONModel();


				//var oModelJsonCC = new sap.ui.model.json.JSONModel();
				var oCourseModel = this.getOwnerComponent().getModel();
				oCourseModel.read('/Courses', {
					success: function(oData, response) {
						oModelJsonCC.setData(oData);
					},
					error: function(response) {}
				});

				var oSubsModel = this.getOwnerComponent().getModel();
				oSubsModel.read('/Subs', {
					success: function(oData, response) {
						//oModelJsonCC.setData(oData);

						oTableData = oData;
					},
					error: function(response) {}
				});

				var that = this;
				if (!this._oResponsivePopover) {
					this._oResponsivePopover = sap.ui.xmlfragment("oft.fiori.fragments.sorterFilter", this);
					this._oResponsivePopover.setModel(this.getView().getModel());
				}
				var iTable = this.getView().byId("manageSubsTable");
				iTable.addEventDelegate({
					onAfterRendering: function() {
						var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
						for (var i = 0; i < oHeader.length; i++) {
							var oID = oHeader[i].id;
							that.onClick(oID);
						}
					}
				}, iTable);

			},
			onGiveAccess: function(oEvent) {
				var that = this;
				var items = that.getView().byId('manageSubsTable').getSelectedContexts();

				for (var i = 0; i < items["length"]; i++) {

					var loginPayload = items[i].getModel().getProperty(items[i].getPath());
					debugger;
					$.post('/giveAccess', loginPayload)
						.done(function(data, status) {
							sap.m.MessageToast.show("Access has been provided");
						})
						.fail(function(xhr, status, error) {
							sap.m.MessageBox.error("Error in access");
						});
				}
			},
			passwords: "",
			onRefresh: function(){
				this.onUpdateFinished();
			},
			triggerUpdate: function(id, payload){
				var that = this;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				 id, "PUT", {}, payload, this)
					.then(function(oData) {
							MessageToast.show("Update Successful");
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
			},
			onClearDue: function(oEvent){
				debugger;
				var that = this;
				var items = that.getView().byId('manageSubsTable').getSelectedContexts();
				for (var i = 0; i < items["length"]; i++) {
					this.triggerUpdate(items[i].sPath,{"PartialPayment": "false","PendingAmount":0});
				}
			},
			onRecent: function(oEvent){
				var that = this;
				var items = that.getView().byId('manageSubsTable').getSelectedContexts();
				for (var i = 0; i < items["length"]; i++) {
					this.triggerUpdate(items[i].sPath,{"MostRecent": "true"});
				}
			},
			onClearToken: function(){
				$.post('/clearToken')
					.done(function(data, status) {
						sap.m.MessageToast.show("Token is now reset");
					})
					.fail(function(xhr, status, error) {
						sap.m.MessageBox.error("Error in access");
					});
			},
			onSendEmail: function(oEvent) {
				var that = this;
				var items = that.getView().byId('manageSubsTable').getSelectedContexts();

				for (var i = 0; i < items["length"]; i++) {

					var loginPayload = items[i].getModel().getProperty(items[i].getPath());
					debugger;
					var that = this;
					var payload3 = {
						"Status": "Access Granted"
					};
					if (this.passwords === "") {
						this.passwords = prompt("Please enter your password", "");
						if (this.passwords === "") {
							sap.m.MessageBox.error("Blank Password not allowed");
							return;
						}
					}
					loginPayload.password = that.passwords;
					loginPayload.includeX = "Renewal-" + that.getView().byId("includeX").getSelected();


					$.post('/sendSubscriptionEmail', loginPayload)
						.done(function(data, status) {
							sap.m.MessageToast.show("Email sent successfully");
						})
						.fail(function(xhr, status, error) {
							that.passwords = "";
							sap.m.MessageBox.error(xhr.responseText);
						});
				}

			},
			herculis: function(oEvent) {

				if(oEvent.getParameter("name") !== "subsSearch"){
					return;
				}
				var oView = this.getView();
				var oTable = oView.byId("manageSubsTable");

				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath1 = "CreatedOn";
				var bDescending = true;
				aSorters.push(new sap.ui.model.Sorter(sPath1, bDescending));
				oBinding.sort(aSorters);
				//Restore the state of UI by fruitId
				//this.getView().getModel("local").setProperty("/newLead/date", this.formatter.getFormattedDate(0));
				//	this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", this.formatter.getFormattedDate(0));
				//	this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", this.formatter.getFormattedDate(0));
				this.initAccounts();
			},
			initAccounts: function() {

				var oLocalModel = this.getView().getModel("local");
				var that = this;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Accounts", "GET", {}, {}, this)
					.then(function(data, controller) {
						var allAccounts = [];
						for (var i = 0; i < data.results.length; i++) {
							allAccounts.push({
								"key": data.results[i].accountNo,
								"value": data.results[i].accountName + " " + data.results[i].ifsc,
								"deleted": data.results[i].deleted
							})
						}
						oLocalModel.setProperty("/accountSet", allAccounts);
					});
			},

			onClick: function(oID) {
				var that = this;
				$('#' + oID).click(function(oEvent) { //Attach Table Header Element Event
					var oTarget = oEvent.currentTarget; //Get hold of Header Element
					var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
					var oIndex = oTarget.id.slice(-1); //Get the column Index
					var oView = that.getView();
					var oTable = oView.byId("manageSubsTable");
					// var oModel = oTable.getModel().getProperty("/Subs"); //Get Hold of Table Model Values
					var oModel = oTable.mAggregations.items;
					var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
					oView.getModel().setProperty("/bindingValue", oKeys[oIndex]); //Save the key value to property
					oView.getModel().setProperty("/bindingValue", "PartialPayment"); //Save the key value to property
					that._oResponsivePopover.openBy(oTarget);
				});
			},

			onChange: function(oEvent) {
				var oValue = oEvent.getParameter("value");
				var oMultipleValues = oValue.split(",");
				var oTable = this.getView().byId("manageSubsTable");
				var oBindingPath = this.getView().getModel().getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
				var aFilters = [];
				for (var i = 0; i < oMultipleValues.length; i++) {
					var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
					aFilters.push(oFilter)
				}
				var oItems = oTable.getBinding("items");
				oItems.filter(aFilters, "Application");
				this._oResponsivePopover.close();
			},

			onAscending: function() {
				// debugger;
				var oTable = this.getView().byId("manageSubsTable");
				var oItems = oTable.getBinding("items");
				var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
				var oSorter = new Sorter(oBindingPath);
				oItems.sort(oSorter);
				this._oResponsivePopover.close();
			},

			onDescending: function() {
				var oTable = this.getView().byId("manageSubsTable");
				var oItems = oTable.getBinding("items");
				var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
				var oSorter = new Sorter(oBindingPath, true);
				oItems.sort(oSorter);
				this._oResponsivePopover.close();
			},

			onOpen: function(oEvent) {
				//On Popover open focus on Input control
				var oPopover = sap.ui.getCore().byId(oEvent.getParameter("id"));
				var oPopoverContent = oPopover.getContent()[0];
				var oCustomListItem = oPopoverContent.getItems()[2];
				var oCustomContent = oCustomListItem.getContent()[0];
				var oInput = oCustomContent.getItems()[1];
				oInput.focus();
				oInput.$().find('.sapMInputBaseInner')[0].select();
			},

			// onupdateStarted: function(oEvent) {
			// 	debugger;
			// 	var oTable = this.getView().byId("manageSubsTable");
			// 	var oBinding = oTable.getBinding("items");
			// },
			onUpdateFinished: function(oEvent) {
				// debugger;
				var sTitle = "Payment Records";
				var oTable = this.getView().byId("manageSubsTable");
				var itemList = oTable.getItems();
				var noOfItems = itemList.length;
				for (var i = 0; i < noOfItems; i++) {
					var vCourse = itemList[i].getCells()[2].getText();
					var oCourseId = 'Courses(\'' + vCourse + '\')';
					var oModel = this.getView().getModel().oData[oCourseId];
					if (oModel) {
						var CourseName = oModel.BatchNo + ': ' + oModel.Name; //got the course anme from screen
						itemList[i].getCells()[2].setText(CourseName);
					}
					var vStudent = itemList[i].getCells()[0].getText();
					var oStudentId = 'Students(\'' + vStudent + '\')';
					debugger;
					var vModel = this.allStudnets[vStudent];
					if (vModel) {
						var StudMail = vModel.GmailId;
						itemList[i].getCells()[0].setText(StudMail);
					}
				}

				if (oTable.getBinding("items").isLengthFinal()) {
					var iCount = oEvent.getParameter("total");
					if ((this.totalCount === 0) || (this.totalCount < iCount)) {
						this.totalCount = iCount;
					}
					var iItems = oTable.getItems().length;
					sTitle += "(" + iItems + "/" + this.totalCount + ")";
				}
				this.getView().byId("titletext").setText(sTitle);
			},

			onTableSettings: function(oEvent) {
				// Open the Table Setting dialog
				this._oDialog = sap.ui.xmlfragment("oft.fiori.fragments.subsSearchSettingsDialog", this);
				this._oDialog.open();
			},

			onPartPaySearch: function(oEvent) {
				var queryString = this.getQuery(oEvent);
				if (queryString) {
					var oFilter1;
					var oFilter2;
					if ((queryString === "true") || (queryString === "false")) {
						oFilter1 = new sap.ui.model.Filter("PartialPayment", sap.ui.model.FilterOperator.EQ, queryString);
						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1],
							and: false
						});
						var aFilter = [oFilter];
						this.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
					} else {
						this.getView().byId("manageSubsTable").getBinding("items").filter([]);
					}
				} else {
					this.getView().byId("manageSubsTable").getBinding("items").filter([]);
				}
			},

			onStuSearch: function(oEvent) {

				debugger;
				this.dateString1 = this.getView().byId("idBatchEndate");
				if (this.dateString1._lastValue != false) {
					var from = this.dateString1._lastValue.split(".");
					var newDate = new Date(from[2], from[1] - 1, from[0]);

					newDate.setHours(0, 0, 0, 0);
					this.oFilter_date1 = new sap.ui.model.Filter("EndDate", "GE", newDate);
				} else {
					this.oFilter_date1 = new sap.ui.model.Filter();
				}



				this.CourseString = this.getView().byId("idCourseSearch").getValue();

				var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

				// var queryString = oEvent.getParameters().newValue;// -For onLiveSearch
				// var queryString = this.getQuery(oEvent);
				var queryString = this.getQuery(oEvent);

				if (queryString) {
					var oFilter1;
					var oFilter2;
					if (regEx.test(queryString)) {

						var that = this;
						var payload = {};
						var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", queryString);

						this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
								filters: [Filter1]
							}, payload, this)
							.then(function(oData) {
								var that2 = that;
								debugger;
								that.aFilter2 = [new sap.ui.model.Filter("StudentId", "EQ", "'" + oData.results[0].id + "'")];

								if (that.dateString1._lastValue != false) {
									that.aFilter2.push(that.oFilter_date1);
								}

								var vKey = that.getView().byId("idPendingPayment").getSelectedKey();
								if (vKey === "true") {
									var oFilter1 = new sap.ui.model.Filter("PendingAmount", "GT", 0);
									that.aFilter2.push(oFilter1);
									// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter1]);
								} else if (vKey === "false") {
									var oFilter2 = new sap.ui.model.Filter("PendingAmount", "EQ", 0);
									that.aFilter2.push(oFilter2);
									// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter2]);
								}


								// that.getView().byId("manageSubsTable").getBinding("items").filter(that.aFilter2);

								if (that.CourseString) {
									var payload = {};
									var Filter1 = new sap.ui.model.Filter("Name", "EQ", that.CourseString);

									that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Courses", "GET", {
											filters: [Filter1]
										}, payload, that)
										.then(function(oData) {
											// var that2 = that;
											if (oData.results.length > 0) {
												var oFilter;
												debugger;
												for (var i = 0; i < oData.results.length; i++) {
													oFilter = new sap.ui.model.Filter("CourseId", "EQ", "'" + oData.results[i].id + "'");
													that2.aFilter2.push(oFilter);
												}

												// if (that2.dateString1._lastValue != false) {
												// 	that2.aFilter2.push(that2.oFilter_date1);
												// }
												that.getView().byId("manageSubsTable").getBinding("items").filter(that2.aFilter2);
											}
										}).catch(function(oError) {
											debugger;
										});
								} else {
									// if (that.dateString1._lastValue != false) {
									// 	that.aFilter2.push(that.oFilter_date1);
									// }
									that.getView().byId("manageSubsTable").getBinding("items").filter(that.aFilter2);
								}

							}).catch(function(oError) {
								debugger;
							});

					} else {
						this.getView().byId("manageSubsTable").getBinding("items").filter([]);
					}
				} else {
					this.getView().byId("manageSubsTable").getBinding("items").filter([]);
				}
			},

			onCourseSearch: function(oEvent) {

				debugger;
				this.dateString = this.getView().byId("idBatchEndate");
				if (this.dateString._lastValue != false) {
					var from = this.dateString._lastValue.split(".");
					var newDate = new Date(from[2], from[1] - 1, from[0]);

					newDate.setHours(0, 0, 0, 0);
					this.oFilter_date = new sap.ui.model.Filter("EndDate", "GE", newDate);
				} else {
					this.oFilter_date = new sap.ui.model.Filter();
				}

				this.StuString = this.getView().byId("idStuSearch").getValue();

				var queryString = this.getQuery(oEvent);

				if (queryString) {
					var that = this;
					var payload = {};
					var Filter1 = new sap.ui.model.Filter("Name", "EQ", queryString);
					//var Filter2 = new sap.ui.model.Filter("BatchNo", "EQ", queryString);
					var qString1 = queryString;
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Courses", "GET", {
							filters: [Filter1]
						}, payload, this)
						.then(function(oData) {
							var qString2 = qString1;
							// var that2 = that;
							if (oData.results.length > 0) {
								// var aFilter = [];
								that.aFilter1 = [];

								var vKey = that.getView().byId("idPendingPayment").getSelectedKey();
								if (vKey === "true") {
									var oFilter1 = new sap.ui.model.Filter("PendingAmount", "GT", 0);
									that.aFilter1.push(oFilter1);
									// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter1]);
								} else if (vKey === "false") {
									var oFilter2 = new sap.ui.model.Filter("PendingAmount", "EQ", 0);
									that.aFilter1.push(oFilter2);
									// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter2]);
								}


								var oFilter;
								debugger;
								for (var i = 0; i < oData.results.length; i++) {
									oFilter = new sap.ui.model.Filter("CourseId", "EQ", "'" + oData.results[i].id + "'");
									that.aFilter1.push(oFilter);
								}

								if (that.dateString._lastValue != false) {
									that.aFilter1.push(that.oFilter_date);
								}
								// that.getView().byId("manageSubsTable").getBinding("items").filter(that.aFilter1);

								var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


								if (regEx.test(that.StuString)) {

									var that2 = that;
									var payload = {};
									var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", that.StuString);

									that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Students", "GET", {
											filters: [Filter1]
										}, payload, that)
										.then(function(oData) {
											// var that2 = that;
											debugger;
											var stuFilter = new sap.ui.model.Filter("StudentId", "EQ", "'" + oData.results[0].id + "'");

											that2.aFilter1.push(stuFilter);

											that2.getView().byId("manageSubsTable").getBinding("items").filter(that2.aFilter1);
										}).catch(function(oError) {
											debugger;
										});
								} else {

									that.getView().byId("manageSubsTable").getBinding("items").filter(that.aFilter1);
								}


							} else {
								debugger;
								var that2 = that;
								var Filter2 = new sap.ui.model.Filter("BatchNo", "EQ", qString2);
								that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Courses", "GET", {
										filters: [Filter2]
									}, null, that)
									.then(function(oData) {
										if (oData.results.length > 0) {
											var aFilter = [new sap.ui.model.Filter("CourseId", "EQ", "'" + oData.results[0].id + "'")];
											if (that2.dateString._lastValue != false) {
												aFilter.push(that2.oFilter_date);
											}
											that2.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
										}
									}).catch(function(oError) {
										debugger;
									});
							}

						}).catch(function(oError) {
							debugger;
						});

				} else {
					if (this.dateString._lastValue != false) {
						this.getView().byId("manageSubsTable").getBinding("items").filter([this.oFilter_date]);
					} else {
						this.getView().byId("manageSubsTable").getBinding("items").filter([]);
					}
				}
			},

			onChangePendingPay: function(oEvent) {
				var vKey = oEvent.getSource().getSelectedKey();
				if (vKey === "true") {
					var oFilter1 = new sap.ui.model.Filter("PendingAmount", "GT", 0);
					this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter1]);
				} else if (vKey === "false") {
					var oFilter2 = new sap.ui.model.Filter("PendingAmount", "EQ", 0);
					this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter2]);
				} else {
					this.getView().byId("manageSubsTable").getBinding("items").filter([]);
				}

			},

			onTabSearch: function(oEvent) {
				debugger;
				var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

				// var queryString = oEvent.getParameters().newValue;// -For onLiveSearch
				// var queryString = this.getQuery(oEvent);
				var queryString = this.getQuery(oEvent);

				if (queryString) {
					var oFilter1;
					var oFilter2;
					if ((queryString === "true") || (queryString === "false")) {
						oFilter1 = new sap.ui.model.Filter("PartialPayment", sap.ui.model.FilterOperator.EQ, queryString);
						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1],
							and: false
						});
						var aFilter = [oFilter];
						this.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
					} else {
						if (regEx.test(queryString)) {

							var that = this;
							var payload = {};
							var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", queryString);

							this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
									filters: [Filter1]
								}, payload, this)
								.then(function(oData) {
									// var that2 = that;
									debugger;
									var aFilter = [new sap.ui.model.Filter("StudentId", "EQ", "'" + oData.results[0].id + "'")];

									that.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);

									// var oItemTemplate = new sap.m.ColumnListItem({
									// 	cells: [
									// 		new sap.m.Text({text: "{StudentId}",modelContextChange:"onStudentIdChange"}),
									// 		new sap.m.Text({text: "{CourseId}"}),
									// 		new sap.m.Text({text: "{PaymentDate}"}),
									// 		new sap.m.Text({text: "{PaymentDueDate}"}),
									// 		new sap.m.CheckBox({selected: "{PartialPayment}"})
									// 	]
									// });
									// that.getView().byId("manageSubsTable").bindAggregation("items", {
									//   path: "/Subs",
									//   template: oItemTemplate,
									//   filters: aFilter
									//   });
								}).catch(function(oError) {
									debugger;
								});

						} else {
							//oFilter1 = new sap.ui.model.Filter("StudentId", sap.ui.model.FilterOperator.Contains, queryString);

							var that = this;
							var payload = {};
							var Filter1 = new sap.ui.model.Filter("Name", "EQ", queryString);
							//var Filter2 = new sap.ui.model.Filter("BatchNo", "EQ", queryString);
							var qString1 = queryString;
							this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Courses", "GET", {
									filters: [Filter1]
								}, payload, this)
								.then(function(oData) {
									var qString2 = qString1;
									// var that2 = that;
									if (oData.results.length > 0) {
										var aFilter = [];
										var oFilter;
										debugger;
										for (var i = 0; i < oData.results.length; i++) {
											oFilter = new sap.ui.model.Filter("CourseId", "EQ", "'" + oData.results[i].id + "'");
											aFilter.push(oFilter);
										}
										that.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
									} else {
										debugger;
										var that2 = that;
										var Filter2 = new sap.ui.model.Filter("BatchNo", "EQ", qString2);
										that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Courses", "GET", {
												filters: [Filter2]
											}, null, that)
											.then(function(oData) {
												if (oData.results.length > 0) {
													var aFilter = [new sap.ui.model.Filter("CourseId", "EQ", "'" + oData.results[0].id + "'")];
													that2.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
												}
											}).catch(function(oError) {
												debugger;
											});
									}

								}).catch(function(oError) {
									debugger;
								});
						}

					}
				} else {
					debugger;
					this.getView().byId("manageSubsTable").getBinding("items").filter([]);
				}

			},
		onClearSearchFilter: function(oEvent) {
			var aFilter = [];
			this.getView().byId("idBatchEndate").setValue(null);
			this.getView().byId("idStuSearch").setValue(null);
			this.getView().byId("idCourseSearch").setValue(null);
			this.getView().byId("idPartPaySearch").setSelectedKey(null);
			this.getView().byId("idPendingPayment").setSelectedKey(null);
			this.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
		},
			onConfirmSetting: function(oEvent) {
				debugger;
				var oView = this.getView();
				var oTable = oView.byId("manageSubsTable");
				var mParams = oEvent.getParameters();
				var oBinding = oTable.getBinding("items");
				// apply grouping
				var aSorters = [];
				if (mParams.groupItem) {
					var sPath = mParams.groupItem.getKey();
					var bDescending = mParams.groupDescending;
					var vGroup = function(oContext) {
						var name = oContext.getProperty("StudentId");
						return {
							key: name,
							text: name
						};
					};
					aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

				}
				//apply sorter
				var sPath1 = mParams.sortItem.getKey();
				var bDescending = mParams.sortDescending;
				aSorters.push(new sap.ui.model.Sorter(sPath1, bDescending));
				oBinding.sort(aSorters);


				// apply filters
				// var aFilters = [];
				// for (var i = 0, l = mParams.filterItems.length; i < l; i++) {
				// 	var oItem = mParams.filterItems[i];
				// 	var aSplit = oItem.getKey().split("___");
				// 	var sPath2 = aSplit[0];
				// 	var vOperator = aSplit[1];
				// 	var vValue1 = aSplit[2];
				// 	var vValue2 = aSplit[3];
				// 	var oFilter = new sap.ui.model.Filter(sPath2, vOperator, vValue1, vValue2);
				// 	aFilters.push(oFilter);
				// }
				// oBinding.filter(aFilters);
			},

			onSwitchToggle: function(oEvent) {
				debugger;
				var oSwitch = oEvent.getSource().getState();

				var queryString = this.getQuery(oEvent);
				if (oSwitch === true) {
					var oFilter1 = new sap.ui.model.Filter("MostRecent", "EQ", true);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1],
						and: false
					});
					var aFilter = [oFilter];
					this.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);
				} else {
					var vFilter1 = new sap.ui.model.Filter("MostRecent", "EQ", true);
					var vFilter2 = new sap.ui.model.Filter("MostRecent", "EQ", false);

					var vFilter = new sap.ui.model.Filter({
						filters: [vFilter1, vFilter2],
						and: false
					});
					var arFilter = [vFilter];
					this.getView().byId("manageSubsTable").getBinding("items").filter(arFilter);

				}

			},

			onDelete: function(oEvent) {
				var that = this;
				MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
					if (conf == 'OK') {
						var items = that.getView().byId('manageSubsTable').getSelectedContexts();
						that.totalCount = that.totalCount - items.length;
						for (var i = 0; i < items["length"]; i++) {
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath, "DELETE", {}, {}, that)
								.then(function(oData) {
									sap.m.MessageToast.show("Deleted succesfully");
								}).catch(function(oError) {
									that.getView().setBusy(false);
									that.oPopover = that.getErrorMessage(oError);
									that.getView().setBusy(false);
								});

						}
					}
				}, "Confirmation");

			},

			formatRowHighlight: function(oValue) {
				// Your logic for rowHighlight goes here
				if (oValue === true) {
					return "Error";
				} else if (oValue == false) {
					return "Success";
				}
			},

			onBack: function() {
				sap.ui.getCore().byId("idApp").to("idView1");
			},

			onStudentIdChange: function(oEvent) {
				// debugger;
				var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
				sPath = sPath.split("/")[1];
				var oStudentId = this.getView().getModel().oData[sPath].StudentId;
				oStudentId = 'Students(\'' + oStudentId + '\')';
				var oModel = this.getView().getModel().oData[oStudentId];
				if (oModel) {
					var GmailId = oModel.GmailId;
					oEvent.getSource().setText(GmailId);
				} else {
					var GmailId1 = "Email Not Found";
					oEvent.getSource().setText(GmailId1);
				}
			},
			// onCourseIdChange: function(oEvent) {
			// 	debugger;
			// 	var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
			// 	sPath = sPath.split("/")[1];
			// 	var oCourseId = this.getView().getModel().oData[sPath].CourseId;
			// 	oCourseId = 'Courses(\'' + oCourseId + '\')';
			// 	var oModel = this.getView().getModel().oData[oCourseId];
			// 	if (oModel) {
			// 		var vBatchNo = oModel.BatchNo + ': ' + oModel.Name;
			// 		oEvent.getSource().setText(vBatchNo);
			// 	} else {
			// 		var CourseName1 = "Course Not Found";
			// 		oEvent.getSource().setText(CourseName1);
			// 	}
			// },

			doReload: function(aFilters) {
				var oTable = this.byId("manageSubsTable");
				var oBinding = oTable.getBinding("items");
				oBinding.filter(aFilters);
			},

			onResetFilter: function(oEvent) {
				var sMessage = "onReset trigered";
				MessageToast.show(sMessage);
				this.doReload();
			},

			onSearchFilter: function(oEvent) {
				// debugger;
				// var sMessage = "onSearch trigered";
				// MessageToast.show(sMessage);
				var oFilter = oEvent.getSource().getFilterItems();

				//var aFilters = this.getView().byId("idFilterBar").getFilters();
				//   this.getView().byId("manageSubsTable").getBinding("items").filter(oFilter);
				var oFB = this.getView().byId("idFilterBar");
				var a = oFB.determineFilterItemByName("PaymentDate");
				var b = oFB.determineFilterItemByName("PaymentDueDate");
				var c = oFB.determineFilterItemByName("PartialPayment");

			},
			onClearFilter: function(oEvent) {
				var sMessage = "onClear trigered";
				MessageToast.show(sMessage);
			},

			onLiveSearch: function(oEvent) {
				debugger;
				var queryString = oEvent.getParameter("query");
				if (!queryString) {
					queryString = oEvent.getParameter("value");
				}

				if (this.sId.indexOf("idbatchId") !== -1) {

					if (queryString) {
						var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
						var oFilter2 = new sap.ui.model.Filter("BatchNo", sap.ui.model.FilterOperator.Contains, queryString);

						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1, oFilter2],
							and: false
						});
						var aFilter = [oFilter];
						this.searchPopup.getBinding("items").filter(aFilter);
					} else {
						this.searchPopup.bindAggregation("items", {
							path: "/Courses",
							template: new sap.m.DisplayListItem({
								label: "{Name}",
								value: "{BatchNo}"
							})
						});
						this.searchPopup.getBinding("items").filter([]);
						var oBinding = this.searchPopup.getBinding("items");
						var aSorters = [];
						var sPath1 = "EndDate";
						var bDescending = true;
						aSorters.push(new sap.ui.model.Sorter(sPath1, bDescending));
						oBinding.sort(aSorters);
					}
				} else if (this.sId.indexOf("accountDetails") !== -1) {
					if (queryString) {
						var oFilter1 = new sap.ui.model.Filter("value", sap.ui.model.FilterOperator.Contains, queryString);
						var oFilter2 = new sap.ui.model.Filter("key", sap.ui.model.FilterOperator.Contains, queryString);

						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1, oFilter2],
							and: false
						});
						var aFilter = [oFilter];
						this.searchPopup.getBinding("items").filter(aFilter);
					} else {
						this.searchPopup.bindAggregation("items", {
							path: "local>/accountSet",
							template: new sap.m.DisplayListItem({
								label: "{local>value}",
								value: "{local>key}"
							})
						});
						this.searchPopup.getBinding("items").filter([]);
					}
				}
			},

			onSearch: function(oEvent) {
				debugger;
				if (this.sId.indexOf("idbatchId") !== -1) {
					var queryString = this.getQuery(oEvent);
					if (queryString) {
						var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
						var oFilter2 = new sap.ui.model.Filter("BatchNo", sap.ui.model.FilterOperator.Contains, queryString);

						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1, oFilter2],
							and: false
						});
						var aFilter = [oFilter];
						this.searchPopup.getBinding("items").filter(aFilter);
					} else {
						this.searchPopup.bindAggregation("items", {
							path: "/Courses",
							template: new sap.m.DisplayListItem({
								label: "{Name}",
								value: "{BatchNo}"
							})
						});
						this.searchPopup.getBinding("items").filter([]);
					}
				}

			},
			onSearchSmart: function(oEvent) {
				// debugger;
				var aData = this.getView().byId("smartFilterBar").getFilterData();
				var aFilters = this.getView().byId("smartFilterBar").getFilters();
				this.getView().byId("manageSubsTable").getBinding("items").filter(aFilters);
				//
				// var allItems = oEvent.getParameters()[0].selectionSet;
				// // console.log(allItems);
				// for (var int = 0; int < allItems.length; int++) {
				// 	if (allItems[int]._$input[0].className.search("Combo") != -1) {
				// 		if (allItems[int].getValue() != "") {
				// 			return true;
				// 		}
				// 	} else {
				// 		if (allItems[int].getValue() != "" || allItems[int].getTokens().length >= 1) {
				// 			return true;
				// 		}
				// 	}
				//
				// }
				// var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				// sap.m.MessageBox.error(
				// 	"Please enter data into at least one field before continuing", {
				// 		styleClass: bCompact ? "sapUiSizeCompact" : ""
				// 	}
				// );
				// return false;
			},

			// onBeforeExport: function(oEvt) {
			// 	debugger;
			// 	var mExcelSettings = oEvt.getParameter("exportSettings");
			// 	// GW export
			// 	if (mExcelSettings.url) {
			// 		return;
			// 	}

			//var listOfItems = oEvt.oSource._oTable.getItems();
			//var numberOfItems = listOfItems.length;
			//var listOfColumns = oEvt.oSource._oTable.mAggregations.columns;
			//var numberOfColumns = listOfColumns.length;

			//get the contente of table in a local model using for loop:
			//oEvt.oSource._oTable.mAggregations.items[0].mAggregations.cells[0].getContent()[0].getTitle();

			// UI5 Client Export scenario:

			// Disable Worker as Mockserver is used in explored
			//mExcelSettings.worker = false;
			// },

			handleEvent1: function(channel, event, data) {
				sap.ui.getCore().byId("myApp").to("idSecond");
			},

			onDataReceive: function(oEvent) {
				//console.log(oEvent.getParameters());
				debugger;
			},

			oSuppPopup: null,
			destoryDialog: function(){
				this.oSuppPopup.destroy();
				this.oSuppPopup = null;
			},
			// selectListItem: function(oEvent) {
			onItemPress: function(oEvent) {
				if (!this.oSuppPopup) {
					this.oSuppPopup = new sap.ui.xmlfragment("oft.fiori.fragments.subSearch", this);
					sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
					this.getView().addDependent(this.oSuppPopup);
				}

				// var oModel = oEvent.getParameter("listItem").oBindingContexts.undefined.oModel;
				// var sPath = oEvent.getParameter("listItem").oBindingContexts.undefined.sPath;
				// sPath = sPath.split("/")[1];
				// var oModel1 = this.getView().getModel().oData[sPath];

				var sPath = oEvent.getSource().oBindingContexts.undefined.sPath;
				sPath = sPath.split("/")[1];
				var oModel = this.getView().getModel().oData[sPath];
				this.gModel = oModel;

				//fix for the batch bug for extension
				//course_Guid = this.gModel.CourseId;

				if ((oModel.PartialPayment === false) && (oModel.MostRecent === true) && (oModel.EndDate <= new Date())) {
					// if ((oModel.PartialPayment === false) && (oModel.MostRecent === true)) {
					// enable extend option idExtendSubs
					sap.ui.getCore().byId("idExtendSubs").setEnabled(true);
				} else {
					// disable extend option idExtendSubs
					sap.ui.getCore().byId("idExtendSubs").setEnabled(false);
				}

				if ((oModel.PartialPayment === false) && (oModel.Extended === false)) {
					//if ((oModel.PartialPayment === false) && (oModel.MostRecent === true)) {
					// enable extend option idExtendSubs
					sap.ui.getCore().byId("idPortSubs").setEnabled(true);
				} else {
					// disable extend option idExtendSubs
					sap.ui.getCore().byId("idPortSubs").setEnabled(false);
				}

				if ((oModel.PendingAmount === 0) || (!oModel.PendingAmount) || (oModel.MostRecent === false)) {
					sap.ui.getCore().byId("idCourse_upd").setEnabled(false);
					sap.ui.getCore().byId("idPayDate_upd").setEnabled(false);
					this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", oModel.PaymentDate);
					sap.ui.getCore().byId("idEndDate_upd").setEnabled(false);
					this.getView().getModel("local").setProperty("/newRegistration/EndDate", oModel.EndDate);
					sap.ui.getCore().byId("paymentMode_upd").setEnabled(false);
					sap.ui.getCore().byId("accountDetails_upd").setEnabled(false);
					sap.ui.getCore().byId("idAmount_upd").setEnabled(false);
					this.getView().getModel("local").setProperty("/newRegistration/Amount", oModel.Amount);
					sap.ui.getCore().byId("idAmount_Txt").setText("Amount");
					sap.ui.getCore().byId("idReference_upd").setEnabled(false);
					sap.ui.getCore().byId("idRemarks_upd").setEnabled(false);
					sap.ui.getCore().byId("idPendingAmount_upd").setEnabled(false);
					sap.ui.getCore().byId("idPayDueDate_upd").setEnabled(false);
					this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", oModel.PaymentDueDate);
					sap.ui.getCore().byId("updPay").setEnabled(false);
				} else {
					sap.ui.getCore().byId("idPayDate_upd").setEnabled(true);
					sap.ui.getCore().byId("paymentMode_upd").setEnabled(true);
					sap.ui.getCore().byId("accountDetails_upd").setEnabled(true);
					sap.ui.getCore().byId("idAmount_upd").setEnabled(true);
					sap.ui.getCore().byId("idReference_upd").setEnabled(true);
					sap.ui.getCore().byId("idRemarks_upd").setEnabled(true);
					sap.ui.getCore().byId("idPendingAmount_upd").setEnabled(true);
					sap.ui.getCore().byId("idPayDueDate_upd").setEnabled(true);
					sap.ui.getCore().byId("idEndDate_upd").setEnabled(true);
					sap.ui.getCore().byId("updPay").setEnabled(true);
					//this.getView().getModel("local").setProperty("/newRegistration/EndDate", oModel.EndDate);
					this.getView().getModel("local").setProperty("/newRegistration/EndDate", this.formatter.getIncrementDate(oModel.EndDate, 0));
					this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", this.formatter.getFormattedDate(0));
					this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", this.formatter.getFormattedDate(1));
				}

				this.customerEmail = oEvent.getSource().mAggregations.cells[0].mProperties.text;
				this.courseName = oEvent.getSource().mAggregations.cells[2].mProperties.text;
				this.prevPendingAmiount = oModel.PendingAmount;

				this.getView().getModel("local").setProperty("/newRegistration/StudentId", this.customerEmail);
				this.getView().getModel("local").setProperty("/newRegistration/CourseId", this.courseName);
				// this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", this.formatter.getFormattedDate(0));
				// this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", this.formatter.getFormattedDate(1));
				this.getView().getModel("local").setProperty("/newRegistration/PaymentMode", oModel.PaymentMode);
				this.getView().getModel("local").setProperty("/newRegistration/AccountName", oModel.AccountName);
				if (oModel.PendingAmount) {
					this.getView().getModel("local").setProperty("/newRegistration/Amount", oModel.PendingAmount); //set the amount to the pending amount of last payment
				}
				// else {
				// 	this.getView().getModel("local").setProperty("/newRegistration/Amount", 0);
				// }
				this.getView().getModel("local").setProperty("/newRegistration/Reference", oModel.Reference);
				this.getView().getModel("local").setProperty("/newRegistration/Remarks", oModel.Remarks);
				this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", 0);
				this.getView().getModel("local").setProperty("/newRegistration/AccountName", oModel.AccountName);
				this.getView().getModel("local").setProperty("/BeneficiaryName", this.getAccountBeneficiary(oModel.AccountName));
				this.getView().getModel("local").setProperty("/newRegistration/subGuid", oModel.id);
				this.oSuppPopup.open();

			},

			oExtendPopup: null,
			onExtendSubs: function(oEvent) {
				debugger;
				if (!this.oExtendPopup) {
					this.oExtendPopup = new sap.ui.xmlfragment("oft.fiori.fragments.subSearchExtend", this);
					sap.ui.getCore().getMessageManager().registerObject(this.oExtendPopup, true);
					this.getView().addDependent(this.oExtendPopup);
				}
				debugger;
				var CourseDetail = this.courseName.split(":");

				sap.ui.getCore().byId("idbatchId").setValue(CourseDetail[0]);
				sap.ui.getCore().byId("idbatchName").setText(CourseDetail[1]);

				//this.getView().getModel("local").setProperty("/newRegExtension/CourseId", null);
				this.getView().getModel("local").setProperty("/newRegExtension/PaymentDate", this.formatter.getFormattedDate(0));
				this.getView().getModel("local").setProperty("/newRegExtension/EndDate", this.formatter.getFormattedDate(1));
				this.getView().getModel("local").setProperty("/newRegExtension/Amount", 15000);
				this.getView().getModel("local").setProperty("/newRegExtension/Reference", null);
				this.getView().getModel("local").setProperty("/newRegExtension/AccountName", null);
				//sap.ui.getCore().byId("imageUploader2").setValue(null);
				// this.getView().getModel("local").setProperty("/newRegExtension/PaymentMode",null);

				this.oExtendPopup.open();
			},
			onPortSubs: function(oEvent) {
				// var CourseDetail = this.courseName.split(":");
				//
				// sap.ui.getCore().byId("idbatchId").setValue(CourseDetail[0]);
				// sap.ui.getCore().byId("idbatchName").setText(CourseDetail[1]);

				sap.ui.getCore().byId("idCourse_upd").setEnabled(true);
				sap.ui.getCore().byId("idPortSubs").setEnabled(false);
				sap.ui.getCore().byId("idExtendSubs").setEnabled(false);
				portClicked = true;

				// sap.ui.getCore().byId("updPay").setText("Upadte");
				// sap.ui.getCore().byId("updPay").setEnabled(true);


			},


			onPayDateChange: function(oEvent) {
				debugger;
				var dateString = oEvent.getSource().getValue();
				var from = dateString.split(".");
				// var from = dateString.split("/");
				var dateObject = new Date(from[2], from[1] - 1, from[0]);
				var PaymentDueDate = this.formatter.getIncrementDate(dateObject, 1);
				this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", PaymentDueDate);
			},
			onAmountChange: function(oEvent) {
				//set pending amount
				var dueAmount;
				if (this.prevPendingAmiount) {
					dueAmount = this.prevPendingAmiount - oEvent.getSource().getValue();
				} else {
					dueAmount = 0 - oEvent.getSource().getValue();
				}
				if (dueAmount < 0) {
					dueAmount = 0;
					//sap.m.MessageToast.show("Due Amount can't be negative");
				}
				this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", dueAmount);
			},


			onClose: function() {
				this.oSuppPopup.close();
				portClicked = false;
			},
			onCloseExtend: function() {
				this.oExtendPopup.close();
			},
			onCreateNewPayment: function(oEvent) {
				//Call update/PUT function
				var oLocal = oEvent;
				var that = this;
				var leadData = this.getView().getModel("local").getProperty("/newRegistration");
				if (portClicked == false) {

					if (sap.ui.getCore().byId("idPayDate_upd").getDateValue()) {
						var futureDateCheck = this.formatter.getDateCheck(sap.ui.getCore().byId("idPayDate_upd").getDateValue());
						if (futureDateCheck == true) {
							sap.m.MessageToast.show("Payment Date can't be in future");
							return "";
						}
					}
					if ((!sap.ui.getCore().byId("idAmount_upd").getValue()) || (sap.ui.getCore().byId("idAmount_upd").getValue() <= 0)) {
						if (sap.ui.getCore().byId("idAmount_upd").getValue() < 0) {
							sap.m.MessageToast.show("Amount can't be less than 0");
							return "";
						}

					}
					if (sap.ui.getCore().byId("idPendingAmount_upd").getValue() < 0) {
						sap.m.MessageToast.show("Pending Amount can't be less than 0");
						return "";
					}

					if (sap.ui.getCore().byId("idPayDueDate_upd").getDateValue()) {

						var PayDueDate = sap.ui.getCore().byId("idPayDueDate_upd").getValue().split(".");
						var PayDate = sap.ui.getCore().byId("idPayDate_upd").getValue().split(".");
						PayDate = PayDate[2] + PayDate[1] + PayDate[0];
						PayDueDate = PayDueDate[2] + PayDueDate[1] + PayDueDate[0];

						if (PayDate > PayDueDate) {
							sap.m.MessageToast.show("Payment Due Date can't be less than Payment Date");
							return "";
						}
					}

					if ((leadData.PendingAmount === 0) || (leadData.PendingAmount === "")) {
						leadData.PartialPayment = false;
					}
					that.getView().setBusy(true);
					// var that = this;
					var sPath = "/Subs";
					sPath = sPath + "(" + "\'" + leadData.subGuid + "\'" + ")";
					debugger;
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "GET", null, null, that)
						.then(function(oData) {
							debugger;
							var payload1 = {
								"StudentId": oData.StudentId,
								"CourseId": oData.CourseId,
								"PaymentDate": sap.ui.getCore().byId("idPayDate_upd").getDateValue(),
								"Mode": oData.Mode,
								"StartDate": sap.ui.getCore().byId("idPayDate_upd").getDateValue(), //oData.StartDate, // sap.ui.getCore().byId("idRegDate").getDateValue(),
								"EndDate": sap.ui.getCore().byId("idEndDate_upd").getDateValue(), //oData.EndDate, //
								"PaymentMode": leadData.PaymentMode,
								"BankName": oData.BankName,
								"AccountName": leadData.AccountName,
								"Amount": leadData.Amount,
								"Reference": leadData.Reference,
								"Remarks": oData.Remarks,
								"PendingAmount": leadData.PendingAmount,
								"Waiver": oData.Waiver,
								"PartialPayment": leadData.PartialPayment,
								"PaymentDueDate": sap.ui.getCore().byId("idPayDueDate_upd").getDateValue(), //leadData.PaymentDueDate,
								"PaymentScreenshot": oData.PaymentScreenshot, //this.encoded, //btoa(encodeURI(this.imgContent)),
								"CreatedOn": oData.CreatedOn,
								"CreatedBy": oData.CreatedBy,
								"ChangedOn": new Date(),
								"ChangedBy": "DemoUser",
								"DropOut": oData.DropOut,
								"Extra1": oData.Extra1,
								"Extra2": oData.Extra2,
								"ExtraN1": oData.ExtraN1,
								"ExtraN2": oData.ExtraN2,
								"ExtraN3": oData.ExtraN3,
								"Status": oData.Status,
								"UpdatePayment": true,
								"MostRecent": true
							};
							var that2 = that;
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Subs", "POST", {},
									payload1, that2)
								.then(function(oData) {
									debugger;
									course_id = oData.CourseId;
									student_id = oData.StudentId;
									part_pay = oData.PartialPayment;
									subsId = oData.id;


									var that3 = that2;
									that2.ODataHelper.callOData(that2.getOwnerComponent().getModel(), "/Subs", "GET",
										//{filters:Filter1}, null).then(function(oData1) {
										null, null, that3).then(function(oData1) {
										debugger;
										console.log(oData1.results);
										var len = oData1.results.length;
										for (var i = 0; i < len; i++) {
											if ((oData1.results[i].StudentId === student_id) &&
												(oData1.results[i].CourseId === course_id) &&
												(oData1.results[i].id != subsId)) { // don't run update for most recent record
												var payload3 = {};

												if (part_pay === true) {
													payload3 = {
														"MostRecent": "false"
													};
												} else if (part_pay === false) {
													payload3 = {
														"PartialPayment": "false",
														"MostRecent": "false"
													};
												}

												var sPath1 = "/Subs";
												sPath1 = sPath1 + "(" + "\'" + oData1.results[i].id + "\'" + ")";

												that3.ODataHelper.callOData(that3.getOwnerComponent().getModel(), sPath1, "PUT", {}, payload3, that3)
													.then(function(oData) {
														debugger;

													}).catch(function(oError) {
														that3.getView().setBusy(false);
														var oPopover = that3.getErrorMessage(oError);
														debugger;
													});
											}
										}
									}).catch(function(oError) {
										that2.getView().setBusy(false);
										var oPopover = that2.getErrorMessage(oError);
										debugger;
									});
									that2.getView().setBusy(false);
									sap.m.MessageToast.show("Subscription Updated");
									// } else {
									// 	that2.getView().setBusy(false);
									// 	sap.m.MessageToast.show("Subscription Updated");
									// }
								}).catch(function(oError) {
									that2.getView().setBusy(false);
									var oPopover = that2.getErrorMessage(oError);
									debugger;
								});


							that.oSuppPopup.close();

						}).catch(function(oError) {
							debugger;
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
							that.oSuppPopup.close();
						});


				} else if (portClicked == true) {
					debugger;
					portClicked = false;
					this.getView().setBusy(true);
					var myCourseId = this.gModel.CourseId;
					var sPath = "/Subs";
					sPath = sPath + "(" + "\'" + leadData.subGuid + "\'" + ")";
					debugger;
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "GET", null, null, this)
						.then(function(oData) {
							debugger;
							course_id = oData.CourseId;
							student_id = oData.StudentId;
							// part_pay = oData.PartialPayment;
							// subsId = oData.id;
							var that2 = that;
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Subs", "GET",
								{filters: [new sap.ui.model.Filter('StudentId', sap.ui.model.FilterOperator.EQ, "'" + student_id + "'")]}, null, that).then(function(oData1) {

								var len = oData1.results.length;
								for (var i = 0; i < len; i++) {
									if ((oData1.results[i].StudentId === student_id) &&
										(oData1.results[i].CourseId === course_id)) {
										var that3 = that2;
										// read course's batch number and pass the old batch to new batch info in remarks fields
										SubId_upd = oData1.results[i].id;
										var vCourse_old = "/Courses";
										vCourse_old = vCourse_old + "(" + "\'" + course_id + "\'" + ")";

										that2.ODataHelper.callOData(that2.getOwnerComponent().getModel(), vCourse_old, "GET", null,
											null, that2).then(function(oData2) {
											debugger;
											//
											var that4 = that3;
											var vBatch_Old = oData2.BatchNo;
											var vCourse_new = "/Courses";
											vCourse_new = vCourse_new + "(" + "\'" + myCourseId + "\'" + ")";

											that3.ODataHelper.callOData(that3.getOwnerComponent().getModel(), vCourse_new, "GET", null,
												null, that3).then(function(oData3) {
												debugger;

												var vBatch_new = oData3.BatchNo;

												var vRemarks = vBatch_Old + ' to ' + vBatch_new + ' on ' + new Date().toString();
												var payload3 = {
													"Remarks": vRemarks,
													"CourseId": myCourseId,
													"Extra1": new Date()
												};

												var sPath1 = "/Subs";
												sPath1 = sPath1 + "(" + "\'" + SubId_upd + "\'" + ")";
												var that5 = that4;
												that4.ODataHelper.callOData(that4.getOwnerComponent().getModel(), sPath1, "PUT", {}, payload3, that4)
													.then(function(oData) {
														sap.m.MessageToast.show("Subscriptions Updated");
														that5.oSuppPopup.close();
													}).catch(function(oError) {
														that5.getView().setBusy(false);
														var oPopover = that5.getErrorMessage(oError);
														debugger;
													});

											}).catch(function(oError) {
												that4.getView().setBusy(false);
												var oPopover = that4.getErrorMessage(oError);
												debugger;
											});



										}).catch(function(oError) {
											that3.getView().setBusy(false);
											var oPopover = that3.getErrorMessage(oError);
											debugger;
										});



										// var payload3 = {
										// 	"CourseId": course_Guid,
										// 	"Extra1": new Date()
										// };
										//
										// var sPath1 = "/Subs";
										// sPath1 = sPath1 + "(" + "\'" + oData1.results[i].id + "\'" + ")";
										// // var that3 = that2;
										// that2.ODataHelper.callOData(that2.getOwnerComponent().getModel(), sPath1, "PUT", {}, payload3, that2)
										// 	.then(function(oData) {
										// 		sap.m.MessageToast.show("Subscriptions Updated");
										// 		that.oSuppPopup.close();
										// 	}).catch(function(oError) {
										// 		that3.getView().setBusy(false);
										// 		var oPopover = that3.getErrorMessage(oError);
										// 		debugger;
										// 	});
									}
								}
							}).catch(function(oError) {
								that2.getView().setBusy(false);
								var oPopover = that2.getErrorMessage(oError);
								debugger;
							});
							that.getView().setBusy(false);
							// sap.m.MessageToast.show("Subscription Updated");
							//that.oSuppPopup.close();

						}).catch(function(oError) {
							debugger;
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
							// that.oSuppPopup.close();
						});
				}
			},


			onExtendSave: function(oEvent) {
				var that = this;
				debugger;
				var leadData = this.getView().getModel("local").getProperty("/newRegExtension");

				if (sap.ui.getCore().byId("idPayDate_upd1").getDateValue()) {
					var futureDateCheck = this.formatter.getDateCheck(sap.ui.getCore().byId("idPayDate_upd1").getDateValue());
					if (futureDateCheck == true) {
						sap.m.MessageToast.show("Payment Date can't be in future");
						return "";
					}
				}
				if ((!sap.ui.getCore().byId("idAmount_upd1").getValue()) || (sap.ui.getCore().byId("idAmount_upd1").getValue() <= 0)) {
					if (sap.ui.getCore().byId("idAmount_upd1").getValue() < 0) {
						sap.m.MessageToast.show("Amount can't be less than 0");
						return "";
					}
				}

				if (sap.ui.getCore().byId("idExtendDate").getDateValue()) {

					var PayDueDate = sap.ui.getCore().byId("idExtendDate").getValue().split(".");
					var PayDate = sap.ui.getCore().byId("idPayDate_upd1").getValue().split(".");
					PayDate = PayDate[2] + PayDate[1] + PayDate[0];
					PayDueDate = PayDueDate[2] + PayDueDate[1] + PayDueDate[0];

					if (PayDate > PayDueDate) {
						sap.m.MessageToast.show("Extension Date can't be less than Payment Date");
						return "";
					}
				}

				var oFileUploader = sap.ui.getCore().byId("imageUploader2");
				var domRef = oFileUploader.getFocusDomRef();
				var file = domRef.files[0];
				if (file) {
					var that = this;
					//	this.fileName = file.name;
					//this.fileType = file.type;
					var fileName = file.name.split(".");
					var i = fileName.length;

					//var filetype = file.type.split("/")[1];
					var file_ext = fileName[i - 1];

					if ((file_ext == "jpg") || (file_ext == "jpeg") || (file_ext == "png") ||
						(file_ext == "JPG") || (file_ext == "JPEG") || (file_ext == "PNG")) {
						var reader = new FileReader();
						reader.onload = function(e) {
							if ((file_ext == "jpg") || (file_ext == "jpeg") || (file_ext == "JPG") || (file_ext == "JPEG")) {
								//get an access to the content of the file
								that.screenShotContent = e.currentTarget.result.replace("data:image/jpeg;base64,", "");
								//that.encoded = btoa(encodeURI(that.imgContent));
							} else {
								that.screenShotContent = e.currentTarget.result.replace("data:image/png;base64,", "");
							}
						};
						//File Reader will start reading the file
						reader.readAsDataURL(file);
					} else {
						sap.m.MessageToast.show("Upload only jpg/png files");
						// sap.ui.getCore().byId("imageUploader2");
						sap.ui.getCore().byId("imageUploader2").setValue(null);
						return "";
					}
				}

				if (!(sap.ui.getCore().byId("idAmount_upd1").getValue()) || (sap.ui.getCore().byId("idAmount_upd1").getValue() == 0)) {
					var vWaiver = true;
				} else {
					var vWaiver = false;
				}
				if (!course_Guid) {
					course_Guid = this.gModel.CourseId;
				}

				this.getView().setBusy(true);
				var payload1 = {
					"StudentId": this.gModel.StudentId,
					"CourseId": this.gModel.CourseId,
					"PaymentDate": sap.ui.getCore().byId("idPayDate_upd1").getDateValue(),
					"Mode": this.gModel.Mode,
					"StartDate": sap.ui.getCore().byId("idPayDate_upd1").getDateValue(), // sap.ui.getCore().byId("idRegDate").getDateValue(),
					"EndDate": sap.ui.getCore().byId("idExtendDate").getDateValue(),
					"PaymentMode": leadData.PaymentMode,
					"BankName": this.gModel.BankName,
					"AccountName": leadData.AccountName,
					"Amount": leadData.Amount,
					"Reference": leadData.Reference,
					"Remarks": "Extended on " + new Date().toString(),
					"PendingAmount": 0,
					"Waiver": vWaiver, //this.gModel.Waiver,
					"PartialPayment": false,
					"Extended": true,
					"PaymentDueDate": null,
					"PaymentScreenshot": this.screenShotContent, //this.encoded, //btoa(encodeURI(this.imgContent)),
					"CreatedOn": this.gModel.CreatedOn,
					"CreatedBy": this.gModel.CreatedBy,
					"ChangedOn": new Date(),
					"ChangedBy": "DemoUser",
					"DropOut": this.gModel.DropOut,
					"Extra1": this.gModel.Extra1,
					"Extra2": this.gModel.Extra2,
					"ExtraN1": this.gModel.ExtraN1,
					"ExtraN2": this.gModel.ExtraN2,
					"ExtraN3": this.gModel.ExtraN3,
					"Status": this.gModel.Status,
					"UpdatePayment": true,
					"MostRecent": true
				};
				console.log(payload1);

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Subs", "POST", {},
						payload1, this)
					.then(function(oData) {
						var payload2 = {
							"MostRecent": "false"
						};
						var sPath1 = "/Subs";
						sPath1 = sPath1 + "(" + "\'" + that.gModel.id + "\'" + ")";
						var that2 = that;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), sPath1, "PUT", {}, payload2, that2)
							.then(function(oData) {
								debugger;
								//  console.log("Data changed");
								that2.getView().setBusy(false);
								that2.oExtendPopup.close();
								that2.oSuppPopup.close();
								sap.ui.getCore().byId("idExtendSubs").setEnabled(false);
								sap.ui.getCore().byId("imageUploader2").setValue(null);
								sap.m.MessageToast.show("Subscription Extended");
							}).catch(function(oError) {
								debugger;
								that2.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					}).catch(function(oError) {
						debugger;
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);

					});
			},
			BatchPopupClose: function(oEvent){
				debugger;
				//set the id here
			},
			onSelect: function(oEvent) {
				this.sId = oEvent.getSource().getId();
				debugger;
				var sTitle = "",
					sPath = "";

				if ((this.sId.indexOf("accountDetails_upd") !== -1) || (this.sId.indexOf("accountDetails_upd1") !== -1)) {
					var oAccFilter = new sap.ui.model.Filter("deleted", FilterOperator.EQ, false);
					var oSorter = new sap.ui.model.Sorter({
						path: 'value',
						descending: false
					});
					sTitle = "Account Search";
					sPath = "local>/accountSet";
					this.getCustomerPopup();
					var title = "Account Search";
					this.searchPopup.setTitle(title);
					this.searchPopup.bindAggregation("items", {
						path: "local>/accountSet",
						filters: [oAccFilter],
						sorter: oSorter,
						template: new sap.m.DisplayListItem({
							label: "{local>value}",
							value: "{local>key}"
						})
					});
				} else if ((this.sId.indexOf("idbatchId") !== -1) || (this.sId.indexOf("idCourse_upd") !== -1) ||
					(this.sId.indexOf("idCourseSearch") !== -1)) {
				var oBatchFilter = new Filter("hidden", FilterOperator.EQ, false);
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("batch");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Courses",
					filters: [oBatchFilter],
					template: new sap.m.DisplayListItem({
						label: "{Name}",
						value: "{BatchNo}"
					})
				});
				//this.searchPopup.attachConfirm(this.BatchPopupClose).bind(this);
				// var aFilters = [];
				// aFilters.push(new Filter("Hidden", FilterOperator.EQ, false));
				// var oBinding = this.searchPopup.getBinding("items").filter(aFilters);
			} else if (this.sId.indexOf("idStuSearch") !== -1) {
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Students",
					template: new sap.m.DisplayListItem({
						label: "{Name}",
						value: "{GmailId}"
					})
				});
			}

		},
		onConfirm: function(oEvent) {
			debugger;
			if (this.sId.indexOf("accountDetails") !== -1) {

				var bankName = oEvent.getParameter("selectedItem").getValue();
				if (this.sId == "accountDetails_upd") {
					this.getView().getModel("local").setProperty("/newRegistration/AccountName", bankName);
				} else if (this.sId == "accountDetails_upd1") {
					this.getView().getModel("local").setProperty("/newRegExtension/AccountName", bankName);
				}

			} else if (this.sId.indexOf("idbatchId") !== -1) {
				// debugger;
				var data = this.getSelectedKey(oEvent);

				var CourseDetail = this.courseName.split(":");
				CourseDetail[1].trimLeft();
				if (data[1] != CourseDetail[1].trimLeft()) {
					sap.m.MessageToast.show("Please select batch with course name" + CourseDetail[1]);
					sap.ui.getCore().byId("idbatchName").setText("Select correct course");
					sap.ui.getCore().byId("updPay1").setEnabled(false);
					sap.ui.getCore().byId("idbatchId").setValue(null);
					sap.ui.getCore().byId("idbatchName").setText(null);
				} else {
					sap.ui.getCore().byId("updPay1").setEnabled(true);
					sap.ui.getCore().byId("idbatchName").setText(data[1]);
					sap.ui.getCore().byId("idbatchId").setValue(data[0]);
					this.gModel.CourseId = data[2]; //save corse guid in global variable
				}
			} else if (this.sId.indexOf("idCourse_upd") !== -1) {
				var data = this.getSelectedKey(oEvent);
				var CourseDetail = this.courseName.split(":");
				CourseDetail[1].trimLeft();
				if (data[1] != CourseDetail[1].trimLeft()) {
					sap.m.MessageToast.show("Please select batch with course name" + CourseDetail[1]);
				} else {
					if (data[0] == CourseDetail[0]) {
						sap.m.MessageToast.show("Please select same course name with different BatchNo");
					} else {
						sap.ui.getCore().byId("updPay").setEnabled(true);
						sap.ui.getCore().byId("updPay").setText("Upadte");
						// sap.ui.getCore().byId("idbatch_Name").setText(data[0]+ data[1]);
						sap.ui.getCore().byId("idCourse_upd").setValue(data[0] + ': ' + data[1]);
						this.gModel.CourseId = data[2]; //save corse guid in global variable
					}
				}

			} else if (this.sId.indexOf("idCourseSearch") !== -1) {
				var data = this.getSelectedKey(oEvent);
				this.SearchCourseGuid = data[2];
				this.getView().byId("idCourseSearch").setValue(data[0] + ': ' + data[1]);
				debugger;
			} else if (this.sId.indexOf("idStuSearch") !== -1) {
				debugger;
				var data = this.getSelectedKey(oEvent);
				this.SearchStuGuid = data[2];
				this.getView().byId("idStuSearch").setValue(data[0]);
			}
		},
		onSearchManageSubs: function(oEvent) {
					// this.SearchStuGuid;
					// this.SearchCourseGuid;
					debugger;
					var aFilter = [];

					if (this.SearchStuGuid) {
						aFilter.push(new sap.ui.model.Filter("StudentId", "EQ", "'" + this.SearchStuGuid + "'"));
					}
					if (this.SearchCourseGuid) {
						aFilter.push(new sap.ui.model.Filter("CourseId", "EQ", "'" + this.SearchCourseGuid + "'"));
					}
					var dateString = this.getView().byId("idBatchEndate");
					if (dateString._lastValue != false) {
						var from = dateString._lastValue.split(".");
						var newDate = new Date(from[2], from[1] - 1, from[0]);
						newDate.setHours(0, 0, 0, 0);
						var oFilter_date = new sap.ui.model.Filter("EndDate", "GE", newDate);
					} else {
						var oFilter_date = new sap.ui.model.Filter();
					}

					if (dateString._lastValue != false) {
						aFilter.push(oFilter_date);
					}


					var vKey = this.getView().byId("idPendingPayment").getSelectedKey();
					if (vKey === "true") {
						var oFilter1 = new sap.ui.model.Filter("PendingAmount", "GT", 0);
						aFilter.push(oFilter1);
						// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter1]);
					} else if (vKey === "false") {
						var oFilter1 = new sap.ui.model.Filter("PendingAmount", "EQ", 0);
						aFilter.push(oFilter1);
						// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter2]);
					}


					var vKey1 = this.getView().byId("idPartPaySearch").getSelectedKey();
					if (vKey1 === "true") {
						var oFilter2 = new sap.ui.model.Filter("PartialPayment", "EQ", "true");
						aFilter.push(oFilter2);
						// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter1]);
					} else if (vKey1 === "false") {
						var oFilter2 = new sap.ui.model.Filter("PartialPayment", "EQ", "false");
						aFilter.push(oFilter2);
						// this.getView().byId("manageSubsTable").getBinding("items").filter([oFilter2]);
					}

					this.getView().byId("manageSubsTable").getBinding("items").filter(aFilter);

				},
		onDataExport: function(oEvent) {
			$.ajax({
				type: 'GET', // added,
				url: 'SubDownload',
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});

		},
		onExpiredExport: function(oEvent) {
			$.ajax({
				type: 'GET', // added,
				url: 'SubNotExpired',
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});

		}

	});

});
