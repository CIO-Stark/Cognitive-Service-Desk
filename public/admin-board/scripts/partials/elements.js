/**
 * Created by danielabrao on 10/11/16.
 */
(function () {
    "use strict";

    module.exports = {
        sendMailBtn: document.getElementById("sendmail"),
        loadingLowNegative: document.getElementById("loading-low-negative"),
        loadList: document.getElementById("load-list"),
        listElements: document.querySelectorAll(".dataContainer"),
        emailLogsList: document.getElementById("emailLogs"),
        telLogsList: document.getElementById("telLogs")
    };

}());