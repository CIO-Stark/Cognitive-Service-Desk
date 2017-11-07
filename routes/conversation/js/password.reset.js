var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

exports.intranet = function(email) {

  var reset_teste_url = 'http://cap-sg-prd-4.integration.ibmcloud.com:16256/reset';

  var reset_options = {
   method: 'POST',
   url: reset_teste_url,
   form: {'email': email},
   headers:{ 'content-type': 'application/x-www-form-urlencoded'}
  }

  return new Promise(function ExecutePasswordReset(resolve, reject) {
    request(reset_options).then(function ResetIntranet(result) {
      resolve(result);
    }).catch(function ResetErrro(error) {
      reject(error);
    });
  });
}
