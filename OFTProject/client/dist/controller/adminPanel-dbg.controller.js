sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageBox, MessageToast, Formatter, JSONModel) {
	"use strict";

	return Controller.extend("oft.fiori.controller.adminPanel", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
			debugger;


			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AppUsers", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onPressSaveSecure: function() {
			var that = this;
			that.getView().byId("viewSecureTable").setBusy(true);
			var oTable = this.getView().getModel("local");
			var secureListInfo = oTable.getData().appUsers;
			this.getView().getModel().setDeferredBatchGroups(["SaveSecureUserBatch"]);
			var _filterSecure = function(oViewSecureList, oEditSecureList) {
				return oViewSecureList.CredId === oEditSecureList.CredId;
			};
			if (secureListInfo.length > 0) {
				var aSecureInfo;
				for (var i = 0; i < secureListInfo.length; i++) {
					delete secureListInfo[i].CreateMode;
					if (secureListInfo[i].SecureKey === "*******") {
						secureListInfo[i].SecureKey = "";
					}
					secureListInfo[i].SecureKey = btoa(secureListInfo[i].SecureKey);
					aSecureInfo = this.globalData.filter(_filterSecure.bind(null, secureListInfo[i]));
					if (aSecureInfo.length === 1 && (JSON.stringify(aSecureInfo[0]) !== JSON.stringify(secureListInfo[i]))) {
						// Update
						this.getView().getModel().update("/SecureSet('" + secureListInfo[i].CredId + "')", secureListInfo[i], {
							groupId: "SaveSecureUserBatch"
						});
					} else if (secureListInfo[i].CredId === undefined) {
						//Create
						this.getView().getModel().create("/SecureSet", secureListInfo[i], {
							groupId: "SaveSecureUserBatch"
						});
					}
				}
				for (var j = 0; j < this.globalData.length; j++) {
					aSecureInfo = secureListInfo.filter(_filterSecure.bind(null, this.globalData[j]));
					if (aSecureInfo.length === 0) {
						//Delete
						this.getView().getModel().remove("/SecureSet('" + this.globalData[j].CredId + "')", {
							groupId: "SaveSecureUserBatch"
						});
					}
				}

			} else {
				for (var k = 0; k < this.globalData.length; k++) {
					//Delete
					this.getView().getModel().remove("/SecureSet('" + this.globalData[k].CredId + "')", {
						groupId: "SaveSecureUserBatch"
					});
				}
			}

			if (JSON.stringify(secureListInfo) === JSON.stringify(this.globalData)) {
				MessageToast.show(that.resourceBundle.getText("MSG_GET_SECURE_SAVE_ERROR"));
				that.getView().byId("viewSecureTable").setBusy(false);
				return;
			}

			this.getView().getModel().submitChanges({
				batchGroupId: "SaveSecureUserBatch",
				success: function(oData, oResponse) {
					var responses = oData.__batchResponses;
					// Check response of each call inside batch based on HTTP status
					that.getView().byId("viewSecureTable").setBusy(false);
					for (var p = 0; p < responses.length; p++) {
						if (oData.__batchResponses[p].response && oData.__batchResponses[p].response.statusCode > 399 && oData.__batchResponses[p].response
							.statusCode < 600) {
							MessageBox.error(JSON.parse(oData.__batchResponses[p].response.body).error.message.value, {
								title: that.resourceBundle.getText("TIT_MESSAGE_BOX_ERR"),
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});

							return;
						}
					}
					that._getSecureDetails();
					MessageToast.show(that.resourceBundle.getText("MSG_GET_SECURE_SAVE_SUCCESS"));
				},
				error: function(oError) {
					that.getView().byId("viewSecureTable").setBusy(false);
					MessageBox.error(that.getErrorMsg(oError), {
						title: that.resourceBundle.getText("TIT_MESSAGE_BOX_ERR"),
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				}
			});
		},
		onPressDeleteSecureRow: function() {
			var that = this;
			var aSelectedRows = this.getView().byId("viewSecureTable").getSelectedContexts();
			var oSecureModel = this.getView().getModel("local");
			var aUserArray = oSecureModel.getData().appUsers;
			if (aSelectedRows.length < 1) {
				MessageBox.error("Select atlease one row", {
					title: "Selection Error",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
				return;
			}
			sap.m.MessageBox.confirm("Confirm deletion?", {
				title: "Confirmation",
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						var items = that.getView().byId('viewSecureTable').getSelectedContexts();
						for (var i = 0; i < items["length"]; i++) { 
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath, "DELETE", {}, {}, that)
							.then(function(oData) {
								sap.m.MessageToast.show("Deleted succesfully");
							}).catch(function(oError) {
								that.getView().setBusy(false);
								that.oPopover = that.getErrorMessage(oError);
								that.getView().setBusy(false);
							});
							// var propertyData = aSelectedRows[iSelectedRow].getObject();
							// aUserArray.splice(aUserArray.indexOf(propertyData), 1);
							// that._checkForSecureChangesButton();
						}
						oSecureModel.updateBindings();
						that.getView().byId("viewSecureTable").removeSelections();
					}
				}
			});

		},
		onPressHandleSecureOkPopup: function(oEvent) {
			    
			    var that = this;
			    var bindingPath = oEvent.getSource().getParent().getContent()[0].getBindingContext();
			    var Payload = {
			    "Role":	sap.ui.getCore().byId("Secure_Dialog--idRole").getValue(),
			    "UserName":	sap.ui.getCore().byId("Secure_Dialog--idUser").getValue(),
			    "EmailId":	sap.ui.getCore().byId("Secure_Dialog--idEmail").getValue(),
			    "TechnicalId" :sap.ui.getCore().byId("Secure_Dialog--idTech").getValue()
			    };
			    
			    if(bindingPath){
			    var sPath = oEvent.getSource().getBindingContext().sPath;

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {},
					Payload, this)
				.then(function(oData) {
					sap.m.MessageToast.show("Server Updated successfully");
					that.getView().setBusy(false);
					that._oDialogSecure.close();

				}).catch(function(oError) {
					that.getView().setBusy(false);
					that.oPopover = that.getErrorMessage(oError);
					that.getView().setBusy(false);
				});}else{

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),'/AppUsers', "POST", {},
					Payload, this)
				.then(function(oData) {
					sap.m.MessageToast.show("Server Updated successfully");
					that.getView().setBusy(false);
					that._oDialogSecure.close();

				}).catch(function(oError) {
					that.getView().setBusy(false);
					that.oPopover = that.getErrorMessage(oError);
					that.getView().setBusy(false);
				});					
				}
			// var oTable = this.getView().getModel();
			// var secureListInfo = oTable.getData().appUsers;
			// var secureFormObj = this._oDialogSecure.getModel("secureFormModel").getData();
			// console.log(this._oDialogSecure.getModel("secureFormModel").getProperty("/CreateMode"));
			// if (this._oDialogSecure.getModel("secureFormModel").getProperty("/CreateMode")) {
			// 	secureFormObj.Role = secureFormObj.Role.toUpperCase();
			// 	secureListInfo[secureListInfo.length] = {
			// 		"Role": secureFormObj.Role,
			// 		"User": secureFormObj.User,
			// 		"Password": secureFormObj.Password
			// 	};
			// } else {
			// 	this.rowSelected = secureFormObj;
			// }
			// oTable.updateBindings();
			// this._checkForSecureChangesButton();
			// this.onPressHandleSecureCancelPopup();
		},
		_removeCreateMode: function(secureListInfo) {
			for (var i = 0; i < secureListInfo.length; i++) {
				delete secureListInfo[i].CreateMode;
			}
		},
		_checkForSecureChangesButton: function() {
			var oTable = this.getView().getModel("local");
			var secureListInfo = oTable.getData().appUsers;

			this._removeCreateMode(secureListInfo);
		},
		onPressHandleSecureCancelPopup: function() {
			this._oDialogSecure.close();
			this._oDialogSecure.destroy();
			this._oDialogSecure = null;
		},
		onPressOpenAddSecureDialog: function(createMode) {
			if (!this._oDialogSecure) {
				debugger;
				this._oDialogSecure = sap.ui.xmlfragment("Secure_Dialog", "oft.fiori.fragments.SecureDialog", this);
				// this._oDialogSecure.setModel(new JSONModel({}), "secureFormModel");
				// this._oDialogSecure.getModel("secureFormModel").setProperty("/CreateMode", true);
				this.getView().addDependent(this._oDialogSecure);
				if (createMode == false) {
					this._oDialogSecure.bindElement(this.aBindingContext);
				} else {
					this._oDialogSecure.unbindElement(this.aBindingContext);
				}
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSecure);
			this._oDialogSecure.open();

		},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		onSave: function() {
			//TODO: Save to Coustomer Reg. table
			console.log(this.getView().getModel("local").getProperty("/newBatch"));
		},

		onStartChange: function(oEvent) {
			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var endDate = this.formatter.getIncrementDate(dateObject, 2.5);
			this.getView().getModel("local").setProperty("/newBatch/endDate", endDate);
			var blogDate = this.formatter.getIncrementDate(dateObject, 8);
			this.getView().getModel("local").setProperty("/newBatch/blogDate", blogDate);
			console.log(endDate);
			console.log(blogDate);
		},
		editSecureField: function(oEvent) {
			this.aBindingContext = oEvent.getSource().getBindingContext().sPath;
			this.onPressOpenAddSecureDialog(false);
			// this.edit = 'X';
			// this._oDialogSecure.getModel("secureFormModel").setData(aBindingContext);
			// this.rowSelected = aBindingContext;
			// this._oDialogSecure.getModel("secureFormModel").setProperty("/CreateMode", false);

		},
		_getSecureDetails: function() {
			var that = this;
			//that.getView().byId("viewSecureTable").setBusy(true);
			//TODO: Set data to local model
		},
		herculis: function(oEvent) {

			this.getView().getModel("local").setProperty("/newBatch/startDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/demoDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/endDate", this.formatter.getFormattedDate(2.5));
			this.getView().getModel("local").setProperty("/newBatch/blogDate", this.formatter.getFormattedDate(8));
			///TODO: Fill the Customer Set and Course Set from REST API
			this._getSecureDetails();
		}

	});
});