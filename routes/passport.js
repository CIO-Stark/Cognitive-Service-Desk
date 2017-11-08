
(function () {
    "use strict";

    var LocalStrategy = require("passport-local").Strategy;
    var BearerStrategy = require('passport-http-bearer').Strategy;
    var db = require('./partials/userHandler');

    //var cookieSession = require("cookie-session"),
        //cookieParser = require("cookie-parser");

    module.exports = function (app, passport) {
        // app.use(cookieSession({
        //     secret: "appSecretKey",
        //     maxAge: 86400000
        // }));
        //app.use(cookieParser());
        app.use(passport.initialize());
        app.use(passport.session());


        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });

        passport.use(new LocalStrategy(
          function(username, password, cb) {
                console.log("Authenticating user", username);
                db.findByUsername(username, function(err, user) {
                    if (err) { return cb(err); 
                    }
                    if (!user) { return cb(null, false); 
                    }
                    if (user.password != password) { return cb(null, false); 
                    }
                return cb(null, user);
                });
        }));
            /*function (username, password, done) {

                // this DEMO accepts the hardcoded credentials but you should implement your own user authorization
                // TODO
                if (username != "" && password == "123") {
                    return done(null, username);
                } else {
                    return done(null, false, {
                        "message": "Incorrect credentials"
                    });
                }
            }
        ));*/

        passport.use(new BearerStrategy(
            function (token, cb) {
                if(token == '123') return cb(null, 'admin');
                else return cb(null, false);
            /*db.users.findByToken(token, function (err, user) {
                    if (err) { return cb(err); }
                    if (!user) { return cb(null, false); }
                    return cb(null, user);
                });*/
            }));
    };
}());