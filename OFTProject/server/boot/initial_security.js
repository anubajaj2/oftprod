"use strict";
var log4js = require('log4js');
var logger = log4js.getLogger("odata");
var InitSecurity = (function () {
    function InitSecurity(app) {
        this.User = app.models.User;
        this.Role = app.models.Role;
        this.AppUser = app.models.AppUser;
        this.RoleMapping = app.models.RoleMapping;
    } ;
    InitSecurity.prototype.init = function () {
        var _this = this;
        // this.User.findOne({where: {email: 'anubhav.abap@gmail\.com'}}).then((user) => {
    		// 	if(!user) {
    		// 		// create user if not already exists
    		// 		this.User.create({username: 'kajol', email: 'kajoljain@evotrainingsolutions\.com', password: 'Kajol@123'}).then((user) => {
    		// 			if(user) {
    		// 				logger.debug(`User created: ${JSON.stringify(user.toJSON())}`);
    		// 				this.initRoleForUser(user);
    		// 			} else {
    		// 				logger.error(`user 'kajol' could not be created. Program may not work as expected`);
    		// 			}
    		// 		});
    		// 	} else {
    		// 		//this.initRoleForUser(user);
        //     debugger;
        //     user.updateAttribute('password', "Anubhav@123", function(err, user) {
        //                                                                          if (err) return res.sendStatus(404);
        //                                                                            console.log('> password reset processed successfully');
        //                                                                          }
        //     );
    		// 	}
    		// }).catch((err) => {
    		// 	logger.error(`error: ${err}`);
    		// });
    };
    return InitSecurity;
}());
module.exports = function initial_security(app) {
    logger.debug("starting initial_security script");
    var initSecurity = new InitSecurity(app);
    initSecurity.init();
};
//# sourceMappingURL=initial_security.js.map
