
var template = require('../views/searchtext.hbs');


var model = Backbone.Model.extend();


module.exports = Backbone.View.extend({
	events : {
		'click #searchbutton' : 'search'
	},
	el : '#searchtext',
	template : template,
	render : function  () {
		// var input = $('#searchinput');
		// new google.maps.places.SearchBox((input));
		return $(this.el).append(this.template);
	},
	search : function (e) {
		e.preventDefault();
		console.log($('#searchinput').val());
	}
})