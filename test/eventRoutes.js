Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}


Date.prototype.removeHours = function(h) {    
   this.setTime(this.getTime() - (h*60*60*1000)); 
   return this;   
}

var app = require('../server.js');
var should = require('should'),
	supertest = require('supertest'),
	// mongoose = require('mongoose'),
	config = require('../config/config'),
	// login = require('../config/testHelperLogin'),
	Event = require('../app/models/event'),
	User = require('../app/models/user');


var request = supertest(app);
var urlHost = 'http://localhost:3000';



describe('Route test CREATE Event', function  () {
	var agent1 = supertest.agent(app);
	var agent2 = supertest.agent(app);
	before(function (done) {
		User.collection.remove(function (err, result) {
			if (err) {
				return done(err);
			}
			Event.collection.remove(function (err, result) {
				if (err) {
					return done(err);
				}
				done();
				//-----
				// request
				// 	.get('/logout')
				// 	.end(function (err, res) {
				// 		if (err) {
				// 			return done(err);
				// 		}
				// 		return done();
				// 	})
				//-----
			})
		})
	})

	it('should not create a event because the user is not logged in', function (done) {
		request
			.post('/event')
			.send(testModel)
			.end(function (err,res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(401)
				return done();
			})
	})

	it('should create a event', function (done) {
		agent1
			.post('/signup')
			.send(theAccount)
			.end(function  (err, res) {
				agent1.saveCookies(res);
				agent1
					.post('/event')
					.send(testModel)
					.end(function (err, res) {
						res.body._id.should.not.equal(null);
						res.body.members.length.should.equal(1);
						done();
					})
			})

	})


	it('should create a second event', function (done) {
		agent1
			.post('/event')
			.send(testModel)
			.end(function (err, res) {
				res.body._id.should.not.equal(null);
				res.body.members.length.should.equal(1);
				done()
			})
	})


	it('should not create a third event', function (done) {
		agent1
			.post('/event')
			.send(testModel)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(405);
				done();
			})
	})
	var eventListe;

	it('should return two events', function (done) {
		agent1
			.post('/eventlist')
			.send({ distance : 200 , longitude : -100 , latitude : 35.5})
			.end(function  (err, res) {
				if (err) {
					return done(err);
				}
				res.body.length.should.equal(2);
				eventListe = res.body;
				done();
			})
	})

	it('should return my active events', function (done) {
		agent1
			.get('/myevents')
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.body.length.should.equal(2);
				done();
			})
	})



	it('should join a event and return it', function (done) {
		agent2
			.post('/signup')
			.send(account2)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				agent2.saveCookies(res);
				agent2
					.get('/joinEvent/' + eventListe[1]._id)
					.end(function (err, res) {
						if (err) {
							return done(err);
						}
						res.body._id.should.not.equal(null);
						done();
					})
			})
	})

	var thirdEventId;

	it('should create a new event for second account2', function (done) {
		agent2
			.post('/event')
			.send(testModel)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				thirdEventId = res.body._id;
				done();
			})
	})


	it('should not join a event', function (done) {
		agent1
			.get('/joinEvent/' + thirdEventId)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(405);
				done();
			})
	})

	it('should leave a event and return active events', function (done) {
		agent1
			.get('/leaveEvent/' + eventListe[0]._id)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				console.log(res.body);
				done();
			})
	})

})



//data models
var date1 = new Date();
date1.addHours(2);
var date2 = new Date();
date2.addHours(5);

var testModel = {
	loc : [-100, 35.5],
	where : 'In the Master Pub',
	start_time : date1,
	end_time : date2,
	description : 'First Model Route Test'
}

var theAccount = {
  nickname : 'event',
  email : 'events@helper.ch',
  password : "iamtheluchadore"
};

var account2 = {
	nickname : 'event2',
	email : 'event2@helper.ch',
	password : 'gugus2'
}



