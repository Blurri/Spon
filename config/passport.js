//===============================
//Passport.js
//===============================

/*
Login Strategy
*/

var passport = require('passport'),
	mongoose = require('mongoose'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('../app/models/user');


	//  de- and serialization for session
	passport.serializeUser(function  (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function  (id, done) {
		User.findOne({
			_id : id
		}, '-salt -hashed_password', function  (err, user) {
			done(err, user);
		});
	});


	//=====================
	// Local Strategy
	//=====================
	passport.use(new LocalStrategy({
		usernameField : 'email',
		passwordFiels : 'password'
	},
	function (email, password, next, res) {
		User.findOne({
			email : email
		}, function (err, user) {
			if (err) {
				return next(err);
			}
			if (!user) {
				return next(new Error('Unkown user'));
				// return next(null, false); // unkown user
			}

			if (!user.authenticate(password)) {
				return next(new Error('Password wrong'));
				return next(null, false); // password wrong
			}
			return next(null, user);
		});
	}));


module.exports = passport;
