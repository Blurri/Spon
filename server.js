/*
Module dependencies
*/
var express = require('express'),
	path = require('path'),
	mongoose = require('mongoose'),
	mongoStore = require('connect-mongo')(express),
	passport = require('./config/passport'),
	config = require('./config/config'),
	auth = require('./config/middlewares/authorization'),
	app = express(),
	Primus = require('primus');

//--------------
//Variables
if (process.env.NODE_ENV == undefined){
	process.env.NODE_ENV = 'test';	
}
console.log(process.env.NODE_ENV);

var dbUrl = config[process.env.NODE_ENV].db;

//--------------
/*
connect mongodb 
*/

mongoose.connect(dbUrl);

// express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('aDirtySecret'));
app.use(express.session({
	secert : 'myDirtySessionSecret',
	store : new mongoStore({
		url : dbUrl
	})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
	res.locals.isAuthenticated = req.isAuthenticated();
	if (req.user != undefined) {
		res.locals.username = req.user.nickname;
	}
	next();
});
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  console.log('Development mode');
  require('./config/seed').seed();
  app.use(express.errorHandler());
}



// ROUTES
require('./config/routes')(app, passport, auth);
app.get('/', function (req, res) {

	var nickname = 'nobody';
	var userId = 0;
	if (req.user != undefined) {
		nickname = req.user.nickname;
		userId = req.user._id;
	}
	res.render('index', { nickname : nickname, userId : userId });
})

var server = app.listen(app.get('port'), function  () {
				console.log('Server started at port : ' + app.get('port'));
			});

// require('./config/socket.io')(require('socket.io').listen(server));
require('./config/sockets')(require('socket.io').listen(server));


module.exports = app;