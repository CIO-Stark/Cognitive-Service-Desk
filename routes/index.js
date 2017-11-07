/**
 * Created by danielabrao on 7/13/16.
 */
(function () {
    "use strict";

    var ticketRoutes = require("./partials/ticketHandler"),
        socketRoutes = require("./partials/socketHandler"),
        smeRoutes = require("./partials/smeHandler"),
        adminRoutes = require("./partials/adminHandler"),
        conversationRoutes = require("./partials/conversationHandler"),
        feedbackRoutes = require("./partials/feedbackHandler"),
        messageRoutes = require("./partials/messagesHandler"),
        genesysRoutes = require("./partials/genesysHandler"),
        analyticsRoutes = require("./partials/analyticsHandler");

    module.exports = function (app, cloudant, ConversationFeedbackDB, ConversationAccessHistoryDB, request, io, ensureAuthenticated, services, /*ibmdb,*/ fs, logger, mailer, watsonConversation) {
        ticketRoutes(app, cloudant, request, ensureAuthenticated, services, fs);
        socketRoutes(app, io, watsonConversation);
        smeRoutes(app, cloudant, fs, request);
        adminRoutes(app, cloudant, logger, mailer);
        messageRoutes(app, cloudant);
        conversationRoutes(app, watsonConversation);
        feedbackRoutes(app, ConversationFeedbackDB);
        genesysRoutes(app,io,cloudant, request);
        analyticsRoutes(app, ConversationFeedbackDB, ConversationAccessHistoryDB, cloudant);
    };

}());
