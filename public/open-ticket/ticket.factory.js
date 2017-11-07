(function () {
    'use strict';
    angular.module('rating.service', []).factory('RatingService', ['$http', '$q', '$timeout', '$rootScope', function RatingService($http, $q, $timeout, $rootScope) {

        /**
         * @Intranet Id {String} arg1
         * @Rating {Number} arg2
         */
        function rateExperience (intranet_id, rate) {
            var proxy = $rootScope.proxyURL+ '/analytics/rating';
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: proxy,
                timeout: 50000,
                data: {
                    client_id: $rootScope.client_id,
                    conversation_id: $rootScope.conversation_id,
                    platform: 'Web',
                    userid: intranet_id,
                    rating: rate,
                    apiKey: $rootScope.token
                }
            };

            $http(req)
                .success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        }
        
        /**
         * @Intranet Id {String} arg1
         * @images {Array of images - B64} arg2
         @comments {String} arg3
         @category {String} arg4
         **/
        function rateExperienceWithDetails (intranet_id, images, comments, category) {
            var newArr = [];

            console.log(images);

            images.map(function(image) {
                if(image) {
                    newArr.push(image.substring(image.indexOf(',')+1, image.length));
                }
            });

            console.log(newArr);

            var proxy = $rootScope.proxyURL+ '/feedback/email';
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: proxy,
                timeout: 30000,
                data: {
                    email: intranet_id,
                    deviceid : navigator.appName,
                    deviceos : navigator.appVersion,
                    attachments : newArr,
                    comments : comments,
                    category : category,
                    apiKey: $rootScope.token
                }
            };

            $http(req)
                .success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        }

        return {
            rateExperience : rateExperience,
            rateExperienceWithDetails : rateExperienceWithDetails
        };

    }]);
}());