declare var module: any;

import log4js = require('log4js');
let logger = log4js.getLogger("odata");


class InitSecurity {
	private User;
	private Role;
	private RoleMapping;

	constructor(app) {
		this.User = app.models.User;
		this.Role = app.models.Role;
		this.RoleMapping = app.models.RoleMapping;
	};

	public init() {
		// find user1 in db
		this.User.findOne({where: {email: 'anubhav\.abap@gmail\.com'}}).then((user) => {
			if(!user) {
				// create user if not already exists
				this.User.create({username: 'anubhav', email: 'anubhav\.abap@gmail\.com', password: 'Anurag420'}).then((user) => {
					if(user) {
						logger.debug(`User created: ${JSON.stringify(user.toJSON())}`);
						this.initRoleForUser(user);
					} else {
						logger.error(`user 'anubhav' could not be created. Program may not work as expected`);
					}
				});
			} else {
				this.initRoleForUser(user);
			}
		}).catch((err) => {
			logger.error(`error: ${err}`);
		});

		this.User.findOne({where: {email: 'install\.abap@gmail\.com'}}).then((user) => {
			if(!user) {
				// create user if not already exists
				this.User.create({username: 'minakshi', email: 'anubhav\.abap@gmail\.com', password: 'Minakshi@123'}).then((user) => {
					if(user) {
						logger.debug(`User created: ${JSON.stringify(user.toJSON())}`);
						this.initRoleForUser(user);
					} else {
						logger.error(`user 'minakshi' could not be created. Program may not work as expected`);
					}
				});
			} else {
				this.initRoleForUser(user);
			}
		}).catch((err) => {
			logger.error(`error: ${err}`);
		});
	};

	/**
	 * creates the role r_admin that grants access to the businesstrips model and assign it to
	 * the passed user
	 * @param user user to assign the role to
	 */
	private initRoleForUser(user:any) {
		this.Role.findOne({where: {name: 'r_admin'}, include: 'principals'}).then((role) => {
			if(!role) {
				this.Role.create({name: 'r_admin', description: 'grants general access to Admin functions'}).then((role) => {
					if(role) {
						logger.debug(`Role created: ${JSON.stringify(role.toJSON())}`);
						this.assignUserToRole('anubhav', role);
					} else {
						logger.error(`role 'r_admin' could not be created. Program may not work as expected`);
					}
				})
			} else {
				this.assignUserToRole(user, role);
			}
		});

		this.Role.findOne({where: {name: 'r_clerk'}, include: 'principals'}).then((role) => {
			if(!role) {
				this.Role.create({name: 'r_clerk', description: 'grants general access to Cleark'}).then((role) => {
					if(role) {
						logger.debug(`Role created: ${JSON.stringify(role.toJSON())}`);
						this.assignUserToRole('minakshi', role);
					} else {
						logger.error(`role 'r_clerk' could not be created. Program may not work as expected`);
					}
				})
			} else {
				this.assignUserToRole(user, role);
			}
		});

	}

	/**
	 * assigns the passed user to the passed role if not already done
	 * @param user user to assign to the role
	 * @param role role the user to assign to
	 */
	private assignUserToRole(user, role) {
		// Promise (then) does not work here
		this.RoleMapping.findOne({where: {principalType: this.RoleMapping.USER, principalId: user.id, roleId: role.id}}).then((roleMapping) => {
			if(!roleMapping) {
				role.principals.create({
					principalType: this.RoleMapping.USER,
					principalId: user.id
				}).then((roleMapping) => {
					logger.debug(`Rolemapping created: ${JSON.stringify(roleMapping.toJSON())}`);
				})
			}
		})
	}


}

module.exports = function initial_security(app) {
	logger.debug(`starting initial_security script`);
	let initSecurity:InitSecurity = new InitSecurity(app);
	initSecurity.init();
};
