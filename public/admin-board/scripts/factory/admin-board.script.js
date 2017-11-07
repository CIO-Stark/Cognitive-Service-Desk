/**
 * Created by danielabrao on 7/13/16.
 */



// DATA ACCESS OBJECT PROVIDER - PROMISIFIED HTTP REQUESTS
(function () {
    "use strict";
    module.exports = {
        getNegativeActions: function (ajax, type, confidence) {
            return new Promise(function (resolve, reject) {
                ajax({
                    url: ["/getNegativeActions?country=", type, "&confidence=", confidence].join(""),
                    type: "get",
                    success: function (data) {
                        console.log(type);
                        console.log(data);
                        console.log("-----");
                        resolve(data);
                    },
                    error: function (err) {
                        reject(err.responseText);
                    }
                });
            });
        },
        retrieveLogs: function (ajax, type) {
            return new Promise(function (resolve, reject) {
                ajax({
                    url: ["/retrieveAdminLogs?language=", type].join(""),
                    type: "get",
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (err) {
                        reject(err.responseText);
                    }
                });
            });
        },
        sendMail: function sendMail (ajax, userArr, language) {
            return new Promise(function (resolve, reject) {
                ajax({
                    url: "/sendMail",
                    type: "post",
                    timeout: 100000000000,
                    data: {
                        feedbacks: userArr,
                        language: language
                    },
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (err) {
                        reject(err.responseText);
                    }
                });
            });
        },
        markAsCalled: function markAsCalled (ajax, feedback) {
            return new Promise(function (resolve, reject) {
                ajax({
                    url: "/logTelAction",
                    type: "post",
                    timeout: 100000000000,
                    data: {
                        feedback: {
                            rowID: feedback.rowID,
                            comment: feedback.comment.value
                        }
                    },
                    success: function (data) {
                        console.log("called");
                        console.log(data);
                        resolve(data);
                    },
                    error: function (err) {
                        console.log(err);
                        reject(err.responseText);
                    }
                });
            });
        },
        retrieveTelLogs: function retrieveTelLogs(ajax, language) {
            return new Promise(function (resolve, reject) {
                ajax({
                    url: ["/getTelLog?language=", language].join(""),
                    type: "get",
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (err) {
                        reject(err.responseText);
                    }
                });
            });
        }
    };
}());


