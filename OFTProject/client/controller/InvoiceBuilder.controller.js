sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"oft/fiori/models/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Core, Filter, FilterOperator, Formatter, Fragment, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("oft.fiori.controller.InvoiceBuilder", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.onBankAccount, this);
		},
		formatter: Formatter,
		onBankAccount: function(oEvent) {
			var rangeDate = new Date();
			var month = rangeDate.getMonth() + 1;
			var year = rangeDate.getFullYear();
			var startDate = new Date(year + " " + month);
			this.getView().byId("idRegDate").setValue(startDate.toDateString().slice(4));
			this.getView().byId("idRegDateTo").setValue(rangeDate.toDateString().slice(4));
			// this.super("123456789", month+'.'+'01.'+year, month+'.'+rangeDate.getDate()+'.'+year);
			var that = this;
		},
		onSave: function() {
			var that = this;
			var payload = this.getView().getModel("local").getProperty("/PerformaInvoices");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/PerformaInvoices", "POST", {},
					payload, this)
				.then(function(oData) {

					that.getView().setBusy(false);
					sap.m.MessageToast.show("Saved successfully");
				}).catch(function(oError) {
					that.getView().setBusy(false);
					MessageBox.error(oError);
				});
		},
		onStartDate: function() {
			var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
			var startDate = this.getView().byId("idRegDate").getValue();
			var endDate = this.getView().byId("idRegDateTo").getValue();
			this.super(accountNo, startDate, endDate);
		},
		onEndDate: function(oEvent) {
			this.onStartDate();
		},
		onFullScreen: function(oEvent) {
			var oMode = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getMode();
			if (oMode === "ShowHideMode") {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("HideMode");
				oEvent.getSource().setIcon("sap-icon://exit-full-screen");
				oEvent.getSource().setText("Hide Fullscreen");
			} else {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("ShowHideMode");
				oEvent.getSource().setIcon("sap-icon://full-screen");
				oEvent.getSource().setText("Show Fullscreen");
			}
		},
	});

});
