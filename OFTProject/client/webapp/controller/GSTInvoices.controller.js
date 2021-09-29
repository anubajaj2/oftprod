sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"oft/fiori/models/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Core, Filter, FilterOperator, Formatter, Fragment, MessageBox, MessageToast) {
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
			var startDate = new Date(year + " " + month);
			this.getView().byId("idRegDate").setValue(startDate.toDateString().slice(4));
			this.getView().byId("idRegDateTo").setValue(rangeDate.toDateString().slice(4));
			// this.super("123456789", month+'.'+'01.'+year, month+'.'+rangeDate.getDate()+'.'+year);
			var that = this;
			$.ajax({
				type: 'GET', // added,
				url: 'getLogo',
				success: function(data) {
					that.logo = data;
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in fetching logo");
				}
			});
			$.ajax({
				type: 'GET', // added,
				url: 'getSignature',
				success: function(data) {
					that.signature = data;
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in fetching signature");
				}
			});
		},
		onLiveSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = [
				new Filter("value", FilterOperator.Contains, sValue),
				new Filter("key", FilterOperator.Contains, sValue)
			];
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter(new Filter(oFilter, false));
		},
		onConfirm: function(oEvent) {
			if (this.sId.indexOf("accountDetails") !== -1) {

				var accountNo = oEvent.getParameter("selectedItem").getValue();

				this.getView().getModel("local").setProperty("/GSTInvoices/AccountNo", accountNo);
				var startDate = this.getView().byId("idRegDate").getValue();
				var endDate = this.getView().byId("idRegDateTo").getValue();
				this.accountNo = accountNo;
				this.super(accountNo, startDate, endDate);
				// var oFilter = new sap.ui.model.Filter("AccountNo", "EQ", bankName);
				// this.getView().byId("idSummary").getBinding("items").filter(oFilter);
			} else if (this.sId.indexOf("idAccountNo") !== -1) {

				var accountNo = oEvent.getParameter("selectedItem").getValue();
				Core.byId("idAccountNo").setValue(accountNo);
			}
		},
		onStartDate: function() {
			var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
			var startDate = this.getView().byId("idRegDate").getValue();
			var endDate = this.getView().byId("idRegDateTo").getValue();
			this.super(accountNo, startDate, endDate);
		},
		onEndDate: function(oEvent) {
			this.onStartDate();
		},
		payMode: "ALL",
		onPayModeSelect: function(oEvent) {
			this.payMode = oEvent.getSource().getSelectedItem().getKey();
			this.onStartDate();
		},
		onReference: function(oEvent) {
			var oCtx = oEvent.getSource().getParent().getBindingContextPath(),
				reference = oEvent.getSource().getParent().getModel("viewModel").getProperty(oCtx + "/Reference");
			open('https://www.paypal.com/myaccount/transaction/details/' + reference, 'paypal', 'width=1200,height=600');
			// create popover
		},
		onEditInfo: function(oEvent) {
			var that = this;
			var oSub = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			var id = oSub.id;
			var userId = that.getView().getModel("local").getProperty("/CurrentUser");
			var amount = oSub.FullAmount;
			var oAmountDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Modify : " + oSub.Email,
				contentWidth: "450px",
				content: [
					new sap.m.Label({
						text: "payment Mode: "
					}),
					new sap.m.Select("idPaymentMode", {
						items: [
							new sap.ui.core.Item({
								key: "IMPS",
								text: "Internet Banking"
							}),
							new sap.ui.core.Item({
								key: "PAYTM",
								text: "PayTM"
							}),
							new sap.ui.core.Item({
								key: "PAYPAL",
								text: "Paypal/Xoom"
							}),
							new sap.ui.core.Item({
								key: "PAYU",
								text: "PayUMoney"
							}),
							new sap.ui.core.Item({
								key: "USA",
								text: "Wire Transfer"
							}),
							new sap.ui.core.Item({
								key: "FOREIGN",
								text: "Foregin Transfer"
							})
						],
						width: "100%",
						selectedKey: oSub.PaymentMode
					}),
					new sap.m.Label({
						text: "Amount: "
					}),
					new sap.m.Input("idAmount", {
						type: "Number",
						value: amount
					}),
					new sap.m.Label({
						text: "Paypal Amount: "
					}),
					new sap.m.Input("idUSDAmount", {
						type: "Number",
						value: oSub.USDAmount,
						enabled: oSub.IsWallet
					}),
					new sap.m.Label({
						text: "Currency Code: "
					}),
					new sap.m.Input("idCurrencyCode", {
						value: oSub.CurrencyCode,
						enabled: oSub.IsWallet
					}),
					new sap.m.Label({
						text: "Charges: "
					}),
					new sap.m.Input("idCharges", {
						type: "Number",
						value: oSub.Charges,
						enabled: oSub.IsWallet
					}),
					new sap.m.Label({
						text: "Exchange: ",
						required: oSub.IsWallet,
					}),
					new sap.m.Input("idExchange", {
						type: "Number",
						value: oSub.Exchange,
						enabled: oSub.IsWallet,
						liveChange: (oEvent) => {
							var newAmount = Core.byId("idUSDAmount").getValue() - Core.byId("idCharges").getValue();
							Core.byId("idSettleAmount").setValue((newAmount * oEvent.getParameter("value")).toFixed(2));
						}
					}),
					new sap.m.Label({
						text: "Settle Amount: "
					}),
					new sap.m.Input("idSettleAmount", {
						type: "Number",
						value: oSub.SettleAmount,
						enabled: false //oSub.IsWallet
					}),
					new sap.m.Label({
						text: "Settle Date: "
					}),
					new sap.m.DatePicker("idSettleDate", {
						displayFormat: "dd.MM.yyyy",
						valueFormat: "MMM dd yyyy",
						value: oSub.SettleDate,
						enabled: oSub.IsWallet
					}),
					new sap.m.Label({
						text: "Account No: "
					}),
					new sap.m.Input("idAccountNo", {
						value: that.accountNo,
						showValueHelp: true,
						valueHelpOnly: true,
						valueHelpRequest: [that.onSelect, this]
					}),
					new sap.m.Label({
						text: "Reference: "
					}),
					new sap.m.Input("idReference", {
						value: oSub.Reference
					}),
					new sap.m.CheckBox("idConfirm", {
						text: "Confirm",
						select: function(oEvent) {
							oAmountDialog.getBeginButton().setEnabled(oEvent.getParameter("selected"));
						}.bind(this)
					})
				],
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					enabled: false,
					text: "Submit",
					press: function() {
						var sAmount = Core.byId("idAmount").getValue();
						var usdAmount = Core.byId("idUSDAmount").getValue();
						var currencyCode = Core.byId("idCurrencyCode").getValue();
						var exchange = Core.byId("idExchange").getValue();
						var paymentMode = Core.byId("idPaymentMode").getSelectedKey();
						var charges = Core.byId("idCharges").getValue();
						var settleDate = Core.byId("idSettleDate").getValue();
						var settleAmount = Core.byId("idSettleAmount").getValue();
						var accountNo = Core.byId("idAccountNo").getValue();
						var reference = Core.byId("idReference").getValue();
						var payload = {};
						if (oSub.IsWallet) {
							payload = {
								"id": id,
								"Amount": sAmount,
								"USDAmount": usdAmount,
								"CurrencyCode": currencyCode,
								"Exchange": exchange,
								"Charges": charges,
								"SettleDate": settleDate,
								"SettleAmount": settleAmount,
								"PaymentMode": paymentMode,
								// "AccountName": accountNo,
								"Reference": reference,
								"ChangedBy": userId
							}
						} else {
							payload = {
								"id": id,
								"Amount": sAmount,
								"PaymentMode": paymentMode,
								// "AccountName": accountNo,
								"Reference": reference,
								"ChangedBy": userId
							}
						}
						if (accountNo) {
							payload.AccountName = accountNo;
						}
						if (sAmount <= 90000) {
							$.post('/updateSubcriptionAmount', payload)
								.done(function(data, status) {
									MessageBox.success("Update " + data);
									that.destroyEditItems();
									oAmountDialog.destroy();
									that.onStartDate();
								})
								.fail(function(xhr, status, error) {
									that.destroyEditItems();
									oAmountDialog.destroy();
									MessageBox.error("Error in access");
								});
							oAmountDialog.close();
						} else {
							MessageBox.error("No Subcription is greater than 90,000");
						}
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function() {
						that.destroyEditItems();
						oAmountDialog.close();
						oAmountDialog.destroy();
					}.bind(this)
				})
			});
			oAmountDialog.open();
		},
		destroyEditItems: function() {
			Core.byId("idAmount").destroy();
			Core.byId("idUSDAmount").destroy();
			Core.byId("idCurrencyCode").destroy();
			Core.byId("idExchange").destroy();
			Core.byId("idPaymentMode").destroy();
			Core.byId("idCharges").destroy();
			Core.byId("idSettleDate").destroy();
			Core.byId("idSettleAmount").destroy();
			Core.byId("idReference").destroy();
			Core.byId("idConfirm").destroy();
		},
		getCountryNameFromCode: function(code) {
			var countryWithCode = this.getView().getModel("local").getProperty("/countries");
			var name = "";
			countryWithCode.forEach((item) => {
				if (item.code === code) {
					name = item.name
					return;
				}
			});
			return (name ? name : code);
		},
		onFullScreen: function(oEvent) {
			var oMode = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getMode();
			if (oMode === "ShowHideMode") {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("HideMode");
				oEvent.getSource().setIcon("sap-icon://exit-full-screen");
				oEvent.getSource().setText("Hide Fullscreen");
			} else {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("ShowHideMode");
				oEvent.getSource().setIcon("sap-icon://full-screen");
				oEvent.getSource().setText("Show Fullscreen");
			}
		},

		onAddressMail: function(oEvent) {
			var items = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			if (!this.emailApproveDialog) {
				this.emailApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirm",
					content: new sap.m.Text({
						text: "Please Confirm"
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Submit",
						press: function() {
							items.forEach((item, i) => {
								var oDetail = this.getView().getModel("viewModel").getProperty(item);
								$.post('/sendEmailForAddress', {
										"UserName": oDetail.Name,
										"EmailId": oDetail.Email,
										"Subject": "[URGENT Action Required]"
									})
									.done(function(data, status) {
										MessageToast.show("Email Sent");
									})
									.fail(function(xhr, status, error) {
										MessageBox.error("Error in sending Mail");
									});
							});
							this.emailApproveDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function() {
							this.emailApproveDialog.close();
						}.bind(this)
					})
				});
			}
			this.emailApproveDialog.open();
		},
		onGenerateInvoiceNo: function(oEvent) {
			var that = this;
			var oItems = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			var userId = this.getView().getModel("local").getProperty("/CurrentUser");
			const temp = (items, index = 0) => {
				var oDetail = this.getView().getModel("viewModel").getProperty(items[index]);
				if (oDetail.IsWallet && oDetail.SettleAmount === 0) {
					MessageToast.show("Incomplete Information, can't generate Invoice No")
					if (++index < items.length) {
						temp(items, index);
					}
					if (items.length === index) {
						that.onStartDate();
						that.getView().setBusy(false);
						MessageBox.success("Invoice no. generated for all");
					}
				} else {
					if (oDetail.InvoiceNo === "null" || oDetail.InvoiceNo === "") {
						$.post('/getInvoiceNo', {
								"SubcriptionId": oDetail.id,
								"PaymentDate": oDetail.PaymentDate,
								"UserId": userId
							})
							.done(function(invoiceNo, status) {
								if (++index < items.length) {
									temp(items, index);
								}
								if (items.length === index) {
									that.onStartDate();
									that.getView().setBusy(false);
									MessageBox.success("Invoice no. generated for all");
								}
							})
							.fail(function(xhr, status, error) {
								MessageBox.error("Error in Invoice no.");
								that.getView().setBusy(false);
							});
					} else {
						if (++index < items.length) {
							temp(items, index);
						}
						if (items.length === index) {
							that.onStartDate();
							that.getView().setBusy(false);
							MessageBox.success("Invoice no. generated for all");
						}
					}

				}

			}
			if (oItems.length < 1) {
				MessageBox.alert("Please select atleast one/all");
			} else {
				MessageBox.confirm("Please confirm?", function(val) {
					if (val === "OK") {
						that.getView().setBusy(true);
						temp(oItems);
					}
				});
			}
		},
		onDownloadAllInvoice: function(oEvent) {
			var that = this;
			var oItems = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			var userId = this.getView().getModel("local").getProperty("/CurrentUser");
			const temp = (items, index = 0) => {
				var oDetail = this.getView().getModel("viewModel").getProperty(items[index]);
				var address = (oDetail.Address != "null" ? oDetail.Address + ", " : "") + (oDetail.City != "null" ? oDetail.City + ", " : "");
				var patt = new RegExp("haryana", "i");
				var isHaryana = patt.test(address);
				var isGSTIN = (oDetail.GSTIN != "null" && oDetail.GSTIN != "");
				if (oDetail.IsWallet && oDetail.SettleAmount === 0) {
					MessageToast.show("Incomplete Information, can't download");
					if (++index < items.length) {
						temp(items, index);
					}
				} else {
					if (oDetail.InvoiceNo === "null" || oDetail.InvoiceNo === "") {
						$.post('/getInvoiceNo', {
								"SubcriptionId": oDetail.id,
								"PaymentDate": oDetail.PaymentDate,
								"UserId": userId
							})
							.done(function(invoiceNo, status) {
								if ((!isHaryana) && isGSTIN) {
									that.DownloadInvoiceForOther(oDetail, invoiceNo);
								} else {
									that.DownloadInvoice(oDetail, invoiceNo);
								}
								if (++index < items.length) {
									setTimeout(() => {
										temp(items, index);
									}, 800);
								}
							})
							.fail(function(xhr, status, error) {
								MessageBox.error("Error in Invoice no.");
							});
					} else {
						if ((!isHaryana) && isGSTIN) {
							that.DownloadInvoiceForOther(oDetail, oDetail.InvoiceNo);
						} else {
							that.DownloadInvoice(oDetail, oDetail.InvoiceNo);
						}
						if (++index < items.length) {
							setTimeout(() => {
								temp(items, index);
							}, 1000);
						}
					}
				}

			}
			if (oItems.length > 0) {
				temp(oItems);
			}
			setTimeout(() => {
				this.onStartDate();
			}, 1250 * oItems.length);
		},

		onDownloadInvoice: function(oEvent) {
			var that = this;
			var oDetail = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			var address = (oDetail.Address != "null" ? oDetail.Address + ", " : "") + (oDetail.City != "null" ? oDetail.City + ", " : "");
			var userId = this.getView().getModel("local").getProperty("/CurrentUser");
			var patt = new RegExp("haryana", "i");
			var pattern = new RegExp("INV-", "i");
			var isHaryana = patt.test(address);
			var isGSTIN = (oDetail.GSTIN != "null" && oDetail.GSTIN != "");
			if (oDetail.IsWallet && oDetail.SettleAmount === 0) {
				MessageToast.show("Incomplete Information, can't download")
			} else {
				if (!pattern.test(oDetail.InvoiceNo)) {
					$.post('/getInvoiceNo', {
							"SubcriptionId": oDetail.id,
							"PaymentDate": oDetail.PaymentDate,
							"UserId": userId
						})
						.done(function(invoiceNo, status) {
							if ((!isHaryana) && isGSTIN) {
								that.DownloadInvoiceForOther(oDetail, invoiceNo);
							} else {
								that.DownloadInvoice(oDetail, invoiceNo);
							}
							that.onStartDate();
						})
						.fail(function(xhr, status, error) {
							MessageBox.error("Error in Invoice no.");
						});
				} else {
					if ((!isHaryana) && isGSTIN) {
						that.DownloadInvoiceForOther(oDetail, oDetail.InvoiceNo);
					} else {
						that.DownloadInvoice(oDetail, oDetail.InvoiceNo);
					}
				}
			}
		},
		DownloadInvoice: function(oDetail, invoiceNo) {
			var country = this.getCountryNameFromCode(oDetail.Country);
			var billingDate = new Date(oDetail.PaymentDate).toDateString().slice(4).split(" ");
			billingDate = billingDate[0] + " " + billingDate[1] + ", " + billingDate[2];
			var products = [{
				"Course": oDetail.CourseName,
				"Batch": oDetail.BatchNo,
				"HSN": "999293",
				"Qty": 1,
				"Rate": oDetail.Amount,
				"CGST": (oDetail.IsGST ? "9%" : "0%"),
				"SGST": (oDetail.IsGST ? "9%" : "0%"),
				"Amount": oDetail.Amount
			}];
			const invoiceDetail = {
				shipping: {
					name: oDetail.Name,
					email: oDetail.Email,
					mob: (oDetail.ContactNo ? "+" + oDetail.ContactNo : ""),
					GSTIN: (oDetail.GSTIN != "null" ? oDetail.GSTIN : ""),
					address: (oDetail.Address != "null" ? oDetail.Address + ", " : "") + (oDetail.City != "null" ? oDetail.City + ", " : "") + country
				},
				items: products,
				CGST: oDetail.CGST,
				SGST: oDetail.SGST,
				fullAmount: (oDetail.IsWallet ? (parseFloat(oDetail.USDAmount) * parseFloat(oDetail.Exchange)).toFixed(2) : oDetail.FullAmount),
				usdAmount: oDetail.USDAmount,
				order_number: invoiceNo,
				paymentMode: oDetail.PaymentMode,
				IsWallet: oDetail.IsWallet,
				header: {
					company_name: "Soyuz Technologies LLP",
					company_logo: "data:image/png;base64," + this.logo,
					signature: "data:image/png;base64," + this.signature,
					// hear \\ is used to change line
					company_address: "EPS-FF-073A, Emerald Plaza,\\Golf Course Extension Road,\\Sector 65, Gurgaon,\\Haryana-122102",
					GSTIN: (oDetail.IsGST ? "06AEFFS9740G1ZS" : "")
				},
				footer: {
					text: "This is a computer generated invoice"
				},
				currency_symbol: " INR",
				date: {
					billing_date: billingDate
				}
			};

			let header = (doc, invoice) => {

				if (this.logo) {
					doc.image(invoice.header.company_logo, 50, 45, {
							width: 50
						})
						.fontSize(20)
						.text(invoice.header.company_name, 110, 57)
						.fontSize(10)
						.text("GSTIN: " + invoice.header.GSTIN, 112, 87)
						.moveDown();
				} else {
					doc.fontSize(20)
						.text(invoice.header.company_name, 50, 45)
						.fontSize(10)
						.text("GSTIN: " + invoice.header.GSTIN, 50, 75)
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
					.text("Name:", 50, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.shipping.name, 150, customerInformationTop)
					.font("Helvetica")
					.text("E-mail:", 50, customerInformationTop + 15)
					.text(invoice.shipping.email, 150, customerInformationTop + 15)
					.text("Mob.:", 50, customerInformationTop + 30)
					.text(invoice.shipping.mob, 150, customerInformationTop + 30)
					.fontSize(9)
					.text("GSTIN:", 50, customerInformationTop + 45)
					.text(invoice.shipping.GSTIN, 150, customerInformationTop + 45)
					.fontSize(10)
					.text("Address:", 50, customerInformationTop + 60)
					.text(invoice.shipping.address, 150, customerInformationTop + 60)

					.text("Invoice Number:", 350, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.order_number, 450, customerInformationTop)
					.font("Helvetica")
					.text("Invoice Date:", 350, customerInformationTop + 15)
					.text(invoice.date.billing_date, 450, customerInformationTop + 15)
					.text("Payment Mode:", 350, customerInformationTop + 30)
					.font("Helvetica-Bold")
					.text(invoice.paymentMode, 450, customerInformationTop + 30)
					.moveDown();

				generateHr(doc, 280);
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
					"Sub Total:",
					formatCurrency(totalAmount.toFixed(2))
				);
				const cgstPosition = subtotalPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					cgstPosition,
					"CGST:",
					formatCurrency(invoice.CGST)
				);
				const sgstPosition = cgstPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					sgstPosition,
					"SGST:",
					formatCurrency(invoice.SGST)
				);
				const paidToDatePosition = sgstPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					paidToDatePosition,
					"Total (INR):",
					formatCurrency(invoice.fullAmount)
				);
				let amountInWordsPosition = sgstPosition + 20;
				generateHr(doc, amountInWordsPosition + 20);
				doc.font("Helvetica-Bold")
					.text("Amount in Words:", 50, amountInWordsPosition + 30)
					.text(this.formatter.convertNumberToWords(invoice.fullAmount) + " only", 150, amountInWordsPosition + 30)
				generateHr(doc, amountInWordsPosition + 50);

				if (invoice.IsWallet) {
					doc.font("Helvetica-Bold")
						.text("Paypal Exchange", 50, amountInWordsPosition + 80)
					amountInWordsPosition += 10
					doc.font("Helvetica")
						.text("---------------------------------------------------", 50, amountInWordsPosition + 78)
						.text("|\n|\n|\n|\n|\n|\n|\n|\n|\n|\n|", 50, amountInWordsPosition + 82)
						.text("|\n|\n|\n|\n|\n|\n|\n|\n|\n|\n|", 115, amountInWordsPosition + 82, {
							width: 105,
							align: "right"
						})
						.text("---------------------------------------------------", 50, amountInWordsPosition + 201)
						.text("Amount:", 60, amountInWordsPosition + 100)
						.text(formatCurrency(invoice.usdAmount) + " " + oDetail.CurrencyCode, 115, amountInWordsPosition + 100, {
							width: 90,
							align: "right"
						})
						.text("Fee:", 60, amountInWordsPosition + 120)
						.text("-" + formatCurrency(oDetail.Charges) + " " + oDetail.CurrencyCode, 115, amountInWordsPosition + 120, {
							width: 90,
							align: "right"
						})
						.text("------------------", 120, amountInWordsPosition + 132, {
							width: 90,
							align: "right"
						})
						.text("Sub Total:", 60, amountInWordsPosition + 145)
						.text(formatCurrency(oDetail.USDAmount - oDetail.Charges) + " " + oDetail.CurrencyCode, 115, amountInWordsPosition + 145, {
							width: 90,
							align: "right"
						})
						.text("Ex. Rate:", 60, amountInWordsPosition + 165)
						.text(formatCurrency(oDetail.Exchange) + " INR", 115, amountInWordsPosition + 165, {
							width: 90,
							align: "right"
						})
						.text("Amount(INR):", 60, amountInWordsPosition + 185)
						.text(formatCurrency(oDetail.SettleAmount) + " INR", 115, amountInWordsPosition + 185, {
							width: 90,
							align: "right"
						})
				}
				const signaturePosition = amountInWordsPosition + 200;
				if (this.signature) {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.image(invoice.header.signature, 440, signaturePosition + 20, {
							height: 50,
							width: 110
						})
						.text("Designated Partner", 440, signaturePosition + 80)
						.moveDown();
				} else {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.text("Designated Partner", 440, signaturePosition + 80)
						.moveDown()
				}
			}

			let footer = (doc, invoice) => {
				if (invoice.footer.text.length !== 0) {
					generateHr(doc, 760);
					doc.fontSize(8).text(invoice.footer.text, 50, 770, {
						align: "right",
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
				rate,
				cgst,
				sgst,
				amount
			) => {
				doc
					.fontSize(10)
					.text(course, 50, y)
					.text(batch, 160, y)
					.text(hsn, 222, y, {
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

			let formatCurrency = (value, symbol = "") => {
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
				// let chunks = str.match(/.{0,25}(\s|$)/g);
				let chunks = str.split("\\");
				let first = 50;
				chunks.forEach(function(i, x) {
					doc.fontSize(10).text(chunks[x], 300, first, {
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
					downloadLink.download = invoiceNo + "_" + oDetail.Country + "_" + oDetail.Name;
					downloadLink.click();
				});
			}
			niceInvoice(invoiceDetail);
		},
		DownloadInvoiceForOther: function(oDetail, invoiceNo) {
			var country = this.getCountryNameFromCode(oDetail.Country);
			var billingDate = new Date(oDetail.PaymentDate).toDateString().slice(4).split(" ");
			billingDate = billingDate[0] + " " + billingDate[1] + ", " + billingDate[2];
			var products = [{
				"Course": oDetail.CourseName,
				"Batch": oDetail.BatchNo,
				"HSN": "999293",
				"Qty": 1,
				"Rate": oDetail.Amount,
				"IGST": (oDetail.IsGST ? "18%" : "0%"),
				"Amount": oDetail.Amount
			}];
			const invoiceDetail = {
				shipping: {
					name: oDetail.Name,
					email: oDetail.Email,
					mob: (oDetail.ContactNo ? "+" + oDetail.ContactNo : ""),
					GSTIN: (oDetail.GSTIN != "null" ? oDetail.GSTIN : ""),
					address: (oDetail.Address != "null" ? oDetail.Address + ", " : "") + (oDetail.City != "null" ? oDetail.City + ", " : "") + country
				},
				items: products,
				IGST: parseFloat(oDetail.CGST) + parseFloat(oDetail.SGST),
				fullAmount: (oDetail.IsWallet ? (parseFloat(oDetail.USDAmount) * parseFloat(oDetail.Exchange)).toFixed(2) : oDetail.FullAmount),
				usdAmount: oDetail.USDAmount,
				order_number: invoiceNo,
				paymentMode: oDetail.PaymentMode,
				IsWallet: oDetail.IsWallet,
				header: {
					company_name: "Soyuz Technologies LLP",
					company_logo: "data:image/png;base64," + this.logo,
					signature: "data:image/png;base64," + this.signature,
					// hear \\ is used to change line
					company_address: "EPS-FF-073A, Emerald Plaza,\\Golf Course Extension Road,\\Sector 65, Gurgaon,\\Haryana-122102",
					GSTIN: (oDetail.IsGST ? "06AEFFS9740G1ZS" : "")
				},
				footer: {
					text: "This is a computer generated invoice"
				},
				currency_symbol: " INR",
				date: {
					billing_date: billingDate
				}
			};

			let header = (doc, invoice) => {

				if (this.logo) {
					doc.image(invoice.header.company_logo, 50, 45, {
							width: 50
						})
						.fontSize(20)
						.text(invoice.header.company_name, 110, 57)
						.fontSize(10)
						.text("GSTIN: " + invoice.header.GSTIN, 112, 87)
						.moveDown();
				} else {
					doc.fontSize(20)
						.text(invoice.header.company_name, 50, 45)
						.fontSize(10)
						.text("GSTIN: " + invoice.header.GSTIN, 50, 75)
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
					.text("Name:", 50, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.shipping.name, 150, customerInformationTop)
					.font("Helvetica")
					.text("E-mail:", 50, customerInformationTop + 15)
					.text(invoice.shipping.email, 150, customerInformationTop + 15)
					.text("Mob.:", 50, customerInformationTop + 30)
					.text(invoice.shipping.mob, 150, customerInformationTop + 30)
					.fontSize(9)
					.text("GSTIN:", 50, customerInformationTop + 45)
					.text(invoice.shipping.GSTIN, 150, customerInformationTop + 45)
					.fontSize(10)
					.text("Address:", 50, customerInformationTop + 60)
					.text(invoice.shipping.address, 150, customerInformationTop + 60)

					.text("Invoice Number:", 350, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.order_number, 450, customerInformationTop)
					.font("Helvetica")
					.text("Invoice Date:", 350, customerInformationTop + 15)
					.text(invoice.date.billing_date, 450, customerInformationTop + 15)
					.text("Payment Mode:", 350, customerInformationTop + 30)
					.font("Helvetica-Bold")
					.text(invoice.paymentMode, 450, customerInformationTop + 30)
					.moveDown();

				generateHr(doc, 280);
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
					"Rate",
					"IGST",
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
						item.Rate,
						item.IGST,
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
					"Sub Total:",
					formatCurrency(totalAmount.toFixed(2))
				);
				const igstPosition = subtotalPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					igstPosition,
					"IGST:",
					formatCurrency(invoice.IGST)
				);
				const paidToDatePosition = igstPosition + 20;
				doc.font("Helvetica-Bold");
				totalTable(
					doc,
					paidToDatePosition,
					"Total (INR):",
					formatCurrency(invoice.fullAmount)
				);
				let amountInWordsPosition = igstPosition + 20;
				generateHr(doc, amountInWordsPosition + 20);
				doc.font("Helvetica-Bold")
					.text("Amount in Words:", 50, amountInWordsPosition + 30)
					.text(this.formatter.convertNumberToWords(invoice.fullAmount) + " only", 150, amountInWordsPosition + 30)
				generateHr(doc, amountInWordsPosition + 50);

				if (invoice.IsWallet) {
					doc.font("Helvetica-Bold")
						.text("Paypal Exchange", 50, amountInWordsPosition + 80)
					amountInWordsPosition += 10
					doc.font("Helvetica")
						.text("---------------------------------------------------", 50, amountInWordsPosition + 78)
						.text("|\n|\n|\n|\n|\n|\n|\n|\n|\n|\n|", 50, amountInWordsPosition + 82)
						.text("|\n|\n|\n|\n|\n|\n|\n|\n|\n|\n|", 115, amountInWordsPosition + 82, {
							width: 105,
							align: "right"
						})
						.text("---------------------------------------------------", 50, amountInWordsPosition + 201)
						.text("Amount:", 60, amountInWordsPosition + 100)
						.text(formatCurrency(invoice.usdAmount) + " " + oDetail.CurrencyCode, 115, amountInWordsPosition + 100, {
							width: 90,
							align: "right"
						})
						.text("Fee:", 60, amountInWordsPosition + 120)
						.text("-" + formatCurrency(oDetail.Charges) + " " + oDetail.CurrencyCode, 115, amountInWordsPosition + 120, {
							width: 90,
							align: "right"
						})
						.text("------------------", 120, amountInWordsPosition + 132, {
							width: 90,
							align: "right"
						})
						.text("Sub Total:", 60, amountInWordsPosition + 145)
						.text(formatCurrency(oDetail.USDAmount - oDetail.Charges) + " " + oDetail.CurrencyCode, 115, amountInWordsPosition + 145, {
							width: 90,
							align: "right"
						})
						.text("Ex. Rate:", 60, amountInWordsPosition + 165)
						.text(formatCurrency(oDetail.Exchange) + " INR", 115, amountInWordsPosition + 165, {
							width: 90,
							align: "right"
						})
						.text("Amount(INR):", 60, amountInWordsPosition + 185)
						.text(formatCurrency(oDetail.SettleAmount) + " INR", 115, amountInWordsPosition + 185, {
							width: 90,
							align: "right"
						})
				}
				const signaturePosition = amountInWordsPosition + 200;
				if (this.signature) {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.image(invoice.header.signature, 440, signaturePosition + 20, {
							height: 50,
							width: 110
						})
						.text("Designated Partner", 440, signaturePosition + 80)
						.moveDown();
				} else {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.text("Designated Partner", 440, signaturePosition + 80)
						.moveDown()
				}
			}

			let footer = (doc, invoice) => {
				if (invoice.footer.text.length !== 0) {
					generateHr(doc, 760);
					doc.fontSize(8).text(invoice.footer.text, 50, 770, {
						align: "right",
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
				rate,
				igst,
				amount
			) => {
				doc
					.fontSize(10)
					.text(course, 50, y)
					.text(batch, 160, y)
					.text(hsn, 222, y, {
						width: 90,
						align: "right"
					})
					.text(rate, 300, y, {
						width: 90,
						align: "right"
					})
					.text(igst, 380, y, {
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

			let formatCurrency = (value, symbol = "") => {
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
				// let chunks = str.match(/.{0,25}(\s|$)/g);
				let chunks = str.split("\\");
				let first = 50;
				chunks.forEach(function(i, x) {
					doc.fontSize(10).text(chunks[x], 300, first, {
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
					downloadLink.download = invoiceNo + "_" + oDetail.Country + "_" + oDetail.Name;
					downloadLink.click();
				});
			}
			niceInvoice(invoiceDetail);
		},
		onWalletCalculator: function(oEvent) {
			if (!this.oConfirmDialog) {
				this.oConfirmDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Calculator",
					content: [
						new sap.ui.layout.HorizontalLayout({
							content: [
								new sap.ui.layout.VerticalLayout({
									content: [
										new sap.m.Label({
											text: "Wallet Amount",
											required: true
										}),
										new sap.m.Input("idWalletAmount", {
											value: 0,
											liveChange: function() {
												var walletFee = Core.byId("idWalletFee").getValue();
												var exchangeRate = Core.byId("idIndianAmount").getValue() / (Core.byId("idWalletAmount").getValue() - walletFee);
												exchangeRate = exchangeRate.toFixed(4);
												Core.byId("idExchangeRate").setText(exchangeRate);
												Core.byId("idFeeINR").setText((walletFee * exchangeRate).toFixed(2));
											}
										}),
										new sap.m.Label({
											text: "Exch. Rate:",
											required: true
										}),
										new sap.m.Label({
											text: "Fee(INR): ",
											required: true
										}),
										new sap.m.Label({
											text: "Total Credit:+"
										}),
										new sap.m.Label({
											text: "Total Fees:+"
										})
									]
								}),
								new sap.ui.layout.VerticalLayout({
									content: [
										new sap.m.Label({
											text: "Wallet Fee",
											required: true
										}),
										new sap.m.Input("idWalletFee", {
											value: 0,
											liveChange: function() {
												var walletFee = Core.byId("idWalletFee").getValue();
												var exchangeRate = Core.byId("idIndianAmount").getValue() / (Core.byId("idWalletAmount").getValue() - walletFee);
												exchangeRate = exchangeRate.toFixed(4);
												Core.byId("idExchangeRate").setText(exchangeRate);
												Core.byId("idFeeINR").setText((walletFee * exchangeRate).toFixed(2));
											}
										}),
										new sap.m.Text("idExchangeRate", {
											text: 0
										}),
										new sap.m.Text("idFeeINR", {
											text: 0
										}),
										new sap.m.Label({
											text: "--"
										}),
										new sap.m.Text("idTotalCredit", {
											text: 0
										}),
										new sap.m.Text("idTotalFees", {
											text: 0
										})
									]
								}),
								new sap.ui.layout.VerticalLayout({
									content: [
										new sap.m.Label({
											text: "Bank Amount",
											required: true
										}),
										new sap.m.Input("idIndianAmount", {
											value: 0,
											liveChange: function() {
												var walletFee = Core.byId("idWalletFee").getValue();
												var exchangeRate = Core.byId("idIndianAmount").getValue() / (Core.byId("idWalletAmount").getValue() - walletFee);
												exchangeRate = exchangeRate.toFixed(4);
												Core.byId("idExchangeRate").setText(exchangeRate);
												Core.byId("idFeeINR").setText((walletFee * exchangeRate).toFixed(2));
											}
										}),
									]
								})
							]
						})
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Add",
						press: function() {
							var totalCredit = parseFloat(Core.byId("idTotalCredit").getText());
							Core.byId("idTotalCredit").setText(totalCredit + parseFloat(Core.byId("idIndianAmount").getValue()));
							var feeINR = parseFloat(Core.byId("idTotalFees").getText());
							Core.byId("idTotalFees").setText((feeINR + parseFloat(Core.byId("idFeeINR").getText())).toFixed(2));
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Close",
						press: function() {
							Core.byId("idTotalFees").setText(0);
							Core.byId("idTotalCredit").setText(0);
							this.oConfirmDialog.close();
						}.bind(this)
					})
				});
			}

			this.oConfirmDialog.open();
		},

		onSelect: function(oEvent) {
			this.sId = oEvent.getSource().getId();

			var sTitle = "",
				sPath = "";
			if (this.sId.indexOf("accountDetails") !== -1 || this.sId.indexOf("idAccountNo") !== -1) {
				var oAccFilter = new sap.ui.model.Filter("deleted", FilterOperator.EQ, false);
				sTitle = "Account Search";
				this.getCustomerPopup();
				var title = "Account Search";
				var oSorter = new sap.ui.model.Sorter({
					path: 'value',
					descending: false
				});
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "local>/accountSet",
					filters: [oAccFilter],
					sorter: oSorter,
					template: new sap.m.DisplayListItem({
						label: "{local>value}",
						value: "{local>key}"
					})
				});
			}
		},

		onVerifyRating: function(oEvent) {
			var that = this;
			var val = oEvent.getParameter("value");
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var subId = oEvent.getSource().getParent().getModel("viewModel").getProperty(sPath + "/id");
			$.post('/ChartedValidRating', {
					"id": subId,
					"ChartedValid": val
				})
				.done(function(data, status) {
					MessageToast.show("Rating " + data);
				})
				.fail(function(xhr, status, error) {
					MessageBox.error("Error in Rating");
				});
		},
		onClearInvoice: function(oEvent) {
			var that = this;
			var startDate = this.getView().byId("idRegDate").getValue();
			//		var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
			var userId = this.getView().getModel("local").getProperty("/CurrentUser");
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirm",
					content: new sap.m.Text({
						text: "Do you want to clear Invoice History of start range month ?"
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Reject,
						text: "Submit",
						press: function() {
							$.post('/clearInvoiceHistory', {
									//	"AccountNo" : accountNo,
									"StartDate": startDate,
									"UserId": userId
								})
								.done(function(data, status) {
									setTimeout(() => {
										that.onStartDate();
										MessageBox.success("Invoice Entries Cleared");
									}, 2000);
								})
								.fail(function(xhr, status, error) {
									MessageBox.error("Error in access");
								});
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function() {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialog.open();
		},

		onDownloadExel: function(oEvent) {
			var that = this;
			var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
			var startDate = this.getView().byId("idRegDate").getValue();
			var endDate = this.getView().byId("idRegDateTo").getValue();
			$.ajax({
				type: 'GET', // added,
				url: 'getExcelForGST',
				data: {
					"AccountNo": accountNo,
					"StartDate": startDate,
					"EndDate": endDate
				},
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});
		},
		onCopyEmail: function() {
			if (!this.missingAddressEmails) {
				MessageToast.show("No record with missing address");
				return;
			}
			var emailBody = "Hello Team,\n\nThe following entries made by you has missing addess for the students, kindly check below and maintain the addess asap.\n\n" +
				this.missingAddressEmails +
				"\nNote: This is a system generated email, if already done, please ignore.\n" +
				"\n\nRegards,\nSystem.";
			const el = document.createElement('textarea')
			el.value = emailBody
			el.setAttribute('readonly', '')
			el.style.position = 'absolute'
			el.style.left = '-9999px'
			document.body.appendChild(el)
			el.select()
			document.execCommand('copy')
			document.body.removeChild(el)
			MessageToast.show("Emails Copied");
			console.log(emailBody);
		},
		super: function(accountNo, startDate, endDate) {
			var that = this;
			$.post('/getAmountForAccount', {
					"AccountNo": accountNo,
					"StartDate": startDate,
					"EndDate": endDate,
					"PaymentMode": this.payMode
				})
				.done(function(data, status) {
					var totalBalance = 0,
						totalIndianEntries = 0,
						totalForeignersEntries = 0,
						totalAmountNonPaypal = 0,
						totalAmountUSDPaypal = 0,
						totalSettleAmountPaypal = 0,
						totalGSTAmount = 0;
					that.missingAddressEmails = [];
					var missingAddressEmailsCollection = new Map();
					var users = {
						"5c187036dba2681834ffe305": "sonal",
						"5c187035dba2681834ffe301": "ANubhav",
						"5d947c3dab189706a40faade": "Servers",
						"5dd6a6aea5f9e83c781b7ac0": "shanu",
						"5ea2f01d7854a13c148f18cd": "Manish",
						'5db594b9b06bff3ffcbba53c': "shalu",
						"5dcf9f7183f22e7da0acdfe4": "vaishali",
						"5ecc968586321064989cdc3f": "kajol",
						"5f1331f2e0b8524af830fa20": "shalini",
						"5f4d01c50815a314ec9238d2": "khushbu",
						"60f0f06da1cf875cb8045975	":"anjali",
						"5d518381f516afc51c793ce0": "Demo"
					};
					for (var i = 0; i < data.length; i++) {
						data[i].Index = i + 1;
						totalBalance = totalBalance + data[i].FullAmount;
						totalGSTAmount += (parseFloat(data[i].CGST) + parseFloat(data[i].SGST));
						if (data[i].Country === "IN") {
							totalIndianEntries += 1;
						} else {
							totalForeignersEntries += 1
						}
						if (data[i].IsWallet) {
							totalSettleAmountPaypal += data[i].SettleAmount;
							totalAmountUSDPaypal += data[i].USDAmount;
						} else {
							totalAmountNonPaypal += data[i].FullAmount;
						}
						if (data[i].Address === null || data[i].Address === "" || data[i].Address === "null") {
							if (missingAddressEmailsCollection.has((users[data[i].CreatedBy] ? users[data[i].CreatedBy] : (data[i].CreatedBy)))) {
								missingAddressEmailsCollection.get((users[data[i].CreatedBy] ? users[data[i].CreatedBy] : (data[i].CreatedBy))).push(data[i].Email);
							} else {
								missingAddressEmailsCollection.set((users[data[i].CreatedBy] ? users[data[i].CreatedBy] : (data[i].CreatedBy)), [data[i].Email]);
							}
						}
					}
					missingAddressEmailsCollection.forEach(function(value, key) {
						that.missingAddressEmails += ("\n" + key + "(" + value.length + ")" + "\n" + value.toString() + "\n");
					});
					var oNewModel = new sap.ui.model.json.JSONModel();
					oNewModel.setData({
						"records": data
					});
					var totalProperties = {
						"TotalBalance": totalBalance,
						"TotalIndianEntries": totalIndianEntries,
						"TotalForeignersEntries": totalForeignersEntries,
						"TotalAmountNonPaypal": totalAmountNonPaypal,
						"TotalAmountUSDPaypal": totalAmountUSDPaypal,
						"TotalSettleAmountPaypal": totalSettleAmountPaypal,
						"TotalGSTAmount": totalGSTAmount.toFixed(2)
					};
					that.getView().getModel("local").setProperty("/totalProperties", totalProperties);
					that.getView().byId("newtitle").setText("Total Amount : " + totalBalance);
					that.getView().setModel(oNewModel, "viewModel");
				})
				.fail(function(xhr, status, error) {
					MessageBox.error("Error in access");
				});
		}
	});

});
