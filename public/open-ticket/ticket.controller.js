(function () {
    "use strict";

    angular.module("ticket.controller", []).controller('TicketController', ['$rootScope', '$scope', '$ionicModal', '$timeout', 'userControl',  function TicketController($rootScope, $scope, $ionicModal, $timeout, userControl) {
        var user = userControl.getUser();

    }]);


}());