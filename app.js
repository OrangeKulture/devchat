const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const configOptions = require('./config/config.js');
const connectMongo = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('passport');
const favicon = require('serve-favicon');
const FacebookStrategy = require('passport-facebook').Strategy;
let rooms = [];

let app = express();
let env = process.env.NODE_ENV || 'development';

mongoose.connect(configOptions.dbUrl);
mongoose.connection.on('connected', () => {
    console.log('Connected to database');
})
mongoose.Promise = global.Promise;

mongoose.connection.on('error', (err) => {
    console.log('Database error: '+err);
})

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
if(env === 'development') {
	app.use(session({secret: configOptions.sessionSecret , saveUninitialized:true, resave:true}));
} else {
	app.use(session({
		secret: configOptions.sessionSecret,
		store: new connectMongo({
			mongooseConnection: mongoose.connections[0],
			stringify: true,
			saveUninitialized:true, 
			resave:true
		})
	}));
}

app.use(favicon(__dirname + '/public/images/chaticon.ico'));

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passport.js')(passport, FacebookStrategy, configOptions, mongoose);
require('./routes/routes.js')(express,app,passport,configOptions,rooms);

app.set('port', process.env.PORT || 3000);
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

require('./socket/socket.js')(io,rooms);

server.listen(app.get('port'), () => {
	console.log('DevChat running on port ' + app.get('port'));
})