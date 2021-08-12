var oEvt;
var CCModel;
var oView;
var oThat;
sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/table/Table",
	"sap/m/StandardListItem",
	"sap/m/List"
], function(Controller, MessageBox, MessageToast, Formatter, Table, StandardListItem, List) {
	"use strict";

	return Controller.extend("oft.fiori.controller.dataMaintenance", {
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
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;			
			this.getView().byId("idUser").setText(loginUser);
		},
		onBack: function(){
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		herculis: function(oEvent){

		},
		

		
		onSelection: function(oEvent){
			//alert("Table");

			if(oEvent.mParameters.newValue === "Inquries") {

				var entitySet = "Inquries";
					// alert("Inquiries Table");

				this.displayTable(entitySet);
			} else if(oEvent.mParameters.newValue === "Batches") {

				var entitySet = "Courses";

				// alert("Batches Table");
				this.displayTable(entitySet);

			} else if(oEvent.mParameters.newValue === "Servers") {

				var entitySet = "Servers";
				// alert("Servers Table");
				this.displayTable(entitySet);
			} else if (oEvent.mParameters.newValue == "Students") {

				var entitySet = "Students";
				// alert("Students Table");

				this.displayTable(entitySet);
			} else if (oEvent.mParameters.newValue == "Subscriptions") {

				var entitySet = "Subs";
				// alert("Subs Table");
				this.displayTable(entitySet);
			}
		},
		
		displayTable: function(entitySet) {

			oView = this.getView().byId("paneld");
			oView.destroyContent();

				var oModelJsonCC = new sap.ui.model.json.JSONModel();
				 CCModel = this.getOwnerComponent().getModel();
			     CCModel.read("/" + entitySet, {
				 success: function(oData, response) {
						oModelJsonCC.setData(oData);
	// ----DO This-------------------------------------------------
			var count = CCModel.oAnnotations._oMetadata._getEntityTypeByName(entitySet).property.length;	
			var i = 0;
			var columnData;
			var columnData = [];

			for (i = 0; i < count; i++) {
				columnData.push({
					"columnName": CCModel.oAnnotations._oMetadata._getEntityTypeByName(entitySet).property[i].name
				});
			}

			var mmodel = CCModel;
			this.rowData = [];
			var that = this;
			oThat = this;
			mmodel.read("/" + entitySet, {

				success: function(oData, response) {
					var len = oData.results.length;

					var oJModel = new sap.ui.model.json.JSONModel();
					var m;
					for (i = 0; i < len; i++) {
						m = oData.results[i];
						that.rowData.push(m);
					}

					that.oTable = new Table({
						id: "DatabaseTable"


					});

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						rows: that.rowData,
						columns: columnData
					});
					that.oTable.setModel(oModel);

					that.oTable.bindColumns("/columns", function(sId, oContext) {
						var columnName = oContext.getObject().columnName;
						return new sap.ui.table.Column({
							label: columnName,
							template: columnName,
							enableColumnFreeze: true,
							width: '180px'
						});
					});
					
					that.oTable.bindRows("/rows");
					that.oTable.placeAt(oView);

				}
			});

	// -----End of DO this--------------------------------------------					
				}

					});
	
	}
	
	// 	onDelete:function(oEvent){
	// 	var that = this;
	// 	 MessageBox.confirm("Do you want to delete the selected records?",function(conf){
	//  	if(conf=='OK'){
	//   var items =	that.getView().byId('DatabaseTable').getSelectedContexts();
	//   for(var i = 0; i<items["length"]; i++){
	//   	that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath, "DELETE", {},
	// 				{})
	// 			.then(function(oData) {
	// 				sap.m.MessageToast.show("Deleted succesfully");
	// 			}).catch(function(oError) {
	// 				that.getView().setBusy(false);
	// 				that.oPopover = that.getErrorMessage(oError);
	// 				that.getView().setBusy(false);
	// 			});
	   	
	//   }}
	//  },"Confirmation");

		
	// }
	
	});
});