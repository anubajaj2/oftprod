sap.ui.define(["oft/fiori/controller/BaseController","sap/m/MessageBox","sap/m/MessageToast","oft/fiori/models/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/viz/ui5/format/ChartFormatter","sap/viz/ui5/api/env/Format","sap/m/Dialog","sap/m/DialogType"],function(e,t,a,s,o,r,i,n,l,u){"use strict";return e.extend("oft.fiori.controller.newLead",{formatter:s,onInit:function(){this.oRouter=sap.ui.core.UIComponent.getRouterFor(this);this.clearForm();this.oRouter.attachRoutePatternMatched(this.herculis,this);var e=this.getModel("local").getProperty("/CurrentUser");if(e){var t=this.getModel("local").oData.AppUsers[e].UserName;this.getView().byId("idUser").setText(t)}},onCourseStateSetting:function(){if(!this.courseSettingsPopup){this.courseSettingsPopup=new sap.ui.xmlfragment("oft.fiori.fragments.CourseSettingsPopup",this);this.getView().addDependent(this.courseSettingsPopup);var e="Course Settings";this.courseSettingsPopup.setTitle(e)}this.courseSettingsPopup.open()},onCloseCourseSettings:function(){this.courseSettingsPopup.close()},onUpdateCourseSettings:function(){var e=this;var t=this.courseSettingsPopup.getContent()[1].getSelectedKey();var a=this.courseSettingsPopup.getContent()[3].getSelectedKey();var s={CourseName:t,TemplateState:a};var o=new sap.ui.model.Filter("CourseName","EQ",s.CourseName);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/MailCustomizes","GET",{filters:[o]},{},this).then(function(t,a){if(t.results.length>0){e.ODataHelper.callOData(e.getOwnerComponent().getModel(),"/MailCustomizes('"+t.results[0].id+"')","PUT",{},s,e).then(function(t){e.getView().setBusy(false);sap.m.MessageToast.show("Settings updated successfully");e.onCourseSelect()}).catch(function(t){e.getView().setBusy(false);sap.m.MessageToast.show("Settings update failed "+t.responseText)})}else{e.ODataHelper.callOData(e.getOwnerComponent().getModel(),"/MailCustomizes","POST",{},s,e).then(function(t){e.getView().setBusy(false);sap.m.MessageToast.show("Setting Saved successfully");e.onCourseSelect()}).catch(function(t){e.getView().setBusy(false);sap.m.MessageToast.show("template update failed "+t.responseText)})}}).catch(function(t){e.getView().setBusy(false);sap.m.MessageToast.show("template state  load failed "+t.responseText)})},setCountryData:function(e,t){var a=e.split(", ");var s="";var a=a.filter(function(e){return e!=null}).filter(function(){return true});var o=[];var a=$.each(a,function(e,t){if($.inArray(t,o)===-1)o.push(t)});for(var r=0;r<o.length;r++){if(r>0){s=o[r]+", "+s}else{s=o[r]}}if(s===""){s="no past history found"}t.setText(s)},onSplitName:function(e){var t=e.getParameter("value");if(t){t=t.toLowerCase().split(" ").map(function(e){return e.charAt(0).toUpperCase()+e.slice(1)}).join(" ")}e.getSource().setValue(t);if(t.indexOf(" ")!==-1){var a=t.split(/\s+/)[0];var s=t.split(/\s+/)[1];this.getView().getModel("local").setProperty("/newLead/FirstName",a);this.getView().getModel("local").setProperty("/newLead/LastName",s)}},setOtherData:function(e){if(e.FirstName!==""&&e.FirstName!=="null"&&e.FirstName!==undefined){this.getView().getModel("local").setProperty("/newLead/FirstName",e.FirstName)}else{this.getView().getModel("local").setProperty("/newLead/FirstName","")}if(e.LastName!==""&&e.LastName!=="null"&&e.LastName!==undefined){this.getView().getModel("local").setProperty("/newLead/LastName",e.LastName)}else{this.getView().getModel("local").setProperty("/newLead/LastName","")}if(e.Country!==""&&e.Country!=="null"&&e.Country!==undefined){this.getView().byId("country").setSelectedKey(e.Country)}else{this.getView().byId("country").setSelectedKey("IN")}if(e.Phone!==""&&e.Phone!==0&&e.Phone!==undefined){this.getView().getModel("local").setProperty("/newLead/Phone",e.Phone)}else{this.getView().getModel("local").setProperty("/newLead/Phone","")}},onLiveChange:function(e){var t=e.getParameter("value");var s=this;var o=this.getView().byId("countrydata");e.getSource().setValue(e.getParameter("value").replace(/\s/gm,"").toLowerCase());if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(t)){o.setText("");$.post("/checkStudentById",{emailId:t}).done(function(e,t){if(e){s.setCountryData(e.country,o);if(e.inq){s.setOtherData(e.inq)}}}).fail(function(e,t,a){o.setText("no past history")})}else{a.show("Invalid Email")}},getUserId:function(e){return this.getModel("local").getData().CurrentUser},handleUploadPress:function(){var e=this.byId("fileUploader");if(!e.getValue()){a.show("Choose a file first");return}e.getAggregation("parameters")[0].setValue(this.getModel("local").getData().CurrentUser);e.upload()},handleUploadComplete:function(e){var t=e.getParameter("response");var s=e.getSource();if(t){var o="";debugger;if(JSON.parse(t.split('">')[1].replace("</pre>","")).error_code!==0){o=JSON.parse(t.split('">')[1].replace("</pre>","")).err_desc}else{o="Uploaded Successfully"}a.show(o)}},updateInq:function(){var e=this;$.post("/upload").done(function(e,t){sap.m.MessageBox.error("Done")}).fail(function(e,t,a){sap.m.MessageBox.error("Error in upload")})},clearForm:function(){},passwords:"",onEmail:function(){var e=this;var t=e.getView().byId("idRecent").getSelectedContexts();for(var a=0;a<t["length"];a++){var s=t[a].getModel().getProperty(t[a].getPath());s.password=this.passwords;s.DollerQuote=this.getView().byId("doller").getSelected();var o=this.getView().byId("rbg");s.mailType=o.getSelectedButton().getId().split("--")[o.getSelectedButton().getId().split("--").length-1];s.source=this.getView().byId("source").getSelectedKey();var r=this.getView().getModel("local").getProperty("/courses");for(var i=0;i<r.length;i++){if(r[i].courseName===s.CourseName&&r[i].hasOwnProperty("trainingDuration")){s.trainingDuration=r[i].trainingDuration;s.trainingTopics=r[i].trainingTopics;s.trainingLink=r[i].trainingLink;s.trainingDemo=r[i].trainingDemo;s.trainingServer=r[i].trainingServer;s.trainingServerUsd=r[i].trainingServerUsd;break}}$.post("/sendInquiryEmail",s).done(function(e,t){sap.m.MessageToast.show("Email sent successfully")}).fail(function(t,a,s){e.passwords="";sap.m.MessageBox.error(t.responseText)})}},onDataExport:function(e){var t=this.getView().byId("inqDate").getDateValue().getTime();$.ajax({type:"GET",url:"InquiryDownload?date="+t,success:function(e){sap.m.MessageToast.show("File Downloaded succesfully")},error:function(e,t,a){sap.m.MessageToast.show("error in downloading the excel file")}})},onDelete:function(e){var a=this;t.confirm("Do you want to delete the selected records?",function(e){if(e=="OK"){var t=a.getView().byId("idRecent").getSelectedContexts();for(var s=0;s<t["length"];s++){a.ODataHelper.callOData(a.getOwnerComponent().getModel(),t[s].sPath,"DELETE",{},{},a).then(function(e){sap.m.MessageToast.show("Deleted succesfully")}).catch(function(e){a.getView().setBusy(false);a.oPopover=a.getErrorMessage(e);a.getView().setBusy(false)})}}},"Confirmation")},onBack:function(){sap.ui.getCore().byId("idApp").to("idView1")},onItemSelect:function(e){var t=e.getParameter("listItem").getBindingContextPath();var a=t.split("/")[t.split("/").length-1];this.oRouter.navTo("detail2",{suppId:a})},onPress:function(){sap.m.MessageBox.alert("Button was clicked")},onHover:function(){sap.m.MessageBox.alert("Button was Hovered")},onCourseSelect:function(e){var t=this;var a=this.getView().byId("country").getSelectedKey();var s=this.getView().byId("course").getSelectedKey();var o=this.getView().getModel("local").getProperty("/courses");if(a==="IN"){for(var r=0;r<o.length;r++){if(o[r].courseName===s){this.getView().getModel("local").setProperty("/newLead/fees",o[r].fee);this.getView().getModel("local").setProperty("/newLead/currency","INR");break}}}else{for(var r=0;r<o.length;r++){if(o[r].courseName===s){this.getView().getModel("local").setProperty("/newLead/fees",o[r].usdFee);this.getView().getModel("local").setProperty("/newLead/currency","USD");break}}}var i=new sap.ui.model.Filter("CourseName","EQ",s);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/MailCustomizes","GET",{filters:[i]},{},this).then(function(e,a){var s={R:0,B:1,A:2};if(e.results.length>0){t.getView().byId("rbg").setSelectedIndex(s[e.results[0].TemplateState])}else{t.getView().byId("rbg").setSelectedIndex(0)}}).catch(function(e){t.getView().setBusy(false);sap.m.MessageToast.show("template state  load failed "+e.responseText)})},herculis:function(e){if(e.getParameter("name")!=="newlead"){return}this.getView().getModel("local").setProperty("/newLead/date",this.formatter.getFormattedDate(0));this.getView().getModel("local").setProperty("/newLead/country","IN");var t=new Date;t.setHours(0,0,0,0);var a=new sap.ui.model.Sorter("CreatedOn",true);var s=this.getView().byId("idRecent");s.bindAggregation("items",{path:"/Inquries",template:new sap.m.DisplayListItem({label:"{EmailId} - {CourseName} - {Country}",value:"{fees} {currency} / {source} / {CreatedOn}-{CreatedBy}"}),filters:[new o("CreatedOn","GE",t)],sorter:a});s.attachUpdateFinished(this.counter);var r=this;n.numericFormatter(i.getInstance());var l=i.DefaultPattern;var u=this.getView().byId("idVizFrame");u.setVizProperties({plotArea:{dataLabel:{formatString:l.SHORTFLOAT_MFD2,visible:true}},valueAxis:{label:{formatString:l.SHORTFLOAT},title:{visible:false}},categoryAxis:{title:{visible:false}},title:{visible:false,text:"Total Inquiry"}});$.get("/todayInquiry").then(function(e){r.getView().getModel("local").setProperty("/AllInq",e)});setTimeout(function(){r.onCourseSelect()},2e3);this.setConfig()},onDateChange:function(){var e=this;var t=this.byId("inqDate").getDateValue();var a=new Date(this.byId("inqDate").getDateValue().toDateString());a.setHours(23,59,59,999);var s=new Date;s.setHours(0,0,0,0);var i=new sap.ui.model.Sorter("CreatedOn",true);var n=this.getView().byId("idRecent");n.bindAggregation("items",{path:"/Inquries",template:new sap.m.DisplayListItem({label:"{EmailId} - {CourseName} - {Country}",value:"{fees} {currency} / {source} / {CreatedOn}-{CreatedBy}"}),filters:[new o({path:"CreatedOn",operator:r.BT,value1:t,value2:a})],sorter:i});n.attachUpdateFinished(this.counter);$.get("/todayInquiry?date="+t.toDateString()).then(function(t){e.getView().getModel("local").setProperty("/AllInq",t)})},setConfig:function(){debugger;if(this.getModel("local").getData().CurrentUser==="5d947c3dab189706a40faade"||this.getModel("local").getData().CurrentUser==="5dd6a6aea5f9e83c781b7ac0"||this.getModel("local").getData().CurrentUser==="5ecc968586321064989cdc3f"||this.getModel("local").getData().CurrentUser==="5dcf9f7183f22e7da0acdfe4"||this.getModel("local").getData().CurrentUser==="5ea2f01d7854a13c148f18cd"){this.getView().byId("source").setSelectedKey("L");console.log("linkedin")}else if(this.getModel("local").getData().CurrentUser==="5f1331f2e0b8524af830fa20"){this.getView().byId("source").setSelectedKey("F");console.log("facebook")}else{this.getView().byId("source").setSelectedKey("R");console.log("Regular")}},counter:function(e){var t=e.getSource();var a=t.getItems().length;t.getHeaderToolbar().getContent()[0].setText("Today : "+a);var s=t.mAggregations.items;var o;var r;var i;for(var n=0;n<s.length;n++){r=s[n].mProperties.value.split("-")[0];i=s[n].mProperties.value.split("-")[1];if(this.getModel("local").getProperty("/AppUsers")[i]){o=this.getModel("local").getProperty("/AppUsers")[i].UserName;t.getItems()[n].setValue(r+" - "+o)}}},supplierPopup:null,oInp:null,onPopupConfirm:function(e){var t=e.getParameter("selectedItem");this.oInp.setValue(t.getLabel())},oSuppPopup:null,onFilter:function(){if(!this.oSuppPopup){this.oSuppPopup=new sap.ui.xmlfragment("oft.fiori.fragments.popup",this);this.getView().addDependent(this.oSuppPopup);this.oSuppPopup.setTitle("Suppliers");this.oSuppPopup.bindAggregation("items",{path:"/suppliers",template:new sap.m.DisplayListItem({label:"{name}",value:"{city}"})})}this.oSuppPopup.open()},onRequest:function(e){this.oInp=e.getSource();if(!this.supplierPopup){this.supplierPopup=new sap.ui.xmlfragment("oft.fiori.fragments.popup",this);this.supplierPopup.setTitle("Cities");this.getView().addDependent(this.supplierPopup);this.supplierPopup.bindAggregation("items",{path:"/cities",template:new sap.m.DisplayListItem({label:"{cityName}",value:"{famousFor}"})})}this.supplierPopup.open()},onConfirm:function(e){if(e==="OK"){a.show("Your fruit has been approved successfully");this.getView().byId("idApr").setVisible(false)}},onSave:function(e){var a=e;var s=this;s.getView().setBusy(true);var o=this.getView().getModel("local").getProperty("/newLead");if(!this.getView().byId("inqDate").getDateValue()){sap.m.MessageToast.show("Enter a valid Date");return""}if(o.phone){o.phone=this.formatter.extractNo(o.phone).replace(/,/g,"")}var r={EmailId:o.emailId.toLowerCase(),CourseName:o.course,FirstName:o.FirstName,LastName:o.LastName,Date:this.getView().byId("inqDate").getDateValue(),Country:o.country,Phone:o.phone,Subject:o.subject,Message:o.message,fees:o.fees,currency:o.currency,CreatedOn:new Date,CreatedBy:"Minakshi",SoftDelete:false,source:o.source};if(o.country==="IN"&&o.phone!=="null"&&o.phone!=="0"&&o.phone!==""){try{var i=o.FirstName;var n=o.phone;var l={};l.msgType="inquiry";l.userName=i;l.courseName=o.course;l.Number=n;$.post("/requestMessage",l).done(function(e,t){sap.m.MessageToast.show("Message sent successfully")}).fail(function(e,t,a){sap.m.MessageBox.error(e.responseText)})}catch(e){}finally{}}this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Inquries","POST",{},r,this).then(function(e){s.getView().setBusy(false);sap.m.MessageToast.show("Inquiry Saved successfully");s.destroyMessagePopover();if(s.getView().byId("idRecent").getBinding("items")){s.getView().byId("idRecent").getBinding("items").refresh();setTimeout(function(){if(this.getView().byId("autoMail").getState()){this.getView().byId("idRecent").setSelectedItem(s.getView().byId("idRecent").getItems()[0]);this.onEmail();this.getView().byId("idRecent").removeSelections()}}.bind(s),2e3).bind(this)}}).catch(function(e){s.getView().setBusy(false);if(e.responseText.indexOf(":")!==-1){var a="Inquiry already Exists";var o=e.responseText.split(":")[e.responseText.split(":").length-1].replace(" ","");try{var i=s.getView().getModel("local").getProperty("/AppUsers")[o].UserName}catch(e){i="unknown"}try{var n=e.responseText.split(":")[e.responseText.split(":").length-2].replace(" ","").replace(" & Created by ","")}catch(e){n="US"}a=e.responseText.replace(o,i)+"Do you want to send again?"}if(a.indexOf("Fraud")!=-1){t.error("Emaild id is Fraud");return}if(s.oLeadDuplicate===undefined){var l;s.oLeadDuplicate=l=new sap.ui.xmlfragment("oft.fiori.fragments.Dialog",this);s.getView().addDependent(l);l.setTitle("Already Exist");var u=s;l.addButton(new sap.m.Button({text:"Yes",press:function(){var e=JSON.parse(JSON.stringify(r));if(r.EmailId===""){sap.m.MessageBox.error("Email id is empty, please contact Anubhav")}e.password=u.passwords;e.DollerQuote=u.getView().byId("doller").getSelected();e.Country=n;var t=u.getView().getModel("local").getProperty("/courses");e.CourseName=u.getModel("local").getProperty("/newLead/course");e.EmailId=u.getModel("local").getProperty("/newLead/emailId");e.FirstName=u.getModel("local").getProperty("/newLead/FirstName");e.fees=u.getModel("local").getProperty("/newLead/fees");e.currency=u.getModel("local").getProperty("/newLead/currency");if(e.Country==="IN"){for(var a=0;a<t.length;a++){if(t[a].courseName===e.CourseName){e.fees=t[a].fee;e.currency="INR";if(t[a].hasOwnProperty("trainingDuration")){e.trainingDuration=t[a].trainingDuration;e.trainingTopics=t[a].trainingTopics;e.trainingLink=t[a].trainingLink;e.trainingDemo=t[a].trainingDemo;e.trainingServer=t[a].trainingServer;e.trainingServerUsd=t[a].trainingServerUsd}break}}}else{for(var a=0;a<t.length;a++){if(t[a].courseName===e.CourseName){e.fees=t[a].usdFee;e.currency="USD";if(t[a].hasOwnProperty("trainingDuration")){e.trainingDuration=t[a].trainingDuration;e.trainingTopics=t[a].trainingTopics;e.trainingLink=t[a].trainingLink;e.trainingDemo=t[a].trainingDemo;e.trainingServer=t[a].trainingServer;e.trainingServerUsd=t[a].trainingServerUsd}break}}}var s=u.getView().byId("rbg");e.mailType=s.getSelectedButton().getId().split("--")[s.getSelectedButton().getId().split("--").length-1];e.source="";$.post("/sendInquiryEmail",e).done(function(e,t){sap.m.MessageToast.show("Email sent successfully")}).fail(function(e,t,a){u.passwords="";sap.m.MessageBox.error(e.responseText)});l.close();l.destroyContent()}}));l.addButton(new sap.m.Button({text:"Close",press:function(){l.close();l.destroyContent()}}))}if(e.responseText.indexOf(":")!==-1){s.oLeadDuplicate.addContent(new sap.m.Text({text:a}));s.oLeadDuplicate.open()}else{this.getErrorMessage(e);s.oLeadDuplicate.destroyContent()}})},onApprove:function(){t.confirm("Do you want to approve this fruit",{title:"confirmation",onClose:this.onConfirm.bind(this)})},onGetNext:function(){$.post("/MoveNextAc",{}).done(function(e,t){if(e.accountNo==="114705500444"){var s="Hello ,"+"\n"+"\n"+"Thanks for your confirmation, Please transfer the funds to below bank account"+"\n"+"\n"+"Bank Name    : "+e.BankName+"\n"+"Account Name : "+e.accountName+"\n"+"Account No   : "+e.accountNo+"\n"+"IFSC Code    : "+e.ifsc+"\n"+"\n"+"You can also pay with barcode scan of UPI https://www.anubhavtrainings.com/upi-payment-gateway"+"\n"+"\n"+"Note: Please share the screenshot of payment once done.";sap.m.MessageBox.confirm(s,function(e){if(e==="OK"){const e=document.createElement("textarea");e.value=s;e.setAttribute("readonly","");e.style.position="absolute";e.style.left="-9999px";document.body.appendChild(e);e.select();document.execCommand("copy");document.body.removeChild(e);a.show("Copied to Clipboard")}})}else{var s="Hello ,"+"\n"+"\n"+"Thanks for your confirmation, Please transfer the funds to below bank account"+"\n"+"\n"+"Bank Name    : "+e.BankName+"\n"+"Account Name : "+e.accountName+"\n"+"Account No   : "+e.accountNo+"\n"+"IFSC Code    : "+e.ifsc+"\n"+"\n"+"Note: Please share the screenshot of payment once done.";sap.m.MessageBox.confirm(s,function(e){if(e==="OK"){const e=document.createElement("textarea");e.value=s;e.setAttribute("readonly","");e.style.position="absolute";e.style.left="-9999px";document.body.appendChild(e);e.select();document.execCommand("copy");document.body.removeChild(e);a.show("Copied to Clipboard")}})}}).fail(function(e,t,a){sap.m.MessageBox.error(e.responseText)})}})});
//# sourceMappingURL=newLead.controller.js.map