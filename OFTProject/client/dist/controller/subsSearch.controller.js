var oTableData;var course_id;var course_Guid;var student_id;var SubId_upd;var part_pay;var subsId;var portClicked=false;sap.ui.define(["oft/fiori/controller/BaseController","sap/m/MessageBox","sap/m/MessageToast","oft/fiori/models/formatter","sap/ui/model/FilterOperator","sap/ui/model/Filter"],function(e,t,a,s,i,r){"use strict";return e.extend("oft.fiori.controller.subsSearch",{formatter:s,onInit:function(){this.oRouter=sap.ui.core.UIComponent.getRouterFor(this);this.oRouter.attachRoutePatternMatched(this.herculis,this);this.totalCount=0;var e=this.getModel("local").getProperty("/CurrentUser");t="Hey "+t;if(e){var t=this.getModel("local").oData.AppUsers[e].UserName}this.getView().byId("idUser").setText(t);var a=new sap.ui.model.json.JSONModel;var s=this.getOwnerComponent().getModel();s.read("/Courses",{success:function(e,t){a.setData(e)},error:function(e){}});var i=this.getOwnerComponent().getModel();i.read("/Subs",{success:function(e,t){oTableData=e},error:function(e){}});var r=this;if(!this._oResponsivePopover){this._oResponsivePopover=sap.ui.xmlfragment("oft.fiori.fragments.sorterFilter",this);this._oResponsivePopover.setModel(this.getView().getModel())}var n=this.getView().byId("manageSubsTable");n.addEventDelegate({onAfterRendering:function(){var e=this.$().find(".sapMListTblHeaderCell");for(var t=0;t<e.length;t++){var a=e[t].id;r.onClick(a)}}},n)},onGiveAccess:function(e){var t=this;var a=t.getView().byId("manageSubsTable").getSelectedContexts();for(var s=0;s<a["length"];s++){var i=a[s].getModel().getProperty(a[s].getPath());debugger;$.post("/giveAccessNew",i).done(function(e,t){sap.m.MessageToast.show("Access has been provided")}).fail(function(e,t,a){sap.m.MessageBox.error("Error in access")})}},passwords:"",onRefresh:function(){var e=this.getView().byId("manageSubsTable");e.refreshItems();e.getBinding("items").refresh()},triggerUpdate:function(e,t){var s=this;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),e,"PUT",{},t,this).then(function(e){a.show("Update Successful")}).catch(function(e){s.getView().setBusy(false);var t=s.getErrorMessage(e)})},onCopyEmail:function(){var e=new Set;var t=document.getElementsByTagName("tr");for(var s=1;s<t.length;s++){e.add(t[s].cells[2].innerText)}var i="";e.forEach(function(e){if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(e)){i+="\n"+e}});const r=document.createElement("textarea");r.value=i;r.setAttribute("readonly","");r.style.position="absolute";r.style.left="-9999px";document.body.appendChild(r);r.select();document.execCommand("copy");document.body.removeChild(r);a.show("Email Copied")},onClearDue:function(e){debugger;var t=this;var a=t.getView().byId("manageSubsTable").getSelectedContexts();for(var s=0;s<a["length"];s++){this.triggerUpdate(a[s].sPath,{PartialPayment:"false",PendingAmount:0})}},onReplicateSubs:function(){var e=this;t.confirm("are you sure?",function(s){if(s==="OK"){e.getView().byId("idReplicateSubs").setEnabled(false);$.get("/replicateSubsToStudentPortal").done(function(a,s){t.success(JSON.stringify(a));e.getView().byId("idReplicateSubs").setEnabled(true)}).fail(function(a,s,i){e.getView().byId("idReplicateSubs").setEnabled(true);t.error("Error in access")});a.show("Replication started, Please Wait...")}})},onReplicateOneSub:function(){var e=this;var s=e.getView().byId("manageSubsTable").getSelectedContexts();e.totalCount=e.totalCount-s.length;for(var i=0;i<s["length"];i++){e.getView().byId("idReplicateOneSub").setEnabled(false);$.post("/replicateOneSubToStudentPortal",{id:s[i].getPath().split("'")[1]}).done(function(s,i){a.show(t.success(JSON.stringify(s)));e.getView().byId("idReplicateOneSub").setEnabled(true)}).fail(function(a,s,i){t.error("Error in access");e.getView().byId("idReplicateOneSub").setEnabled(true)})}},onRecent:function(e){var t=this;var a=t.getView().byId("manageSubsTable").getSelectedContexts();for(var s=0;s<a["length"];s++){this.triggerUpdate(a[s].sPath,{MostRecent:"true"})}},onClearToken:function(){$.post("/clearToken").done(function(e,t){sap.m.MessageToast.show("Token is now reset")}).fail(function(e,t,a){sap.m.MessageBox.error("Error in access")})},onSendEmail:function(e){var t=this;var a=t.getView().byId("manageSubsTable").getSelectedContexts();for(var s=0;s<a["length"];s++){var i=a[s].getModel().getProperty(a[s].getPath());debugger;var t=this;var r={Status:"Access Granted"};if(this.passwords===""){this.passwords=prompt("Please enter your password","");if(this.passwords===""){sap.m.MessageBox.error("Blank Password not allowed");return}}i.password=t.passwords;i.includeX="Renewal-"+t.getView().byId("includeX").getSelected();$.post("/sendSubscriptionEmail",i).done(function(e,t){sap.m.MessageToast.show("Email sent successfully")}).fail(function(e,a,s){t.passwords="";sap.m.MessageBox.error(e.responseText)})}},herculis:function(e){if(e.getParameter("name")!=="subsSearch"){return}var t=this.getView();var a=t.byId("manageSubsTable");var s=a.getBinding("items");var i=[];var r="CreatedOn";var n=true;i.push(new sap.ui.model.Sorter(r,n));s.sort(i);this.initAccounts()},initAccounts:function(){var e=this.getView().getModel("local");var t=this;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Accounts","GET",{},{},this).then(function(t,a){var s=[];for(var i=0;i<t.results.length;i++){s.push({key:t.results[i].accountNo,value:t.results[i].accountName+" "+t.results[i].ifsc,deleted:t.results[i].deleted})}e.setProperty("/accountSet",s)})},onClick:function(e){var t=this;$("#"+e).click(function(e){var a=e.currentTarget;var s=a.childNodes[0].textContent;var i=a.id.slice(-1);var r=t.getView();var n=r.byId("manageSubsTable");var o=n.mAggregations.items;var l=Object.keys(o[0]);r.getModel().setProperty("/bindingValue",l[i]);r.getModel().setProperty("/bindingValue","PartialPayment");t._oResponsivePopover.openBy(a)})},onChange:function(e){var t=e.getParameter("value");var a=t.split(",");var s=this.getView().byId("manageSubsTable");var i=this.getView().getModel().getProperty("/bindingValue");var n=[];for(var o=0;o<a.length;o++){var l=new r(i,"Contains",a[o]);n.push(l)}var u=s.getBinding("items");u.filter(n,"Application");this._oResponsivePopover.close()},onAscending:function(){var e=this.getView().byId("manageSubsTable");var t=e.getBinding("items");var a=this.getView().getModel().getProperty("/bindingValue");var s=new Sorter(a);t.sort(s);this._oResponsivePopover.close()},onDescending:function(){var e=this.getView().byId("manageSubsTable");var t=e.getBinding("items");var a=this.getView().getModel().getProperty("/bindingValue");var s=new Sorter(a,true);t.sort(s);this._oResponsivePopover.close()},onOpen:function(e){var t=sap.ui.getCore().byId(e.getParameter("id"));var a=t.getContent()[0];var s=a.getItems()[2];var i=s.getContent()[0];var r=i.getItems()[1];r.focus();r.$().find(".sapMInputBaseInner")[0].select()},onUpdateFinished:function(e){var t="Payment Records";var a=this.getView().byId("manageSubsTable");var s=a.getItems();var i=s.length;for(var r=0;r<i;r++){var n=s[r].getCells()[2].getText();var o="Courses('"+n+"')";var l=this.getView().getModel().oData[o];if(l){var u=l.BatchNo+": "+l.Name;s[r].getCells()[2].setText(u);s[r].getCells()[7].setEnabled(Boolean(l.link&&l.link.includes("AnubhavTrainings")))}var d=s[r].getCells()[0].getText();var g="Students('"+d+"')";var p=this.allStudnets[d];if(p){var c=p.GmailId;s[r].getCells()[0].setText(c)}}if(a.getBinding("items").isLengthFinal()){var h=e.getParameter("total");if(this.totalCount===0||this.totalCount<h){this.totalCount=h}var m=a.getItems().length;t+="("+m+"/"+this.totalCount+")"}this.getView().byId("titletext").setText(t)},onTableSettings:function(e){this._oDialog=sap.ui.xmlfragment("oft.fiori.fragments.subsSearchSettingsDialog",this);this._oDialog.open()},onPartPaySearch:function(e){var t=this.getQuery(e);if(t){var a;var s;if(t==="true"||t==="false"){a=new sap.ui.model.Filter("PartialPayment",sap.ui.model.FilterOperator.EQ,t);var i=new sap.ui.model.Filter({filters:[a],and:false});var r=[i];this.getView().byId("manageSubsTable").getBinding("items").filter(r)}else{this.getView().byId("manageSubsTable").getBinding("items").filter([])}}else{this.getView().byId("manageSubsTable").getBinding("items").filter([])}},onStuSearch:function(e){debugger;this.dateString1=this.getView().byId("idBatchEndate");if(this.dateString1._lastValue!=false){var t=this.dateString1._lastValue.split(".");var a=new Date(t[2],t[1]-1,t[0]);a.setHours(0,0,0,0);this.oFilter_date1=new sap.ui.model.Filter("EndDate","GE",a)}else{this.oFilter_date1=new sap.ui.model.Filter}this.CourseString=this.getView().byId("idCourseSearch").getValue();var s=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;var i=this.getQuery(e);if(i){var r;var n;if(s.test(i)){var o=this;var l={};var u=new sap.ui.model.Filter("GmailId","EQ",i);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Students","GET",{filters:[u]},l,this).then(function(e){var t=o;debugger;o.aFilter2=[new sap.ui.model.Filter("StudentId","EQ","'"+e.results[0].id+"'")];if(o.dateString1._lastValue!=false){o.aFilter2.push(o.oFilter_date1)}var a=o.getView().byId("idPendingPayment").getSelectedKey();if(a==="true"){var s=new sap.ui.model.Filter("PendingAmount","GT",0);o.aFilter2.push(s)}else if(a==="false"){var i=new sap.ui.model.Filter("PendingAmount","EQ",0);o.aFilter2.push(i)}if(o.CourseString){var r={};var n=new sap.ui.model.Filter("Name","EQ",o.CourseString);o.ODataHelper.callOData(o.getOwnerComponent().getModel(),"/Courses","GET",{filters:[n]},r,o).then(function(e){if(e.results.length>0){var a;debugger;for(var s=0;s<e.results.length;s++){a=new sap.ui.model.Filter("CourseId","EQ","'"+e.results[s].id+"'");t.aFilter2.push(a)}o.getView().byId("manageSubsTable").getBinding("items").filter(t.aFilter2)}}).catch(function(e){debugger})}else{o.getView().byId("manageSubsTable").getBinding("items").filter(o.aFilter2)}}).catch(function(e){debugger})}else{this.getView().byId("manageSubsTable").getBinding("items").filter([])}}else{this.getView().byId("manageSubsTable").getBinding("items").filter([])}},onCourseSearch:function(e){debugger;this.dateString=this.getView().byId("idBatchEndate");if(this.dateString._lastValue!=false){var t=this.dateString._lastValue.split(".");var a=new Date(t[2],t[1]-1,t[0]);a.setHours(0,0,0,0);this.oFilter_date=new sap.ui.model.Filter("EndDate","GE",a)}else{this.oFilter_date=new sap.ui.model.Filter}this.StuString=this.getView().byId("idStuSearch").getValue();var s=this.getQuery(e);if(s){var i=this;var r={};var n=new sap.ui.model.Filter("Name","EQ",s);var o=s;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Courses","GET",{filters:[n]},r,this).then(function(e){var t=o;if(e.results.length>0){i.aFilter1=[];var a=i.getView().byId("idPendingPayment").getSelectedKey();if(a==="true"){var s=new sap.ui.model.Filter("PendingAmount","GT",0);i.aFilter1.push(s)}else if(a==="false"){var r=new sap.ui.model.Filter("PendingAmount","EQ",0);i.aFilter1.push(r)}var n;debugger;for(var l=0;l<e.results.length;l++){n=new sap.ui.model.Filter("CourseId","EQ","'"+e.results[l].id+"'");i.aFilter1.push(n)}if(i.dateString._lastValue!=false){i.aFilter1.push(i.oFilter_date)}var u=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;if(u.test(i.StuString)){var d=i;var g={};var p=new sap.ui.model.Filter("GmailId","EQ",i.StuString);i.ODataHelper.callOData(i.getOwnerComponent().getModel(),"/Students","GET",{filters:[p]},g,i).then(function(e){debugger;var t=new sap.ui.model.Filter("StudentId","EQ","'"+e.results[0].id+"'");d.aFilter1.push(t);d.getView().byId("manageSubsTable").getBinding("items").filter(d.aFilter1)}).catch(function(e){debugger})}else{i.getView().byId("manageSubsTable").getBinding("items").filter(i.aFilter1)}}else{debugger;var d=i;var c=new sap.ui.model.Filter("BatchNo","EQ",t);i.ODataHelper.callOData(i.getOwnerComponent().getModel(),"/Courses","GET",{filters:[c]},null,i).then(function(e){if(e.results.length>0){var t=[new sap.ui.model.Filter("CourseId","EQ","'"+e.results[0].id+"'")];if(d.dateString._lastValue!=false){t.push(d.oFilter_date)}d.getView().byId("manageSubsTable").getBinding("items").filter(t)}}).catch(function(e){debugger})}}).catch(function(e){debugger})}else{if(this.dateString._lastValue!=false){this.getView().byId("manageSubsTable").getBinding("items").filter([this.oFilter_date])}else{this.getView().byId("manageSubsTable").getBinding("items").filter([])}}},onChangePendingPay:function(e){var t=e.getSource().getSelectedKey();if(t==="true"){var a=new sap.ui.model.Filter("PendingAmount","GT",0);this.getView().byId("manageSubsTable").getBinding("items").filter([a])}else if(t==="false"){var s=new sap.ui.model.Filter("PendingAmount","EQ",0);this.getView().byId("manageSubsTable").getBinding("items").filter([s])}else{this.getView().byId("manageSubsTable").getBinding("items").filter([])}},onTabSearch:function(e){debugger;var t=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;var a=this.getQuery(e);if(a){var s;var i;if(a==="true"||a==="false"){s=new sap.ui.model.Filter("PartialPayment",sap.ui.model.FilterOperator.EQ,a);var r=new sap.ui.model.Filter({filters:[s],and:false});var n=[r];this.getView().byId("manageSubsTable").getBinding("items").filter(n)}else{if(t.test(a)){var o=this;var l={};var u=new sap.ui.model.Filter("GmailId","EQ",a);var d=new sap.ui.model.Filter("OtherEmail1","EQ",a);var g=new sap.ui.model.Filter("OtherEmail2","EQ",a);var r=new sap.ui.model.Filter({filters:[u,d,g],and:false});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Students","GET",{filters:[r]},l,this).then(function(e){debugger;var t=[new sap.ui.model.Filter("StudentId","EQ","'"+e.results[0].id+"'")];o.getView().byId("manageSubsTable").getBinding("items").filter(t)}).catch(function(e){debugger})}else{var o=this;var l={};var u=new sap.ui.model.Filter("Name","EQ",a);var p=a;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Courses","GET",{filters:[u]},l,this).then(function(e){var t=p;if(e.results.length>0){var a=[];var s;debugger;for(var i=0;i<e.results.length;i++){s=new sap.ui.model.Filter("CourseId","EQ","'"+e.results[i].id+"'");a.push(s)}o.getView().byId("manageSubsTable").getBinding("items").filter(a)}else{debugger;var r=o;var n=new sap.ui.model.Filter("BatchNo","EQ",t);o.ODataHelper.callOData(o.getOwnerComponent().getModel(),"/Courses","GET",{filters:[n]},null,o).then(function(e){if(e.results.length>0){var t=[new sap.ui.model.Filter("CourseId","EQ","'"+e.results[0].id+"'")];r.getView().byId("manageSubsTable").getBinding("items").filter(t)}}).catch(function(e){debugger})}}).catch(function(e){debugger})}}}else{debugger;this.getView().byId("manageSubsTable").getBinding("items").filter([])}},onClearSearchFilter:function(e){var t=[];this.getView().byId("idBatchEndate").setValue(null);this.getView().byId("idStuSearch").setValue(null);this.getView().byId("idCourseSearch").setValue(null);this.getView().byId("idPartPaySearch").setSelectedKey(null);this.getView().byId("idPendingPayment").setSelectedKey(null);this.getView().byId("manageSubsTable").getBinding("items").filter(t)},onConfirmSetting:function(e){debugger;var t=this.getView();var a=t.byId("manageSubsTable");var s=e.getParameters();var i=a.getBinding("items");var r=[];if(s.groupItem){var n=s.groupItem.getKey();var o=s.groupDescending;var l=function(e){var t=e.getProperty("StudentId");return{key:t,text:t}};r.push(new sap.ui.model.Sorter(n,o,l))}var u=s.sortItem.getKey();var o=s.sortDescending;r.push(new sap.ui.model.Sorter(u,o));i.sort(r)},onSwitchToggle:function(e){debugger;var t=e.getSource().getState();var a=this.getQuery(e);if(t===true){var s=new sap.ui.model.Filter("MostRecent","EQ",true);var i=new sap.ui.model.Filter({filters:[s],and:false});var r=[i];this.getView().byId("manageSubsTable").getBinding("items").filter(r)}else{var n=new sap.ui.model.Filter("MostRecent","EQ",true);var o=new sap.ui.model.Filter("MostRecent","EQ",false);var l=new sap.ui.model.Filter({filters:[n,o],and:false});var u=[l];this.getView().byId("manageSubsTable").getBinding("items").filter(u)}},onDelete:function(e){var a=this;t.confirm("Do you want to delete the selected records?",function(e){if(e=="OK"){var t=a.getView().byId("manageSubsTable").getSelectedContexts();a.totalCount=a.totalCount-t.length;for(var s=0;s<t["length"];s++){a.ODataHelper.callOData(a.getOwnerComponent().getModel(),t[s].sPath,"DELETE",{},{},a).then(function(e){sap.m.MessageToast.show("Deleted succesfully")}).catch(function(e){a.getView().setBusy(false);a.oPopover=a.getErrorMessage(e);a.getView().setBusy(false)})}}},"Confirmation")},formatRowHighlight:function(e){if(e===true){return"Error"}else if(e==false){return"Success"}},onBack:function(){sap.ui.getCore().byId("idApp").to("idView1")},onStudentIdChange:function(e){var t=e.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;t=t.split("/")[1];var a=this.getView().getModel().oData[t].StudentId;a="Students('"+a+"')";var s=this.getView().getModel().oData[a];if(s){var i=s.GmailId;e.getSource().setText(i)}else{var r="Email Not Found";e.getSource().setText(r)}},doReload:function(e){var t=this.byId("manageSubsTable");var a=t.getBinding("items");a.filter(e)},onResetFilter:function(e){var t="onReset trigered";a.show(t);this.doReload()},onSearchFilter:function(e){var t=e.getSource().getFilterItems();var a=this.getView().byId("idFilterBar");var s=a.determineFilterItemByName("PaymentDate");var i=a.determineFilterItemByName("PaymentDueDate");var r=a.determineFilterItemByName("PartialPayment")},onClearFilter:function(e){var t="onClear trigered";a.show(t)},onLiveSearch:function(e){debugger;var t=e.getParameter("query");if(!t){t=e.getParameter("value")}if(this.sId.indexOf("idbatchId")!==-1){if(t){var a=new sap.ui.model.Filter("Name",sap.ui.model.FilterOperator.Contains,t);var s=new sap.ui.model.Filter("BatchNo",sap.ui.model.FilterOperator.Contains,t);var i=new sap.ui.model.Filter({filters:[a,s],and:false});var r=[i];this.searchPopup.getBinding("items").filter(r)}else{this.searchPopup.bindAggregation("items",{path:"/Courses",template:new sap.m.DisplayListItem({label:"{Name}",value:"{BatchNo}"})});this.searchPopup.getBinding("items").filter([]);var n=this.searchPopup.getBinding("items");var o=[];var l="EndDate";var u=true;o.push(new sap.ui.model.Sorter(l,u));n.sort(o)}}else if(this.sId.indexOf("accountDetails")!==-1){if(t){var a=new sap.ui.model.Filter("value",sap.ui.model.FilterOperator.Contains,t);var s=new sap.ui.model.Filter("key",sap.ui.model.FilterOperator.Contains,t);var i=new sap.ui.model.Filter({filters:[a,s],and:false});var r=[i];this.searchPopup.getBinding("items").filter(r)}else{this.searchPopup.bindAggregation("items",{path:"local>/accountSet",template:new sap.m.DisplayListItem({label:"{local>value}",value:"{local>key}"})});this.searchPopup.getBinding("items").filter([])}}},onSearch:function(e){debugger;if(this.sId.indexOf("idbatchId")!==-1){var t=this.getQuery(e);if(t){var a=new sap.ui.model.Filter("Name",sap.ui.model.FilterOperator.Contains,t);var s=new sap.ui.model.Filter("BatchNo",sap.ui.model.FilterOperator.Contains,t);var i=new sap.ui.model.Filter({filters:[a,s],and:false});var r=[i];this.searchPopup.getBinding("items").filter(r)}else{this.searchPopup.bindAggregation("items",{path:"/Courses",template:new sap.m.DisplayListItem({label:"{Name}",value:"{BatchNo}"})});this.searchPopup.getBinding("items").filter([])}}},onSearchSmart:function(e){var t=this.getView().byId("smartFilterBar").getFilterData();var a=this.getView().byId("smartFilterBar").getFilters();this.getView().byId("manageSubsTable").getBinding("items").filter(a)},handleEvent1:function(e,t,a){sap.ui.getCore().byId("myApp").to("idSecond")},onDataReceive:function(e){debugger},oSuppPopup:null,destoryDialog:function(){this.oSuppPopup.destroy();this.oSuppPopup=null},onItemPress:function(e){if(!this.oSuppPopup){this.oSuppPopup=new sap.ui.xmlfragment("oft.fiori.fragments.subSearch",this);sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup,true);this.getView().addDependent(this.oSuppPopup)}var t=e.getSource().oBindingContexts.undefined.sPath;t=t.split("/")[1];var a=this.getView().getModel().oData[t];this.gModel=a;if(a.PartialPayment===false&&a.MostRecent===true&&a.EndDate<=new Date){sap.ui.getCore().byId("idExtendSubs").setEnabled(true)}else{sap.ui.getCore().byId("idExtendSubs").setEnabled(false)}if(a.PartialPayment===false&&a.Extended===false){sap.ui.getCore().byId("idPortSubs").setEnabled(true)}else{sap.ui.getCore().byId("idPortSubs").setEnabled(false)}if(a.PendingAmount===0||!a.PendingAmount||a.MostRecent===false){sap.ui.getCore().byId("idCourse_upd").setEnabled(false);sap.ui.getCore().byId("idPayDate_upd").setEnabled(false);this.getView().getModel("local").setProperty("/newRegistration/PaymentDate",a.PaymentDate);sap.ui.getCore().byId("idEndDate_upd").setEnabled(false);this.getView().getModel("local").setProperty("/newRegistration/EndDate",a.EndDate);sap.ui.getCore().byId("paymentMode_upd").setEnabled(false);sap.ui.getCore().byId("accountDetails_upd").setEnabled(false);sap.ui.getCore().byId("idAmount_upd").setEnabled(false);this.getView().getModel("local").setProperty("/newRegistration/Amount",a.Amount);sap.ui.getCore().byId("idAmount_Txt").setText("Amount");sap.ui.getCore().byId("idReference_upd").setEnabled(false);sap.ui.getCore().byId("idRemarks_upd").setEnabled(false);sap.ui.getCore().byId("idPendingAmount_upd").setEnabled(false);sap.ui.getCore().byId("idPayDueDate_upd").setEnabled(false);this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate",a.PaymentDueDate);sap.ui.getCore().byId("updPay").setEnabled(false)}else{sap.ui.getCore().byId("idPayDate_upd").setEnabled(true);sap.ui.getCore().byId("paymentMode_upd").setEnabled(true);sap.ui.getCore().byId("accountDetails_upd").setEnabled(true);sap.ui.getCore().byId("idAmount_upd").setEnabled(true);sap.ui.getCore().byId("idReference_upd").setEnabled(true);sap.ui.getCore().byId("idRemarks_upd").setEnabled(true);sap.ui.getCore().byId("idPendingAmount_upd").setEnabled(true);sap.ui.getCore().byId("idPayDueDate_upd").setEnabled(true);sap.ui.getCore().byId("idEndDate_upd").setEnabled(true);sap.ui.getCore().byId("updPay").setEnabled(true);this.getView().getModel("local").setProperty("/newRegistration/EndDate",this.formatter.getIncrementDate(a.EndDate,0));this.getView().getModel("local").setProperty("/newRegistration/PaymentDate",this.formatter.getFormattedDate(0));this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate",this.formatter.getFormattedDate(1))}this.customerEmail=e.getSource().mAggregations.cells[0].mProperties.text;this.courseName=e.getSource().mAggregations.cells[2].mProperties.text;this.prevPendingAmiount=a.PendingAmount;this.getView().getModel("local").setProperty("/newRegistration/StudentId",this.customerEmail);this.getView().getModel("local").setProperty("/newRegistration/CourseId",this.courseName);this.getView().getModel("local").setProperty("/newRegistration/PaymentMode",a.PaymentMode);this.getView().getModel("local").setProperty("/newRegistration/AccountName",a.AccountName);if(a.PendingAmount){this.getView().getModel("local").setProperty("/newRegistration/Amount",a.PendingAmount)}this.getView().getModel("local").setProperty("/newRegistration/Reference",a.Reference);this.getView().getModel("local").setProperty("/newRegistration/Remarks",a.Remarks);this.getView().getModel("local").setProperty("/newRegistration/PendingAmount",0);this.getView().getModel("local").setProperty("/newRegistration/AccountName",a.AccountName);this.getView().getModel("local").setProperty("/BeneficiaryName",this.getAccountBeneficiary(a.AccountName));this.getView().getModel("local").setProperty("/newRegistration/subGuid",a.id);this.oSuppPopup.open()},oExtendPopup:null,onExtendSubs:function(e){debugger;if(!this.oExtendPopup){this.oExtendPopup=new sap.ui.xmlfragment("oft.fiori.fragments.subSearchExtend",this);sap.ui.getCore().getMessageManager().registerObject(this.oExtendPopup,true);this.getView().addDependent(this.oExtendPopup)}debugger;var t=this.courseName.split(":");sap.ui.getCore().byId("idbatchId").setValue(t[0]);sap.ui.getCore().byId("idbatchName").setText(t[1]);this.getView().getModel("local").setProperty("/newRegExtension/PaymentDate",this.formatter.getFormattedDate(0));this.getView().getModel("local").setProperty("/newRegExtension/EndDate",this.formatter.getFormattedDate(1));this.getView().getModel("local").setProperty("/newRegExtension/Amount",1e3);this.getView().getModel("local").setProperty("/newRegExtension/Reference",null);this.getView().getModel("local").setProperty("/newRegExtension/AccountName",null);this.oExtendPopup.open()},onPortSubs:function(e){sap.ui.getCore().byId("idCourse_upd").setEnabled(true);sap.ui.getCore().byId("idPortSubs").setEnabled(false);sap.ui.getCore().byId("idExtendSubs").setEnabled(false);portClicked=true},onPayDateChange:function(e){debugger;var t=e.getSource().getValue();var a=t.split(".");var s=new Date(a[2],a[1]-1,a[0]);var i=this.formatter.getIncrementDate(s,1);this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate",i)},onAmountChange:function(e){var t;if(this.prevPendingAmiount){t=this.prevPendingAmiount-e.getSource().getValue()}else{t=0-e.getSource().getValue()}if(t<0){t=0}this.getView().getModel("local").setProperty("/newRegistration/PendingAmount",t)},onClose:function(){this.oSuppPopup.close();portClicked=false},onCloseExtend:function(){this.oExtendPopup.close()},onCreateNewPayment:function(e){var t=e;var a=this;var s=this.getView().getModel("local").getProperty("/newRegistration");if(portClicked==false){if(sap.ui.getCore().byId("idPayDate_upd").getDateValue()){var i=this.formatter.getDateCheck(sap.ui.getCore().byId("idPayDate_upd").getDateValue());if(i==true){sap.m.MessageToast.show("Payment Date can't be in future");return""}}if(!sap.ui.getCore().byId("idAmount_upd").getValue()||sap.ui.getCore().byId("idAmount_upd").getValue()<=0){if(sap.ui.getCore().byId("idAmount_upd").getValue()<0){sap.m.MessageToast.show("Amount can't be less than 0");return""}}if(sap.ui.getCore().byId("idPendingAmount_upd").getValue()<0){sap.m.MessageToast.show("Pending Amount can't be less than 0");return""}if(sap.ui.getCore().byId("idPayDueDate_upd").getDateValue()){var r=sap.ui.getCore().byId("idPayDueDate_upd").getValue().split(".");var n=sap.ui.getCore().byId("idPayDate_upd").getValue().split(".");n=n[2]+n[1]+n[0];r=r[2]+r[1]+r[0];if(n>r){sap.m.MessageToast.show("Payment Due Date can't be less than Payment Date");return""}}if(s.PendingAmount===0||s.PendingAmount===""){s.PartialPayment=false}a.getView().setBusy(true);var o="/Subs";o=o+"("+"'"+s.subGuid+"'"+")";debugger;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),o,"GET",null,null,a).then(function(e){debugger;var t={StudentId:e.StudentId,CourseId:e.CourseId,PaymentDate:sap.ui.getCore().byId("idPayDate_upd").getDateValue(),Mode:e.Mode,StartDate:sap.ui.getCore().byId("idPayDate_upd").getDateValue(),EndDate:sap.ui.getCore().byId("idEndDate_upd").getDateValue(),PaymentMode:s.PaymentMode,BankName:e.BankName,AccountName:s.AccountName,Amount:s.Amount,Reference:s.Reference,Remarks:e.Remarks,PendingAmount:s.PendingAmount,Waiver:e.Waiver,PartialPayment:s.PartialPayment,PaymentDueDate:sap.ui.getCore().byId("idPayDueDate_upd").getDateValue(),PaymentScreenshot:e.PaymentScreenshot,CreatedOn:e.CreatedOn,CreatedBy:e.CreatedBy,ChangedOn:new Date,ChangedBy:"DemoUser",DropOut:e.DropOut,Extra1:e.Extra1,Extra2:e.Extra2,ExtraN1:e.ExtraN1,ExtraN2:e.ExtraN2,ExtraN3:e.ExtraN3,Status:e.Status,UpdatePayment:true,MostRecent:true};var i=a;a.ODataHelper.callOData(a.getOwnerComponent().getModel(),"/Subs","POST",{},t,i).then(function(e){debugger;course_id=e.CourseId;student_id=e.StudentId;part_pay=e.PartialPayment;subsId=e.id;var t=i;i.ODataHelper.callOData(i.getOwnerComponent().getModel(),"/Subs","GET",null,null,t).then(function(e){debugger;console.log(e.results);var a=e.results.length;for(var s=0;s<a;s++){if(e.results[s].StudentId===student_id&&e.results[s].CourseId===course_id&&e.results[s].id!=subsId){var i={};if(part_pay===true){i={MostRecent:"false"}}else if(part_pay===false){i={PartialPayment:"false",MostRecent:"false"}}var r="/Subs";r=r+"("+"'"+e.results[s].id+"'"+")";t.ODataHelper.callOData(t.getOwnerComponent().getModel(),r,"PUT",{},i,t).then(function(e){debugger}).catch(function(e){t.getView().setBusy(false);var a=t.getErrorMessage(e);debugger})}}}).catch(function(e){i.getView().setBusy(false);var t=i.getErrorMessage(e);debugger});i.getView().setBusy(false);sap.m.MessageToast.show("Subscription Updated")}).catch(function(e){i.getView().setBusy(false);var t=i.getErrorMessage(e);debugger});a.oSuppPopup.close()}).catch(function(e){debugger;a.getView().setBusy(false);var t=a.getErrorMessage(e);a.oSuppPopup.close()})}else if(portClicked==true){debugger;portClicked=false;this.getView().setBusy(true);var l=this.gModel.CourseId;var o="/Subs";o=o+"("+"'"+s.subGuid+"'"+")";debugger;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),o,"GET",null,null,this).then(function(e){debugger;course_id=e.CourseId;student_id=e.StudentId;var t=a;a.ODataHelper.callOData(a.getOwnerComponent().getModel(),"/Subs","GET",{filters:[new sap.ui.model.Filter("StudentId",sap.ui.model.FilterOperator.EQ,"'"+student_id+"'")]},null,a).then(function(e){var a=e.results.length;for(var s=0;s<a;s++){if(e.results[s].StudentId===student_id&&e.results[s].CourseId===course_id){var i=t;SubId_upd=e.results[s].id;var r="/Courses";r=r+"("+"'"+course_id+"'"+")";t.ODataHelper.callOData(t.getOwnerComponent().getModel(),r,"GET",null,null,t).then(function(e){debugger;var t=i;var a=e.BatchNo;var s="/Courses";s=s+"("+"'"+l+"'"+")";i.ODataHelper.callOData(i.getOwnerComponent().getModel(),s,"GET",null,null,i).then(function(e){debugger;var s=e.BatchNo;var i=a+" to "+s+" on "+(new Date).toString();var r={Remarks:i,CourseId:l,Extra1:new Date};var n="/Subs";n=n+"("+"'"+SubId_upd+"'"+")";var o=t;t.ODataHelper.callOData(t.getOwnerComponent().getModel(),n,"PUT",{},r,t).then(function(e){sap.m.MessageToast.show("Subscriptions Updated");o.oSuppPopup.close()}).catch(function(e){o.getView().setBusy(false);var t=o.getErrorMessage(e);debugger})}).catch(function(e){t.getView().setBusy(false);var a=t.getErrorMessage(e);debugger})}).catch(function(e){i.getView().setBusy(false);var t=i.getErrorMessage(e);debugger})}}}).catch(function(e){t.getView().setBusy(false);var a=t.getErrorMessage(e);debugger});a.getView().setBusy(false)}).catch(function(e){debugger;a.getView().setBusy(false);var t=a.getErrorMessage(e)})}},onExtendSave:function(e){var t=this;debugger;var a=this.getView().getModel("local").getProperty("/newRegExtension");if(sap.ui.getCore().byId("idPayDate_upd1").getDateValue()){var s=this.formatter.getDateCheck(sap.ui.getCore().byId("idPayDate_upd1").getDateValue());if(s==true){sap.m.MessageToast.show("Payment Date can't be in future");return""}}if(!sap.ui.getCore().byId("idAmount_upd1").getValue()||sap.ui.getCore().byId("idAmount_upd1").getValue()<=0){if(sap.ui.getCore().byId("idAmount_upd1").getValue()<0){sap.m.MessageToast.show("Amount can't be less than 0");return""}}if(sap.ui.getCore().byId("idExtendDate").getDateValue()){var i=sap.ui.getCore().byId("idExtendDate").getValue().split(".");var r=sap.ui.getCore().byId("idPayDate_upd1").getValue().split(".");r=r[2]+r[1]+r[0];i=i[2]+i[1]+i[0];if(r>i){sap.m.MessageToast.show("Extension Date can't be less than Payment Date");return""}}var n=sap.ui.getCore().byId("imageUploader2");var o=n.getFocusDomRef();var l=o.files[0];if(l){var t=this;var u=l.name.split(".");var d=u.length;var g=u[d-1];if(g=="jpg"||g=="jpeg"||g=="png"||g=="JPG"||g=="JPEG"||g=="PNG"){var p=new FileReader;p.onload=function(e){if(g=="jpg"||g=="jpeg"||g=="JPG"||g=="JPEG"){t.screenShotContent=e.currentTarget.result.replace("data:image/jpeg;base64,","")}else{t.screenShotContent=e.currentTarget.result.replace("data:image/png;base64,","")}};p.readAsDataURL(l)}else{sap.m.MessageToast.show("Upload only jpg/png files");sap.ui.getCore().byId("imageUploader2").setValue(null);return""}}if(!sap.ui.getCore().byId("idAmount_upd1").getValue()||sap.ui.getCore().byId("idAmount_upd1").getValue()==0){var c=true}else{var c=false}if(!course_Guid){course_Guid=this.gModel.CourseId}this.getView().setBusy(true);var h={StudentId:this.gModel.StudentId,CourseId:this.gModel.CourseId,PaymentDate:sap.ui.getCore().byId("idPayDate_upd1").getDateValue(),Mode:this.gModel.Mode,StartDate:sap.ui.getCore().byId("idPayDate_upd1").getDateValue(),EndDate:sap.ui.getCore().byId("idExtendDate").getDateValue(),PaymentMode:a.PaymentMode,BankName:this.gModel.BankName,AccountName:a.AccountName,Amount:a.Amount,Reference:a.Reference,Remarks:"Extended on "+(new Date).toString(),PendingAmount:0,Waiver:c,PartialPayment:false,Extended:true,PaymentDueDate:null,PaymentScreenshot:this.screenShotContent,CreatedOn:this.gModel.CreatedOn,CreatedBy:this.gModel.CreatedBy,ChangedOn:new Date,ChangedBy:"DemoUser",DropOut:this.gModel.DropOut,Extra1:this.gModel.Extra1,Extra2:this.gModel.Extra2,ExtraN1:this.gModel.ExtraN1,ExtraN2:this.gModel.ExtraN2,ExtraN3:this.gModel.ExtraN3,Status:this.gModel.Status,UpdatePayment:true,MostRecent:true};console.log(h);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Subs","POST",{},h,this).then(function(e){var a={MostRecent:"false"};var s="/Subs";s=s+"("+"'"+t.gModel.id+"'"+")";var i=t;t.ODataHelper.callOData(t.getOwnerComponent().getModel(),s,"PUT",{},a,i).then(function(e){debugger;i.getView().setBusy(false);i.oExtendPopup.close();i.oSuppPopup.close();sap.ui.getCore().byId("idExtendSubs").setEnabled(false);sap.ui.getCore().byId("imageUploader2").setValue(null);sap.m.MessageToast.show("Subscription Extended")}).catch(function(e){debugger;i.getView().setBusy(false);var a=t.getErrorMessage(e)})}).catch(function(e){debugger;t.getView().setBusy(false);var a=t.getErrorMessage(e)})},BatchPopupClose:function(e){debugger},onSelect:function(e){this.sId=e.getSource().getId();debugger;var t="",a="";if(this.sId.indexOf("accountDetails_upd")!==-1||this.sId.indexOf("accountDetails_upd1")!==-1){var s=new sap.ui.model.Filter("deleted",i.EQ,false);var n=new sap.ui.model.Sorter({path:"value",descending:false});t="Account Search";a="local>/accountSet";this.getCustomerPopup();var o="Account Search";this.searchPopup.setTitle(o);this.searchPopup.bindAggregation("items",{path:"local>/accountSet",filters:[s],sorter:n,template:new sap.m.DisplayListItem({label:"{local>value}",value:"{local>key}"})})}else if(this.sId.indexOf("idbatchId")!==-1||this.sId.indexOf("idCourse_upd")!==-1||this.sId.indexOf("idCourseSearch")!==-1){var l=new r("hidden",i.EQ,false);this.getCustomerPopup();var o=this.getView().getModel("i18n").getProperty("batch");this.searchPopup.setTitle(o);this.searchPopup.bindAggregation("items",{path:"/Courses",filters:[l],template:new sap.m.DisplayListItem({label:"{Name}",value:"{BatchNo}"})})}else if(this.sId.indexOf("idStuSearch")!==-1){this.getCustomerPopup();var o=this.getView().getModel("i18n").getProperty("customer");this.searchPopup.setTitle(o);this.searchPopup.bindAggregation("items",{path:"/Students",template:new sap.m.DisplayListItem({label:"{Name}",value:"{GmailId}"})})}},onConfirm:function(e){debugger;if(this.sId.indexOf("accountDetails")!==-1){var t=e.getParameter("selectedItem").getValue();if(this.sId=="accountDetails_upd"){this.getView().getModel("local").setProperty("/newRegistration/AccountName",t)}else if(this.sId=="accountDetails_upd1"){this.getView().getModel("local").setProperty("/newRegExtension/AccountName",t)}}else if(this.sId.indexOf("idbatchId")!==-1){var a=this.getSelectedKey(e);var s=this.courseName.split(":");s[1].trimLeft();if(a[1]!=s[1].trimLeft()){sap.m.MessageToast.show("Please select batch with course name"+s[1]);sap.ui.getCore().byId("idbatchName").setText("Select correct course");sap.ui.getCore().byId("updPay1").setEnabled(false);sap.ui.getCore().byId("idbatchId").setValue(null);sap.ui.getCore().byId("idbatchName").setText(null)}else{sap.ui.getCore().byId("updPay1").setEnabled(true);sap.ui.getCore().byId("idbatchName").setText(a[1]);sap.ui.getCore().byId("idbatchId").setValue(a[0]);this.gModel.CourseId=a[2]}}else if(this.sId.indexOf("idCourse_upd")!==-1){var a=this.getSelectedKey(e);var s=this.courseName.split(":");s[1].trimLeft();if(a[1]!=s[1].trimLeft()){sap.m.MessageToast.show("Please select batch with course name"+s[1])}else{if(a[0]==s[0]){sap.m.MessageToast.show("Please select same course name with different BatchNo")}else{sap.ui.getCore().byId("updPay").setEnabled(true);sap.ui.getCore().byId("updPay").setText("Upadte");sap.ui.getCore().byId("idCourse_upd").setValue(a[0]+": "+a[1]);this.gModel.CourseId=a[2]}}}else if(this.sId.indexOf("idCourseSearch")!==-1){var a=this.getSelectedKey(e);this.SearchCourseGuid=a[2];this.getView().byId("idCourseSearch").setValue(a[0]+": "+a[1]);debugger}else if(this.sId.indexOf("idStuSearch")!==-1){debugger;var a=this.getSelectedKey(e);this.SearchStuGuid=a[2];this.getView().byId("idStuSearch").setValue(a[0])}},onSearchManageSubs:function(e){debugger;var t=[];if(this.SearchStuGuid){t.push(new sap.ui.model.Filter("StudentId","EQ","'"+this.SearchStuGuid+"'"))}if(this.SearchCourseGuid){t.push(new sap.ui.model.Filter("CourseId","EQ","'"+this.SearchCourseGuid+"'"))}var a=this.getView().byId("idBatchEndate");if(a._lastValue!=false){var s=a._lastValue.split(".");var i=new Date(s[2],s[1]-1,s[0]);i.setHours(0,0,0,0);var r=new sap.ui.model.Filter("EndDate","GE",i)}else{var r=new sap.ui.model.Filter}if(a._lastValue!=false){t.push(r)}var n=this.getView().byId("idPendingPayment").getSelectedKey();if(n==="true"){var o=new sap.ui.model.Filter("PendingAmount","GT",0);t.push(o)}else if(n==="false"){var o=new sap.ui.model.Filter("PendingAmount","EQ",0);t.push(o)}var l=this.getView().byId("idPartPaySearch").getSelectedKey();if(l==="true"){var u=new sap.ui.model.Filter("PartialPayment","EQ","true");t.push(u)}else if(l==="false"){var u=new sap.ui.model.Filter("PartialPayment","EQ","false");t.push(u)}this.getView().byId("manageSubsTable").getBinding("items").filter(t)},onDataExport:function(e){$.ajax({type:"GET",url:"SubDownload",success:function(e){sap.m.MessageToast.show("File Downloaded succesfully")},error:function(e,t,a){sap.m.MessageToast.show("error in downloading the excel file")}})},onMemberStateChange:function(e){var t=e.getSource().getBindingContext().sPath;var a=this;var s={Member:e.getParameter("state")};this.ODataHelper.callOData(this.getOwnerComponent().getModel(),t,"PUT",{},s,this).then(function(e){sap.m.MessageToast.show("State Modified")}).catch(function(e){a.getView().setBusy(false);var t=a.getErrorMessage(e)})},onAddMember:function(e){var t=this;var a=t.getView().byId("manageSubsTable").getSelectedContexts();for(var s=0;s<a["length"];s++){var i=a[s].getModel().getProperty(a[s].getPath());t.ODataHelper.callOData(t.getOwnerComponent().getModel(),"/Courses('"+i.CourseId+"')","GET",{},{},t).then(function(e){var t="https://manage.wix.com/dashboard/5364c41b-ca7d-4184-9aec-39408726278b/member-permissions/roles/"+e.RoleId;window.open(t)})}},onExpiredExport:function(e){$.ajax({type:"GET",url:"SubNotExpired",success:function(e){sap.m.MessageToast.show("File Downloaded succesfully")},error:function(e,t,a){sap.m.MessageToast.show("error in downloading the excel file")}})}})});