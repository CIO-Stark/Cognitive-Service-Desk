/**
 * Created by danielabrao on 7/14/16.
 */
(function (document) {
    "use strict";
    var $ = require('jquery'),
        Ladda = require('ladda'),
        smeModule = require('./sme-board.script')();
    $(document).ready(function () {
        if (/constructor/i.test(window.HTMLElement)) {
            $("#content-wrapper").css('display', '-webkit-box');
        }
        var body = document.querySelector("body"),
            actionTableHead = document.querySelector("#sme-action-list thead tr"),
            actionTableBody = document.querySelector("#sme-action-list tbody"),
            resolvedTableHead = document.querySelector("#resolved-feedback-list thead tr"),
            resolvedTableBody = document.querySelector("#resolved-feedback-list tbody"),
            searchInput = $(".searchFeedbacks"),
            resolvedSearchInput = $(".searchResolvedFeedbacks"),
            loadScorecardBtn = $("#load-scorecard"),
            loadResolvedBtn = $("#load-resolved"),
            backlogLoad = $("#backlog-loading"),
            nlcPositiveLoad = $("#nlcPositive-loading"),
            resolvedLoad = $("#resolved-loading"),
            newFeedbackQuery = '',
            resolvedFeedbackQuery = '',
            totalLoad = $("#total-loading"),
            dialogCountLoad = $("#dialogCount-loading"),
            headLoaded = false,
            resolvedHeadLoaded = false,
            controlFocus = '',
            x = [],
            y = [],
            selectActionOptions = {},
            countModel = {
                backlogCount: 0,
                resolvedCount: 0,
                quarterCount: 0,
                updateDOM: function (el, value) {
                    try {
                        el.innerText = value;
                    } catch (e) {
                        console.log(e);
                    }

                },
                updateBacklogCount: function (operation, value) {
                    if (operation === "subtract") {
                        this.backlogCount -= value;
                    } else if (operation === 'clear') {
                        this.backlogCount = 0;
                    } else if (operation === 'sum') {
                        this.backlogCount += value;
                    } else {
                        this.backlogCount = value;
                    }
                    this.updateDOM(document.querySelector("#backlog-count"), this.backlogCount);
                    this.updateDOM(document.querySelector("#backlog-count-one"), this.backlogCount);
                },
                updateResolvedCount: function (operation, value) {
                    if (operation === "subtract") {
                        this.resolvedCount -= value;
                    } else if (operation === 'clear') {
                        this.resolvedCount = 0;
                    } else if (operation === 'sum') {
                        this.resolvedCount += value;
                    } else {
                        this.resolvedCount = value;
                    }
                    this.updateDOM(document.querySelector("#resolved-count-one"), this.resolvedCount);
                },
                getQuarterCount: function () {
                    return this.quarterCount;
                },
                updateQuarterCount: function (operation, value) {
                    if (operation === 'clear') {
                        this.quarterCount = 0;
                    } else {
                        this.quarterCount += value;
                    }
                    this.updateDOM(document.querySelector("#quarter-count"), this.quarterCount);
                }
            },
            periodModel = {
                year: new Date().getFullYear(),
                quarter: Math.ceil(((new Date().getMonth() + 1) / 3.0).toPrecision(1)),
                type: $("#type-select").find(":selected").val(),
                getYear: function () {
                    return this.year;
                },
                setYear: function (year) {
                    this.year = year;
                },
                getQuarter: function () {
                    return this.quarter;
                },
                setQuarter: function (quarter) {
                    this.quarter = quarter;
                },
                getLanguage: function () {
                    return $('#lang-selector-new').find(":selected").val();
                },
                setLanguage: function (language) {
                    this.language = language;
                },
                getType: function () {
                    return this.type;
                },
                setType: function (type) {
                    this.type = type;
                }
            },
            totalsCount = {
                dialog: {
                    "total": 0,
                    "resolved": 0,
                    "increaseTotal": function (value, context) {
                        this[context] += Number(value);
                    },
                    "setTotal": function (value, context) {
                        this[context] = Number(value);
                    },
                    "getTotal": function (context) {
                        return this[context];
                    }
                }
            },
            yearSelector = $("#year-select"),
            quarterSelector = $("#quarter-select"),
            scorecardLanguageSelector = $("#lang-select");

        function translateMonth (number) {
            switch (number) {
                case '1':
                    return 'January';
                case '2':
                    return 'February';
                case '3':
                    return 'March';
                case '4':
                    return 'April';
                case '5':
                    return 'May';
                case '6':
                    return 'June';
                case '7':
                    return 'July';
                case '8':
                    return 'August';
                case '9':
                    return 'September';
                case '10':
                    return 'October';
                case '11':
                    return 'November';
                case '12':
                    return 'December';
                default:
                    return number;
            }
        }

        function buildTableBody (row, shouldPrepend) {
            var tr = document.createElement('tr');
            for (var prop in row) {
                if (row.hasOwnProperty(prop)) {
                    if (!resolvedHeadLoaded) {
                        var th = document.createElement('th');
                        th.appendChild(document.createTextNode(prop));
                        resolvedTableHead.appendChild(th);
                        y.push(prop);
                    }

                    var td = document.createElement('td');
                    td.setAttribute('class', 'sort');

                    td.addEventListener('click', function () {
                        if (controlFocus) {
                            controlFocus.classList.remove('selected');
                        }

                        controlFocus = this;

                        this.classList.add('selected');
                    });

                    td.appendChild(document.createTextNode(row[prop]));
                    tr.appendChild(td);

                    if (shouldPrepend) {
                        resolvedTableBody.insertBefore(tr, resolvedTableBody.firstChild);
                    } else {
                        resolvedTableBody.appendChild(tr);
                    }
                }
            }

            resolvedHeadLoaded = true;
        }

        function buildSMEMetrics () {
            $("#export-scorecard").unbind('click', null);
            loadScorecardBtn.unbind('click', null);
            // countModel.updateQuarterCount('clear');
            $("#total-wrapper").empty();
            $("#dialogCount-wrapper").empty();
            totalsCount.dialog.setTotal(0, 'total');
            totalsCount.dialog.setTotal(0, 'resolved');

            totalLoad.show();
            dialogCountLoad.show();

            var nlcData = [],
                nlcCount = 0,
                dialogCount = 0,
                dialogCountTool = 0,
                dialogActionTaken = 0;

            buildMetricsHeader('total', [periodModel.getYear(), periodModel.getQuarter(), 'Quarter', '- Total feedbacks solved'].join(' '));

            if (!$('#lang-selector-new').find(":selected").val()) {
                var regex = new RegExp(/([@])\w+/i),
                    countrySuffix = regex.exec(document.querySelector("#username").innerText)[0].slice(1, 3);
            }

            smeModule.smeFactory.getMetrics($.Deferred(), $.ajax, {
                "year": periodModel.getYear(),
                "quarter": periodModel.getQuarter(),
                "language": $('#lang-selector-new').find(":selected").val() || countrySuffix,
                "type":  $('#type-selector-new').find(":selected").val()
            }).then(function (data) {
                totalLoad.hide();
                data.map(function (monthData) {
                    nlcCount += buildMetric('total', monthData);
                });

                // countModel.updateQuarterCount('sum', nlcCount);
                buildTotalBox('total', nlcCount);
                nlcData = data;

            }, function (err) {
                console.log(err);
                buildToastr({
                    "message": err
                });
                totalLoad.hide();
            });

            (function checkIfComplete (var1) {
                window.setTimeout(function () {
                    if (var1) {
                        $("#export-scorecard").click(function () {

                            var l = Ladda.create(document.querySelector("#export-scorecard"));
                            l.start();

                            smeModule.smeFactory.exportScorecard($.Deferred(), $.ajax, nlcData).then(function (result) {
                                var  a = document.createElement('a');
                                a.href = ['/downloadFile?name=', result].join('');
                                a.style.display = 'none';
                                a.setAttribute('download', '');
                                document.body.appendChild(a);
                                a.click();
                                l.stop();
                            }, function (err) {
                                console.log(err);
                                l.stop();
                            });
                        });

                        var totalArr = [],
                            dialogCountArr = {
                                "year": periodModel.getYear(),
                                "quarter": periodModel.getQuarter(),
                                "months": []
                            };

                        for (var i = 0; i < 3; i += 1) {
                            totalArr.push({
                                "month": nlcData[i].month,
                                "dates": []
                            });
                            dialogCountArr.months.push({
                                "month": nlcData[i].month,
                                "dates": []
                            });

                            for (var j = 0; j < nlcData[i].dates.length; j += 1) {
                                totalArr[i].dates.push({
                                    "week": nlcData[i].dates[j].week
                                });

                                dialogCountArr.months[i].dates.push({
                                    "week": nlcData[i].dates[j].week
                                });

                                dialogCountArr.months[i].dates[dialogCountArr.months[i].dates.length - 1][nlcData[i].dates[j].week] = {
                                    "negativeNLCAction": Number(nlcData[i].dates[j].count)
                                };
                            }
                        }

                        buildMetricsHeader('dialogCount', [periodModel.getYear(), periodModel.getQuarter(), 'Quarter', '- Dialogs from Dialog Manager'].join(' '));
                        smeModule.smeFactory.getDialogCount($.Deferred(), $.ajax, dialogCountArr, $('#lang-selector-new').find(":selected").val() || countrySuffix).then(function (result) {

                            dialogCountLoad.hide();
                            result.months.map(function (monthData) {
                                var x = buildMetric('dialogCount', monthData);
                                totalsCount.dialog.increaseTotal(x.totalCount, 'total');
                                totalsCount.dialog.increaseTotal(x.actionTakenCount, 'resolved');
                            });
                            buildTotalBox('dialogCount', [totalsCount.dialog.getTotal('total'), totalsCount.dialog.getTotal('resolved')].join('/'));

                        }, function (err) {
                            console.log(err);
                        });

                        console.log('released');

                    } else {
                        checkIfComplete(nlcData.length);
                    }
                }, 300);
            }(nlcData.length));

            loadScorecardBtn.click(function () {
                buildSMEMetrics();
            });
        };

        //New feedbacks table Additional fields (SME actions)
        function buildExtraFields (skipHeader) {
            return new Promise(function(resolve, reject) {
                var editableFields = ['Action Taken', 'Action Taken 2', 'Comments'],
                    extraHeaders = [],
                    extraRows = [];

                //Build table header
                for (var i = 0; i < editableFields.length; i += 1) {
                    if (!skipHeader) {
                        var th = document.createElement('th');
                        th.appendChild(document.createTextNode(editableFields[i]));
                        extraHeaders.push(th);
                    }
                }

                //First TD - Action 1 declaration
                var actionOneTD = document.createElement('td'),
                    selectField = document.createElement('select');

                var defaultOption = document.createElement('option'),
                    dialogOption = document.createElement('option'),
                    nlcOption = document.createElement('option'),
                    falseNegativeOption = document.createElement('option');

                defaultOption.setAttribute('disabled', '');
                defaultOption.setAttribute('selected', '');
                defaultOption.setAttribute('value', '');
                defaultOption.appendChild(document.createTextNode('Select an option'));

                dialogOption.setAttribute('value', 'dialog');
                nlcOption.setAttribute('value', 'nlc');
                falseNegativeOption.setAttribute('value', 'false_negative');

                dialogOption.appendChild(document.createTextNode('Dialog'));
                nlcOption.appendChild(document.createTextNode('NLC'));
                falseNegativeOption.appendChild(document.createTextNode('False Negative'));

                selectField.appendChild(defaultOption);
                selectField.appendChild(dialogOption);
                selectField.appendChild(nlcOption);
                selectField.appendChild(falseNegativeOption);

                selectField.addEventListener('change', function (e) {
                    var self = this;
                    secondSelectField.removeEventListener('change', null);
                    actionTwoTD.appendChild(secondSelectField);


                    if (selectActionOptions.hasOwnProperty(self.value)) {
                        while (secondSelectField.hasChildNodes()) {
                            secondSelectField.removeChild(secondSelectField.lastChild);
                        }

                        selectActionOptions[self.value].map(function (option) {
                            var fetchedOption = document.createElement('option');
                            fetchedOption.setAttribute('value', option);
                            fetchedOption.appendChild(document.createTextNode(option));

                            secondSelectField.appendChild(fetchedOption);
                        });

                        return;
                    }

                    smeModule.smeFactory.getSecondaryActions($.Deferred(), $.ajax, self.value).then(function (options) {
                        while (secondSelectField.hasChildNodes()) {
                            secondSelectField.removeChild(secondSelectField.lastChild);
                        }

                        options.map(function (option) {
                            var fetchedOption = document.createElement('option');
                            fetchedOption.setAttribute('value', option);
                            fetchedOption.appendChild(document.createTextNode(option));

                            secondSelectField.appendChild(fetchedOption);
                        });

                        selectActionOptions[self.value] = options;
                    }, function errorCB (err) {
                        console.log(err);
                    });

                });

                selectField.setAttribute('class', 'input');
                actionOneTD.appendChild(selectField);

                //Second TD - Action 2 declaration
                var actionTwoTD = document.createElement('td'),
                    secondSelectField = document.createElement('select'),
                    secondDefaultOption = document.createElement('option');

                secondDefaultOption.setAttribute('disabled', '');
                secondDefaultOption.setAttribute('selected', '');
                secondDefaultOption.setAttribute('value', '');
                secondDefaultOption.appendChild(document.createTextNode('Select a type'));


                secondSelectField.appendChild(secondDefaultOption);
                secondSelectField.setAttribute('class', 'input');
                actionTwoTD.appendChild(secondSelectField);

                //Create the comments field
                var commentsTD = document.createElement('td');
                var input = document.createElement('input');
                input.setAttribute('max', 100);
                input.setAttribute('maxlength', 100);

                input.setAttribute('type', 'text');
                input.setAttribute('class', 'input');
                commentsTD.appendChild(input);


                //Append childs to build a row
                extraRows.push(actionOneTD);
                extraRows.push(actionTwoTD);
                extraRows.push(commentsTD);

                resolve({
                    extraHeaders: extraHeaders,
                    extraRows: extraRows
                });
            });

        }

        // Called for each line that return from database regarding the unresolved feedbacks
        function drawLine(row, loadExtra) {
            var tr = document.createElement('tr');
            for (var prop in row) {
                if (row.hasOwnProperty(prop)) {
                    if (!headLoaded) {
                        var th = document.createElement('th');
                        th.appendChild(document.createTextNode(prop));
                        actionTableHead.appendChild(th);
                        x.push(prop);
                    }

                    var td = document.createElement('td');
                    td.setAttribute('class', 'sort');

                    td.addEventListener('click', function () {
                        if (controlFocus) {
                            controlFocus.classList.remove('selected');
                        }

                        controlFocus = this;

                        this.classList.add('selected');
                    });

                    td.appendChild(document.createTextNode(row[prop]));
                    tr.appendChild(td);
                }
            }

            if (loadExtra) {
                buildExtraFields(headLoaded).then(function (data) {

                    for (var l = 0; l < data.extraHeaders.length; l += 1) {
                        actionTableHead.appendChild(data.extraHeaders[l]);
                    }

                    for (var j = 0; j < data.extraRows.length; j += 1) {
                        tr.appendChild(data.extraRows[j]);
                    }

                    var buttonWrapper = document.createElement('div'),
                        sendButton = document.createElement('button');
                    var laddaSpan = document.createElement('span'),
                        laddaSpinner = document.createElement('span');

                    laddaSpan.setAttribute('class', 'ladda-label');
                    laddaSpan.appendChild(document.createTextNode('Send'));

                    laddaSpinner.setAttribute('class', 'ladda-spinner');

                    sendButton.appendChild(laddaSpan);
                    sendButton.appendChild(laddaSpinner);
                    sendButton.setAttribute('class', 'ladda-button');
                    sendButton.setAttribute('data-style', 'zoom-in');

                    sendButton.addEventListener('click', function () {
                        var self = this;
                        var l = Ladda.create(this);
                        l.start();

                        var feedbackObj = {
                            "action": '',
                            "action2": '',
                            "comments": ''
                        };
                        var inputArr = tr.querySelectorAll('.input');

                        var index = 0;

                        if (!inputArr[0].value || !inputArr[1].value) {
                            buildToastr({
                                "message": "Invalid parameters"
                            });
                            l.stop();
                            return;
                        }

                        for (var prop in feedbackObj) {
                            if (feedbackObj.hasOwnProperty(prop)) {
                                if (index  === inputArr.length) {
                                    break;
                                }
                                feedbackObj[prop] = inputArr[index].value;
                                index += 1;
                            }
                        }
                        //
                        feedbackObj.ID = row.ID;
                        smeModule.smeFactory.takeAction($.Deferred(), $.ajax, feedbackObj).then(function successCB (data) {
                            l.stop();
                            buildToastr({
                                "message": "Success"
                            });
                            countModel.updateBacklogCount('subtract', 1);
                            countModel.updateResolvedCount('sum', 1);
                            $(self).parent().parent().fadeOut();
                            row.ACTION_DATE = 'Just now';
                            row.ACTION_TAKEN = feedbackObj.action;
                            row.ACTION_TAKEN2 = feedbackObj.action2;
                            row.COMMENTS = feedbackObj.comments;

                            buildTableBody(row, true);
                        }, function errorCB (err) {
                            l.stop();
                            buildToastr({
                                "message": err
                            });
                            console.log(err);
                        });

                    });


                    buttonWrapper.appendChild(sendButton);
                    tr.appendChild(buttonWrapper);

                });
            }

            actionTableBody.appendChild(tr);

            headLoaded = true;
        }



        var countrySuffix,
            languageSelector,
            searchType;

        //BACKLOG SESSION
        function buildNewFeedbacksTable () {
            $("#load-backlog").unbind('click', null);
            $("#export-backlog").unbind('click', null);
            backlogLoad.show();

            smeModule.smeFactory.getFeedbacks($.Deferred(), $.ajax, $('#lang-selector-new').find(":selected").val(), $('#type-selector-new').find(":selected").val()).then(function (data) {
                countModel.updateBacklogCount(null, data.feedbacks.length);
                backlogLoad.hide();
                newFeedbackQuery = data.query;

                if (data.feedbacks.length) {
                    data.feedbacks.map(function (row) {
                        drawLine(row, true);
                    });
                } else {
                    drawLine({
                        "Empty": "No data"
                    }, false);
                }


                // sortable(document.getElementById("sme-action-list"), x);

                $("#export-backlog").click(function () {

                    var l = Ladda.create(document.querySelector("#export-backlog"));
                    l.start();

                    smeModule.smeFactory.exportData($.Deferred(), $.ajax, newFeedbackQuery, 'backlog').then(function (result) {
                        var  a = document.createElement('a');
                        a.href = ['/downloadFile?name=', result].join('');
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        l.stop();
                    }, function (err) {
                        console.log(err);
                        l.stop();
                    });
                });

                $("#load-backlog").click(function () {

                    countModel.updateBacklogCount(null, '?');
                    countModel.updateResolvedCount(null, '?');
                    $("#sme-action-list thead tr").empty();
                    $("#sme-action-list tbody").empty();
                    headLoaded = false;
                    buildNewFeedbacksTable();

                    $("#resolved-feedback-list").find("thead tr").empty();
                    $("#resolved-feedback-list").find("tbody").empty();
                    resolvedHeadLoaded = false;
                    buildResolvedFeedbacksTable();

                    $("#export-scorecard").unbind('click', null);
                    // countModel.updateQuarterCount('clear');
                    $("#total-wrapper").empty();
                    $("#dialogCount-wrapper").empty();
                    totalsCount.dialog.setTotal(0, 'total');
                    totalsCount.dialog.setTotal(0, 'resolved');
                    buildSMEMetrics();

                });

            }, function (err) {
                console.log(err);
                buildToastr({
                    "message": err
                });
                backlogLoad.hide();
            });

        }

        //ACTION TAKEN SESSION
        function buildResolvedFeedbacksTable () {
            resolvedLoad.show();
            loadResolvedBtn.unbind('click', null);
            $("#export-resolved").unbind('click', null);

            var resolvedTable = document.querySelector("#resolved-feedback-list tbody");

            smeModule.smeFactory.getResolvedFeedbacks($.Deferred(), $.ajax, $('#lang-selector-new').find(":selected").val(), $('#type-selector-new').find(":selected").val()).then(function (data) {
                countModel.updateResolvedCount(null, data.feedbacks.length);
                resolvedLoad.hide();
                resolvedFeedbackQuery = data.query;

                if (data.feedbacks.length) {
                    data.feedbacks.map(function (feedback) {
                        buildTableBody(feedback);
                        // sortable(document.getElementById("resolved-feedback-list"), y);
                    });
                } else {
                    buildTableBody({
                        "Empty": "No data"
                    });
                }

                $("#export-resolved").click(function () {
                    var l = Ladda.create(document.querySelector("#export-resolved"));
                    l.start();
                    smeModule.smeFactory.exportData($.Deferred(), $.ajax, resolvedFeedbackQuery, 'resolved').then(function (result) {
                        var  a = document.createElement('a');
                        a.href = ['/downloadFile?name=', result].join('');
                        a.style.display = 'none';
                        a.setAttribute('download', '');
                        document.body.appendChild(a);
                        a.click();
                        l.stop();
                    }, function (err) {
                        buildToastr({
                            "message": err
                        });
                        l.stop();
                        console.log(err);
                    });
                });

            }, function (err) {
                console.log(err);
                buildToastr({
                    "message": err
                });
                resolvedLoad.hide();
            });
        }

        //SCORE CARD SESSION
        function buildMetric (context, month) {
            var outerSpan = document.createElement('span'),
                headerTitle = document.createElement('header'),
                monthTable = document.createElement('table'),
                monthTableHead = document.createElement('thead'),
                monthTableHeadRow = document.createElement('tr'),
                monthTableBody = document.createElement('tbody'),
                monthTableBodyRow = document.createElement('tr'),
                actionTableBodyRow = document.createElement('tr'),
                totalDiv = document.createElement('div'),
                feedbackCount = 0,
                resolvedCount = 0;


            month.dates.map(function (week) {
                var th = document.createElement('th'),
                    td = document.createElement('td');
                th.appendChild(document.createTextNode(week.week));
                monthTableHeadRow.appendChild(th);

                if (context !== "dialogCount") {
                    td.appendChild(document.createTextNode(week.count));
                    monthTableBodyRow.appendChild(td);
                    feedbackCount += Number(week.count);
                } else {
                    td.appendChild(document.createTextNode(week[week.week].mappedDialogCount));
                    monthTableBodyRow.appendChild(td);
                    feedbackCount += Number(week[week.week].mappedDialogCount);
                    resolvedCount += Number(week[week.week].resolvedCount) || 0;
                    var actionTd = document.createElement('td'),
                        actionWrapper = document.createElement('div'),
                        actionInput = document.createElement('input'),
                        actionButton = document.createElement('button');

                    actionButton.setAttribute('class', 'ladda-button');
                    actionButton.setAttribute('data-style', 'zoom-in');
                    actionButton.setAttribute('data-size', 'xs');
                    actionButton.appendChild(document.createTextNode('x'));

                    actionButton.addEventListener('click', function () {

                        var l = Ladda.create(this);
                        l.start();

                        // if (Number(actionInput.value) <= Number(week[week.week].resolvedCount)) {
                        //     l.stop();
                        //     return buildToastr({
                        //         "message": "Invalid input value"
                        //     });
                        // }

                        var feedback = {
                            "year": periodModel.getYear(),
                            "quarter": periodModel.getQuarter(),
                            "week": week.week,
                            "resolvedCount": Number(actionInput.value)
                        };

                        smeModule.smeFactory.takeDialogAction($.Deferred(), $.ajax, feedback, $('#lang-selector-new').find(":selected").val() || countrySuffix).then(function (data) {
                            l.stop();
                            buildToastr({
                                "message": "Successfully updated"
                            });
                            buildTotalBox('dialogCount', [totalsCount.dialog.getTotal('total'), (totalsCount.dialog.getTotal('resolved') - resolvedCount) + data.resolvedCount].join('/'));
                            totalDiv.innerText = ['Total: ', feedbackCount, ' / Resolved: ', data.resolvedCount].join('');
                        }, function (err) {
                            l.stop();
                            return buildToastr({
                                "message": err
                            });
                        });

                    });

                    actionInput.setAttribute('type', 'number');
                    actionInput.value = week[week.week].resolvedCount || 0;

                    actionWrapper.appendChild(actionInput);
                    actionWrapper.appendChild(actionButton);
                    actionTd.appendChild(actionWrapper);
                    actionTableBodyRow.appendChild(actionTd);
                }
            });

            monthTableBody.appendChild(monthTableBodyRow);
            if (context === 'dialogCount') {
                monthTableBody.appendChild(actionTableBodyRow);
            }

            monthTableHead.appendChild(monthTableHeadRow);
            monthTable.appendChild(monthTableHead);
            monthTable.appendChild(monthTableBody);

            headerTitle.appendChild(document.createTextNode(translateMonth(month.month)));

            if (context === 'total') {
                totalDiv.appendChild(document.createTextNode(['Total: ', feedbackCount].join('')));
            } else if (context === 'dialogCount') {
                totalDiv.appendChild(document.createTextNode(['Total: ', feedbackCount, ' / Resolved: ', resolvedCount].join('')));
            } else {
                totalDiv.appendChild(document.createTextNode(['Sub-total: ', feedbackCount].join('')));
            }

            outerSpan.appendChild(headerTitle);
            outerSpan.appendChild(monthTable);
            outerSpan.appendChild(totalDiv);

            $(["#", context, "-wrapper"].join('')).append(outerSpan);

            if (context === "dialogCount") {
                return {
                    "totalCount": feedbackCount,
                    "actionTakenCount": resolvedCount
                }
            }

            return feedbackCount;
        }

        (function populateDate () {
            yearSelector.val(periodModel.getYear()).change();
            quarterSelector.val(periodModel.getQuarter()).change();

            yearSelector.on('change', function () {
                periodModel.setYear($(this).val());
            });

            quarterSelector.on('change', function () {
                periodModel.setQuarter($(this).val());
            });

            var regex = new RegExp(/([@])\w+/i),
                countrySuffix = regex.exec(document.querySelector("#username").innerText)[0].slice(1, 3);
            scorecardLanguageSelector.val(countrySuffix === 'br' ? 1 : 2).change();

            scorecardLanguageSelector.on('change', function () {
                periodModel.setLanguage($(this).val());
            });
        }());

        function buildMetricsHeader (context, value) {
            $(['#', context, '-header'].join('')).text(value);
        }

        function buildTotalBox (context, value) {
            var wrapper = $(["#", context, "-wrapper"].join(''));
            wrapper.find('.totals').remove();
            var div = document.createElement('div');
            div.setAttribute('class', 'totals');
            div.appendChild(document.createTextNode(value));
            wrapper.append(div);
        }


        var menu = $("#menu"),
            sideMenu = $("#side-menu");

        menu.click(function toggleMenu() {
            sideMenu.toggle();
        });

        $('[data-tab]').on('click', function (e) {
            e.preventDefault();
            $(this).addClass('active').siblings('.tab').removeClass('active');
            $('#main [' + ['data-content=', $(this).data('tab'), ']'].join('')).addClass('active').siblings('[data-content]').removeClass('active');
        });

        resolvedSearchInput.keyup(function () {
            if (!$(this).val()) {
                $(".active table tbody tr").each(function () {
                    $(this).show();
                });
            } else {
                var searchString = new RegExp(resolvedSearchInput.val().toLowerCase(), 'g'),
                    flag,
                    control = false,
                    filterString = 'td.sort';
                $(".active table tbody tr").each(function () {
                    var currentTr = $(this);
                    flag = false;
                    $(this).find(filterString).each(function () {
                        if ($(this).text().toLowerCase().match(searchString)) {
                            flag = true;
                        }
                        if (flag) {
                            currentTr.show();
                            control = true;
                        } else {
                            currentTr.hide();
                        }

                    });
                });

                if (!control) {
                    console.log('no results found');
                }
            }
        });

        (function buildCountryOption () {
            var regex = new RegExp(/([@])\w+/i);

            searchType = $('#type-selector-new').find(":selected").val();
            countrySuffix = regex.exec(document.querySelector("#username").innerText)[0].slice(1, 3);
            languageSelector = document.querySelector("#lang-selector-new");

            while (languageSelector.hasChildNodes()) {
                languageSelector.removeChild(languageSelector.lastChild);
            }

            var ptOption = document.createElement('option'),
                ssaOption = document.createElement('option');

            ptOption.setAttribute('value', 'br');
            ptOption.appendChild(document.createTextNode('Brazil'));
            ssaOption.setAttribute('value', 'ssa');
            ssaOption.appendChild(document.createTextNode('SSA'));

            if (countrySuffix === 'br') {
                ptOption.setAttribute('selected', '');
            } else {
                ssaOption.setAttribute('selected', '');
            }

            languageSelector.appendChild(ptOption);
            languageSelector.appendChild(ssaOption);

            buildNewFeedbacksTable();
            buildResolvedFeedbacksTable();
            buildSMEMetrics();
        }());


        searchInput.keyup(function () {
            if (!$(this).val()) {
                $(".active table tbody tr").each(function () {
                    $(this).show();
                });
            } else {
                var searchString = new RegExp(searchInput.val().toLowerCase(), 'g'),
                    flag,
                    control = false,
                    filterString = 'td.sort';
                $(".active table tbody tr").each(function () {
                    var currentTr = $(this);
                    flag = false;
                    $(this).find(filterString).each(function () {
                        if ($(this).text().toLowerCase().match(searchString)) {
                            flag = true;
                        }
                        if (flag) {
                            currentTr.show();
                            control = true;
                        } else {
                            currentTr.hide();
                        }
                    });
                });

                if (!control) {
                    console.log('no results found');
                }
            }
        });

    });


}(window.document));