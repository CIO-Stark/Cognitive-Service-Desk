/*eslint-env node*/
var nr = require('newrelic');
var express = require('express');
var morgan = require('morgan');
var fs = require("fs");


//credentials
var credentials = require('./config/credentials.js');

//sendgrid credentials
var sendgrid = require("sendgrid")(credentials.sendgrid.username, credentials.sendgrid.password);
var email = new sendgrid.Email();

var watson = require('watson-developer-cloud');
var bluemix = require('./config/bluemix');
var extend   = require('util')._extend;

var route_cloudant = require('./routes/favorities/cloudant.js');
var route_analytics = require('./routes/analytics/analytics.js');
var route_feedback = require('./routes/feedback/feedback.js');
//var route_conversation = require('./routes/conversation/conversation.js');
var route_profile = require('./routes/profile/profile.js');
var route_security = require('./routes/security/token.js');

//var ibmdb = require('ibm_db');
var changeCase = require('change-case');
var math = require('mathjs');
var trim = require('trim');
var S = require('string');
var util = require('util');
var engines = require('consolidate');
var md5 = require('md5');
var request = require('request');
var cloudant = require('cloudant');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var swagger = require("swagger-node-express").createNew(subpath);

var app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    logger = require("./js/logger"),
    mailer = require("./js/mailer")(sendgrid),
    watsonConversation = require("./routes/conversation/ConversationFactory")();

var bodyParser = require('body-parser');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var authentication = require('./js/Authentication.js');

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded(
    {
        extended: true,
        parameterLimit: 1000000,
        limit: "10mb"
    })
);

var subpath = express();
swagger.setAppHandler(subpath);

swagger.setApiInfo({
    title: "Watson IT Help Beta",
    description: "API documentation for this application",
    termsOfServiceUrl: "",
    contact: "laciowa@br.ibm.com",
    license: "",
    licenseUrl: ""
});

// all environments
app.engine("html", engines.ejs);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');
app.use(express.static(__dirname + '/public'));
app.use("/api-docs",express.static(__dirname + '/public/swagger'));
app.use(morgan('dev'));

app.use(cookieParser());
app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var cloudantInstance = require("./config/cloudant").init,
    ConversationFeedbackDB = require("./js/Cloudant")(cloudantInstance, "conversation_feedback"),
    ConversationAccessHistoryDB = require("./js/Cloudant")(cloudantInstance, "ithelp_access");



var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
if (services.SingleSignOn) {
  var ssoConfig = services.SingleSignOn[0];
  var client_id = ssoConfig.credentials.clientId;
  var client_secret = ssoConfig.credentials.secret;
  var authorization_url = ssoConfig.credentials.authorizationEndpointUrl;
  var token_url = ssoConfig.credentials.tokenEndpointUrl;
  var issuer_id = ssoConfig.credentials.issuerIdentifier;
  var callback_url = "https://watsonithelpbeta.mybluemix.net/auth/sso/callback";

  var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
  var Strategy = new OpenIDConnectStrategy({
        authorizationURL : authorization_url,
        tokenURL : token_url,
        clientID : client_id,
        scope: 'openid',
        response_type: 'code',
        clientSecret : client_secret,
        callbackURL : callback_url,
        skipUserProfile: true,
        issuer: issuer_id},
      function(iss, sub, profile, accessToken, refreshToken, params, done)  {
        process.nextTick(function() {
          profile.accessToken = accessToken;
          profile.refreshToken = refreshToken;
          done(null, profile);
        })
      });

  passport.use(Strategy);
  app.get('/login', passport.authenticate('openidconnect', {}));

  function ensureAuthenticated(req, res, next) {
    if(!req.isAuthenticated()) {
      req.session.originalUrl = req.originalUrl;
      res.redirect('/login');
    } else {
      return next();
    }
  }


  app.get('/', ensureAuthenticated, function(req, res) {
    var token_md5 = (md5('watson.T0pS3cRetP4ssw0rdOff4llT1mZ.cio'+new Date().toISOString().substring(0, 10)));
    var json_response = JSON.stringify(req.user['_json']);
    var username = JSON.parse(json_response).emailAddress;
    res.render('main',{email: username, token: token_md5});
  });

  app.get('/logout', function(req, res, next){
    res.clearCookie('connect.sid');
    req.session.destroy();
    req.logout();
    res.redirect('https://w3id.sso.ibm.com/auth/sps/samlidp/saml20/sloinitial?RequestBinding=HTTPRedirect&PartnerId=https://stark-dev-conversation-help.mybluemix.net&NameIdFormat=email');
  });


  app.get('/auth/sso/callback',function(req,res,next) {
    var redirect_url = req.session.originalUrl;
    passport.authenticate('openidconnect', {
      successRedirect: redirect_url,
      failureRedirect: '/failure'
    })(req,res,next);
  });


  app.get('/failure', function(req, res) {
    res.send('login failed');
  });

} else {
  app.get('/', function(req, res) {
    var token_md5 = (md5('watson.T0pS3cRetP4ssw0rdOff4llT1mZ.cio'+new Date().toISOString().substring(0, 10)));
    var username = 'laciowa@br.ibm.com';
    res.render('main',{email: username, token: token_md5});
  });
}

// SWAGGER
swagger.configureSwaggerPaths('', 'api-docs', '');

var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
else
    console.log('No --domain=xxx specified, taking default hostname "localhost".');

var applicationUrl = 'http://' + domain;
swagger.configure('http://stark-dev-conversation-help.mybluemix.net/', '1.0.0');

app.get('/api-docs', authentication.BasicAuthentication, function (req, res) {
    res.sendFile(__dirname + '/public/swagger/index.html');
});

// CORS
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key');

  if (req.method == 'OPTIONS') res.status(200).end();
  else next();
});

require('./routes/index.js')(app, cloudantInstance, ConversationFeedbackDB,ConversationAccessHistoryDB, request, io, ensureAuthenticated, services, /*ibmdb,*/ fs, logger, mailer, watsonConversation);

//Routes Definition
app.post('/analytics/rating', route_analytics.rating(changeCase,request));
app.post('/analytics/mobile', route_analytics.mobile(changeCase,request));
app.post('/analytics/feedback', route_analytics.feedback(changeCase,request));
app.post('/feedback/email', route_feedback.email(sendgrid,fs));
app.post('/favorites/search', route_cloudant.search());
app.post('/favorites/add', route_cloudant.add());
app.post('/favorites/remove', route_cloudant.delete());
app.post('/favorites/bulk', route_cloudant.bulk());
//app.post('/conversation/pt', route_conversation.pt());
//app.post('/conversation/es', route_conversation.es());
app.post('/profile/set', route_profile.set());
app.post('/security/token', route_security.token(md5));

// Bluemix error Handling
require('./config/error-handler')(app);

var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

server.listen(port, function () {
    console.log('Server running on port: %d', port);
});
