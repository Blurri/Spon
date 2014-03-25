var app = require('../server.js');
var should = require('should'),
	supertest = require('supertest'),
	config = require('../config/config'),
	User = require('../app/models/user');


var request = supertest(app);






describe('Route password test', function  () {
	before(function  (done) {
		var user = new User({
			email : 'gaborraz@hotmail.com',
			password : 'gaborraz1',
			nickname : 'Blurri'
		})

		user.save(function  (err, user) {
			if (err) {
				return done(err);
			}

			done();
		})
	})


	it('should ', function (done) {
		request
			.post('/pwReset')
			.send({email : 'gaborraz@hotmail.com'})
			.end(function (err, res) {
				done();
				// console.log(err);
				// console.log(res);
			})	
	})

	
})
