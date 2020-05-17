'use strict';

module.exports = function(Course) {

    // var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    //validations
    Course.validatesPresenceOf('BatchNo', {message: 'Batch Cannot be blank'});
     Course.validatesPresenceOf('Name', {message: 'Course Cannot be blank'});
      Course.validatesPresenceOf('Fee', {message: 'Fee Cannot be blank'});

    // Course.validatesFormatOf('EmailId', {with: re, message: 'invalid email id'});
    // Course.validatesInclusionOf('Name', {
    //     in: ["UI5 and Fiori", "ABAP on HANA", "Launchpad", "HANA XS",  "Hybris C4C",
    //          "HANA Cloud Integration","S4HANA Extension","Adobe Forms","SAP Cloud Platform",
    //          "ABAP", "OOPS ABAP", "Webdynpro", "Workflow", "FPM","BRF", "Other", "ABAP on Cloud"], message: 'Course Name is not allowed'
    // });
    ///Parse microsoft ISO Date while read : /Date(1540319400000)/
    //jsonDate = "/Date(1540319400000)/"; var date = new Date(parseInt(jsonDate.substr(6)));
    Course.observe("before save",function(ctx, next){

    //  console.log("Context kya hai" + ctx.instance.EmailId  + "   " +  ctx.instance.CourseName);
      if(ctx.instance && ctx.instance.BatchNo ){

        Course.findOne({where: {and: [{BatchNo: ctx.instance.BatchNo}]}, limit: 1})
          .then(function (stu) {
            console.log(ctx.instance.BatchNo );
            if (stu) {
              console.log(JSON.stringify(stu));
              //var err = new Error(".Batch already exist, Added on "+ stu.CreatedOn.toString()+ ' Created by : '+ stu.CreatedBy.toString());
              var err = new Error(".Batch already exist");
              err.statusCode = 400;

              //console.log(err.toString());
              next(err);
            }
            else {
              //do nothing
              return next();
            }});
      }
      else{
        next();
      }
    });


};
