/**
 * Created by danielabrao on 10/4/16.
 */
(function () {
    "use strict";

    module.exports = function (app, cloudant, logger, mailer) {

        var ticket_userDB = cloudant.db.use("ticket_users"),
            logDB = cloudant.db.use("admin_logs"),
            db = require("../../js/db.js"),
            logArr = [];


        app.get("/admin", function (req, res) {
            return res.status(200).render("./views/metricsDashboard.html", {});
                        
        });

        app.get("/testMail", function (req, res) {
            mailer.engagementMail({
                "rowID": [1, 2],
                "user": "test@br.ibm.com",
                "questionArr": ["question1", "question2"],
                "language": 1
            }).then(function () {
                console.log("send");
                return res.status(200).send("oi");
            });
        });

        /*app.get("/admin", function (req, res) {
            ticket_userDB.find({
                selector: {
                    "email": "laciowa@br.ibm.com"
                }
            }, function (err, user) {
                if (err) {
                    console.error(new Error(err));
                    return res.redirect("/");
                }

                if (user.docs.length) {
                    return res.status(200).render("./admin-board/admin-board.view.ejs", {
                        user: user.docs[0]
                    });
                } else {
                    return res.redirect("/");
                }
            });
        });*/

        function test(user, language) {
            var index = 0,
                length = user.rowID.length;
            return new Promise(function (resolve, reject) {

                if (!user) {
                    return;
                }

                mailer.engagementMail({
                    "rowID": user.rowID,
                    "user": user.USERID,
                    "questionArr": user.QUESTION,
                    "language": language
                }).then(function () {
                    logArr.push({
                        "rowID": user.rowID,
                        "user": user.USERID,
                        "questionArr": user.QUESTION
                    });

                    (function processRow () {
                        var query = ["UPDATE SME_ACTIONS_BETA sab SET sab.MAIL_ACTION = '1' WHERE sab.ID = ", user.rowID[index]].join("");
                        length -= 1;
                        index += 1;
                        db.adminQueries(query).then(function () {
                            console.log("row updated");
                        }, function (err) {
                            reject(err);
                        });

                        if (!length) {
                            resolve(user);
                        } else {
                            processRow();
                        }
                    }());

                 }, function (err) {
                    console.log(err);
                });

            });
        }

        app.post("/sendMail", function (req, res) {
            var listLength = req.body.feedbacks.length,
                counter = 0,
                i;

            logArr = [];

            (function processUser() {
                test(req.body.feedbacks[counter], req.body.language).then(function (data) {
                    counter += 1;
                    listLength -= 1;
                    if (!listLength) {
                        logger({
                            "logArr": logArr,
                            "db": logDB,
                            "action": "email"
                        }).then(function () {
                            return res.status(200).send(logArr);
                        });
                    } else {
                        processUser();
                    }
                }, function (err) {
                    console.log(err);
                });
            }());
        });

        app.post("/logTelAction", function (req, res) {

            console.log(req.body);
            var counter = 0;
            for (var i = 0; i < req.body.feedback.rowID.length; i += 1) {
                counter += 1;
                (function (index, counter) {
                    var query = ["UPDATE SME_ACTIONS_BETA sab SET sab.TEL_ACTION = '1' WHERE sab.ID = ", req.body.feedback.rowID[index]].join("");
                    db.adminQueries(query).then(function () {

                        var secondQuery = ["INSERT INTO FEEDBACK_TEL_TRACK (FK_ID, TS, COMMENTS) VALUES (", req.body.feedback.rowID[index], ", CURRENT TIMESTAMP, ", "'", req.body.feedback.comment, "'", ")"].join("");
                        db.adminQueries(secondQuery).then(function successCB () {
                            if (counter === req.body.feedback.rowID.length) {
                                console.log("enddd");
                                return res.status(200).send(req.body);
                            }
                        }, function errorCB (error) {
                            console.log(error);
                        });
                    });
                }(i, counter));
            }
        });

        app.get("/getTelLog", function (req, res) {
            var query = [
                "SELECT",
                " sa.ID, ftt.comments, ftt.TS, af.USERID, ",
                " sa.ACTION_TAKEN, sa.ACTION_TAKEN2, sa.COMMENTS",
                " FROM ANALYTICS_FEEDBACK_BETA af",
                " INNER JOIN SME_ACTIONS_BETA sa ON (sa.ID = af.ID)",
                " JOIN FEEDBACK_TEL_TRACK ftt ON (FK_ID = sa.ID)",
                " WHERE af.language = '", req.query.language, "'",
                " AND FEED1 = '0'",
                " AND sa.TEL_ACTION = '1'",
                " ORDER BY af.USERID ASC;"].join("");

            db.adminQueries(query).then(function (data) {
                return res.status(200).send(data.rows);
            }, function (error) {
                console.log(error);
            });
        });

        app.get("/getNegativeActions", function (req, res) {
            var andClause,
                query;

            if (req.query.confidence === "lowNegative") {
                andClause = " AND (sa.ACTION_TAKEN <> 'false_negative' AND sa.ACTION_TAKEN2 <> 'Out of Scope' AND sa.MAIL_ACTION = '0')";
            } else {
                andClause = " AND sa.TEL_ACTION = 0";
            }

            query = [
                "SELECT ",
                "sa.ID, af.CLIENT_ID, af.USERID, af.PLATFORM, af.QUESTION, af.FEED1, af.CONF, af.LANGUAGE, af.NEG_FDBK_COMMENT, ",
                "sa.ACTION_TAKEN, sa.ACTION_TAKEN2, sa.COMMENTS ",
                "FROM ANALYTICS_FEEDBACK_BETA af ",
                "INNER JOIN SME_ACTIONS_BETA sa ON (sa.ID = af.ID) ",
                "WHERE af.language = '", req.query.country, "' ",
                " AND FEED1 = '0'",
                andClause,
                " ORDER BY af.USERID ASC;"].join("");

            console.log(query);

            db.smeQueries(query).then(function (data) {
                return res.status(200).send({
                    "feedbacks": data.rows,
                    "query": query
                });
            }, function (err) {
                return res.status(500).send(err);
            });
        });

        app.get("/retrieveAdminLogs", function (req, res) {
            logDB.find({
                "selector": {
                    "action": req.query.language
                }
            }, function (err, logs) {
                if (!err) {
                    return res.status(200).send(logs);
                }
            });
        });

    };

}());