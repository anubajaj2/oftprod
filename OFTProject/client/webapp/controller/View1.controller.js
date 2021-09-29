sap.ui.define([
	"oft/fiori/controller/BaseController",
	"oft/fiori/models/models"
], function(Controller, Models) {
	"use strict";

	return Controller.extend("oft.fiori.controller.View1", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View1
		 */

		onInit: function() {
			//var oModel = Models.createFruitModel();
			//sap.ui.getCore().setModel(oModel);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.loadAllStudents();
			this.loadAllAppUsers();
			this.initAccounts();
			if (sap.ui.Device.system.phone) {
				this.getOwnerComponent().getModel("local").setProperty("/IsPhone", true);
			}
		},
		onSuggest: function(oEvent) {
			var suggestVal = oEvent.getParameter("suggestValue");
			//oEvent.getSource().suggest();
			// var oFilterName = new sap.ui.model.Filter(
			// 	"name",
			// 	sap.ui.model.FilterOperator.Contains,
			// 	suggestVal);
			// oEvent.getSource().getBinding("suggestionItems").filter(oFilterName);

		},
		onDelete: function(oEvent) {
			var oList = oEvent.getSource();
			var oItemToBeDeleted = oEvent.getParameter("listItem");
			oList.removeItem(oItemToBeDeleted);
		},
		onSelectItem: function(oEvent) {

			var oListItem = oEvent.getParameter("listItem");
			var sPath = oListItem.getBindingContextPath();
			var viewId = oListItem.getId().split("--")[oListItem.getId().split("--").length - 1];
			this.oRouter.navTo(viewId);
			// var oList = oEvent.getSource();
			// var oSplitApp = oList.getParent().getParent().getParent().getParent();
			// oSplitApp.hideMaster();

			// //Step 1: get the selected item from list and its path of element
			// //select row of the table


			// //Step 2: bind the selected element path with whole of next view
			// //binding the simple form with element selected using element binding
			// var oView2 = sap.ui.getCore().byId("idView2");
			// oView2.bindElement(sPath);

			// //step 3: navigate to next view
			// this.onNext();
			// //debugger;
		},
		onSearch: function(oEvent) {
			//debugger;
			var searchStr = oEvent.getParameter("query");
			if (!searchStr) {
				searchStr = oEvent.getParameter("newValue");
			}
			var oFilterName = new sap.ui.model.Filter(
				"name",
				sap.ui.model.FilterOperator.Contains,
				searchStr);
			var oFilterTyp = new sap.ui.model.Filter(
				"nature",
				sap.ui.model.FilterOperator.Contains,
				searchStr
			);
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilterTyp, oFilterName],
				and: false
			});
			//Will this be an AND between these 2 filters or an OR operation?
			var aFilter = [oFilter];
			var oList = this.getView().byId("idFruitsList");
			oList.getBinding("items").filter(aFilter);

		},

		onNext: function() {

			//step 1: Get the object of the app control (parent for both view)
			var oApp = sap.ui.getCore().byId("idApp");
			//step 2: call the method .to and pass view id to which we wanna navigate
			oApp.to("idView2");

		},
		onOrange: function() {
			alert("welcome to orange");
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf oft.fiori.view.View1
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf oft.fiori.view.View1
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.View1
		 */
		//	onExit: function() {
		//
		//	}

	});

});
