sap.ui.define(["oft/fiori/controller/BaseController","sap/m/MessageBox","sap/m/MessageToast","oft/fiori/models/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/viz/ui5/format/ChartFormatter","sap/viz/ui5/api/env/Format","sap/m/Dialog","sap/m/DialogType"],function(e,t,r,o,s,a,n,i,l,d){"use strict";return e.extend("oft.fiori.controller.smsCenter",{formatter:o,onInit:function(){this.oRouter=sap.ui.core.UIComponent.getRouterFor(this);this.oRouter.attachRoutePatternMatched(this.herculis,this);var e=this.getModel("local").getProperty("/CurrentUser");if(e){var t=this.getModel("local").oData.AppUsers[e].UserName;this.getView().byId("idUser").setText(t)}},getUserId:function(e){return this.getModel("local").getData().CurrentUser},handleUploadPress:function(){var e=this.byId("fileUploader");if(!e.getValue()){r.show("Choose a file first");return}e.getAggregation("parameters")[0].setValue(this.getModel("local").getData().CurrentUser);var t={kind:"SMSCenter",type:this.getModel("local").getProperty("/smsCenter/type"),createdOn:this.getModel("local").getProperty("/smsCenter/CreatedOn"),createdBy:""};e.getAggregation("parameters")[1].setValue(JSON.stringify(t));e.upload()},handleUploadComplete:function(e){var t=e.getParameter("response");var o=e.getSource();if(t){var s="";if(JSON.parse(t.split('">')[1].replace("</pre>","")).error_code!==0){s=JSON.parse(t.split('">')[1].replace("</pre>","")).err_desc}else{s="Uploaded Successfully";this.getView().byId("fileUploader").setValue()}this.getView().byId("idRecent").getModel().refresh();r.show(s)}},updateInq:function(){var e=this;$.post("/upload",{kind:"SMSCenter",type:this.getModel("local").getProperty("/smsCenter/type"),createdOn:this.getModel("local").getProperty("/smsCenter/CreatedOn"),createdBy:""}).done(function(e,t){sap.m.MessageBox.error("Done")}).fail(function(e,t,r){sap.m.MessageBox.error("Error in upload")})},passwords:"",sendSms:function(e,t){var o=this;$.ajax({type:"GET",url:"sendPromoSms?number="+e[t],success:function(s){if(++t<e.length){sendSms(e,t)}else{o.getView().byId("idRecent").removeSelections();o.getView().byId("idRecent").getModel().refresh();r("SMS Sent Successfully")}},error:function(s,a,n){if(++t<e.length){o.sendSms(e,t)}else{o.getView().byId("idRecent").removeSelections();o.getView().byId("idRecent").getModel().refresh();r.show("SMS Sent Successfully")}}})},onSendSMS:function(e){var t=this,r=e.getSource().getParent().getParent().getSelectedContextPaths(),o=[];debugger;r.forEach(e=>{o.push(t.getView().getModel().getProperty(e).phoneNo)});t.sendSms(o,0)},onBack:function(){sap.ui.getCore().byId("idApp").to("idView1")},onSelectedDelete:function(e){var o=this;var s=e.getSource().getParent().getParent().getSelectedContextPaths();if(s.length>0){t.confirm("Are you sure, you want to delete selected the records?",function(e){if(e==="OK"){s.forEach(function(e){o.ODataHelper.callOData(o.getOwnerComponent().getModel(),e,"DELETE",{},{},o).then(function(e){r.show("Deleted succesfully")}).catch(function(e){o.getView().setBusy(false);o.oPopover=o.getErrorMessage(e);o.getView().setBusy(false)})})}})}else{r.show("Please select an item")}},onDeleteAll:function(e){var o=this;t.confirm("Are you sure, you want to delete all the records?",function(e){if(e==="OK"){$.ajax({type:"GET",url:"deleteAllSMSText",success:function(e){o.getView().byId("idRecent").getModel().refresh();r.show(`Deleted all(${e.count}) records`)},error:function(e,t,r){sap.m.MessageToast.show("Error in Deletion")}})}})},herculis:function(e){if(e.getParameter("name")!=="smsCenter"){return}this.getView().getModel("local").setProperty("/smsCenter/date",this.formatter.getFormattedDate(0));var t=new Date;t.setHours(0,0,0,0);var r=new sap.ui.model.Sorter("ChangedOn",false);var o=this.getView().byId("idRecent");o.bindAggregation("items",{path:"/SMSTexts",template:new sap.m.DisplayListItem({label:"{phoneNo}",value:"{type} / {CreatedOn} / {blocked} / {ChangedOn}"}),sorter:r})}})});
//# sourceMappingURL=smsCenter.controller.js.map