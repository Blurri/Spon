var template = require('../../views/loginForm.hbs');
var UserModel = require('../models/user');


module.exports = Backbone.View.extend({
	el : '#loginForm',
	template : template,
	events : {
		"click #loginButton" : "loginAction"
	},
	render : function () {
		return $(this.el).append(this.template);
	},
	loginAction : function  (e) {
		e.preventDefault();
		var email = $(this.el).find('#email').val();
		var password = $(this.el).find('#password').val();
		
		var user = new UserModel({
			email : email,
			password : password
		})

		user.urlRoot = '/login';
		user.save();
	}
})


