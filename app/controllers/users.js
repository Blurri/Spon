var User = require('../models/user');

exports.signup = function (req, res, next) {

	var newUser = new User(req.body);
	newUser.save(function (err, user){
		if (err) {
			return next(err);
		}
		req.logIn(user, function(err){
			if (err) {
				return next(err);
			}
			res.redirect('/');

		});
	});
}

exports.logout = function (req, res, next) {
	req.logout();
	res.redirect('/');
}
