var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var routes = require('./routes');
var flash = require('connect-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

var app = express();
var router = express.Router();

// don't set body parser on the entire app, only on routes
// that require parameters to be retrieved POST/PUT etc.
//var urlencodedParser = bodyParser.urlencoded({ extended: false });

// pass passport for configuration, afterwards
// it is passed into routes to be used downstream to authenticate etc.
require('./config/passport')(passport);

app.use(express.static('public'));
app.use('/', router);
app.use(cookieParser());
app.set('view engine', 'jade');
app.use(morgan('dev'));

// required for passport
// session secret
app.use(session({ 
	secret: 'muzik app for real musicians',
	resave: false,
	saveUninitialized: false 
}));
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// use connect-flash for flash messages stored in session
app.use(flash());

// routes - TESTING
// router.get('/', routes.index);
// middleware post test
// router.post('/', urlencodedParser, routes.getYear);
// router.post('/', urlencodedParser, routes.addActor);

// load routes and pass in app and configured passport
require('./routes/routes.js')(app, passport);

app.listen(3000);