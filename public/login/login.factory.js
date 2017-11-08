/*global angular*/
(function () {
    'use strict';

    angular.module('login.service', []).factory('LoginService', ['$rootScope', '$state', '$localstorage', '$http', '$q', 'userControl', 'defaultMessages', '$ionicHistory', 
        function LoginService($rootScope, $state, $localstorage, $http, $q, userControl, defaultMessages, $ionicHistory) {



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
        function getBluePagesInfo(intranetId) {
            var proxy = 'https://faces.tap.ibm.com/api/find/',
                req = {
                    method: 'POST',
                    async: false,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequest: function (obj) {
                        var str = [],
                            p;
                        for (p in obj) {
                            if (obj.hasOwnProperty(p)) {
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            }
                        }
                    },
                    url: proxy,
                    timeout: 10000,
                    data: {
                        q: intranetId
                    }
                };

            $http(req)
                .success(function (data) {
                    userControl.setUserUid(data[0].uid);
                    userControl.setFormalName(data[0].name);
                    $localstorage.set('uid', data[0].uid);
                    $localstorage.set('formalName', data[0].name);
                    return data[0].name;
                }).error(function (data, status) {
                    return 'IBMer';
                });

        }
             /**
        * @Intranet ID {string} arg1
        **/
        function validateSession(username, fullName) {
            
            //getBluePagesInfo(username);
            var deferred = $q.defer(),
                user = {
                    _id: '',
                    pic: '',
                    username: username,
                    name: ''
                };

            user.name = fullName;
                
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
            
        }

        return {
            validateSession : validateSession,
            logout : logout,
            httpStatusHandler : httpStatusHandler,
            getBluePagesInfo : getBluePagesInfo
        };

    }]);

}());
