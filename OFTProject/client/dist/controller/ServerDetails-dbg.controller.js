sap.ui.define([
	"oft/fiori/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("oft.fiori.controller.ServerDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.OFTProject.client.view.ServerDetails
		 */
			onInit: function() {
				var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if(currentUser){
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;				
			}
	    		loginUser = "Hey " + loginUser;				
				this.getView().byId("idUser").setText(loginUser);
			}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf oft.fiori.OFTProject.client.view.ServerDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf oft.fiori.OFTProject.client.view.ServerDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.OFTProject.client.view.ServerDetails
		 */
		//	onExit: function() {
		//
		//	}

	});

});