sap.ui.define([
	"oft/fiori/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("oft.fiori.controller.Supplier", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.Supplier
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.mySupplierLoad, this);

		},
		mySupplierLoad: function(oEvent){
			//Restore the state of UI by fruitId
			var sPath = oEvent.getParameter("arguments").suppId;
			sPath = "/suppliers/" + sPath;
			this.getView().bindElement(sPath);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf oft.fiori.view.Supplier
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf oft.fiori.view.Supplier
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.Supplier
		 */
		//	onExit: function() {
		//
		//	}

	});

});
