/**
 * Created by danielabrao on 3/8/17.
 */
(function () {
    "use strict";

    module.exports = function (app, ConversationFeedbackDB) {

        app.post("/sendFeedback", function (req, res) {
            var feedback;
            try {
                feedback = JSON.parse(req.body.feedback);
            } catch (e) {
                feedback = req.body.feedback;
            }

            ConversationFeedbackDB.create(feedback).then(function successCB(data) {
                return res.status(201).send(data);
            }, function errorCB(err) {
                return res.status(500).send(err);
            });
        });

        app.get("/listFeedback", function (req, res) {
            ConversationFeedbackDB.getAll({
                "include_docs": true
            }).then(function successCB(feedbackList) {
                return res.status(200).send(feedbackList.rows || []);
            }, function errorCB(err) {
                return res.status(500).send(err);
            });
            });

        app.post("/queryFeedback", function (req, res) {
            ConversationFeedbackDB.get({
                "selector":  req.body.filters || {}
            }).then(function successCB(feedbackList) {
                return res.status(200).send(feedbackList.docs || []);
            }, function errorCB(err) {
                return res.status(500).send(err);
            });
        });

    };

}());