sap.ui.define(["oft/fiori/controller/BaseController","sap/ui/model/Filter","sap/ui/model/FilterOperator","oft/fiori/models/formatter","sap/m/MessageBox","sap/m/MessageToast"],function(e,t,o,a,n,s){"use strict";return e.extend("oft.fiori.controller.BankAccount",{onInit:function(){this.oRouter=sap.ui.core.UIComponent.getRouterFor(this);this.oRouter.attachRoutePatternMatched(this.onBankAccount,this);this.getView().byId("idRegDate").setValue(new Date)},formatter:a,onBankAccount:function(e){if(e.getParameter("name")!=="BankAccount"){return}this.super()},onConfirm:function(e){if(this.sId.indexOf("accountDetails")!==-1){var t=e.getParameter("selectedItem").getValue();this.getView().getModel("local").setProperty("/accountBalance/AccountNo",t);var o=new sap.ui.model.Filter("AccountNo","EQ",t);this.getView().byId("idAcEntry").getBinding("items").filter(o);this.getView().byId("idSummary").getBinding("items").filter(o)}},onItemPress:function(e){var t=this;if(!this.oAccountDetails){this.oAccountDetails=new sap.m.SelectDialog;sap.ui.getCore().getMessageManager().registerObject(this.oAccountDetails,true);this.getView().addDependent(this.oAccountDetails)}$.post("/getAllForAccount",{AccountNo:e.getSource().getModel("viewModel").getProperty(e.getSource().getBindingContextPath()).AccountNo}).done(function(e,o){console.log(e);var a=new sap.ui.model.json.JSONModel;a.setData({data:e});t.getView().setModel(a,"acModel");t.oAccountDetails.setModel(a,"acModel");t.oAccountDetails.bindAggregation("items",{path:"acModel>/data",template:new sap.m.DisplayListItem({value:"{acModel>PaymentDate}",label:"{acModel>Amount}"})});t.oAccountDetails.open()}).fail(function(e,t,o){sap.m.MessageBox.error(e.responseText)})},onAcSelect:function(e){this.oEvent_approve=e;var t=this;var o=e.getSource().getParent().getModel("viewModel").getProperty(e.getSource().getParent().getBindingContextPath());var a={AccountNo:o.AccountNo,State:e.getSource().getSelected()};$.post("/markCheckedAccount",a).done(function(e,t){sap.m.MessageToast.show("Account Checked Success")}).fail(function(e,t,o){sap.m.MessageBox.error(e.responseText)})},MResetCounter:function(e){var t=e.getSource().getParent().getModel("viewModel").getProperty(e.getSource().getParent().getBindingContextPath()).id;e.getSource().setText("0");this.resetCounter(t)},resetCounter:function(e){$.post("/ResetCounter",{id:e}).done(function(e,t){sap.m.MessageToast.show("done")}).fail(function(e,t,o){sap.m.MessageBox.error(e.responseText)})},MSetKey:function(e){debugger;var t=e.getSource().getParent().getModel("viewModel").getProperty(e.getSource().getParent().getBindingContextPath()).id;var o=prompt("Please enter your password","");if(o!==""){e.getSource().setText(o);this.setKey(o,t)}},setKey:function(e,t){$.post("/ResetPassword",{id:t,key:e}).done(function(e,t){sap.m.MessageToast.show("done")}).fail(function(e,t,o){sap.m.MessageBox.error(e.responseText)})},onGetNext:function(){$.post("/MoveNextAc",{}).done(function(e,t){sap.m.MessageBox.confirm(e.accountNo+","+e.BankName+","+e.ifsc+","+e.accountName)}).fail(function(e,t,o){sap.m.MessageBox.error(e.responseText)})},onBank:function(e){this.oEvent_approve=e;var t=this;var o=e.getSource().getParent().getModel("viewModel").getProperty(e.getSource().getParent().getBindingContextPath());if(o.AccountName){this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Accounts","GET",{filters:[new sap.ui.model.Filter("accountNo","EQ",o.AccountNo)]},{},this).then(function(e){console.log(e.results[0].userId);console.log(e.results[0].key);try{navigator.clipboard.writeText(e.results[0].userId)}catch(e){}finally{}window.open(e.results[0].extra1)}).catch(function(e){t.getView().setBusy(false);var o=t.getErrorMessage(e)})}},onLiveSearch:function(e){var t=e.getParameter("value");if(t){var o=new sap.ui.model.Filter("value",sap.ui.model.FilterOperator.Contains,t);var a=new sap.ui.model.Filter("key",sap.ui.model.FilterOperator.Contains,t);var n=new sap.ui.model.Filter({filters:[o,a],and:false});var s=[n];this.searchPopup.getBinding("items").filter(s)}else{this.searchPopup.bindAggregation("items",{path:"local>/accountSet",template:new sap.m.DisplayListItem({label:"{local>value}",value:"{local>key}"})});this.searchPopup.getBinding("items").filter([])}},onSend:function(){var e=this.getView().getModel("local").getProperty("/accountBalance");e.CreatedOn=this.getView().byId("idRegDate").getDateValue();var t=this;t.getView().setBusy(true);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/AccountBalances","POST",{},e,this,true).then(function(e){t.getView().setBusy(false);sap.m.MessageToast.show("Account entry Saved successfully");t.getView().getModel("local").setProperty("/accountBalance/CreatedOn",t.formatter.getFormattedDate(0))}).catch(function(e){t.getView().setBusy(false);var o=t.getErrorMessage(e)})},onRefresh:function(){this.super()},onDelete:function(e){var t=this;n.confirm("Do you want to delete the selected records?",function(e){if(e=="OK"){var o=t.getView().byId("idAcEntry").getSelectedContexts();for(var a=0;a<o["length"];a++){t.ODataHelper.callOData(t.getOwnerComponent().getModel(),o[a].sPath,"DELETE",{},{},t).then(function(e){sap.m.MessageToast.show("Deleted succesfully")}).catch(function(e){t.getView().setBusy(false);t.oPopover=t.getErrorMessage(e);t.getView().setBusy(false)})}}},"Confirmation")},onSelect:function(e){this.sId=e.getSource().getId();var t="",a="";if(this.sId.indexOf("accountDetails")!==-1){var n=new sap.ui.model.Filter("deleted",o.EQ,false);t="Account Search";a="local>/accountSet";this.getCustomerPopup();var s="Account Search";var r=new sap.ui.model.Sorter({path:"value",descending:false});this.searchPopup.setTitle(s);this.searchPopup.bindAggregation("items",{path:"local>/accountSet",filters:[n],sorter:r,template:new sap.m.DisplayListItem({label:"{local>value}",value:"{local>key}"})})}},onStudentIdChange:function(e){},super:function(){var e=this;$.get("/getAmountPerAccount").done(function(t,o){var a=new sap.ui.model.json.JSONModel;t.sort(function(e,t){return t.Amount-e.Amount});a.setData({records:t});var n=0;var s=0;for(var r=0;r<t.length;r++){n=n+t[r].NewDeposit;s=s+t[r].Amount}e.getView().byId("newtitle").setText("A/c Summary : This FY "+n+" Total Available : "+s);e.getView().setModel(a,"viewModel")}).fail(function(e,t,o){sap.m.MessageBox.error("Error in access")})}})});
//# sourceMappingURL=BankAccount.controller.js.map