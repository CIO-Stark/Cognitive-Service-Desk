
(function () {
	"use strict";

	var isLoggedIn = function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			return res.status(401).send("Not authorized to use this resource");
		}
	};

	module.exports = function (app, passport) {
                require("../passport")(app, passport);

                app.get("/", function (req, res) {
                        res.redirect('/');
                });

                                
                app.get("/", function (req, res) {
                        return res.status(200).render("login", {
                                user: req.user || ""
                        });
                });

                app.post('/',
                        passport.authenticate('local', { failureRedirect: 'login'}),
                                function(req, res) {
                                        //res.redirect('home');
                                                return res.status(200).render("main", {user: req.user || ""});
                                }
                );

                app.get('/logout',
                        function (req, res) {
                                req.logout();
                                res.redirect('/');
                });

                
                
                app.get('/validateUser',
                        function (req, res) {
                                req.logout();
                                res.redirect('/');
                });



        };

        

}());