var should = require('should'),
	supertest = require('supertest'),
	mongoose = require('mongoose'),
	config = require('../config/config'),
	User = require('../app/models/user'),
	app = require('../server');

	var request = supertest(app);
	

	// mongoose.connect(config.test.db);
	var url = 'http://localhost:3000';
	var userModel = {nickname : 'testuser', email : 'test@email.com', password : 'testpassword'};
	var userModelEmailMissing = {nickname : 'testuser', password : 'testpassword'};
	var userModelPasswordMissing = {nickname : 'testuser', email : 'test@email.com'};
	var userModelNickNameMissing = {email : 'test@email.com' , password : 'testpassword'};

// CRUD test
describe('user mongoose test', function  () {
	// Delete testuser from database if exist
	before(function (done) {
		User.collection.remove(function (err, result) {
			return done(err);
		});
	})
	/*
	test without a email given
	*/
	it('should fail because email is missing', function (done) {
		var user = new User(userModelEmailMissing);
		user.save(function (err, newUser) {
			if (err) {
				err.errors.should.have.key('email');
				return done();
			}
			should.fail(null, null, 'should not work because no email was given');
		});
	})
	/*
	test without nickname given
	*/
	it('should fail because nickname is missing', function (done) {
		var user = new User(userModelNickNameMissing);
		user.save(function (err, newUser) {
			if (err) {
				err.errors.should.have.key('nickname');
				return done();
			}
			should.fail(null, null,'should not work because no nickname was given');
		})
	})
	/*
	test with all attributes given
	*/
	it('should save without error', function (done) {
		var user = new User(userModel);
		user.save(function (err, newUser) {
			if (err) {
				return done(err);
			}
			newUser.should.containEql({nickname : 'testuser', email : 'test@email.com'});
			newUser.should.not.have.key('password');
			done();
		})
	})
	/*
	test save same user again
	*/
	it('shoudl fail because user already exists', function (done) {
		var user = new User(userModel);
		user.save(function (err, newUser) {
			if (err) {
				err.code.should.equal(11000);
				return done();
			}
			console.log(newUser);
		})
	})

})



//ROUTES 

describe('Route test', function () {

	before(function () {
		User.collection.remove(function (err) {
			if (err) {
				// console.log(err);
				return done(err);
			}
		})
	})

	/*
	Signup test. Post data to route. Log it in and sends it back.
	*/
	it('should create user and return nickname and _id of logged in user', function (done) {
		request
			.post('/signup')
			.send(userModel)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}

				res.header['location'].should.include('/');
				// res.body.nickname.should.equal('testuser');
				// res.body._id.should.not.equal(null);
				// res.header['location'].should.include('/')
				done();
			})
	})


	/*
	Logout
	*/
	it('should logout the user', function (done) {
		request
			.get('/logout')
			.end(function  (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(302);
				res.header['location'].should.include('/');
				done();
			})
	})


	/*
	Login test. Post email and password to route. Should return 
	*/
	it('should return nickname and _id of logged in user', function (done) {
		request
			.post('/login')
			.send({email : 'test@email.com', password : 'testpassword'})
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				// res.body.nickname.should.equal('testuser');
				// res.body._id.should.not.equal(null);
				res.header['location'].should.include('/');
				done();
			})
	})

	/*
	Login Test 2. Post email and wrong password to route. Should fail
	*/
	it('should fail because password is wrong', function (done) {
		request
			.post('/login')
			.send({email : 'test@email.com', password : 'gugus' })
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.body.status.should.equal('err');
				res.body.message.should.equal('Password wrong');
				done();
			})
	})

	it('should fail because email does not exist', function  (done) {
		request
			.post('/login')
			.send({nickname : ''})
			.end(function  (err, res) {
				if (err) {
					return done(err);
				}
				res.body.status.should.equal('fail');
				res.body.message.should.equal('Missing credentials');
				done();
			})
	})

})
