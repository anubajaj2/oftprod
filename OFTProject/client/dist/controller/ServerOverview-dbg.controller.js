sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.ServerOverview", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		count: 0,
		countAct: 0,
		countInAct: 0,
		countExp: 0,
		date: new Date(),
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);

			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if(currentUser){
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			}
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);

			var that = this;
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Servers", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					that.count = oData.results.length;

				})
				.catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});

		},
		onStudenIdChange: function(oEvent) {
			var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
			sPath = sPath.split("/")[1];
			var oStudentId = this.getView().getModel().oData[sPath].StudentId;
			oStudentId = 'Students(\'' + oStudentId + '\')';
			var oModel = this.getView().getModel().oData[oStudentId];
			if (oModel) {
				var GmailId = oModel.GmailId;
				oEvent.getSource().setText(GmailId);
			}
		},
		handleIconTabBarSelect: function(oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			var date = new Date();
			switch (key) {
				case "All":
					this.getView().byId("serverOvrTable").getBinding("items").filter([]);
					break;
				case "Ok":

					this.getView().byId("serverOvrTable").getBinding("items").filter([]);
					var vFilter1 = new sap.ui.model.Filter("EndDate", "GT", date);
					var vFilter2 = new sap.ui.model.Filter("UserEndDate", "GT", date);
					var vFilterAc = new sap.ui.model.Filter({
						filters: [vFilter1, vFilter2],
						and: true
					});
					this.getView().byId("serverOvrTable").getBinding("items").filter([vFilterAc]);
					break;
				case "Inactive":
					this.getView().byId("serverOvrTable").getBinding("items").filter([]);
					var vFilter1 = new sap.ui.model.Filter("EndDate", "GT", date);
					var vFilter2 = new sap.ui.model.Filter("UserEndDate", "LT", date);
					var vFilterIn = new sap.ui.model.Filter({
						filters: [vFilter1, vFilter2],
						and: true
					});
					this.getView().byId("serverOvrTable").getBinding("items").filter([vFilterIn]);
					break;
				case "Expired":
					this.getView().byId("serverOvrTable").getBinding("items").filter([]);
					var vFilter1 = new sap.ui.model.Filter("EndDate", "LT", date);
					var vFilter2 = new sap.ui.model.Filter("UserEndDate", "LT", date);
					var vFilterEx = new sap.ui.model.Filter({
						filters: [vFilter1, vFilter2],
						and: true
					});
					this.getView().byId("serverOvrTable").getBinding("items").filter([vFilterEx]);
					break;
			}
		},
		onUpdateFinished: function(oEvent) {
			var oTable = this.getView().byId("serverOvrTable");
			if (oTable.getBinding("items").isLengthFinal()) {
				var oIconTabAll = this.getView().byId("idAll");
				oIconTabAll.setCount(this.count);

			}
		},

		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "ServerOverview"){
				return;
			}
			var that = this;

			var vFilterAct1 = new sap.ui.model.Filter("EndDate", "GT", this.date);
			var vFilterAct2 = new sap.ui.model.Filter("UserEndDate", "GT", this.date);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Servers/count", "GET", {
					filters: [vFilterAct1, vFilterAct2],
					and: true
				}, null, this)
				.then(function(oData) {
					var countAct = oData.results.length;
					var oIconTabAll = that.getView().byId("idActive");
					oIconTabAll.setCount(countAct);

				})
				.catch(function(oError) {});

			var vFilterInAct1 = new sap.ui.model.Filter("EndDate", "GT", this.date);
			var vFilterInAct2 = new sap.ui.model.Filter("UserEndDate", "LT", this.date);
			var vFilterInAct = new sap.ui.model.Filter({
				filters: [vFilterInAct1, vFilterInAct2],
				and: true
			});

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Servers/count", "GET", {
					filters: [vFilterInAct]
				}, null, this)
				.then(function(oData) {
					var countInAct = oData.results.length;
					var oIconTabAll = that.getView().byId("idInActive");
					oIconTabAll.setCount(countInAct);

				})
				.catch(function(oError) {});

			var vFilterExp1 = new sap.ui.model.Filter("EndDate", "LT", this.date);
			var vFilterExp2 = new sap.ui.model.Filter("UserEndDate", "LT", this.date);
			var vFilterExp = new sap.ui.model.Filter({
				filters: [vFilterExp1, vFilterExp2],
				and: true
			});

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Servers/count", "GET", {
					filters: [vFilterExp]
				}, null, this)
				.then(function(oData) {
					var countExp = oData.results.length;
					var oIconTabAll = that.getView().byId("idExpired");
					oIconTabAll.setCount(countExp);

				})
				.catch(function(oError) {});
		},

		onDataExport: function(oEvent) {
			var key = this.getView().byId("idIconTabBarSerOvr").getSelectedKey();

			if (key == "All") {
				$.ajax({
					type: 'GET', // added,
					url: 'ServerDownload',
					success: function(data) {
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function(xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});

			} else if (key == "Ok") {
				$.ajax({
					type: 'GET', // added,
					url: 'ServerDownloadAct',
					success: function(data) {
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function(xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});

			} else if (key == "Inactive") {
				$.ajax({
					type: 'GET', // added,
					url: 'ServerDownloadInAct',
					success: function(data) {
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function(xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});
			} else {
				$.ajax({
					type: 'GET', // added,
					url: 'ServerDownloadExp',
					success: function(data) {
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function(xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf oft.fiori.view.View2
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf oft.fiori.view.View2
		 */
		// onAfterRendering: function() {
		// 	debugger;

		// }

		/*
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.View2
		 */
		//	onExit: function() {
		//
		//	}

	});

});
