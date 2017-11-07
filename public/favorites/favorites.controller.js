/*global angular*/
/*jslint nomen: true */
(function () {
    'use strict';
    angular.module('favorites.controller', []).controller('FavoritesController', ['$scope', '$state', '$ionicLoading', 'defaultMessages', '$localstorage', 'FavoritesService', 'LoginService', 'userControl', '$ionicModal', '$timeout', '$ionicPopover', '$ionicPopup', function ($scope, $state, $ionicLoading, defaultMessages, $localstorage, FavoritesService, LoginService, userControl, $ionicModal, $timeout, $ionicPopover, $ionicPopup) {


        var root = $scope.$root,
            viewLoading = function () {
                $ionicLoading.show({
                    template: '<ion-spinner class="spinner"></ion-spinner>',
                    hideOnStateChange: true
                });
            },
            chatElement = document.getElementById('scrollDiv'),
            chatBox = document.getElementById('chat-web');
        
		root.proxyURL = root.proxyURL || '';

        document.body.classList.add('platform-android');

        function getAppLanguage() {
            
            var prefix = root.languageSelector === 1 ? 'pt' : 'es';
        
			if (!root.isFavorite) {
				if (prefix !== $localstorage.get('locale')) {
					(function changeAppLanguage() {
						root.messages = [];
						userControl.setUserLocale(prefix);
						$localstorage.set('locale', prefix);
						root.selectedLanguage = prefix === 'pt' ? 'Portuguese(Brazil)' : 'Spanish';
						$scope.$emit('changeLang');
					}());
				}
			}
        }
        
        function setAppLanguage() {
            var locale = $localstorage.get('locale') || userControl.getUserLocale();
            if (locale === 'pt') {
				root.selectedLanguage = 'Portuguese(Brazil)';
                return 1;
            } else {
				root.selectedLanguage = 'Spanish';
                return 2;
            }
        }
        
        function retrieveFavorites() {
			var userId = userControl.getUser();
            FavoritesService.retrieveFavorites(userId).then(
                function successCallback(data) {
                    var key;
                    root.arr = [];
            
                    for (key in data) {
                        if (data.hasOwnProperty(key)) {
                            data[key].checked = false;
                            data[key].show = false;
                            data[key].favorite = true;
                            root.arr.push(data[key]);
                        }
    
                    }
                    $ionicLoading.hide();
                },
                function errorCallback(error) {
                    document.getElementById('favoriteErrorMsg').innerHTML = "Failed to load favorites, please try again";
                    $ionicLoading.hide();
                }
            );
		}
        
        function openPop() {
            root.alertPopup = $ionicPopup.alert({
                title: 'Change chat language',
                cssClass: 'change-lang-popup',
                cancelText: '',
                cancelType: '',
                okText: 'Confirm',
                okType: 'button-medium button-clear button-stable',
                template: '<button class="button button-icon ion-ios-close-empty teste" ng-click="closePopup()"></button><ion-list><ion-item ng-click="changeLanguage(1)" ng-class="{active: languageSelector === 1}"><span class="popup-lang-title">Portuguese</span></ion-item><ion-item ng-click="changeLanguage(2)" ng-class="{active: languageSelector === 2}"><span class="popup-lang-title">Spanish</span></ion-item></ion-list>'
            });

            // setTimeout(function () {
            //     document.getElementsByClassName('button-medium')[2].innerHTML += " ";
            // }, 100);

			root.alertPopup.then(function (res) {
                if (res) {
                    getAppLanguage();
                }
            });
        }
        
        function openModal() {
            $ionicModal.fromTemplateUrl('eula/eula.view.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                root.popover.hide();
                $scope.modal = modal;
                $scope.modal.show();
            });
        }
        
        function currentChatLoad() {
            root.favDate = '';
            root.isFavorite = false;
            root.messages = $scope.auxArr;
            $scope.auxArr = '';
            $timeout(function () {
                chatBox.style.paddingBottom = '40px';
                chatElement.scrollTop = chatElement.offsetHeight;
            }, 100);
        }

        $ionicPopover.fromTemplateUrl('settings/settings.view.html', {
            scope: $scope
        }).then(function (popover) {
            root.popover = popover;
        });
        
        root.favoritesCounter = -1;
        $scope.isActive = false;
        $scope.firstEntry = true;

        viewLoading();
        $timeout(function () {
            retrieveFavorites();
			root.languageSelector = setAppLanguage();
        }, 2500);
		if (root.auxArr) {
			root.messages = root.auxArr;
        }

        $scope.toggleGroup = function (chat) {
            if ($scope.previousChat !== chat) {
                $scope.shownGroup = chat;
                if (chat.favorite) {
                    root.favDate = chat.date;
                    root.isFavorite = true;
                    if (!$scope.auxArr) {
                        $scope.auxArr = root.messages;
                    }
                    $scope.firstEntry = false;
                    root.messages = chat.chat;
                    chatBox.style.paddingBottom = '5px';
                    chatElement.scrollTop = 0;
                } else {
                    if (!$scope.firstEntry) {
                        currentChatLoad();
                    }
                }

                $scope.previousChat = chat;
            }
        };

        $scope.isGroupShown = function (chat) {
            return $scope.shownGroup === chat;
        };

		$scope.refreshFavorites = function () {
            viewLoading();
            retrieveFavorites();
        };

        $scope.deleteFavorites = function () {
			if (!root.arr) {
				return 0;
			}
            var docs = [],
                arrayToDelete = [],
                i = 0,
                arrLength = root.arr.length;
            
            $ionicLoading.show({
                template: '<ion-spinner class="spinner"></ion-spinner>',
                hideOnStateChange: true
            });
      
            for (i; i < arrLength; i += 1) {
                if (root.arr[i].checked) {
                    root.arr[i]._deleted = true;
                    docs.push(root.arr[i]);
                    arrayToDelete.push(root.arr[i]._id);
                }
            }

            FavoritesService.deleteFavorites(docs).then(
                function successCallback() {
                    var i = 0,
                        j = 0,
                        arrLength = root.arr.length,
                        arrayToDeleteLength = arrayToDelete.length;
                
                    for (i; i < arrLength; i += 1) {
                        for (j; j < arrayToDeleteLength; j += 1) {
                            if (root.arr[i]._id === arrayToDelete[j]) {
                                if (root.messages === docs[j].chat && !$scope.firstEntry) {
                                    $scope.firstEntry = true;
                                    currentChatLoad();
                                }
                                $scope.arr.splice(i, 1);
                                if (root.lastFavorite) {
                                    if (arrayToDelete === root.lastFavorite.id) {
                                        root.favState = false;
                                    }
                                }
                            }
                        }
                    }

                    $ionicLoading.hide();

                },
                function errorCallback() {
                    $ionicLoading.hide();
                }
            );
        };

        $scope.$on('popover.hidden', function () {
            $scope.isActive = !$scope.isActive;
        });

        $scope.activeButton = function () {
            $scope.isActive = !$scope.isActive;
        };

		$scope.changeDialogLocale = function () {
            root.popover.hide();
            openPop();
        };

        root.closePopup = function () {
            $scope.alertPopup.close();
        };

        root.changeLanguage = function (language) {
            root.languageSelector = language;
        };

        $scope.openUserAgreements = function () {
            openModal();
        };

        $scope.doLogout = function () {
            LoginService.logout();
        };

        root.isClicked = false;
        $scope.slideInMenu = function () {
            $scope.isClicked = !$scope.isClicked;
        };
    }]);

}());
