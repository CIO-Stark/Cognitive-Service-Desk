/*global angular*/
(function () {
    'use strict';

    angular.module('login.service', []).factory('LoginService', ['$rootScope', '$state', '$localstorage', '$http', '$q', 'userControl', 'defaultMessages', '$ionicHistory', function LoginService($rootScope, $state, $localstorage, $http, $q, userControl, defaultMessages, $ionicHistory) {



        function httpStatusHandler(status) {
            switch (status) {
            case 404:
                return 'Server not found';
            case 403:
                return 'Forbidden';
            case 401:
                return 'Invalid Credentials';
            case 0:
                return 'Failed to connect';
            default:
                return ['HTTP Response error:', status].join(' ');
            }
        }

        
             /**
        * @Intranet ID {string} arg1
        **/
        function validateSession(username) {
            var deferred = $q.defer(),
                user = {
                    _id: 'xxxxxxxx',
                    //pic: $localstorage.get('userPhoto') || ['http://faces.tap.ibm.com:10000/image/', username, '.jpg'].join(''),
                    username: 'teste'
                };

            userControl.setUser(user);
            $localstorage.set('session', username);
            deferred.resolve('success');

            return deferred.promise;
        }

        function logout() {
            $rootScope.arr = [];
            $rootScope.messages = [];
            $localstorage.delete('session');
            $localstorage.delete('formalName');
            $localstorage.delete('locale');
            $localstorage.delete('prefix');
            window.location.href = 'https://watsonithelpbeta.mybluemix.net/logout';
        }

        return {
            validateSession : validateSession,
            logout : logout,
            httpStatusHandler : httpStatusHandler
        };

    }]);

}());
