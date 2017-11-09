/**
 * Created by danielabrao on 7/13/16.
 */
(function () {
    "use strict";

    var //icketRoutes = require("./partials/ticketHandler"),
        //socketRoutes = require("./partials/socketHandler"),
        smeRoutes = require("./partials/smeHandler"),
        adminRoutes = require("./partials/adminHandler"),
        conversationRoutes = require("./partials/conversationHandler"),
        feedbackRoutes = require("./partials/feedbackHandler"),
        messageRoutes = require("./partials/messagesHandler"),
        loginRoutes = require('./partials/Handler'),
        genesysRoutes = require("./partials/genesysHandler"),
        analyticsRoutes = require("./partials/analyticsHandler"),
        intentsRoutes = require("./partials/intentsHandler");

    module.exports = function (app, cloudant, ConversationFeedbackDB, ConversationAccessHistoryDB, request, io, services, /*ibmdb,*/ fs, logger, mailer, watsonConversation, passport) {
        //ticketRoutes(app, cloudant, request, ensureAuthenticated, services, fs);
        //socketRoutes(app, io, watsonConversation);
        smeRoutes(app, ConversationFeedbackDB, passport);
        adminRoutes(app, cloudant, logger, mailer);
        messageRoutes(app, cloudant);
        conversationRoutes(app, watsonConversation);
        feedbackRoutes(app, ConversationFeedbackDB);
        loginRoutes(app, passport);
        genesysRoutes(app,io,cloudant, request);
        analyticsRoutes(app, ConversationFeedbackDB, ConversationAccessHistoryDB, cloudant);
        intentsRoutes(app);
        
    };

}());
