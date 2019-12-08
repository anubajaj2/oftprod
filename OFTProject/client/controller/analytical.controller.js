sap.ui.define([
	// "sap/ui/core/mvc/Controller",
	"oft/fiori/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	// "sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"oft/fiori/models/ChartFormatter"
], function(Controller, JSONModel, Filter, FilterOperator, ChartFormatter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.analytical", {
		_oJSONModel: null,
		_oJSONModel1: null,
		_oJSONModel2: null,
		_oVizFrame1: null,
		_oVizFrame2: null,
		_oVizFrame3: null,
		_VizFrame: null,
		_oZone_Storage: null,


		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onWorkListMatched, this);
			// var oVizFrame = this.getView().byId("idStackedChart");
			// var oModel = new sap.ui.model.json.JSONModel();
			//
			// var data = {
			// 		'Batches' : [
			//             {"Batch": "Batch1","Students": "20"},
			//             {"Batch": "Batch2","Students": "30"},
			//             {"Batch": "Batch3","Students": "100"},
			//             {"Batch": "Batch4","Students": "50"},
			//             {"Batch": "Batch5","Students": "80"}
			//            ]};
			// oModel.setData(data);
			//
			// var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			// 	dimensions : [{
			// 		name : 'Batch',
			// 		value : "{Batch}"}],
			//
			// 	measures : [{
			// 		name : 'Batches',
			// 		value : '{Students}'} ],
			//
			// 	data : {
			// 		path : "/Batches"
			// 	}
			// });
			//
			// oVizFrame.setDataset(oDataset);
			// oVizFrame.setModel(oModel);
			// oVizFrame.setVizType('column');
			//
			//
			// 	oVizFrame.setVizProperties({
			//         plotArea: {
			//         	colorPalette : d3.scale.category20().range()
			//             }});
			//
			// var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			//       'uid': "valueAxis",
			//       'type': "Measure",
			//       'values': ["Batches"]
			//     }),
			//     feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			//       'uid': "categoryAxis",
			//       'type': "Dimension",
			//       'values': ["Batch"]
			//     });
			// oVizFrame.addFeed(feedValueAxis);
			// oVizFrame.addFeed(feedCategoryAxis);
			//
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			this.getView().byId("idUser").setText(loginUser);

			//--- Chart Properties ---//
			var formatPattern = ChartFormatter.DefaultPattern;
			var oVizFrame1 = this.oVizFrame = this.getView().byId("idVizFrame1");
			var oVizFrame2 = this.oVizFrame = this.getView().byId("idVizFrame2");
			var oVizFrame3 = this.oVizFrame = this.getView().byId("idVizFrame3");
			var oVizFrame4 = this.oVizFrame = this.getView().byId("idVizFrame4");

			this._setChartProperties(oVizFrame1, "Students Per Batch");
			this._setChartProperties(oVizFrame2, "Batches Per Course");
			this._setChartProperties(oVizFrame3, "Students Per Course");
			this._setChartProperties(oVizFrame4, "Students For Last 5 Months");

      //--- Initial Page Settings
			this._initPageSettings(this.getView(), "idVizFrame1", "Cell1");
			this._initPageSettings(this.getView(), "idVizFrame2", "Cell2");
			this._initPageSettings(this.getView(), "idVizFrame3", "Cell3");
			this._initPageSettings(this.getView(), "idVizFrame4", "Cell4");

			// var oPopOver = this.getView().byId("idPopOver");
			// oPopOver.connect(oVizFrame1.getVizUid());
			// oPopOver.setFormatString(formatPattern.STANDARDFLOAT);


			//--- Chart Properties ---//
		},

		_initPageSettings: function(oView, sChartId, sBlockId) {
			// Hide Settings Panel for phone
			if (sap.ui.Device.system.phone) {
				var oSettingsPanel = oView.byId('settingsPanel');
				if (oSettingsPanel) {
					oSettingsPanel.setExpanded(false);
				}
			}

			// try to load sap.suite.ui.commons for using ChartContainer
			// sap.suite.ui.commons is available in sapui5-sdk-dist but not in demokit
			var libraries = sap.ui.getVersionInfo().libraries || [];
			var bSuiteAvailable = libraries.some(function(lib) {
				return lib.name.indexOf("sap.suite.ui.commons") > -1;
			});
			if (bSuiteAvailable) {
				jQuery.sap.require("sap/suite/ui/commons/ChartContainer");
				var vizframe = oView.byId(sChartId);
				var oChartContainerContent = new sap.suite.ui.commons.ChartContainerContent({
					icon: "sap-icon://horizontal-bar-chart",
					title: "vizFrame Bar Chart Sample",
					content: [vizframe]
				});
				var oChartContainer = new sap.suite.ui.commons.ChartContainer({
					content: [oChartContainerContent]
				});
				oChartContainer.setShowFullScreen(true);
				oChartContainer.setAutoAdjustHeight(true);
				oView.byId(sBlockId).addContent(oChartContainer);
			}
		},

		_setChartProperties: function(oVizFrame, sTitle) {
			// var formatPattern = ChartFormatter.DefaultPattern;
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						// formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true
					}
				},
				valueAxis: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: true,
					text: sTitle
				}
			});

		},

		_onWorkListMatched: function(oEvent) {
			// debugger;\
			if(oEvent.getParameter("name") !== "analytical"){
				return;
			}
			var that = this;
			// this._oJSONModel = this._oVizFrame.getModel();
			// this._oJSONModel.setData(oData);
			// this._oVizFrame.setModel(this._oJSONModel);
			$.get('/getStudentPerBatch')
				.done(function(data, status) {
					var oBarChartModel = new JSONModel();
					oBarChartModel.setData({
						BarData: data
					});
					that.getView().setModel(oBarChartModel, "BarChartModel");
					// sap.m.MessageToast.show("data came");

				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});

			$.get('/getBatchPerCourse')
				.done(function(data, status) {
					var oPieChartModel = new JSONModel();
					oPieChartModel.setData({
						PieData: data
					});
					that.getView().setModel(oPieChartModel, "PieChartModel");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});

			$.get('/getStudentPerCourse')
				.done(function(data, status) {
					var oPieChartModel = new JSONModel();
					oPieChartModel.setData({
						PieData: data
					});
					that.getView().setModel(oPieChartModel, "Pie2ChartModel");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});

			$.get('/getCountLastMonths')
				.done(function(data, status) {
					var oPieChartModel = new JSONModel();
					oPieChartModel.setData({
						LineData: data
					});
					that.getView().setModel(oPieChartModel, "LineChartModel");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});

			// this._oVizFrame = this.getView().byId("idstackColVizFrame");
			// this._oVizFrame.setVizProperties({
			// 	plotArea: {
			// 		dataLabel: {
			// 			visible: true
			// 		}
			// 	},
			// 	interaction: {
			// 		selectability: {
			// 			mode: "EXCLUSIVE",
			// 			axisLabelSelection: false
			// 		}
			// 	},
			// 	tooltip: {
			// 		visible: true
			// 	},
			// 	title: {
			// 		text: "GmailId v ContactNo"
			// 	}
			// });
			// this._totalChart();
		},
		_totalChart: function() {
			this._loadModelData();
			this._initialChart();
		},
		_initialChart: function() {
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Gmail",
					value: "{GmailId}"
				}],

				measures: [{
					name: "Contact No",
					value: "{ContactNo}"
				}],

				data: {
					path: "/Students"
				}
			});


			this._oVizFrame.setDataset(oDataset);
			// this._oVizFrame.setModel(this._oJSONModel);
			this._oVizFrame.setVizType('bar'); //put "column" for column graph

			this._oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range()
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': ["Contact No"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Gmail"]
				});
			this._oVizFrame.removeAllFeeds();
			this._oVizFrame.addFeed(feedValueAxis);
			this._oVizFrame.addFeed(feedCategoryAxis);
		},

		_loadModelData: function() {
			debugger;
			// var oModel3 = this.getView().getModel();
			// var url3 = "/Students";
			// this._oJSONModel2 = new JSONModel();
			// var that = this;
			// oModel3.read(url3, {
			// 	success: function(oData) {
			// 		debugger;
			// 		that._oJSONModel = that._oVizFrame.getModel();
			// 		// that._oJSONModel2.setData(oData);
			//
			// 	}.bind(that),
			// 	error: function() {
			// 		debugger;
			// 		//	this._oVizFrame.setBusy(false);
			// 	}
			// });

			var oModel = this.getView().getModel();
			var url = "/Students";
			this._oJSONModel = new JSONModel();
			this._oVizFrame.setBusy(true);
			// this._oVizFrame3.setBusy(true);
			oModel.read(url, {
				success: function(oData) {
					debugger;
					this._oVizFrame.setBusy(false);
					// this._oVizFrame3.setBusy(false);
					this._oJSONModel = this._oVizFrame.getModel();
					this._oJSONModel.setData(oData);
					this._oVizFrame.setModel(this._oJSONModel);
				}.bind(this),
				error: function() {
					debugger;
					this._oVizFrame.setBusy(false);
					// this._oVizFrame3.setBusy(false);
				}
			});

			// this._oVizFrame.setModel(this._oJSONModel);

		}
	});

});
