var cloudantConfig = require('../../config/cloudant.js');

var cloudant = require('cloudant');
var md5 = require('md5');

//Cloudant credentials
var username = cloudantConfig.credentials.username;
var password = cloudantConfig.credentials.password;
var _cloudant = cloudant({account:username, password:password});


        // check if DB exists if not create
        _cloudant.db.create('saintpaul-favorites', function (err, res) {
            if (err) {
                console.info('Database watsonhelpdesk already exists');
            }
        });

var db = _cloudant.db.use('saintpaul-favorites');
var nano = require("nano")(cloudantConfig.credentials.url),
db_nano = nano.db.use("saintpaul-favorites");


exports.search = function() {
  return function(request, response) {
    var intranet_id = request.body.intranet_id;

		//if(request.body.apiKey == generateToken(md5)) {
			db.find({selector:{userId:intranet_id}}, function(er, result) {
			  if (er) {
          return response.status(400).send({message : "Cloudant Error"});
			  }

			  var json_response = [];
			  if(result.docs) {
				  for (var i = 0; i < result.docs.length; i++) {
					json_response[i] = result.docs[i];
				  }

				  response.json(json_response);
			  } else {
				  response.status(400).send({message : "Cloudant Error"});
			  }

			});
		/*} else {
			response.status(401).send({message : "Not Authorized"});
		}*/
  }
}

exports.add = function() {
  return function(request, response) {
    var chat = request.body.chat;


	//if(request.body.apiKey == generateToken(md5)) {

		db.insert(JSON.parse(chat), function(err, body, header) {
		  if (err) response.status(400).send({message : "Cloudant Error"});
		  else response.json(body);
		});

	/*} else {
		response.status(401).send({message : "Not Authorized"});
	}*/


  }
}


exports.delete = function() {
  return function(request, response) {
    var id = request.body.id;
    var rev = request.body.rev;

    db_nano.destroy(id, rev, function(err, body, header) {
      if (!err) response.json({code : "200", message: "Deleted document "+id});
      else response.json({code : err.statusCode, message: err.message});
    });
  }
}

exports.bulk = function() {
  return function(request, response) {
    var document = request.body.document;


	//if(request.body.apiKey == generateToken(md5)) {

		db_nano.bulk(document, function (err, body) {
		  if (!err) {
			     response.json(body);
		  } else {
        response.status(400).send({message : "Cloudant Error"});
      }
		});

	/*} else {
		response.status(401).send({message : "Not Authorized"});
	}*/


  }
}

var generateToken = function(md5) {
	return token_md5 = (md5('watson.T0pS3cRetP4ssw0rdOff4llT1mZ.cio'+new Date().toISOString().substring(0, 10)));
}
