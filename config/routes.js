var UserController = require('../app/controllers/users');
var EventController = require('../app/controllers/events');
var PasswortReset = require('./passwordreset');

module.exports = function  (app, passport, auth) {
	
	app.post('/signup', UserController.signup);

	app.get('/logout', UserController.logout);

	app.post('/login', function (req, res, next) {
		passport.authenticate('local', function (err, user, info) {

			if (err) { return res.send({status : 'err', message: err.message}, 403) ;}

			if (!user) { return res.send({status : 'fail', message : info.message }, 403); }

			req.logIn(user, function (err) {
				if (err) { 

					return next(err);
				}

				// return res.json(user); OLD CODE
				res.redirect('/');
			});
		})(req, res, next);
	})



	//EVENT ROUTES
	app.post('/event', auth.requiresLogin, EventController.create);
	app.post('/eventlist', EventController.eventlist);
	app.get('/myevents', auth.requiresLogin, EventController.myevents);
	app.get('/leaveEvent/:id', auth.requiresLogin, EventController.leaveEvent);
	app.get('/joinEvent/:id', auth.requiresLogin, EventController.joinEvent);

	//PW reset
	// app.post('/pwReset/', PasswortReset.resetPassword);
	app.get('/pwReset', function (req, res) {
		res.render('requestReset');
	})
	app.post('/pwReset', PasswortReset.requestPwReset);
	app.get('/pwReset/:guid/:email', PasswortReset.resetPw)
	app.post('/pwUpdate', PasswortReset.pwUpdate);

}