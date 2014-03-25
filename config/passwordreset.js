
// DATE HELPER
Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}


Date.prototype.removeHours = function(h) {    
   this.setTime(this.getTime() - (h*60*60*1000)); 
   return this;   
}

var User = require('../app/models/user');

var Email;




module.exports.pwUpdate = function  (req, res, next) {
	var tminus30 = new Date();
	tminus30.removeHours(0.5);

	console.log(req.body.password);
	User.findOne({
		resetGuid : req.body.guid,
		resetDate : {
			$lt  : new Date(),
			$gt : tminus30
		} 
			, email : req.body.email }, function (err, user) {
		if (err) {
			return next(err);
		}

		// user.set('passsword', req.body.passsword);

		user.set('password', req.body.password);


		user.save(function (err, uUser) {
			if (err) {
				return next(err);
			}
			req.logIn(uUser, function(err){
				if (err) {
					return next(err);
				}
				console.log(uUser);
				return res.redirect('/');

			});
		})

	 })
}

module.exports.resetPw = function (req, res, next) {
	var guid = req.params.guid;
	var email = req.params.email;


	var tminus30 = new Date();
	tminus30.removeHours(0.5);
	
	User.findOne({
		resetGuid : guid,

		resetDate : {
			$lt  : new Date(),
			$gt : tminus30
		}
		, email : email }, function (err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new Error('No user found'));
		}
			
		res.render('pwReset', { guid : user.resetGuid, email : user.email });

	 })

	
	
}



module.exports.requestPwReset = function (req, res, next) {

	Email = req.body.email;
	User.findOne({email : req.body.email}, function (err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new Error("no user found"));
		}
		

		user.resetGuid = createGuid();
		user.resetDate = new Date();
		user.save(function (err, rUser) {
			if (err) {
				return next(err);
			}
			if (!rUser) {
				return next(new Error('No user found'));
			}
			send(rUser.resetGuid, rUser.email);
			res.send('A email has been send to ' + Email);
		})
	})
}


function createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}



var api_key = 'key-3qu91m7-p9dfgb6vhzijnigt4iguhyn3';
var domain = 'sandbox96744.mailgun.org';
var mailgun = require('mailgun-js')(api_key, domain);




function send (guid, email) {
	var data = {
	  from: 'Excited User <me@samples.mailgun.org>',
	  to: 'gaborraz@hotmail.com',
	  subject: 'Hello',
	  text: guid + "  " + email
	};	
	mailgun.messages.send(data, function (error, response, body) {
  	console.log(body);
	});
}

