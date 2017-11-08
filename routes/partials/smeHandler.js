/**
 * Created by danielabrao on 8/11/16.
 */
(function () {
    'use strict';

    module.exports = function (app, cloudant, passport) {
        
        app.get('/sme', function (req, res) {
            return res.status(200).render('./views/login.html', {});

        });

        app.post('/smelogin', 
        passport.authenticate('local', { failureRedirect: '/login' }),
            function(req, res) {
                res.redirect('/dashboard');
		});
        
        app.get('/logout',
        		  function(req, res){
        		    req.logout();
        		    res.redirect('/login');
        		  });
        
        
        app.get("/dashboard", 
        		require('connect-ensure-login').ensureLoggedIn(),
        		  function(req, res) {
        			return res.status(200).render("metricsDashboard.html");
        });


               

    };

}());
