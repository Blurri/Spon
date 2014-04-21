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
				res.redirect('/');
			});
		})(req, res, next);
	})



	//EVENT ROUTES
	app.post('/event', auth.requiresLogin, EventController.create);
	
	app.get('/eventsList', EventController.eventsList);
	app.get('/myevents', auth.requiresLogin, EventController.myevents);

	app.get('/leaveEvent/:id', auth.requiresLogin, EventController.leaveEvent);
	app.get('/joinEvent/:id', auth.requiresLogin, EventController.joinEvent);
	app.get('/findEvent', EventController.eventForId);


	app.put('/joinEvent', auth.requiresLogin, EventController.joinEvent)
	app.put('/leaveEvent', auth.requiresLogin, EventController.leaveEvent);
	
	app.get('/eventChat/:id', EventController.chat);
	app.post('/addMessage/:id', EventController.addMessage);

	//PW reset
	
	app.get('/requestReset', function (req, res) {
		res.render('requestReset');
	})
	app.post('/pwReset', PasswortReset.requestPwReset);
	app.get('/pwReset/:guid/:email', PasswortReset.resetPw)
	app.post('/pwUpdate', PasswortReset.pwUpdate);

}