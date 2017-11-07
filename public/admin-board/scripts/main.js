/**
 * Created by danielabrao on 7/14/16.
 */
(function (scope) {
    "use strict";

    var propsObj = {
        filteredData: {},
        getFilteredData: function () {
            return this.filteredData;
        },
        setFilteredData: function (data) {
            this.filteredData = data;
            return this;
        }
    };

    var $ = require("jquery"),
        Ladda = require("ladda"),
        admFactory = require("./factory/admin-board.script"),
        actionHandler = require("./partials/actionHandler"),
        objFilter = require("./partials/objFilter"),
        elements = require("./partials/elements"),
        interfaceObj = require("./partials/interfaceBuilder")(actionHandler, admFactory, $, propsObj);

    $(document).ready(function () {
        var body = document.querySelector("body");

        var methodsObj = {
            getLanguage: function () {
                return $("#lang-selector-new").find(":selected").val();
            },
            getNegativeData: function (confidence) {

                elements.loadingLowNegative.style.display = "block";

                admFactory.getNegativeActions($.ajax, this.getLanguage(), confidence).then(function successCB (data) {
                    propsObj.setFilteredData(objFilter(data.feedbacks));
                    propsObj.getFilteredData().map(function (row, index) {
                        interfaceObj.drawList(confidence, row, index);
                    });

                    if (confidence === "lowNegative") {
                        actionHandler.bindAction(elements.sendMailBtn, methodsObj.wrapAction(propsObj.getFilteredData()));
                    } else {
                        actionHandler.bindAction(elements.loadList, methodsObj.triggerReloadData);
                    }

                    elements.loadingLowNegative.style.display = "none";
                    elements.sendMailBtn.style.display = "block";

                }, function errorCB (error) {
                    elements.loadingLowNegative.style.display = "none";
                    console.log(error);
                });
            },
            getEmailLogs: function (logType) {
                admFactory.retrieveLogs($.ajax, logType).then(function successCB (data) {
                    interfaceObj.populateLogsList(elements.emailLogsList, data.docs);
                }, function errorCB (err) {
                    console.log(err);
                });
            },
            getTelLogs: function (language) {
                admFactory.retrieveTelLogs($.ajax, language).then(function successCB (data) {
                    interfaceObj.populateLogsList(elements.telLogsList, data);
                }, function errorCB (err) {
                    console.log(err);
                });
            },
            triggerReloadData: function () {
                actionHandler.removeAction(elements.loadList, methodsObj.triggerReloadData);
                actionHandler.removeAction(elements.sendMailBtn, methodsObj.wrapAction);
                interfaceObj.dumpLists(elements.listElements);
                main.init();
            },
            wrapAction: function (data) {
                return function () {
                    var interval = window.setInterval(function () {
                        console.log("...");
                    }, 1000);
                    console.log("Processing emails and changing status");
                    admFactory.sendMail($.ajax, data, methodsObj.getLanguage()).then(function successCB(data) {
                        console.log("ok");
                        window.clearInterval(interval);
                    }, function errorCB(err) {
                        console.log(err);
                    });
                };
            }
        };

        $("[data-tab]").on("click", function (e) {
            e.preventDefault();
            $(this).addClass("active").siblings(".tab").removeClass("active");
            $("body > div > main [" + ["data-content=", $(this).data("tab"), "]"].join("")).addClass("active").siblings("[data-content]").removeClass("active");
        });

        //App bootstrap object
        var main = {
            init: function () {
                methodsObj.getNegativeData("lowNegative");
                methodsObj.getNegativeData("highNegative");
                methodsObj.getEmailLogs("email");
                methodsObj.getTelLogs(methodsObj.getLanguage());
                return this;
            }
        };
        main.init();
    });
}(window));