sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.serverPayment", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var that = this;
			that.getView().setBusy(true);

			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if(currentUser){
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			}
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});

				that.getView().setBusy(true);
		    	this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/ServerPays", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});

		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		onItemSelect: function(oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var indexSupp = sPath.split("/")[sPath.split("/").length - 1];
			this.oRouter.navTo("detail2", {
				suppId: indexSupp
			});
		},
		onPress: function() {
			sap.m.MessageBox.alert("Button was clicked");
		},
		onHover: function() {
			sap.m.MessageBox.alert("Button was Hovered");
		},
		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "serverPayment"){
				return;
			}
			this.getView().byId("serTable").getBinding("items").refresh(true);
			this.getView().getModel("local").setProperty("/newServerPay/PaymentDate", this.formatter.getFormattedDate(0));
		},
		supplierPopup: null,
		oInp: null,
		onPopupConfirm: function(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			this.oInp.setValue(selectedItem.getLabel());
		},

		oSuppPopup: null,
		onFilter: function() {

			if (!this.oSuppPopup) {
				this.oSuppPopup = new sap.ui.xmlfragment("oft.fiori.fragments.popup", this);

				this.getView().addDependent(this.oSuppPopup);

				this.oSuppPopup.setTitle("Suppliers");

				this.oSuppPopup.bindAggregation("items", {
					path: "/suppliers",
					template: new sap.m.DisplayListItem({
						label: "{name}",
						value: "{city}"
					})
				});
			}

			this.oSuppPopup.open();
		},

		onRequest: function(oEvent) {

			//Store the object of the input field on which F4 was press
			this.oInp = oEvent.getSource();

			//Step 1: Display a popup cl_gui_alv_grid, set_table_for_first_table
			if (!this.supplierPopup) {
				// this.supplierPopup = new sap.m.SelectDialog({
				// 	title: "Supplier Popup",
				// 	confirm: this.onPopupConfirm.bind(this)
				// });
				this.supplierPopup = new sap.ui.xmlfragment("oft.fiori.fragments.popup", this);

				this.supplierPopup.setTitle("Cities");
				//Will now supply the model set at the view level to its children
				this.getView().addDependent(this.supplierPopup);

				//this.supplierPopup.setTitle("")
				//Step 2: Values to be populated with aggregation binding
				this.supplierPopup.bindAggregation("items", {
					path: "/cities",
					template: new sap.m.DisplayListItem({
						label: "{cityName}",
						value: "{famousFor}"
					})
				});

			}
			//Step 3: Just open same popup once create
			this.supplierPopup.open();

		},
		onConfirm: function(oEvent) {
			//debugger;
			// if (anubhav === "OK") {
			// 	MessageToast.show("Your fruit has been approved successfully");
			// 	this.getView().byId("idApr").setVisible(false);
			// }

			// onConfirm: function(oEvent) {
			var data = this.getSelectedKey(oEvent);

			this.getView().byId("customerId").setValue(data[0]);
			this.getView().byId("name").setText(data[1]);
			this.getView().byId("cid").setValue(data[2]);

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
		onSave: function(oEvent) {
			var oLocal = oEvent;
			console.log(this.getView().getModel("local").getProperty("/newServerPay"));
			var that = this;
			that.getView().setBusy(true);
			var serverPay = this.getView().getModel("local").getProperty("/newServerPay");
			if (!this.getView().byId("payDate").getDateValue()) {
				sap.m.MessageToast.show("Enter a valid Date");
				return "";
			}
			var payload = {
				"Type": this.getView().byId("idRBG").getSelectedButton().mProperties.text,
				"StudentId": this.getView().byId("cid").getValue(),
				"Amount": this.getView().byId("amount").getValue(),
				"PaymentDate": this.getView().byId("payDate").getDateValue(),
				"Remarks": this.getView().byId("Remarks").getValue(),
				"Update":"C"
					// "SoftDelete": false
			};

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/ServerPays", "POST", {},
					payload, that)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Server Payment Saved successfully");
					// that.destroyMessagePopover();
					if (that.getView().byId("serTable").getBinding("items")) {
						that.getView().byId("serTable").getBinding("items").refresh(true);
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);

				});

			// $.post("/api/Inquries",payload,
			// function(data, status){
			//     sap.m.MessageBox.confirm("Wallah! Posted");
			// });
		},
		onSearch: function(oEvent) {
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
		},
		onSelect: function() {
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

		},
		radiobuttonselect: function(evt) {
			var index = evt.getParameters().selectedIndex;
			if (index == 1) {
				this.getView().byId("customerId").setEnabled(true);
			} else {
				this.getView().byId("customerId").setEnabled(false);
				this.getView().byId("customerId").setValue(null);
				this.getView().byId("cid").setValue(null);
				this.getView().byId("name").setText(null);
			}

		},
		onDelete: function(oEvent) {
			var that = this;
			MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
				if (conf == 'OK') {
					var items = that.getView().byId('serTable').getSelectedContexts();
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
		onDataExport: function(oEvent) {
			$.ajax({
				type: 'GET', // added,
				url: 'ServerPayDownload',
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});
		},

		onApprove: function() {

				MessageBox.confirm("Do you want to approve this fruit", {
					title: "confirmation",
					//[this.functionName, this], as a substitute we use .bind(this) method
					onClose: this.onConfirm.bind(this)
				});

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
		//	onAfterRendering: function() {
		//
		//	},

		/*
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.View2
		 */
		//	onExit: function() {
		//
		//	}

	});

});
