sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"oft/fiori/models/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Filter, FilterOperator,Formatter, MessageBox,MessageToast) {
	"use strict";

	return Controller.extend("oft.fiori.controller.BankAccount", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.Supplier
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.onBankAccount, this);
			this.getView().byId("idRegDate").setValue(new Date());
		},
		formatter: Formatter,
		onBankAccount: function(oEvent){
			if(oEvent.getParameter("name") !== "BankAccount"){
				return;
			}
			this.super();
		},
		onConfirm: function(oEvent) {

			if (this.sId.indexOf("accountDetails") !== -1) {

				var bankName = oEvent.getParameter("selectedItem").getValue();
				this.getView().getModel("local").setProperty("/accountBalance/AccountNo", bankName);

				var oFilter = new sap.ui.model.Filter("AccountNo", "EQ", bankName);
				this.getView().byId("idAcEntry").getBinding("items").filter(oFilter);
				this.getView().byId("idSummary").getBinding("items").filter(oFilter);
			}
		},
		onItemPress: function(oEvent) {
			var that = this;
			if (!this.oAccountDetails) {
				this.oAccountDetails = new sap.m.SelectDialog();
				sap.ui.getCore().getMessageManager().registerObject(this.oAccountDetails, true);
				this.getView().addDependent(this.oAccountDetails);
			}
			// var sPath = oEvent.getSource().oBindingContexts.undefined.sPath;
			// sPath = sPath.split("/")[1];
			// var oModel = this.getView().getModel().oData[sPath];
			$.post('/getAllForAccount', {AccountNo: oEvent.getSource().getModel("viewModel").getProperty(oEvent.getSource().getBindingContextPath()).AccountNo})
				.done(function(data, status) {
					console.log(data);
					var oModelNew = new sap.ui.model.json.JSONModel();
					oModelNew.setData({"data": data});
					that.getView().setModel(oModelNew,"acModel");
					that.oAccountDetails.setModel(oModelNew,"acModel");
					that.oAccountDetails.bindAggregation("items",{
						path: "acModel>/data",
						template: new sap.m.DisplayListItem({
							value : "{acModel>PaymentDate}",
							label:"{acModel>Amount}"
						})
					});
					that.oAccountDetails.open();
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error(xhr.responseText);
				});


		},
		onAcSelect: function(oEvent){
			this.oEvent_approve = oEvent;
 			var that = this;
			var loginPayload = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			var postPayload = {
				AccountNo: loginPayload.AccountNo,
				State: oEvent.getSource().getSelected()
			};
			$.post('/markCheckedAccount', postPayload)
				.done(function(data, status) {
					sap.m.MessageToast.show("Account Checked Success");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error(xhr.responseText);
				});

		},
		MResetCounter: function(oEvent){
			var sId = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath()).id;
			oEvent.getSource().setText("0");
			this.resetCounter(sId);
		},
		resetCounter: function(sId){
			$.post('/ResetCounter', {id: sId})
				.done(function(data, status) {
					sap.m.MessageToast.show("done");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error(xhr.responseText);
				});
		},
		MSetKey: function(oEvent) {
			debugger;
			var sId = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath()).id;

			var newKey = prompt("Please enter your password", "");

			if(newKey !== ""){
				oEvent.getSource().setText(newKey);
				this.setKey(newKey,sId);
			}

		},
		setKey: function(newKey, sId){
			$.post('/ResetPassword', {
				id: sId,
				key: newKey
			})
				.done(function(data, status) {
					sap.m.MessageToast.show("done");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error(xhr.responseText);
				});
		},
		onGetNext: function(){
			$.post('/MoveNextAc', {})
				.done(function(data, status) {
					sap.m.MessageBox.confirm(data.accountNo + "," + data.BankName + "," +
																	data.ifsc + "," + data.accountName);
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error(xhr.responseText);
				});
		},
		onBank: function(oEvent){
			this.oEvent_approve = oEvent;
 			var that = this;
			var loginPayload = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			if(loginPayload.AccountName){
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Accounts",
				 "GET", {
					 filters: [new sap.ui.model.Filter("accountNo","EQ",loginPayload.AccountNo)]
				 }, {}, this)
					.then(function(oData) {

						console.log(oData.results[0].userId);
						console.log(oData.results[0].key);
						try {
							navigator.clipboard.writeText(oData.results[0].userId);
						} catch (e) {

						} finally {

						}
						window.open(oData.results[0].extra1);
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);

					});
			}

		},
		onLiveSearch: function(oEvent){
			var queryString = oEvent.getParameter("value");
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
		},
		onSend: function() {

			var payload = this.getView().getModel("local").getProperty("/accountBalance");
			payload.CreatedOn = this.getView().byId("idRegDate").getDateValue();
			var that = this;
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AccountBalances", "POST", {},
					payload, this, true)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Account entry Saved successfully");
					//this.getView().byId("idRegDate").setDateValue(new Date());
					that.getView().getModel("local").setProperty("/accountBalance/CreatedOn", that.formatter.getFormattedDate(0));
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onRefresh: function(){
			this.super();
		},
		onDelete: function(oEvent){
			var that = this;
			MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
				if (conf == 'OK') {
					var items = that.getView().byId('idAcEntry').getSelectedContexts();
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
		onSelect: function(oEvent){
			this.sId = oEvent.getSource().getId();

			var sTitle = "",
				sPath = "";
				if (this.sId.indexOf("accountDetails") !== -1) {
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
				}
		},
		onStudentIdChange: function(oContext){

		},
		super: function(){
			var that = this;
			$.get('/getAmountPerAccount')
				.done(function(data, status) {
					var oNewModel = new sap.ui.model.json.JSONModel();
					//this.formatter.sortByProperty(data,"Amount");
					data.sort(function (a, b) {
					  return b.Amount - a.Amount;
					});
					oNewModel.setData({"records": data});
					var ThisFY = 0;
					var AllAsset = 0;
					for (var i = 0; i < data.length; i++) {
						ThisFY = ThisFY + data[i].NewDeposit;
						AllAsset = AllAsset + data[i].Amount;
					}
					that.getView().byId("newtitle").setText("A/c Summary : This FY " + ThisFY + " Total Available : " + AllAsset )
					that.getView().setModel(oNewModel,"viewModel");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});
		}

	});

});
