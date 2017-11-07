var md5 = require('md5');

exports.token = function() {
  return function(req, res) {
    var username = req.body.username;
    var token = req.body.token;
    var apikey = req.body.apikey;

    var apikey_local = 'watson.T0kenS3creT.cio';
    var apikey_base64 = new Buffer(apikey_local).toString('base64');

    if(apikey == apikey_base64) {

      var secret = tokenGenerator(md5);

      res.send({message : "Authorized",
                secretkey : secret
              });

    } else {
      res.send({message : "Unauthorized"});
    }
  }
}


var tokenGenerator = function(md5) {
  return (md5('watson.T0pS3cRetP4ssw0rdOff4llT1mZ.cio'+new Date().toISOString().substring(0, 10)));
}
