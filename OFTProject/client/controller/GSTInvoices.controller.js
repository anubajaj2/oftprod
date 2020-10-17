sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"oft/fiori/models/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Core, Filter, FilterOperator, Formatter, MessageBox, MessageToast) {
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
			this.oRouter.attachRoutePatternMatched(this.onBankAccount, this);
		},
		formatter: Formatter,
		onBankAccount: function(oEvent) {
			if (oEvent.getParameter("name") != "GSTInvoices") {
				return;
			}
			var rangeDate = new Date();
			var month = rangeDate.getMonth() + 1;
			var year = rangeDate.getFullYear();
			this.getView().byId("idRegDate").setValue('01.' + month + '.' + year);
			this.getView().byId("idRegDateTo").setValue(rangeDate.getDate() + '.' + month + '.' + year);
			// this.super("123456789", month+'.'+'01.'+year, month+'.'+rangeDate.getDate()+'.'+year);
		},
		onConfirm: function(oEvent) {

			if (this.sId.indexOf("accountDetails") !== -1) {

				var accountNo = oEvent.getParameter("selectedItem").getValue();

				this.getView().getModel("local").setProperty("/GSTInvoices/AccountNo", accountNo);
				var startDate = this.getView().byId("idRegDate").getValue().split('.');
				var endDate = this.getView().byId("idRegDateTo").getValue().split('.');
				this.super(accountNo, startDate[1] + '.' + startDate[0] + '.' + startDate[2], endDate[1] + '.' + endDate[0] + '.' + endDate[2]);
				// var oFilter = new sap.ui.model.Filter("AccountNo", "EQ", bankName);
				// this.getView().byId("idSummary").getBinding("items").filter(oFilter);
			}
		},
		onStartDate: function(oEvent) {
			var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
			var startDate = this.getView().byId("idRegDate").getValue().split('.');
			var endDate = this.getView().byId("idRegDateTo").getValue().split('.');
			this.super(accountNo, startDate[1] + '.' + startDate[0] + '.' + startDate[2], endDate[1] + '.' + endDate[0] + '.' + endDate[2]);
		},
		onEndDate: function(oEvent) {
			this.onStartDate();
		},
		onItemPress: function(oEvent) {
			var that = this;
			var id = oEvent.getSource().getModel("viewModel").getProperty(oEvent.getSource().getBindingContextPath()).id;
			var amount = oEvent.getSource().getModel("viewModel").getProperty(oEvent.getSource().getBindingContextPath()).FullAmount;
			var oAmountDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Change Amount",
				content: [
					new sap.ui.layout.HorizontalLayout({
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "140px",
								content: [
									new sap.m.Text({
										text: "Current Total :      " + amount
									})
								]
							})
						]
					}),
					new sap.m.Input("confirmationNote", {
						width: "100%",
						placeholder: "Enter Amount to Change",
						type: "Number",
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter("value");
							oAmountDialog.getBeginButton().setEnabled(sText.length > 0);
						}.bind(this)
					})
				],
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					enabled: false,
					text: "Submit",
					press: function() {
						var sAmount = Core.byId("confirmationNote").getValue();
						if (sAmount <= 50000) {
							$.post('/updateSubcriptionAmount', {
									"id": id,
									"Amount": sAmount
								})
								.done(function(data, status) {
									sap.m.MessageBox.success("Updated");
									that.onStartDate();
								})
								.fail(function(xhr, status, error) {
									sap.m.MessageBox.error("Error in access");
								});
						} else {
							sap.m.MessageBox.error("No Subcription is greater than 50,000");
						}
						oAmountDialog.close();
						Core.byId("confirmationNote").destroy();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function() {
						oAmountDialog.close();
						Core.byId("confirmationNote").destroy();
					}.bind(this)
				})
			});
			oAmountDialog.open();
		},
		onDownloadInvoice: function(oEvent) {
			var oDetail = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			var products = [{
				"Course": oDetail.CourseName,
				"Batch": oDetail.BatchNo,
				"HSN": "xxxxxxx",
				"Qty": 1,
				"Rate": oDetail.Amount,
				"CGST": "9%",
				"SGST": "9%",
				"Amount": oDetail.Amount
			}];
			const invoiceDetail = {
				shipping: {
					name: oDetail.Name,
					address: "",
					city: "",
					state: "",
					country: oDetail.Country,
					postal_code: ""
				},
				items: products,
				CGST: oDetail.CGST,
				SGST: oDetail.SGST,
				fullAmount : oDetail.FullAmount,
				order_number: "xxxxxx",
				header: {
					company_name: "Soyuz Technologies LLP",
					company_logo: "logo.png",
					company_address: "EPS-FF-073A Emerald Plaza, Golf Course Extension Road, Sector 65"
				},
				footer: {
					text: "Thank you for taking course with us"
				},
				currency_symbol: " INR",
				date: {
					billing_date: oDetail.PaymentDate.slice(4, 15),
					due_date: oDetail.PaymentDate.slice(4, 15),
				}
			};

			let header = (doc, invoice) => {

				if (false) {
					doc.image(invoice.header.company_logo, 50, 45, {
							width: 50
						})
						.fontSize(20)
						.text(invoice.header.company_name, 110, 57)
						.moveDown();
				} else {
					doc.fontSize(20)
						.text(invoice.header.company_name, 50, 45)
						.moveDown()
				}

				if (invoice.header.company_address.length !== 0) {
					companyAddress(doc, invoice.header.company_address);
				}

			}

			let customerInformation = (doc, invoice) => {
				doc
					.fillColor("#444444")
					.fontSize(20)
					.text("Invoice", 50, 160);

				generateHr(doc, 185);

				const customerInformationTop = 200;

				doc.fontSize(10)
					.text("Invoice Number:", 50, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.order_number, 150, customerInformationTop)
					.font("Helvetica")
					.text("Billing Date:", 50, customerInformationTop + 15)
					.text(invoice.date.billing_date, 150, customerInformationTop + 15)
					.text("Due Date:", 50, customerInformationTop + 30)
					.text(invoice.date.due_date, 150, customerInformationTop + 30)

					.font("Helvetica-Bold")
					.text(invoice.shipping.name, 300, customerInformationTop)
					.font("Helvetica")
					.text(invoice.shipping.address, 300, customerInformationTop + 15)
					.text(
						invoice.shipping.city +
						", " +
						invoice.shipping.state +
						", " +
						invoice.shipping.country,
						300,
						customerInformationTop + 30
					)
					.moveDown();

				generateHr(doc, 252);
			}

			let invoiceTable = (doc, invoice) => {
				let i;
				const invoiceTableTop = 330;
				const currencySymbol = invoice.currency_symbol;

				doc.font("Helvetica-Bold");
				tableRow(
					doc,
					invoiceTableTop,
					"Course",
					"Batch",
					"HSN/SAC",
					"Qty",
					"Rate",
					"CGST",
					"SGST",
					"Amount"
				);
				generateHr(doc, invoiceTableTop + 20);
				doc.font("Helvetica");
				var totalAmount = 0;
				var totalGST = 0;
				for (i = 0; i < invoice.items.length; i++) {
					const item = invoice.items[i];
					const position = invoiceTableTop + (i + 1) * 30;
					tableRow(
						doc,
						position,
						item.Course,
						item.Batch,
						item.HSN,
						item.Qty,
						item.Rate,
						item.CGST,
						item.SGST,
						item.Amount
					);
					totalAmount += parseFloat(item.Amount);
					generateHr(doc, position + 20);
				}

				const subtotalPosition = invoiceTableTop + (i + 1) * 30;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					subtotalPosition,
					"Sub Total :",
					totalAmount.toFixed(2)
				);
				const cgstPosition = subtotalPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					cgstPosition,
					"CGST(9%): ",
					invoice.CGST
				);
				const sgstPosition = cgstPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					sgstPosition,
					"SGST(9%): ",
					invoice.SGST
				);
				const paidToDatePosition = sgstPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					paidToDatePosition,
					"Total Amount :",
					formatCurrency(invoice.fullAmount, currencySymbol)
				);
			}

			let footer = (doc, invoice) => {
				if (invoice.footer.text.length !== 0) {
					doc.fontSize(10).text(invoice.footer.text, 50, 780, {
						align: "center",
						width: 500
					});
				}
			}

			let totalTable = (
				doc,
				y,
				name,
				description
			) => {
				doc
					.fontSize(10)
					.text(name, 380, y, {
						width: 90,
						align: "right"
					})
					.text(description, 0, y, {
						align: "right"
					})
			}

			let tableRow = (
				doc,
				y,
				course,
				batch,
				hsn,
				qty,
				rate,
				cgst,
				sgst,
				amount
			) => {
				doc
					.fontSize(10)
					.text(course, 50, y)
					.text(batch, 160, y)
					.text(hsn, 200, y, {
						width: 90,
						align: "right"
					})
					.text(qty, 240, y, {
						width: 90,
						align: "right"
					})
					.text(rate, 300, y, {
						width: 90,
						align: "right"
					})
					.text(cgst, 350, y, {
						width: 90,
						align: "right"
					})
					.text(sgst, 400, y, {
						width: 90,
						align: "right"
					})
					.text(amount, 0, y, {
						align: "right"
					});
			}

			let generateHr = (doc, y) => {
				doc
					.strokeColor("#aaaaaa")
					.lineWidth(1)
					.moveTo(50, y)
					.lineTo(550, y)
					.stroke();
			}

			let formatCurrency = (value, symbol) => {
				if (value) {
					var x = value.toString().split('.');
					var y = (x.length > 1 ? "." + x[1] : "");
					x = x[0];
					var lastThree = x.substring(x.length - 3);
					var otherNumbers = x.substring(0, x.length - 3);
					if (otherNumbers != '')
						lastThree = ',' + lastThree;
					var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
					return res + y + symbol;
				} else {
					return value + symbol;
				}
			}

			let getNumber = str => {
				if (str.length !== 0) {
					var num = str.replace(/[^0-9]/g, '');
				} else {
					var num = 0;
				}

				return num;
			}

			let checkIfTaxAvailable = tax => {
				let validatedTax = getNumber(tax);
				if (Number.isNaN(validatedTax) === false && validatedTax <= 100 && validatedTax > 0) {
					var taxValue = tax;
				} else {
					var taxValue = '---';
				}

				return taxValue;
			}

			let applyTaxIfAvailable = (price, gst) => {


				let validatedTax = getNumber(gst);
				if (Number.isNaN(validatedTax) === false && validatedTax <= 100) {
					let taxValue = '.' + validatedTax;
					var itemPrice = price * (1 + taxValue);
				} else {
					var itemPrice = price * (1 + taxValue);
				}

				return itemPrice;
			}

			let companyAddress = (doc, address) => {
				let str = address;
				let chunks = str.match(/.{0,25}(\s|$)/g);
				let first = 50;
				chunks.forEach(function(i, x) {
					doc.fontSize(10).text(chunks[x], 200, first, {
						align: "right"
					});
					first = +first + 15;
				});
			}

			let niceInvoice = (invoice) => {
				var doc = new PDFDocument({
					size: "A4",
					margin: 40
				});
				var stream = doc.pipe(blobStream());
				header(doc, invoice);
				customerInformation(doc, invoice);
				invoiceTable(doc, invoice);
				footer(doc, invoice);
				doc.end();
				stream.on('finish', function() {
					// get a blob you can do whatever you like with
					const blob = stream.toBlob('application/pdf');
					// or get a blob URL for display in the browser
					const url = stream.toBlobURL('application/pdf');

					const downloadLink = document.createElement('a');
					downloadLink.href = url;
					downloadLink.download = oDetail.Name;
					downloadLink.click();
				});
			}
			niceInvoice(invoiceDetail);
		},
		// onAcSelect: function(oEvent){
		// 	this.oEvent_approve = oEvent;
		// 		var that = this;
		// 	var loginPayload = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
		// 	var postPayload = {
		// 		AccountNo: loginPayload.AccountNo,
		// 		State: oEvent.getSource().getSelected()
		// 	};
		// 	$.post('/markCheckedAccount', postPayload)
		// 		.done(function(data, status) {
		// 			sap.m.MessageToast.show("Account Checked Success");
		// 		})
		// 		.fail(function(xhr, status, error) {
		// 			sap.m.MessageBox.error(xhr.responseText);
		// 		});
		//
		// },
		// MResetCounter: function(oEvent){
		// 	var sId = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath()).id;
		// 	oEvent.getSource().setText("0");
		// 	this.resetCounter(sId);
		// },
		// resetCounter: function(sId){
		// 	$.post('/ResetCounter', {id: sId})
		// 		.done(function(data, status) {
		// 			sap.m.MessageToast.show("done");
		// 		})
		// 		.fail(function(xhr, status, error) {
		// 			sap.m.MessageBox.error(xhr.responseText);
		// 		});
		// },
		// MSetKey: function(oEvent) {
		// 	debugger;
		// 	var sId = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath()).id;
		//
		// 	var newKey = prompt("Please enter your password", "");
		//
		// 	if(newKey !== ""){
		// 		oEvent.getSource().setText(newKey);
		// 		this.setKey(newKey,sId);
		// 	}
		//
		// },
		// setKey: function(newKey, sId){
		// 	$.post('/ResetPassword', {
		// 		id: sId,
		// 		key: newKey
		// 	})
		// 		.done(function(data, status) {
		// 			sap.m.MessageToast.show("done");
		// 		})
		// 		.fail(function(xhr, status, error) {
		// 			sap.m.MessageBox.error(xhr.responseText);
		// 		});
		// },
		// onGetNext: function(){
		// 	$.post('/MoveNextAc', {})
		// 		.done(function(data, status) {
		// 			sap.m.MessageBox.confirm(data.accountNo + "," + data.BankName + "," +
		// 															data.ifsc + "," + data.accountName);
		// 		})
		// 		.fail(function(xhr, status, error) {
		// 			sap.m.MessageBox.error(xhr.responseText);
		// 		});
		// },
		// onBank: function(oEvent){
		// 	this.oEvent_approve = oEvent;
		// 		var that = this;
		// 	var loginPayload = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
		// 	if(loginPayload.AccountName){
		// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Accounts",
		// 		 "GET", {
		// 			 filters: [new sap.ui.model.Filter("accountNo","EQ",loginPayload.AccountNo)]
		// 		 }, {}, this)
		// 			.then(function(oData) {
		//
		// 				console.log(oData.results[0].userId);
		// 				console.log(oData.results[0].key);
		// 				try {
		// 					navigator.clipboard.writeText(oData.results[0].userId);
		// 				} catch (e) {
		//
		// 				} finally {
		//
		// 				}
		// 				window.open(oData.results[0].extra1);
		// 			}).catch(function(oError) {
		// 				that.getView().setBusy(false);
		// 				var oPopover = that.getErrorMessage(oError);
		//
		// 			});
		// 	}
		//
		// },
		// onLiveSearch: function(oEvent){
		// 	var queryString = oEvent.getParameter("value");
		// 	if (queryString) {
		// 		var oFilter1 = new sap.ui.model.Filter("value", sap.ui.model.FilterOperator.Contains, queryString);
		// 		var oFilter2 = new sap.ui.model.Filter("key", sap.ui.model.FilterOperator.Contains, queryString);
		//
		// 		var oFilter = new sap.ui.model.Filter({
		// 			filters: [oFilter1, oFilter2],
		// 			and: false
		// 		});
		// 		var aFilter = [oFilter];
		// 		this.searchPopup.getBinding("items").filter(aFilter);
		// 	} else {
		// 		this.searchPopup.bindAggregation("items", {
		// 			path: "local>/accountSet",
		// 			template: new sap.m.DisplayListItem({
		// 				label: "{local>value}",
		// 				value: "{local>key}"
		// 			})
		// 		});
		// 		this.searchPopup.getBinding("items").filter([]);
		// 	}
		// },
		// onSend: function() {
		//
		// 	var payload = this.getView().getModel("local").getProperty("/accountBalance");
		// 	payload.CreatedOn = this.getView().byId("idRegDate").getDateValue();
		// 	var that = this;
		// 	that.getView().setBusy(true);
		// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AccountBalances", "POST", {},
		// 			payload, this, true)
		// 		.then(function(oData) {
		// 			that.getView().setBusy(false);
		// 			sap.m.MessageToast.show("Account entry Saved successfully");
		// 			//this.getView().byId("idRegDate").setDateValue(new Date());
		// 			that.getView().getModel("local").setProperty("/accountBalance/CreatedOn", that.formatter.getFormattedDate(0));
		// 		}).catch(function(oError) {
		// 			that.getView().setBusy(false);
		// 			var oPopover = that.getErrorMessage(oError);
		// 		});
		// },
		// onRefresh: function(){
		// 	this.super();
		// },

		onSelect: function(oEvent) {
			this.sId = oEvent.getSource().getId();

			var sTitle = "",
				sPath = "";
			if (this.sId.indexOf("accountDetails") !== -1) {
				var oAccFilter = new sap.ui.model.Filter("deleted", FilterOperator.EQ, false);
				sTitle = "Account Search";
				this.getCustomerPopup();
				var title = "Account Search";
				var oSorter = new sap.ui.model.Sorter({
					path: 'accountName',
					descending: false
				});
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Accounts",
					filters: [oAccFilter],
					sorter: oSorter,
					template: new sap.m.DisplayListItem({
						label: "{accountName}",
						value: "{accountNo}"
					})
				});
			}
		},
		// onStudentIdChange: function(oContext){
		//
		// },
		super: function(accountNo, startDate, endDate) {
			var that = this;
			$.post('/getAmountForAccount', {
					"AccountNo": accountNo,
					"StartDate": startDate,
					"EndDate": endDate
				})
				.done(function(data, status) {
					var oNewModel = new sap.ui.model.json.JSONModel();
					// this.formatter.sortByProperty(data,"Amount");
					// data.sort(function (a, b) {
					//   return b.Amount - a.Amount;
					// });
					oNewModel.setData({
						"records": data
					});
					var totalBalance = 0;
					for (var i = 0; i < data.length; i++) {
						totalBalance = totalBalance + data[i].FullAmount;
					}
					that.getView().byId("newtitle").setText("Total Balance : " + totalBalance);
					that.getView().setModel(oNewModel, "viewModel");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});
		}
	});

});
