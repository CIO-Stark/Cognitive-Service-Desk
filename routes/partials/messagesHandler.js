/**
 * Created by danielabrao on 12/14/16.
 */
(function () {
    "use strict";

    module.exports = function (app, cloudant) {

        var messagesDB = cloudant.db.use("default_messages_beta");

        app.get("/getDefaultMsgs", function (req, res) {
            messagesDB.find({
                "selector": {
                    "language": req.query.language || "es"
                }
            }, function (err, msgs) {
                if (!err) {
                    return res.status(200).json(msgs.docs[0]);
                }
            });
        });

        app.get("/getDefaultMsgsRev", function (req, res) {
            messagesDB.find({
                "selector": {
                    "language": req.query.language || "es"
                },
                "fields": [
                    "_rev"
                ]
            }, function (err, revDoc) {
                if (!err) {
                    console.log(revDoc);
                    return res.status(200).send(revDoc.docs[0]["_rev"]);
                }
            });
        });

        app.get("/getWelcomeMsg/:username", function (req, res) {
            if (req.query.language === "pt") {
                return res.status(200).send(["Olá ", req.params.username, "! Eu sou o Watson, seu suporte 24x7 de IT."].join(""));
            } else {
                return res.status(200).send(["Hola, ", req.params.username, ". Soy Watson, tu soporte 7x24 de IT."].join(""));
            }
        });
    };

}());