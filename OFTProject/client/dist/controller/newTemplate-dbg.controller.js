sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.newTemplate", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.clearForm();
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}
		},

		herculis: function(oEvent) {
			var that = this;
			if (oEvent.getParameter("name") !== "newTemplate") {
				return;
			}

			var oList = this.getView().byId("idRecent");
			oList.bindAggregation("items", {
				path: '/Templates',
				template: new sap.m.DisplayListItem({
					label: "{CourseName} - {Type} - {DemoDate}",
					value: "{ClassTiming} / {NextClass}"
				})
			});
			var type = this.getView().byId("type").getSelectedKey();
			var courseName = this.getView().byId("course").getSelectedKey();
			var oFilter1 = new sap.ui.model.Filter("CourseName", "EQ", courseName);
			var oFilter2 = new sap.ui.model.Filter("Type", "EQ", type);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Templates", "GET", {
					filters: [oFilter1, oFilter2]
				}, {}, this)
				.then(function(oData) {
					if (oData.results.length < 1) {
						that.getView().byId('idSave').setEnabled(true);
						that.getView().byId('idUpdate').setEnabled(false);
					} else {
						that.getView().getModel('local').setProperty('/template', oData.results[0]);
						that.getView().byId('idSave').setEnabled(false);
						that.getView().byId('idUpdate').setEnabled(true);
					}

				}).catch(function(oError) {
					sap.m.MessageToast.show("template fetch failed");
				});
			// oList.attachUpdateFinished(this.counter);

		},

		clearForm: function() {
			// this.getView().getModel("local").setProperty("/template",{
			// 	"emailId": "",
			// 	"course": " ",
			// 	"date": "",
			// 	"FirstName": "",
			// 	"LastName": "",
			// 	"country": "",
			// 	"phone": "",
			// 	"subject": "",
			// 	"message": ""
			// });
		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},

		onTypeSelect: function(oEvent) {
			var that = this;
			var type = oEvent.getSource().getSelectedKey();
			var courseName = this.getView().byId("course").getSelectedKey();
			var oFilter1 = new sap.ui.model.Filter("CourseName", "EQ", courseName);
			var oFilter2 = new sap.ui.model.Filter("Type", "EQ", type);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Templates", "GET", {
					filters: [oFilter1, oFilter2]
				}, {}, this)
				.then(function(oData) {
					if (oData.results.length < 1) {
						that.getView().byId('idSave').setEnabled(true);
						that.getView().byId('idUpdate').setEnabled(false);
					} else {
						that.getView().getModel('local').setProperty('/template', oData.results[0]);
						that.getView().byId('idSave').setEnabled(false);
						that.getView().byId('idUpdate').setEnabled(true);
					}
				}).catch(function(oError) {
					sap.m.MessageToast.show("template fetch failed");
				});
		},

		onCourseSelect: function(oEvent) {
			var that = this;
			var courseName = oEvent.getSource().getSelectedKey();
			var type = this.getView().byId("type").getSelectedKey();
			var oFilter1 = new sap.ui.model.Filter("CourseName", "EQ", courseName);
			var oFilter2 = new sap.ui.model.Filter("Type", "EQ", type);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Templates", "GET", {
					filters: [oFilter1, oFilter2]
				}, {}, this)
				.then(function(oData) {
					if (oData.results.length < 1) {
						that.getView().getModel('local').setProperty('/template', {
							"CourseName": null,
							"Type": "R",
							"Template": null,
							"DemoDate": new Date(),
							"DemoInvite": null,
							"VideoLink": null,
							"CoursePage": null,
							"ClassTiming": null,
							"NextClass": null,
							"Extra1": null,
							"Extra2": null,
							"ExtraN1": null,
							"ExtraN2": null,
							"ExtraN3": null
						});
						that.getView().byId('idSave').setEnabled(true);
						that.getView().byId('idUpdate').setEnabled(false);
					} else {
						that.getView().getModel('local').setProperty('/template', oData.results[0]);
						that.getView().byId('idSave').setEnabled(false);
						that.getView().byId('idUpdate').setEnabled(true);
					}
				}).catch(function(oError) {
					sap.m.MessageToast.show("template fetch failed");
				});
		},
		// counter: function(oEvent) {
		// 	var oList = oEvent.getSource();
		// 	var counts = oList.getItems().length;
		// 	oList.getHeaderToolbar().getContent()[0].setText("Today : " + counts);
		// 	var items = oList.mAggregations.items;
		// 	var value2;
		// 	var value1;
		// 	var id;
		// 	for (var i = 0; i < items.length; i++) {
		// 		value1 = items[i].mProperties.value.split("-")[0];
		// 		id = items[i].mProperties.value.split("-")[1];
		// 		if (this.getModel("local").getProperty("/AppUsers")[id]) {
		// 			value2 = this.getModel("local").getProperty("/AppUsers")[id].UserName;
		// 			oList.getItems()[i].setValue(value1 + " - " + value2);
		// 		}
		// 	}
		// },
		onUpdate: function(oEvent) {
			var oLocal = oEvent;
			// console.log(this.getView().getModel("local").getProperty("/template"));
			var that = this;
			var templateData = this.getView().getModel("local").getProperty("/template");
			templateData.DemoDate = this.getView().byId("inqDate").getDateValue();
			templateData.CourseName = this.getView().byId("course").getSelectedKey();
			templateData.Type = this.getView().byId("type").getSelectedKey();
			var payload = {
				"CourseName": templateData.CourseName,
				"Type": templateData.Type,
				"Template": templateData.Template,
				"DemoDate": templateData.DemoDate,
				"DemoInvite": templateData.DemoInvite,
				"VideoLink": templateData.VideoLink,
				"CoursePage": templateData.CoursePage,
				"ClassTiming": templateData.ClassTiming,
				"NextClass": templateData.NextClass,
				"Extra1": templateData.Extra1
			};
			var oFilter1 = new sap.ui.model.Filter("CourseName", "EQ", payload.CourseName);
			var oFilter2 = new sap.ui.model.Filter("Type", "EQ", payload.Type);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Templates", "GET", {
					filters: [oFilter1, oFilter2]
				}, {}, this)
				.then(function(data, controller) {
					if (data.results.length > 0) {
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Templates('" + data.results[0].id + "')", "PUT", {},
								payload, that)
							.then(function(oData) {
								that.getView().setBusy(false);
								sap.m.MessageToast.show("template updated successfully");
								that.destroyMessagePopover();
								if (that.getView().byId("idRecent").getBinding("items")) {
									that.getView().byId("idRecent").getBinding("items").refresh();
								}
							}).catch(function(oError) {
								that.getView().setBusy(false);
								sap.m.MessageToast.show("template update failed "+oError.responseText);
							});
					}
					// else {
					// 	debugger;
					// 	that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Students", "POST", {}, payload, that)
					// 		.then(function(data, controller) {
					// 			sap.m.MessageToast.show("template created successfully");
					// 			if (that.getView().byId("idRecent").getBinding("items")) {
					// 				that.getView().byId("idRecent").getBinding("items").refresh();
					// 			}
					// 		});
					// }
				});
			// that.getView().setBusy(true);

		},

		onSave: function(oEvent) {
			var oLocal = oEvent;
			// console.log(this.getView().getModel("local").getProperty("/template"));
			var that = this;
			var templateData = this.getView().getModel("local").getProperty("/template");
			var payload = templateData ? templateData : {};
			payload.DemoDate = this.getView().byId("inqDate").getDateValue();
			payload.CourseName = this.getView().byId("course").getSelectedKey();
			payload.Type = this.getView().byId("type").getSelectedKey();
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Templates", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("template Saved successfully");
					that.destroyMessagePopover();
					if (that.getView().byId("idRecent").getBinding("items")) {
						that.getView().byId("idRecent").getBinding("items").refresh();
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("template Saving failed "+oError.responseText);
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
