/**
 * Created by danielabrao on 8/11/16.
 */
(function () {
    'use strict';

    module.exports = function (app, cloudant, fs, request) {
        var ticket_userDB = cloudant.db.use('ticket_users'),
            db = require('../../js/db.js'),
            feedbackDB = cloudant.db.use('feedbacks-sme-beta'),
            sme_configs = cloudant.db.use('sme_board_configs'),
            json2csv = require('json2csv');

        app.get('/getSecondaryActions', function (req, res) {

            if (!req.query.type) {
                return res.status(500).send('Bad request, type missing');
            }

            sme_configs.find({
                "selector": {
                    "type": req.query.type
                }
            }, function (err, options) {
                if (err) {
                    return res.status(500).send(err);
                }

                try {
                    return res.status(200).send(options.docs[0].options);
                } catch (e) {
                    return res.status(500).send(e);
                }
            });
        });

        //
        app.get('/sme', function (req, res) {
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
                    return res.status(200).render('./sme-board/sme-board.view.ejs', {
                        user: user.docs[0]
                    });
                } else {
                    return res.redirect('/');
                }
            });

        });

        app.get('/getFeedbacks', function (req, res) {
            var country = req.query.country === 'br' ? 1 : 2,
                query = ["SELECT ID, CLIENT_ID, CONVERSATION_ID as CONV_ID, USERID, PLATFORM, QUESTION, FEED1, CONF, CLUSTER1, FEED2, CLUSTER2, NEG_FDBK_COMMENT, TIMESTAMP",
                    " FROM ANALYTICS_FEEDBACK_BETA af ",
                    "WHERE af.ID NOT IN (SELECT ID FROM SME_ACTIONS_BETA) AND (TIMESTAMP BETWEEN '2017-01-01 00:00:00.000000' AND CURRENT_TIMESTAMP) AND LANGUAGE = " + country + " AND FEED1 = '" + req.query.type + "' ORDER BY TIMESTAMP ASC;"
                ].join('');
            db.smeQueries(query).then(function (newFeedbacks) {
                return res.status(200).send({
                    "feedbacks": newFeedbacks.rows,
                    "query": query
                });
            }, function (err) {
                return res.status(500).send(err);
            });
        });

        app.get('/getResolvedFeedbacks', function (req, res) {
            var country = req.query.country === 'br' ? 1 : 2,
                anotherQuery = [
                    "SELECT ",
                    "af.ID, af.CLIENT_ID, af.CONVERSATION_ID as CONV_ID, af.USERID, af.PLATFORM, af.QUESTION, af.FEED1, af.CONF, af.CLUSTER1, af.FEED2, af.CLUSTER2, af.NEG_FDBK_COMMENT, af.TIMESTAMP, ",
                    "sa.ACTION_DATE, sa.ACTION_TAKEN, sa.ACTION_TAKEN2, sa.COMMENTS ",
                    "FROM ANALYTICS_FEEDBACK_BETA af ",
                    "INNER JOIN SME_ACTIONS_BETA sa ON (sa.ID = af.ID) ",
                    "WHERE af.language = '", country, "' ",
                    "AND FEED1 = '", req.query.type, "' ",
                    "ORDER BY TIMESTAMP DESC;"].join('');

            db.smeQueries(anotherQuery).then(function (resolvedFeedbacks) {
                return res.status(200).send({
                    "feedbacks": resolvedFeedbacks.rows,
                    "query": anotherQuery
                });
            }, function (err) {
                return res.status(500).send(err);
            });
        });

        app.post('/takeAction', function (req, res) {

            if (!req.body.feedback) {
                return res.status(500).send('Can not continue without a feedback object');
            }

            var x  = "CURRENT_TIMESTAMP";
            var query = "INSERT INTO SME_ACTIONS_BETA (ID, ACTION_DATE, ACTION_TAKEN, ACTION_TAKEN2, COMMENTS, TEL_ACTION, MAIL_ACTION) VALUES ('" + req.body.feedback.ID + "', " + x + ", '" +  req.body.feedback.action + "', '" +  req.body.feedback.action2 + "', '" + req.body.feedback.comments +  "', '0', '0');";

            db.smeQueries(query).then(function (data) {
                return res.status(200).send(data.rows);
            }, function (err) {
                return res.status(500).send(err);
            });
        });

        app.get('/calendarTest', function (req, res) {

            if (!req.query.year || !req.query.quarter) {
                return res.status(400).send("Invalid operation - Unrecognized parameters");
            }

            var country = req.query.language === 'br' ? 1 : 2,
                query = [
                    "SELECT dd.year, dd.quarter, dd.month, dd.week, count(s.action_date) as RESOLVED_FEEDBACKS ",
                    "FROM DIMDATA dd ",
                    "LEFT OUTER JOIN (SELECT sab.action_date FROM SME_ACTIONS_BETA sab JOIN ANALYTICS_FEEDBACK_BETA afb ON sab.ID = afb.ID WHERE afb.language = '", country, "' AND FEED1 = '", (req.query.type || 0), "') s ",
                    "ON DATE(s.action_date) = dd.date ",
                    "WHERE dd.year = '", req.query.year, "'", " AND dd.quarter = '", req.query.quarter, "'",
                    "GROUP BY dd.year, dd.quarter, dd.month, dd.week ",
                    "ORDER BY 1, 2, 3, 4"
                ].join('');


            db.smeQueries(query).then(function (metrics) {
                var modelObject = [{
                    "month": metrics.rows[0].MONTH,
                    "dates": []
                }];

                for (var i = 0; i < metrics.rows.length; i += 1) {
                    var control = false;
                    for (var j = 0; j < modelObject.length; j += 1) {
                        if (metrics.rows[i].MONTH === modelObject[j].month) {
                            modelObject[j].dates.push({
                                "week": metrics.rows[i].WEEK,
                                "count": metrics.rows[i].RESOLVED_FEEDBACKS
                            });
                            control = true;
                        }
                    }

                    if (!control) {
                        modelObject.push({
                            "month": metrics.rows[i].MONTH,
                            "dates": [{
                                "week": metrics.rows[i].WEEK,
                                "count": metrics.rows[i].RESOLVED_FEEDBACKS
                            }]
                        });
                    }
                }

                for (var l = 0; l < modelObject.length - 1; l += 1) {
                    if (modelObject[l].dates[modelObject[l].dates.length - 1].week === modelObject[l + 1].dates[0].week) {
                        modelObject[l].dates[modelObject[l].dates.length - 1].count =
                            Number(modelObject[l].dates[modelObject[l].dates.length - 1].count) + Number(modelObject[l + 1].dates[0].count);

                        modelObject[l + 1].dates.splice(0, 1);
                    }
                }

                return res.status(200).send(modelObject);
            }, function (err) {
                return res.status(500).send(err);
            });

        });


        app.get('/downloadFile', function (req, res) {
            var filePath = ['reports/', req.query.name].join('');
            setTimeout(function () {
                fs.unlinkSync(filePath);
            }, 3000);
            res.setHeader('content-Type', 'text/csv');
            res.setHeader("Content-Disposition", ["attachment;filename=/", req.query.name].join(''));
            return res.download(filePath, req.query.name);
        });

        app.post('/saveBacklog', function (req, res) {
            db.smeQueries(req.body.querystring).then(function (data) {
                var fields = ["ID", "CLIENT_ID", "CONVERSATION_ID", "USERID", "PLATFORM", "QUESTION", "FEED1", "CONF",	"CLUSTER1",	"FEED2", "CLUSTER2", "NEG_FDBK_COMMENT", "TIMESTAMP"];

                var fileName = ['backlog', new Date().getTime().toString().slice(5, -2), '.csv'].join(''),
                    filePath = ['reports/', fileName].join('');

                console.log(data.rows);
                json2csv({ data: data.rows, fields: fields}, function (err, csv) {
                    fs.writeFile(filePath, csv, function(err) {
                        if (err) {
                            throw err;
                        }
                        return res.status(200).send(fileName);
                    });

                });
            }, function (err) {
                return res.status(500).send(err);
            });
        });

        app.post('/saveActionTaken', function (req, res) {

            db.smeQueries(req.body.querystring).then(function (data) {
                var fields = ["ID", "CLIENT_ID", "CONVERSATION_ID", "USERID", "PLATFORM", "QUESTION", "FEED1", "CONF",	"CLUSTER1",	"FEED2", "CLUSTER2", "NEG_FDBK_COMMENT", "TIMESTAMP", "ACTION_DATE", "ACTION_TAKEN", "ACTION_TAKEN2", "COMMENTS"];

                var fileName = ['resolved', new Date().getTime().toString().slice(5, -2), '.csv'].join(''),
                    filePath = ['reports/', fileName].join('');

                json2csv({ data: data.rows, fields: fields}, function (err, csv) {
                    fs.writeFile(filePath, csv, function(err) {
                        if (err) {
                            throw err;
                        }

                        return res.status(200).send(fileName);
                    });
                });
            }, function (err) {
                return res.status(500).send(err);
            });



        });

        app.post('/saveScorecard', function (req, res) {

            var fileName = ['scorecard', new Date().getTime().toString().slice(5, -2), '.csv'].join(''),
                filePath = ['reports/', fileName].join('');

            json2csv({data: req.body.x, flatten: true}, function (err, csv) {
                fs.writeFile(filePath, csv, function (err) {
                    if (err) {
                        throw err;
                    }
                    return res.status(200).send(fileName);
                });
            });
        });

        app.get('/getResultsOverall', function (req, res) {
            var query = [
                "SELECT",
                "sab.ID, dd.MONTH, dd.QUARTER, dd.WEEK",
                "FROM SME_ACTIONS_BETA sab",
                "INNER JOIN DIMDATA dd ON Date(sab.ACTION_DATE) = dd.DATE",
                "WHERE dd.YEAR = ", ["'", req.query.year, "'"].join(''),
                req.query.quarter ? ["AND dd.QUARTER = '", req.query.quarter, "'"].join('') : '',
                ";"].join(' ');

            db.smeQueries(query).then(function (metrics) {
                return res.status(200).send(metrics.rows);
            }, function (err) {
                return res.status(500).send(err);
            });
        });

        app.post('/getDialogCount', function (req, res) {

            function buildTimeString (dateString, year) {
                var split = dateString.split(' ');
                return {
                    split: split,
                    initDate: [year, '-', split[0].replace(/\//g, '-')].join(''),
                    endDate: [year, '-', split[2].replace(/\//g, '-')].join('')
                };
            }

            var weeksProcessed = 0,
                shouldProcess = 0,
                dialog_id;

            if (req.body.language === 'br') {
                dialog_id = '8d6e2f4b-7b5c-4f5c-a693-89882c61357a';
            } else {
                dialog_id = '4d8156b9-e610-4595-b7bf-5159e9c0c570';
            }

            if (!req.body.dates) {
                return res.status(500).send('invalid parameters');
            }
            feedbackDB.find({
                "selector": {
                    "year": req.body.dates.year,
                    "quarter": req.body.dates.quarter,
                    "language": req.body.language
                }
            }, function (err, feedbacks) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (!feedbacks.docs.length) {
                    console.log('caching');
                    for (var i = 0; i < req.body.dates.months.length; i += 1) {
                        shouldProcess += req.body.dates.months[i].dates.length;
                        for (var j = 0; j < req.body.dates.months[i].dates.length; j += 1) {

                            var limits = buildTimeString(req.body.dates.months[i].dates[j].week, req.body.dates.year);

                            (function (init, end, split, indexMonth, indexWeek) {
                                request.get({
                                    url: ["https://gateway.watsonplatform.net/dialog/api/v1/dialogs/", dialog_id, "/conversation?date_from=", init, "&date_to=", end].join(''),
                                    headers: {
                                        'Accept': 'application/json',
                                        'Authorization': 'Basic ' + new Buffer('174356bf-c904-4401-889f-4a12e9be0247:hLvz7EO70HEA').toString('base64'),
                                        'Content-Type': "text/json; charset=utf-8'"
                                    }
                                }, function (error, response, body) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        var conversations = JSON.parse(body).conversations || [],
                                            count = 0;

                                        for (var l = 0; l < conversations.length; l += 1) {
                                            if (conversations[l].messages.length > 1) {
                                                count += 1;
                                            }
                                        }

                                        req.body.dates.months[indexMonth].dates[indexWeek][split.join(' ')].dialogConversationCount = conversations.length;
                                        req.body.dates.months[indexMonth].dates[indexWeek][split.join(' ')].mappedDialogCount = count;
                                        weeksProcessed += 1;

                                        if (weeksProcessed === shouldProcess) {
                                            req.body.dates.language = req.body.language;
                                            feedbackDB.insert(req.body.dates, function (err) {
                                                if (err) {
                                                    return res.status(500).send(err);
                                                } else {
                                                    return res.status(200).send(req.body.dates);
                                                }
                                            })
                                        }
                                    }
                                });
                            }(limits.initDate, limits.endDate, limits.split, i, j));
                        }
                    }

                } else {
                    console.log('cached');
                    var query = [
                        "SELECT",
                        "dd.WEEK, dd.QUARTER",
                        "FROM DIMDATA dd",
                        "WHERE dd.DATE = CURRENT_DATE",
                        ";"].join(' ');

                    db.smeQueries(query).then(function (data) {
                        if (req.body.dates.quarter != data.rows[0].QUARTER) {
                            return res.status(200).send(feedbacks.docs[0]);
                        }

                        for (var i = 0; i < feedbacks.docs[0].months.length; i += 1) {
                            for (var j = 0; j < feedbacks.docs[0].months[i].dates.length; j += 1) {
                                if (feedbacks.docs[0].months[i].dates[j].week == data.rows[0].WEEK) {
                                    (function (monthIndex, weekIndex) {
                                        var limits = buildTimeString(data.rows[0].WEEK, req.body.dates.year);
                                        request.get({
                                            url: ["https://gateway.watsonplatform.net/dialog/api/v1/dialogs/", dialog_id, "/conversation?date_from=", limits.initDate, "&date_to=", limits.endDate].join(''),
                                            headers: {
                                                'Accept': 'application/json',
                                                'Authorization': 'Basic ' + new Buffer('174356bf-c904-4401-889f-4a12e9be0247:hLvz7EO70HEA').toString('base64'),
                                                'Content-Type': "text/json; charset=utf-8'"
                                            }
                                        }, function (error, response, body) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                var conversations = JSON.parse(body).conversations || [],
                                                    count = 0;

                                                for (var l = 0; l < conversations.length; l += 1) {
                                                    if (conversations[l].messages.length > 1) {
                                                        count += 1;
                                                    }
                                                }

                                                feedbacks.docs[0].months[monthIndex].dates[weekIndex][data.rows[0].WEEK].dialogConversationCount = conversations.length;
                                                feedbacks.docs[0].months[monthIndex].dates[weekIndex][data.rows[0].WEEK].mappedDialogCount = count;

                                                feedbackDB.insert(feedbacks.docs[0], function (err) {
                                                    if (err) {
                                                        return res.status(500).send(err);
                                                    } else {
                                                        return res.status(200).send(feedbacks.docs[0]);
                                                    }
                                                });
                                            }
                                        });
                                    }(i, j));
                                }
                            }
                        }

                    }, function (err) {
                        return res.status(500).send(err);
                    });
                }
            });
        });

        app.post('/takeDialogAction', function (req, res) {
            feedbackDB.find({
                "selector": {
                    "year": req.body.feedback.year,
                    "quarter": req.body.feedback.quarter,
                    "language": req.body.language
                }
            }, function (err, feedbacks) {

                if (err) {
                    return res.status(500).send(err);
                }
                for (var i = 0; i < feedbacks.docs[0].months.length; i += 1) {
                    for (var j = 0; j < feedbacks.docs[0].months[i].dates.length; j += 1) {
                        if (feedbacks.docs[0].months[i].dates[j].week == req.body.feedback.week) {
                            (function (monthIndex, weekIndex) {
                                var count = 0;

                                feedbacks.docs[0].months[monthIndex].dates[weekIndex][req.body.feedback.week].resolvedCount = req.body.feedback.resolvedCount;


                                for (var i = 0; i < feedbacks.docs[0].months[monthIndex].dates.length; i += 1) {
                                    count += (Number(feedbacks.docs[0].months[monthIndex].dates[i][feedbacks.docs[0].months[monthIndex].dates[i].week].resolvedCount) || 0);
                                }

                                feedbackDB.insert(feedbacks.docs[0], function (err) {
                                    if (err) {
                                        return res.status(500).send(err);
                                    } else {
                                        return res.status(200).send({
                                            "resolvedCount": count
                                        });
                                    }
                                });
                            }(i, j));
                        }
                    }
                }

            });
        });

    };

}());
