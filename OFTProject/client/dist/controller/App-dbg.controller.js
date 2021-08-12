sap.ui.define([
	"oft/fiori/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("oft.fiori.controller.App", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.App
		 */
		 idleLogout: function() {
			 var t;
			 var that = this;
			 window.onbeforeunload = function() {
        that.logOutApp("X");
			 };

			 window.onload = resetTimer;
			 window.onmousemove = resetTimer;
			 window.onmousedown = resetTimer;  // catches touchscreen presses as well
			 window.ontouchstart = resetTimer; // catches touchscreen swipes as well
			 window.onclick = resetTimer;      // catches touchpad clicks as well
			 window.onkeypress = resetTimer;
			 window.addEventListener('scroll', resetTimer, true); // improved; see comments

			 function yourFunction() {
					 // your function for too long inactivity goes here
					 // e.g. window.location.href = 'logout.php';
					 sap.m.MessageBox.alert("Page expired, please login again!");
					 window.top.location.href = "/";
			 }

			 function resetTimer() {
					 clearTimeout(t);
					 t = setTimeout(yourFunction, 900000);  // time is in milliseconds
			 }
		 },
		 onLogout: function(){
			 this.logOutApp();
		 },
			onInit: function() {
				this.getOwnerComponent().getModel("local").setSizeLimit(600);
				this.idleLogout();
				
			}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf oft.fiori.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf oft.fiori.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});