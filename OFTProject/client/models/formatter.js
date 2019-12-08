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
		getDatesIcon: function(startDate, EndDate) {
			var ostartDate = new Date(startDate);
			var oEndDate = new Date(EndDate);
			var current = new Date();
			if(current > oEndDate ){
					return "sap-icon://decline";
			}else{
					return "sap-icon://accept";
			}


		},
		getDatesIconColor: function(startDate, EndDate){
			var ostartDate = new Date(startDate);
			var oEndDate = new Date(EndDate);
			var current = new Date();
			if(current > oEndDate ){
					return "Negative";
			}else{
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
		getIndianCurr: function(value){
			var x=value;
			x=x.toString();
			var lastThree = x.substring(x.length-3);
			var otherNumbers = x.substring(0,x.length-3);
			if(otherNumbers != '')
			    lastThree = ',' + lastThree;
			var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
			return res;
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
				case "L": return "Live";
				case "V": return "Video";
				case "A": return "Live and Video";
			}
		}



	};
});
