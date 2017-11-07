(function() {
    'use strict';
    angular.module('chat.service', []).factory('ChatService', ChatService);

    ChatService.$inject = ['$http', '$q', '$rootScope', 'defaultMessages', 'userControl', '$localstorage'];
    function ChatService($http, $q, $rootScope, defaultMessages, userControl, $localstorage) {

        var props = {
            "context": {},
            "initialContext": "",
            "locale": ""
        };

        function checkLocale() {
            var locale = userControl.getUserLocale();
            props.locale = locale;
            defaultMessages.translate();
            return locale === 'pt' ? 'pt' : 'es';
        }

        return {
            "askWatson": function (question, reloadLanguage, genesys, initial) {
                if (reloadLanguage) {
                    checkLocale();
                }
                return new Promise(function(resolve, reject) {


                  if(genesys && genesys.active) {

                    $http({
                        "method": "POST",
                        "url": "/askGenesys",
                        "timeout": 50000,
                        "data": {
                            "message": question,
                            "service_id": genesys.service_id
                        }
                    }).success(function(data) {
                      console.log(data);
                        resolve({genesyMessage: data});
                    }).error(function(data, status) {
                        resolve($rootScope.defaultMessages.error[0]);
                    });

                  } else {
                    $http({
                        "method": "POST",
                        "url": "/askWatson",
                        "timeout": 50000,
                        "data": {
                            "question": question,
                            "apiKey": $rootScope.token,
                            "context": props.context,
                            "language": props.locale || "pt"
                        }
                    }).success(function(data) {
                        if (data.context) {
                            props.context = data.context;
                            if (initial) {
                                props.initialContext = data.context;
                            }
                        }
                        $rootScope.conversation_id = data.context.conversation_id;
                        resolve(data);
                    }).error(function(data, status) {
                        resolve($rootScope.defaultMessages.error[0]);
                    });
                  }


                });


            },
            "sendFeedback": function (feedbackObj) {
                return new Promise(function(resolve, reject) {
                    feedbackObj.locale = props.locale;
                    $http({
                        "method": "POST",
                        "url": "/sendFeedback",
                        "timeout": 50000,
                        "data": {
                            "feedback": feedbackObj
                        }
                    }).success(function(data) {
                        props.context = props.initialContext;
                        resolve(data);
                    }).error(function(err) {
                        resolve(err);
                    });
                });
            }
        };

    };


})();
