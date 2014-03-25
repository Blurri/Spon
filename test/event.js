

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}


Date.prototype.removeHours = function(h) {    
   this.setTime(this.getTime() - (h*60*60*1000)); 
   return this;   
}

var should = require('should'),
	request = require('supertest'),
	mongoose = require('mongoose'),
	config = require('../config/config'),
	Event = require('../app/models/event');

// Modeldata

var date1 = new Date();
date1.addHours(3)

// date1.setHours(date1.getHours() + 3);
var date2 = new Date();
date2.addHours(7);
// date2.setHours(date2.getHours() + 7)
var testModelLocMissing = {
	where : 'Bar 59',
	start_time : date1,
	end_time : date2,
	description : 'Ich wett dert ond da eis Trinke oder zwe'
}

var testModelStartTimeMissing = {
	loc : [-100, 35.5],
	where : 'ROK',
	end_time : date1,
	description : 'Ich möcht gärn öppis gah esse'
}

var testModelCorrect = {
	loc : [-100, 35.5],
	where : 'Roudy',
	start_time : date1,
	end_time : date2,
	description : 'Ich würd gärn biz stampfe'
}

var date3 = new Date();
date3.addHours(15)
// date3.setHours(date3.getHours() + 15);
var date4 = new Date();
date4.addHours(20);
// date4.setHours(date4.getHours() + 20);

var testModelStartTimeToFar = {
	loc : [-100, 35.5],
	where : 'HERE',
	start_time : date3,
	end_time : date4,
	description : 'Ich wil ich will ich will'
}
var testModelEndTimeToFar = {
	loc : [-100, 35.5],
	where : 'Madelaine',
	start_time : date1,
	end_time : date4,
	description : 'ICH mach was ich ICH will'
}


var date5 = new Date();
date5.addHours(2);
// date4.setHours(date4.getHours() + 2);
var date6 = new Date();
date6.addHours(1);
// date5.setHours(date5.getHours() + 1);

var testModelStartTimePastEndTime = {
	loc : [-100, 35.5],
	where : 'at home',
	start_time : date5,
	end_time : date6,
	description : 'la di du'
}

var date7 = new Date();
date7.removeHours(1);
// date6.setHours(date7.getHours() - 1);
var date8 = new Date();
date8.addHours(2);
// date7.setHours(date7.getHours() + 2);

var testModelStartTimeIsInPast = {
	loc : [-100, 35.5],
	where : 'in guggus pub',
	start_time : date7,
	end_time : date8,
	description : 'nur der mann im mond schaut zu'
}


describe('events mongoose test required fields', function () {
	
		// Delete testuser from database if exist
	before(function (done) {
		Event.collection.remove(function (err, result) {
			return done(err);
		});
	})
	/*
	test without loc given
	*/
	it('should fail because loc is missing', function (done) {
		 var newEvent = new Event(testModelLocMissing);
		 newEvent.save(function (err, event) {
		 	if (err) {
		 		return done();
		 	}
		 	should.fail(null, null, 'should not work because loc is missing');
		 })
	})

	it('should fail because start_time is missign', function (done) {
		var newEvent = new Event(testModelStartTimeMissing);
		newEvent.save(function (err, event) {
			if (err) {
				return done();
			}
			should.fail(null, null, 'should not work because start_time is missing');
		})
	})

	it('should create a new Event', function (done) {
		var newEvent = new Event(testModelCorrect);
		newEvent.save(function (err, event) {
			if (err) {
				return done(err);
			}
			event._id.should.not.equal(null);
			console.log(event.chat);
			event.description = 'UPDATE';
			event.save(function  (err, gugus) {
				console.log(gugus.chat);
				done();
			})

			
		})
	})

	it('should not create a event because start_time is to far', function (done) {
		var newEvent = new Event(testModelStartTimeToFar);
		newEvent.save(function (err, event) {
			if (err) {
				return done();
			}
			should.fail(null, null, 'because start_time is to far ');
		})
	})

	it('should not create a event because end_time is too far', function (done) {
		var newEvent = new Event(testModelEndTimeToFar);
		newEvent.save(function (err, event) {
			if (err) {
				// console.log(err);
				return done();
			}
			should.fail(null, null, 'becuase end_time is too far');
		})
	})



	it('should not create a event because start_time is past end time', function (done) {
		var newEvent = new Event(testModelStartTimePastEndTime);
		newEvent.save(function (err, event) {
			if (err) {
				return done()
			}
			should.fail(null, null, 'because start_time is past end_time');
		})
	})

	it('should not create a event because start time is in the past', function (done) {
		var newEvent = new Event(testModelStartTimeIsInPast);

		newEvent.save(function (err, event) {
			if (err) {
				return done();
			}
			should.fail(null, null, 'because start_time is in the past');
		})
	})

})


