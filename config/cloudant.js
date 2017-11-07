/**
 * Created by danielabrao on 3/7/17.
 */
(function () {
    "use strict";
    var Cloudant = require("cloudant"),
        credentials = {
            "username": JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0].credentials.username,
            "password": JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0].credentials.password,
            "endpoint": JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0].credentials.host,
            "url":      JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0].credentials.url
        };


    module.exports = {
        "init": new Cloudant({
            "account": credentials.username,
            "password": credentials.password
        }, function (err) {
            if (err) {
                console.log("error connecting to DB " + err);
            } else {
                console.log("connection success");
            }
        }),
        exportedCredentials: new Buffer([credentials.username, credentials.password].join(":")).toString("base64"),
        credentials: credentials
    };
}());