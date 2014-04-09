var Event = require('../models/event');
var Chat = require('../models/chat');

exports.create = function (req,res,next) {

	checkDatabase(function (value) {
		if (isNumber(value)) {
			if (value >= 2) {
				res.send('too much active events', 405)
			} else {
				var newEvent = new Event(req.body);
				newEvent.members.push(req.user._id);
				newEvent.save(function (err,event) {
					if (err) {
						return next(err);
					}
					res.json(event);
				})
			}
		} else {
			return next(value);
		}
	}, req);

}

exports.joinEvent = function (req, res, next) {
	checkDatabase(function (value) {
		if (isNumber(value)) {
			if (value >= 2) {
				res.send('too much active events', 405);
			} else {
				Event.findByIdAndUpdate(req.body._id, { $addToSet : { members : req.user._id } }, function (err, event) {
					if (err) {
						return next(err);
					}
					res.json(event);
				})
			}
		}
	}, req)
}
//==================
//TEST
exports.eventlist = function  (req, res, next) {
	
	var distance = req.body.distance;
	var longitude = req.body.longitude;
	var latitude = req.body.latitude;



	Event.find({loc : {
		$geoWithin : {
			$centerSphere : [[longitude, latitude],
			distance / 6371]
		}, end_time : { $gt : new Date()}
	}}, function (err, result) {
		res.json(result);
	});
}
//=================

exports.eventsList = function  (req, res, next) {
			
		
		
	var distance = req.query.distance;
	var longitude = req.query.longitude;
	var latitude = req.query.latitude;
	


	Event.find({loc : {
		$geoWithin : {
			$centerSphere : [[longitude, latitude],
			distance / 6371]
		}
	}}, function (err, result) {
		res.json(result);
	});
}

exports.eventForId = function (req, res, next) {

	Event.findById(req.query.id, function (err, event) {
		console.log(event);
	})
}

exports.myevents = function  (req, res, next) {
	Event.find({members : req.user._id, end_time : { $gt : new Date() }}, function (err, results) {
		if (err) {
			return next(err);
		}
		res.json(results);
	})
}

exports.leaveEvent = function  (req, res, next) {
	Event.findByIdAndUpdate(req.params.id, { $pull : { 'members' : req.user._id }}, function (err, event) {
		if (err) {
			return next(err);
		}
		if (!event.members.length > 0) {
			event.remove(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send('Event deleted', 200);
				}
			})
		} else {
			res.json(event);
		}
	})
}


exports.chat = function (req, res) {
	Event.findById(req.params.id).populate('chat').populate('messages').exec(function  (err, event) {
		if (err) {
			res.send('505', 'Error!!!');
		}
		res.json(event);
	})
}

exports.addMessage = function  (req, res) {
	Event.findById(req.params.id).populate('chat').populate('messages').exec(function  (err, event) {
		if (err) {
			res.send('505', 'Error!!!');
		}


		Chat.findByIdAndUpdate(event.chat._id, {
			$push: { "messages" : newChatMessage(req) }
		}, function (err, chat) {
			var lastMsg = chat.messages[chat.messages.length - 1];
			res.send(lastMsg);
		})

		// event.chat.messages.push(newChatMessage(req));
		// console.log(event.chat.messages);
		// event.save(function (err, updatedEvent) {
		// 	if (err) {
		// 		res.send('505', 'Error!!!');
		// 	}	
		// 	console.log(updatedEvent.chat.messages.length);
			// var lastMsg = updatedEvent.chat.messages[updatedEvent.chat.messages.length - 1];
			// res.send(lastMsg);
		// })
		
	})
}


function checkDatabase (done, req) {
	Event.find({ members : req.user._id }, function (err, results) {
		if (err) {
			return done(err);
		}
		return done(results.length);
	})
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}



function calcDiff ( date1, date2 ) {
  //Get 1 day in milliseconds
  var houresInMS=1000*60*60;
  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();
  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
  // Convert back to days and return
  return Math.round(difference_ms/houresInMS); 
} 



function newChatMessage (req) {
	var nickname = 'nobody';
	if (req.user != undefined){
		nickname = req.user.nickname;
	}	
	message = req.body.message;
	return {
		nickname : nickname,
		message : message
	}
}