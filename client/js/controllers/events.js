/*
Dependencies
*/
// var Handlebars = require('handlebars');
var Handlebars = require('hbsfy/runtime');
var socket = io.connect(window.location.hostname);
var newTemplate = require('../../views/newEvent.hbs');	
var myEventsTemplate = require('../../views/myEvents.hbs');	
var detailTemplate = require('../../views/detailEvent.hbs');

var joinButton = '<button id="joinEvent" class="button small radius success">Join</button>';
var leaveButton = '<button id="leaveEvent" class="button small radius">Leave</button>';


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
		var self = this;
		this.point = e;
		EventListener = eventListener;

		$('#newEventModal').bind('closed', function() {
			// self.$el.empty();
			// self.remove();
			// self.off();
		});
		$(this.el).html(this.template());
		$('#newEventModal').foundation('reveal', 'open');
		return 
	},
	submitNewEvent : function (e) {
		var self = this;

		e.preventDefault();
		
		$('#newEventModal').foundation('reveal', 'close');

		var model = new eventModel(getData(this.el));
		model.set('loc', [this.point.latLng.lng(),this.point.latLng.lat()]);		
		model.url = '/event';
		model.save().complete(function (res, status) {
			EventListener.trigger('eventsaved', status, res);
		})
	}
})

module.exports.detailEvent = Backbone.View.extend({
	el : '#eventDetail',
	template : detailTemplate,
	events : {
		'click #joinEvent' : 'joinEvent',
		'click #sendMsg' : 'sendMsg',
		'click #leaveEvent' : 'leaveEvent'
	},
	render : function (model, eventListener) {
		EventListener = eventListener;
		var self = this;
		
		self.$el.empty();

		self.model = model;
		
		self.model.urlRoot = '/eventChat';
		self.model.fetch().complete(function (res, status) {

			var d1 = moment(self.model.get('start_time'));
			var d2 = moment(self.model.get('end_time'));
			self.model.set({'start_time' : d1.format('LLL')});
			self.model.set({'end_time' : d2.format('LLL')});
			var messages = self.model.get('chat').messages;
			console.log(messages);
			for(var i = 0; i < messages.length;i++){

				messages[i].created_at = moment(messages[i].created_at).format('LLL');
			}
			configureSocketIO(self.model, self.el)

			$(self.el).html(self.template(self.model.toJSON()));

			$('#eventDetail').bind('closed', function() {
				socket.emit('leaveChat', self.model.id);
				// self.$el.empty();
				// self.remove();
				// self.off();
			});
			$('#eventDetail').foundation('reveal', 'open');
			if (loggedInNickname != 'nobody') {
				$('.' + loggedInNickname).css({'background-color' : '#EEEEEE'});
			}
			scrollToBottom();
			return;
		});
		
	},
	joinEvent : function (e) {
		var self = this;
		e.preventDefault();
		this.model.url = '/joinEvent';
		this.model.save().complete(function (res, status) {

			if (status == 'error') {
				$('#error').find('#errorMsg').html(res.responseText);
				$('#error').foundation('reveal', 'open');
			}

			$(self.el).find('#joinLeaveButton').html(leaveButton);

			$(self.el).find('#membersCount').html(self.model.get('members').length);
			EventListener.trigger('joinedEvent');
		})
	},
	leaveEvent : function  (e) {
		var self = this;
		e.preventDefault();
		e.stopPropagation();
		self.model.url = '/leaveEvent';
		self.model.save().complete(function (res, status) {
			if (status == 'error') {
				$('#error').find('#errorMsg').html(res.responseText);
				$('#error').foundation('reveal', 'open');
			}

			// $(self.el).find('#joinLeaveButton').html(joinButton);
			// $(self.el).find('#membersCount').html(self.model.get('members').length);
			$('#eventDetail').foundation('reveal', 'close');
			EventListener.trigger('leavedEvent');
		})	
	},
	sendMsg : function  (e) {
		e.preventDefault();
		e.stopPropagation();
		var self = this;

		if (checkTextField(self.el)) {
			
			var msg = $(self.el).find('#newMsg').val();
			$(self.el).find('#newMsg').val('');
			$.post('/addMessage/'+ self.model.id,{
				message : msg
			}, function  (data) {
				$('#newMsg').val('');
				socket.emit('postMessage', data, self.model.id);
			})

		}
		
		
	}
})


//============================
// MY EVENTS




module.exports.myEvents = Backbone.View.extend({
	el : '#controllView',
	template : myEventsTemplate,
	render : function  () {
		return $(this.el).html(this.template(this.collection.toJSON()));
	}
})



//============================
//============================

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

	var timeNow = moment().hour() + '' + moment().minutes();
	if (timeNow - tmpStart > 0) {
		dateStart.add('days', 1);
		dateEnd.add('days', 1);
	} else if (tmpStart - tmpEnd > 0 ) {				
		dateEnd.add('days', 1);
	}

	tmpStart = start.split(':');
	tmpEnd = end.split(':');

	dateStart.hour(tmpStart[0]).minute(tmpStart[1]);	

	dateEnd.hour(tmpEnd[0]).minute(tmpEnd[1]);
	var returnVal = [];
	returnVal.push(dateStart.toDate());
	returnVal.push(dateEnd.toDate());
	
	return returnVal;

}

function configureSocketIO (model, el) {
	socket.emit('joinChat', model.id);
	socket.on('newMessage', function (msg) {

		var newMsg = createMSG(msg);

		$(el).find('#msgBox').append(newMsg);
		scrollToBottom();
		if (loggedInNickname != 'nobody') {
			$('.' + loggedInNickname).css({'background-color' : '#EEEEEE'});
		}		
	})
}



function createMSG (msg) {
	return '<div class="'+msg.nickname+'"> <p> <strong class="nickname"> '	+ msg.nickname + ' </strong> <i class="createdAt"> ' + moment(msg.created_at).format('LLL') + ' </i><br /> ' + msg.message + ' </p> </div> ';
}

function scrollToBottom () {
	var objDiv = document.getElementById('msgBox');
	if (objDiv) {		
		objDiv.scrollTop = objDiv.scrollHeight;	
	};
}


function checkTextField (el) {
	var returnVal = false;
	if($(el).find('#newMsg').val().length > 0){
		returnVal = true;
	}
	return returnVal;
}


Handlebars.registerHelper('checkMembers', function (membersArray) {

	var returnVal = joinButton;
	for (var i = 0; i < membersArray.length; i++) {
		if (membersArray[i] == userId) {
			returnVal = leaveButton;
		}
	}
	return returnVal;
})


//REVAL  EVENT
$(document).on('opened', '[data-reveal]', function () {
  scrollToBottom();
});