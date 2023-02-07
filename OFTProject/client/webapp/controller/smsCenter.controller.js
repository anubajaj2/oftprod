sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	"sap/m/Dialog",
	"sap/m/DialogType"
], function(Controller, MessageBox, MessageToast, Formatter, Filter, FilterOperator, ChartFormatter, Format, Dialog, DialogType) {
	"use strict";

	return Controller.extend("oft.fiori.controller.smsCenter", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//this.clearForm();
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}
		},
		getUserId: function(usr) {
			return this.getModel("local").getData().CurrentUser;
		},
		handleUploadPress: function() {
			var oFileUploader = this.byId("fileUploader");
			if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
				return;
			}
			oFileUploader.getAggregation("parameters")[0].setValue(
				this.getModel("local").getData().CurrentUser);
				var myPayload = {
					kind: "SMSCenter",
					type: this.getModel("local").getProperty("/smsCenter/type"),
					createdOn: this.getModel("local").getProperty("/smsCenter/CreatedOn"),
					createdBy: ""
				};
				oFileUploader.getAggregation("parameters")[1].setValue(
					JSON.stringify(myPayload));

			oFileUploader.upload();
		},
		handleUploadComplete: function(oEvent) {
			var sResponse = oEvent.getParameter("response");
			var oFiler = oEvent.getSource();
			if (sResponse) {
				var sMsg = "";
				debugger;
				if (JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).error_code !== 0) {
					sMsg = JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).err_desc;
				} else {
					sMsg = "Uploaded Successfully";
				}
				MessageToast.show(sMsg);
			}
		},
		updateInq: function() {
			var that = this;
			//gtest
			$.post('/upload',{
					kind: "SMSCenter",
					type: this.getModel("local").getProperty("/smsCenter/type"),
					createdOn: this.getModel("local").getProperty("/smsCenter/CreatedOn"),
					createdBy: ""
				})
				.done(function(data, status) {
					sap.m.MessageBox.error("Done");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in upload");
				});
		},
		passwords: "",
		onSendSMS: function() {
			var that = this;

		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		herculis: function(oEvent) {
			if (oEvent.getParameter("name") !== "smsCenter") {
				return;
			}
			//Restore the state of UI by fruitId
			this.getView().getModel("local").setProperty("/newLead/date", this.formatter.getFormattedDate(0));
			var newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
			var oList = this.getView().byId("idRecent");
			oList.bindAggregation("items", {
				path: '/SMSTexts',
				template: new sap.m.DisplayListItem({
					label: "{phoneNo}",
					value: "{type} / {CreatedOn} / {blocked}"
				}),
				//filters: [new Filter("CreatedOn", "GE", newDate)],
				//sorter: oSorter
			});
		}
	});

});
