(function() {
    'use-strict';
    
    angular
        .module('ratings.controller', ['ngFileUpload'])
        .controller('RatingsController', RatingsController);
    
    RatingsController.$inject = ['$rootScope', '$scope', '$ionicModal', '$timeout', 'RatingService', 'userControl'];
    
    function RatingsController($rootScope, $scope, $ionicModal, $timeout, RatingService, userControl) {
		var user = userControl.getUser();
		$rootScope.thumbs = ['', '', ''];
		$scope.thumbsActive = [false, false, false];
		$scope.thumbsLoading = [false, false, false];
		$rootScope.showImageLoading = false;
		$scope.optionSelected = false;
		$scope.disableUpload = false;
		$scope.sendingFeedback = false;
		$scope.ratingObj = {
			userinput: '',
			errorMsg: '',
			optSelected: false
			
		}
	
		
		$scope.feedbackSelected = function(identifier) {			
			if(identifier === $scope.typeOfMessage) {
				$scope.optionSelected = true;
				$scope.errorMsg = '';
				return true;
			} else {
				return false;
			}
		}
		
		$scope.selectFeedback = function(identifier) {
			$scope.ratingObj.optSelected = true;
			$scope.ratingObj.errorMsg = '';
			$scope.typeOfMessage = identifier;
		}
		
		$scope.uploadImage = function(index) {
			var inputFile = document.getElementById('file');
			inputFile.click();
			$scope.selectedIndex = index;	
			
		}

	   $scope.showContent = function($fileContent){
		   $scope.thumbsLoading[$scope.selectedIndex] = true;
		   $scope.thumbsActive[$scope.selectedIndex] = true;
		   $rootScope.thumbs[$scope.selectedIndex] = $fileContent;
		   setImage()
	   };

	
		function setImage() {
			var idSelector = 'image-'+$scope.selectedIndex;
			$timeout(function(){
				$scope.thumbsLoading[$scope.selectedIndex] = false;
				document.getElementById(idSelector).src = $rootScope.thumbs[$scope.selectedIndex];
			}, 0)
		};
		
		
		
		$scope.closeRatingModal = function() {
			$rootScope.ratingModal.remove();
		};
		
		$scope.removeThumb = function(index) {
			var idSelector = 'image-'+index;
			$timeout(function(){  
				$scope.thumbsActive[index] = false;
				$rootScope.thumbs[index] = '';
				document.getElementById(idSelector).src = '/images/Pic1.svg';
			}, 0)
		
		};
		
		$scope.sendFeedback = function() {
			$scope.ratingObj.errorMsg = '';
			var picArr = $rootScope.thumbs,
				message = $scope.ratingObj.userinput,
				feedbackType = $scope.typeOfMessage;
			

			$timeout(function() {
				if (!feedbackType) {
					$scope.ratingObj.errorMsg = 'Please select a type'; 
					return;
				}

				if(message === '') {
					$scope.ratingObj.errorMsg = 'Please detail your ' + getFormatedType(feedbackType); 
					return;
				} 

				$scope.sendingFeedback = true;
				RatingService.rateExperienceWithDetails(user, picArr, message, feedbackType).then(
				function(data) {
					$rootScope.ratingModal.remove();
					$scope.sendingFeedback = false;
				}, function(err) {
					console.log(err);
					$scope.ratingObj.errorMsg = 'An error occurred while sending your feedback - please try again';
					$scope.sendingFeedback = false;
				})
			}, 0)
		};
		
		function getFormatedType(type) {
			if (type === 'hint') {
				return 'suggestion';
			} else {
				return 'problem'
			}
		}
	};
})();