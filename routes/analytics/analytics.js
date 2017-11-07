
(function () {
    "use strict";
    var db = require('../../js/db.js'),
        credentials = require('../../config/credentials.js'),
        cloudantConfig = require('../../config/cloudant.js'),
        sendgrid = require("sendgrid")(credentials.sendgrid.username, credentials.sendgrid.password),
        email = new sendgrid.Email(),
        request = require('request'),
        countryCodes = require('../../config/country-codes'),
        Cloudant = require('cloudant'),
        cloudant = Cloudant({
            account: cloudantConfig.credentials.username,
            password: cloudantConfig.credentials.password
        });

    exports.feedback = function () {
        return function(req, res) {
            var params = {
                    lan: req.body.lan,
                    question: req.body.question,
                    feed1: req.body.feed1,
                    feed2: req.body.feed2,
                    cluster1: req.body.cluster1,
                    cluster2: req.body.cluster2,
                    client_id: req.body.client_id  || '-1',
                    conversation_id: req.body.conversation_id || '-1',
                    userid: req.body.userid || 'N/A',
                    platform: req.body.platform || 'N/A',
                    neg_fdbk_comment: req.body.neg_fdbk_comment || 'N/A',
                    conf : req.body.confidence
                },
                regexp = /tel_/,
                ticketTs =  [params.conversation_id, new Date().getTime().toString().slice(-5)].join(''),
                ticketCountry = countryCodes(req.body.employeeCountry.toUpperCase());


            if ((regexp.test(params.cluster1) && params.neg_fdbk_comment !== 'N/A')) {

                var ticketDB = cloudant.db.use('ticket_base'),
                    mailOptions = {};

                ticketDB.insert({
                    "ticketNo": ticketTs,
                    "ticketReason": params.neg_fdbk_comment,
                    "ticketTopic": "Telephony",
                    "timestamp": req.body.ticketDate,
                    "requester": params.userid,
                    "userQuestion": params.question,
                    "ticketLanguage": params.lan === 1 ? 'pt' : 'es',
                    "employeeCountry": ticketCountry,
                    "conversation": req.body.conversation,
                    "status": "new"
                }, function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Error');
                    }

                    if (params.lan === 1) {
                        mailOptions.subject = ['Número de ticket', ticketTs, 'Watson precisa de ajuda! Usuario com um problema'].join(' ');
                        mailOptions.destinatary = 'helpdesk@br.ibm.com';
                        mailOptions.empName = 'Nome do funcionário';
                        mailOptions.empId = 'ID do funcionário';
                        mailOptions.empCountry = 'País do funcionário';
                        mailOptions.ticketDate = 'Data do contato com Watson';
                        mailOptions.description = 'Descrição do Problema';
                        mailOptions.cc = 'helpdesk@br.ibm.com';

                    } else {
                        mailOptions.subject = ['Número de ticket', ticketTs, 'Watson necesita tu ayuda! Usuario con un problema'].join(' ');
                        mailOptions.destinatary = 'helpdesk@ar.ibm.com';
                        mailOptions.empName = 'Nombre del Empleado';
                        mailOptions.empId = 'Numero de Empleado';
                        mailOptions.empCountry = 'Pais del empleado';
                        mailOptions.ticketDate = 'Fecha del contacto con Watson';
                        mailOptions.description = 'Descripción del problema';
                        mailOptions.cc = 'watsonithelp@ar.ibm.com';
                    }

                    db.feedback(params).then(function InsertFeedback(result) {
                        var url = ['https://w3.api.ibm.com/common/run/bluepages/userid/', params.userid, '/notesEmail?client_id=1a344af5-993a-4e6a-a1f9-71470b26e731'].join('');

                        request.get(url, function (error, response, body) {
                            var notesId = '';
                            if (error) {
                                console.log(error);
                                notesId = 'Error retrieving notes ID';
                            }

                            try {
                                var parsedBody = JSON.parse(body);

                                if (parsedBody.search.entry.length) {
                                    notesId = parsedBody.search.entry[0].attribute[0].value[0];
                                }

                            } catch (e) {
                                console.log(e);
                                notesId = 'Error retrieving notes ID';
                            }

                            sendgrid.send({
                                to: mailOptions.destinatary,
                                cc: ['watsonithelp@ar.ibm.com', params.userid],
                                from: 'CIOLA@Watson.com',
                                fromName: 'LA CIO Watson',
                                subject: ['Ticket number', ticketTs,  'Watson needs your help! Employee with an issue'].join(' '),
                                html: [
                                    '<h1>Ticket #', ticketTs, '</h1>',
                                    '<h3>', mailOptions.empId, ': ', params.userid, '</h3>',
                                    '<h3>', mailOptions.empCountry, ': ', ticketCountry, '</h3>',
                                    '<h3>', mailOptions.ticketDate, ': ', req.body.ticketDate, '</h3>',
                                    '<h3>', mailOptions.description, ': ', params.neg_fdbk_comment, '</h3>'
                                ].join('')
                            }, function (err, json) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send('Error');
                                }
                                mailOptions = {};
                                return res.status(200).json({
                                    'ticketNo': ticketTs
                                });
                            });

                        });

                    }).catch(function Error(error) {
                        res.status(400).send({message : 'Error in the Database for Feedback', error : error});
                    });
                });

            } else {
                db.feedback(params).then(function InserFeedback(result) {
                    res.json({message : result});
                }).catch(function Error(error) {
                    res.status(400).send({message : 'Error in the Database for Feedback', error : error});
                });
            }
        };
    };

    exports.rating = function(changeCase,request) {
      return function(req, res) {
        var params = {
          userid: req.body.userid,
          rating: req.body.rating,
      	  client_id: req.body.client_id  || '-1',
      	  conversation_id: req.body.conversation_id || '-1',
      	  platform: req.body.platform || 'N/A'
        };

        db.rating(params).then(function InsertRating(result) {
          res.json({message : result});
        }).catch(function Error(error) {
          res.status(400).send({message : 'Error in the Database for Rating', error : error});
        });
      }
    }

    exports.mobile = function(changeCase,request) {
      return function(req, res) {
        var params = {
          userid: req.body.userid,
          country: req.body.country,
          chatusagetime: req.body.chatusagetime,
          os: req.body.os,
          model: req.body.model
        };

        db.mobile(params).then(function InsertMobile(result) {
          res.json({message : result});
        }).catch(function Error(error) {
          res.status(400).send({message : 'Error in the Database for Mobile', error : error});
        });
      }
    };

}());
