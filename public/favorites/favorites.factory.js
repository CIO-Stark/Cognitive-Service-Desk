/*global angular*/
(function () {
    'use strict';
    	
    function returnReqObj(reqObj) {
        return {
            method: reqObj.HTTPMethod,
            url: reqObj.proxyURL,
            timeout: reqObj.timeout || 200000,
            headers: reqObj.headers || {},
            data: reqObj.requestData || {}
        };
    }
    
    angular.module('favorites.service', []).factory('FavoritesService', ['$http', '$q', '$localstorage', '$rootScope', function FavoritesService($http, $q, $localstorage, $rootScope) {
          
		/**
		* @chat bubble {JSObject} arg1
		**/
        function insertFavorite(chat) {
             
            var deferred = $q.defer();
			$http(returnReqObj({
				HTTPMethod : 'POST',
				proxyURL: [$rootScope.proxyURL, '/favorites/add'].join(''),
                requestData: {
                    chat : JSON.stringify(chat),
					apiKey: $rootScope.token
                }
			})).success(function (data) {
				deferred.resolve(data);
			}).error(function (data, status) {
				deferred.reject(status);
			});

			return deferred.promise;
        }
        
		/**
		* @Intranet ID {string} arg1
		**/
		function retrieveFavorites(intranet_id) {
            
            var deferred = $q.defer();
			$http(returnReqObj({
				HTTPMethod : 'POST',
				proxyURL: [$rootScope.proxyURL, '/favorites/search'].join(''),
                requestData: {
                    intranet_id : intranet_id,
					apiKey: $rootScope.token
                }
			})).success(function (data) {
				deferred.resolve(data);
			}).error(function (data, status) {
				deferred.reject(data);
			});

			return deferred.promise;

        }
        
		/**
		* @fav ID {Number} arg1
		* @mongo ID {Number} arg2
		**/
        function deleteFavorite(id, rev) {
            
            var deferred = $q.defer();
			$http(returnReqObj({
				HTTPMethod : 'POST',
				proxyURL: [$rootScope.proxyURL, '/favorites/remove'].join(''),
                requestData: {
                    id: id,
                    rev: rev,
					apiKey: $rootScope.token
                }
			})).success(function (data) {
				deferred.resolve(data);
			}).error(function (data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
        }
        
        /**
		* @Collection of favorites {Array of JSobjects} arg1
		**/
        function deleteFavorites(docs) {
            
            var deferred = $q.defer();
			$http(returnReqObj({
				HTTPMethod : 'POST',
				proxyURL: [$rootScope.proxyURL, '/favorites/bulk'].join(''),
                requestData: {
                    document: {
                        docs
                    },
                    apiKey: $rootScope.token
                }
			})).success(function (data) {
				deferred.resolve(data);
			}).error(function (data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
        }
        
        return {
            insertFavorite: insertFavorite,
            retrieveFavorites: retrieveFavorites,
            deleteFavorite: deleteFavorite,
            deleteFavorites: deleteFavorites
        };


    }]);

}());