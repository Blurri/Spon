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
	app = express();

//--------------
//Variables
if (process.env.NODE_ENV == undefined){
	process.env.NODE_ENV = 'test';	
}


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
	next();
});
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ROUTES
require('./config/routes')(app, passport, auth);
app.get('/', function (req, res) {
	res.render('index');
})


var server = app.listen(app.get('port'), function  () {
				console.log('Server started at port : ' + app.get('port'));
			});

require('./config/socket.io')(require('socket.io').listen(server));


module.exports = app;