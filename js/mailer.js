/**
 * Created by danielabrao on 10/10/16.
 */
(function () {
    "use strict";

    var engagementMailMessage = require("../model/engagementMail");

    module.exports = function (sendgrid) {
        return {
            engagementMail: function (mailOptions) {
                return new Promise(function (resolve, reject) {


                        // //
                        // console.log(engagementMailMessage({
                        //     "language": mailOptions.language,
                        //     "user": mailOptions.user,
                        //     "questionArr": mailOptions.questionArr
                        // }));
                        // resolve("oi");

                    sendgrid.send({
                        to: "",
                        from: '',
                        fromName: '',
                        subject: (mailOptions.language == "1" || mailOptions.language === "pt") ? "O Watson IT Help foi retreinado para te ajudar: dê mais uma chance para ele!" : "Watson IT Help fue re-entrenado para ayudarte: ¡dale una oportunidad más!",
                        html: [
                            "<a href='http://bit.ly/watsonithelp' target='_blank'>",
                            "<img class='max-width' width='90%' height='' src='https://marketing-image-production.s3.amazonaws.com/uploads/d46903055cefef7960eab1092def0db2aa5a7d3cb891f723fe430963652a4086b4f68ffd68661680fbf686640e2429cc8c6b9b93e11c214e1b78fe1c7a44993d.png' alt='' border='0' style='display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 938px !important; width: 100% !important; height: auto !important; '>",
                            "</a>",
                            "<div>", engagementMailMessage({
                                "language": mailOptions.language,
                                "user": mailOptions.user,
                                "questionArr": mailOptions.questionArr
                            }), "</div>"
                        ].join("")
                    }, function (err) {
                        if (err) {
                            reject('Error');
                        } else {
                            resolve('oi');
                        }
                    });
                });
            }
        }
    };
}());



