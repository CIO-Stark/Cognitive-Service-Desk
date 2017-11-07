/**
 * Created by danielabrao on 2/28/17.
 */
(function () {
    "use strict";

    var watsonConversation = require("watson-developer-cloud/conversation/v1"),
        conversationCredentials = require("./ConversationCredentials");

    module.exports = function () {
        if (!conversationCredentials) {
            throw new Error("Can not proceed without service credentials object");
        } else {
            var conversationInstance = new watsonConversation(conversationCredentials.creds);
        }

        return {
            "sendMessage": function (options) {
                return new Promise(function (resolve, reject) {
                    if (!options) {
                        return reject("Can not proceed without options object");
                    }

                    if (options.language === "es") {
                        options.workspace_id = conversationCredentials.es.workspace_id;
                    } else {
                        options.workspace_id = conversationCredentials.pt.workspace_id;
                    }

                    console.log(options);

                    conversationInstance.message(options, function (err, response) {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        } else {
                            return resolve(response);
                        }
                    });
                });
            }
        }
    };

}());