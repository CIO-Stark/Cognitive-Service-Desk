var Promise = require('bluebird');
var changeCase = require('change-case');
var trim = require('trim');
var S = require('string');
var math = require('mathjs');
var request = Promise.promisify(require('request'));
var watson = require('watson-developer-cloud');
var md5 = require('md5');
var extend = require('util')._extend;
var reset = require('./js/password.reset.js');
var profile = require('./js/profile.vars.js');
var _db = require('./js/db.js');
var credentials = require('../../config/credentials.js');
var db = require('../../js/db.js');
var nlc = require('../nlc/nlc.js');

var dialog = watson.dialog(credentials.dialog.login);
var class1,class2;

exports.pt = function() {
    return function(req, res, next) {
        var dialog_id = credentials.dialog.id.pt;
        var params = extend({ dialog_id: dialog_id }, req.body);
        var locale = 'pt';

        if(!req.body.client_id) {
            dialog.conversation(params, function(err, results) {

                results.source="Dialog";
                results.confidence = 100;
                res.json({ dialog_id: dialog_id, conversation: results});
            });

        } else if(req.body.apiKey == generateToken(md5)) {
            dialog.conversation(params, function(err, results) {
                if (err)
                    return next(err);
                else {

                    if(changeCase.upperCase(results.response).indexOf("PNLC") > -1 || changeCase.upperCase(results.response).indexOf("NLC: ") > -1) {
                        conversation_nlc(results,locale,dialog_id).then(function Chat(chat) {
                            res.json(chat);
                        }).catch(function NLCError(error) {
                            res.status(400).send({message : error});
                        });
                    } else if (changeCase.upperCase(results.response).indexOf("INTRANETRESET") > -1) {

                        results.source="Dialog";
                        results.confidence = 100;

                        profile.GetProfileVar('email',dialog,dialog_id,results.client_id).then(function ProfileVar(profile_value) {
                            reset.intranet(profile_value).then(function PasswordReset(result) {
                                results.response[0] = messages.pt.success;
                            }).catch(function ResetError(error) {
                                console.log('erro: ',error);
                                results.response[0] = messages.pt.fail.error;
                            }).finally(function SendResults() {
                                res.json({
                                    dialog_id: dialog_id,
                                    conversation: results
                                });
                            });
                        }).catch(function VariableNotFound(error) {
                            console.log('erro: ',error);
                            results.response[0] = messages.pt.fail.error;
                            res.json({
                                dialog_id: dialog_id,
                                conversation: results
                            });
                        });

                    } else if (changeCase.upperCase(results.response).indexOf("ATTRESET") > -1) {

                        results.source="Dialog";
                        results.confidence = 100;

                        profile.GetProfileVar('email',dialog,dialog_id,results.client_id).then(function ProfileVar(profile_email) {

                            //profile_email = 'thirauj@br.ibm.com';

                            //only for BETA
                            var options_faces = {
                                method: 'POST',
                                url: 'http://cap-sg-prd-4.integration.ibmcloud.com:16273/get',
                                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                                form: { email: profile_email }
                            };



                            request(options_faces).then(function GetUI(response) {
                                var uid = JSON.parse(response.body)[0].uid.substring(0, JSON.parse(response.body)[0].uid.length-3);
                                //var uid = '114807';
                                _db.select('EMPLOYEE_ID',uid).then(function GetResult(att_response) {

                                    console.log('ID do cara: ',att_response.ATT_ID); //tratar duplicados

                                    var options_reset = {
                                        method: 'POST',
                                        url: 'https://attreset.mybluemix.net/reset',
                                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                                        form: { uid: att_response.ATT_ID, email: profile_email,att_country_code: att_response.ATT_COUNTRY_CODE}
                                    };

                                    request(options_reset).then(function ResetATTPAssword(response) {
                                        if(response.statusCode === 404) throw new Error('ATT API Offline');
                                        else if (JSON.parse(response.body).code === 404) results.response[0] = messages.pt.fail.error;
                                        else if(JSON.parse(response.body).code === 400) results.response[0] = messages.pt.fail.error;
                                        else results.response[0] = messages.pt.success;

                                        res.json({
                                            dialog_id: dialog_id,
                                            conversation: results
                                        });

                                    }).catch(function Error(error) {
                                        results.response[0] = messages.pt.fail.error;
                                        res.json({
                                            dialog_id: dialog_id,
                                            conversation: results
                                        });
                                    });
                                }).catch(function Error(error) {
                                    if(error.message === 'NOT_FOUND') {
                                        results.response[0] = messages.pt.fail.att_not_found;
                                        res.json({
                                            dialog_id: dialog_id,
                                            conversation: results
                                        });
                                    }
                                });
                            })
                        });
                    }
                    else {
                        results.source="Dialog";
                        results.confidence = 100;
                        res.json({ dialog_id: dialog_id, conversation: results});
                    }
                }
            });
        } else {
            res.status(401).send({message : "Not Authorized"});
        }
    }
}


