var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');


var UserSchema = new Schema({
    nickname : {
        type : String,
        unique : true,
        required : true
    },
	email : {
		type : String,
		unique : true,
        required : true
	},
	hashed_password : String,
	salt : String,
    resetGuid : String,
    resetDate : Date    
});

//Virtuals
UserSchema.virtual('password').set(function (password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashed_password = this.encryptPassword(password);
}).get(function (){
	return this._password;
});

// Validation
var validatePercenceOf = function (value) {
	return value && value.length;
};
UserSchema.path('email').validate(function (email) {
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	return emailRegex.test(email);
}, 'The e-mail field cannot be empty');

UserSchema.path('hashed_password').validate(function (hashed_password) {
	return hashed_password.length;
}, 'Passwort cannot be blank');


UserSchema.pre('save', function (next) {
	if (!this.isNew) {
		return next();
	}
	if (!validatePercenceOf(this.password)) {
		next(new Error('Invalid password'));
	}else{
		next();
	}
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};


module.exports = mongoose.model('User', UserSchema);