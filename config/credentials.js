var extend = require('util')._extend;
var bluemix = require('./bluemix.js');

exports.relational_datase = {};

exports.nosql_database = {}

exports.sendgrid = {
  username: '',
  password: ''
}

exports.dialog =  {
  login: {
    url: 'https://gateway.watsonplatform.net/dialog/api',
    username: '',
    password: '',
    version: 'v1'
  },
  id: {
    es: '',
    pt: ''
  }
}

exports.nlc = {}

exports.answers_database = {
  name: "compose",
  hostname: "",
  port: 24531,
  username: "admin",
  password: "",
  id: {
    pt: "316", // Classifier Id in the Q&A Manager
    es: "319" // Classifier Id in the Q&A Manager
  }
}
