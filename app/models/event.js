
// DATE HELPER
Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}


Date.prototype.removeHours = function(h) {    
   this.setTime(this.getTime() - (h*60*60*1000)); 
   return this;   
}
//==================================================)
//==================================================)
//==================================================)


var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Chat = require('./chat');


/*
IMPORTANT:
Because 2d Index
loc : [long, lat]
*/
var eventSchema = new Schema({
	loc : { type : [], required : true },
	where : String,
	start_time : { type : Date, required : true },
	end_time :  { type : Date, required : true },
	created_at : { type : Date, default : Date.now },
	description : String,
	tags : [],
	members : [Schema.ObjectId],
	chat : Schema.ObjectId
})

eventSchema.index({ loc : '2d' });	

eventSchema.path('start_time').validate(function (startTime) {
	if (startTime != undefined && this.end_time != undefined) {
		var diff = calcDiff(this.created_at, startTime);
		if (diff > 12) {
			return false;
		} else if (diff < 0) {
			return false;
		}
	}
}, 'start time is wrong')

eventSchema.path('end_time').validate(function (endTime) {
	if (endTime != undefined && this.start_time != undefined) {
		var diff = calcDiff(this.start_time, endTime);
		if (diff > 5) {
			return false;
		}else if (diff < 0) {
			return false;
		}
	} else if (endTime != undefined) {
		this.end_time = new Date(this.start_time);

		this.end_time.addHours(5);
	}
},'end_time is wrong')

eventSchema.statics.removeOldEvents = function  () {
	 this.remove({'end_time': {'$gt': '2011-04-01', '$lt': '2011-04-09'}});
}


eventSchema.pre('save', function (next) {
	var self = this;
	if (self.isNew) {
		var chat = new Chat();
		chat.save(function  (err, newChat) {
			if (err) {
				return next(err);
			}

			self.chat = chat;
			next();
		})
	} else {
		next();
	}
});



module.exports = mongoose.model('Event', eventSchema);

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