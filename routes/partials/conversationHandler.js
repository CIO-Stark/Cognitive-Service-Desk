/**
 * Created by danielabrao on 2/28/17.
 */
(function () {
    "use strict";

    module.exports = function (app, watsonConversation) {

        app.post("/askWatson", function (req, res) {
            var context;
            if (!req.query.question && !req.body.question) {
                return res.status(403).send("Can not proceed without question property");
            }

            if (req.body.context) {
                try {
                    context = JSON.parse(req.body.context);
                } catch (e) {
                    context = req.body.context;
                }
            } else {
                context = {};
            }

            watsonConversation.sendMessage({
                "input": {
                    "text": req.body.question
                },
                "context": context,
                "language": req.body.language || "pt"
            }).then(function (data) {
                return res.status(200).send(data);
            }, function (err) {
                console.log(err);
                return res.status(500).send(err);
            });
        });

    };

}());