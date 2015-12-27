var neo4j = require('neo4j');
var bcrypt = require('bcrypt-nodejs');
var db = new neo4j.GraphDatabase('http://neo4j:GraphDB!@localhost:7474');

// Private constructor
var User = module.exports = function User(node) {
    // All we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties
    this._node = node;
}


User.create = function(props, callback) {
	var params = {
		props: props
	};

	db.cypher({
		query: 'CREATE (user:Artist {props}) RETURN user',
		params: params
	}, function(err, results) {
		if (err) {
			return callback(err);
		}

		if (!results.length) {
            return callback('Could not create user');
		}

		var user = new User(results[0]['user']);
		callback(null, user);
		// if (!result) {
		// 	console.log('User not created');
		// } else {
		// 	console.log(JSON.stringify(result, null, 4));
		// }
	});
};


User.find = function(username, callback) {
	var params = {
		username: username
	};

	db.cypher({
		query: 'MATCH (user:Artist {username: {username}}) RETURN user',
		params: params
	}, function(err, results) {
		if (err) {
			return callback(err);
		}

		if (!results.length) {
            return callback(null, false);
		}

		var user = new User(results[0]['user']);
		callback(null, user);
	});
};


User.generateHash = function(password, callback) {
	// params - data(required), salt(required but automatically generated), 
	// progress, callback(error, hash)
	bcrypt.hash(password, null, null, function(err, hash) {
		if (err) {
			return callback(err);
		}
		return callback(null, hash);
	});
};


User.validPassword = function(passwordInput, password, callback) {
	bcrypt.compare(passwordInput, password, function(err, res) {
		if (err) {
			return callback(err);
		}
		return callback(null, res);
	});
};