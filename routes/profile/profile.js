var credentials = require('../../config/credentials.js');
var request = require('request');

//https://watson-api-explorer.mybluemix.net/dialog/api/v1/dialogs/8d6e2f4b-7b5c-4f5c-a693-89882c61357a/profile

exports.set = function() {
  return function(req, res) {
    var first_name = req.body.first_name;
    var email = req.body.email;
  	var client_id = req.body.client_id;

  	var options = { method: 'PUT',
    url: 'https://watson-api-explorer.mybluemix.net/dialog/api/v1/dialogs/'+credentials.dialog.id.pt+'/profile',
  	headers:
    { 'content-type': 'application/json',
  		authorization: 'Basic '+new Buffer(credentials.dialog.login.username+":"+credentials.dialog.login.password).toString('base64') },
  	  body: {
        client_id: client_id,
			  name_values: [ { name: 'username', value: first_name }, { name: 'size', value: email } ]
		},
    json: true };

    console.log('entrou no profile');
    console.log('options: ',options);

    var options_es = {
      method: 'PUT',
      url: 'https://watson-api-explorer.mybluemix.net/dialog/api/v1/dialogs/'+credentials.dialog.id.es+'/profile',
    	headers:
      { 'content-type': 'application/json',
    		authorization: 'Basic '+new Buffer(credentials.dialog.login.username+":"+credentials.dialog.login.password).toString('base64') },
    	  body: {
          client_id: client_id,
    		  name_values: [ { name: 'username', value: first_name }, { name: 'size', value: email } ]
        },
      json: true };

  	request(options, function (error, response, body) {
  	  if (error) return res.status(400).send(error);

      request(options_es, function (error, response, body) {
    	  if (error) return res.status(400).send(error);
        res.send(body);
    	});

  	});
  }
}
