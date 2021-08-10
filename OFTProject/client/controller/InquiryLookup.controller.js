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

	return Controller.extend("oft.fiori.controller.InquiryLookup", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.clearForm();
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			// var currentUser = this.getModel("local").getProperty("/CurrentUser");
			// if (currentUser) {
			// 	var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			// 	this.getView().byId("idUser").setText(loginUser);
			// }
			var courses = JSON.parse(JSON.stringify(this.getOwnerComponent().getModel("local").getProperty("/courses")));
			courses.splice(0, 0, {
				courseName: "All Courses"
			});
			this.getOwnerComponent().getModel("local").setProperty("/inquiryLookupCourses", courses)
			var that = this;
			var date = new Date();
			var oDRS3 = this.byId("DRS3");
			oDRS3.setDateValue(new Date(date.getFullYear(), date.getMonth(), 1));
			oDRS3.setSecondDateValue(new Date());
			var oDRS32 = this.byId("DRS32");
			oDRS32.setDateValue(new Date(date.getFullYear(), date.getMonth(), 1));
			oDRS32.setSecondDateValue(new Date());
			var oDRS33 = this.byId("DRS33");
			oDRS33.setDateValue(new Date(date.getFullYear(), date.getMonth(), 1));
			oDRS33.setSecondDateValue(new Date());
		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		herculis: function(oEvent) {
			var that = this;
			setTimeout(function() {
				that.onFilter();
				that.onFilter2();
				that.onFilter3();
			}, 2000);
		},
		onChartTypeChange: function(oEvent) {
			this.getView().getModel("local").setProperty("/inquiryLookupVizType", oEvent.getParameter("selectedItem").getKey());
		},
		onFilter: function() {
			var that = this;
			var dateRange = this.byId("DRS3");
			var courseName = this.byId("idCourseName");
			var staffName = this.byId("idStaffName");
			var oPayload = {
				startDate: dateRange.getFrom(),
				endDate: dateRange.getTo(),
				staffId: staffName.getSelectedKey().split(" ")[0],
				course: courseName.getSelectedKey() === "All Courses" ? null : courseName.getSelectedKey()
			};
			$.post('/inquiryLookup', oPayload)
				.done(function(data, status) {
					debugger;
					that.getView().getModel("local").setProperty("/IquiryLookup", data);
				})
				.fail(function(xhr, status, error) {
					MessageBox.error("Error in access");
				});
		},
		onFilter2: function() {
			var that = this;
			var dateRange = this.byId("DRS32");
			var oPayload = {
				startDate: dateRange.getFrom(),
				endDate: dateRange.getTo(),
				// staffId: staffName.getSelectedKey().split(" ")[0],
				// course: courseName.getSelectedKey() === "All Courses" ? null : courseName.getSelectedKey()
			};
			$.post('/inquiryLookupMarketingReport', oPayload)
				.done(function(data, status) {
					debugger;
					that.getView().getModel("local").setProperty("/IquiryLookupMarketingReport", data);
				})
				.fail(function(xhr, status, error) {
					MessageBox.error("Error in access");
				});
		},
		onFilter3: function() {
			var that = this;
			var dateRange = this.byId("DRS33");
			var oPayload = {
				startDate: dateRange.getFrom(),
				endDate: dateRange.getTo()
			};
			$.post('/inquiryLookupStaffReport', oPayload)
				.done(function(data, status) {
					debugger;
					that.getView().getModel("local").setProperty("/IquiryLookupStaffReport", data);
				})
				.fail(function(xhr, status, error) {
					MessageBox.error("Error in access");
				});
		},
		onSendMail: function() {
			var inquiryLookup = this.getView().getModel("local").getProperty("/IquiryLookup");
			var staffName = this.byId("idStaffName")._getSelectedItemText();
			var emailId = this.byId("idStaffName").getSelectedKey().split(" ")[1];
			var dateRange = this.byId("DRS3");
			var dateCount = "Date\t\t|\t\tCount\n";
			inquiryLookup.forEach(function(item) {
				dateCount += ("\n" + item.date + "\t|\t" + item.count);
			})
			var mailContent = {
				subject: "Your Inquiries between " + dateRange.getFrom().toDateString() + " - " + dateRange.getTo().toDateString(),
				body: "Hello " + staffName + ",\n\nPlease find details of your inquiries between " + dateRange.getFrom().toDateString() +
					" - " + dateRange.getTo().toDateString() +
					".\n\n" + dateCount + "\n\n" +
					"Kindly check the dates where count was zero and maintain the work accordingly.\n\nRegards,\nAnubhav"
			};
			console.log(mailContent);
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
