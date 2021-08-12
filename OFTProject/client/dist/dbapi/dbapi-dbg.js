//write all Calls to Node Server Here CRUD Implementation
//The method callCRUD will be used to communicate to the backend returns the JS promise
//You can use the jQuery ajax or some other framework dependency to make REST Call
sap.ui.define([
	"jquery.sap.global"
], function(jQuery) {
	"use strict";

	return {
		callOData: function(oModel, sUrl, sMethod, oParameters, oPayload, BaseController, isAdmin) {
			return new Promise(function(resolve, reject) {

				var currentDate = new Date();
				if(isAdmin === undefined){
					isAdmin = false;
				}
				// var currentUser = BaseController.getView().getModel("local").getProperty("/CurrentUser");
				var currentUser = BaseController.getModel("local").getProperty("/CurrentUser");
				if(sMethod === "POST" && isAdmin === false){
					oPayload.CreatedBy = currentUser;
					oPayload.ChangedBy = currentUser;
					oPayload.CreatedOn = currentDate;
					oPayload.ChangedOn = currentDate;
				}
				else if(sMethod === "PUT" && isAdmin === false){
					oPayload.ChangedBy = currentUser;
					oPayload.ChangedOn = currentDate;
				}

				if (!(oModel && sUrl && sMethod)) {
					reject("Invalid parameters passed");
				}
				if (!oParameters) {
					oParameters = {};
				}
				oModel.setUseBatch(false);
				switch (sMethod.toUpperCase()) {
					case "GET":
						oModel.read(sUrl, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
						break;
					case "POST":
						oModel.create(sUrl, oPayload, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
						break;
					case "PUT":
						oModel.update(sUrl, oPayload, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								debugger;
								resolve(oData);
							},
							error: function(oError) {
								debugger;
								reject(oError);
							}
						});
						break;
					case "DELETE":
						oModel.remove(sUrl, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
						break;
					default:
						jQuery.sap.log.error("No case matched");
						break;
				}
			});
		}
	};
});
