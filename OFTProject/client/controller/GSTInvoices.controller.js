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
		onSearch : function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter = [
				new Filter("accountNo", FilterOperator.Contains, sValue),
				new Filter("accountName", FilterOperator.Contains, sValue)
			];
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter(new Filter(oFilter,false));
		},
		onConfirm: function(oEvent) {

			if (this.sId.indexOf("accountDetails") !== -1) {

				var accountNo = oEvent.getParameter("selectedItem").getValue();

				this.getView().getModel("local").setProperty("/GSTInvoices/AccountNo", accountNo);
				var startDate = this.getView().byId("idRegDate").getValue();
				var endDate = this.getView().byId("idRegDateTo").getValue();
				this.super(accountNo, startDate, endDate);
				// var oFilter = new sap.ui.model.Filter("AccountNo", "EQ", bankName);
				// this.getView().byId("idSummary").getBinding("items").filter(oFilter);
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
		payMode : "ALL",
		onPayModeSelect : function(oEvent){
			this.payMode = oEvent.getSource().getSelectedItem().getKey();
			this.onStartDate();
		},
		// onReference : function(oEvent){
		// 	var oCtx = oEvent.getSource().getParent().getBindingContextPath(),
		// 	oControl = oEvent.getSource();
		// 	var oSub = oEvent.getSource().getParent().getModel("viewModel").getProperty(oCtx);
		// // create popover
		// 	if (!this._oPopover) {
		// 		Fragment.load({
		// 			id: "paypalReference",
		// 			name: "oft.fiori.fragments.Popover",
		// 			controller: this
		// 		}).then(function (oPopover) {
		// 			this._oPopover = oPopover;
		// 			this.getView().addDependent(this._oPopover);
		// 			this._oPopover.attachAfterOpen(function() {
		// 				this.disablePointerEvents();
		// 			}, this);
		// 			this._oPopover.attachAfterClose(function() {
		// 				this.enablePointerEvents();
		// 			}, this);
		//
		// 			this._oPopover.bindElement(oCtx.getPath());
		// 			this._oPopover.openBy(oControl);
		// 		}.bind(this));
		// 	} else {
		// 		this._oPopover.bindElement(oCtx.getPath());
		// 		this._oPopover.openBy(oControl);
		// 	}
		// },
		onEditInfo: function(oEvent) {
			var that = this;
			var oSub = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			var id = oSub.id;
			var userId = that.getView().getModel("local").getProperty("/CurrentUser");
			var amount = oSub.FullAmount;
			var oAmountDialog = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Modify : "+oSub.Email,
				contentWidth : "450px",
				content: [
					new sap.m.Label({
								text: "Amount: "
							}),
					new sap.m.Input("idAmount",{
						type: "Number",
						value : amount
					}),
					new sap.m.Label({
								text: "Paypal Amount: "
							}),
					new sap.m.Input("idUSDAmount",{
						type: "Number",
						value : oSub.USDAmount,
						enabled : (oSub.PaymentMode!="PAYPAL" ? false : true)
					}),
					new sap.m.Label({
								text: "Currency Code: "
							}),
					new sap.m.Input("idCurrencyCode",{
						value : oSub.CurrencyCode,
						enabled : (oSub.PaymentMode!="PAYPAL" ? false : true)
					}),
					new sap.m.Label({
								text: "Charges: "
							}),
					new sap.m.Input("idCharges",{
						type: "Number",
						value : oSub.Charges,
						enabled : (oSub.PaymentMode!="PAYPAL" ? false : true)
					}),
					new sap.m.Label({
								text: "Exchange: ",
								required : (oSub.PaymentMode!="PAYPAL" ? false : true),
							}),
					new sap.m.Input("idExchange",{
						type: "Number",
						value : oSub.Exchange,
						enabled : (oSub.PaymentMode!="PAYPAL" ? false : true),
						liveChange : (oEvent)=>{
							var newAmount = Core.byId("idUSDAmount").getValue()-Core.byId("idCharges").getValue();
							Core.byId("idSettleAmount").setValue((newAmount*oEvent.getParameter("value")).toFixed(2));
						}
					}),
					new sap.m.Label({
								text: "Settle Amount: "
							}),
					new sap.m.Input("idSettleAmount",{
						type: "Number",
						value : oSub.SettleAmount,
						enabled : false//(oSub.PaymentMode!="PAYPAL" ? false : true)
					}),
					new sap.m.Label({
								text: "Settle Date: "
							}),
					new sap.m.DatePicker("idSettleDate",{
						displayFormat : "dd.MM.yyyy",
						valueFormat : "MMM dd yyyy",
						value : oSub.SettleDate,
						enabled : (oSub.PaymentMode!="PAYPAL" ? false : true)
					}),
					new sap.m.Label({
								text: "Reference: "
							}),
					new sap.m.Input("idReference",{
						value : oSub.Reference
					}),
					new sap.m.CheckBox("idConfirm",{
						text : "Confirm",
						select : function(oEvent){
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
						var charges = Core.byId("idCharges").getValue();
						var settleDate = Core.byId("idSettleDate").getValue();
						var settleAmount = Core.byId("idSettleAmount").getValue();
						var reference = Core.byId("idReference").getValue();
						var payload = {};
						if(oSub.PaymentMode==="PAYPAL"){
							payload = {
									"id": id,
									"Amount": sAmount,
									"USDAmount" : usdAmount,
									"CurrencyCode" : currencyCode,
									"Exchange" : exchange,
									"Charges" : charges,
									"SettleDate" : settleDate,
									"SettleAmount" : settleAmount,
									"Reference" : reference,
									"ChangedBy" : userId
								}
						}else{
							payload = {
									"id": id,
									"Amount": sAmount,
									"Reference" : reference,
									"ChangedBy" : userId
								}
						}
						if (sAmount <= 50000) {
							$.post('/updateSubcriptionAmount', payload)
								.done(function(data, status) {
									MessageBox.success("Update "+data);
									that.destroyEditItems();
									that.onStartDate();
								})
								.fail(function(xhr, status, error) {
									that.destroyEditItems();
									MessageBox.error("Error in access");
								});
								oAmountDialog.close();
						} else {
							sap.m.MessageBox.error("No Subcription is greater than 50,000");
						}
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function() {
						that.destroyEditItems();
						oAmountDialog.close();
					}.bind(this)
				})
			});
			oAmountDialog.open();
		},
		destroyEditItems : function(){
			Core.byId("idAmount").destroy();
			Core.byId("idUSDAmount").destroy();
			Core.byId("idCurrencyCode").destroy();
			Core.byId("idExchange").destroy();
			Core.byId("idCharges").destroy();
			Core.byId("idSettleDate").destroy();
			Core.byId("idSettleAmount").destroy();
			Core.byId("idReference").destroy();
			Core.byId("idConfirm").destroy();
		},
		getCountryNameFromCode: function(code){
			var countryWithCode = this.getView().getModel("local").getProperty("/countries");
			var name = "";
			countryWithCode.forEach((item)=>{
				if(item.code===code){
					name = item.name
					return;
				}
			});
			return (name?name:code);
		},
		onDownloadInvoice : function(oEvent){
			var that = this;
			var oDetail = oEvent.getSource().getParent().getModel("viewModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			var userId = this.getView().getModel("local").getProperty("/CurrentUser");
			if(!oDetail.InvoiceNo.startsWith("INV-")){
				$.post('/getInvoiceNo', {
					"SubcriptionId" : oDetail.id,
					"PaymentDate" : oDetail.PaymentDate,
					"UserId" : userId
					})
					.done(function(invoiceNo, status) {
							that.DownloadInvoice(oDetail,invoiceNo);
						that.onStartDate();
					})
					.fail(function(xhr, status, error) {
						MessageBox.error("Error in Invoice no.");
					});
			}else{
					that.DownloadInvoice(oDetail,oDetail.InvoiceNo);
			}
		},
	 DownloadInvoice: function(oDetail,invoiceNo) {
			var country = this.getCountryNameFromCode(oDetail.Country);
			var billingDate = new Date(oDetail.PaymentDate).toDateString().slice(4).split(" ");
			billingDate = billingDate[0]+" "+ billingDate[1]+", "+billingDate[2];

			var products = [{
				"Course": oDetail.CourseName,
				"Batch": oDetail.BatchNo,
				"HSN": "999293",
				"Qty": 1,
				"Rate": oDetail.Amount,
				"CGST": (oDetail.IsGST ? "9%":"0%"),
				"SGST": (oDetail.IsGST ? "9%":"0%"),
				"Amount": oDetail.Amount
			}];
			const invoiceDetail = {
				shipping: {
					name: oDetail.Name,
					email : oDetail.Email,
					mob : (oDetail.ContactNo ? "+"+oDetail.ContactNo:""),
					GSTIN : (oDetail.GSTIN !="null" ? oDetail.GSTIN : ""),
					address:  (oDetail.Address!="null" ? oDetail.Address + ", " : "")+(oDetail.City !="null" ? oDetail.City + ", ":"") + country
				},
				items: products,
				CGST: oDetail.CGST,
				SGST: oDetail.SGST,
				fullAmount: (oDetail.PaymentMode==="PAYPAL" ? oDetail.SettleAmount : oDetail.FullAmount),
				usdAmount : oDetail.USDAmount,
				order_number: invoiceNo,
				paymentMode : oDetail.PaymentMode,
				header: {
					company_name: "Soyuz Technologies LLP",
					company_logo: "data:image/png;base64,"+this.logo,
					signature : "data:image/png;base64,"+this.signature,
					// hear \\ is used to change line
					company_address: "EPS-FF-073A, Emerald Plaza,\\Golf Course Extension Road,\\Sector 65, Gurgaon,\\Haryana-122102",
					GSTIN : (oDetail.IsGST ? "06AEFFS9740G1ZS" : "")
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
            .text("GSTIN: "+invoice.header.GSTIN, 112, 87)
						.moveDown();
				} else {
					doc.fontSize(20)
						.text(invoice.header.company_name, 50, 45)
            .fontSize(10)
            .text("GSTIN: "+invoice.header.GSTIN, 50, 75)
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
				.text(this.formatter.convertNumberToWords(invoice.fullAmount) +" only", 150, amountInWordsPosition + 30)
				generateHr(doc, amountInWordsPosition + 50);

				if(invoice.paymentMode==="PAYPAL"){
					doc.font("Helvetica-Bold")
					.text("Paypal Exchange", 50, amountInWordsPosition + 80)
					amountInWordsPosition+=10
					doc.font("Helvetica")
					.text("---------------------------------------------------", 50, amountInWordsPosition + 78)
					.text("|\n|\n|\n|\n|\n|\n|\n|\n|\n|\n|", 50, amountInWordsPosition + 82)
					.text("|\n|\n|\n|\n|\n|\n|\n|\n|\n|\n|", 115, amountInWordsPosition + 82,{
						width: 105,
						align: "right"
					})
					.text("---------------------------------------------------", 50, amountInWordsPosition + 201)
					.text("Amount:", 60, amountInWordsPosition + 100)
					.text(formatCurrency(invoice.usdAmount)+" "+oDetail.CurrencyCode, 115, amountInWordsPosition + 100,{
						width: 90,
						align: "right"
					})
					.text("Fee:", 60, amountInWordsPosition + 120)
					.text("-"+formatCurrency(oDetail.Charges)+" "+oDetail.CurrencyCode, 115, amountInWordsPosition + 120,{
						width: 90,
						align: "right"
					})
					.text("------------------", 120, amountInWordsPosition + 132,{
						width: 90,
						align: "right"
					})
					.text("Sub Total:", 60, amountInWordsPosition + 145)
					.text(formatCurrency(oDetail.USDAmount-oDetail.Charges)+" "+oDetail.CurrencyCode, 115, amountInWordsPosition + 145,{
						width: 90,
						align: "right"
					})
					.text("Ex. Rate:", 60, amountInWordsPosition + 165)
					.text(formatCurrency(oDetail.Exchange)+" INR", 115, amountInWordsPosition + 165,{
						width: 90,
						align: "right"
					})
					.text("Total Amount:", 60, amountInWordsPosition + 185)
					.text(formatCurrency(oDetail.SettleAmount)+" INR", 115, amountInWordsPosition + 185,{
						width: 90,
						align: "right"
					})
				}
				const signaturePosition = amountInWordsPosition+200;
				if (this.signature) {
					doc.text(invoice.header.company_name, 430, signaturePosition)
					.image(invoice.header.signature, 440, signaturePosition+20, {
						height : 50,
						width : 110
						})
						.text("Designated Partner", 440, signaturePosition+80)
						.moveDown();
				} else {
					doc.text(invoice.header.company_name, 430, signaturePosition)
						.text("Designated Partner", 440, signaturePosition+80)
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

			let formatCurrency = (value, symbol="") => {
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
					downloadLink.download = invoiceNo+"_"+oDetail.Country+"_"+oDetail.Name;
					downloadLink.click();
				});
			}
			niceInvoice(invoiceDetail);
		},

		// DownloadPaypalInvoice: function(oDetail,invoiceNo) {
		// 	var country = this.getCountryNameFromCode(oDetail.Country);
		// 	var billingDate = new Date(oDetail.PaymentDate).toDateString().slice(4).split(" ");
		// 	billingDate = billingDate[0]+" "+ billingDate[1]+", "+billingDate[2];
		// 	var products = [{
		// 		"Course": oDetail.CourseName,
		// 		"Batch": oDetail.BatchNo,
		// 		"PaypalAmount": oDetail.USDAmount +" "+ oDetail.CurrencyCode,
		// 		"Fee": oDetail.Charges,
		// 		"Amount": oDetail.Amount
		// 	}];
		// 	const invoiceDetail = {
		// 		shipping: {
		// 			name: oDetail.Name,
		// 			email : oDetail.Email,
		// 			mob : (oDetail.ContactNo ? oDetail.ContactNo:""),
		// 			GSTIN : (oDetail.GSTIN !="null" ? oDetail.GSTIN : ""),
		// 			address:  (oDetail.Address!="null" ? oDetail.Address + ", " : "")+(oDetail.City !="null" ? oDetail.City + ", ":"") + country
		// 		},
		// 		items: products,
		// 		fee: oDetail.Charges,
		// 		fullAmount: oDetail.SettleAmount,
		// 		order_number: invoiceNo,
		// 		paymentMode : oDetail.PaymentMode,
		// 		header: {
		// 			company_name: "Soyuz Technologies LLP",
		// 			company_logo: "data:image/png;base64,"+this.logo,
		// 			signature : "data:image/png;base64,"+this.signature,
		// 			signature : "data:image/png;base64,"+this.signature,
		// 			// hear \\ is used to change line
		// 			company_address: "EPS-FF-073A, Emerald Plaza,\\Golf Course Extension Road,\\Sector 65, Gurgaon,\\Haryana-122102",
		// 			GSTIN : "06AEFFS9740G1ZS"
		// 		},
		// 		footer: {
		// 			text: "This Invoice is digitally signed, can be considered as true copy"
		// 		},
		// 		currency_symbol: " INR",
		// 		date: {
		// 			billing_date: billingDate
		// 		}
		// 	};
		//
		// 	let header = (doc, invoice) => {
		//
		// 		if (this.logo) {
		// 			doc.image(invoice.header.company_logo, 50, 45, {
		// 					width: 50
		// 				})
		// 				.fontSize(20)
		// 				.text(invoice.header.company_name, 110, 57)
		// 				.fontSize(10)
    //         .text("GSTIN: "+invoice.header.GSTIN, 112, 87)
		// 				.moveDown();
		// 		} else {
		// 			doc.fontSize(20)
		// 				.text(invoice.header.company_name, 50, 45)
    //         .fontSize(10)
    //         .text("GSTIN: "+invoice.header.GSTIN, 50, 75)
		// 				.moveDown()
		// 		}
		//
		// 		if (invoice.header.company_address.length !== 0) {
		// 			companyAddress(doc, invoice.header.company_address);
		// 		}
		//
		// 	}
		//
		// 	let customerInformation = (doc, invoice) => {
		// 		doc
		// 			.fillColor("#444444")
		// 			.fontSize(20)
		// 			.text("Invoice", 50, 160);
		//
		// 		generateHr(doc, 185);
		//
		// 		const customerInformationTop = 200;
		//
		// 		doc.fontSize(10)
		// 			.text("Name:", 50, customerInformationTop)
		// 			.font("Helvetica-Bold")
		// 			.text(invoice.shipping.name, 150, customerInformationTop)
		// 			.font("Helvetica")
		// 			.text("E-mail:", 50, customerInformationTop + 15)
		// 			.text(invoice.shipping.email, 150, customerInformationTop + 15)
		// 			.text("Mob.:", 50, customerInformationTop + 30)
		// 			.text(invoice.shipping.mob, 150, customerInformationTop + 30)
		// 			.fontSize(9)
		// 			.text("GSTIN:", 50, customerInformationTop + 45)
		// 			.text(invoice.shipping.GSTIN, 150, customerInformationTop + 45)
		// 			.fontSize(10)
		// 			.text("Address:", 50, customerInformationTop + 60)
		// 			.text(invoice.shipping.address, 150, customerInformationTop + 60)
		//
    //       .text("Invoice Number:", 350, customerInformationTop)
		// 			.font("Helvetica-Bold")
		// 			.text(invoice.order_number, 450, customerInformationTop)
		// 			.font("Helvetica")
		// 			.text("Invoice Date:", 350, customerInformationTop + 15)
		// 			.text(invoice.date.billing_date, 450, customerInformationTop + 15)
		// 			.text("Payment Mode:", 350, customerInformationTop + 30)
		// 			.text(invoice.paymentMode, 450, customerInformationTop + 30)
		// 			.moveDown();
		//
		// 		generateHr(doc, 280);
		// 	}
		//
		// 	let invoiceTable = (doc, invoice) => {
		// 		let i;
		// 		const invoiceTableTop = 330;
		// 		const currencySymbol = invoice.currency_symbol;
		//
		// 		doc.font("Helvetica-Bold");
		// 		tableRow(
		// 			doc,
		// 			invoiceTableTop,
		// 			"Course",
		// 			"Batch",
		// 			"Paypal Amount",
		// 			"Fee",
		// 			"Amount"
		// 		);
		// 		generateHr(doc, invoiceTableTop + 20);
		// 		doc.font("Helvetica");
		// 		var totalAmount = 0;
		// 		var totalGST = 0;
		// 		for (i = 0; i < invoice.items.length; i++) {
		// 			const item = invoice.items[i];
		// 			const position = invoiceTableTop + (i + 1) * 30;
		// 			tableRow(
		// 				doc,
		// 				position,
		// 				item.Course,
		// 				item.Batch,
		// 				item.PaypalAmount,
		// 				item.Fee,
		// 				item.Amount
		// 			);
		// 			totalAmount += parseFloat(item.Amount);
		// 			generateHr(doc, position + 20);
		// 		}
		//
		// 		const totalPosition = invoiceTableTop + (i + 1) * 30;
		// 		doc.font("Helvetica-Bold");
		// 		totalTable(
		// 			doc,
		// 			totalPosition,
		// 			"Total Amount:",
		// 			formatCurrency(totalAmount.toFixed(2))
		// 		);
		// 		const chargesPosition = totalPosition + 20;
		// 		// doc.font("Helvetica-Bold");
		// 		// totalTable(
		// 		// 	doc,
		// 		// 	chargesPosition,
		// 		// 	"Fee:",
		// 		// 	formatCurrency(invoice.fee)
		// 		// );
		// 		const settleAmountPosition = chargesPosition + 20;
		// 		// doc.font("Helvetica-Bold");
		// 		// totalTable(
		// 		// 	doc,
		// 		// 	settleAmountPosition,
		// 		// 	"Settle Amount:",
		// 		// 	formatCurrency(invoice.fullAmount)
		// 		// );
		// 		const amountInWordsPosition = settleAmountPosition + 20;
		// 		generateHr(doc, amountInWordsPosition);
		// 		doc.font("Helvetica-Bold")
		// 		.text("Amount in Words:", 50, amountInWordsPosition + 10)
		// 		.text(this.formatter.convertNumberToWords(invoice.fullAmount) +(invoice.fullAmount? " only" : ""), 150, amountInWordsPosition + 10)
		// 		generateHr(doc, amountInWordsPosition + 30);
		// 		const signaturePosition = amountInWordsPosition+210;
		// 		if (this.signature) {
		// 			doc.text(invoice.header.company_name, 430, signaturePosition)
		// 			.image(invoice.header.signature, 440, signaturePosition+20, {
		// 				height : 50,
		// 				width : 110
		// 				})
		// 				.text("Designated Partner", 440, signaturePosition+80)
		// 				.moveDown();
		// 		} else {
		// 			doc.text(invoice.header.company_name, 430, signaturePosition)
		// 				.text("Designated Partner", 440, signaturePosition+80)
		// 				.moveDown()
		// 		}
		// 	}
		//
		// 	let footer = (doc, invoice) => {
		// 		if (invoice.footer.text.length !== 0) {
		// 			generateHr(doc, 760);
		// 			doc.fontSize(10).text(invoice.footer.text, 50, 770, {
		// 				align: "center",
		// 				width: 500
		// 			});
		// 		}
		// 	}
		//
		// 	let totalTable = (
		// 		doc,
		// 		y,
		// 		name,
		// 		description
		// 	) => {
		// 		doc
		// 			.fontSize(10)
		// 			.text(name, 380, y, {
		// 				width: 90,
		// 				align: "right"
		// 			})
		// 			.text(description, 0, y, {
		// 				align: "right"
		// 			})
		// 	}
		//
		// 	let tableRow = (
		// 		doc,
		// 		y,
		// 		course,
		// 		batch,
		// 		paypalAmount,
		// 		fee,
		// 		amount
		// 	) => {
		// 		doc
		// 			.fontSize(10)
		// 			.text(course, 50, y)
		// 			.text(batch, 170, y)
		// 			// .text(hsn, 222, y, {
		// 			// 	width: 90,
		// 			// 	align: "right"
		// 			// })
		// 			.text(paypalAmount, 280, y, {
		// 				width: 90,
		// 				align: "right"
		// 			})
		// 			// .text(cgst, 350, y, {
		// 			// 	width: 90,
		// 			// 	align: "right"
		// 			// })
		// 			.text(fee, 360, y, {
		// 				width: 90,
		// 				align: "right"
		// 			})
		// 			.text(amount, 0, y, {
		// 				align: "right"
		// 			});
		// 	}
		//
		// 	let generateHr = (doc, y) => {
		// 		doc
		// 			.strokeColor("#aaaaaa")
		// 			.lineWidth(1)
		// 			.moveTo(50, y)
		// 			.lineTo(550, y)
		// 			.stroke();
		// 	}
		//
		// 	let formatCurrency = (value, symbol="") => {
		// 		if (value) {
		// 			var x = value.toString().split('.');
		// 			var y = (x.length > 1 ? "." + x[1] : "");
		// 			x = x[0];
		// 			var lastThree = x.substring(x.length - 3);
		// 			var otherNumbers = x.substring(0, x.length - 3);
		// 			if (otherNumbers != '')
		// 				lastThree = ',' + lastThree;
		// 			var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
		// 			return res + y + symbol;
		// 		} else {
		// 			return value + symbol;
		// 		}
		// 	}
		//
		// 	let getNumber = str => {
		// 		if (str.length !== 0) {
		// 			var num = str.replace(/[^0-9]/g, '');
		// 		} else {
		// 			var num = 0;
		// 		}
		//
		// 		return num;
		// 	}
		//
		// 	let checkIfTaxAvailable = tax => {
		// 		let validatedTax = getNumber(tax);
		// 		if (Number.isNaN(validatedTax) === false && validatedTax <= 100 && validatedTax > 0) {
		// 			var taxValue = tax;
		// 		} else {
		// 			var taxValue = '---';
		// 		}
		//
		// 		return taxValue;
		// 	}
		//
		// 	let applyTaxIfAvailable = (price, gst) => {
		//
		//
		// 		let validatedTax = getNumber(gst);
		// 		if (Number.isNaN(validatedTax) === false && validatedTax <= 100) {
		// 			let taxValue = '.' + validatedTax;
		// 			var itemPrice = price * (1 + taxValue);
		// 		} else {
		// 			var itemPrice = price * (1 + taxValue);
		// 		}
		//
		// 		return itemPrice;
		// 	}
		//
		// 	let companyAddress = (doc, address) => {
		// 		let str = address;
		// 		// let chunks = str.match(/.{0,25}(\s|$)/g);
		// 		let chunks = str.split("\\");
		// 		let first = 50;
		// 		chunks.forEach(function(i, x) {
		// 			doc.fontSize(10).text(chunks[x], 300, first, {
		// 				align: "right"
		// 			});
		// 			first = +first + 15;
		// 		});
		// 	}
		//
		// 	let niceInvoice = (invoice) => {
		// 		var doc = new PDFDocument({
		// 			size: "A4",
		// 			margin: 40
		// 		});
		// 		var stream = doc.pipe(blobStream());
		// 		header(doc, invoice);
		// 		customerInformation(doc, invoice);
		// 		invoiceTable(doc, invoice);
		// 		footer(doc, invoice);
		// 		doc.end();
		// 		stream.on('finish', function() {
		// 			// get a blob you can do whatever you like with
		// 			const blob = stream.toBlob('application/pdf');
		// 			// or get a blob URL for display in the browser
		// 			const url = stream.toBlobURL('application/pdf');
		//
		// 			const downloadLink = document.createElement('a');
		// 			downloadLink.href = url;
		// 			downloadLink.download = invoiceNo+"_"+oDetail.Country+"_"+oDetail.Name;
		// 			downloadLink.click();
		// 		});
		// 	}
		// 	niceInvoice(invoiceDetail);
		// },
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

		onDownloadExel: function(oEvent) {
			var that = this;
			var accountNo = this.getView().getModel("local").getProperty("/GSTInvoices/AccountNo");
			var startDate = this.getView().byId("idRegDate").getValue();
			var endDate = this.getView().byId("idRegDateTo").getValue();
			$.ajax({
				type: 'GET', // added,
				url: 'getExcelForGST',
				success: function(data) {
					sap.m.MessageToast.show("File Downloaded succesfully");
				},
				error: function(xhr, status, error) {
					sap.m.MessageToast.show("error in downloading the excel file");
				}
			});
		},
		super: function(accountNo, startDate, endDate) {
			var that = this;

			$.post('/getAmountForAccount', {
					"AccountNo" : accountNo,
					"StartDate" : startDate,
					"EndDate" : endDate,
					"PaymentMode" : this.payMode
				})
				.done(function(data, status) {
					var oNewModel = new sap.ui.model.json.JSONModel();
					oNewModel.setData({
						"records": data
					});
					var totalBalance = 0,
					 totalIndianEntries = 0,
					 totalForeignersEntries =0,
					 totalAmountNonPaypal = 0,
					 totalAmountUSDPaypal = 0,
					 totalSettleAmountPaypal = 0,
					 totalGSTAmount = 0;
					for (var i = 0; i < data.length; i++) {
						totalBalance = totalBalance + data[i].FullAmount;
						totalGSTAmount+=(parseFloat(data[i].CGST)+parseFloat(data[i].SGST));
						if(data[i].Country==="IN"){
							totalIndianEntries+=1;
						}
						else{
							totalForeignersEntries+=1
						}
						if(data[i].PaymentMode==="PAYPAL"){
							 totalSettleAmountPaypal+=data[i].SettleAmount;
							  totalAmountUSDPaypal+=data[i].USDAmount;
						}
						else{
							totalAmountNonPaypal+=data[i].FullAmount;
						}
					}
					var totalProperties =  {
							 "TotalBalance" : totalBalance,
							 "TotalIndianEntries" : totalIndianEntries,
							 "TotalForeignersEntries" : totalForeignersEntries,
							 "TotalAmountNonPaypal" : totalAmountNonPaypal,
							 "TotalAmountUSDPaypal" : totalAmountUSDPaypal,
							 "TotalSettleAmountPaypal" : totalSettleAmountPaypal,
							 "TotalGSTAmount" : totalGSTAmount.toFixed(2)
						};
					that.getView().getModel("local").setProperty("/totalProperties",totalProperties);
					that.getView().byId("newtitle").setText("Total Amount : " + totalBalance);
					that.getView().setModel(oNewModel, "viewModel");
				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Error in access");
				});
		}
	});

});
