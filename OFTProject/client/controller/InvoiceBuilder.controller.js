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
			this.oLocalModel = this.getOwnerComponent().getModel("local");
			var that = this;
			$.ajax({
				type: 'GET', // added,
				url: 'getLogo',
				success: function(data) {
					that.logo = data;
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in fetching logo");
				}
			});
			$.ajax({
				type: 'GET', // added,
				url: 'getSignature',
				success: function(data) {
					that.signature = data;
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in fetching signature");
				}
			});
		},
		formatter: Formatter,
		setRandomInvoiceNo: function() {
			var rangeDate = new Date(),
				month = rangeDate.getMonth() + 1,
				year = rangeDate.getFullYear();
			this.oLocalModel.setProperty("/PerformaInvoices/InvoiceNo", "INV-" + year + (month < 10 ? '0' + month : month) + "-" + Math.floor(Math.random() * 1000));
		},
		onBankAccount: function(oEvent) {
			var rangeDate = new Date();
			var month = rangeDate.getMonth() + 1;
			var year = rangeDate.getFullYear();
			var startDate = new Date(year + " " + month);
			this.getView().byId("idDate").setValue(startDate.toDateString().slice(4));
			this.getView().byId("idDueDate").setValue(rangeDate.toDateString().slice(4));
			this.setRandomInvoiceNo();
		},
		onSelect: function(oEvent) {
			this.sId = oEvent.getSource().getId();

			var sTitle = "",
				sPath = "";
			if (this.sId.indexOf("accountDetails") !== -1) {
				var oAccFilter = new sap.ui.model.Filter("deleted", FilterOperator.EQ, false);
				sTitle = "Account Search";
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
			}
		},
		onConfirm: function(oEvent) {
			if (this.sId.indexOf("accountDetails") !== -1) {
				var accountNo = oEvent.getParameter("selectedItem").getValue();
				var accountDetails = this.oLocalModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath());
				this.oLocalModel.setProperty("/PerformaInvoices/AccountNo", accountNo);
				var currency = this.oLocalModel.getProperty("/PerformaInvoices/Currency");
				if (accountNo === "114705500444" && currency === "INR") {
					var note = "Please make payment before the due date in below a/c and share the screenshot with us\n" +
						"Account Number:                  " + accountNo + "\n" +
						"Account Type:                       " + (accountDetails.current ? "Current" : "Saving") + "\n" +
						"Account name:                      " + accountDetails.accountName + "\n" +
						"IFSC Code:                            " + accountDetails.ifsc +
						"\nYou can also pay with barcode scan of UPI https://www.anubhavtrainings.com/upi-payment-gateway";
					this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
					var address = "EPS-FF-073A, Emerald Plaza,\nGolf Course Extension Road, Sector 65";
					// +",\nCity            Gurgaon\nPinCode           122018.\nState             Haryana\nContact No             +91-8448454549" +
					// "Country             India\nGSTIN:            06AEFFS9740G1ZS";
				} else if (currency === "INR") {
					var note = "Please make payment before the due date in below a/c and share the screenshot with us\n" +
						"Account Number:                  " + accountNo + "\n" +
						"Account Type:                       " + (accountDetails.current ? "Current" : "Saving") + "\n" +
						"Account name:                      " + accountDetails.accountName + "\n" +
						"IFSC Code:                            " + accountDetails.ifsc;
					this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
					var address = "B-25 Shayona shopping center,\n" + "Near Shayona Party Plot, Chanikyapuri";
					// + ",\nCity -	 Ahemdabad\n" +
					// 	+"PinCode			 380061\n" + "State 		Gujarat\n" + "Contact No       +91-8448454549\n" + "Country        India";
				}
			}
		},
		// onCurrencyChange: function(oEvent) {
		//
		// },
		onCurrencyLiveChange: function(oEvent) {
			oEvent.getSource().setValue(oEvent.getParameter("value").toUpperCase());
			if (oEvent.getParameter("value") !== "INR") {
				var amount = this.oLocalModel.getProperty("/PerformaInvoices/Amount");
				var note = "Please make payment using Paypal with the below link-\nhttps://www.paypal.com/paypalme/anubhavstraining/" + amount;
				this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
			}
		},
		onAmount: function(oEvent) {
			if (this.oLocalModel.getProperty("/PerformaInvoices/Currency") !== "INR") {
				var note = "Please make payment using Paypal with the below link-\nhttps://www.paypal.com/paypalme/anubhavstraining/" + oEvent.getParameter("value");
				this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
			}
		},
		onSave: function() {
			var that = this;
			var payload = this.getView().getModel("local").getProperty("/PerformaInvoices");
			if (!payload.CompanyName) {
				MessageToast.show("Please Fill All Mandatory Fields");
				return;
			}
			payload.Date = new Date(payload.Date);
			payload.DueDate = new Date(payload.DueDate);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/PerformaInvoices", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Saved successfully");
					that.setRandomInvoiceNo();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					MessageBox.error(oError);
				});
		},
		// onStartDate: function() {
		// 	var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
		// 	var startDate = this.getView().byId("idRegDate").getValue();
		// 	var endDate = this.getView().byId("idRegDateTo").getValue();
		// 	this.super(accountNo, startDate, endDate);
		// },
		// onEndDate: function(oEvent) {
		// 	this.onStartDate();
		// },
		onFullScreen: function(oEvent) {
			var oMode = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getMode();
			if (oMode === "ShowHideMode") {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("HideMode");
				oEvent.getSource().setIcon("sap-icon://exit-full-screen");
				oEvent.getSource().setText("Hide Fullscreen");
			} else {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("ShowHideMode");
				oEvent.getSource().setIcon("sap-icon://full-screen");
				oEvent.getSource().setText("Show Fullscreen");
			}
		},
	});

});
