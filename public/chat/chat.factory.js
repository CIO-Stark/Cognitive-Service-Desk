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

        /*function checkLocale() {
            var locale = userControl.getUserLocale();
            props.locale = locale;
            defaultMessages.translate();
            return locale === 'pt' ? 'pt' : 'es';
        }
        */
        return {
            "getProps":  function(){ return props},
            "askWatson": function (question, initial) {
                
                return new Promise(function(resolve, reject) {
                   
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
                  


                });


            },
            "sendFeedback": function (feedbackObj) {
                return new Promise(function(resolve, reject) {
                    feedbackObj.locale = props.locale;

                    // for saintPaul, feedback is for each chat interaction, so jusr send question and answer on each chathistory
                    if(feedbackObj.chatHistory)
                        feedbackObj.chatHistory = feedbackObj.chatHistory.slice(Math.max(feedbackObj.chatHistory.length - 2, 0));

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
            },
            "findIntentsHelpContent": function (intent) {
                return new Promise(function(resolve, reject) {
                    $http({
                        "method": "GET",
                        "url": "/intentsHelpContent/" + intent,
                        "timeout": 5000
                    }).success(function(data) {
                        resolve(data);
                    }).error(function(err) {
                        resolve(err);
                    });
                });
            }
        };

    };


})();
