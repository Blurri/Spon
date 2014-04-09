/*
Dependencies
*/
var socket = io.connect(window.location.hostname);
var newTemplate = require('../../views/newEvent.hbs');	
var detailTemplate = require('../../views/detailEvent.hbs');
var Handlebars = require('handlebars');


/*
Backbone Model
*/
var eventModel = Backbone.Model.extend({
	idAttribute : '_id'
});
module.exports.eventModel = eventModel;


/*
Eventlistener
*/
var EventListener = {};


var eventCollection =  Backbone.Collection.extend({
	model : eventModel
});
module.exports.eventCollection = eventCollection;

module.exports.newEvent = Backbone.View.extend({
	el : '#newEventModal',
	events : {
		'click #submitNewEvent' : 'submitNewEvent'
	},
	template : newTemplate,
	render : function (e, eventListener) {
		this.point = e;
		EventListener = eventListener;
		$(this.el).html(this.template());
		$('#newEventModal').foundation('reveal', 'open');
		return 
	},
	submitNewEvent : function (e) {
		self = this;

		e.preventDefault();
		
		$('#newEventModal').foundation('reveal', 'close');

		var model = new eventModel(getData(this.el));
		model.set('loc', [this.point.latLng.lng(),this.point.latLng.lat()]);		
		model.url = '/event';
		model.save().complete(function (res, status) {
			EventListener.trigger('eventsaved', status);
			self.remove();			
		})
	}
})

module.exports.detailEvent = Backbone.View.extend({
	el : '#eventDetail',
	template : detailTemplate,
	events : {
		'click #joinEvent' : 'joinEvent',
		'click #sendMsg' : 'sendMsg'
	},
	render : function (model) {
		var self = this;
		self.model = model;
		self.model.urlRoot = '/eventChat';
		self.model.fetch().complete(function (res, status) {
			configureSocketIO(self.model, self.el)
			$(self.el).html(self.template(self.model.toJSON()));
			$('#eventDetail').bind('closed', function() {
				socket.emit('leaveChat', self.model.id);
			});
			$('#eventDetail').foundation('reveal', 'open');
			if (loggedInNickname != 'nobody') {
				$('.' + loggedInNickname).css({'background-color' : 'red'});
			}
			return;	
		});
	},
	joinEvent : function (e) {
		var self = this;
		e.preventDefault();
		this.model.url = '/joinEvent';
		this.model.save().complete(function (err, status) {
			console.log(err);
		})
	},
	sendMsg : function  (e) {
		var self = this;
		e.preventDefault();
		$.post('/addMessage/'+ self.model.id,{
			message : $(this.el).find('#newMsg').val()
		}, function  (data) {
			console.log(data);
			socket.emit('postMessage', data, self.model.id);
		})
	}
})

function getData (el) {
	var start_time = $(el).find('#start_time').val();
	var end_time = $(el).find('#end_time').val();
	var where = $(el).find('#where').val();
	var description = $(el).find('#description').val();

	var dates = checkTime(start_time,end_time);

	return {
		start_time : dates[0],
		end_time : dates[1],
		where : where,
		description : description
	}
}

function checkTime(start, end) {
	var tmpStart = start.replace(':', '');
	var tmpEnd = end.replace(':', '');
	var dateStart = moment();
	var dateEnd = moment();

	if (tmpStart - tmpEnd > 0 ) {				
		dateEnd.add('days', 1);
	}
	tmpStart = start.split(':');
	tmpEnd = end.split(':');

	// dateStart.setHours(tmpStart[0], tmpEnd[1]);
	dateStart.hour(tmpStart[0]).minute(tmpStart[1]);	
	// dateEnd.setHours(tmpEnd[0],tmpEnd[1]);
	dateEnd.hour(tmpEnd[0]).minute(tmpEnd[1]);
	var returnVal = [];
	returnVal.push(dateStart.toDate());
	returnVal.push(dateEnd.toDate());
	return returnVal;

}

function configureSocketIO (model, el) {
	socket.emit('joinChat', model.id);
	socket.on('newMessage', function (msg) {

		var newMsg = '<div class="'+msg.nickname+'"> <p> <strong> ' + msg.nickname + ' </strong> ' + msg.message + ' <i> ' + msg.created_at + ' </i></p></div>';
		$(el).find('#msgBox').append(newMsg);
		var objDiv = document.getElementById('msgBox');
		objDiv.scrollTop = objDiv.scrollHeight;
		if (loggedInNickname != 'nobody') {
			$('.' + loggedInNickname).css({'background-color' : 'red'});
		}
		
	})
}
     