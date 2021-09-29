sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.accessProcessor", {
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
				this.getView().byId("idUser").setText(loginUser);
			}
		},
		onSearchNo: function(oEvent){
			var selectedKey = oEvent.getSource().getSelectedKey();
			//Restore the state of UI by fruitId
			var oList = this.getView().byId("idRecent");
			var that = this;
			$.post('/loadBatchHolders', {CourseId : selectedKey})
				.done(function(data, status) {
					var oLocalModel = new sap.ui.model.json.JSONModel();
					oLocalModel.setData({
						"data": data
					});
					oList.setModel(oLocalModel);
					that.getView().byId("titletext2").setText("Count : " + data.length);
					oList.bindAggregation("items", {
						path: '/data',
						template: new sap.m.StandardListItem({
							highlight: { path:'partialPayment',
									formatter: Formatter.formatRowHighlight
								},
							title: "{gmailid} - {name} - {country} - {defaulter}",
							description: {
								parts: [{path: 'startDate'},{path: 'endDate'}],
								formatter: Formatter.getDates
							},
							icon: {
								parts: [{path: 'startDate'},{path: 'endDate'}],
								formatter: Formatter.getDatesIcon
							},
							iconColor: {
								parts: [{path: 'startDate'},{path: 'endDate'}],
								formatter: Formatter.getDatesIconColor
							}
						})
					});

				})
				.fail(function(xhr, status, error) {
					//that.passwords = "";
					sap.m.MessageBox.error(xhr.responseText);
				});


		},
		onFilters: function(oEvent){
			var selectedKey = this.getView().byId("courseSel").getSelectedKey();
			var that = this;
			//Restore the state of UI by fruitId
			var oList = this.getView().byId("idRecent");
			$.post('/loadBatchHoldersLink', {CourseId : selectedKey})
				.done(function(data, status) {
					var oLocalModel = new sap.ui.model.json.JSONModel();
					oLocalModel.setData({
						"data": data
					});
					that.getView().byId("titletext2").setText("Count : " + data.length);
					oList.setModel(oLocalModel);
					oList.bindAggregation("items", {
						path: '/data',
						template: new sap.m.StandardListItem({
							highlight: { path:'partialPayment',
									formatter: Formatter.formatRowHighlight
								},
							title: "{gmailid} - {name} - {country} - {defaulter}",
							description: {
								parts: [{path: 'startDate'},{path: 'endDate'}],
								formatter: Formatter.getDates
							},
							icon: {
								parts: [{path: 'startDate'},{path: 'endDate'}],
								formatter: Formatter.getDatesIcon
							},
							iconColor: {
								parts: [{path: 'startDate'},{path: 'endDate'}],
								formatter: Formatter.getDatesIconColor
							}
						})
					});

				})
				.fail(function(xhr, status, error) {
					//that.passwords = "";
					sap.m.MessageBox.error(xhr.responseText);
				});


		},
		onShooter: function(oEvent){
			var selectedKey = this.getView().byId("courseSel").getSelectedKey();
			//Restore the state of UI by fruitId
			var oList = this.getView().byId("idRecent");
			$.post('/refreshAccess', {CourseId : selectedKey})
				.done(function(data, status) {
					sap.m.MessageBox("Done");
				})
				.fail(function(xhr, status, error) {
					//that.passwords = "";
					sap.m.MessageBox.error(xhr.responseText);
				});
		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "accessProcessor"){
				return;
			}
			// //Restore the state of UI by fruitId
			// this.getView().getModel("local").setProperty("/newLead/date", this.formatter.getFormattedDate(0));
			// this.getView().getModel("local").setProperty("/newLead/country", "IN");
			// var newDate = new Date();
			// newDate.setHours(0, 0, 0, 0);
			// var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
			// var oList = this.getView().byId("idRecent");
			// oList.bindAggregation("items", {
			// 	path: '/Inquries',
			// 	template: new sap.m.DisplayListItem({
			// 		label: "{EmailId} - {CourseName} - {Country}",
			// 		value: "{fees} {currency} / {CreatedOn}-{CreatedBy}"
			// 	}),
			// 	filters: [new Filter("CreatedOn", "GE", newDate)],
			// 	sorter: oSorter
			// });
			// oList.attachUpdateFinished(this.counter);

		},


	});

});
