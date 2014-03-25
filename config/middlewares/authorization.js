//===============================
//Authorization.js
//===============================

/*
in this modul we check for authorization.
check if user is logged in when login is required.
later here we will also check if user has authorization
for some data usw. 
*/
'use strict';
//require loggin middleware
exports.requiresLogin = function (req, res, next) {
	if (!req.isAuthenticated()) {
		return res.send(401, 'User is not authorized.');
	}
	next();
};


// exports.customer = {
// 	hasAuthorization : function (req, res, next) {
// 		if (req.customer.user_id != req.user.id) {
// 			return res.send(401, 'User is not authorized');
// 		}
// 		next();
// 	}
// };