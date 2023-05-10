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
				if (JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).error_code !== 0) {
					sMsg = JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).err_desc;
				} else {
					sMsg = "Uploaded Successfully";
					this.getView().byId("fileUploader").setValue();
				}
				this.getView().byId("idRecent").getModel().refresh();
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
		sendSms : function(numberList, index){
			var that = this;
			$.ajax({
				type: 'GET', // added,
				url: 'sendPromoSms?number='+numberList[index],
				success: function(data) {
					if(++index < numberList.length){
						that.sendSms(numberList, index);
					}else{
						that.getView().byId("idRecent").removeSelections();
						that.getView().byId("idRecent").getModel().refresh();
						MessageToast("SMS Sent Successfully");
					}
				},
				error: function(xhr, status, error) {
					if(++index < numberList.length){
						that.sendSms(numberList, index);
					}else{
						that.getView().byId("idRecent").removeSelections();
						that.getView().byId("idRecent").getModel().refresh();
						MessageToast.show("SMS Sent Successfully");
					}
				}
			});
		},
		onSendSMS: function(oEvent) {
			var that = this,
			 items = oEvent.getSource().getParent().getParent().getSelectedContextPaths(),
			 numberList = [];
			 debugger;
			items.forEach(item=>{
				numberList.push(that.getView().getModel().getProperty(item).phoneNo);
			});
			that.sendSms(numberList, 0);
		},
		onSearchContact: function(oEvent){
			this.getView().byId("idRecent").getBinding("items").filter([new sap.ui.model.Filter("phoneNo", "Contains", oEvent.getParameter("query").trim())]);
		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		onSelectedDelete: function(oEvent){
			var that = this;
			var items = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			if (items.length > 0) {
				MessageBox.confirm("Are you sure, you want to delete selected the records?",function(val){
					if(val==="OK"){
						items.forEach(function(item) {
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), item, "DELETE", {}, {}, that)
								.then(function(oData) {
									MessageToast.show("Deleted succesfully");
								}).catch(function(oError) {
									that.getView().setBusy(false);
									that.oPopover = that.getErrorMessage(oError);
									that.getView().setBusy(false);
								});
						});
					}
				});
			} else {
				MessageToast.show("Please select an item");
			}
		},
		onDeleteAll: function(oEvent){
			var that = this;
			MessageBox.confirm("Are you sure, you want to delete all the records?", function(val){
				if(val==="OK"){
					$.ajax({
						type: 'GET', // added,
						url: 'deleteAllSMSText',
						success: function(data) {
							that.getView().byId("idRecent").getModel().refresh();
							MessageToast.show(`Deleted all(${data.count}) records`);
						},
						error: function(xhr, status, error) {
							sap.m.MessageToast.show("Error in Deletion");
						}
					});
				}
			})
		},
		herculis: function(oEvent) {
			if (oEvent.getParameter("name") !== "smsCenter") {
				return;
			}
			//Restore the state of UI by fruitId
			this.getView().getModel("local").setProperty("/smsCenter/date", this.formatter.getFormattedDate(0));
			var newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			var oSorter = new sap.ui.model.Sorter("ChangedOn", false);
			var oList = this.getView().byId("idRecent");
			oList.bindAggregation("items", {
				path: '/SMSTexts',
				template: new sap.m.DisplayListItem({
					label: "{phoneNo}",
					value: "{type} / {path: 'CreatedOn', formatter: 'formatter.formatDateTime'} / {blocked} / {ChangedOn}"
				}),
				//filters: [new Filter("CreatedOn", "GE", newDate)],
				sorter: oSorter
			});
		}
	});

});
