var bodyParser = require('body-parser');

module.exports = function(app, passport) {

	var urlencodedParser = bodyParser.urlencoded({ extended: false });

	/*
	** HOME PAGE **
	*/
	app.get('/', function(req, res) {
		res.render('index', { message: req.flash('loginMessage') });
	});

	app.post('/', urlencodedParser, passport.authenticate('local-login', {
		successRedirect : '/profile',
		failureRedirect : '/',
		failureFlash : true
	}));


	/*
	** LOGIN **
	*/
	app.get('/login', function(req, res) {
		// pass in any flash data pertaining to the success
		// of the login if it exists
		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', urlencodedParser, passport.authenticate('local-login', {
		successRedirect : '/profile',
		failureRedirect : '/',
		failureFlash : true
	}));


	/*
	** SIGNUP **
	*/
	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', urlencodedParser, passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true // allow flash messages
	}));
	// app.post('/signup', urlencodedParser, function(req, res, next) {
	// 	passport.authenticate('local-signup', { successRedirect: '/profile', failureRedirect: '/signup', failureFlash: true }, function(err, user, info) {
	// 		if (err) {
	// 			console.log(err);
	// 			throw err;
	// 		} else if (!user) {
	// 			console.log(info);
	// 			res.render('signup', { message: 'invalid request' });
	// 		} else {
	// 			console.log('it worked');
	// 			res.render('profile');
	// 		}
	// 	})(req, res, next);
	// });


	/*
	** PROFILE **
	*/
	// this will need protecting to ensure only authenticated users
	// can visit it, use route middleware to verify with the isLoggedIn() function
	app.get('/profile', isLoggedIn, function(req, res) {
		// get the user out of session and pass to the jade template
		res.render('profile', { user : req.user });
	});


	/*
	** LOGOUT **
	*/
	app.get('/logout', function(req, res) {
		// req.logout() provided by passport
		req.logout();
		res.redirect('/');
	});


	/*
	** FACEBOOK ROUTES
	======================================================================================================*/
	// facebook authentication and login
	// by default facebook will provide you with user information, but not the email address
	// so you can add this by specifying the scope (other scopes can be added for access to more information)
	// but the offset is that users will be put off if they have to share too much information than is necessary
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}));
};


// route middleware to verify a user is logged in
function isLoggedIn(req, res, next) {
	// if a user is authenticated, carry on
	if (req.isAuthenticated()) {
		return next();
	}

	// if not, redirect to home page to login
	res.redirect('/');
}