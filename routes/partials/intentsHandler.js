/**
 * 
 */
(function () {
    "use strict";

    module.exports = function (app) {
        var elements = require("../../js/elements")();


        /**
         * returns template with helpers for each intention
         * ** it could return from db
         */
        app.get("/intentsHelpContent/:intent", function (req, res) {
            return res.status(200).send(elements.get(req.params.intent));

        });


    };

}());