exports.es = function() {
    return function(req, res, next) {
        var dialog_id = credentials.dialog.id.es;

        var params = extend({ dialog_id: dialog_id }, req.body);
        var locale = 'es';

        if(!req.body.client_id) {
            dialog.conversation(params, function(err, results) {

                results.source="Dialog";
                results.confidence = 100;
                res.json({ dialog_id: dialog_id, conversation: results});
            });

        } else if(req.body.apiKey == generateToken(md5)) {
            dialog.conversation(params, function(err, results) {
                if (err)
                    return next(err);
                else {

                    if(changeCase.upperCase(results.response).indexOf("PNLC") > -1 || changeCase.upperCase(results.response).indexOf("NLC: ") > -1) {
                        conversation_nlc(results,locale,dialog_id).then(function Chat(chat) {
                            res.json(chat);
                        }).catch(function NLCError(error) {
                            res.status(400).send({message : error});
                        });
                    }else if (changeCase.upperCase(results.response).indexOf("INTRANETRESET") > -1) {

                        results.source="Dialog";
                        results.confidence = 100;

                        profile.GetProfileVar('email',dialog,dialog_id,results.client_id).then(function ProfileVar(profile_value) {
                            reset.intranet(profile_value).then(function PasswordReset(result) {
                                results.response[0] = messages.es.success;
                            }).catch(function ResetError(error) {
                                results.response[0] = messages.es.fail.error;
                            }).finally(function SendResults() {
                                res.json({
                                    dialog_id: dialog_id,
                                    conversation: results
                                });
                            });
                        }).catch(function VariableNotFound(error) {
                            results.response[0] = messages.es.fail.error;
                            res.json({
                                dialog_id: dialog_id,
                                conversation: results
                            });
                        });

                    } else if (changeCase.upperCase(results.response).indexOf("ATTRESET") > -1) {

                        results.source="Dialog";
                        results.confidence = 100;

                        profile.GetProfileVar('email',dialog,dialog_id,results.client_id).then(function ProfileVar(profile_email) {

                            //profile_email = 'thirauj@br.ibm.com';

                            //only for BETA
                            var options_faces = {
                                method: 'POST',
                                url: 'http://cap-sg-prd-4.integration.ibmcloud.com:16273/get',
                                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                                form: { email: profile_email }
                            };



                            request(options_faces).then(function GetUI(response) {
                                var uid = JSON.parse(response.body)[0].uid.substring(0, JSON.parse(response.body)[0].uid.length-3);
                                //var uid = '114807';
                                _db.select('EMPLOYEE_ID',uid).then(function GetResult(att_response) {

                                    console.log('ID do cara: ',att_response.ATT_ID);

                                    var options_reset = {
                                        method: 'POST',
                                        url: 'https://attreset.mybluemix.net/reset',
                                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                                        form: { uid: att_response.ATT_ID, email: profile_email,att_country_code: att_response.ATT_COUNTRY_CODE}
                                    };

                                    request(options_reset).then(function ResetATTPAssword(response) {
                                        if(response.statusCode === 404) throw new Error('ATT API Offline');
                                        else if (JSON.parse(response.body).code === 404) results.response[0] = messages.es.fail.error;
                                        else if(JSON.parse(response.body).code === 400) results.response[0] = messages.es.fail.error;
                                        else results.response[0] = messages.es.success;

                                        res.json({
                                            dialog_id: dialog_id,
                                            conversation: results
                                        });

                                    }).catch(function Error(error) {
                                        results.response[0] = messages.es.fail.error;
                                        res.json({
                                            dialog_id: dialog_id,
                                            conversation: results
                                        });
                                    });
                                }).catch(function Error(error) {
                                    if(error.message === 'NOT_FOUND') {
                                        results.response[0] = messages.es.fail.att_not_found;
                                        res.json({
                                            dialog_id: dialog_id,
                                            conversation: results
                                        });
                                    }
                                });
                            })
                        });
                    }
                    else {
                        results.source="Dialog";
                        results.confidence = 100;
                        res.json({ dialog_id: dialog_id, conversation: results});
                    }
                }
            });
        } else {
            res.status(401).send({message : "Not Authorized"});
        }
    }
}

