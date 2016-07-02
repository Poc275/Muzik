var expect = require('chai').expect;
var User = require('../models/user');

var USER_A;

/* helper functions */
// checks the returned object is a user
function expectUser(obj, user) {
    expect(obj).to.be.an('object');
    expect(obj).to.be.an.instanceOf(User);

    if (user) {
        ['username'].forEach(function (prop) {
            expect(obj[prop]).to.equal(user[prop]);
        });
    }
}

/**
 * Asserts that the given error is a ValidationError with the given message.
 * The given message can also be a regex, to perform a fuzzy match.
 */
// function expectValidationError(err, msg) {
//     // expect(err).to.be.an.instanceOf(Error);
//     // expect(err).to.be.an.instanceOf(errors.ValidationError);

//     if (typeof msg === 'string') {
//         expect(err.message).to.equal(msg);
//     } else { // regex
//         expect(err.message).to.match(msg);
//     }
// }

/**
 * Asserts that the given error is a ValidationError for the given username
 * being taken.
 */
// function expectUsernameTakenValidationError(err, username) {
//     expectValidationError(err, 'The username ‘' + username + '’ is taken.');
// }


// TESTS
describe('User model:', function () {

    // password hash tests
    it('Create and check a correct password hash', function(next) {
    	var password = 'testPasswordA';

    	User.generateHash(password, function(err, hash) {
			if (err) {
				return next(err);
			}
			User.validPassword(password, hash, function(err, res) {
				if (err) {
					return next(err);
				}
				
				expect(res).to.equal(true);
				return next();
			});
		});
    });

    it('Create and check an incorrect password hash', function(next) {
    	var password = 'testPasswordA';

    	User.generateHash(password, function(err, hash) {
			if (err) {
				return next(err);
			}
			User.validPassword('testPasswordB', hash, function(err, res) {
				if (err) {
					return next(err);
				}
				
				expect(res).to.equal(false);
				return next();
			});
		});
    });


    // create user tests
    it('Create test user A', function (next) {
        var username = 'testUserA';
        var password = 'testPasswordA';
        var city = 'test city';
        var country = 'test country';
        var genres = ['Asian', 'Experimental', 'Jazz', 'Latin'];
        var skills = ['Vocalist', 'Writer'];

        User.create({
			username: username,
			password: password,
            city: city,
            country: country,
            genres: genres,
            skills: skills
		}, function(err, user) {
			if (err) {
				return next(err);
			}

			expectUser(user);
			expect(user._node.properties.username).to.equal(username);
            expect(user._node.properties.city).to.equal(city);
            expect(user._node.properties.country).to.equal(country);
            expect(user._node.properties.country).to.equal(country);
            expect(user._node.properties.genres).to.deep.equal(genres);
            expect(user._node.properties.skills).to.deep.equal(skills);

            // array lengths
            expect(user._node.properties.genres).to.have.lengthOf(genres.length);
            expect(user._node.properties.skills).to.have.lengthOf(skills.length);

			USER_A = user;

			return next();
		});
	});


	it('Attempt to create test user A again', function (next) {
		var username = 'testUserA';
        var password = 'testPasswordA';

        User.create({
        	username: username,
			password: password
        }, function (err, user) {
            expect(user).to.not.exist;
            // expectUsernameTakenValidationError(err, username);
            return next();
        });
    });


	// find user tests
    it('Fetch test user A', function (next) {
        User.find('testUserA', function (err, user) {
            if (err) {
            	return next(err);
            }

            expectUser(user, USER_A);
            return next();
        });
    });


    it('Fetch fake user', function (next) {
        User.find('fakeUser', function (err, user) {
            if (err) {
            	return next(err);
            }
            expect(user).to.equal(false);
            return next();
        });
    });

});