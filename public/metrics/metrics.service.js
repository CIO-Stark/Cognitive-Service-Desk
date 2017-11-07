(function () {
    'use-strict';

    angular.module('metrics.service', []).service('MetricsService', MetricsService);

    MetricsService.$inject = ['$rootScope', '$q', '$http', '$localstorage', 'userControl'];

    function MetricsService($rootScope, $q, $http, $localstorage, userControl) {

        function checkLocale() {
            var locale = $localstorage.get('locale') || userControl.getUserLocale();
            return locale === 'pt' ? 1 : 2;
        }

        function getFormatedDate() {
            var today = new Date(),
                dd = today.getDate(),
                mm = today.getMonth() + 1,
                yyyy = today.getFullYear();

            if (dd < 10) {
                dd = ['0', dd].join('');
            }
            if (mm < 10) {
                mm = ['0', mm].join('');
            }

            var offset = ((today.getTimezoneOffset() / 60) < 0 ? '+' : '-');

            return [[dd, mm, yyyy].join('/'), ' at ', today.getHours(), ':', today.getMinutes(), ' in GMT', offset, (today.getTimezoneOffset() / 60) ].join('');
        }

        /**
         * @Question asked {string} arg1
         * @feedback1Option {Number} arg2
         * @cluster1 identifier {string} arg3
         * @feedback2Option {Number} arg4
         * @cluster2 identifier {string} arg5
         **/
        function storeFeedback(question, feedback, cluster1, confidence, feedback2, cluster2, feedbackMessage, conversation) {
            feedback2 = feedback2 >= 0 ? feedback2 : -1;
            cluster2 = cluster2 ? cluster2 : -1;

            var deferred = $q.defer();
            console.log(arguments);

            // var proxy = $rootScope.proxyURL + '/analytics/feedback';
            var proxy = '/analytics/feedback';
            var req = {
                method: 'POST',
                url: proxy,
                timeout: 50000,
                data: {
                    client_id: $rootScope.client_id,
                    conversation_id: $rootScope.conversation_id,
                    userid: userControl.getUser(),
                    neg_fdbk_comment : feedbackMessage || '',
                    platform: 'Web',
                    lan: checkLocale(),
                    question: question,
                    feed1: feedback,
                    cluster1: cluster1,
                    confidence: confidence,
                    feed2: feedback2,
                    cluster2: cluster2,
                    apiKey: $rootScope.token,
                    ticketDate: getFormatedDate(),
                    employeeCountry: $rootScope.prefix,
                    conversation: conversation || ''
                }
            };
            
            $http(req).success(function(data) {
                deferred.resolve(data);
            }).error(function(err, status) {
                console.log(err);
                deferred.reject(err);
             });

            return deferred.promise;

        }

        return {
            storeFeedback: storeFeedback
        };

    }

}());
