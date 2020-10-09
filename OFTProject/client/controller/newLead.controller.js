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

	return Controller.extend("oft.fiori.controller.newLead", {
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
				this.getView().getModel("local").setProperty("/newLead/FirstName", first);
				this.getView().getModel("local").setProperty("/newLead/LastName", second);
			}
		},
		setOtherData: function(data){
			if (data.FirstName !== "" && data.FirstName !== "null" && data.FirstName !== undefined) {
					this.getView().getModel("local").setProperty("/newLead/FirstName", data.FirstName);
			}else{
				this.getView().getModel("local").setProperty("/newLead/FirstName", "");
			}
			if (data.LastName !== "" && data.LastName !== "null" && data.LastName !== undefined) {
				this.getView().getModel("local").setProperty("/newLead/LastName", data.LastName);
			}else{
				this.getView().getModel("local").setProperty("/newLead/LastName","");
			}
			if (data.Country !== "" && data.Country !== "null" && data.Country !== undefined) {
				//this.getView().getModel("local").setProperty("/newLead/Country", data.Country);
					this.getView().byId("country").setSelectedKey(data.Country);
			}else{
					this.getView().byId("country").setSelectedKey("IN");
			}
			if (data.Phone !== "" && data.Phone !== 0 && data.Phone !== undefined) {
				this.getView().getModel("local").setProperty("/newLead/Phone", data.Phone);
			}else{
				this.getView().getModel("local").setProperty("/newLead/Phone", "");
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
		handleUploadPress: function() {
			var oFileUploader = this.byId("fileUploader");
			if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
				return;
			}
			oFileUploader.getAggregation("parameters")[0].setValue(
																				this.getModel("local").getData().CurrentUser)
			oFileUploader.upload();
		},
		handleUploadComplete: function(oEvent) {
			var sResponse = oEvent.getParameter("response");
			var oFiler = oEvent.getSource();
			if (sResponse) {
				var sMsg = "";
				debugger;
				if(JSON.parse(sResponse.split("\">")[1].replace("</pre>","")).error_code !== 0){
					sMsg = JSON.parse(sResponse.split("\">")[1].replace("</pre>","")).err_desc;
				}else{
					sMsg = "Uploaded Successfully";
				}
				// var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				// if (m[1] == "200") {
				// 	console.log(this.getModel("local").getData().CurrentUser);
				// 	oEvent.getSource().getAggregation("parameters")[0].setValue(
    		// 																		this.getModel("local").getData().CurrentUser)
   			// 	$.post('/upload', {
				// 		files: oEvent.getSource().getFocusDomRef().files[0]
				// 	})
				// 		.done(function(data, status){
				// 					sap.m.MessageBox.error("Done");
				// 		})
				// 		.fail(function(xhr, status, error) {
				// 					sap.m.MessageBox.error("Error in upload");
				// 		});
				// 	sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
				// 	oEvent.getSource().setValue("");
				// } else {
				// 	sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				// }

				MessageToast.show(sMsg);
			}
		},

		// handleUploadPress: function(oEvent) {
		// 	var oFileUploader = this.byId("fileUploader");
		// 	oFileUploader.upload();
		// },
		updateInq: function(){
				var that = this;
				//gtest
				$.post('/upload')
			    .done(function(data, status){
								sap.m.MessageBox.error("Done");
					})
			    .fail(function(xhr, status, error) {
								sap.m.MessageBox.error("Error in upload");
			    });
		},
		clearForm: function() {
			// this.getView().getModel("local").setProperty("/newLead",{
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
		passwords: "",
		onEmail: function() {
			var that = this;
			var items = that.getView().byId('idRecent').getSelectedContexts();

			for (var i = 0; i < items["length"]; i++) {
				var loginPayload = items[i].getModel().getProperty(items[i].getPath());

				if(this.getView().byId("isMinakshi").getSelected()){
					if (this.passwords === "") {
						this.passwords = prompt("Please enter your password", "");
						if (this.passwords === "") {
							sap.m.MessageBox.error("Blank Password not allowed");
							return;
						}
					}
				}else{
					this.passwords = "na";
				}

				loginPayload.password = this.passwords;
				loginPayload.DollerQuote = this.getView().byId("doller").getSelected();
				if(this.getView().byId("isMinakshi").getSelected()){
						loginPayload.IsMinakshi = "X";
				}else{
					loginPayload.IsMinakshi = "";
				}

				var x = this.getView().byId("rbg");
				loginPayload.mailType = x.getSelectedButton().getId().split("--")[x.getSelectedButton().getId().split("--").length - 1];
				loginPayload.source = this.getView().byId("source").getSelectedKey();
				$.post('/sendInquiryEmail', loginPayload)
					.done(function(data, status) {
						sap.m.MessageToast.show("Email sent successfully");
					})
					.fail(function(xhr, status, error) {
						that.passwords = "";
						sap.m.MessageBox.error(xhr.responseText);
					});
			}
		},
		onDataExport: function(oEvent) {
			$.ajax({
				type: 'GET', // added,
				url: 'InquiryDownload',
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
		onItemSelect: function(oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var indexSupp = sPath.split("/")[sPath.split("/").length - 1];
			this.oRouter.navTo("detail2", {
				suppId: indexSupp
			});
		},
		onPress: function() {
			sap.m.MessageBox.alert("Button was clicked");
		},
		onHover: function() {
			sap.m.MessageBox.alert("Button was Hovered");
		},
		onCourseSelect: function(oEvent){
			var country = this.getView().byId("country").getSelectedKey();
			var courseName = this.getView().byId("course").getSelectedKey();
			var allCourses = this.getView().getModel("local").getProperty("/courses");
			if(country === "IN"){
				for (var i = 0; i < allCourses.length; i++) {
					if (allCourses[i].courseName === courseName) {
						this.getView().getModel("local").setProperty("/newLead/fees",allCourses[i].fee);
						this.getView().getModel("local").setProperty("/newLead/currency", "INR");
						break;
					}
				}

			}else{
				for (var i = 0; i < allCourses.length; i++) {
					if (allCourses[i].courseName === courseName) {
						this.getView().getModel("local").setProperty("/newLead/fees",allCourses[i].usdFee);
						this.getView().getModel("local").setProperty("/newLead/currency", "USD");
						break;
					}
				}
			}
		},
		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "newlead"){
				return;
			}
			//Restore the state of UI by fruitId
			this.getView().getModel("local").setProperty("/newLead/date", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newLead/country", "IN");
			var newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
			var oList = this.getView().byId("idRecent");
			oList.bindAggregation("items", {
				path: '/Inquries',
				template: new sap.m.DisplayListItem({
					label: "{EmailId} - {CourseName} - {Country}",
					value: "{fees} {currency} / {source} / {CreatedOn}-{CreatedBy}"
				}),
				filters: [new Filter("CreatedOn", "GE", newDate)],
				sorter: oSorter
			});
			oList.attachUpdateFinished(this.counter);
			var that = this;
			Format.numericFormatter(ChartFormatter.getInstance());
      var formatPattern = ChartFormatter.DefaultPattern;
			var oVizFrame =  this.getView().byId("idVizFrame");
        oVizFrame.setVizProperties({
            plotArea: {
                dataLabel: {
                    formatString:formatPattern.SHORTFLOAT_MFD2,
                    visible: true
                }
            },
            valueAxis: {
                label: {
                    formatString: formatPattern.SHORTFLOAT
                },
                title: {
                    visible: false
                }
            },
            categoryAxis: {
                title: {
                    visible: false
                }
            },
            title: {
                visible: false,
                text: 'Total Inquiry'
            }
        });
			$.get("/todayInquiry").then(function(data){
				that.getView().getModel("local").setProperty("/AllInq",  data );
			});
			debugger;
			this.setConfig();

		},
		setConfig: function(){
			debugger;
			if(this.getModel("local").getData().CurrentUser === "5d947c3dab189706a40faade" ||
				 this.getModel("local").getData().CurrentUser === "5dd6a6aea5f9e83c781b7ac0" ||
			 	 this.getModel("local").getData().CurrentUser === "5ecc968586321064989cdc3f" ||
			   this.getModel("local").getData().CurrentUser === "5dcf9f7183f22e7da0acdfe4" ||
		     this.getModel("local").getData().CurrentUser === "5ea2f01d7854a13c148f18cd" ){
					 this.getView().byId("source").setSelectedKey("L");
					 console.log("linkedin");
				 }
		 else if (this.getModel("local").getData().CurrentUser === "5f1331f2e0b8524af830fa20"){
					this.getView().byId("source").setSelectedKey("F");
					console.log("facebook");
		 }
		 else{
			 		this.getView().byId("source").setSelectedKey("R");
					console.log("Regular");
		 }
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
		supplierPopup: null,
		oInp: null,
		onPopupConfirm: function(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			this.oInp.setValue(selectedItem.getLabel());
		},

		oSuppPopup: null,
		onFilter: function() {

			if (!this.oSuppPopup) {
				this.oSuppPopup = new sap.ui.xmlfragment("oft.fiori.fragments.popup", this);

				this.getView().addDependent(this.oSuppPopup);

				this.oSuppPopup.setTitle("Suppliers");

				this.oSuppPopup.bindAggregation("items", {
					path: "/suppliers",
					template: new sap.m.DisplayListItem({
						label: "{name}",
						value: "{city}"
					})
				});
			}

			this.oSuppPopup.open();
		},

		onRequest: function(oEvent) {

			//Store the object of the input field on which F4 was press
			this.oInp = oEvent.getSource();

			//Step 1: Display a popup cl_gui_alv_grid, set_table_for_first_table
			if (!this.supplierPopup) {
				// this.supplierPopup = new sap.m.SelectDialog({
				// 	title: "Supplier Popup",
				// 	confirm: this.onPopupConfirm.bind(this)
				// });
				this.supplierPopup = new sap.ui.xmlfragment("oft.fiori.fragments.popup", this);

				this.supplierPopup.setTitle("Cities");
				//Will now supply the model set at the view level to its children
				this.getView().addDependent(this.supplierPopup);

				//this.supplierPopup.setTitle("")
				//Step 2: Values to be populated with aggregation binding
				this.supplierPopup.bindAggregation("items", {
					path: "/cities",
					template: new sap.m.DisplayListItem({
						label: "{cityName}",
						value: "{famousFor}"
					})
				});

			}
			//Step 3: Just open same popup once create
			this.supplierPopup.open();

		},
		onConfirm: function(anubhav) {
			//debugger;
			if (anubhav === "OK") {
				MessageToast.show("Your fruit has been approved successfully");
				this.getView().byId("idApr").setVisible(false);
			}
		},
		onSave: function(oEvent) {
			var oLocal = oEvent;
			//console.log(this.getView().getModel("local").getProperty("/newLead"));
			var that = this;
			that.getView().setBusy(true);
			var leadData = this.getView().getModel("local").getProperty("/newLead");
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
				"LastName": leadData.LastName,
				"Date": this.getView().byId("inqDate").getDateValue(),
				"Country": leadData.country,
				"Phone": leadData.phone,
				"Subject": leadData.subject,
				"Message": leadData.message,
				"fees": leadData.fees,
				"currency": leadData.currency,
				"CreatedOn": new Date(),
				"CreatedBy": "Minakshi",
				"SoftDelete": false,
				"source": leadData.source,
			};
			// var oDataModel = this.getView().getModel();
			// oDataModel.create("/Inquries",payload,null, function(){
			// 					sap.m.MessageBox.alert("done");
			// 				},
			// 				 function(){
			// 					sap.m.MessageBox.alert("err");
			// 				}
			// 			);
			if(leadData.country === "IN" && leadData.phone !== "null" && leadData.phone !== "0" && leadData.phone !== ""){
				try {
					var userName = leadData.FirstName;
					var MobileNo = leadData.phone;
					var loginPayload = {};
					loginPayload.msgType =  "inquiry";
					loginPayload.userName =  userName;
					loginPayload.courseName = leadData.course;
					loginPayload.Number =  MobileNo;
					$.post('/requestMessage', loginPayload)
						.done(function(data, status) {
							sap.m.MessageToast.show("Message sent successfully");
						})
						.fail(function(xhr, status, error) {
							//that.passwords = "";
							sap.m.MessageBox.error(xhr.responseText);
						});
				} catch (e) {

				} finally {

				}
			}

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Inquries", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Inquiry Saved successfully");
					that.destroyMessagePopover();
					if (that.getView().byId("idRecent").getBinding("items")) {
						that.getView().byId("idRecent").getBinding("items").refresh();
						setTimeout(function(){
							if(this.getView().byId("autoMail").getState()){
								this.getView().byId("idRecent").setSelectedItem(that.getView().byId("idRecent").getItems()[0]);
								this.onEmail();
								this.getView().byId("idRecent").removeSelections();
							}
						}.bind(that),2000).bind(this);
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					// var oPopover = that.getErrorMessage(oError);
					if(oError.responseText.indexOf(":") !== -1){
						var sText = "Inquiry already Exists";
						var userId = oError.responseText.split(":")[oError.responseText.split(":").length - 1].replace(" ","");
						try {
							var userName = that.getView().getModel("local").getProperty("/AppUsers")[userId].UserName

						} catch (e) {
							userName = "unknown";
						}
						try {
							var ctry = oError.responseText.split(":")[oError.responseText.split(":").length - 2].replace(" ","").replace(" & Created by ","");
						} catch (e) {
							ctry = "US";
						}
						sText = oError.responseText.replace(userId,userName) + "Do you want to send again?";
					}
					if(sText.indexOf("Fraud") != -1){
						MessageBox.error("Emaild id is Fraud");
						return;
					}
					if (that.oLeadDuplicate === undefined) {
						var oLeadDuplicate
						that.oLeadDuplicate = oLeadDuplicate = new sap.ui.xmlfragment("oft.fiori.fragments.Dialog", this);
						that.getView().addDependent(oLeadDuplicate);
						oLeadDuplicate.setTitle("Already Exist");
						var that2 = that;
						oLeadDuplicate.addButton(new sap.m.Button({
							text: "Yes",
							press: function() {
								if (that2.passwords === "") {
									that2.passwords = prompt("Please enter your password", "");
									if (that2.passwords === "") {
										sap.m.MessageBox.error("Blank Password not allowed");
										return;
									}
								}
								var loginPayload = JSON.parse(JSON.stringify(payload));
								if (payload.EmailId === "") {
									sap.m.MessageBox.error("Email id is empty, please contact ANubhav");
								}
								loginPayload.password = that2.passwords;
								loginPayload.DollerQuote = that2.getView().byId("doller").getSelected();
								loginPayload.Country = ctry;
								//read old inquiry country and update the new price only
								var allCourses = that2.getView().getModel("local").getProperty("/courses");
								loginPayload.CourseName = that2.getModel("local").getProperty("/newLead/course");
								loginPayload.EmailId = that2.getModel("local").getProperty("/newLead/emailId");
								loginPayload.FirstName = that2.getModel("local").getProperty("/newLead/FirstName");
								loginPayload.fees = that2.getModel("local").getProperty("/newLead/fees");
								loginPayload.currency = that2.getModel("local").getProperty("/newLead/currency");
								if( loginPayload.Country === "IN" ){
									for (var i = 0; i < allCourses.length; i++) {
										if (allCourses[i].courseName === loginPayload.CourseName) {
											loginPayload.fees = allCourses[i].fee;
										  loginPayload.currency = "INR";
											break;
										}
									}

								}else{
									for (var i = 0; i < allCourses.length; i++) {
										if (allCourses[i].courseName === loginPayload.CourseName) {
											loginPayload.fees = allCourses[i].usdFee;
										  loginPayload.currency = "USD";
											break;
										}
									}
								}
								var x = that2.getView().byId("rbg");
								loginPayload.mailType = x.getSelectedButton().getId().split("--")[x.getSelectedButton().getId().split("--").length - 1];
								if(that2.getView().byId("isMinakshi").getSelected()){
										loginPayload.IsMinakshi = "X";
								}else{
									loginPayload.IsMinakshi = "";
								}
								loginPayload.source = "";
								$.post('/sendInquiryEmail', loginPayload)
									.done(function(data, status) {
										sap.m.MessageToast.show("Email sent successfully");
									})
									.fail(function(xhr, status, error) {
										that2.passwords = "";
										sap.m.MessageBox.error(xhr.responseText);
									});
								oLeadDuplicate.close();
								oLeadDuplicate.destroyContent();
							}
						}));
						oLeadDuplicate.addButton(new sap.m.Button({
							text: "Close",
							press: function() {
								oLeadDuplicate.close();
								oLeadDuplicate.destroyContent();
							}
						}));
					}
					//that.getView().getModel("local").getProperty("/AppUsers")["5c6d68266e62cf4cac9d8262"].UserName

					if(oError.responseText.indexOf(":") !== -1){
						that.oLeadDuplicate.addContent(new sap.m.Text({
							text: sText
						}));
						that.oLeadDuplicate.open();
					}else{
						this.getErrorMessage(oError);
						that.oLeadDuplicate.destroyContent();
					}


					// this.oLeadDuplicate.

				});
			// $.post("/api/Inquries",payload,
			// function(data, status){
			//     sap.m.MessageBox.confirm("Wallah! Posted");
			// });
		},
		onApprove: function() {

			MessageBox.confirm("Do you want to approve this fruit", {
				title: "confirmation",
				//[this.functionName, this], as a substitute we use .bind(this) method
				onClose: this.onConfirm.bind(this)
			});

		},
		onGetNext: function(){
			$.post('/MoveNextAc', {})
				.done(function(data, status) {
					if(data.accountNo === "114705500444"){
						sap.m.MessageBox.confirm(
							"Hello ," + "\n" + "\n" +
							"Thanks for your confirmation, Please transfer the funds to below bank account" + "\n" + "\n" +
							"Bank Name    : " + data.BankName + "\n" +
							"Account Name : " + data.accountName + "\n" +
							"Account No   : " + data.accountNo + "\n" +
							"IFSC Code    : " + data.ifsc + "\n" + "\n" +
							"You can also pay with barcode scan of UPI https://anubhavtrainings.com/upipayment-anubhav-training" + "\n" + "\n" +
							"Note: Please share the screenshot of payment once done."
  					);
					}else{
						sap.m.MessageBox.confirm(
							"Hello ," + "\n" + "\n" +
							"Thanks for your confirmation, Please transfer the funds using to below bank account" + "\n" + "\n" +
							"Bank Name    : " + data.BankName + "\n" +
							"Account Name : " + data.accountName + "\n" +
							"Account No   : " + data.accountNo + "\n" +
							"IFSC Code    : " + data.ifsc + "\n" + "\n" +
							"Note: Please share the screenshot of payment once done."
						);
					}

				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error(xhr.responseText);
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
