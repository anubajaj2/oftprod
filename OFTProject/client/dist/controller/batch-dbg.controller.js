var oGuid;

sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter"
], function(Controller, MessageBox, MessageToast, Formatter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.batch", {
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
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},

		onSave: function(oEvent) {
			//TODO: Save to Coustomer Reg. table
			console.log(this.getView().getModel("local").getProperty("/newBatch"));
			var oLocal = oEvent;
			var that = this;
			var batchData = this.getView().getModel("local").getProperty("/newBatch");
			//busy indicator
			that.getView().setBusy(true);
			// if(!this.getView().byId("inqDate").getDateValue()){
			// 	sap.m.MessageToast.show("Enter a valid Date");
			// 	return "";
			// }

			var payload = {
				"BatchNo": batchData.courseId,
				"Name": batchData.courseName,
				"DemoStartDate": this.getView().byId("idDemoDate").getDateValue(),
				"StartDate": this.getView().byId("idStartDate").getDateValue(),
				"EndDate": this.getView().byId("idEndDate").getDateValue(),
				"BlogEndDate": this.getView().byId("idBlogEnd").getDateValue(),
				"Link": batchData.link,
				"Weekend": batchData.weekend,
				"hidden": String(batchData.hidden),
				"Timings": batchData.Timings,
				"Fee": batchData.courseFee,
				"CreatedOn": new Date(),
				"CalendarId": batchData.CalendarId,
				"EventId": batchData.EventId,
				"DriveId": batchData.DriveId,
				"status": batchData.status,
				"analysis": batchData.analysis
			};


			if (this.flag === "batchid") {
				//alert("Updated");
				//that.getView().setBusy(false);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Courses('" + oGuid + "')", "PUT", {},
						payload, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Course Updated successfully");
						that.destroyMessagePopover();
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
						// sap.m.MessageToast.show(oError.statusText);
					});

			} else {


				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Courses", "POST", {},
						payload, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show("New Course Saved successfully");
						that.destroyMessagePopover();
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
						// sap.m.MessageToast.show(oError.statusText);

					});
			}


			//	that.getView().setBusy(false);
		},
		onReplicateBatches: function() {
			var that = this;
			MessageBox.confirm("are you sure?", function(val) {
				if (val === "OK") {
					that.getView().byId("idReplicateBatches").setEnabled(false);
					MessageToast.show("Replication started, Please Wait...");
					$.get('/replicateBatchesToStudentPortal')
						.done(function(data, status) {
							MessageBox.success(JSON.stringify(data));
							that.getView().byId("idReplicateBatches").setEnabled(true);
						})
						.fail(function(xhr, status, error) {
							that.getView().byId("idReplicateBatches").setEnabled(true);
							MessageBox.error("Error in access");
						});
				}
			});
		},
		onReplicateOneBatch: function() {
			var that = this;
			const courseId = this.getView().byId("idCourseId").getValue();
			const name = this.getView().byId("batch").getValue();
			var payload = {
				Name: name,
				BatchNo: courseId
			};
			if (courseId && name) {
				MessageBox.confirm("are you sure?", function(val) {
					if (val === "OK") {
						that.getView().byId("idReplicateBatches").setEnabled(false);
						MessageToast.show("Replication started, Please Wait...");
						$.post('/replicateOneBatchToStudentPortal', payload)
							.done(function(data, status) {
								MessageBox.success(JSON.stringify(data));
								that.getView().byId("idReplicateBatches").setEnabled(true);
							})
							.fail(function(xhr, status, error) {
								that.getView().byId("idReplicateBatches").setEnabled(true);
								MessageBox.error("Error in access");
							});
					}
				});
			} else {
				MessageToast.show("Please select a batch");
			}
		},
		onStartChange: function(oEvent) {
			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var endDate = this.formatter.getIncrementDate(dateObject, 2.5);
			this.getView().getModel("local").setProperty("/newBatch/endDate", endDate);
			dateObject = new Date(from[2], from[1] - 1, from[0]);
			var blogDate = this.formatter.getIncrementDate(dateObject, 8);
			this.getView().getModel("local").setProperty("/newBatch/blogDate", blogDate);
			console.log(endDate);
			console.log(blogDate);
		},
		herculis: function(oEvent) {
			if (oEvent.getParameter("name") !== "batch") {
				return;
			}
			this.getView().getModel("local").setProperty("/newBatch/startDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/demoStartDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/endDate", this.formatter.getFormattedDate(2.5));
			this.getView().getModel("local").setProperty("/newBatch/blogDate", this.formatter.getFormattedDate(8));
			///TODO: Fill the Customer Set and Course Set from REST API

		},
		onChange: function() {
			debugger;
			alert("HELLOOO");
		},

		onSelect: function() {

			this.flag = "courseName";
			this.getCustomerPopup();
			var title = this.getView().getModel("i18n").getProperty("course");
			this.searchPopup.setTitle(title);
			this.searchPopup.bindAggregation("items", {
				path: "local>/courses",
				template: new sap.m.DisplayListItem({
					label: "{local>courseName}"

				})
			});
		},

		onConfirm: function(oEvent) {
			if (this.flag === "courseName") {

				var courseName = oEvent.getParameter("selectedItem").getLabel();
				this.getView().getModel("local").setProperty("/newBatch/courseName", courseName);
			}

			if (this.flag === "batchid") {
				// debugger;

				var data = this.getSelectedKey(oEvent);
				this.getView().byId("idCourseId").setValue(data[0]);

				var oCourseId = 'Courses(\'' + data[2] + '\')';
				var oModel = this.getView().getModel().oData[oCourseId];
				var that = this;

				if (oModel) {

					// Display Course Name
					var oCourseName = oModel.Name;
					var CourseName = this.getView().byId("batch");
					CourseName.setValue(oCourseName);


					//Display Demo Start Date
					var FormattedDate = this.onDateFormatted(oModel.DemoStartDate);
					var oStartDate = this.getView().byId("idDemoDate");
					oStartDate.setValue(FormattedDate);

					//Display Start Date
					//var StartDate = oModel.StartDate;

					var FormattedDate1 = this.onDateFormatted(oModel.StartDate);
					var oStartDate1 = this.getView().byId("idStartDate");
					oStartDate1.setValue(FormattedDate1);

					// Display End Date
					// var endDate = oModel.EndDate;

					var FormattedDate2 = this.onDateFormatted(oModel.EndDate);
					var oStartDate2 = this.getView().byId("idEndDate");
					oStartDate2.setValue(FormattedDate2);

					//Display Blog End Date
					// var BlogEndDate = oModel.BlogEndDate;
					var FormattedDate3 = this.onDateFormatted(oModel.BlogEndDate);
					var oStartDate3 = this.getView().byId("idBlogEnd");
					oStartDate3.setValue(FormattedDate3);

					// Display Min Fee
					var oFee = oModel.Fee;
					var Fee = this.getView().byId("idFee");
					Fee.setValue(oFee);

					//Display Link
					var oLink = oModel.Link;
					var Link = this.getView().byId("idLink");
					Link.setValue(oLink);

					//Display Timing
					var oTiming = oModel.Timings;
					var timing = this.getView().byId("idTiming");
					timing.setValue(oTiming);

					//Guid
					oGuid = oModel.id;
					//Display Weekend checkbox
					var oWeekend = oModel.Weekend;
					// if ((oWeekend === true)||(oWeekend === "true")){
					if (oWeekend === true) {
						var Weekend = this.getView().byId("idWeekend").setSelected(true);
					} else {
						var Weekend = this.getView().byId("idWeekend").setSelected(false);
					}

					//--- BOC - VCHIKKAM
					var bHidden = oModel.hidden;
					var bBatchHide;
					if (bHidden === true) {
						bBatchHide = this.getView().byId("idChkBtcHid").setSelected(true);
					} else {
						bBatchHide = this.getView().byId("idChkBtcHid").setSelected(false);
					}
					//--- EOC - VCHIKKAM


					var oAnalysis = oModel.analysis;
					if (oAnalysis === true) {
						var analysis = this.getView().byId("idAnalysis").setSelected(true);
					} else {
						var analysis = this.getView().byId("idAnalysis").setSelected(false);
					}


					this.getView().byId("idCalId").setValue(oModel.CalendarId);
					this.getView().byId("idEvent").setValue(oModel.EventId);
					this.getView().byId("idDrive").setValue(oModel.DriveId);
					this.getView().byId("idStatus").setValue(oModel.status);


				}

			}

		},

		onClearScreen: function() {
			// alert("Hello");
			this.getView().byId("idCourseId").setValue("");
			this.getView().byId("batch").setValue("");
			this.getView().byId("idLink").setValue("");
			this.getView().byId("idTiming").setValue("");
			this.getView().byId("idCalId").setValue("");
			this.getView().byId("idEvent").setValue("");
			this.getView().byId("idDrive").setValue("");
			// this.getView().byId("idWeekend").setValue("");
			this.getView().byId("idStatus").setValue("");
			this.getView().byId("idAnalysis").setValue("");


		},

		onBatchSelect: function() {
			this.flag = "batchid";
			this.getCustomerPopup();
			var title = this.getView().getModel("i18n").getProperty("batch");
			this.searchPopup.setTitle(title);
			this.searchPopup.bindAggregation("items", {
				path: "/Courses",
				template: new sap.m.DisplayListItem({
					label: "{Name}",
					value: "{BatchNo}"
				})
			});

		},

		onLiveSearch: function(oEvent) {
			//updated
			var queryString = oEvent.getParameter("query");
			if (!queryString) {
				queryString = oEvent.getParameter("value");
			}

			if (queryString) {
				var oFilter1 = new sap.ui.model.Filter("courseName", sap.ui.model.FilterOperator.Contains, queryString);

				var oFilter = new sap.ui.model.Filter({
					filters: [oFilter1],
					and: false
				});
				var aFilter = [oFilter];
				this.searchPopup.getBinding("items").filter(aFilter);
			} else {
				this.searchPopup.bindAggregation("items", {
					path: "local>/courses",
					template: new sap.m.DisplayListItem({
						label: "{local>courseName}"
					})
				});
				this.searchPopup.getBinding("items").filter([]);
			}

		}

	});
});
