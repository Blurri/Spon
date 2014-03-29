var newTemplate = require('../../views/newEvent.hbs');	

var eventModel = Backbone.Model.extend({
	idAttribute : '_id'
});
module.exports.eventModel = eventModel;


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
	render : function (e, EventListener) {
		this.point = e;
		this.eventListener = EventListener;
		$(this.el).html(this.template());
		$('#newEventModal').foundation('reveal', 'open');
		return ;
	},
	submitNewEvent : function (e) {

		e.preventDefault();
		$('#newEventModal').foundation('reveal', 'close');
		var model = new eventModel(getData(this.el));
		model.loc = [this.point.latLng.lng(),this.point.latLng.lat()];
		model.url = '/event';
		model.save().complete(function (res, status) {
			this.eventListener.trigger('eventsaved', status);
			this.remove();			
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

	console.log(tmpStart - tmpEnd);
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