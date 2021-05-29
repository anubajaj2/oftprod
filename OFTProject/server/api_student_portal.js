// var express = require('express');

// var app = express();
// var $;
//
// require("jsdom").env("", function(err, window) {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     $ = require("jquery")(window);
//     // doSomething();
// });
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

async function studentPortal(type,endPoint,payload){
  var r=await login();
  return new Promise(function(resolve, reject) {
  switch (type.toUpperCase()) {
    case "GET":
      $.ajax({
      type: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        	"Authorization": "Bearer " + r.token
      },
         url:"http://localhost:3002/"+endPoint,
        async:true,
        // data:JSON.stringify(data),
        success:function(data) {
            resolve(data);
         },
         error:function(error){
          reject(error);
         }
       });
      break;
    case "POST":
      $.ajax({
      type: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
          "Authorization": "Bearer " + r.token
      },
         url:"http://localhost:3002/"+endPoint,
        async:true,
        data:JSON.stringify(payload),
        success:function(data) {
            resolve(data);
         },
         error:function(error){
          reject(error);
         }
       });
      break;
    case "PUT":
      $.ajax({
      type: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
          "Authorization": "Bearer " + r.token
      },
         url:"http://localhost:3002/"+endPoint,
        async:true,
        data:JSON.stringify(payload),
        success:function(data) {
            resolve(data);
         },
         error:function(error){
          reject(error);
         }
       });
      break;
  }
  });
}

 function login(){
  return new Promise(function(resolve, reject) {
    var data={
      email:"admin@gmail.com",
      password:"Welcome1"
    };
    $.ajax({
      type: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
         url:"http://localhost:3002/users/login",
        async:true,
        data:JSON.stringify(data),
        success:function(data) {
            resolve(data);
         },
         error:function(error){
          reject(error);
         }
       });


    // res.send("maza aavigiyo");
});
}
module.exports.studentPortal = studentPortal;
// app.listen(3002);
