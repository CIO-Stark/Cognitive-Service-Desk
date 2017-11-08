/*global angular*/
/*jslint nomen: true */
(function () {
    "use strict";


    var negative_count = 0;
    
    angular.module("chat.controller", ["ionic.rating"]).controller("ChatController",
            ["$scope", "$state", "$ionicModal", "$ionicPopup", "$timeout", '$ionicPopover', "$localstorage", "$ionicLoading", "RatingService", "ChatService",  "LoginService", "MetricsService", "FavoritesService", "userControl", "$sce",
                function ChatController($scope, $state, $ionicModal, $ionicPopup, $timeout, $ionicPopover, $localstorage, $ionicLoading, RatingService, ChatService, LoginService, MetricsService, FavoritesService, userControl, $sce) {

        var elements = {
            "sendMsgBtn": document.getElementById("msgSender"),
            "inputEl": document.getElementById("msgField")
        };

        var props = {
            "currentContext": {
                "userID": "",
                "platform": "web",
                "confidence": "",
                "chatHistory": [],
                "entities": [],
                "intents": []
                
            }
        };

        var configs = {
            chatLocale: "",
            finishTimeout: "",
            watsonLoading: document.getElementById("loadingDiv"),
            chatElement: document.getElementById("scrollDiv"),
            feedbackSession: document.getElementById("feedbackSession"),
            finishSession: document.getElementById("finishSession"),
            feedbackTxt: document.getElementById("feedbackTxt"),
            footerBar: document.getElementById("chatFooter"),
            textBox: document.getElementById("msgField"),
            answerLength: "",
            inputFocus: function () {
                this.textBox.focus();
                return this;
            },
            showLoadingIcon: function (bool) {
                $scope.isLoading = bool;
                return this;
            },
            showFeedbackDiv: function (bool) {
                $scope.showFeedbackDiv = bool;
                return this;
            },
            showFinishDiv: function (bool) {
                $scope.showFinishDiv = bool;
                return this;
            },
            chatShouldBeDisabled: function (bool) {
                $scope.disableChat = bool;
                return this;
            },
            changeFavState: function (bool) {
                $scope.favState = bool || false;
                return this;
            }
        },
        //token = document.getElementById("token").innerHTML.trim(),
        SSOUsername = document.getElementById("username").innerHTML.trim(),
        SSOname = document.getElementById("userFullName").innerHTML.trim(),
        root = $scope.$root;
        $scope.favState = false;

        var methods = {
            "scrollToBottom": function () {
                $timeout(function() {
                  configs.chatElement.scrollTop = configs.chatElement.scrollHeight
                },0);
                // return this;
            },
            "blockUI": function () {
                $scope.disableChat = true;
                $scope.isLoading = true;
            },
            "releaseUI": function () {
                $scope.disableChat = false;
                $scope.isLoading = false;
            },
            "insertMessage": function (message) {
                $timeout(function () {
                    root.messages.push(message);
                    methods.scrollToBottom();
                    $scope.toggleIntents();
                }, 0);
            },
            "showFavoriteDiv": function (bool) {
                $scope.favs = bool;
                return this;
            },
            "buildDialog": function (text, userId, intents, context) {
                this.insertMessage({
                    "text": text,
                    "userId": userId,
                    "intents": intents || [],
                    "context": context || []
                });
            },
            // first message to be called when widget is initialized
            "getMessages": function () {
                ChatService.askWatson("hello", true).then(function (data) {
                    if (data.output) {
                        if (data.output.text.length) {
                            // name replacement
                            if(/{{nome}}/.test(data.output.text[0]))
                                data.output.text[0] = 
                                    data.output.text[0].replace("{{nome}}", userControl.getFirstName());
                        

                            methods.buildDialog(data.output.text[0], "watson");
                            configs.inputFocus();
                        } else {
                            methods.buildDialog(root.defaultMessages.error[0], "watson");
                        }
                    } else {
                        methods.buildDialog(root.defaultMessages.error[0], "watson");
                    }
                }, function (error) {
                    console.log(error);
                });
            },
            "keyListener": function (event) {
                if (event) {
                    var key = event.which || event.keyCode;
                    if (!$scope.disableChat) {
                        if (key === 13) {
                            event.preventDefault();
                            methods.sendMessage();
                        }
                    }
                }
            },
            /**
             * send message to conversation service
             * @internalQuestion if it is the message created by user click, so the text will be sent to conversation
             * but it wont shows up as a dialog ballon
             */
            "sendMessage": function (internalQuestion) {

                var inputText = elements.inputEl.value;
                if (!inputText || inputText === "\r\n") {
                    return;
                } else {
                    elements.inputEl.value = "";
                    if(!internalQuestion) methods.buildDialog(inputText);
                }
                methods.showFavoriteDiv(false);
                methods.blockUI();

                // clear genericAnswer context, if it exists to reset it within Conversation
                // otherwise the app will show genericAnswer all the time, it must shows up only if requested (anything_else questions)
                if(ChatService.getProps().context.genericAnswer)
                    ChatService.getProps().context.genericAnswer = false;

                ChatService.askWatson(inputText, null).then(function (data) {
                    if (data.intents && data.entities) {
                        methods.updateContext({
                            "intents": data.intents || [],
                            "entities": data.entities || [],
                            "context" : data.context
                        });
                    }

                    // look for feedback - final flow and present the feedback div
                    $timeout(function () {
                                    configs.showFeedbackDiv(true);
                                }, 200);
                    
                    
                    if (data.output) {
                        if (data.output.text.length) {

                            // remove the intents help view (in case user opened it)
                            root.isIntentHelpView = false;

                            //var shouldAskFeedback = /{{final}}/.test(data.output.text[0]);
                            var finalText = "";
                            finalText = data.output.text[0];

                            /*if (shouldAskFeedback) {
                                $timeout(function () {
                                    configs.showFeedbackDiv(true);
                                }, 200);

                                finalText = data.output.text[0].replace("{{final}}", "").trim();
                                
                            } else {
                                finalText = data.output.text[0];
                            }*/

                            
                            methods.buildDialog(finalText, "watson", data.intents, data.context);
                            

                            if(data.context.otherQuestions)
                                methods.buildDialog(data.context.otherQuestions, "watson", data.intents);

                            /*if (Number(props.currentContext.confidence) <= 0.30) {
                                methods.buildDialog("Não entendi", "watson");
                            } else {
                                methods.buildDialog(finalText, "watson", data.intents);
                            }*/

                            console.log(data);

                            configs.inputFocus();
                        } else {
                            methods.buildDialog("empty response", "watson");
                        }
                    }
                }, function (err) {
                    console.log(err);
                    methods.buildDialog(root.defaultMessages.error[$scope.returnDefaultMessageIndex(0, 2)], "watson");
                }).then(function () {
                    methods.releaseUI();
                });

            },
            "updateContext": function (contextObj) {
                console.log(contextObj);
                 if(contextObj.intents.length) {
                    props.currentContext.intents = contextObj.intents;
                    props.currentContext.confidence = contextObj.intents[0].confidence;
                 }

                if (contextObj.entities.length){
                    props.currentContext.entities = [];
                    for (var i = 0; i < contextObj.entities.length; i += 1) {
                        props.currentContext.entities.push(contextObj.entities[i].entity);
                    }
                }
                
            },
            "initListeners": function () {
                elements.sendMsgBtn.addEventListener("click", methods.sendMessage);
                document.getElementById("chatFooter").addEventListener("keypress", methods.keyListener);
                return this;
            },
            "init": function (SSOUsername) {
                LoginService.validateSession(SSOUsername, SSOname).then(function (data) {
                    root.messages = [];
                    $localstorage.set("usermail", SSOUsername);
                    root.watsonRobot = {
                        _id: "",
                        pic: "images/watsonPic.svg",
                        username: "Watson"
                    };

                    props.currentContext.userID = SSOUsername;
                    props.currentContext.chatHistory = root.messages;
                    root.favState = true;
                    //root.token = token;
                    root.user = userControl.getFullUser();

                    // get initial message from conversation
                    methods.getMessages();
                }, function (responseStatus) {
                    window.alert("Session expired, please log in again");
                    LoginService.logout();
                });
            }
        };

        methods.initListeners().init(SSOUsername);

        function saveMessageOnDatabase() {
            $scope.data = {};
            $scope.myPopup = $ionicPopup.show({
                template: "<input type='text' maxlength='20' class='popup-input' ng-model='data.favoriteName'>",
                title: "Adicionar favorito",
                subTitle: "Dê um nome para este chat",
                cssClass: "favorite-popup",
                scope: $scope,
                buttons: [{
                    text: "Cancelar"
                }, {
                    text: "<b>Salvar</b>",
                    type: "button-positive",
                    onTap: function (e) {
                        if (!$scope.data.favoriteName) {
                            e.preventDefault();
                        } else {
                            return $scope.data.favoriteName;
                        }
                    }
                }]
            });

            $scope.myPopup.then(function (favoriteName) {
                if (favoriteName) {
                    $ionicLoading.show({
                        template: "<ion-spinner class='spinner'></ion-spinner>",
                        hideOnStateChange: true
                    });

                    var conversation = {
                        userId: userControl.getUser(),
                        chat: root.messages,
                        date: Date.now(),
                        name: favoriteName
                    };

                    FavoritesService.insertFavorite(conversation).then(function (data) {
                        methods.showFavoriteDiv(false);
                        root.favoritesCounter = root.arr.length;
                        root.lastFavorite = data;
                        conversation._id = data.id;
                        conversation._rev = data.rev;
                        conversation.favorite = true;
                        conversation.show = false;
                        conversation.username = root.SSOUsername;
                        configs.changeFavState(true);
                        $localstorage.setObject("lastFavorite", conversation);
                        root.arr.push(JSON.parse($localstorage.get("lastFavorite")));
                        $ionicLoading.hide();
                        root.favoritesCounter += 1;
                        $localstorage.delete("lastFavorite");
                    }, function (error) {
                        $ionicLoading.hide();
                    });
                }
            });
        }

        function deleteMessageOnDatabase() {
            $ionicLoading.show();
            FavoritesService.deleteFavorite(root.lastFavorite.id, root.lastFavorite.rev).then(
                function successCallback() {
                    $timeout(function () {
                        root.arr.splice(root.arr.length - 1, 1);
                        root.favoritesCounter -= 1;
                        configs.changeFavState();
                        $ionicLoading.hide();
                    }, 100);

                },
                function errorCallback() {
                    $ionicLoading.hide();
                    window.alert("Please try again!");
                }
            );
        }

        $scope.favoriteMessage = function (favState) {
            //return !$scope.favState ? saveMessageOnDatabase() : deleteMessageOnDatabase();
            return saveMessageOnDatabase();
        };

        $scope.closePopup = function () {
            $scope.myPopup.close();
        };

        $ionicModal.fromTemplateUrl("chat/box-page.view.html", {
            scope: $scope,
            animation: "slide-in-up"
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function () {
            $scope.modal.show();
        };

        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        root.openSettings = function () {
            $scope.settingsModal = $ionicModal.fromTemplateUrl("settings/settings.view.html", {
                animation: "slide-in-up",
                hardwareBackButtonClose: true
            }).then(function (modal) {
                modal.show();
            });
        };

        $scope.$on("changeLang", function () {
            configs.showFeedbackDiv(false).showFavoriteDiv(false).showFinishDiv(false).chatShouldBeDisabled(false);
            methods.init(SSOUsername);
        });

        $scope.$on("elastic:resize", function (e, ta) {
            if (!ta) {
                return;
            }

            if (!configs.footerBar) {
                return;
            }

            var taHeight = ta[0].offsetHeight,
                newFooterHeight = taHeight + 20;

            newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
            configs.footerBar.style.height = newFooterHeight + "px";
            configs.chatElement.style.marginBottom = (newFooterHeight - 43) + "px";
        });


        $scope.goToFavorites = function () {
            $state.go("favorites");
        };

        $scope.openRatingModal = function (src) {
            if (src !== "settings") {
                $scope.ratingPopup.close();
            }

            if (root.popover) {
                root.popover.hide();
            }

            root.ratingModal = $ionicModal.fromTemplateUrl("ratings/ratings.view.html", {
                animation: "slide-in-up",
                backdropClickToClose: false
            }).then(function (modal) {
                root.ratingModal = modal;
                root.ratingModal.show();
            });
        };

        $scope.returnDefaultMessageIndex = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        $scope.trustContent = function(msg) {
            //console.log($sce.trustAsHtml(root.messages[0].text));
               return $sce.trustAsHtml(msg);
        };

        $scope.pergunta = function(msg) {
            elements.inputEl.value = msg.replace("-", " ");
            methods.sendMessage(true);
        };

        root.loadFileBox = function (unique_link) {
            $scope.boxlinkof = $sce.trustAsResourceUrl(unique_link);
            $scope.openModal();
        };

        $scope.sendFeedback = function (type) {
            props.currentContext.feedbackDate = new Date().getTime();
            props.currentContext.type = 'feedback';
            props.currentContext.feedbackStatus = type;
            props.currentContext.userCount = "User";
            props.currentContext.chatHistory = root.messages;
            console.log(props.currentContext);

            /*if (type === "positive") {
                methods.buildDialog(root.defaultMessages.goodAnswer);
            } else {
                methods.buildDialog(root.defaultMessages.badAnswer);
            }*/

            methods.blockUI();
            ChatService.sendFeedback(props.currentContext).then(function (data) {
                if (type === "positive") {
                    methods.showFavoriteDiv(true);
                }
                console.log(data);
            }, function (err) {
                console.log(err);
            }).then(function () {
                configs.showFeedbackDiv(false);
                methods.releaseUI();
                methods.buildDialog("Obrigado pelo feedback", "watson");


                negative_count++;
                /*if(negative_count == 2) { //genesys
                  methods.buildDialog('I see you are facing issues. Let me call someone to help you.', 'watson');
                  socket.emit('StartGenesys', {userid: document.getElementById('username').innerHTML.trim()});
                }*/
            });
        };



        

    }])
    //solution found to present content from Conversation including angular directives
    //https://stackoverflow.com/questions/22737927/angular-ng-bind-html-filters-out-ng-click?noredirect=1&lq=1
    .directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
            return scope.$eval(attrs.compile);
            },
            function(value) {
            element.html(value);
            $compile(element.contents())(scope);
            }
        )
        }
    }]);

}());
