sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter",
	'sap/viz/ui5/format/ChartFormatter',
  'sap/viz/ui5/api/env/Format'
], function(Controller, MessageBox, MessageToast, Formatter, Filter, ChartFormatter, Format) {
	"use strict";

	return Controller.extend("oft.fiori.controller.GSTInvoices", {
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
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "GSTInvoices"){
				return;
		}

}
	});

});
