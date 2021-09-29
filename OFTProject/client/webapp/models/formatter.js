sap.ui.define([], function() {
	return {
		getFormattedDate: function(monthInc) {
			var dateObj = new Date();
			dateObj.setDate(dateObj.getDate());
			var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		toTitleCase: function(str) {
			return str.replace(
				/\w\S*/g,
				function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				}
			);
		},
		getDates: function(startDate, EndDate) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});

			var ostartDate = new Date(startDate);
			var starts = oDateFormat.format(ostartDate); //string in the same format as "Thu, Jan 29, 2017"
			var oEndDate = new Date(EndDate);
			var ends = oDateFormat.format(oEndDate); //string in the same format as "Thu, Jan 29, 2017"
			return starts + " - " + ends;

		},
		getPaypalCharges: function(amount) {
			return amount;

		},
		getDatesIcon: function(startDate, EndDate) {
			var ostartDate = new Date(startDate);
			var oEndDate = new Date(EndDate);
			var current = new Date();
			if (current > oEndDate) {
				return "sap-icon://decline";
			} else {
				return "sap-icon://accept";
			}


		},
		getDatesIconColor: function(startDate, EndDate) {
			var ostartDate = new Date(startDate);
			var oEndDate = new Date(EndDate);
			var current = new Date();
			if (current > oEndDate) {
				return "Negative";
			} else {
				return "Positive";
			}

		},
		getFormattedSDate: function(monthInc) {
			var dateObj = new Date();
			dateObj.setDate(dateObj.getDate());
			var dd = dateObj.getDate() - 1;
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		removeSpecialChars: function(str) {
			if (str) {
				return str.replace(/[^a-zA-Z ]/g, "");
			}

		},

		getIndianDateFormat: function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
				var ostartDate = new Date(value);
				var indDate = oDateFormat.format(ostartDate);
				return indDate;
			}
			return value;
		},
		extractNo: function(val) {
			if (val) {
				return val.match(/\d/g).join();
			}
		},
		buttonIconforDownload: function(value) {
			if (value === "null") {
				return "sap-icon://download-from-cloud"
			} else {
				return "sap-icon://download"
			}
		},
		buttonTextforDownload: function(value) {
			if (value === "null") {
				return "DNLD";
			} else {
				return value;
			}
		},
		buttonTypeforInvoice: function(value) {
			if (value === "null" || value === true) {
				return sap.m.ButtonType.Reject;
			}
			return sap.m.ButtonType.Accept;
		},
		convertNumberToWords: function(amount) {
			var words = new Array();
			words[0] = '';
			words[1] = 'One';
			words[2] = 'Two';
			words[3] = 'Three';
			words[4] = 'Four';
			words[5] = 'Five';
			words[6] = 'Six';
			words[7] = 'Seven';
			words[8] = 'Eight';
			words[9] = 'Nine';
			words[10] = 'Ten';
			words[11] = 'Eleven';
			words[12] = 'Twelve';
			words[13] = 'Thirteen';
			words[14] = 'Fourteen';
			words[15] = 'Fifteen';
			words[16] = 'Sixteen';
			words[17] = 'Seventeen';
			words[18] = 'Eighteen';
			words[19] = 'Nineteen';
			words[20] = 'Twenty';
			words[30] = 'Thirty';
			words[40] = 'Forty';
			words[50] = 'Fifty';
			words[60] = 'Sixty';
			words[70] = 'Seventy';
			words[80] = 'Eighty';
			words[90] = 'Ninety';
			amount = amount.toString();
			var atemp = amount.split(".");
			var number = atemp[0].split(",").join("");
			var n_length = number.length;
			var words_string = "";
			if (n_length <= 9) {
				var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
				var received_n_array = new Array();
				for (var i = 0; i < n_length; i++) {
					received_n_array[i] = number.substr(i, 1);
				}
				for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
					n_array[i] = received_n_array[j];
				}
				for (var i = 0, j = 1; i < 9; i++, j++) {
					if (i == 0 || i == 2 || i == 4 || i == 7) {
						if (n_array[i] == 1) {
							n_array[j] = 10 + parseInt(n_array[j]);
							n_array[i] = 0;
						}
					}
				}
				value = "";
				for (var i = 0; i < 9; i++) {
					if (i == 0 || i == 2 || i == 4 || i == 7) {
						value = n_array[i] * 10;
					} else {
						value = n_array[i];
					}
					if (value != 0) {
						words_string += words[value] + " ";
					}
					if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
						words_string += "Crores ";
					}
					if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
						words_string += "Lakhs ";
					}
					if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
						words_string += "Thousand ";
					}
					if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
						words_string += "Hundred and ";
					} else if (i == 6 && value != 0) {
						words_string += "Hundred ";
					}
				}
				words_string = words_string.split("  ").join(" ");
			}
			return words_string;
		},

		getIndianCurr: function(value) {
			if (!value) {
				return "";
			}
			var x = value.toString().split('.');
			var y = (x.length > 1 ? '.' + x[1] : '');
			var x = x[0];
			var lastThree = x.substring(x.length - 3);
			var otherNumbers = x.substring(0, x.length - 3);
			if (otherNumbers != '')
				lastThree = ',' + lastThree;
			var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
			return res + y;
		},

		getFullAmountForGST: function(isWallet, fullAmount, usdAmount, exchange) {
			if (isWallet) {
				return (parseFloat(usdAmount) * parseFloat(exchange)).toFixed(2);
			} else {
				return fullAmount;
			}
		},

		sortByProperty: function(array, property) {
			var lol = function dynamicSort(property) {
				var sortOrder = 1;
				if (property[0] === "-") {
					sortOrder = -1;
					property = property.substr(1);
				}
				return function(a, b) {
					var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
					return result * sortOrder;
				}
			};

			return array.sort(lol(property));
		},
		getIncrementSDate: function(dateObj, monthInc) {
			debugger;
			//	var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var dd = dateObj.getDate() - 1;
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		getIncrementDate: function(dateObj, monthInc) {
			debugger;
			//	var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var dd = dateObj.getDate();
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		getDateCheck: function(dateObj) {
			var dd = dateObj.getDate();
			var mm = dateObj.getMonth();
			var yyyy = dateObj.getFullYear();

			var ddToday = new Date();

			var dd1 = ddToday.getDate();
			var mm1 = ddToday.getMonth();
			var yyyy1 = ddToday.getFullYear();

			debugger;
			if (yyyy > yyyy1) {
				return true;
			} else {
				if (yyyy == yyyy1) {
					if (mm > mm1) {
						return true;
					} else {
						if (mm == mm1) {
							if (dd > dd1) {
								return true;
							} else {
								return false;
							}
						} else {
							return false;
						}
					}
				} else { //(yyyy < yyyy1)
					return false;
				}
			}
		},
		gstTableAddressHighlight: function(value) {
			if (value === "null" || value === "") {
				return "Error";
			} else {
				return "Success";
			}
		},
		formatIconColor: function(bValue) {
			if (bValue === true) {
				return "red";
			} else {
				return "green";
			}
		},

		formatRowHighlight: function(bValue) {
			if (bValue === true) {
				return "Error";
			} else {
				return "Success";
			}
		},

		formatStatusValue: function(sValue) {
			debugger;
			switch (sValue) {
				case "L":
					return "Live";
				case "V":
					return "Video";
				case "A":
					return "Live and Video";
			}
		}



	};
});
