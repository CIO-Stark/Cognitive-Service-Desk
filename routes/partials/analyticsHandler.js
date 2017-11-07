/**
 * Created by leonim on 21/03/2017.
 */
// related to the new metrics board

(function () {
    "use strict";
    var methods = {
        "transformDate": function (start, end) {
            if(!start || !end){
                return false;
            }
            try {
                start = new Date([start, "00:00:00"].join(" ")).getTime();
                end = new Date([end, "23:59:59"].join(" ")).getTime();
                if(end < start){
                    return false;
                }
            } catch (err){
                return false;
            }

            return {
                "start": start,
                "end": end,
                "difference": end - start
            }
        }
    };

    module.exports = function (app, ConversationFeedbackDB, ConversationAccessHistoryDB, cloudant) {
        var ticket_userDB = cloudant.db.use('ticket_users');

        app.get("/analytics", function (req, res) {
            ticket_userDB.find({
                selector: {
                    "email": 'laciowa@br.ibm.com'
                }
            }, function (err, user) {
                if (err) {
                    console.error(new Error(err));
                    return res.redirect('/');
                }

                if (user.docs.length) {
                    return res.status(200).render("./analytics/analytics.view.html");
                } else {
                    return res.redirect('/');
                }
            });
        });

        app.post("/timeFilter", function(req, res){
            if(!req.body.startDate || !req.body.endDate){
                return res.status(500).send("shurmbles");
            }

            console.log(req.body);

            var converted = methods.transformDate(req.body.startDate, req.body.endDate);

            if (converted) {

                var queries = [
                    ConversationFeedbackDB.get({
                        "selector": {
                            "$and": [{
                                "timestamp": {
                                    "$gt": converted.start
                                }
                            }, {
                                "timestamp": {
                                    "$lt": converted.end
                                }
                            }]
                        },
                        "fields":
                            ["_id", "platform", "userID", "type", "timestamp", "locale", "entities", "intents", "confidence"],
                        "sort": [{
                            "timestamp": "asc"
                        }]
                    }),
                    ConversationAccessHistoryDB.get({
                        "selector": {
                            "$and": [{
                                "timestamp": {
                                    "$gt": converted.start
                                }
                            }, {
                                "timestamp": {
                                    "$lt": converted.end
                                }
                            }]
                        },
                        "fields":
                            ["_id", "country", "timestamp", "browserLanguage"],
                        "sort": [{
                            "timestamp": "asc"
                        }]
                    })
                ]

                Promise.all(queries).then(function(data){
                    var api_resp = {
                        "feedback":data[0].docs || [],
                        "accesses":data[1].docs || []
                    };
                    console.log(api_resp);
                    return res.status(200).send(api_resp);

                }).catch(function(err){
                    console.log(err);
                    return res.status(500).send(err);
                });


                // .then(function successCB(feedbackList) {
                //     return res.status(200).send(
                //         {
                //             "feedback":feedbackList.docs
                //         } || {} );
                // }, function errorCB(err) {
                //     console.log(err);
                //     return res.status(500).send(err);
                // })
            } else {
                return res.status(401).send("Error");
            }
        });

        app.post("/saveAccess", function (req, res) {

            if(!req.body.country || !req.body.browserLanguage){
                return res.status(500).send("Missing arguments.");
            }

            var now = new Date();

            ConversationAccessHistoryDB.create(
                {
                    "country": req.body.country,
                    "timestamp": now.getTime(),
                    "browserLanguage": req.body.browserLanguage
                }
            ).then(function success(data) {
                console.log(data)

                var apiRes = {
                    "accessDocumentId": data.id,
                    "success":data.ok
                }

                return res.status(200).send(apiRes);
            }).catch(function(err) {
                return res.status(500).send(err);
            });

        });

    };

    console.log(methods.transformDate("2017-03-23", "2017-03-08"));

}());