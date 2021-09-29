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

	return Controller.extend("oft.fiori.controller.blacklisted", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//this.clearForm();
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}
		},
		setCountryData: function(text, oCountry){
			var arr = text.split(", ");
			var lv_text = "";
			var arr = arr.filter(function (el) {
								  return el != null;
								}).filter(function () { return true });
			var uniqueNames = [];
			var arr = $.each(arr, function(i, el){
					    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
					});
		 for (var i = 0; i < uniqueNames.length; i++) {
			 if(i>0){
				 	lv_text =   uniqueNames[i] + ", " + lv_text;
			 }else{
				 lv_text =   uniqueNames[i];
			 }

		 }
		 if (lv_text === "") {
		 	lv_text = "no past history found";
		 }
		 oCountry.setText(lv_text);
		},
		onSplitName: function(oEvent){
			var text = oEvent.getParameter("value");
			if(text.indexOf(" ") !== -1){
				var first = text.split(" ")[0];
				var second = text.split(" ")[1];
				this.getView().getModel("local").setProperty("/block/FirstName", first);
				this.getView().getModel("local").setProperty("/block/LastName", second);
			}
		},
		setOtherData: function(data){
			if (data.FirstName !== "" && data.FirstName !== "null" && data.FirstName !== undefined) {
					this.getView().getModel("local").setProperty("/block/FirstName", data.FirstName);
			}else{
				this.getView().getModel("local").setProperty("/block/FirstName", "");
			}
			if (data.LastName !== "" && data.LastName !== "null" && data.LastName !== undefined) {
				this.getView().getModel("local").setProperty("/block/LastName", data.LastName);
			}else{
				this.getView().getModel("local").setProperty("/block/LastName","");
			}
			if (data.Country !== "" && data.Country !== "null" && data.Country !== undefined) {
				//this.getView().getModel("local").setProperty("/block/Country", data.Country);
					this.getView().byId("country").setSelectedKey(data.Country);
			}else{
					this.getView().byId("country").setSelectedKey("IN");
			}
			if (data.Phone !== "" && data.Phone !== 0 && data.Phone !== undefined) {
				this.getView().getModel("local").setProperty("/block/Phone", data.Phone);
			}else{
				this.getView().getModel("local").setProperty("/block/Phone", "");
			}


		},
		onLiveChange: function(oEvent){
			var text = oEvent.getParameter("value");
			var that = this;
			var oCountry = this.getView().byId("countrydata");
			//if valid email, check
			if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(text))
		  {
				oCountry.setText("");
				$.post('/checkStudentById', { emailId : text })
			    .done(function(data, status){
								//sap.m.MessageBox.error(data);
								if (data) {
									that.setCountryData(data.country, oCountry);
									if (data.inq) {
										that.setOtherData(data.inq);
									}

								}
					})
			    .fail(function(xhr, status, error) {
								//sap.m.MessageBox.error("Error in upload");
								oCountry.setText("no past history");
			    });
		  }else{

			}
		},
		getUserId: function(usr){
			return this.getModel("local").getData().CurrentUser;
		},
		passwords: "",
		onDataExport: function(oEvent) {
			$.ajax({
				type: 'GET', // added,
				url: 'BlackDownload',
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});

		},
		onDelete: function(oEvent) {
			var that = this;
			MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
				if (conf == 'OK') {
					var items = that.getView().byId('idRecent').getSelectedContexts();
					for (var i = 0; i < items["length"]; i++) {
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath,
								"DELETE", {}, {}, that)
							.then(function(oData) {
								sap.m.MessageToast.show("Deleted succesfully");
							}).catch(function(oError) {
								that.getView().setBusy(false);
								that.oPopover = that.getErrorMessage(oError);
								that.getView().setBusy(false);
							});

					}
				}
			}, "Confirmation");


		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "blacklisted"){
				return;
			}
			//Restore the state of UI by fruitId
			this.getView().getModel("local").setProperty("/block/date", this.formatter.getFormattedDate(0));
			this.getView().byId("inqDate").setValue(this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/block/country", "IN");
			var newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
			var oList = this.getView().byId("idRecent");
			oList.bindAggregation("items", {
				path: '/Blocks',
				template: new sap.m.DisplayListItem({
					label: "{EmailId} - {message}",
					value: "{CreatedOn}-{CreatedBy}"
				})
			});
			oList.attachUpdateFinished(this.counter);
			var that = this;
			Format.numericFormatter(ChartFormatter.getInstance());


		},
		counter: function(oEvent) {
			var oList = oEvent.getSource();
			var counts = oList.getItems().length;
			oList.getHeaderToolbar().getContent()[0].setText("Today : " + counts);
			var items = oList.mAggregations.items;
			var value2;
			var value1;
			var id;
			for (var i = 0; i < items.length; i++) {
				value1 = items[i].mProperties.value.split("-")[0];
				id = items[i].mProperties.value.split("-")[1];
				if (this.getModel("local").getProperty("/AppUsers")[id]) {
					value2 = this.getModel("local").getProperty("/AppUsers")[id].UserName;
					oList.getItems()[i].setValue(value1 + " - " + value2);
				}
			}
		},

		onSave: function(oEvent) {
			var oLocal = oEvent;
			//console.log(this.getView().getModel("local").getProperty("/block"));
			var that = this;
			that.getView().setBusy(true);
			var leadData = this.getView().getModel("local").getProperty("/block");
			if (!this.getView().byId("inqDate").getDateValue()) {
				sap.m.MessageToast.show("Enter a valid Date");
				return "";
			}
			if(leadData.phone){
				leadData.phone = this.formatter.extractNo(leadData.phone).replace(/,/g, '');
			}
			var payload = {
				"EmailId": leadData.emailId.toLowerCase(),
				"CourseName": leadData.course,
				"FirstName": leadData.FirstName,
				"Date": this.getView().byId("inqDate").getDateValue(),
				"Country": leadData.country,
				"Phone": leadData.phone,
				"Message": leadData.message,
				"CreatedOn": new Date(),
				"CreatedBy": "Minakshi"
			};
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Blocks", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Entry Saved successfully");
					that.destroyMessagePopover();
					if (that.getView().byId("idRecent").getBinding("items")) {
						that.getView().byId("idRecent").getBinding("items").refresh();
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					that.getErrorMessage(oError);
				});
		}

	});

});
