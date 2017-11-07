/**
 * Created by danielabrao on 7/13/16.
 */
(function () {
    'use strict';

    var json2csv = require('json2csv'),
        fs = require('fs'),
        credentials = require('../../config/credentials.js'),
        cloudantConfig = require('../../config/cloudant.js'),
        sendgrid = require("sendgrid")(credentials.sendgrid.username, credentials.sendgrid.password),
        email = new sendgrid.Email();

    module.exports = function (app, cloudant, request, ensureAuthenticated, services) {
        var ticket_userDB = cloudant.db.use('ticket_users');

        app.get('/retrieveTickets', function (req, res) {
            var emailToCheck;
            if (!services.SingleSignOn) {
                emailToCheck ='laciowa@br.ibm.com';
            } else {
                emailToCheck = req.user["emailaddress"];
            }

            var language,
                regex;

            ticket_userDB.find({
                selector: {
                    "email": emailToCheck
                }
            }, function (err, user) {
                if (err) {
                    console.error(new Error(err));
                    return res.redirect('/');
                }

                if (user.docs.length) {
                    if (user.docs[0].role !== 'admin') {
                        regex = new RegExp(/([@])\w+/i);
                        language = regex.exec(user.docs[0].email)[0].slice(1, 3) === 'br' ? 'pt' : 'es';
                    }

                    request.get({
                        url: [
                            'https://' + cloudantConfig.credentials.endpoint + '/ticket_base/_design/text-search/_search/',
                            'byTicketNo?q=*:*',
                            req.query.status ? ['%20AND%20status:', req.query.status].join('') : '',
                            language ? ['%20AND%20ticketLanguage:', language].join('') : '',
                            req.query.count ? '&counts=["status"]' : '',
                            req.query.bookmark ? ['&bookmark=', req.query.bookmark].join('') : '',
                            req.query.limit ? ['&limit=', req.query.limit].join('') : '',
                            req.query.sort  === 'asc' ? '&sort="-default<number>"' : '&sort="default<number>"'
                        ].join(''),
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Basic ' + cloudantConfig.exportedCredentials
                        }
                    }, function (error, response, body) {

                        if (error) {
                            console.log(error);
                            return res.status(500).send('Error');
                        }

                        var parsedBody = JSON.parse(body);

                        if (req.query.report) {

                            if (req.query.status === 'new') {
                                var fields = ['default', 'userQuestion', 'reason', 'timestamp', 'requester', 'ticketLanguage', 'employeeCountry'],
                                    fieldNames = ['No', 'Question', 'Reason', 'Open Date', 'Requester', 'Language', 'Country'];
                            } else {
                                var fields = ['default', 'requester', 'employeeCountry', 'reason', 'timestamp', 'statusChangeDate', 'resolvedBy', 'resolution'],
                                    fieldNames = ['No', 'Requester', 'Country', 'Reason', 'Open Date', 'Resolution Date', 'Resolved By', 'Resolution'];
                            }


                            var newArr = [];
                            for (var x = 0 ; x < parsedBody.rows.length; x += 1) {
                                newArr.push(parsedBody.rows[x].fields);
                            }

                            try {
                                var result = json2csv({ data: newArr, fields: fields, fieldNames: fieldNames}),
                                    bookmark = parsedBody.bookmark,
                                    fileName = [req.query.status, '-', language ? language : 'adm', '.csv'].join('');

                                fs.writeFile(['reports/', fileName].join(''), result, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }

                                    function getTickets (bookmark) {
                                        request.get({
                                            url: [
                                                'https://' + cloudantConfig.credentials.endpoint + '/ticket_base/_design/text-search/_search/',
                                                'byTicketNo?q=*:*',
                                                req.query.status ? ['%20AND%20status:', req.query.status].join('') : '',
                                                language ? ['%20AND%20ticketLanguage:', language].join('') : '',
                                                req.query.count ? '&counts=["status"]' : '',
                                                bookmark ? ['&bookmark=', bookmark].join('') : '',
                                                req.query.limit ? ['&limit=', req.query.limit].join('') : '',
                                                req.query.sort  === 'asc' ? '&sort="-default<number>"' : '&sort="default<number>"'
                                            ].join(''),
                                            headers: {
                                                'Accept': 'application/json',
                                                'Authorization': 'Basic ' + cloudantConfig.exportedCredentials
                                            }
                                        }, function (error, response, body) {

                                            if (JSON.parse(body).rows.length > 0) {
                                                var appendArr = [];
                                                bookmark = JSON.parse(body).bookmark;
                                                for (var y = 0 ; y < JSON.parse(body).rows.length; y += 1) {
                                                    appendArr.push(JSON.parse(body).rows[y].fields);
                                                }

                                                var appendResult = json2csv({ data: appendArr, hasCSVColumnTitle: false});

                                                fs.appendFile(['reports/', fileName].join(''), '\n', function (err) {
                                                    if (err) {
                                                        return res.send(err);
                                                    }
                                                    fs.appendFile(['/reports/', fileName].join(''), appendResult, function (err) {
                                                        if (err) {
                                                            return res.send(err);
                                                        }

                                                        return getTickets(bookmark);
                                                    });
                                                });

                                            } else {
                                                bookmark = '';
                                                return res.download(['reports/', fileName].join(''), fileName, function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                        })
                                    }

                                    getTickets(bookmark);

                                });

                            } catch (err) {
                                console.error(err);
                            }
                        } else {
                            return res.status(200).send(parsedBody);
                        }

                    });

                } else {
                    return res.status(401).send('Unauthorized');
                }
            });

        });


        app.post('/updateTicket', function (req, res) {
            console.log(req.body);

            var ticketDB = cloudant.db.use('ticket_base');

            ticketDB.find({
                selector: {
                    ticketNo: req.body.ticket.default
                }
            }, function (err, ticket) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Unknown error');
                }

                if (ticket.docs.length < 1) {
                    return res.status(404).send('ticket not found')
                }

                ticket.docs[0].status = req.body.ticket.status;
                ticket.docs[0].statusChangeDate = req.body.ticket.resolutionTime;
                ticket.docs[0].resolvedBy = req.body.ticket.resolvedBy;
                ticket.docs[0].resolution = req.body.ticket.comments;

                var mailOptions = {};

                if (req.body.ticket.ticketLanguage === 'pt') {
                    mailOptions.subject = ['Número de ticket', req.body.ticket[0]].join(' ');
                    mailOptions.destinatary = 'helpdesk@br.ibm.com';
                    mailOptions.empId = 'ID do funcionário';
                    mailOptions.description = 'Resolução do Problema';
                    mailOptions.cc = 'helpdesk@br.ibm.com'

                } else {
                    mailOptions.subject = ['Número de ticket', req.body.ticket[0]].join(' ');
                    mailOptions.destinatary = 'helpdesk@ar.ibm.com';
                    mailOptions.empId = 'Numero de Empleado';
                    mailOptions.description = 'Resolución del problema';
                    mailOptions.cc = 'watsonithelp@ar.ibm.com'
                }

                sendgrid.send({
                    to: mailOptions.destinatary,
                    cc: [mailOptions.cc, req.body.ticket.resolvedBy, req.body.ticket.requester],
                    from: 'CIOLA@Watson.com',
                    fromName: 'LA CIO Watson',
                    subject: ['Ticket number', req.body.ticket.default,  'has a resolution'].join(' '),
                    html: [
                        '<h1>Ticket #', req.body.ticket.default, '</h1>',
                        '<h3>', mailOptions.empId, ': ', req.body.ticket.requester, '</h3>',
                        '<h3>', mailOptions.description, ': ', req.body.ticket.comments, '</h3>'
                    ].join('')
                }, function (err, json) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Error');
                    }
                    mailOptions = {};
                    ticketDB.insert(ticket.docs[0], function (err, result) {
                        if (err) {
                            return res.status(500).send('error occurred updating. Try again');
                        }

                        return res.status(200).send('updated successfully');
                    });
                });

            });

        });

        if (services.SingleSignOn) {
            app.get('/tickets', ensureAuthenticated, function (req, res) {

                ticket_userDB.find({
                    selector: {
                        "email": req.user["emailaddress"]
                    }
                }, function (err, user) {
                    if (err) {
                        console.error(new Error(err));
                        return res.redirect('/');
                    }

                    if (user.docs.length) {
                        return res.status(200).render('./ticket-board/ticket-board.view.ejs', {
                            user: user.docs[0]
                        });
                    } else {
                        return res.redirect('/');
                    }
                });
            });
        } else {
            app.get('/tickets', function (req, res) {
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
                        return res.status(200).render('./ticket-board/ticket-board.view.ejs', {
                            user: user.docs[0]
                        });
                    } else {
                        return res.redirect('/');
                    }
                });
            });
        }

    };

}());