var conversation_nlc = function (results,locale,dialog_id) {
    results.source = "NLC";

    if (changeCase.upperCase(results.response).indexOf("PNLC") > -1) {
        var userQuestion = trim(results.input);
    } else if (changeCase.upperCase(results.response).indexOf("NLC: ") > -1) {
        var userQuestion = trim(S(results.response).chompLeft('NLC: ').s);
    }


    if (userQuestion.indexOf("?") < 0) {
        userQuestion = userQuestion + '?'
    }

    return new Promise(function ExecuteNLCRequest(resolve, reject) {
        nlc.classify(userQuestion, locale).then(function CheckErrorNLC(result) {

            results.confidence = math.round(result.classes[0].confidence * 100);

            class1 = JSON.stringify(result.classes[0].class_name).replace(/\"/g, '');
            class2 = JSON.stringify(result.classes[1].class_name).replace(/\"/g, '');

            db.answerV2(class1, class2).then(function GetAnswerRequest(answers) {
                results.class_id = [];
                results.cluster = [];
                for (i in answers) {
                    if (answers.hasOwnProperty(i)) {
                        if (answers[i].class_id == class1) {
                            results.class_id[0] = answers[i].class_id;
                            results.cluster[0] = answers[i].cluster;
                            results.response[0] = answers[i].answer;
                            console.log('results_answer',results.cluster[0], results.class_id[0]);
                        } else {
                            results.class_id[1] = answers[i].class_id;
                            results.cluster[1] = answers[i].cluster;
                            results.response[1] = answers[i].answer;
                            console.log('results_answer2',results.cluster[1], results.class_id[1]);
                        }
                    }
                }
                resolve({dialog_id: dialog_id, conversation: results});
            }).catch(function DBError(error) {
              reject(error);
            })
        }).catch(function NLCError(error) {
            reject(error);
        });
    });
}

var generateToken = function(md5) {
    return token_md5 = (md5('watson.T0pS3cRetP4ssw0rdOff4llT1mZ.cio'+new Date().toISOString().substring(0, 10)));
}


var messages = {
    pt : {
        success : 'Pronto, sua requisição de reset foi efetuada com sucesso. Dê uma olhada na sua inbox para continuar o processo.',
        fail : {
            error : 'Ops, occoreu um erro na sua solicitação de reset. Pode tentar novamente mais tarde, por favor?',
            att_not_found : 'Ops, não foi encontrado nenhum ID de AT&T atrelado a sua matricula.',
            beta : 'Ops, para resetar a sua senha de AT&T durante a fase beta, é necessário estar conectado na rede da IBM'
        }
    },
    es : {
        success : 'Listo, su requerimiento ha sido enviado. Por favor, verifique su Inbox para continuar con el proceso.',
        fail : {
            error : 'Ups, hubo un error con su requerimiento. Podría intentarlo nuevamente mas tarde?',
            att_not_found : 'Ops, no encuentro un ID de AT&T asociado a tu número de empleado',
            beta : 'Ups, hubo un error con su requerimiento. Podría intentarlo nuevamente mas tarde?'
        }
    }
}
