'use strict';

module.exports = function(ServerPay) {
	// var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	//validations
	var update;
	ServerPay.validatesPresenceOf('Amount', {
		message: 'Amount Cannot be blank'
	});

	ServerPay.observe("after delete", function(ctx, next) {

		ServerPay.find({
				where: {
					or: [{
						Type: "Payment"
					}, {
						Type: "Assignment"
					}]
				}
			})
			.then(function(Records, err) {
				var count = Records.length - 1;
				for (var i = count; i >= 0; i--) {
					if (i == count) {
						Records[i].__data.Extra = Records[i].__data.Amount;
					} else {
						Records[i].__data.Extra = Records[i + 1].__data.Extra + Records[i].__data.Amount;
					}
					ServerPay.updateAll({
						id: Records[i].__data.id.toString()
					}, {
						Extra: Records[i].__data.Extra
					}, function(ServerPay, error) {
						console.log(error);
						next();
					});
				}
			});
	});

	ServerPay.observe("before save", function(ctx, next) {
		var data = ctx.instance || ctx.data;

		if (ctx.options.Update == "U" || update == "X") {
			next();
			update = "X";
		}
		else if (ctx.instance){
			if(ctx.instance.__data.Update == "C"){
			ServerPay.find({
					where: {
						or: [{
							Type: "Payment"
						}, {
							Type: "Assignment"
						}]
					}
				})
				.then(function(Records, err) {
					if (err) {
						next(err);
					} else {
						if (data.Type == "Payment") {
							if (Records["length"] == 0) {
								data.Extra = data.Amount;
								next();
							} else {
								data.Extra = data.Amount + Records[0].__data.Extra;
								next();
							}
						} else {
							next();
						}
					}
				});}else{
					next();
				}

		}else{
			next();
		}
	});

	ServerPay.observe("after save", function(ctx, next) {
		var data = ctx.options;
		// next();
		// if (typeof ctx.options == "object") {
		if (data.Update == "U") {
			ServerPay.find({
					where: {
						or: [{
							Type: "Payment"
						}, {
							Type: "Assignment"
						}]
					}
				})
				.then(function(Records, err) {
					var count = Records.length - 1;
					for (var i = count; i >= 0; i--) {
						if (i == count) {
							Records[i].__data.Extra = Records[i].__data.Amount;
						} else {
							Records[i].__data.Extra = Records[i + 1].__data.Extra + Records[i].__data.Amount;
						}
						ServerPay.updateAll({
							id: Records[i].__data.id.toString()
						}, {
							Extra: Records[i].__data.Extra
						}, function(ServerPay, error) {
							console.log(error);
							next();
						});

					}

				});
		} else {
			next();
		}

		// }

	});

};