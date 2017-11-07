var credentials = require('../../config/credentials.js');
var watson = require('watson-developer-cloud');
//var nlClassifier = watson.natural_language_classifier(credentials.nlc.login);
var Promise = require('bluebird');
var db = require('../../js/db.js');
var classifier_id;

/*exports.classify = function(question,locale,classifierslist) {
  return new Promise(function ExecuteNLCRequest(resolve, reject) {
    db.classifiers().then(function (classifierslist) {
        if (locale === 'pt') {
              classifier_id = classifierslist[1]
            } else {
              classifier_id = classifierslist[0];
            }
            var params = {
              classifier: classifier_id,
              text: question
            };

    nlClassifier.classify(params, function(err, results) {
        if (err) reject(err);
              else resolve(results);
              });
      },
      function (error){
      }
    )
    })
};*/
