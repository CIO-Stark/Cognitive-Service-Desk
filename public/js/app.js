/*global angular*/
/*jslint nomen: true */
(function () {
    "use strict";
    var app = angular.module("watsonchat", ["ionic", "monospaced.elastic", "custom-directives", "ionic.utils", "chat.controller", "ratings.controller", "favorites.controller", "eula.controller", "login.service", "chat.service", "favorites.service", "metrics.service", "rating.service", "iosSpinner"]);


    app.run(function ($ionicPlatform, $state, $rootScope) {

        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                window.StatusBar.styleDefault();
            }
            //
            //$rootScope.proxyURL = window.location.hostname === "localhost" ? "https://watsonithelpbeta.mybluemix.net" : "";
            $rootScope.proxyURL = window.location.hostname === "localhost" ? "http://localhost:3000" : "";
        });
    });

    app.config(function ($compileProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $compileProvider.debugInfoEnabled(false);
    });

    app.filter("nl2br", ["$filter", function ($filter) {
        return function (data) {
            if (!data) {
                return data;
            }
            return data.replace(/\n\r?/g, "<br />");
        };
    }]);

    app.service("userControl", function ($rootScope, $localstorage) {
        var user = {
                _id: "",
                pic: "",
                username: "",
                //locale: $localstorage.get("locale") || "",
                name:  ""               
            },
            favorites = [];

        return {
            setFormalName: function (name) {
                user.name = name;
            },
            setUserUid: function (uid) {
                user.uid = uid;
            },
            getUser: function () {
                return user.username;
            },
            getFullUser: function () {
                return user;
            },
            getName: function(){
                return user.name;
            },
            getFirstName: function () {
                return user.name.substring(0, (user.name.indexOf(" "))) || user.name;
            },
            setUser: function (userObject) {
                
                user._id = userObject._id;
                //user.pic = userObject.pic;

                user.name = userObject.name;
                user.username = userObject.username;
                //user.uid = $localstorage.get("uid") || userObject.uid;

                $rootScope.user = userObject;

            }
        };
    });

    app.service("defaultMessages", function ($rootScope, $localstorage, userControl) {
        $rootScope.defaultMessages =  {};
        var loaded;
        return {
            translate: function () {
                this.setCountryTelephone($localstorage.get("prefix") || $rootScope.prefix);
                var username = userControl.getFormalName()  || "IBMer",
                    userLocale = userControl.getUserLocale();

                var methods = {
                    "getWelcomeMsg": function () {
                        new Promise(function (resolve, reject) {
                            if (!loaded) {
                                try {
                                    var welcomeMsgObj = JSON.parse(localStorage.getItem("welcomeMsg"));
                                    if ((welcomeMsgObj.timestamp + (1000 * 60 * 60 * (2 * 24))) > new Date().getTime()) {
                                        return resolve(welcomeMsgObj.message);
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            }

                            var xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function() {
                                if (xhttp.readyState === 4) {
                                    if (xhttp.status === 200) {
                                        localStorage.setItem("welcomeMsg", JSON.stringify({
                                            "message": xhttp.responseText,
                                            "timestamp": new Date().getTime()
                                        }));
                                        resolve(xhttp.responseText);
                                    } else {
                                        reject(xhttp.responseText);
                                    }
                                }
                            };

                            xhttp.open("GET", ["/getWelcomeMsg/", username, "?language=", userLocale].join(""), true);
                            xhttp.send();

                        }).then(function successCB (data) {
                            loaded = true;
                            $rootScope.defaultMessages.welcome = data;
                        }, function errorCB (err) {
                            console.log(err);
                        });
                    },
                    "getMsgsRevision": function () {
                        var self = this;
                        new Promise(function getMsgsRev(resolve, reject) {

                            try {
                                var msgsObj = JSON.parse(localStorage.getItem("defaultMsg"));
                            } catch (e) {
                                console.log(e);
                                reject(e);
                            }

                            var xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function() {
                                if (xhttp.readyState === 4) {
                                    if (xhttp.status === 200) {

                                        if (msgsObj) {
                                            if (xhttp.responseText === msgsObj._rev) {
                                                console.log("using cached results");
                                                resolve(msgsObj.message);
                                            } else {
                                                reject("invalid rev");
                                            }
                                        } else {
                                            reject(xhttp.responseText);
                                        }
                                    }
                                }
                            };

                            xhttp.open("GET", ["/getDefaultMsgsRev", "?language=", userLocale].join(""), true);
                            xhttp.send();

                        }).then(function successCB (data) {
                            self.populateDefaultMsgs(data);
                        }, function errorCB (err) {
                            self.getDefaultMsgs();
                        });
                    },
                    "getDefaultMsgs": function () {
                        var self = this;
                        new Promise(function (resolve, reject) {

                            var xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function() {
                                if (xhttp.readyState === 4) {
                                    if (xhttp.status === 200) {
                                        var defaultMsgs = JSON.parse(xhttp.responseText);
                                        localStorage.setItem("defaultMsg", JSON.stringify({
                                            "message": defaultMsgs.messages,
                                            "_rev": defaultMsgs._rev
                                        }));
                                        resolve(defaultMsgs.messages);
                                    } else {
                                        reject(xhttp.responseText);
                                    }
                                }
                            };

                            xhttp.open("GET", ["/getDefaultMsgs", "?language=", userLocale].join(""), true);
                            xhttp.send();

                        }).then(function successCB (data) {
                            self.populateDefaultMsgs(data);
                        }, function errorCB (err) {
                            console.log(err);
                        });
                    },
                    "populateDefaultMsgs": function (msgs) {
                        for (var prop in msgs) {
                            if (msgs.hasOwnProperty(prop)) {
                                $rootScope.defaultMessages[prop] = msgs[prop];
                            }
                        }
                    },
                    "init": function () {
                        this.getWelcomeMsg();
                        this.getMsgsRevision();
                    }
                };

                methods.init();

            },
            setCountryTelephone: function (prefix) {
                switch (prefix) {
                    case "br":
                        userControl.setUserCountryPrediction("Brazil");
                        userControl.setCountryPhone("+55-11-2132-2500");
                        break;
                    case "co":
                        userControl.setUserCountryPrediction("Colombia");
                        userControl.setCountryPhone("+57-1-628-1911");
                        break;
                    case "ec":
                        userControl.setUserCountryPrediction("Ecuador");
                        userControl.setCountryPhone("+59-322-565100");
                        userControl.setCountryExtension("ext: 5134");
                        break;
                    case "mx":
                        userControl.setUserCountryPrediction("Mexico");
                        userControl.setCountryPhone("+52-55-5270-5959 / +52-33-3669-7000");
                        userControl.setCountryExtension("ext: 5555");
                        break;
                    case "py":
                        userControl.setUserCountryPrediction("Paraguay");
                        userControl.setCountryPhone("+55-11-2132-2500");
                        break;
                    case "pe":
                        userControl.setUserCountryPrediction("Peru");
                        userControl.setCountryPhone("+51-1-625-6911");
                        break;
                    case "ve":
                        userControl.setUserCountryPrediction("Venezuela");
                        userControl.setCountryPhone("+58-212-908-8911");
                        userControl.setCountryExtension("ext: 8911");
                        break;
                    case "ar":
                        userControl.setUserCountryPrediction("Argentina");
                        userControl.setCountryPhone("+54-11-5286-3000");
                        userControl.setCountryExtension("ext: 3000");
                        break;
                    default:
                        userControl.setUserCountryPrediction("Other");
                        userControl.setCountryPhone("+54-11-5286-3000");
                        userControl.setCountryExtension("ext: 3000");
                        break;
                }
            }
        };

    });

}());
