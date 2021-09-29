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

	return Controller.extend("oft.fiori.controller.InvoiceBuilder", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.onBankAccount, this);
			this.oLocalModel = this.getOwnerComponent().getModel("local");
			this.totalCount = 0;
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
				url: 'getAnubhavTrainingsLogo',
				success: function(data) {
					that.AnubhavTrainingslogo = data;
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in fetching logo");
				}
			});
			if (!that.soyuz_signature) {
				$.ajax({
					type: 'GET', // added,
					url: 'getSoyuzSignature',
					success: function(data) {
						that.soyuz_signature = data;
					},
					error: function(xhr, status, error) {
						sap.m.MessageToast.show("error in fetching signature");
					}
				});
			}
			if (!that.anubhav_signature) {
				$.ajax({
					type: 'GET', // added,
					url: 'getanubhavTrainingsSignature',
					success: function(data) {
						that.anubhav_signature = data;
					},
					error: function(xhr, status, error) {
						sap.m.MessageToast.show("error in fetching signature");
					}
				});
			}
		},
		formatter: Formatter,
		setRandomInvoiceNo: function() {
			var rangeDate = new Date(),
				month = rangeDate.getMonth() + 1,
				year = rangeDate.getFullYear();
			this.oLocalModel.setProperty("/PerformaInvoices/InvoiceNo", "INV-" + year + (month < 10 ? '0' + month : month) + "-" + Math.floor(Math.random() * 1000));
		},
		onBankAccount: function(oEvent) {
			var rangeDate = new Date();
			var month = rangeDate.getMonth() + 1;
			var year = rangeDate.getFullYear();
			var startDate = new Date(year + " " + month);
			this.getView().byId("idDate").setValue(startDate.toDateString().slice(4));
			this.getView().byId("idDueDate").setValue(rangeDate.toDateString().slice(4));
			this.setRandomInvoiceNo();
		},
		onCourseChange: function(oEvent) {
			if (oEvent.getParameter("value").includes('GST Exempt')) {
				this.getView().byId("idGSTType").setSelectedKey("NONE")
			}
		},
		onDeletePerformaInvoice: function(oEvent) {
			var that = this;
			var items = this.getView().byId("idPerformaInvoiceTable").getSelectedContexts();
			if (items.length > 0) {
				items.forEach(function(item) {
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), item.sPath, "DELETE", {}, {}, that)
						.then(function(oData) {
							MessageToast.show("Deleted succesfully");
						}).catch(function(oError) {
							that.getView().setBusy(false);
							that.oPopover = that.getErrorMessage(oError);
							that.getView().setBusy(false);
						});
				});
			} else {
				MessageToast.show("Please select an item");
			}
		},
		onCurrencyLiveChange: function(oEvent) {
			var currency = oEvent.getParameter("value").toUpperCase();
			oEvent.getSource().setValue(currency);
			var accountNo = this.oLocalModel.getProperty("/PerformaInvoices/AccountNo");
			if (currency !== "INR") {
				var amount = this.oLocalModel.getProperty("/PerformaInvoices/Amount");
				var note = "Please make payment using Paypal with the below link-\nhttps://www.paypal.com/paypalme/anubhavstraining/" + amount;
				this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
			} else if (accountNo === "114705500444" && currency === "INR") {
				var note = "Please make payment before the due date in below a/c and share the screenshot with us\n" +
					"Account Number:                  " + accountNo + "\n" +
					"Account Type:                       " + (this.accountDetails.current ? "Current" : "Saving") + "\n" +
					"Account name:                      " + this.accountDetails.accountName + "\n" +
					"IFSC Code:                            " + this.accountDetails.ifsc +
					"\nYou can also pay with barcode scan of UPI https://www.anubhavtrainings.com/upi-payment-gateway";
				this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
				// var address = "EPS-FF-073A, Emerald Plaza,\nGolf Course Extension Road, Sector 65";
				// +",\nCity            Gurgaon\nPinCode           122018.\nState             Haryana\nContact No             +91-8448454549" +
				// "Country             India\nGSTIN:            06AEFFS9740G1ZS";
			} else if (currency === "INR") {
				var note = "Please make payment before the due date in below a/c and share the screenshot with us\n" +
					"Account Number:                  " + accountNo + "\n" +
					"Account Type:                       " + (this.accountDetails.current ? "Current" : "Saving") + "\n" +
					"Account name:                      " + this.accountDetails.accountName + "\n" +
					"IFSC Code:                            " + this.accountDetails.ifsc;
				this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
				// var address = "B-25 Shayona shopping center,\n" + "Near Shayona Party Plot, Chanikyapuri";
				// + ",\nCity -	 Ahemdabad\n" +
				// 	+"PinCode			 380061\n" + "State 		Gujarat\n" + "Contact No       +91-8448454549\n" + "Country        India";
			}
		},
		onAmount: function(oEvent) {
			if (this.oLocalModel.getProperty("/PerformaInvoices/Currency") !== "INR") {
				var note = "Please make payment using Paypal with the below link-\nhttps://www.paypal.com/paypalme/anubhavstraining/" + oEvent.getParameter("value");
				this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
			}
		},
		onSave: function() {
			var that = this;
			var payload = this.getView().getModel("local").getProperty("/PerformaInvoices");
			if (!payload.CompanyName) {
				MessageToast.show("Please Fill All Mandatory Fields");
				return;
			}
			payload.Date = new Date(payload.Date);
			payload.DueDate = new Date(payload.DueDate);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/PerformaInvoices", "POST", {},
					payload, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Saved successfully");
					that.setRandomInvoiceNo();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					MessageBox.error(oError);
				});
		},
		onUpdateFinishedPerforma: function() {
			debugger;
			var oTable = this.getView().byId("idPerformaInvoiceTable");
			var itemList = oTable.getItems();
			var noOfItems = itemList.length;
			for (var i = 0; i < noOfItems; i++) {
				var vUser = itemList[i].getCells()[8].getText();
				var vModel = this.allAppUsers[vUser];
				if (vModel) {
					var userName = vModel.UserName;
					itemList[i].getCells()[8].setText(userName);
				}
			}
		},
		onUpdateFinished: function(oEvent) {
			var sTitle = "Entry found";
			var oTable = this.getView().byId("invoiceTabTable");
			var itemList = oTable.getItems();
			var noOfItems = itemList.length;
			for (var i = 0; i < noOfItems; i++) {
				var vCourse = itemList[i].getCells()[2].getText();
				var oCourseId = 'Courses(\'' + vCourse + '\')';
				var oModel = this.getView().getModel().oData[oCourseId];
				// var oModel = this.getView().getModel().getObject(oCourseId);
				if (oModel) {
					var CourseName = oModel.BatchNo + ': ' + oModel.Name; //got the course anme from screen
					itemList[i].getCells()[2].setText(CourseName);
				}
				var vStudent = itemList[i].getCells()[0].getText();
				var oStudentId = 'Students(\'' + vStudent + '\')';
				debugger;
				var vModel = this.allStudnets[vStudent];
				if (vModel) {
					var StudMail = vModel.GmailId;
					itemList[i].getCells()[0].setText(StudMail);
				}
			}

			if (oTable.getBinding("items").isLengthFinal()) {
				var iCount = oEvent.getParameter("total");
				if ((this.totalCount === 0) || (this.totalCount < iCount)) {
					this.totalCount = iCount;
				}
				var iItems = oTable.getItems().length;
				sTitle += "(" + iItems + "/" + this.totalCount + ")";
			}
			this.getView().byId("titletext").setText(sTitle);
		},
		onPerformaInvoice: function(oEvent) {
			var that = this;
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath,
					"GET", {}, {}, this)
				.then(function(oData) {
					oData.IsGST = false;
					that.DownloadInvoiceForOther(oData, oData.InvoiceNo);
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);

				});
		},
		onDownloadInvoice: function(oEvent) {
			var that = this;
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath,
					"GET", {}, {}, this)
				.then(function(oData) {
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Students('" + oData.StudentId + "')",
							"GET", {}, {}, that)
						.then(function(sData) {
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Courses('" + oData.CourseId + "')",
									"GET", {}, {}, that)
								.then(function(cData) {
									var address = (sData.Address != "null" ? sData.Address + ", " : "") + (sData.City != "null" ? sData.City + ", " : "");
									var patt = new RegExp("haryana", "i");
									var isHaryana = patt.test(address);
									var gstType = "NONE";
									var currency = "INR";
									if (isHaryana || sData.GSTIN === "null") {
										gstType = "SGST"
									} else {
										gstType = "IGST"
									}
									if (oData.PaymentMode === "PAYPAL" || oData.PaymentMode === "PAYU" || oData.PaymentMode === "FOREIGN") {
										gstType = "NONE";
										currency = "USD";
									}
									if (that.getView().byId("idNoGST").getSelected()) {
										gstType = "NONE";
									}
									var oDetail = {
										"Email": sData.GmailId,
										"ParticipentName": sData.Name.replace(" null", ""),
										"ContactNo": sData.ContactNo,
										"GSTIN": sData.GSTIN === "null" ? null : sData.GSTIN,
										"Address": sData.Address === "null" ? null : sData.Address,
										"Country": sData.Country,
										"City": sData.City,
										"CourseName": (oData.Amount < 7000 ? cData.Name + "(Ex.)" : cData.Name),
										"BatchNo": cData.BatchNo,
										"PaymentMode": oData.PaymentMode,
										"InvoiceNo": oData.InvoiceNo,
										"Date": oData.PaymentDate,
										"AccountNo": oData.AccountName,
										"FullAmount": oData.USDAmount ? oData.USDAmount : oData.Amount,
										"USDAmount": oData.USDAmount,
										"Reference": oData.Reference,
										"Currency": currency,
										// "Exchange": oData.Exchange,
										// "Charges": oData.Charges,
										// "SettleDate": oData.SettleDate,
										// "SettleAmount": oData.SettleAmount,
										"Amount": oData.USDAmount ? oData.USDAmount : oData.Amount,
										// "ChartedValid": item.ChartedValid,
										"GSTType": gstType,
									};
									if (oData.InvoiceNo === "null") {
										$.post('/getInvoiceNoInvoiceBuilder', {
												"AccountNo": oData.AccountName,
												"SubcriptionId": oData.id,
												"PaymentDate": oData.PaymentDate
											})
											.done(function(invoiceNo, status) {
												that.DownloadInvoiceForOther(oDetail, invoiceNo);
											})
											.fail(function(xhr, status, error) {
												MessageBox.error("Error in Invoice no.");
											});
									} else {
										that.DownloadInvoiceForOther(oDetail, oData.InvoiceNo);
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);

								});

						}).catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);

						});

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);

				});
		},
		DownloadInvoiceForOther: function(oDetail, invoiceNo) {
			// var country = this.getCountryNameFromCode(oDetail.Country);
			var country = oDetail.Country;
			var billingDate = new Date(oDetail.Date).toDateString().slice(4).split(" ");
			billingDate = billingDate[0] + " " + billingDate[1] + ", " + billingDate[2];
			var dueDate = null;
			if (oDetail.DueDate) {
				dueDate = new Date(oDetail.DueDate).toDateString().slice(4).split(" ");
				dueDate = dueDate[0] + " " + dueDate[1] + ", " + dueDate[2];
			}
			var products = [{
				"Course": oDetail.CourseName,
				"HSN": "999293",
				"Qty": 1,
				"Rate": oDetail.GSTType !== "NONE" ? (parseFloat(oDetail.Amount) * 100 / 118).toFixed(2) : oDetail.Amount,
				"IGST": (oDetail.GSTType !== "NONE" ? 18 : 0),
				"Amount": oDetail.GSTType !== "NONE" ? (parseFloat(oDetail.Amount) * 100 / 118).toFixed(2) : oDetail.Amount
			}];
			const invoiceDetail = {
				shipping: {
					name: oDetail.CompanyName ? oDetail.CompanyName : oDetail.ParticipentName,
					email: oDetail.Email,
					mob: (oDetail.ContactNo ? "+" + oDetail.ContactNo : ""),
					GSTIN: (oDetail.GSTIN !== null ? oDetail.GSTIN : ""),
					address: (oDetail.Address != null ? oDetail.Address + ", " : "") + (oDetail.City != "null" ? oDetail.City + ", " : "") + (oDetail.State ? oDetail.State + ", " : "") + country
				},
				items: products,
				IGST: oDetail.GSTType !== "NONE" ? 18 : 0,
				fullAmount: parseFloat(oDetail.Amount).toFixed(2),
				order_number: invoiceNo,
				paymentMode: oDetail.PaymentMode,
				IsWallet: oDetail.IsWallet,
				header: {
					company_name: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "Soyuz Technologies LLP" : "Anubhav Trainings",
					company_logo: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "data:image/png;base64," + this.logo : "data:image/png;base64," + this.AnubhavTrainingslogo,
					signature: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "data:image/png;base64," + this.soyuz_signature : "data:image/png;base64," + this.anubhav_signature,
					// hear \\ is used to change line
					company_address: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "EPS-FF-073A, Emerald Plaza,\\Golf Course Extension Road,\\Sector 65, Gurgaon,\\Haryana-122102" : "B-25 Shayona shopping center,\\Near Shayona Party Plot,\\Chanikyapuri, Ahemdabad\\Pin - 380061",
					GSTIN: (oDetail.GSTType !== "NONE" ? "06AEFFS9740G1ZS" : "")
				},
				footer: {
					text: "This is a computer generated invoice"
				},
				currency_symbol: oDetail.Currency,
				date: {
					billing_date: billingDate,
					due_date: dueDate ? dueDate : ""
				}
			};

			let header = (doc, invoice) => {

				if (this.logo) {
					doc.image(invoice.header.company_logo, 50, 45, {
							width: 50
						})
						.fontSize(20)
						.text(invoice.header.company_name, 110, 57)
						.fontSize(10);
					if (oDetail.GSTType !== "NONE" && (oDetail.AccountNo === "114705500444")) {
						doc.text("GSTIN: " + invoice.header.GSTIN, 112, 87);
					}
					doc.moveDown();
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
					.fontSize(20);
				if (oDetail.Notes) {
					doc.text("Performa Invoice", 50, 160);
				} else {
					doc.text("Invoice", 50, 160);
				}

				generateHr(doc, 185);

				const customerInformationTop = 200;

				doc.fontSize(10)
					.text("Name:", 50, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.shipping.name, 150, customerInformationTop)
					.font("Helvetica")
					.text("E-mail:", 50, customerInformationTop + 15)
					.text(invoice.shipping.email, 150, customerInformationTop + 15);
				// if (oDetail.GSTType !== "NONE") {
				doc.text("GSTIN:", 50, customerInformationTop + 45 - 15)
					.text(invoice.shipping.GSTIN, 150, customerInformationTop + 45 - 15);
				// }
				doc.fontSize(10)
					.text("Address:", 50, customerInformationTop + 60 - 15)
					.text(invoice.shipping.address, 150, customerInformationTop + 60 - 15)

					.text("Invoice Number:", 350, customerInformationTop)
					.font("Helvetica-Bold")
					.text(invoice.order_number, 450, customerInformationTop)
					.font("Helvetica")
					.text("Invoice Date:", 350, customerInformationTop + 15)
					.text(invoice.date.billing_date, 450, customerInformationTop + 15)
					.text("Due Date:", 350, customerInformationTop + 30)
					.text(invoice.date.due_date, 450, customerInformationTop + 30)
					.moveDown();

				generateHr(doc, 280);
			}

			let invoiceTable = (doc, invoice) => {
				let i;
				const invoiceTableTop = 300;
				const currencySymbol = invoice.currency_symbol;
				doc.font("Helvetica-Bold");
				if (oDetail.GSTType === "SGST") {
					tableRowSGST(
						doc,
						invoiceTableTop,
						"Description",
						"Rate",
						"SGST",
						"CGST",
						"Amount"
					);
				} else {
					tableRowIGST(
						doc,
						invoiceTableTop,
						"Description",
						"Rate",
						"IGST",
						"Amount"
					);
				}
				generateHr(doc, invoiceTableTop + 20);
				doc.font("Helvetica");
				var totalAmount = 0;
				var totalGST = 0;
				for (i = 0; i < invoice.items.length; i++) {
					const item = invoice.items[i];
					const position = invoiceTableTop + (i + 1) * 30;
					if (oDetail.GSTType === "SGST") {
						item.SGST = item.IGST / 2;
						item.CGST = item.IGST / 2;
						tableRowSGST(
							doc,
							position,
							item.Course + (oDetail.GSTType !== "NONE" ? "\nHSN/SAC: " + item.HSN : ""),
							item.Rate,
							item.SGST,
							item.CGST,
							item.Amount
						);
					} else {
						tableRowIGST(
							doc,
							position,
							item.Course + "\nHSN/SAC: " + item.HSN,
							item.Rate,
							item.IGST,
							item.Amount
						);
					}
					totalAmount += parseFloat(item.Amount);
					generateHr(doc, position + 28);
				}
				if (oDetail.GSTType === "SGST") {
					const subtotalPosition = invoiceTableTop + (i + 1) * 35;
					doc.font("Helvetica-Bold");
					totalTable(
						doc,
						subtotalPosition,
						"Sub Total:",
						formatCurrency(totalAmount.toFixed(2))
					);
					const sgstPosition = subtotalPosition + 20;
					doc.font("Helvetica-Bold");
					totalTable(
						doc,
						sgstPosition,
						"SGST:",
						formatCurrency(oDetail.GSTType !== "NONE" ? (totalAmount * 0.09).toFixed(2) : 0)
					);
					const cgstPosition = sgstPosition + 20;
					doc.font("Helvetica-Bold");
					totalTable(
						doc,
						cgstPosition,
						"CGST:",
						formatCurrency(oDetail.GSTType !== "NONE" ? (totalAmount * 0.09).toFixed(2) : 0)
					);
					var paidToDatePosition = cgstPosition + 20;
					doc.font("Helvetica-Bold");
					totalTable(
						doc,
						paidToDatePosition,
						"Total (" + oDetail.Currency + "):",
						formatCurrency(invoice.fullAmount)
					);
				} else {
					const subtotalPosition = invoiceTableTop + (i + 1) * 35;
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
						formatCurrency(oDetail.GSTType !== "NONE" ? (totalAmount * 0.18).toFixed(2) : 0)
					);
					var paidToDatePosition = igstPosition + 20;
					doc.font("Helvetica-Bold");
					totalTable(
						doc,
						paidToDatePosition,
						"Total (" + oDetail.Currency + "):",
						formatCurrency(invoice.fullAmount)
					);
				}
				let amountInWordsPosition = paidToDatePosition;
				generateHr(doc, amountInWordsPosition + 20);
				doc.font("Helvetica-Bold")
					.text("Amount in Words:", 50, amountInWordsPosition + 30)
					.text(this.formatter.convertNumberToWords(invoice.fullAmount) + " only", 150, amountInWordsPosition + 30)
				generateHr(doc, amountInWordsPosition + 50);
				if (oDetail.Notes) {
					doc.font("Helvetica-Bold")
						.text("Notes: ", 50, amountInWordsPosition + 75)
						.font("Helvetica")
						.text(oDetail.Notes, 50, amountInWordsPosition + 90)
						.font("Helvetica-Bold")
						.text("Remarks: ", 50, amountInWordsPosition + 165)
						.font("Helvetica")
						.text(oDetail.CourseName + "Training fee for " + oDetail.Email + ". Please note that the actual invoice will be generated after payment.", 50, amountInWordsPosition + 180)
						.font("Helvetica-Bold")
						.text("Terms: ", 50, amountInWordsPosition + 215)
						.font("Helvetica")
						.text(oDetail.Terms ? oDetail.Terms : "", 50, amountInWordsPosition + 230);
				}
				if ((!oDetail.Notes) && oDetail.Reference !== "null") {
					doc.font("Helvetica-Bold")
						.text("Remarks: ", 50, amountInWordsPosition + 215)
						.font("Helvetica")
						.text("Thanks for making payment on" + invoice.date.billing_date + "with reference no " + (oDetail.Reference !== "null" ? oDetail.Reference : ""), 50, amountInWordsPosition + 230);
				}

				const signaturePosition = amountInWordsPosition + 205;
				if (oDetail.AccountNo === "114705500444") {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.image(invoice.header.signature, 440, signaturePosition + 20, {
							height: 50,
							width: 110
						})
						.text("Designated Partner", 440, signaturePosition + 80)
						.moveDown();
				} else {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.image(invoice.header.signature, 420, signaturePosition + 20, {
							height: 80,
							width: 155
						})
						.text("Designated Partner", 440, signaturePosition + 105)
						.moveDown();
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

			let tableRowIGST = (
				doc,
				y,
				desc,
				rate,
				igst,
				amount
			) => {
				doc
					.fontSize(10)
					.text(desc, 50, y)
					.text(rate, 300, y, {
						width: 90,
						align: "right"
					})
					.text(igst + "%", 380, y, {
						width: 90,
						align: "right"
					})
					.text(amount, 0, y, {
						align: "right"
					});
			}

			let tableRowSGST = (
				doc,
				y,
				desc,
				rate,
				sgst,
				cgst,
				amount
			) => {
				doc
					.fontSize(10)
					.text(desc, 50, y)
					.text(rate, 260, y, {
						width: 90,
						align: "right"
					})
					.text(sgst + "%", 320, y, {
						width: 90,
						align: "right"
					})
					.text(cgst + "%", 380, y, {
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
					downloadLink.download = invoiceNo + "_" + oDetail.Country + "_" + invoice.shipping.name;
					downloadLink.click();
				});
			}
			niceInvoice(invoiceDetail);
		},
		onSelect: function(oEvent) {
			this.sId = oEvent.getSource().getId();
			debugger;
			var sTitle = "",
				sPath = "";

			if (this.sId.indexOf("accountDetails") !== -1) {
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
			} else if ((this.sId.indexOf("idbatchId") !== -1) || (this.sId.indexOf("idCourse_upd") !== -1) ||
				(this.sId.indexOf("idCourseSearch") !== -1)) {
				var oBatchFilter = new Filter("hidden", FilterOperator.EQ, false);
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("batch");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Courses",
					filters: [oBatchFilter],
					template: new sap.m.DisplayListItem({
						label: "{Name}",
						value: "{BatchNo}"
					})
				});
				//this.searchPopup.attachConfirm(this.BatchPopupClose).bind(this);
				// var aFilters = [];
				// aFilters.push(new Filter("Hidden", FilterOperator.EQ, false));
				// var oBinding = this.searchPopup.getBinding("items").filter(aFilters);
			} else if (this.sId.indexOf("idStuSearch") !== -1) {
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Students",
					template: new sap.m.DisplayListItem({
						label: "{Name}",
						value: "{GmailId}"
					})
				});
			} else if (this.sId.indexOf("idEmailCust1") !== -1) {
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Inquries",
					template: new sap.m.DisplayListItem({
						label: "{EmailId}",
						value: "{FirstName}"
					})
				});
			}

		},
		onConfirm: function(oEvent) {
			if (this.sId.indexOf("accountDetails") !== -1) {
				var accountNo = oEvent.getParameter("selectedItem").getValue();
				this.accountDetails = this.oLocalModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath());
				this.oLocalModel.setProperty("/PerformaInvoices/AccountNo", accountNo);
				var currency = this.oLocalModel.getProperty("/PerformaInvoices/Currency");
				if (accountNo === "114705500444" && currency === "INR") {
					var note = "Please make payment before the due date in below a/c and share the screenshot with us\n" +
						"Account Number:                  " + accountNo + "\n" +
						"Account Type:                       " + (this.accountDetails.current ? "Current" : "Saving") + "\n" +
						"Account name:                      " + this.accountDetails.accountName + "\n" +
						"IFSC Code:                            " + this.accountDetails.ifsc +
						"\nYou can also pay with barcode scan of UPI https://www.anubhavtrainings.com/upi-payment-gateway";
					this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
					// var address = "EPS-FF-073A, Emerald Plaza,\nGolf Course Extension Road, Sector 65";
					// +",\nCity            Gurgaon\nPinCode           122018.\nState             Haryana\nContact No             +91-8448454549" +
					// "Country             India\nGSTIN:            06AEFFS9740G1ZS";
				} else if (currency === "INR") {
					var note = "Please make payment before the due date in below a/c and share the screenshot with us\n" +
						"Account Number:                  " + accountNo + "\n" +
						"Account Type:                       " + (this.accountDetails.current ? "Current" : "Saving") + "\n" +
						"Account name:                      " + this.accountDetails.accountName + "\n" +
						"IFSC Code:                            " + this.accountDetails.ifsc;
					this.oLocalModel.setProperty("/PerformaInvoices/Notes", note);
					// var address = "B-25 Shayona shopping center,\n" + "Near Shayona Party Plot, Chanikyapuri";
					// + ",\nCity -	 Ahemdabad\n" +
					// 	+"PinCode			 380061\n" + "State 		Gujarat\n" + "Contact No       +91-8448454549\n" + "Country        India";
				}
			} else if (this.sId.indexOf("idCourseSearch") !== -1) {
				var data = this.getSelectedKey(oEvent);
				this.SearchCourseGuid = data[2];
				this.getView().byId("idCourseSearch").setValue(data[0] + ': ' + data[1]);
				// debugger;
			} else if (this.sId.indexOf("idStuSearch") !== -1) {
				// debugger;
				var data = this.getSelectedKey(oEvent);
				this.SearchStuGuid = data[2];
				this.getView().byId("idStuSearch").setValue(data[0]);
			} else if (this.sId.indexOf("idEmailCust1") !== -1) {
				var data = this.getSelectedKey(oEvent);
				this.getView().byId("idEmailCust1").setValue(data[1]);
				if (true) {
					var that = this;
					var payload = {};
					var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", data[1]);
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
							filters: [Filter1]
						}, payload, this)
						.then(function(oData) {
							debugger;
							if (oData.results.length != 0) {
								that.oLocalModel.setProperty("/PerformaInvoices", {
									"InvoiceNo": "INV-YYYYMM-DD",
									"CompanyName": oData.results[0].Company === "null" ? null : oData.results[0].Company,
									"ParticipentName": oData.results[0].Name,
									"CourseName": null,
									"Amount": 0,
									"GSTType": oData.results[0].GSTCharge ? "IGST" : "NONE",
									"Date": null,
									"DueDate": null,
									"Address": oData.results[0].Address === "null" ? null : oData.results[0].Address,
									"City": oData.results[0].City === "null" ? null : oData.results[0].City,
									"Country": oData.results[0].Country,
									"Currency": "INR",
									"GSTIN": oData.results[0].GSTIN === "null" ? null : oData.results[0].GSTIN,
									"Notes": null,
									"Terms": null,
									"AccountNo": null,
									"Email": null
								})
							}
						}).catch(function(oError) {
							//
						});
				}
			}
		},
		// onSearch: function(oEvent) {
		// 	if (this.sId.indexOf("idStuSearch") !== -1) {
		// 		var queryString = this.getQuery(oEvent);
		//
		// 		if (queryString) {
		// 			var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
		// 			var oFilter2 = new sap.ui.model.Filter("GmailId", sap.ui.model.FilterOperator.Contains, queryString);
		//
		// 			var oFilter = new sap.ui.model.Filter({
		// 				filters: [oFilter1, oFilter2],
		// 				and: false
		// 			});
		// 			var aFilter = [oFilter];
		// 			this.searchPopup.getBinding("items").filter(aFilter);
		// 		} else {
		// 			this.searchPopup.bindAggregation("items", {
		// 				path: "/Students",
		// 				template: new sap.m.DisplayListItem({
		// 					label: "{Name}",
		// 					value: "{GmailId}"
		// 				})
		// 			});
		// 			this.searchPopup.getBinding("items").filter([]);
		// 		}
		//
		// 	} else if (this.sId.indexOf("idCourseSearch") !== -1) {
		// 		var queryString = this.getQuery(oEvent);
		//
		// 		if (queryString) {
		// 			var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
		// 			var oFilter2 = new sap.ui.model.Filter("BatchNo", sap.ui.model.FilterOperator.Contains, queryString);
		//
		// 			var oFilter = new sap.ui.model.Filter({
		// 				filters: [oFilter1, oFilter2],
		// 				and: false
		// 			});
		// 			var aFilter = [oFilter];
		// 			this.searchPopup.getBinding("items").filter(aFilter);
		// 		} else {
		// 			this.searchPopup.bindAggregation("items", {
		// 				path: "/Courses",
		// 				template: new sap.m.DisplayListItem({
		// 					label: "{Name}",
		// 					value: "{BatchNo}"
		// 				})
		// 			});
		// 			this.searchPopup.getBinding("items").filter([]);
		// 		}
		// 	}
		// },
		onLiveSearch: function(oEvent) {

			var queryString = oEvent.getParameter("query");
			if (!queryString) {
				queryString = oEvent.getParameter("value");
			}

			if (this.sId.indexOf("idStuSearch") !== -1) {
				if (queryString) {

					var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("GmailId", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});

					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);

				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Students",
						template: new sap.m.DisplayListItem({
							label: "{Name}",
							value: "{GmailId}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}
			} else if (this.sId.indexOf("idCourseSearch") !== -1) {

				if (queryString) {
					var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("BatchNo", sap.ui.model.FilterOperator.Contains, queryString);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});
					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);
				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Courses",
						template: new sap.m.DisplayListItem({
							label: "{Name}",
							value: "{BatchNo}"
						})
						// template: new sap.m.StandardListItem({
						// 	title: "{Name}",
						// 	description: "{BatchNo}",
						// 	info: "{id}"
						// })
					});
					this.searchPopup.getBinding("items").filter([]);
				}

			} else if (this.sId.indexOf("accountDetails") !== -1) {
				if (queryString) {
					var oFilter1 = new sap.ui.model.Filter("value", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("key", sap.ui.model.FilterOperator.Contains, queryString);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});
					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);
				} else {
					this.searchPopup.bindAggregation("items", {
						path: "local>/accountSet",
						template: new sap.m.DisplayListItem({
							label: "{local>value}",
							value: "{local>key}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}

			} else if (this.sId.indexOf("idEmailCust") !== -1) {

				// "{EmailId}",
				// "{FirstName}"
				if (queryString) {

					var oFilter1 = new sap.ui.model.Filter("EmailId", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("FirstName", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});

					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);

				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Inquries",
						template: new sap.m.DisplayListItem({
							label: "{EmailId}",
							value: "{FirstName}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}
			}
		},
		onSearchManageSubs: function(oEvent) {
			var that = this;
			var aFilter = [];
			var queryString = this.oLocalModel.getProperty("/InvoiceBuilder/StudentId");
			var accountNo = this.oLocalModel.getProperty("/PerformaInvoices/AccountNo");
			var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (regEx.test(queryString) && (!that.SearchStuGuid)) {
				var payload = {};
				var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", queryString);

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
						filters: [Filter1]
					}, payload, this)
					.then(function(oData) {
						// var that2 = that;
						// debugger;
						// var aFilter = [new sap.ui.model.Filter("StudentId", "EQ", "'" + oData.results[0].id + "'")];
						// that.SearchStuGuid = oData.results[0].id;
						aFilter.push(new sap.ui.model.Filter("StudentId", "EQ", "'" + oData.results[0].id + "'"));
						if (that.SearchCourseGuid) {
							aFilter.push(new sap.ui.model.Filter("CourseId", "EQ", "'" + that.SearchCourseGuid + "'"));
						}
						if (accountNo) {
							aFilter.push(new sap.ui.model.Filter("AccountName", "EQ", accountNo));
						}
						var dateString = that.getView().byId("idPaymentdate");
						if (dateString._lastValue != false) {
							var from = dateString._lastValue.split(".");
							var startDate = new Date(from[2], from[1] - 1, from[0]);
							startDate.setHours(0, 0, 0, 0);
							var from = dateString._lastValue.split(".");
							var endDate = new Date(from[2], from[1] - 1, from[0]);
							endDate.setHours(23, 59, 59, 999);
							var oFilter_startDate = new sap.ui.model.Filter("PaymentDate", "GE", startDate);
							var oFilter_endDate = new sap.ui.model.Filter("PaymentDate", "LE", endDate);
						} else {
							var oFilter_date = new sap.ui.model.Filter();
						}

						if (dateString._lastValue != false) {
							aFilter.push(new sap.ui.model.Filter([oFilter_startDate, oFilter_endDate], true));
						}
						that.getView().byId("invoiceTabTable").getBinding("items").filter(aFilter);
					}).catch(function(oError) {
						debugger;
					});
			} else {
				if (that.SearchStuGuid) {
					aFilter.push(new sap.ui.model.Filter("StudentId", "EQ", "'" + that.SearchStuGuid + "'"));
				}
				if (that.SearchCourseGuid) {
					aFilter.push(new sap.ui.model.Filter("CourseId", "EQ", "'" + that.SearchCourseGuid + "'"));
				}
				if (accountNo) {
					aFilter.push(new sap.ui.model.Filter("AccountName", "EQ", accountNo));
				}
				var dateString = that.getView().byId("idPaymentdate");
				if (dateString._lastValue != false) {
					var from = dateString._lastValue.split(".");
					var startDate = new Date(from[2], from[1] - 1, from[0]);
					startDate.setHours(0, 0, 0, 0);
					var from = dateString._lastValue.split(".");
					var endDate = new Date(from[2], from[1] - 1, from[0]);
					endDate.setHours(23, 59, 59, 999);
					var oFilter_startDate = new sap.ui.model.Filter("PaymentDate", "GE", startDate);
					var oFilter_endDate = new sap.ui.model.Filter("PaymentDate", "LE", endDate);
				} else {
					var oFilter_date = new sap.ui.model.Filter();
				}

				if (dateString._lastValue != false) {
					aFilter.push(new sap.ui.model.Filter([oFilter_startDate, oFilter_endDate], true));
				}
				that.getView().byId("invoiceTabTable").getBinding("items").filter(aFilter);
			}
		},
		onClearSearchFilter: function(oEvent) {
			var aFilter = [];
			this.SearchCourseGuid = null;
			this.SearchStuGuid = null;
			this.getView().byId("idPaymentdate").setValue(null);
			this.getView().byId("idStuSearch").setValue(null);
			this.getView().byId("idCourseSearch").setValue(null);
			this.getView().byId("invoiceTabTable").getBinding("items").filter(aFilter);
		},
		onFullScreen: function(oEvent) {
			var oMode = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getMode();
			if (oMode === "ShowHideMode") {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("HideMode");
				oEvent.getSource().setIcon("sap-icon://exit-full-screen");
				oEvent.getSource().setText("Hide Fullscreen");
			} else {
				oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().setMode("ShowHideMode");
				oEvent.getSource().setIcon("sap-icon://full-screen");
				oEvent.getSource().setText("Show Fullscreen");
			}
		},
	});

});
