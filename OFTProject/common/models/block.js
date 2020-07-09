'use strict';

module.exports = function(Block) {

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    Block.validatesFormatOf('EmailId', {with: re, message: 'invalid email id'});
    Block.observe("before save",function(ctx, next){
      var app = require('../../server/server');
      var AppUser = app.models.AppUser;
      //console.log("Context kya hai" + ctx.instance.EmailId  + "   " +   ctx.instance.CourseName);
      if(ctx.instance && ctx.instance.EmailId  && ctx.instance.CourseName){

        Block.findOne({where: {EmailId: ctx.instance.EmailId}, limit: 1})
          .then(function (inq) {
            console.log(ctx.instance.EmailId );
            if (inq) {
              //console.log(JSON.stringify(inq));
              AppUser.findOne({
        					where: {
        						and: [{
        							TechnicalId: ctx.instance.CreatedBy.toString()
        						}]
        					},
        					limit: 1
        				}).then(function(appUser){
                  var err = new Error(".Student already Blocked on "+ inq.ChangedOn + ' by : ' + inq.ChangedBy);
                  err.statusCode = 400;
                  console.log(err);
                  next(err);
                });

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
