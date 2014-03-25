var template = require('../../views/signupForm.hbs');
var UserModel = require('../models/user');


module.exports = Backbone.View.extend({
	el : '#signupForm',
	template : template,
	events : {
		"click #signupButton" : 'signupAction'
	},
	render : function () {
		return $(this.el).append(this.template);
	},
	signupAction : function (e) {
		e.preventDefault();
		var email = $(this.el).find('#email').val();
		var password = $(this.el).find('#password').val();
		var nickname = $(this.el).find('#nickname').val();
		var user = new UserModel({
			email : email,
			nickname : nickname,
			password : password
		})
		user.urlRoot = '/signup';
		user.save();
	}
})