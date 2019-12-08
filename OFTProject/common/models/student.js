'use strict';

module.exports = function(Student) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    //validations
    Student.validatesPresenceOf('Name', {message: 'Name Cannot be blank'});

    Student.validatesFormatOf('GmailId', {with: re, message: 'invalid email id'});

    Student.observe("before save",function(ctx, next){
      if(ctx.instance && ctx.instance.GmailId){
 
        Student.findOne({where: {and: [{GmailId: ctx.instance.GmailId}]}, limit: 1})
          .then(function (stu) {
            console.log(ctx.instance.GmailId );
            if (stu) {
              console.log(JSON.stringify(stu));
              var err = new Error(".Customer already exist, Added on "+ stu.CreatedOn.toString()+ ' Created by : '+ stu.CreatedBy.toString());
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