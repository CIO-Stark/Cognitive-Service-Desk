(function() {
    'use-strict';
    
    angular
        .module('eula.controller', [])
        .controller('EulaController', EulaController);
    
    EulaController.$inject = ['$scope', '$ionicModal'];
    
    function EulaController($scope, $ionicModal) {
        
         $scope.closeSettings = function() {
            $scope.modal.remove();    
        }   
    };
	
})();