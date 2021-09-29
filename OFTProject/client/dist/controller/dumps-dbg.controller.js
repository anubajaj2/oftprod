var courseGUID;
var customerGUID;
var vEmail;
var CourseFee;
sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter", //PJHA,
	'sap/m/Token',
	"sap/ui/model/FilterOperator"
], function(Controller, MessageBox, MessageToast, Formatter, oFilter, oToken, FilterOperator) { //PJHA
	"use strict";

	return Controller.extend("oft.fiori.controller.dumps", {
		formatter: Formatter,

		// fnOnUpLoadFile: function(oEvent) {
		// 	var oFileUploader = this.getView().byId("imageUploader");
		// 	var domRef = oFileUploader.getFocusDomRef();
		// 	var file = domRef.files[0];
		// 	var that = this;
		// 	if (file) {
		// 		var that = this;
		// 		this.fileName = file.name;
		// 		this.fileType = file.type;
		// 		var reader = new FileReader();
		// 		reader.onload = function(e) {
		//
		// 			//get an access to the content of the file
		// 			that.imgContent = e.currentTarget.result; //e.currentTarget.result.replace("data:image/jpeg;base64,", "");
		// 			//that.encoded = btoa(encodeURI(that.imgContent));
		// 		};
		// 		//File Reader will start reading the file
		// 		reader.readAsDataURL(file);
		// 	}
		// },

		// handleTypeMissmatch: function(oEvent) {
		// 	var aFileTypes = oEvent.getSource().getFileType();
		// 	jQuery.each(aFileTypes, function(key, value) {
		// 		aFileTypes[key] = "*." + value;
		// 	});
		// 	var sSupportedFileTypes = aFileTypes.join(", ");
		// 	MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
		// 		" is not supported. Choose one of the following types: " +
		// 		sSupportedFileTypes);
		// },

		// handleSizeExceed: function(oEvent) {
		// 	var fFileSize = oEvent.getSource().getMaximumFileSize();
		// 	MessageToast.show("Maximun file size allowed is " + fFileSize + " MB");
		// },
		// onReplicateOneSub: function() {
		// 	var that = this;
		// 	const courseId = this.getView().byId("idCourseId").getValue();
		// 	const name = this.getView().byId("batch").getValue();
		// 	var payload = {
		// 		Name: name,
		// 		BatchNo: courseId
		// 	};
		// 	if (courseId && name) {
		// 		MessageBox.confirm("are you sure?", function(val) {
		// 			if (val === "OK") {
		// 				that.getView().byId("idReplicateBatches").setEnabled(false);
		// 				MessageToast.show("Replication started, Please Wait...");
		// 				$.post('/replicateOneSubToStudentPortal', payload)
		// 					.done(function(data, status) {
		// 						MessageBox.success(JSON.stringify(data));
		// 						that.getView().byId("idReplicateBatches").setEnabled(true);
		// 					})
		// 					.fail(function(xhr, status, error) {
		// 						that.getView().byId("idReplicateBatches").setEnabled(true);
		// 						MessageBox.error("Error in access");
		// 					});
		// 			}
		// 		});
		// 	} else {
		// 		MessageToast.show("Please select a subscription");
		// 	}
		// },
		// onScreenShot: function(oEvent) {
		// 	var that = this;
		// 	var sPath = oEvent.getSource().getBindingContext().sPath;
		// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "GET", {}, {}, this)
		// 		.then(function(oData) {
		// 			var imgContent = oData.PaymentScreenshot;
		//
		// 			var oDialog = new sap.m.Dialog({
		// 				title: "Payment Screen Shot"
		// 				// contentWidth: auto,
		// 				// contentHeight: auto
		// 			});
		//
		// 			oDialog.addButton(new sap.m.Button({
		// 				text: "OK",
		// 				press: function() {
		// 					oDialog.close();
		// 					oDialog.destroyContent();
		// 				}
		// 			}));
		//
		// 			var oCarousel = new sap.m.Carousel({
		// 				loop: true
		// 			});
		//
		// 			var oPayImg = new sap.m.Image({
		// 				src: imgContent,
		// 				alt: "",
		// 				densityAware: true,
		// 				decorative: false
		// 			})
		//
		// 			oCarousel.addPage(oPayImg);
		// 			oDialog.addContent(oCarousel);
		// 			oDialog.open();
		//
		// 		}).catch(function(oError) {
		// 			var oPopover = that.getErrorMessage(oError);
		// 		});
		// },

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.totalCount = 0;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			}

			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
			this.UserRole = this.getOwnerComponent().getModel("local").getProperty("/Role");
			// var oRoleJsonCC = new sap.ui.model.json.JSONModel();
			// // var oStuModel = this.getOwnerComponent().getModel();
			// oRoleModel.read('/Role', {
			// 	success: function(oData, response) {
			//
			// 		oRoleJsonCC.setData(oData);
			// 	},
			// 	error: function(response) {}
			// });



			var oStuModel = this.getOwnerComponent().getModel();
			var oModelJsonCC = new sap.ui.model.json.JSONModel();
			// var oStuModel = this.getOwnerComponent().getModel();
			oStuModel.read('/Students', {
				success: function(oData, response) {
					oModelJsonCC.setData(oData);
				},
				error: function(response) {}
			});

			//var oModelJsonCC = new sap.ui.model.json.JSONModel();
			var oCourseModel = this.getOwnerComponent().getModel();
			oCourseModel.read('/Courses', {
				success: function(oData, response) {
					oModelJsonCC.setData(oData);
				},
				error: function(response) {}
			});

			this.oRouter.attachRoutePatternMatched(this.herculis, this);

		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		siteLink: "",
		eMailId: "",
		onSaveDump: function() {
			var that = this;
			var payload = this.getView().getModel("local").getProperty("/dump");
			var keys = Object.keys(payload);
			for (var i = 0; i < keys.length; i++) {
				if (payload[keys[i]] === null) {
					return;
				}
			}
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Dumps", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("dump Saved successfully");
					this.createDumpPopup.close();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("dump Saving failed " + oError.responseText);
				});
		},
		onSaveDumpSold: function() {
			// debugger;
			var that = this;
			var payload = this.getView().getModel("local").getProperty("/dumpSold");
			// var keys = Object.keys(payload);
			// for (var i = 0; i < keys.length; i++) {
			// 	if (payload[keys[i]] === null) {
			// 		return;
			// 	}
			// }
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/DumpSolds", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("dump Saved successfully");
					if (that.getView().byId("idRecent").getBinding("items")) {
						that.getView().byId("idRecent").getBinding("items").refresh();
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("dump sold Saving failed " + oError.responseText);
				});
		},
		onDumpChange: function(oEvent) {
			var dump = oEvent.getParameter("selectedItem").getBindingContext().getObject();
			this.getView().getModel("local").setProperty("/dumpSold/fees", dump.fees);
			this.getView().getModel("local").setProperty("/dumpSold/currency", dump.currency);
			this.getView().getModel("local").setProperty("/dumpSold/source", dump.Link);
		},
		// onGiveAccess2: function(oEvent) {
		// 	var that = this;
		// 	var items = that.getView().byId('idRecent').getSelectedContexts();
		//
		// 	for (var i = 0; i < items["length"]; i++) {
		//
		// 		var loginPayload = items[i].getModel().getProperty(items[i].getPath());
		// 		$.post('/giveAccessNew', loginPayload)
		// 			.done(function(data, status) {
		// 				MessageToast.show("Access has been provided");
		// 			})
		// 			.fail(function(xhr, status, error) {
		// 				MessageBox.error("Error in access");
		// 			});
		// 	}
		// },
		// onGiveAccess: function(oEvent) {
		// 	var that = this;
		// 	var items = that.getView().byId('idRecent').getSelectedContexts();
		//
		// 	for (var i = 0; i < items["length"]; i++) {
		//
		// 		var loginPayload = items[i].getModel().getProperty(items[i].getPath());
		// 		debugger;
		// 		// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
		// 		// 		"/Students('" + loginPayload.StudentId + "')",
		// 		// 		"GET", {}, {}, this)
		// 		// 	.then(function(oData) {
		// 		// 		var that2 = that;
		// 		// 		that.eMailId = oData.GmailId;
		// 		// 		that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
		// 		// 				"/Courses('" + loginPayload.CourseId + "')",
		// 		// 				"GET", {}, {}, that)
		// 		// 			.then(function(oData) {
		// 		// 				var myUri = oData.Link +
		// 		// 					"/system/app/pages/admin/commonsharing?invite=" + that2.eMailId;
		// 		// 				myUri = myUri.replace("//", "/");
		// 		// 				window.open(myUri);
		// 		//
		// 		// 			});
		// 		// 	});
		//
		//
		//
		// 		$.post('/giveAccess', loginPayload)
		// 			.done(function(data, status) {
		// 				sap.m.MessageToast.show("Access has been provided");
		// 			})
		// 			.fail(function(xhr, status, error) {
		// 				sap.m.MessageBox.error("Error in access");
		// 			});
		// 	}
		// },
		// onClearToken: function() {
		// 	$.post('/clearToken')
		// 		.done(function(data, status) {
		// 			sap.m.MessageToast.show("Token is now reset");
		// 		})
		// 		.fail(function(xhr, status, error) {
		// 			sap.m.MessageBox.error("Error in access");
		// 		});
		// },
		// onSendEmail: function(oEvent) {
		// 	var that = this;
		// 	var items = that.getView().byId('idRecent').getSelectedContexts();
		//
		// 	for (var i = 0; i < items["length"]; i++) {
		//
		// 		var loginPayload = items[i].getModel().getProperty(items[i].getPath());
		// 		debugger;
		// 		// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
		// 		// 		"/Students('" + loginPayload.StudentId + "')",
		// 		// 		"GET", {}, {}, this)
		// 		// 	.then(function(oData) {
		// 		// 		var that2 = that;
		// 		// 		that.eMailId = oData.GmailId;
		// 		// 		that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
		// 		// 				"/Courses('" + loginPayload.CourseId + "')",
		// 		// 				"GET", {}, {}, that)
		// 		// 			.then(function(oData) {
		// 		// 				var myUri = oData.Link +
		// 		// 					"/system/app/pages/admin/commonsharing?invite=" + that2.eMailId;
		// 		// 				myUri = myUri.replace("//", "/");
		// 		// 				window.open(myUri);
		// 		//
		// 		// 			});
		// 		// 	});
		//
		// 		var that = this;
		// 		var payload3 = {
		// 			"Status": "Access Granted"
		// 		};
		// 		if (this.passwords === "") {
		// 			this.passwords = prompt("Please enter your password", "");
		// 			if (this.passwords === "") {
		// 				sap.m.MessageBox.error("Blank Password not allowed");
		// 				return;
		// 			}
		// 		}
		// 		loginPayload.password = that.passwords;
		// 		loginPayload.includeX = that.getView().byId("includeX").getSelected();
		// 		$.post('/sendSubscriptionEmail', loginPayload)
		// 			.done(function(data, status) {
		// 				sap.m.MessageToast.show("Email sent successfully");
		// 			})
		// 			.fail(function(xhr, status, error) {
		// 				that.passwords = "";
		// 				sap.m.MessageBox.error(xhr.responseText);
		// 			});
		// 	}
		//
		// },
		oSuppPopup: null,
		destoryDialog: function() {
			this.oSuppPopup.destroy();
			this.oSuppPopup = null;
		},
		// onItemPress: function(oEvent) {
		// 	if (!this.oSuppPopup) {
		// 		this.oSuppPopup = new sap.ui.xmlfragment("oft.fiori.fragments.subSearch", this);
		// 		sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
		// 		this.getView().addDependent(this.oSuppPopup);
		// 	}
		// 	sap.ui.getCore().byId("updPay").setVisible(false);
		// 	sap.ui.getCore().byId("idPortSubs").setVisible(false);
		// 	sap.ui.getCore().byId("idExtendSubs").setVisible(false);
		//
		// 	var sPath = oEvent.getSource().oBindingContexts.undefined.sPath;
		// 	sPath = sPath.split("/")[1];
		// 	var oModel = this.getView().getModel().oData[sPath];
		//
		//
		// 	sap.ui.getCore().byId("idCourse_upd").setEnabled(false);
		// 	sap.ui.getCore().byId("idPayDate_upd").setEnabled(false);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", oModel.PaymentDate);
		// 	sap.ui.getCore().byId("idEndDate_upd").setEnabled(false);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/EndDate", oModel.EndDate);
		// 	sap.ui.getCore().byId("paymentMode_upd").setEnabled(false);
		// 	sap.ui.getCore().byId("accountDetails_upd").setEnabled(false);
		// 	sap.ui.getCore().byId("idAmount_upd").setEnabled(false);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/Amount", oModel.Amount);
		// 	sap.ui.getCore().byId("idAmount_Txt").setText("Amount");
		// 	sap.ui.getCore().byId("idReference_upd").setEnabled(false);
		// 	sap.ui.getCore().byId("idRemarks_upd").setEnabled(false);
		// 	sap.ui.getCore().byId("idPendingAmount_upd").setEnabled(false);
		// 	sap.ui.getCore().byId("idPayDueDate_upd").setEnabled(false);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", oModel.PaymentDueDate);
		//
		//
		// 	this.customerEmail = oEvent.getSource().mAggregations.cells[0].mProperties.text;
		// 	this.courseName = oEvent.getSource().mAggregations.cells[1].mProperties.text;
		// 	this.prevPendingAmiount = oModel.PendingAmount;
		//
		// 	this.getView().getModel("local").setProperty("/newRegistration/StudentId", this.customerEmail);
		// 	this.getView().getModel("local").setProperty("/newRegistration/CourseId", this.courseName);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", this.formatter.getFormattedDate(0));
		// 	// this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", this.formatter.getFormattedDate(1));
		// 	this.getView().getModel("local").setProperty("/newRegistration/PaymentMode", oModel.PaymentMode);
		// 	this.getView().getModel("local").setProperty("/newRegistration/AccountName", oModel.AccountName);
		//
		// 	this.getView().getModel("local").setProperty("/BeneficiaryName", this.getAccountBeneficiary(oModel.AccountName));
		//
		// 	// if (oModel.PendingAmount) {
		// 	this.getView().getModel("local").setProperty("/newRegistration/Amount", oModel.Amount); //set the amount to the pending amount of last payment
		// 	// }
		// 	// else {
		// 	// 	this.getView().getModel("local").setProperty("/newRegistration/Amount", 0);
		// 	// }
		// 	this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", oModel.PendingAmount);
		// 	this.getView().getModel("local").setProperty("/newRegistration/Reference", oModel.Reference);
		// 	this.getView().getModel("local").setProperty("/newRegistration/Remarks", oModel.Remarks);
		// 	this.getView().getModel("local").setProperty("/newRegistration/USDAmount", oModel.USDAmount);
		// 	this.getView().getModel("local").setProperty("/newRegistration/Charges", oModel.Charges);
		// 	this.getView().getModel("local").setProperty("/newRegistration/Exchange", oModel.Exchange);
		// 	this.getView().getModel("local").setProperty("/newRegistration/SettleAmount", oModel.SettleAmount);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", 0);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/AccountName", oModel.AccountName);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/subGuid", oModel.id);
		//
		// 	this.oSuppPopup.open();
		// },

		onDeleteDumpSold: function(oEvent) {
			var that = this;
			MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
				if (conf == 'OK') {
					var items = that.getView().byId('idRecent').getSelectedContexts();
					//that.totalCount = that.totalCount - items.length;
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
		// onRefresh: function() {
		//
		// 	var dateString = this.getView().byId("idPayDate");
		// 	var from = dateString._lastValue.split(".");
		// 	// var dateObject = new Date(from[2], from[1] - 1, from[0]);
		// 	var newDate = new Date(from[2], from[1] - 1, from[0]);
		// 	// var PaymentDueDate = this.formatter.getIncrementDate(dateObject, 1);
		// 	// this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", PaymentDueDate);
		// 	newDate.setHours(0, 0, 0, 0);
		// 	// var oSorter = new sap.ui.model.Sorter("PaymentDate", false);
		// 	var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
		// 	// var oFilter1 = new sap.ui.model.Filter("PaymentDate", "LE", newDate);
		// 	var oFilter2 = new sap.ui.model.Filter("PaymentDate", "GE", newDate);
		// 	// var oFilter = new sap.ui.model.Filter({
		// 	// 	filters: [oFilter1, oFilter2],
		// 	// 	and: true
		// 	// });
		// 	var oTable = this.getView().byId("idRecent");
		// 	var itemList = oTable.getItems();
		// 	// var noOfItems = itemList.length;
		// 	oTable.getBinding("items").filter(oFilter2); //oFilter
		// 	oTable.getBinding("items").sort(oSorter);
		// },
		// onRate: function(oEvent) {
		//
		// 	this.oEvent_approve = oEvent;
		// 	var sPath = oEvent.getSource().getBindingContext().sPath;
		// 	var that = this;
		// 	if (oEvent.getSource().getValue() === 0) {
		// 		var payload3 = {
		// 			"ExtraN1": ""
		// 		};
		// 	} else {
		// 		var payload3 = {
		// 			"ExtraN1": oEvent.getSource().getValue()
		// 		};
		// 	}
		//
		// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {}, payload3, this)
		// 		.then(function(oData) {
		// 			sap.m.MessageToast.show("Star mark success");
		// 		}).catch(function(oError) {
		// 			that.getView().setBusy(false);
		// 			var oPopover = that.getErrorMessage(oError);
		//
		// 		});
		// },
		// onUSDAmountChange: function(oEvent) {
		// 	var amt = oEvent.getParameter("value");
		// 	var charges = amt > 0 ? ((amt * 0.044 + 0.30) * 1.18).toFixed(2) : 0;
		// 	var exchange = this.getView().getModel("local").getProperty("/newRegistration/Exchange");
		// 	this.getView().getModel("local").setProperty("/newRegistration/Charges", charges);
		// 	this.getView().getModel("local").setProperty("/newRegistration/SettleAmount", ((amt - charges) * exchange).toFixed(2));
		// 	this.getView().getModel("local").setProperty("/newRegistration/Amount", (amt * exchange).toFixed(2));
		// },
		// onChargesChange: function(oEvent) {
		// 	var charges = oEvent.getParameter("value");
		// 	var amt = this.getView().getModel("local").getProperty("/newRegistration/USDAmount");
		// 	var exchange = this.getView().getModel("local").getProperty("/newRegistration/Exchange");
		// 	this.getView().getModel("local").setProperty("/newRegistration/Charges", charges);
		// 	this.getView().getModel("local").setProperty("/newRegistration/SettleAmount", ((amt - charges) * exchange).toFixed(2));
		// },
		// onExchangeChange: function(oEvent) {
		// 	var exchange = oEvent.getParameter("value");
		// 	var charges = this.getView().getModel("local").getProperty("/newRegistration/Charges");
		// 	var amt = this.getView().getModel("local").getProperty("/newRegistration/USDAmount");
		// 	this.getView().getModel("local").setProperty("/newRegistration/Charges", charges);
		// 	this.getView().getModel("local").setProperty("/newRegistration/SettleAmount", ((amt - charges) * exchange).toFixed(2));
		// 	this.getView().getModel("local").setProperty("/newRegistration/Amount", (amt * exchange).toFixed(2));
		// },
		// onSaveSubs: function(oEvent) {
		// 	//TODO: Save to Coustomer Reg. table
		// 	//console.log(this.getView().getModel("local").getProperty("/newRegistration"));
		// 	this.subsciptionSaved = "false";
		// 	var oLocal = oEvent;
		// 	var that = this;
		// 	var leadData = this.getView().getModel("local").getProperty("/newRegistration");
		// 	var futureDateCheck = false;
		// 	if (this.getView().byId("idPayDate").getDateValue()) {
		// 		futureDateCheck = this.formatter.getDateCheck(this.getView().byId("idPayDate").getDateValue());
		// 		if (futureDateCheck == true) {
		// 			sap.m.MessageToast.show("Payment Date can't be in future");
		// 			return "";
		// 		}
		// 	}
		// 	if (this.getView().byId("idRegDate").getDateValue()) {
		//
		// 		futureDateCheck = false;
		// 		futureDateCheck = this.formatter.getDateCheck(this.getView().byId("idRegDate").getDateValue());
		// 		if (futureDateCheck == true) {
		// 			sap.m.MessageToast.show("Registration Date can't be in future");
		// 			return "";
		// 		}
		// 	}
		// 	if (this.getView().byId("paymentMode").getSelectedKey() === "PAYPAL" && this.getView().byId("idUSDAmount").getValue() < 1) {
		// 		MessageBox.alert("USD Amount can't be 0 / less than 0");
		// 		return "";
		// 	}
		// 	if ((!this.getView().byId("idAmount").getValue()) || (this.getView().byId("idAmount").getValue() <= 0)) {
		//
		// 		if (this.getView().byId("idAmount").getValue() == 0) {
		// 			if (this.getView().byId("idWaiver").getSelected() == false) {
		// 				if (this.getView().byId("idPartPay").getSelected() == false) {
		// 					sap.m.MessageToast.show("Amount can't be 0, if waiver/partial payment not applied");
		// 					return "";
		// 				}
		// 			}
		// 		} else if (this.getView().byId("idAmount").getValue() < 0) {
		// 			sap.m.MessageToast.show("Amount can't be less than 0");
		// 			return "";
		// 		}
		//
		// 	}
		// 	if (this.getView().byId("idPendingAmount").getValue() < 0) {
		// 		sap.m.MessageToast.show("Pending Amount can't be less than 0");
		// 		return "";
		//
		// 	} else if (this.getView().byId("idPendingAmount").getValue() > 0) {
		// 		if (this.getView().byId("idPartPay").getSelected() == false) {
		// 			sap.m.MessageToast.show("Please check \"Partial Payment\" flag as Pending Amount is there");
		// 			return "";
		// 		}
		// 	} else if (this.getView().byId("idPendingAmount").getValue() == 0) {
		// 		if (this.getView().byId("idPartPay").getSelected() == true) {
		// 			sap.m.MessageToast.show("Please uncheck \"Partial Payment\" flag as Pending Amount is 0");
		// 			return "";
		// 		}
		// 	}
		//
		// 	if (this.getView().byId("idPayDueDate").getDateValue()) {
		//
		// 		var PayDueDate = this.getView().byId("idPayDueDate").getValue().split(".");
		// 		var PayDate = this.getView().byId("idPayDate").getValue().split(".");
		// 		// var PayDate = this.getView().byId("idPayDate").getDateValue().getFullYear().toString() +
		// 		// 	this.getView().byId("idPayDate").getDateValue().getMonth().toString() +
		// 		// 	this.getView().byId("idPayDate").getDateValue().getDate().toString();
		//
		// 		PayDate = PayDate[2] + PayDate[1] + PayDate[0];
		// 		PayDueDate = PayDueDate[2] + PayDueDate[1] + PayDueDate[0];
		//
		// 		if (PayDate > PayDueDate) {
		// 			sap.m.MessageToast.show("Payment Due Date can't be less than Payment Date");
		// 			return "";
		// 		}
		// 	}
		//
		// 	//check for existing inquiry for given email id and course id:
		// 	// var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
		// 	// sPath = sPath.split("/")[1];
		// 	// var oCourseId = this.getView().getModel().oData[sPath].StudentId;
		// 	//  var oCourseId = 'Courses(\'' + this.courseId + '\')';
		// 	//  var oModel = this.getView().getModel().oData[oCourseId];
		// 	// if (oModel) {
		// 	// 	var CourseName = oModel.Name; //got the course anme from screen
		// 	// }
		//
		// 	//that.encoded = "Prasun";
		// 	//--- BOC  -Venkat -19/02/2019
		// 	// var oFileUploader = this.getView().byId("imageUploader");
		// 	// var domRef = oFileUploader.getFocusDomRef();
		// 	// var file = domRef.files[0];
		// 	// if (file) {
		// 	// 	var that = this;
		// 	// 	this.fileName = file.name;
		// 	// 	this.fileType = file.type;
		// 	// 	var reader = new FileReader();
		// 	// 	reader.onload = function(e) {
		// 	//
		// 	// 		//get an access to the content of the file
		// 	// 		that.imgContent = e.currentTarget.result.replace("data:image/jpeg;base64,", "");
		// 	// 		//that.encoded = btoa(encodeURI(that.imgContent));
		// 	// 	};
		// 	// 	//File Reader will start reading the file
		// 	// 	reader.readAsDataURL(file);
		// 	// }
		// 	//--- EOC  -Venkat -19/02/2019
		//
		// 	var interested = this.getView().byId("idInterested").getSelected();
		// 	if (interested == true) {
		// 		leadData.ExtraN1 = 1;
		// 	} else {
		// 		leadData.ExtraN1 = 0;
		// 	}
		//
		// 	var vStatus = null;
		// 	if (this.UserRole == "Admin" || this.getModel("local").getData().CurrentUser === "5c187036dba2681834ffe305") {
		// 		vStatus = "Approved";
		// 	} else {
		// 		vStatus = "Pending";
		// 	}
		//
		// 	var payload = {
		// 		"StudentId": this.customerId, //customerGUID, //leadData.StudentId,
		// 		"CourseId": this.courseId, //courseGUID, //leadData.CourseId,
		// 		"PaymentDate": this.getView().byId("idPayDate").getDateValue(), // leadData.PaymentDate,
		// 		"Mode": leadData.Mode,
		// 		"StartDate": this.getView().byId("idRegDate").getDateValue(), //leadData.StartDate,
		// 		"EndDate": this.getView().byId("idRegEndDate").getDateValue(), //leadData.EndDate,
		// 		"PaymentMode": leadData.PaymentMode,
		// 		"BankName": leadData.BankName,
		// 		"AccountName": leadData.AccountName,
		// 		"Amount": leadData.Amount,
		// 		"Reference": leadData.Reference,
		// 		"Remarks": leadData.Remarks,
		// 		"PendingAmount": leadData.PendingAmount,
		// 		"Waiver": leadData.Waiver,
		// 		//	"Moved": leadData.Moved,
		// 		"PartialPayment": leadData.PartialPayment,
		// 		"PaymentDueDate": this.getView().byId("idPayDueDate").getDateValue(), //leadData.PaymentDueDate,
		// 		"PaymentScreenshot": this.imgContent, //this.encoded, //btoa(encodeURI(this.imgContent)),
		// 		"CreatedOn": new Date(),
		// 		"CreatedBy": "DemoUser",
		// 		"ChangedOn": new Date(),
		// 		"ChangedBy": "DemoUser",
		// 		"DropOut": false,
		// 		"Extra1": " ",
		// 		"Extra2": leadData.Extra2,
		// 		"ExtraN1": leadData.ExtraN1,
		// 		"ExtraN2": 0,
		// 		"ExtraN3": 0,
		// 		"UpdatePayment": false,
		// 		"MostRecent": true,
		// 		"Status": vStatus,
		// 		"USDAmount": leadData.USDAmount,
		// 		"Charges": leadData.Charges,
		// 		"Exchange": leadData.Exchange,
		// 		"SettleAmount": leadData.SettleAmount
		// 	};
		//
		// 	if (!this.isDefaulter) {
		// 		that.getView().setBusy(true);
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Subs", "POST", {},
		// 				payload, this)
		// 			.then(function(oData) {
		//
		// 				that.getView().setBusy(false);
		// 				that.subsciptionSaved = "true";
		// 				sap.m.MessageToast.show("Subscription Saved successfully");
		// 				that.destroyMessagePopover();
		// 			}).catch(function(oError) {
		//
		// 				that.getView().setBusy(false);
		// 				that.subsciptionSaved = "false";
		// 				var oPopover = that.getErrorMessage(oError);
		// 			});
		// 	} else {
		// 		sap.m.MessageToast.show("Student is defaulter");
		// 	}
		// },

		// onStartChange: function(oEvent) {
		// 	var dateString = oEvent.getSource().getValue();
		// 	var from = dateString.split(".");
		// 	var dateObject = new Date(from[2], from[1] - 1, from[0]);
		//
		// 	var endDate = this.formatter.getIncrementDate(dateObject, 8);
		// 	this.getView().getModel("local").setProperty("/newRegistration/EndDate", endDate);
		// 	//	console.log(endDate);
		// },
		onPayDateChange: function(oEvent) {

			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var newDate = new Date(from[2], from[1] - 1, from[0]);
			// var PaymentDueDate = this.formatter.getIncrementDate(dateObject, 1);
			newDate.setHours(0, 0, 0, 0);
			// var oSorter = new sap.ui.model.Sorter("PaymentDate", false);
			var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
			// var oFilter1 = new sap.ui.model.Filter("PaymentDate", "LE", newDate);
			var oFilter2 = new sap.ui.model.Filter("Date", "GE", newDate);
			// var oFilter = new sap.ui.model.Filter({
			// 	filters: [oFilter1, oFilter2],
			// 	and: true
			// });
			var oTable = this.getView().byId("idRecent");
			var itemList = oTable.getItems();

			// var noOfItems = itemList.length;
			oTable.getBinding("items").filter(oFilter2); //oFilter
			oTable.getBinding("items").sort(oSorter);
		},

		herculis: function(oEvent) {
			if (oEvent.getParameter("name") !== "newreg") {
				return;
			}
			var newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			var oSorter = new sap.ui.model.Sorter("CreatedOn", true);

			var oTable = this.getView().byId("idRecent");
			var itemList = oTable.getItems();

			// var noOfItems = itemList.length;

			var oFilter2 = new sap.ui.model.Filter("PaymentDate", "GE", newDate);
			oTable.getBinding("items").filter(oFilter2); //oFilter
			oTable.getBinding("items").sort(oSorter);
			// oTable.getHeaderToolbar().getContent()[0].setText("Today : " + noOfItems);
			// var oList = this.getView().byId("idSubsByDate");
			//
			// oList.attachUpdateFinished(function(oEvent) {
			//
			// 	var oList = oEvent.getSource(); //.getItems()[0].getLabel();;
			// 	var itemList = oList.getItems();
			// 	var noOfItems = itemList.length;
			// 	for (var i = 0; i < noOfItems; i++) {
			// 		var vCourse = itemList[i].getLabel().split("-")[1];
			// 		var vStudent = itemList[i].getLabel().split("-")[0];
			// 		var flag = false;
			// 		var oCourseId = 'Courses(\'' + vCourse + '\')';
			// 		var oModel = oEvent.getSource().getModel().oData[oCourseId]; //var oModel = oEvent.getSource().getModel();
			// 		if (oModel) {
			// 			var CourseName = oModel.BatchNo + ': ' + oModel.Name; //got the course anme from screen
			// 		} else {
			// 			flag = true;
			// 		}
			// 		var oStudentId = 'Students(\'' + vStudent + '\')';
			// 		var vModel = oEvent.getSource().getModel().oData[oStudentId];
			// 		if (vModel) {
			// 			var StudMail = vModel.GmailId;
			// 		} else {
			// 			flag = true;
			// 		}
			// 		if (flag === false) {
			// 			itemList[i].setLabel(StudMail + '-' + CourseName);
			// 		}
			// 	}
			//
			// 	oList.getHeaderToolbar().getContent()[0].setText("Today : " + noOfItems)
			//
			//
			// });
			//
			// oList.bindAggregation("items", {
			// 	path: '/Subs',
			// 	template: new sap.m.DisplayListItem({
			// 		// template: new sap.m.CustomListItem({
			// 		label: "{StudentId}-{CourseId}",
			// 		value: "{CreatedOn} - {CreatedBy}"
			//
			// 	}),
			// 	filters: [new oFilter("PaymentDate", "GE", newDate)],
			// 	sorter: oSorter
			// });


			this.getView().getModel("local").setProperty("/newRegistration/StartDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newRegistration/EndDate", this.formatter.getFormattedDate(8));
			this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", this.formatter.getFormattedDate(1));
			///TODO: Fill the Customer Set and Course Set from REST API

			// this.getView().getModel("local").setProperty("/newRegistration/StartDate", this.formatter.getFormattedDate(0));
			// this.getView().getModel("local").setProperty("/newRegistration/PaymentDate", this.formatter.getFormattedDate(0));
			// this.getView().getModel("local").setProperty("/newRegistration/EndDate", this.formatter.getFormattedDate(8));
			// this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", this.formatter.getFormattedDate(1));
			this.getView().getModel("local").setProperty("/newRegistration/StudentId", null);
			this.getView().getModel("local").setProperty("/newRegistration/CourseId", null);
			this.getView().getModel("local").setProperty("/newRegistration/Mode", 'L');
			this.getView().getModel("local").setProperty("/newRegistration/PaymentMode", 'IMPS');
			this.getView().getModel("local").setProperty("/newRegistration/AccountName", null);
			this.getView().getModel("local").setProperty("/newRegistration/Amount", 15000);
			this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", 0);
			this.getView().getModel("local").setProperty("/newRegistration/PartialPayment", false);
			this.getView().getModel("local").setProperty("/newRegistration/Reference", null);
			this.getView().getModel("local").setProperty("/newRegistration/Extra2", null);
			this.getView().getModel("local").setProperty("/newRegistration/Waiver", false);
			this.getView().getModel("local").setProperty("/newRegistration/Waiver", false);
			this.getView().getModel("local").setProperty("/newRegistration/Waiver", false);
			this.getView().getModel("local").setProperty("/newCustomer/GmailId", null);
			this.getView().getModel("local").setProperty("/newCustomer/Name", null);
			this.getView().getModel("local").setProperty("/newCustomer/Country", 'IN');
			this.getView().getModel("local").setProperty("/newCustomer/ContactNo", null);
			this.getView().getModel("local").setProperty("/newCustomer/OtherEmail1", null);
			this.getView().getModel("local").setProperty("/newCustomer/OtherEmail2", null);
			this.getView().getModel("local").setProperty("/newCustomer/Skills", null);
			this.getView().getModel("local").setProperty("/newCustomer/Star", false);
			this.getView().getModel("local").setProperty("/newCustomer/Defaulter", false);


		},
		oSuppPopup: null,
		onCustomer: function() {
			if (!this.oSuppPopup) {
				this.oSuppPopup = new sap.ui.xmlfragment("oft.fiori.fragments.newCustomer", this);
				sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oSuppPopup);
				this.oSuppPopup.setTitle("New Customer");
			}


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
			sap.ui.getCore().byId("idSkills").clearSelection();


			// var oMultiInput = sap.ui.getCore().getElementById("multiInputID");
			// //soMultiInput.removeAllTokens();
			// var fValidator = function(args) {
			// 	window.setTimeout(function() {
			// 		args.asyncCallback(new oToken({
			// 			text: args.text
			// 		}));
			// 	}, 200);
			// 	return sap.m.MultiInput.WaitForAsyncValidation;
			// };
			// oMultiInput.addValidator(fValidator);

			this.oSuppPopup.open();
		},

		// onUpdateFinished: function(oEvent) {
		// 	var oTable = this.getView().byId("idRecent");
		// 	var itemList = oTable.getItems();
		// 	var noOfItems = itemList.length;
		// 	var value1;
		// 	var id;
		// 	var cell;
		//
		// 	var isAdmin = this.getView().getModel("local").getProperty("/Role");
		// 	if (isAdmin === 'Admin') {
		// 		var totalAmount = 0;
		// 		for (var i = 0; i < itemList.length; i++) {
		// 			totalAmount = totalAmount + parseInt(itemList[i].getCells()[6].getText());
		// 		}
		// 		oTable.getHeaderToolbar().getContent()[0].setText("Today : " + noOfItems + "  Amount:" + totalAmount);
		//
		// 	} else {
		// 		oTable.getHeaderToolbar().getContent()[0].setText("Today : " + noOfItems);
		//
		// 	}
		// 	var allStudents = [];
		// 	for (var i = 0; i < noOfItems; i++) {
		// 		var vCourse = itemList[i].getCells()[1].getText();
		// 		var oCourseId = 'Courses(\'' + vCourse + '\')';
		// 		var oModel = this.getView().getModel().oData[oCourseId];
		// 		if (oModel) {
		// 			var CourseName = oModel.BatchNo + ': ' + oModel.Name; //got the course anme from screen
		// 			itemList[i].getCells()[1].setText(CourseName);
		// 		}
		// 		if (itemList[i].getCells()[0].getText().indexOf("@") === -1) {
		// 			allStudents.push(itemList[i].getCells()[0].getText());
		// 		}
		//
		//
		// 		// var vStudent = itemList[i].getCells()[0].getText();
		// 		// var oStudentId = 'Students(\'' + vStudent + '\')';
		// 		// var vModel = this.getView().getModel().oData[oStudentId];
		// 		// if (vModel) {
		// 		// 	var StudMail = vModel.GmailId;
		// 		// 	itemList[i].getCells()[0].setText(StudMail);
		// 		// }
		// 		//var vButtonTxt = itemList[i].getCells()[2].getText();
		// 		var vButtonTxt = itemList[i].getCells()[2].getItems()[0].getText();
		// 		if (vButtonTxt == "Approved") {
		// 			itemList[i].getCells()[2].getItems()[0].setText("Send Mail");
		// 			itemList[i].getCells()[2].getItems()[0].setEnabled(true);
		// 			itemList[i].getCells()[2].getItems()[0].setType(sap.m.ButtonType.Unstyled);
		// 		} else if (vButtonTxt == "Pending") {
		// 			if (this.UserRole == "Admin") {
		// 				itemList[i].getCells()[2].getItems()[0].setText("Approve");
		// 				itemList[i].getCells()[2].getItems()[0].setType(sap.m.ButtonType.Reject);
		//
		// 			} else {
		// 				itemList[i].getCells()[2].getItems()[0].setEnabled(false);
		// 				itemList[i].getCells()[2].getItems()[0].setType(sap.m.ButtonType.Reject);
		// 			}
		// 		} else if ((vButtonTxt == "Access Granted") ||
		// 			(vButtonTxt == "Access granted") ||
		// 			(vButtonTxt == "access Granted") || (vButtonTxt == "access granted")) {
		// 			itemList[i].getCells()[2].getItems()[0].setEnabled(false);
		// 			itemList[i].getCells()[2].getItems()[0].setType(sap.m.ButtonType.Accept);
		// 		}
		// 		cell = itemList[i].getCells().length - 2;
		// 		id = itemList[i].getCells()[4].getText();
		// 		if (this.getModel("local").getProperty("/AppUsers")[id]) {
		// 			value1 = this.getModel("local").getProperty("/AppUsers")[id].UserName;
		// 		}
		// 		if (value1) {
		// 			itemList[i].getCells()[4].setText(value1);
		// 		}
		// 	}
		// 	if (allStudents) {
		// 		var loginPayload = {
		// 			allStudents: allStudents
		// 		};
		//
		// 		$.post('/getAllStudents', loginPayload)
		// 			.done(function(data, status) {
		// 				for (var i = 0; i < noOfItems; i++) {
		// 					var vStudent = itemList[i].getCells()[0].getText();
		// 					for (var j = 0; j < data.length; j++) {
		// 						if (data[j].id === vStudent) {
		// 							try {
		// 								itemList[i].getCells()[0].setText(data[j].GmailId);
		//
		// 							} catch (e) {
		//
		// 							} finally {
		//
		// 							}
		// 						}
		// 					}
		//
		// 				}
		// 			})
		// 			.fail(function(xhr, status, error) {
		// 				sap.m.MessageBox.error("Login Failed, Please enter correct credentials");
		// 			});
		// 	}
		//
		//
		//
		// },
		passwords: "",
		// copyToClipboard: function(text, extra1) {
		// 	try {
		// 		var texts = eval(text);
		// 	} catch (e) {
		// 		var texts = text;
		// 	} finally {
		//
		// 	}
		// 	if (window.clipboardData && window.clipboardData.setData) {
		// 		// Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
		// 		clipboardData.setData("Text", texts);
		// 		return window.open(extra1);
		// 	} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
		// 		var textarea = document.createElement("textarea");
		// 		textarea.textContent = texts;
		// 		textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in Microsoft Edge.
		// 		document.body.appendChild(textarea);
		// 		textarea.select();
		// 		textarea.setSelectionRange(0, 99999)
		// 		try {
		// 			document.execCommand("copy"); // Security exception may be thrown by some browsers.
		// 			return window.open(extra1);
		// 		} catch (ex) {
		// 			console.warn("Copy to clipboard failed.", ex);
		// 			return window.open(extra1);
		// 		} finally {
		// 			document.body.removeChild(textarea);
		// 		}
		// 	}
		// },
		onBank: function(oEvent) {
			this.oEvent_approve = oEvent;
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var that = this;
			var loginPayload = that.oEvent_approve.getSource().getBindingContext().getModel().getProperty(that.oEvent_approve.getSource().getBindingContext().getPath());
			if (loginPayload.AccountName) {
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Accounts",
						"GET", {
							filters: [new sap.ui.model.Filter("accountNo", "EQ", loginPayload.AccountName)]
						}, {}, this)
					.then(function(oData) {
						console.log(oData.results[0].userId);
						console.log(oData.results[0].key);
						try {
							//navigator.clipboard.writeText(oData.results[0].userId);
							debugger;
							that.copyToClipboard(oData.results[0].userId, oData.results[0].extra1);
						} catch (e) {

						} finally {

						}

					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);

					});
			}

		},
		// onApprove: function(oEvent) {
		//
		// 	this.oEvent_approve = oEvent;
		// 	if (oEvent.getSource().getText() == "Approve") {
		// 		var sPath = oEvent.getSource().getBindingContext().sPath;
		// 		var that = this;
		// 		var payload3 = {
		// 			"Status": "Approved"
		// 		};
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {}, payload3, this)
		// 			.then(function(oData) {
		//
		//
		// 			}).catch(function(oError) {
		// 				that.getView().setBusy(false);
		// 				var oPopover = that.getErrorMessage(oError);
		//
		// 			});
		// 	} else if (oEvent.getSource().getText() == "Send Mail") {
		// 		var sPath = oEvent.getSource().getBindingContext().sPath;
		// 		var that = this;
		// 		var payload3 = {
		// 			"Status": "Access Granted"
		// 		};
		// 		var loginPayload = that.oEvent_approve.getSource().getBindingContext().getModel().getProperty(that.oEvent_approve.getSource().getBindingContext().getPath());
		// 		if (!that.passwords) {
		// 			that.passwords = prompt("Please enter your password", "");
		// 		}
		//
		// 		loginPayload.password = that.passwords;
		// 		loginPayload.includeX = that.getView().byId("includeX").getSelected();
		// 		$.post('/sendSubscriptionEmail', loginPayload)
		// 			.done(function(data, status) {
		// 				sap.m.MessageToast.show("Email sent successfully");
		// 			})
		// 			.fail(function(xhr, status, error) {
		// 				sap.m.MessageBox.error("Login Failed, Please enter correct credentials");
		// 			});
		//
		//
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {}, payload3, this)
		// 			.then(function(oData) {
		//
		// 				// var that2 = that;
		// 				// that.passwords= null;
		// 				// var loginPayload = that.oEvent_approve.getSource().getBindingContext().getModel().getProperty(that.oEvent_approve.getSource().getBindingContext().getPath());
		// 				// 	if(!that.passwords){
		// 				// 		that.passwords = prompt("Please enter your password", "");
		// 				// 	}
		// 				// 	loginPayload.password = that.passwords;
		// 				// $.post('/sendSubscriptionEmail', loginPayload)
		// 				// 		.done(function(data, status){
		// 				// 			sap.m.MessageToast.show("looks like done");
		// 				// 		})
		// 				// 		.fail(function(xhr, status, error) {
		// 				// 					sap.m.MessageBox.error("Login Failed, Please enter correct credentials");
		// 				// 		});
		//
		// 			}).catch(function(oError) {
		// 				that.getView().setBusy(false);
		// 				var oPopover = that.getErrorMessage(oError);
		//
		// 			});
		// 	}
		// },
		// searchPopup: null,
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
						label: "{Name} {=${Defaulter} ? '(Defaulter)' : ''}",
						value: "{GmailId}"
					})
				});
				// this.searchPopup.bindAggregation("items", {
				// 	path: "/Students",
				// 	template: new sap.m.StandardListItem({
				// 		title: "{Name}",
				// 		description: "{GmailId}",
				// 		info: "{id}"
				// 	})
				// });
			} else if (this.sId.indexOf("idEmailCust") !== -1) {
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
			} else if (this.sId.indexOf("courseId") !== -1) {
				var oBatchFilter = new sap.ui.model.Filter("hidden", FilterOperator.EQ, false);
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("batch");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Courses",
					filters: [oBatchFilter],
					sorter: {
						path: 'EndDate',
						descending: false,
						group: false
					},
					// template: new sap.m.DisplayListItem({
					// 	label: "{Name}",
					// 	value: "{BatchNo}"
					// })

					template: new sap.m.ObjectListItem({
						title: "{Name}",
						intro: "{BatchNo}",
						number: {
							path: "status",
							formatter: this.formatter.formatStatusValue
						}
					})


				});
				var oBinding = this.searchPopup.getBinding("items");
				var aSorters = [];
				var sPath1 = "EndDate";
				var bDescending = true;
				aSorters.push(new sap.ui.model.Sorter(sPath1, bDescending));
				oBinding.sort(aSorters);
			} else if (this.sId.indexOf("accountDetails") !== -1) {
				var oAccFilter = new sap.ui.model.Filter("deleted", FilterOperator.EQ, false);
				sTitle = "Account Search";
				sPath = "local>/accountSet";
				this.getCustomerPopup();
				var title = "Account Search";
				var oSorter = new sap.ui.model.Sorter({
					path: 'value',
					descending: false
				});
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
				// var aFilters = [];
				// aFilters.push(new sap.ui.model.Filter("local>/deleted", sap.ui.model.FilterOperator.EQ, false));
				// this.searchPopup.getBinding("items").filter(aFilters);
			}
		},
		onConfirm: function(oEvent) {

			if (this.sId.indexOf("accountDetails") !== -1) {

				var bankName = oEvent.getParameter("selectedItem").getValue();
				this.getView().getModel("local").setProperty("/dumpSold/account", bankName);
			} else if (this.sId.indexOf("customerId") !== -1) {

				var data = this.getSelectedKey(oEvent);
				// this.getView().byId("customerId").setValue(data[0]);
				this.isDefaulter = data[1].endsWith("(Defaulter)");
				this.customerId = data[2];
				var student = oEvent.getParameter("selectedItem").getBindingContext().getObject();
				this.getView().getModel("local").setProperty("/dumpSold/EmailId", student.GmailId);
				this.getView().getModel("local").setProperty("/dumpSold/FirstName", (student.Name).split(' ')[0]);
				this.getView().getModel("local").setProperty("/dumpSold/LastName", student.Name.split(' ').length > 0 ? student.Name.split(' ')[1] : null);
				this.getView().getModel("local").setProperty("/dumpSold/Country", student.Country);
				this.getView().getModel("local").setProperty("/dumpSold/Phone", student.ContactNo);
			} else if (this.sId.indexOf("courseId") !== -1) {

				// var data = this.getSelectedKey(oEvent);
				// this.getView().byId("courseId").setValue(data[0]);
				// this.getView().byId("idCourseName").setText(data[1]);
				// this.courseId = data[2];

				var data = this.getObjListSelectedkey(oEvent);
				this.getView().byId("idCourseName").setText(data[0]);
				this.getView().byId("courseId").setValue(data[1]);
				this.courseId = data[3];

				var oItem = oEvent.getParameter("selectedItem");
				var oContext = oItem.getBindingContext();
				if (oContext.getObject().Fee) {
					this.getView().byId("idAmount").setValue(oContext.getObject().Fee);
					CourseFee = oContext.getObject().Fee;
				} else {
					CourseFee = 0;
				}

				var x = new Date(oContext.getObject().DemoStartDate);
				x.setMonth(x.getMonth() + 1);
				if (x > new Date()) {
					this.getView().byId("idPayDueDate").setDateValue(x);
				}


			} else if (this.sId.indexOf("idEmailCust") !== -1) {

				// var data = this.getSelectedKey(oEvent);
				// sap.ui.getCore().byId("idEmailCust").setValue(data[1]);

				var oItem = oEvent.getParameter("selectedItem");
				var oContext = oItem.getBindingContext();
				// console.log(oContext.getObject());
				// var inquiryData = 'Inquries(\'' + data[2] + '\')';
				// var oModel = this.getView().getModel().oData[inquiryData];
				// if (oModel) {
				// sap.ui.getCore().byId("idEmailCust").setValue(oModel.EmailId);
				// sap.ui.getCore().byId("idName").setValue(oModel.FirstName + ' ' + oModel.LastName);
				// sap.ui.getCore().byId("idCountry").setValue(oModel.Country);
				// sap.ui.getCore().byId("idPhone").setValue(oModel.Phone);
				sap.ui.getCore().byId("idSkills").clearSelection();
				sap.ui.getCore().byId("idPhone").setValue(0);
				sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
				sap.ui.getCore().byId("idOtherEmail1").setValue(null);
				sap.ui.getCore().byId("idOtherEmail2").setValue(null);
				sap.ui.getCore().byId("idStar").setSelected(false);
				sap.ui.getCore().byId("idName").setValue(null);
				sap.ui.getCore().byId("idDefaulter").setSelected(false);
				sap.ui.getCore().byId("idHighServerUsage").setSelected(false);

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
								sap.ui.getCore().byId("idEmailCust").setValue(oData.results[0].GmailId);
								sap.ui.getCore().byId("idName").setValue(oData.results[0].Name);

								if (oData.results[0].ContactNo) {
									sap.ui.getCore().byId("idPhone").setValue(oData.results[0].ContactNo);
								} else {
									sap.ui.getCore().byId("idPhone").setValue(0);
								}

								if (oData.results[0].Country) {
									sap.ui.getCore().byId("idCountry").setSelectedKey(oData.results[0].Country);
								} else {
									sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
								}
								if (oData.results[0].OtherEmail1) {
									sap.ui.getCore().byId("idOtherEmail1").setValue(oData.results[0].OtherEmail1);
								}
								if (oData.results[0].OtherEmail2) {
									sap.ui.getCore().byId("idOtherEmail2").setValue(oData.results[0].OtherEmail2);
								}

								if (oData.results[0].Defaulter) {
									sap.ui.getCore().byId("idDefaulter").setSelected(oData.results[0].Defaulter);
								}
								if (oData.results[0].HighServerUsage) {
									sap.ui.getCore().byId("idHighServerUsage").setSelected(oData.results[0].HighServerUsage);
								}
								if (oData.results[0].Star) {
									sap.ui.getCore().byId("idStar").setSelected(oData.results[0].Star);
								}

								sap.ui.getCore().byId("createNew").setText("Update");
								that.UpdateCustomer = true;
								that.customerGUID = oData.results[0].id;
								//that.CreateCustomer = false;

							} else {

								var vLastName;
								var vFirstName;

								sap.ui.getCore().byId("idEmailCust").setValue(oContext.getObject().EmailId);

								if (oContext.getObject().FirstName) {
									if (oContext.getObject().LastName) {
										vLastName = oContext.getObject().LastName;
									} else {
										vLastName = " ";
									}
									sap.ui.getCore().byId("idName").setValue(oContext.getObject().FirstName + ' ' + vLastName);
								} else {
									vFirstName = "";
									if (oContext.getObject().LastName) {
										vLastName = oContext.getObject().LastName;
									} else {
										vLastName = "";
									}
									sap.ui.getCore().byId("idName").setValue(vFirstName + ' ' + vLastName);
								}

								if (oContext.getObject().Phone) {
									sap.ui.getCore().byId("idPhone").setValue(oContext.getObject().Phone);
								} else {
									sap.ui.getCore().byId("idPhone").setValue(0);
								}

								if (oContext.getObject().Country) {
									sap.ui.getCore().byId("idCountry").setSelectedKey(oContext.getObject().Country);
								} else {
									sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
								}
								sap.ui.getCore().byId("createNew").setText("Create");
								that.UpdateCustomer = false;
								//that.CreateCustomer = true;
							}
						}).catch(function(oError) {

							var vLastName;
							var vFirstName;

							sap.ui.getCore().byId("idEmailCust").setValue(oContext.getObject().EmailId);

							if (oContext.getObject().FirstName) {
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = " ";
								}
								sap.ui.getCore().byId("idName").setValue(oContext.getObject().FirstName + ' ' + vLastName);
							} else {
								vFirstName = "";
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = "";
								}
								sap.ui.getCore().byId("idName").setValue(vFirstName + ' ' + vLastName);
							}

							if (oContext.getObject().Phone) {
								sap.ui.getCore().byId("idPhone").setValue(oContext.getObject().Phone);
							} else {
								sap.ui.getCore().byId("idPhone").setValue(0);
							}

							if (oContext.getObject().Country) {
								sap.ui.getCore().byId("idCountry").setSelectedKey(oContext.getObject().Country);
							} else {
								sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
							}
							sap.ui.getCore().byId("createNew").setText("Create");
							that.UpdateCustomer = false;
							//that.CreateCustomer = true;
						});

				}

			}
			//this.searchPopup.close();
		},

		suggestionItemSelected: function(oEvent) {

			var oItem = oEvent.getParameter("selectedItem");
			var oContext = oItem.getBindingContext();
			//var oModel = this.getView().getModel().oData[oContext.sPath];

			sap.ui.getCore().byId("idSkills").clearSelection();
			sap.ui.getCore().byId("idPhone").setValue(0);
			sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
			sap.ui.getCore().byId("idOtherEmail1").setValue(null);
			sap.ui.getCore().byId("idOtherEmail2").setValue(null);
			sap.ui.getCore().byId("idStar").setSelected(false);
			sap.ui.getCore().byId("idName").setValue(null);
			sap.ui.getCore().byId("idDefaulter").setSelected(false);
			sap.ui.getCore().byId("idHighServerUsage").setSelected(false);

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
							sap.ui.getCore().byId("idEmailCust").setValue(oData.results[0].GmailId);
							sap.ui.getCore().byId("idName").setValue(oData.results[0].Name);

							if (oData.results[0].ContactNo) {
								sap.ui.getCore().byId("idPhone").setValue(oData.results[0].ContactNo);
							} else {
								sap.ui.getCore().byId("idPhone").setValue(0);
							}

							if (oData.results[0].Country) {
								sap.ui.getCore().byId("idCountry").setSelectedKey(oData.results[0].Country);
							} else {
								sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
							}
							if (oData.results[0].OtherEmail1) {
								sap.ui.getCore().byId("idOtherEmail1").setValue(oData.results[0].OtherEmail1);
							}
							if (oData.results[0].OtherEmail2) {
								sap.ui.getCore().byId("idOtherEmail2").setValue(oData.results[0].OtherEmail2);
							}

							if (oData.results[0].Defaulter) {
								sap.ui.getCore().byId("idDefaulter").setSelected(oData.results[0].Defaulter);
							}
							if (oData.results[0].HighServerUsage) {
								sap.ui.getCore().byId("idHighServerUsage").setSelected(oData.results[0].HighServerUsage);
							}
							if (oData.results[0].Star) {
								sap.ui.getCore().byId("idStar").setSelected(oData.results[0].Star);
							}

							sap.ui.getCore().byId("createNew").setText("Update");
							that.UpdateCustomer = true;
							that.customerGUID = oData.results[0].id;
							//that.CreateCustomer = false;

						} else {

							var vLastName;
							var vFirstName;

							sap.ui.getCore().byId("idEmailCust").setValue(oContext.getObject().EmailId);

							if (oContext.getObject().FirstName) {
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = " ";
								}
								sap.ui.getCore().byId("idName").setValue(oContext.getObject().FirstName + ' ' + vLastName);
							} else {
								vFirstName = "";
								if (oContext.getObject().LastName) {
									vLastName = oContext.getObject().LastName;
								} else {
									vLastName = "";
								}
								sap.ui.getCore().byId("idName").setValue(vFirstName + ' ' + vLastName);
							}

							if (oContext.getObject().Phone) {
								sap.ui.getCore().byId("idPhone").setValue(oContext.getObject().Phone);
							} else {
								sap.ui.getCore().byId("idPhone").setValue(0);
							}

							if (oContext.getObject().Country) {
								sap.ui.getCore().byId("idCountry").setSelectedKey(oContext.getObject().Country);
							} else {
								sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
							}
							sap.ui.getCore().byId("createNew").setText("Create");
							that.UpdateCustomer = false;
							//that.CreateCustomer = true;
						}
					}).catch(function(oError) {

						var vLastName;
						var vFirstName;

						sap.ui.getCore().byId("idEmailCust").setValue(oContext.getObject().EmailId);

						if (oContext.getObject().FirstName) {
							if (oContext.getObject().LastName) {
								vLastName = oContext.getObject().LastName;
							} else {
								vLastName = " ";
							}
							sap.ui.getCore().byId("idName").setValue(oContext.getObject().FirstName + ' ' + vLastName);
						} else {
							vFirstName = "";
							if (oContext.getObject().LastName) {
								vLastName = oContext.getObject().LastName;
							} else {
								vLastName = "";
							}
							sap.ui.getCore().byId("idName").setValue(vFirstName + ' ' + vLastName);
						}

						if (oContext.getObject().Phone) {
							sap.ui.getCore().byId("idPhone").setValue(oContext.getObject().Phone);
						} else {
							sap.ui.getCore().byId("idPhone").setValue(0);
						}

						if (oContext.getObject().Country) {
							sap.ui.getCore().byId("idCountry").setSelectedKey(oContext.getObject().Country);
						} else {
							sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
						}
						sap.ui.getCore().byId("createNew").setText("Create");
						that.UpdateCustomer = false;
						//that.CreateCustomer = true;
					});

				// var vLastName;
				// var vFirstName;
				// sap.ui.getCore().byId("idEmailCust").setValue(oContext.getObject().EmailId);
				//
				// if (oContext.getObject().FirstName) {
				// 	if (oContext.getObject().LastName) {
				// 		vLastName = oContext.getObject().LastName;
				// 	} else {
				// 		vLastName = " ";
				// 	}
				// 	sap.ui.getCore().byId("idName").setValue(oContext.getObject().FirstName + ' ' + vLastName);
				// } else {
				// 	vFirstName = " ";
				// 	if (oContext.getObject().LastName) {
				// 		vLastName = oContext.getObject().LastName;
				// 	} else {
				// 		vLastName = " ";
				// 	}
				// 	sap.ui.getCore().byId("idName").setValue(vFirstName + ' ' + vLastName);
				// }
				//
				// if (oContext.getObject().Country) {
				// 	sap.ui.getCore().byId("idPhone").setValue(oContext.getObject().Phone);
				// } else {
				// 	sap.ui.getCore().byId("idPhone").setValue(0);
				// }
				//
				//
				// if (oContext.getObject().Country) {
				// 	sap.ui.getCore().byId("idCountry").setSelectedKey(oContext.getObject().Country);
				// } else {
				// 	sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
				// }
			}

		},

		onAmountChange: function(oEvent) {

			var value = parseInt(oEvent.getParameter("value"));
			if (value < CourseFee) {
				var newVal = CourseFee - value;
				this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", newVal);
				this.getView().getModel("local").setProperty("/newRegistration/PartialPayment", true);
			} else {
				this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", 0);
				this.getView().getModel("local").setProperty("/newRegistration/PartialPayment", false);
			}
		},

		onWaiver: function(oEvent) {
			var selected = oEvent.getParameter("selected");
			if (selected === true) {
				this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", 0);
				this.getView().getModel("local").setProperty("/newRegistration/PartialPayment", false);

			} else {

				var value = this.getView().getModel("local").getProperty("/newRegistration/Amount");
				if (value < CourseFee) {
					var newVal = CourseFee - value;
					this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", newVal);
					this.getView().getModel("local").setProperty("/newRegistration/PartialPayment", true);
				} else {
					this.getView().getModel("local").setProperty("/newRegistration/PendingAmount", 0);
					this.getView().getModel("local").setProperty("/newRegistration/PartialPayment", false);
				}
			}
		},
		onSearch: function(oEvent) {
			// var oFilter1 = new sap.ui.model.Filter("text", sap.ui.model.filter.FilterOperator.Contains, oEvent.getSource().getValue());
			// var oFilter2 = new sap.ui.model.Filter("key", sap.ui.model.filter.FilterOperator.Contains, oEvent.getSource().getValue());
			// var oFilter = new sap.ui.model.Filter({
			// 	filters: [oFilter1, oFilter2],
			// 	and: false
			// });
			// this.searchPopup.filter(oFilter);
			//this.sId = oEvent.getSource().getId();
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
						// template: new sap.m.StandardListItem({
						// 	title: "{Name}",
						// 	description: "{GmailId}",
						// 	info: "{id}"
						// })

					});
					this.searchPopup.getBinding("items").filter([]);
				}

			} else if (this.sId.indexOf("courseId") !== -1) {
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
						// template: new sap.m.StandardListItem({
						// 	title: "{Name}",
						// 	description: "{BatchNo}",
						// 	info: "{id}"

						// })

					});
					this.searchPopup.getBinding("items").filter([]);
				}

			}

		},
		onCancel: function(oEvent) {
			this.searchPopup.close();
		},
		onClose: function() {
			// var MultiInput = sap.ui.getCore().getElementById("multiInputID");
			// MultiInput.removeAllTokens();
			this.oSuppPopup.close();
		},

		// onCreateCust: function(oEvent) {
		// 	//TODO: Create POST Request to create customer
		// 	//console.log(this.getView().getModel("local").getProperty("/newCustomer"));
		// 	var oLocal = oEvent;
		// 	var that = this;
		// 	that.getView().setBusy(true);
		// 	var leadData = this.getView().getModel("local").getProperty("/newCustomer");
		//
		//
		// 	// var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", leadData.GmailId);
		// 	//
		// 	// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
		// 	// 		filters: [Filter1]
		// 	// 	}, payload)
		// 	// 	.then(function(oData) {
		// 	// 		if (oData.results.length != 0) {
		// 	//
		// 	// 		}
		// 	// 	}).catch(function(oError) {
		// 	//
		// 	// 	});
		//
		// 	var oFileUploader = sap.ui.getCore().byId("idFileUploader");
		// 	var domRef = oFileUploader.getFocusDomRef();
		// 	var file = domRef.files[0];
		// 	if (file) {
		// 		var that = this;
		// 		var fileName = file.name.split(".");
		// 		var i = fileName.length;
		//
		// 		var filetype = file.type.split("/")[1];
		// 		var file_ext = fileName[i - 1];
		// 		if ((file_ext == "PDF") || (file_ext == "DOCX") || (file_ext == "DOC") ||
		// 			(file_ext == "pdf") || (file_ext == "docx") || (file_ext == "doc") ||
		// 			(file_ext == "msword") || (file_ext == "MSWORD")) {
		//
		// 			var reader = new FileReader();
		// 			reader.onload = function(e) {
		//
		// 				//get an access to the content of the file
		// 				if ((file_ext == "PDF") || (file_ext == "pdf")) {
		// 					that.FileContent = e.currentTarget.result.replace("data:application/pdf;base64,", "");
		// 				} else {
		// 					if (filetype == "msword") {
		// 						that.FileContent = e.currentTarget.result.replace("data:application/msword;base64,", "");
		// 					} else {
		// 						that.FileContent = e.currentTarget.result.replace("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,", "");
		// 					}
		// 				}
		// 				//that.encoded = btoa(encodeURI(that.imgContent));
		// 			};
		// 			//File Reader will start reading the file
		// 			reader.readAsDataURL(file);
		// 		} else {
		// 			sap.m.MessageToast.show("File Type should be PDF or DOC");
		// 			return "";
		// 		}
		// 	}
		//
		// 	if (that.UpdateCustomer == false) {
		// 		var payload = {
		// 			"GmailId": leadData.GmailId,
		// 			"Name": leadData.Name,
		// 			"CompanyMail": leadData.CompanyMail,
		// 			"Country": leadData.Country,
		// 			"Designation": leadData.Designation,
		// 			"OtherEmail1": leadData.OtherEmail1,
		// 			"OtherEmail2": leadData.OtherEmail2,
		// 			"ContactNo": leadData.ContactNo,
		// 			"Star": leadData.Star,
		// 			"Defaulter": leadData.Defaulter,
		// 			"HighServerUsage": leadData.HighServerUsage,
		// 			"Skills": leadData.Skills,
		// 			"Resume": this.FileContent, //.Resume,
		// 			"Extra1": "EExtra1",
		// 			"Extra2": "EExtra2",
		// 			"CreatedOn": new Date(),
		// 			"CreatedBy": "DemoUser"
		// 		};
		//
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "POST", {},
		// 				payload, this)
		// 			.then(function(oData) {
		//
		// 				that.getView().setBusy(false);
		// 				sap.m.MessageToast.show("Customer Saved successfully");
		// 				that.destroyMessagePopover();
		// 				//that.getView().getModel("local").setProperty("/newCustomer");
		// 				//oMultiInput.removeAllTokens();
		// 				that.oSuppPopup.close();
		//
		// 			}).catch(function(oError) {
		// 				that.getView().setBusy(false);
		// 				//sap.m.MessageToast.show(oError.responseText);
		// 				var oPopover = that.getErrorMessage(oError);
		// 				// var oMultiInput1 = sap.ui.getCore().getElementById("multiInputID");
		// 				// oMultiInput1.removeAllTokens();
		// 			});
		// 	} else {
		//
		// 		var vStar = " ";
		// 		if (leadData.Star == true) {
		// 			vStar = "true";
		// 		} else {
		// 			vStar = "false";
		// 		}
		// 		var vDfltr = " ";
		// 		if (leadData.Defaulter == true) {
		// 			vDfltr = "true";
		// 		} else {
		// 			vDfltr = "false";
		// 		}
		// 		var vSrvrUsage = " ";
		// 		if (leadData.HighServerUsage == true) {
		// 			vSrvrUsage = "true";
		// 		} else {
		// 			vSrvrUsage = "false";
		// 		}
		//
		// 		var payload = {
		// 			"GmailId": leadData.GmailId,
		// 			"Name": leadData.Name,
		// 			"CompanyMail": leadData.CompanyMail,
		// 			"Country": leadData.Country,
		// 			"Designation": leadData.Designation,
		// 			"OtherEmail1": leadData.OtherEmail1,
		// 			"OtherEmail2": leadData.OtherEmail2,
		// 			"ContactNo": leadData.ContactNo,
		// 			"Star": vStar, //leadData.Star,
		// 			"Defaulter": vDfltr, //leadData.Defaulter,
		// 			"HighServerUsage": vSrvrUsage, //leadData.HighServerUsage,
		// 			"Skills": leadData.Skills,
		// 			"Resume": this.FileContent, //.Resume,
		// 			"Extra1": "EExtra1",
		// 			"Extra2": "EExtra2",
		// 			"ChangedOn": new Date(),
		// 			"ChangedBy": "DemoUser"
		// 		};
		//
		// 		var sPath1 = "/Students";
		// 		sPath1 = sPath1 + "(" + "\'" + that.customerGUID + "\'" + ")";
		//
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath1, "PUT", {},
		// 				payload, this)
		// 			.then(function(oData) {
		//
		// 				that.getView().setBusy(false);
		// 				sap.m.MessageToast.show("Customer updated successfully");
		// 				that.destroyMessagePopover();
		// 				//that.getView().getModel("local").setProperty("/newCustomer");
		// 				//oMultiInput.removeAllTokens();
		// 				that.oSuppPopup.close();
		//
		// 			}).catch(function(oError) {
		//
		// 				that.getView().setBusy(false);
		// 				//sap.m.MessageToast.show(oError.responseText);
		// 				var oPopover = that.getErrorMessage(oError);
		// 				// var oMultiInput1 = sap.ui.getCore().getElementById("multiInputID");
		// 				// oMultiInput1.removeAllTokens();
		// 			});
		// 	}
		// },

		onLiveSearch: function(oEvent) {

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
			} else if (this.sId.indexOf("courseId") !== -1) {

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
						// template: new sap.m.StandardListItem({
						// 	title: "{Name}",
						// 	description: "{BatchNo}",
						// 	info: "{id}"
						// })
					});
					this.searchPopup.getBinding("items").filter([]);
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

			} else if (this.sId.indexOf("idEmailCust") !== -1) {

				// "{EmailId}",
				// "{FirstName}"
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
			this.getView().getModel("local").setProperty("/dumpSold", {
				"EmailId": null,
				"DumpCode": null,
				"FirstName": null,
				"LastName": null,
				"Date": null,
				"Country": null,
				"Phone": 0,
				"CreatedOn": null,
				"CreatedBy": null,
				"ChangedOn": null,
				"ChangedBy": null,
				"fees": null,
				"currency": null,
				"account": null,
				"source": null
			});
		},

		// handleSkillChange: function(oEvent) {
		//
		// },

		// handleSkillFinish: function(oEvent) {
		// 	var selectedItems = oEvent.getParameter("selectedItems");
		//
		// 	var SkillSet = ' ';
		// 	for (var i = 0; i < selectedItems.length; i++) {
		// 		SkillSet += selectedItems[i].getText();
		// 		if (i != selectedItems.length - 1) {
		// 			SkillSet += ",";
		// 		}
		// 	}
		// 	this.getView().getModel("local").setProperty("/newCustomer/Skills", SkillSet);
		// },

		// onEmail: function(oEvent) {
		// 	sap.ui.getCore().byId("idName").setEnabled(true);
		// },
		// onEmailExist: function(oEvent) {
		// 	//
		// 	var oLocal = oEvent;
		// 	var that = this;
		// 	// that.getView().setBusy(true);
		// 	var leadData = this.getView().getModel("local").getProperty("/newCustomer");
		//
		// 	var payload = {};
		//
		// 	if (leadData.GmailId) {
		// 		//oModel, sUrl, sMethod, oParameters, oPayload
		// 		var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", leadData.GmailId);
		//
		//
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
		// 				filters: [Filter1]
		// 			}, payload, this)
		//
		// 			.then(function(oData) {
		// 				if (oData.results.length != 0) {
		// 					sap.ui.getCore().byId("createNew").setText("Update");
		// 					that.UpdateCustomer = true;
		// 					that.customerGUID = oData.results[0].id;
		// 					//that.CreateCustomer = false;
		// 					sap.m.MessageToast.show("Email Exists. Use F4 help or Use suggestion on Email field to fetch values");
		// 				} else {
		// 					sap.ui.getCore().byId("createNew").setText("Create");
		// 					that.UpdateCustomer = false;
		// 					//that.CreateCustomer = true;
		// 				}
		// 			}).catch(function(oError) {
		// 				//	that.getView().setBusy(false);
		//
		// 				sap.m.MessageToast.show("New Customer");
		// 				sap.ui.getCore().byId("createNew").setText("Create");
		// 				that.UpdateCustomer = false;
		// 				//that.CreateCustomer = true;
		// 				//var oPopover = that.getErrorMessage(oError);
		// 			});
		//
		// 	} else {
		// 		sap.ui.getCore().byId("idName").setEnabled(false);
		// 		sap.m.MessageToast.show("Enter/select email id first");
		// 	}
		//
		// },
		// onEnter: function(oEvent) {
		//
		//
		// 	// var oItem = oEvent.getParameter("selectedItem");
		// 	// var oContext = oItem.getBindingContext();
		// 	//var oModel = this.getView().getModel().oData[oContext.sPath];
		//
		// 	vEmail = oEvent.getParameters().value;
		// 	var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		//
		// 	//vEmail.validatesFormatOf('GmailId', {with: regEx, message: 'invalid email id'});
		// 	sap.ui.getCore().byId("idSkills").clearSelection();
		// 	sap.ui.getCore().byId("idPhone").setValue(0);
		// 	sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
		// 	sap.ui.getCore().byId("idOtherEmail1").setValue(null);
		// 	sap.ui.getCore().byId("idOtherEmail2").setValue(null);
		// 	sap.ui.getCore().byId("idStar").setSelected(false);
		// 	sap.ui.getCore().byId("idName").setValue(null);
		// 	sap.ui.getCore().byId("idDefaulter").setSelected(false);
		// 	sap.ui.getCore().byId("idHighServerUsage").setSelected(false);
		//
		// 	// if (oContext) {
		// 	if (regEx.test(vEmail)) {
		// 		var that = this;
		// 		// that.getView().setBusy(true);
		//
		// 		var payload = {};
		//
		// 		var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", vEmail);
		//
		//
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
		// 				filters: [Filter1]
		// 			}, payload, this)
		// 			.then(function(oData) {
		// 				if (oData.results.length != 0) {
		// 					sap.ui.getCore().byId("idEmailCust").setValue(oData.results[0].GmailId);
		// 					sap.ui.getCore().byId("idName").setValue(oData.results[0].Name);
		//
		// 					if (oData.results[0].ContactNo) {
		// 						sap.ui.getCore().byId("idPhone").setValue(oData.results[0].ContactNo);
		// 					} else {
		// 						sap.ui.getCore().byId("idPhone").setValue(0);
		// 					}
		//
		// 					if (oData.results[0].Country) {
		// 						sap.ui.getCore().byId("idCountry").setSelectedKey(oData.results[0].Country);
		// 					} else {
		// 						sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
		// 					}
		// 					if (oData.results[0].OtherEmail1) {
		// 						sap.ui.getCore().byId("idOtherEmail1").setValue(oData.results[0].OtherEmail1);
		// 					}
		// 					if (oData.results[0].OtherEmail2) {
		// 						sap.ui.getCore().byId("idOtherEmail2").setValue(oData.results[0].OtherEmail2);
		// 					}
		//
		// 					if (oData.results[0].Defaulter) {
		// 						sap.ui.getCore().byId("idDefaulter").setSelected(oData.results[0].Defaulter);
		// 					}
		// 					if (oData.results[0].HighServerUsage) {
		// 						sap.ui.getCore().byId("idHighServerUsage").setSelected(oData.results[0].HighServerUsage);
		// 					}
		// 					if (oData.results[0].Star) {
		// 						sap.ui.getCore().byId("idStar").setSelected(oData.results[0].Star);
		// 					}
		//
		// 					sap.ui.getCore().byId("createNew").setText("Update");
		// 					that.UpdateCustomer = true;
		// 					that.customerGUID = oData.results[0].id;
		// 					//that.CreateCustomer = false;
		//
		// 				} else {
		//
		// 					var vLastName;
		// 					var vFirstName;
		// 					var that2 = that;
		//
		// 					var payload = {};
		//
		// 					var Filter1 = new sap.ui.model.Filter("EmailId", "EQ", that.vEmail);
		//
		//
		// 					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Inquries", "GET", {
		// 							filters: [Filter1]
		// 						}, payload, that)
		// 						.then(function(oData) {
		// 							if (oData.results.length != 0) {
		// 								sap.ui.getCore().byId("idEmailCust").setValue(oData.results[0].EmailId);
		// 								sap.ui.getCore().byId("idName").setValue(oData.results[0].Name);
		// 								if (oData.results[0].FirstName) {
		// 									if (oData.results[0].LastName) {
		// 										vLastName = oData.results[0].LastName;
		// 									} else {
		// 										vLastName = " ";
		// 									}
		// 									sap.ui.getCore().byId("idName").setValue(oData.results[0].FirstName + ' ' + vLastName);
		// 								} else {
		// 									vFirstName = "";
		// 									if (oData.results[0].LastName) {
		// 										vLastName = oData.results[0].LastName;
		// 									} else {
		// 										vLastName = "";
		// 									}
		// 									sap.ui.getCore().byId("idName").setValue(vFirstName + ' ' + vLastName);
		// 								}
		// 								if (oData.results[0].Phone) {
		// 									sap.ui.getCore().byId("idPhone").setValue(oData.results[0].Phone);
		// 								} else {
		// 									sap.ui.getCore().byId("idPhone").setValue(0);
		// 								}
		//
		// 								if (oData.results[0].Country) {
		// 									sap.ui.getCore().byId("idCountry").setSelectedKey(oData.results[0].Country);
		// 								} else {
		// 									sap.ui.getCore().byId("idCountry").setSelectedKey("IN");
		// 								}
		//
		// 								sap.ui.getCore().byId("createNew").setText("Create");
		// 								that2.UpdateCustomer = false;
		// 								//that.CreateCustomer = false;
		// 							} else {
		// 								sap.ui.getCore().byId("createNew").setText("Create");
		// 								that2.UpdateCustomer = false;
		// 							}
		// 						}).catch(function(oError) {
		// 							//that2.getView().setBusy(false);
		// 							//sap.m.MessageToast.show(oError.responseText);
		// 							var oPopover = that2.getErrorMessage(oError);
		// 						});
		// 				}
		// 			}).catch(function(oError) {
		// 				//that.getView().setBusy(false);
		// 				//sap.m.MessageToast.show(oError.responseText);
		// 				var oPopover = that.getErrorMessage(oError);
		// 			});
		//
		// 	} else {
		// 		sap.m.MessageToast.show("Invalid email id");
		// 		return "";
		// 	}
		//
		// },
		// onUpload: function(oEvent) {
		//
		// }
		//End of PJHA
		onCreateDump: function() {
			if (!this.createDumpPopup) {
				this.createDumpPopup = new sap.ui.xmlfragment("oft.fiori.fragments.CreateDump", this);
				this.getView().addDependent(this.createDumpPopup);
				this.createDumpPopup.setTitle("Create Dump");
			}
			this.createDumpPopup.open();
		},
		onCloseDump: function() {
			this.createDumpPopup.close();
		},
		onSave: function() {
			var payload = this.getView().getModel("local").getProperty("/template");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Templates", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Entry Saved successfully");
					that.destroyMessagePopover();
					if (that.getView().byId("idRecent").getBinding("items")) {
						that.getView().byId("idRecent").getBinding("items").refresh();
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("template Saving failed " + oError.responseText);
				});
		}

	});
});
