/**
 * Created by danielabrao on 7/27/16.
 */
(function () {
    'use strict';
    var //nlc = require('../nlc/nlc.js'),
        countryCodes = require('../../config/country-codes');


        module.exports = function (app, io, watsonConversation) {

        io.on('connection', function (socket) {
            // ticketCountry = countryCodes(req.body.employeeCountry.toUpperCase());

            socket.once('disconnect', function () {
                console.log([io.engine.clientsCount, 'Clients connected after this exit'].join(' '));
            });

            /*socket.on('check_nlc', function (socketData) {
                nlc.classify('oi', socketData.locale).then(function (data) {
                    if (data.hasOwnProperty('error')) {
                        socket.emit('nlc_out', data.error);
                    } else {
                        console.log('ok');
                    }
                }, function (err) {
                    for (var prop in err) {
                        if (err.hasOwnProperty(prop)) {
                            console.log(err[prop]);
                        }

                    }
                    console.error(new Error(err));
                    socket.emit('nlc_out', err);
                });
            });*/

            socket.on('check_conversation', function (socketData) {
              watsonConversation.sendMessage({
                  "input": {
                      "text": 'oi'
                  },
                  "language": socketData.locale
              }).then(function (data) {
                  // console.log('nlc_ok');
              }, function (err) {
                  socket.emit('nlc_out', err);
              });
            });

        });

        app.get('/x', function (req, res) {
            res.send('ok');
        });

        /*app.get('/checkNlc', function (req, res) {
            nlc.classify('oi', req.query.locale).then(function (data) {
                if (data.hasOwnProperty('error')) {
                    return res.status(500).send(data.error);
                } else {
                    return res.status(200).send('ok');
                }
            }, function (err) {
                console.error(new Error(err));
                return res.status(500).send(err);
            });
        });*/

        app.get('/getCountry', function (req, res) {
            try {
                var country = countryCodes(req.query.country.toUpperCase());
            } catch (e) {
                console.log(e);
            }

            return res.status(200).send(country);

        });
    };
}());
