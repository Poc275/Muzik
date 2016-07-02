var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport) {
	// passport session signup
	// required for persistent login sessions
	// passport requires the ability to serialise and deserialise users in/out of session
	passport.serializeUser(function(user, done) {
		// just serialize the username to the session to keep
		// the amount of data stored within the session to a minimum
		// subsequent requests can use req.user to use this username
		done(null, user._node.properties.username);
	});

	passport.deserializeUser(function(username, done) {
		User.find(username, function(err, user) {
			done(err, user);
		});
	});


	// local signup
	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		User.generateHash(password, function(err, hash) {
			if (err) {
				return done(err);
			}
			if (!hash) {
				return done(null, false, req.flash('signupMessage', 'Hash function failed'));
			}

			User.create({
				username: email,
				password: hash,
				country: req.body.country,
				city: req.body.city,
				genres: req.body.genres,
				skills: req.body.skills
				}, function(err, user) {
					if (err) {
						return done(err);
					}
					if (!user) {
						return done(null, false, req.flash('signupMessage', 'Profile failed to create'));
					}
					return done(null, user);
				});
		});
	}));


	// local login
	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		User.find(email, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, req.flash('loginMessage', 'That email address does not exist'));
			} 
			
			// now we have the user, check the password hash
			User.validPassword(password, user._node.properties.password, function(err, res) {
				if (err) {
					return done(err);
				}
				if (!res) {
					return done(null, false, req.flash('loginMessage', 'Incorrect credentials applied'));
				}
				return done(null, user);
			});
		});
	}));


	/*
	** FACEBOOK STRATEGIES
	====================================================================================================*/
	passport.use(new FacebookStrategy({
		// pull in app id and secret from auth.js
		clientID : configAuth.facebookAuth.clientID,
		clientSecret : configAuth.facebookAuth.clientSecret,
		callbackURL : configAuth.facebookAuth.callbackURL
	},
	function(token, refreshToken, profile, done) {
		// facebook sends back the token and profile
		var newUser = new User();
		newUser.firstName = profile.id;
		return done(null, newUser);
	}));
};