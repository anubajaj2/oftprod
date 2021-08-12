sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.newCustomer", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			}
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);

		},
		onBack: function() {
			sap.ui.getCore().getView().byId("idApp").to("idView1");
		},
		herculis: function(oEvent) {
			if (oEvent.getParameter("name") !== "newCustomer") {
				return;
			}
			this.getView().getModel("local").setProperty("/newCustomer/GmailId", null);
			this.getView().getModel("local").setProperty("/newCustomer/Name", null);
			this.getView().getModel("local").setProperty("/newCustomer/Country", 'IN');
			this.getView().getModel("local").setProperty("/newCustomer/ContactNo", null);
			this.getView().getModel("local").setProperty("/newCustomer/OtherEmail1", null);
			this.getView().getModel("local").setProperty("/newCustomer/OtherEmail2", null);
			this.getView().getModel("local").setProperty("/newCustomer/Skills", null);

			this.getView().getModel("local").setProperty("/newCustomer/Address", "");
			this.getView().getModel("local").setProperty("/newCustomer/City", "");
			this.getView().getModel("local").setProperty("/newCustomer/GSTIN", "");
			this.getView().getModel("local").setProperty("/newCustomer/GSTCharge", false);
			this.getView().getModel("local").setProperty("/newCustomer/Company", false);

			this.getView().getModel("local").setProperty("/newCustomer/Star", false);
			this.getView().getModel("local").setProperty("/newCustomer/Defaulter", false);
			this.getView().getModel("local").setProperty("/newCustomer/HighServerUsage", false);
			this.getView().byId("idSkills1").clearSelection();
			this.getView().byId("createNew1").setText("Create");
			this.UpdateCustomer = false;
			this.customerGUID = null;

		},
		onReplicateOneStudent: function() {
			// this.vEmail = oEvent.getParameters().value;
			var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (regEx.test(this.vEmail)) {
				$.post('/replicateOneStudentToStudentPortal', {
						mailId: this.vEmail
					})
					.done(function(data, status) {
						MessageToast.show(MessageBox.success(JSON.stringify(data)));
						that.getView().byId("idReplicateOneStudent").setEnabled(true);
					})
					.fail(function(xhr, status, error) {
						MessageBox.error("Error in access");
						that.getView().byId("idReplicateOneStudent").setEnabled(true);
					});
				// var that = this;
				// // that.getView().setBusy(true);
				//
				// var payload = {};
				//
				// var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", that.vEmail);
				// var Filter2 = new sap.ui.model.Filter("OtherEmail1", "EQ", that.vEmail);
				// var Filter3 = new sap.ui.model.Filter("OtherEmail2", "EQ", that.vEmail);
				//
				//
				// var oFilter = new sap.ui.model.Filter({
				// 	filters: [Filter1, Filter2, Filter3],
				// 	and: false
				// });
				//
				// // debugger;
				// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
				// 		// filters: [Filter1]
				// 		filters: [oFilter]
				// 	}, payload, this)
				// 	.then(function(oData) {
				// 		// if (oData.results.length != 0) {
				// 		// 	var item = oData.results[0];
				// 		// 	var payload = {
				// 		// 		"name": item.Name,
				// 		// 		"email": item.GmailId,
				// 		// 		"companyMail": item.CompanyMail === "null" ? undefined : item.CompanyMail,
				// 		// 		"otherEmail1": item.OtherEmail1 === "null" ? undefined : item.OtherEmail1,
				// 		// 		"otherEmail2": item.OtherEmail2 === "null" ? undefined : item.OtherEmail2,
				// 		// 		// "gender": null,
				// 		// 		"contactNo": item.ContactNo === "null" ? undefined : item.ContactNo.toString(),
				// 		// 		// "officecontactNo": null,
				// 		// 		// "experience": null,
				// 		// 		"address": item.Address === "null" ? undefined : item.Address,
				// 		// 		"city": item.City === "null" ? undefined : item.City,
				// 		// 		// "state": null,
				// 		// 		"country": item.Country === "null" ? undefined : item.Country,
				// 		// 		"designation": item.Designation === "null" ? undefined : item.Designation,
				// 		// 		"star": item.Star === "null" ? undefined : item.Star,
				// 		// 		// "draft": null,
				// 		// 		// "draftRejection": null,
				// 		// 		// "draftRejectionReason": null,
				// 		// 		"defaulter": item.Defaulter,
				// 		// 		"highServerUsage": item.HighServerUsage,
				// 		// 		"Skills": item.Skills === "null" ? undefined : item.Skills,
				// 		// 		"Resume": item.Resume === "null" ? undefined : item.Resume,
				// 		// 		// "Photo": null,
				// 		// 		"extra1": item.Extra1 === "null" ? undefined : item.Extra1,
				// 		// 		"extra2": item.Extra2 === "null" ? undefined : item.Extra2,
				// 		// 		"GSTIN": item.GSTIN === "null" ? undefined : item.GSTIN,
				// 		// 		"company": item.Company === "null" ? undefined : item.Company,
				// 		// 		"GSTCharge": item.GSTCharge === "null" ? undefined : item.GSTCharge,
				// 		// 		"CreatedOn": item.CreatedOn,
				// 		// 		"ChangedOn": item.ChangedOn,
				// 		// 		"CreatedBy": item.CreatedBy,
				// 		// 		"ChangedBy": item.ChangedBy,
				// 		// 		// "userId": null,
				// 		// 	};
				// 		// 	$.post('/replicateOneStudentToStudentPortal', JSON.parse(JSON.stringify(payload)))
				// 		// 		.done(function(data, status) {
				// 		// 			MessageToast.show(data);
				// 		// 		})
				// 		// 		.fail(function(xhr, status, error) {
				// 		// 			MessageBox.error();
				// 		// 		});
				// 		// } else {
				// 		//
				// 		// }
				// 	}).catch(function(oError) {
				//
				// 		var oPopover = that.getErrorMessage(oError);
				// 	});

			} else {
				sap.m.MessageToast.show("Invalid email id");
				return "";
			}
		},
		onReplicateStudents: function() {
			var that = this;
			MessageBox.confirm("are you sure?", function(val) {
				if (val === "OK") {
					that.getView().byId("idReplicateStudents").setEnabled(false);
					MessageToast.show("Replication started, Please Wait...");
					$.get('/replicateStudentsToStudentPortal')
						.done(function(data, status) {
							MessageBox.success(JSON.stringify(data));
							that.getView().byId("idReplicateStudents").setEnabled(true);
						})
						.fail(function(xhr, status, error) {
							that.getView().byId("idReplicateStudents").setEnabled(true);
							MessageBox.error("Error in access");
						});
				}
			});
		},
		onSelect: function(oEvent) {
			this.sId = oEvent.getSource().getId();


			var sTitle = "",
				sPath = "";

			if (this.sId.indexOf("customerId") !== -1) {
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
			} else if (this.sId.indexOf("idEmailCust1") !== -1) {
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Inquries",
					template: new sap.m.DisplayListItem({
						label: "{EmailId}",
						value: "{FirstName}"
					})
				});
			}
		},
		onConfirm: function(oEvent) {

			if (this.sId.indexOf("customerId") !== -1) {

				var data = this.getSelectedKey(oEvent);
				this.getView().byId("customerId").setValue(data[0]);
				this.customerId = data[2];

			} else if (this.sId.indexOf("idEmailCust1") !== -1) {
				debugger;
				// var data = this.getSelectedKey(oEvent);
				// .getView().byId("idEmailCust").setValue(data[1]);

				var oItem = oEvent.getParameter("selectedItem");
				var oContext = oItem.getBindingContext();

				if (oContext) {
					var that = this;
					// that.getView().setBusy(true);

					var payload = {};

					var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", oContext.getObject().EmailId);

					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
							filters: [Filter1]
						}, payload, this)
						.then(function(oData) {
							if (oData.results.length != 0) {
								that.getView().byId("idEmailCust1").setValue(oData.results[0].GmailId);
								that.getView().byId("idName1").setValue(oData.results[0].Name);

								if (oData.results[0].ContactNo) {
									that.getView().byId("idPhone1").setValue(oData.results[0].ContactNo);
								} else {
									that.getView().byId("idPhone1").setValue(0);
								}

								if (oData.results[0].Country) {
									that.getView().byId("idCountry1").setSelectedKey(oData.results[0].Country);
								} else {
									that.getView().byId("idCountry1").setSelectedKey("IN");
								}
								if (oData.results[0].OtherEmail1) {
									that.getView().byId("idOtherEmail11").setValue(oData.results[0].OtherEmail1);
								}
								if (oData.results[0].OtherEmail2) {
									that.getView().byId("idOtherEmail21").setValue(oData.results[0].OtherEmail2);
								}

								//if (oData.results[0].Defaulter) {
								that.getView().byId("idDefaulter1").setSelected(oData.results[0].Defaulter);
								//}
								//debugger;
								//if (oData.results[0].HighServerUsage) {
								that.getView().byId("idHighServerUsage1").setSelected(oData.results[0].HighServerUsage);
								//}
								//if (oData.results[0].Star) {
								that.getView().byId("idStar1").setSelected(oData.results[0].Star);
								//}

								that.getView().byId("createNew1").setText("Update");
								that.UpdateCustomer = true;
								that.customerGUID = oData.results[0].id;
								//that.CreateCustomer = false;

							} else {

								var vLastName;
								var vFirstName;

								that.getView().byId("idEmailCust1").setValue(oContext.getObject().EmailId);

								if (oContext.getObject().FirstName) {
									if (oContext.getObject().LastName) {
										vLastName = oContext.getObject().LastName;
									} else {
										vLastName = " ";
									}
									that.getView().byId("idName1").setValue(oContext.getObject().FirstName + ' ' + vLastName);
								} else {
									vFirstName = "";
									if (oContext.getObject().LastName) {
										vLastName = oContext.getObject().LastName;
									} else {
										vLastName = "";
									}
									that.getView().byId("idName1").setValue(vFirstName + ' ' + vLastName);
								}

								if (oContext.getObject().Phone) {
									that.getView().byId("idPhone1").setValue(oContext.getObject().Phone);
								} else {
									that.getView().byId("idPhone1").setValue(0);
								}

								if (oContext.getObject().Country) {
									that.getView().byId("idCountry1").setSelectedKey(oContext.getObject().Country);
								} else {
									that.getView().byId("idCountry1").setSelectedKey("IN");
								}
								that.getView().byId("createNew1").setText("Create");
								that.UpdateCustomer = false;
								//that.CreateCustomer = true;
							}
						}).catch(function(oError) {

							var vLastName;
							var vFirstName;

							that.getView().byId("idEmailCust1").setValue(oContext.getObject().EmailId);

							if (oContext.getObject().FirstName) {
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = " ";
								}
								that.getView().byId("idName1").setValue(oContext.getObject().FirstName + ' ' + vLastName);
							} else {
								vFirstName = "";
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = "";
								}
								that.getView().byId("idName1").setValue(vFirstName + ' ' + vLastName);
							}

							if (oContext.getObject().Phone) {
								that.getView().byId("idPhone1").setValue(oContext.getObject().Phone);
							} else {
								that.getView().byId("idPhone1").setValue(0);
							}

							if (oContext.getObject().Country) {
								that.getView().byId("idCountry1").setSelectedKey(oContext.getObject().Country);
							} else {
								that.getView().byId("idCountry1").setSelectedKey("IN");
							}
							that.getView().byId("createNew1").setText("Create");
							that.UpdateCustomer = false;
							//that.CreateCustomer = true;
						});

				}

			}
			//this.searchPopup.close();
		},
		suggestionItemSelected: function(oEvent) {
			debugger;
			var oItem = oEvent.getParameter("selectedItem");
			var oContext = oItem.getBindingContext();
			//var oModel = this.getView().getModel().oData[oContext.sPath];

			if (oContext) {
				var that = this;
				// that.getView().setBusy(true);

				var payload = {};

				var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", oContext.getObject().EmailId);
				var Filter2 = new sap.ui.model.Filter("OtherEmail1", "EQ", that.vEmail);
				var Filter3 = new sap.ui.model.Filter("OtherEmail2", "EQ", that.vEmail);


				var oFilter = new sap.ui.model.Filter({
					filters: [Filter1, Filter2, Filter3],
					and: false
				});

				debugger;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
						filters: [oFilter]
					}, payload, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
							that.getView().byId("idEmailCust1").setValue(oData.results[0].GmailId);
							that.getView().byId("idName1").setValue(oData.results[0].Name);

							if (oData.results[0].ContactNo) {
								that.getView().byId("idPhone1").setValue(oData.results[0].ContactNo);
							} else {
								that.getView().byId("idPhone1").setValue(0);
							}

							if (oData.results[0].Country) {
								that.getView().byId("idCountry1").setSelectedKey(oData.results[0].Country);
							} else {
								that.getView().byId("idCountry1").setSelectedKey("IN");
							}
							if (oData.results[0].OtherEmail1) {
								that.getView().byId("idOtherEmail11").setValue(oData.results[0].OtherEmail1);
							}
							if (oData.results[0].OtherEmail2) {
								that.getView().byId("idOtherEmail21").setValue(oData.results[0].OtherEmail2);
							}

							// if (oData.results[0].Defaulter) {
							that.getView().byId("idDefaulter1").setSelected(oData.results[0].Defaulter);
							// }
							//debugger;
							// if (oData.results[0].HighServerUsage) {
							that.getView().byId("idHighServerUsage1").setSelected(oData.results[0].HighServerUsage);
							// }
							// if (oData.results[0].Star) {
							that.getView().byId("idStar1").setSelected(oData.results[0].Star);
							// }

							that.getView().byId("createNew1").setText("Update");
							that.UpdateCustomer = true;
							that.customerGUID = oData.results[0].id;
							//that.CreateCustomer = false;

						} else {

							var vLastName;
							var vFirstName;

							that.getView().byId("idEmailCust1").setValue(oContext.getObject().EmailId);

							if (oContext.getObject().FirstName) {
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = " ";
								}
								that.getView().byId("idName1").setValue(oContext.getObject().FirstName + ' ' + vLastName);
							} else {
								vFirstName = "";
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = "";
								}
								that.getView().byId("idName1").setValue(vFirstName + ' ' + vLastName);
							}

							if (oContext.getObject().Phone) {
								that.getView().byId("idPhone1").setValue(oContext.getObject().Phone);
							} else {
								that.getView().byId("idPhone1").setValue(0);
							}

							if (oContext.getObject().Country) {
								that.getView().byId("idCountry1").setSelectedKey(oContext.getObject().Country);
							} else {
								that.getView().byId("idCountry1").setSelectedKey("IN");
							}
							that.getView().byId("createNew1").setText("Create");
							that.UpdateCustomer = false;
							//that.CreateCustomer = true;
						}
					}).catch(function(oError) {

						var vLastName;
						var vFirstName;

						that.getView().byId("idEmailCust1").setValue(oContext.getObject().EmailId);

						if (oContext.getObject().FirstName) {
							if (oContext.getObject().LastName) {
								vLastName = oContext.getObject().LastName;
							} else {
								vLastName = " ";
							}
							that.getView().byId("idName1").setValue(oContext.getObject().FirstName + ' ' + vLastName);
						} else {
							vFirstName = "";
							if (oContext.getObject().LastName) {
								vLastName = oContext.getObject().LastName;
							} else {
								vLastName = "";
							}
							that.getView().byId("idName1").setValue(vFirstName + ' ' + vLastName);
						}

						if (oContext.getObject().Phone) {
							that.getView().byId("idPhone1").setValue(oContext.getObject().Phone);
						} else {
							that.getView().byId("idPhone1").setValue(0);
						}

						if (oContext.getObject().Country) {
							that.getView().byId("idCountry1").setSelectedKey(oContext.getObject().Country);
						} else {
							that.getView().byId("idCountry1").setSelectedKey("IN");
						}
						that.getView().byId("createNew1").setText("Create");
						that.UpdateCustomer = false;
						//that.CreateCustomer = true;
					});

			}

		},
		onSearch: function(oEvent) {

			if (this.sId.indexOf("customerId") !== -1) {
				var queryString = this.getQuery(oEvent);

				if (queryString) {
					var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("GmailId", sap.ui.model.FilterOperator.Contains, queryString);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});
					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);
				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Students",
						template: new sap.m.DisplayListItem({
							label: "{Name}",
							value: "{GmailId}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}

			}

		},
		onCancel: function(oEvent) {
			// this.searchPopup.close();
		},
		onClose: function() {
			// var MultiInput = .getView().getElementById("multiInputID");
			// MultiInput.removeAllTokens();
			//this.oSuppPopup.close();
		},

		onCreateCust: function(oEvent) {
			//TODO: Create POST Request to create customer
			//console.log(this.getView().getModel("local").getProperty("/newCustomer"));
			var oLocal = oEvent;
			var that = this;
			that.getView().setBusy(true);
			var leadData = this.getView().getModel("local").getProperty("/newCustomer");
			debugger;
			var oFileUploader = this.getView().byId("idFileUploader1");
			var domRef = oFileUploader.getFocusDomRef();
			var file = domRef.files[0];
			if (file) {
				var that = this;
				var fileName = file.name.split(".");
				var i = fileName.length;

				var filetype = file.type.split("/")[1];
				var file_ext = fileName[i - 1];
				if ((file_ext == "PDF") || (file_ext == "DOCX") || (file_ext == "DOC") ||
					(file_ext == "pdf") || (file_ext == "docx") || (file_ext == "doc") ||
					(file_ext == "msword") || (file_ext == "MSWORD")) {

					var reader = new FileReader();
					reader.onload = function(e) {

						//get an access to the content of the file
						if ((file_ext == "PDF") || (file_ext == "pdf")) {
							that.FileContent = e.currentTarget.result.replace("data:application/pdf;base64,", "");
						} else {
							if (filetype == "msword") {
								that.FileContent = e.currentTarget.result.replace("data:application/msword;base64,", "");
							} else {
								that.FileContent = e.currentTarget.result.replace("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,", "");
							}
						}
						//that.encoded = btoa(encodeURI(that.imgContent));
					};
					//File Reader will start reading the file
					reader.readAsDataURL(file);
				} else {
					sap.m.MessageToast.show("File Type should be PDF or DOC");
					return "";
				}
			}

			if (that.UpdateCustomer == false) {
				if (leadData.OtherEmail1) {
					leadData.OtherEmail1 = leadData.OtherEmail1.toLowerCase();
				}
				if (leadData.OtherEmail2) {
					leadData.OtherEmail2 = leadData.OtherEmail2.toLowerCase();
				}
				var payload = {
					"GmailId": leadData.GmailId.toLowerCase(),
					"Name": leadData.Name,
					"CompanyMail": leadData.CompanyMail,
					"Country": leadData.Country,
					"Designation": leadData.Designation,
					"OtherEmail1": leadData.OtherEmail1,
					"OtherEmail2": leadData.OtherEmail2,
					"ContactNo": leadData.ContactNo,
					"Star": leadData.Star,
					"Defaulter": leadData.Defaulter,
					"HighServerUsage": leadData.HighServerUsage,
					"Skills": leadData.Skills,
					"Resume": this.FileContent, //.Resume,
					"Address": leadData.Address,
					"City": leadData.City,
					"GSTIN": leadData.GSTIN,
					"GSTCharge": leadData.GSTCharge,
					"Company": leadData.Company,
					"Extra1": "EExtra1",
					"Extra2": "EExtra2",
					"CreatedOn": new Date(),
					"CreatedBy": "DemoUser"
				};
				debugger;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "POST", {},
						payload, this)
					.then(function(oData) {
						debugger;
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Customer Saved successfully");
						that.destroyMessagePopover();
						//that.getView().getModel("local").setProperty("/newCustomer");
						//oMultiInput.removeAllTokens();
						//that.oSuppPopup.close();

					}).catch(function(oError) {
						debugger;
						that.getView().setBusy(false);
						//sap.m.MessageToast.show(oError.responseText);
						var oPopover = that.getErrorMessage(oError);
						// var oMultiInput1 = .getView().getElementById("multiInputID");
						// oMultiInput1.removeAllTokens();
					});
			} else {
				//
				// "Star": leadData.Star,
				// "Defaulter": leadData.Defaulter,
				// "HighServerUsage": leadData.HighServerUsage,
				debugger;
				var vStar = " ";
				if (leadData.Star == true) {
					vStar = "true";
				} else {
					vStar = "false";
				}
				var vDfltr = " ";
				if (leadData.Defaulter == true) {
					vDfltr = "true";
				} else {
					vDfltr = "false";
				}
				var vSrvrUsage = " ";
				if (leadData.HighServerUsage == true) {
					vSrvrUsage = "true";
				} else {
					vSrvrUsage = "false";
				}


				var payload = {
					"GmailId": leadData.GmailId,
					"Name": leadData.Name,
					"CompanyMail": leadData.CompanyMail,
					"Country": leadData.Country,
					"Designation": leadData.Designation,
					"OtherEmail1": leadData.OtherEmail1,
					"OtherEmail2": leadData.OtherEmail2,
					"ContactNo": leadData.ContactNo,
					"Star": vStar, //leadData.Star,
					"Defaulter": vDfltr, //leadData.Defaulter,
					"HighServerUsage": vSrvrUsage, //leadData.HighServerUsage,
					"Skills": leadData.Skills,
					"Resume": this.FileContent, //.Resume,
					"Address": leadData.Address,
					"City": leadData.City,
					"GSTIN": leadData.GSTIN,
					"GSTCharge": leadData.GSTCharge,
					"Company": leadData.Company,
					"Extra1": "EExtra1",
					"Extra2": "EExtra2",
					"ChangedOn": new Date(),
					"ChangedBy": "DemoUser"
				};
				debugger;
				var sPath1 = "/Students";
				sPath1 = sPath1 + "(" + "\'" + that.customerGUID + "\'" + ")";

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath1, "PUT", {},
						payload, this)
					.then(function(oData) {
						debugger;
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Customer updated successfully");
						that.destroyMessagePopover();
						//that.getView().getModel("local").setProperty("/newCustomer");
						//oMultiInput.removeAllTokens();
						//that.oSuppPopup.close();

					}).catch(function(oError) {
						debugger;
						that.getView().setBusy(false);
						//sap.m.MessageToast.show(oError.responseText);
						var oPopover = that.getErrorMessage(oError);
						// var oMultiInput1 = .getView().getElementById("multiInputID");
						// oMultiInput1.removeAllTokens();
					});
			}
		},

		onLiveSearch: function(oEvent) {
			debugger;
			var queryString = oEvent.getParameter("query");
			if (!queryString) {
				queryString = oEvent.getParameter("value");
			}

			if (this.sId.indexOf("customerId") !== -1) {
				if (queryString) {

					var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("GmailId", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});

					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);

				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Students",
						template: new sap.m.DisplayListItem({
							label: "{Name}",
							value: "{GmailId}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}
			} else if (this.sId.indexOf("idEmailCust1") !== -1) {

				if (queryString) {

					var oFilter1 = new sap.ui.model.Filter("EmailId", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("FirstName", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});

					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);

				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Inquries",
						template: new sap.m.DisplayListItem({
							label: "{EmailId}",
							value: "{FirstName}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}
			}

		},
		onClearScreen: function(oEvent) {
			debugger;
			this.getView().getModel("local").setProperty("/newCustomer/GmailId", null);
			this.getView().getModel("local").setProperty("/newCustomer/Name", null);
			this.getView().getModel("local").setProperty("/newCustomer/Country", 'IN');
			this.getView().getModel("local").setProperty("/newCustomer/ContactNo", null);
			this.getView().getModel("local").setProperty("/newCustomer/OtherEmail1", null);
			this.getView().getModel("local").setProperty("/newCustomer/OtherEmail2", null);
			this.getView().getModel("local").setProperty("/newCustomer/Skills", null);
			this.getView().getModel("local").setProperty("/newCustomer/Star", false);
			this.getView().getModel("local").setProperty("/newCustomer/Defaulter", false);
			this.getView().getModel("local").setProperty("/newCustomer/HighServerUsage", false);
			this.getView().getModel("local").setProperty("/newCustomer/Address", "");
			this.getView().getModel("local").setProperty("/newCustomer/City", "");
			this.getView().getModel("local").setProperty("/newCustomer/GSTIN", "");
			this.getView().getModel("local").setProperty("/newCustomer/GSTCharge", false);
			this.getView().getModel("local").setProperty("/newCustomer/Company", "");

			this.getView().byId("idSkills1").clearSelection();
			this.getView().byId("createNew1").setText("Create");
			this.getView().byId("idSubs").destroyItems();
			this.getView().byId("idServer").destroyItems();
			this.getView().byId("idInquiries").destroyItems();

			this.UpdateCustomer = false;
			this.customerGUID = null;

		},

		handleSkillChange: function(oEvent) {
			// var changedItem = oEvent.getParameter("changedItem");
			// var isSelected = oEvent.getParameter("selected");
			//
			// var state = "Selected";
			// if (!isSelected) {
			// 	state = "Deselected";
			// }
			//
			// MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getText() + "'", {
			// 	width: "auto"
			// });
		},

		handleSkillFinish: function(oEvent) {
			var selectedItems = oEvent.getParameter("selectedItems");
			debugger;
			var SkillSet = ' ';
			for (var i = 0; i < selectedItems.length; i++) {
				SkillSet += selectedItems[i].getText();
				if (i != selectedItems.length - 1) {
					SkillSet += ",";
				}
			}
			this.getView().getModel("local").setProperty("/newCustomer/Skills", SkillSet);
		},

		onEmail: function(oEvent) {
			this.getView().byId("idName1").setEnabled(true);
		},
		onEmailExist: function(oEvent) {
			//debugger;
			var oLocal = oEvent;
			var that = this;
			oEvent.getSource().setValue(oEvent.getParameter("value").toLowerCase().split(' ').map(function(word) {
				return (word.charAt(0).toUpperCase() + word.slice(1));
			}).join(' '));
			// that.getView().setBusy(true);
			var leadData = this.getView().getModel("local").getProperty("/newCustomer");

			var payload = {};

			if (leadData.GmailId) {
				//oModel, sUrl, sMethod, oParameters, oPayload
				var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", leadData.GmailId);

				debugger;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
						filters: [Filter1]
					}, payload, this)

					.then(function(oData) {
						if (oData.results.length != 0) {
							that.getView().byId("createNew1").setText("Update");
							that.UpdateCustomer = true;
							that.customerGUID = oData.results[0].id;
							//that.CreateCustomer = false;
							sap.m.MessageToast.show("Email Exists. Use F4 help or Use suggestion on Email field to fetch values");
						} else {
							that.getView().byId("createNew1").setText("Create");
							that.UpdateCustomer = false;
							//that.CreateCustomer = true;
						}
					}).catch(function(oError) {
						//	that.getView().setBusy(false);
						debugger;
						sap.m.MessageToast.show("New Customer");
						that.getView().byId("createNew1").setText("Create");
						that.UpdateCustomer = false;
						//that.CreateCustomer = true;
						//var oPopover = that.getErrorMessage(oError);
					});

			} else {
				this.getView().byId("idName1").setEnabled(false);
				sap.m.MessageToast.show("Enter/select email id first");
			}

		},
		onDataExport: function(oEvent) {
			$.ajax({
				type: 'GET', // added,
				url: 'StudentDownload',
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully user->AppData->local->Temp");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});

		},
		onEnter: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("value").replace(/\s/gm, "").toLowerCase());
			this.getView().byId("idDelete").setEnabled(false);
			this.vEmail = oEvent.getParameters().value;
			var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (regEx.test(this.vEmail)) {
				var that = this;
				// that.getView().setBusy(true);

				var payload = {};

				var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", that.vEmail);
				var Filter2 = new sap.ui.model.Filter("OtherEmail1", "EQ", that.vEmail);
				var Filter3 = new sap.ui.model.Filter("OtherEmail2", "EQ", that.vEmail);


				var oFilter = new sap.ui.model.Filter({
					filters: [Filter1, Filter2, Filter3],
					and: false
				});

				debugger;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
						// filters: [Filter1]
						filters: [oFilter]
					}, payload, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
							that.getView().byId("idEmailCust1").setValue(oData.results[0].GmailId);
							that.getView().byId("idName1").setValue(oData.results[0].Name);
							that.getView().getModel("local").setProperty("/newCustomer",
								oData.results[0]
							);
							if (oData.results[0].ContactNo) {
								that.getView().byId("idPhone1").setValue(oData.results[0].ContactNo);
							} else {
								that.getView().byId("idPhone1").setValue(0);
							}

							if (oData.results[0].Country) {
								that.getView().byId("idCountry1").setSelectedKey(oData.results[0].Country);
							} else {
								that.getView().byId("idCountry1").setSelectedKey("IN");
							}
							if (oData.results[0].OtherEmail1) {
								that.getView().byId("idOtherEmail11").setValue(oData.results[0].OtherEmail1);
							}
							if (oData.results[0].OtherEmail2) {
								that.getView().byId("idOtherEmail21").setValue(oData.results[0].OtherEmail2);
							}

							// if (oData.results[0].Defaulter) {
							that.getView().byId("idDefaulter1").setSelected(oData.results[0].Defaulter);
							// }

							// if (oData.results[0].HighServerUsage) {
							that.getView().byId("idHighServerUsage1").setSelected(oData.results[0].HighServerUsage);
							// }
							// if (oData.results[0].Star) {
							that.getView().byId("idStar1").setSelected(oData.results[0].Star);
							//}

							that.getView().byId("createNew1").setText("Update");
							that.UpdateCustomer = true;
							that.customerGUID = oData.results[0].id;

							var that2 = that;
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Students('" + oData.results[0].id + "')/Subscriptions", "GET", {}, payload, that)
								.then(function(oData) {
									var that3 = that2;
									if (oData.results.length == 0) {
										that2.getView().byId("idDelete").setEnabled(true);
										// DeleteCust1 = true;
									} else {
										// DeleteCust1 = false;
										that2.getView().byId("idDelete").setEnabled(false);
									}
									for (var i = 0; i < oData.results.length; i++) {

										that2.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Courses('" + oData.results[i].CourseId + "')", "GET", {}, payload, that2)
											.then(function(oData) {
												var allSubs = that3.getView().getModel("local").getProperty("/AllSubs");
												for (var i = 0; i < allSubs.length; i++) {
													if (allSubs[i].CourseId === oData.id) {
														allSubs[i].CourseId = oData.BatchNo;
													}
												}
												that3.getView().getModel("local").setProperty("/AllSubs", allSubs);
											});
									}

									that2.getView().getModel("local").setProperty("/AllSubs", oData.results);
									// that2.getView().byId("idSubs").bindItems({
									// 	path: "local>/AllSubs",
									// 	template: new sap.m.DisplayListItem({
									// 		label: "{local>CourseId}",
									// 		value: "{local>PaymentDate}"
									// 	})
									// });
									// console.log(oData);
								});
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Students('" + oData.results[0].id + "')/Servers", "GET", {}, payload, that)
								.then(function(oData) {
									if (oData.results.length == 0) {
										that2.getView().byId("idDelete").setEnabled(true);
										// DeleteCust2 = true;
									} else {
										// DeleteCust2 = false;
										that2.getView().byId("idDelete").setEnabled(false);
									}
									that2.getView().getModel("local").setProperty("/AllServer", oData.results);
									that2.getView().byId("idServer").bindItems({
										path: "local>/AllServer",
										template: new sap.m.DisplayListItem({
											label: "{local>User}",
											value: "{local>EndDate}"
										})
									});
									console.log(oData);
								});
							//that.CreateCustomer = false;

							var Filter1 = new sap.ui.model.Filter("EmailId", "EQ", oData.results[0].GmailId);
							// var that2 = that;
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Inquries", "GET", {
									filters: [Filter1]
								}, payload, that)
								.then(function(oData) {
									that2.getView().getModel("local").setProperty("/AllInquiries", oData.results);
									that2.getView().byId("idInquiries").bindItems({
										path: "local>/AllInquiries",
										template: new sap.m.DisplayListItem({
											label: "{local>EmailId}",
											value: "{local>CourseName}"
										})
									});



								});

						} else {

							var vLastName;
							var vFirstName;
							var that2 = that;

							var payload = {};

							var Filter1 = new sap.ui.model.Filter("EmailId", "EQ", that.vEmail);

							debugger;
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Inquries", "GET", {
									filters: [Filter1]
								}, payload, that)
								.then(function(oData) {
									if (oData.results.length != 0) {
										that2.getView().byId("idEmailCust1").setValue(oData.results[0].EmailId);
										that2.getView().byId("idName1").setValue(oData.results[0].Name);
										if (oData.results[0].FirstName) {
											if (oData.results[0].LastName) {
												vLastName = oData.results[0].LastName;
											} else {
												vLastName = " ";
											}
											that2.getView().byId("idName1").setValue(oData.results[0].FirstName + ' ' + vLastName);
										} else {
											vFirstName = "";
											if (oData.results[0].LastName) {
												vLastName = oData.results[0].LastName;
											} else {
												vLastName = "";
											}
											that2.getView().byId("idName1").setValue(vFirstName + ' ' + vLastName);
										}
										if (oData.results[0].Phone) {
											that2.getView().byId("idPhone1").setValue(oData.results[0].Phone);
										} else {
											that2.getView().byId("idPhone1").setValue(0);
										}

										if (oData.results[0].Country) {
											that2.getView().byId("idCountry1").setSelectedKey(oData.results[0].Country);
										} else {
											that2.getView().byId("idCountry1").setSelectedKey("IN");
										}

										that2.getView().byId("createNew1").setText("Create");
										that2.UpdateCustomer = false;
										//that.CreateCustomer = false;
									} else {
										that2.getView().byId("createNew1").setText("Create");
										that2.UpdateCustomer = false;
									}
								}).catch(function(oError) {
									//that2.getView().setBusy(false);
									//sap.m.MessageToast.show(oError.responseText);
									var oPopover = that2.getErrorMessage(oError);
								});
						}
					}).catch(function(oError) {
						//that.getView().setBusy(false);
						//sap.m.MessageToast.show(oError.responseText);
						var oPopover = that.getErrorMessage(oError);
					});

			} else {
				sap.m.MessageToast.show("Invalid email id");
				return "";
			}

		},
		onDeleteCust: function(oEvent) {
			var that = this;
			that.getView().setBusy(true);
			var Filter1 = new sap.ui.model.Filter("StudentId", "EQ", "'" + that.customerGUID + "'");
			that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Subs", "GET", {
					filters: [Filter1]
				}, {}, that)
				.then(function(subsData) {
					if (subsData.results.length < 1) {
						MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
							if (conf == 'OK') {
								var sPath = "/Students('" + that.customerGUID + "')";
								that.ODataHelper.callOData(that.getOwnerComponent().getModel(), sPath, "DELETE", {}, {}, that)
									.then(function(oData) {
										that.getView().byId("idDelete").setEnabled(false);
										that.getView().setBusy(false);
										sap.m.MessageToast.show("Deleted succesfully");
									}).catch(function(oError) {
										that.getView().setBusy(false);
										that.oPopover = that.getErrorMessage(oError);
									});
							}
						}, "Confirmation");
					} else {
						that.getView().setBusy(false);
						sap.m.MessageToast.show(subsData.results.length + " Subscription found, can't delete");
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					that.oPopover = that.getErrorMessage(oError);
				});
		}
	});

});
