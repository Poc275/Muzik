var request = require('request');
// define host and port of Neo4j database
var host = 'localhost';
var port = 7474;
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

// GET '/'
exports.index = function(req, res) {
	runCypherQuery(
		'MATCH (n)-[ACTED_IN]->(m) WHERE m.title = "Cloud Atlas" RETURN n',
		function (err, resp) {
			if (err) {
				res.send(err);
			}
			else {
				var results = resp.results[0]['data'];
				res.render('index-test', { rows: results });
			}
		}
	);
};

// POST '/'
// middleware POST '/' to split the year from the date (as a test)
// and pass on the chain to the next handler (addActor)
exports.getYear = function(req, res, next) {
	var date = (req.body.born).split('-')[0];
	req.body.born = date;
	// continue in the middleware chain
	next();
};

exports.addActor = function(req, res) {
	// res.send(req.body.name + ' - ' + req.body.born);
	addActorNodeToNeo(
		'CREATE (actor:Person { name: {name}, born: {born} }) RETURN actor', {
			name : req.body.name,
			born : req.body.born
		},
		function (err, resp) {
			if (err) {
				res.send(err);
			}
			else {
				var result = resp.results[0]['data'];
				res.render('index-test', { rows: result });
			}
		}
	);
};


function runCypherQuery(query, callback) {
	request.post({
		uri: httpUrlForTransaction,
		headers: {'authorization': 'Basic bmVvNGo6R3JhcGhEQiE='}, // base64 encoded string of username:password (neo4j:GraphDB!)
		json: {statements: [{statement: query}]}
	},
	function (err, res, body) {
		callback(err, body);
	})
}


function addActorNodeToNeo(query, params, callback) {
	request.post({
		uri: httpUrlForTransaction,
		headers: {'authorization': 'Basic bmVvNGo6R3JhcGhEQiE='},
		json: {statements: [{statement: query, parameters: params}]}
	},
	function (err, res, body) {
		callback(err, body);
	})
}