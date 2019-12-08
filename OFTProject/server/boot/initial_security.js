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

    };
    return InitSecurity;
}());
module.exports = function initial_security(app) {
    logger.debug("starting initial_security script");
    var initSecurity = new InitSecurity(app);
    initSecurity.init();
};
//# sourceMappingURL=initial_security.js.map
