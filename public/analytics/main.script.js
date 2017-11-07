/**
 * Created by leonim on 21/03/2017.
 */

(function (document) {
    "use strict";

    var chart = require('chart.js'),
        $ = require('jquery'),
        flatpickr = require('flatpickr'),
        sugar = require("sugar"),
        factory = require("./factory/analytics.factory")($);


    //new flatpickr("#calendar");
    // $(".calendar").flatpickr(); // jQuery

    var props = {
        "range": "",
        // days feedback
        "processedRange": {
            "pt": {},
            "es": {},
            "access": {}
        },
        // weeks feedback
        "processedWeeks": {
            "pt": {},
            "es": {},
            "access": {}
        },
        // month feedback
        "processedMonths": {
            "pt": {},
            "es": {},
            "access": {}
        }
    };

    var cacheData = {
        "intents": [],
        "daysLabels": [],
        "weeksLabels": [],
        "monthsLabels": [],
        "daysValues": {
            "es": {
                "feedbacks": {
                    "negative": [],
                    "positive": [],
                    "computed": []
                }
            },
            "pt": {
                "feedbacks": {
                    "negative": [],
                    "positive": [],
                    "computed": []
                }
            },
            "access": {}
        },
        "weeksValues": {
            "es": {
                "feedbacks": {
                    "negative": [],
                    "positive": [],
                    "computed": []
                }
            },
            "pt": {
                "feedbacks": {
                    "negative": [],
                    "positive": [],
                    "computed": []
                }
            },
            "access": {}
        },
        "monthsValues": {
            "es": {
                "feedbacks": {
                    "negative": [],
                    "positive": [],
                    "computed": []
                }
            },
            "pt": {
                "feedbacks": {
                    "negative": [],
                    "positive": [],
                    "computed": []
                }
            },
            "access": {}
        }
    };

    var elements = {
        "startDateInput": "",
        "endDateInput": "",
        "queryButton": "",
        "graphTest": "",
        "builtCharts": {}
    };

    var builder = {
        "buildGraphModel": function (graphElement, configs) {
            return new Chart(graphElement, configs);
        },
        "cleanGraphModel": function (configs) {
            configs.element.destroy();
            return configs.element;
        },
        "buildStackGraph": function (dimension, configs) {
            var context = methods.getContext(dimension),
                chartContainer = configs.parent;
            if (elements.builtCharts[chartContainer.attr("id")]) {
                builder.cleanGraphModel({
                    "element": elements.builtCharts[chartContainer.attr("id")]
                });
            }

            // many datasets. One for each intent
            var datasets = [];

            for (var m = 0; m < configs.intents.length; m += 1) {
                //iterate over all intents
                var data = [];
                for (var i = 0; i < context.contextData.pt.intents.length; i += 1) {
                    //iterate over all days intents
                    var found = false;
                    for (var j = 0; j < context.contextData.pt.intents[i].labels.length; j += 1) {
                        //iterate over all intents of the day
                        if (configs.intents[m] === context.contextData.pt.intents[i].labels[j]) {
                            found = true;
                            data.push(context.contextData.pt.intents[i].values[j]);
                        }
                    }

                    if (!found) {
                        data.push(0);
                    }
                }

                //random colors?

                datasets.push({
                    "label": configs.intents[m],
                    "type": "bar",
                    "data": data,
                    "backgroundColor": methods.getRandomColor()
                });
            }


            //build the chart on the screen using the handled data
            elements.builtCharts[chartContainer.attr("id")] = new Chart(chartContainer, {
                "type": "bar",
                "data": {
                    "labels": context.contextLabels,
                    "datasets": datasets
                },
                "options": {
                    "responsive": true,
                    "maintainAspectRatio": true,
                    "scales": {
                        "yAxes": [{
                            "stacked": true,
                            "ticks": {
                                "min": 0
                            }
                        }]
                    }
                }
            });
        },
        "TESTGRAPH": function (dimension, configs) {
            var context;
            if (dimension === "day") {
                context = props.processedRange.access;
            } else if (dimension === "week") {
                context = props.processedWeeks.access;
            } else {
                context = props.processedMonths.access;
            }

            var chartContainer = configs.parent;
            if (elements.builtCharts[chartContainer.attr("id")]) {
                builder.cleanGraphModel({
                    "element": elements.builtCharts[chartContainer.attr("id")]
                });
            }

            var values = [],
                labels = [],
                datasets = [];

            for (var prop in context) {
                if (context.hasOwnProperty(prop)) {
                    labels.push(prop);
                    for (var metric in context[prop]) {
                        if (context[prop].hasOwnProperty(metric)) {
                            if (metric !== "month" && metric !== "week" && metric !== "total") {
                                values.push(metric);
                            }
                        }
                    }
                }
            }
            values = sugar.Array(values).unique().raw;
            values = values.sort();
            for (var i = 0; i < values.length; i += 1) {
                var data = [];

                for (var j = 0; j < labels.length; j += 1) {
                    data.push((context[labels[j]][values[i]]) || 0);
                }

                datasets.push({
                    "label": values[i],
                    "type": "bar",
                    "data": data,
                    "backgroundColor": methods.getRandomColor()
                });

            }

            elements.builtCharts[chartContainer.attr("id")] = new Chart(chartContainer, {
                "type": "bar",
                "data": {
                    "labels": labels,
                    "datasets": datasets
                },
                "options": {
                    "responsive": true,
                    "maintainAspectRatio": true,
                    "scales": {
                        "yAxes": [{
                            "stacked": true,
                            "ticks": {
                                "min": 0
                            }
                        }]
                    }
                }
            });



        },
        "buildDoughnutGraph": function (dimension, configs) {
            var context = methods.getContext(dimension),
                chartContainer = configs.parent;

            if (elements.builtCharts[chartContainer.attr("id")]) {
                builder.cleanGraphModel({
                    "element": elements.builtCharts[chartContainer.attr("id")]
                });
            }

            elements.builtCharts[chartContainer.attr("id")] = builder.buildGraphModel(chartContainer, {
                "type": "doughnut",
                "data": {
                    "labels": configs.label,
                    "datasets": [
                        {
                            "data": [sugar.Array(context.contextData[configs.locale].platforms.mobile).sum(), sugar.Array(context.contextData[configs.locale].platforms.web).sum()],
                            "backgroundColor": [
                                "#FF6384",
                                "#36A2EB"
                            ],
                            "hoverBackgroundColor": [
                                "#FF6384",
                                "#36A2EB"
                            ]
                        }]
                },
                "options": {
                    "responsive": true,
                    "maintainAspectRatio": true,
                    "cutoutPercentage": 40
                }
            });
        },
        "buildLineGraph": function (dimension, configs) {
            var context = methods.getContext(dimension),
                chartContainer = configs.parent,
                ptDataset,
                esDataset;

            if (!context || !chartContainer) {
                return;
            }

            if (configs.type === "feedback") {
                ptDataset = context.contextData.pt.feedbacks.computed;
                esDataset = context.contextData.es.feedbacks.computed;
            } else if (configs.type === "confidence") {
                ptDataset = context.contextData.pt.confidence;
                esDataset = context.contextData.es.confidence;
            }

            elements.builtCharts[chartContainer.attr("id")] = builder.buildGraphModel(chartContainer, {
                "type": "line",
                "data": {
                    "labels": context.contextLabels,
                    "datasets": [{
                        "label": "PT",
                        "data": ptDataset,
                        "backgroundColor": [
                            'rgba(7, 213, 41, 0.4)'
                        ],
                        "borderColor": [
                            'rgba(7, 213, 41, 1)'
                        ],
                        "borderWidth": 1
                    }, {
                        "label": "ES",
                        "data": esDataset,
                        "backgroundColor": [
                            'rgba(255, 0, 0, 0.4)'
                        ],
                        "borderColor": [
                            'rgba(255, 0, 0, 1)'
                        ],
                        "borderWidth": 1
                    }]
                },
                "options": {
                    "responsive": true,
                    "maintainAspectRatio": true,
                    "scales": {
                        "yAxes": [{
                            "ticks": {
                                "min": 0,
                                "max": 100
                            }
                        }]
                    }
                }
            });
        }
    };

    var methods = {
        "getRandomColor": function () {
            var letters = "0123456789ABCDEF";
            var color = "#";
            for (var i = 0; i < 6; i += 1) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        "getContext": function (dimension) {
            var context = {};

            if (dimension === "day") {
                context.contextLabels = cacheData.daysLabels;
                context.contextData = cacheData.daysValues;
            } else if (dimension === "week") {
                context.contextLabels = cacheData.weeksLabels;
                context.contextData = cacheData.weeksValues;
            } else {
                context.contextLabels = cacheData.monthsLabels;
                context.contextData = cacheData.monthsValues;
            }
            return context;
        },
        "reinitializeEnv": function () {
            props = {
                "processedRange": {
                    "pt": {},
                    "es": {},
                    "access": {}
                },
                "processedMonths": {
                    "pt": {},
                    "es": {},
                    "access": {}
                },
                "processedWeeks": {
                    "pt": {},
                    "es": {},
                    "access": {}
                },
                "daysLabels": [],
                "weeksLabels": [],
                "monthsLabels": []
            };

            cacheData = {
                "intents": [],
                "countries":[],
                "daysLabels": [],
                "weeksLabels": [],
                "monthsLabels": [],
                "daysValues": {
                    "es": {
                        "feedbacks": {
                            "negative": [],
                            "positive": [],
                            "computed": []
                        },
                        "platforms": {
                            "web": [],
                            "mobile": []
                        },
                        "confidence": [],
                        "intents": []
                    },
                    "pt": {
                        "feedbacks": {
                            "negative": [],
                            "positive": [],
                            "computed": []
                        },
                        "platforms": {
                            "web": [],
                            "mobile": []
                        },
                        "confidence": [],
                        "intents": []
                    },
                    "access":{}
                },
                "weeksValues": {
                    "es": {
                        "feedbacks": {
                            "negative": [],
                            "positive": [],
                            "computed": []
                        },
                        "platforms": {
                            "web": [],
                            "mobile": []
                        },
                        "confidence": [],
                        "intents": []
                    },
                    "pt": {
                        "feedbacks": {
                            "negative": [],
                            "positive": [],
                            "computed": []
                        },
                        "platforms": {
                            "web": [],
                            "mobile": []
                        },
                        "confidence": [],
                        "intents": []
                    },
                    "access":{}
                },
                "monthsValues": {
                    "es": {
                        "feedbacks": {
                            "negative": [],
                            "positive": [],
                            "computed": []
                        },
                        "platforms": {
                            "web": [],
                            "mobile": []
                        },
                        "confidence": [],
                        "intents": []
                    },
                    "pt": {
                        "feedbacks": {
                            "negative": [],
                            "positive": [],
                            "computed": []
                        },
                        "platforms": {
                            "web": [],
                            "mobile": []
                        },
                        "confidence": [],
                        "intents": []

                    },
                    "access": {}
                }
            };
        },
        "processValues": function (locale) {

            var negativeCount,
                positiveCount,
                webPlatform,
                mobilePlatform,
                confidence,
                intentLabels,
                country,
                intentValues;

            var i = 0;

            for (var day in props.processedRange[locale]) {
                if (props.processedRange[locale].hasOwnProperty(day)) {
                    negativeCount = props.processedRange[locale][day].feedback.negative;
                    positiveCount = props.processedRange[locale][day].feedback.positive;


                    webPlatform = props.processedRange[locale][day].platform.web;
                    mobilePlatform = props.processedRange[locale][day].platform.mobile;
                    confidence = (props.processedRange[locale][day].confidence / (positiveCount + negativeCount) || 0);
                    intentLabels = [];
                    intentValues = [];

                    cacheData.daysValues[locale].feedbacks.negative.push(props.processedRange[locale][day].feedback.negative);
                    cacheData.daysValues[locale].feedbacks.positive.push(props.processedRange[locale][day].feedback.positive);
                    cacheData.daysValues[locale].feedbacks.computed.push((((positiveCount / (negativeCount + positiveCount) || 0)) * 100).toFixed(2));
                    cacheData.daysValues[locale].platforms.web.push(webPlatform);
                    cacheData.daysValues[locale].platforms.mobile.push(mobilePlatform);
                    cacheData.daysValues[locale].confidence.push((confidence).toFixed(2));

                    for (var intent in props.processedRange[locale][day].intents) {
                        if (props.processedRange[locale][day].intents.hasOwnProperty(intent)) {
                            cacheData.intents.push(intent);
                            intentLabels.push(intent || "N/A");
                            intentValues.push(props.processedRange[locale][day].intents[intent] || 0);
                        }
                    }

                    cacheData.daysValues[locale].intents.push({
                        labels: intentLabels,
                        values: intentValues
                    });

                }
            }

            for (var week in props.processedWeeks[locale]) {
                if (props.processedWeeks[locale].hasOwnProperty(week)) {
                    negativeCount = props.processedWeeks[locale][week].feedback.negative;
                    positiveCount = props.processedWeeks[locale][week].feedback.positive;
                    webPlatform = props.processedWeeks[locale][week].platform.web;
                    mobilePlatform = props.processedWeeks[locale][week].platform.mobile;
                    confidence = (props.processedWeeks[locale][week].confidence / (positiveCount + negativeCount) || 0);
                    intentLabels = [];
                    intentValues = [];

                    cacheData.weeksValues[locale].feedbacks.negative.push(props.processedWeeks[locale][week].feedback.negative);
                    cacheData.weeksValues[locale].feedbacks.positive.push(props.processedWeeks[locale][week].feedback.positive);
                    cacheData.weeksValues[locale].feedbacks.computed.push((((positiveCount / (negativeCount + positiveCount) || 0)) * 100).toFixed(2));
                    cacheData.weeksValues[locale].platforms.web.push(webPlatform);
                    cacheData.weeksValues[locale].platforms.mobile.push(mobilePlatform);
                    cacheData.weeksValues[locale].confidence.push((confidence).toFixed(2));

                    for (var intent in props.processedWeeks[locale][week].intents) {
                        if (props.processedWeeks[locale][week].intents.hasOwnProperty(intent)) {

                            intentLabels.push(intent || "N/A");
                            intentValues.push(props.processedWeeks[locale][week].intents[intent] || 0);
                        }
                    }

                    cacheData.weeksValues[locale].intents.push({
                        labels: intentLabels,
                        values: intentValues
                    });
                }
            }

            for (var month in props.processedMonths[locale]) {
                if (props.processedMonths[locale].hasOwnProperty(month)) {
                    negativeCount = props.processedMonths[locale][month].feedback.negative;
                    positiveCount = props.processedMonths[locale][month].feedback.positive;
                    webPlatform = props.processedMonths[locale][month].platform.web;
                    mobilePlatform = props.processedMonths[locale][month].platform.mobile;
                    confidence = (props.processedMonths[locale][month].confidence / (positiveCount + negativeCount) || 0);
                    intentLabels = [];
                    intentValues = [];

                    cacheData.monthsValues[locale].feedbacks.negative.push(negativeCount);
                    cacheData.monthsValues[locale].feedbacks.positive.push(positiveCount);
                    cacheData.monthsValues[locale].feedbacks.computed.push((((positiveCount / (negativeCount + positiveCount) || 0)) * 100).toFixed(2));
                    cacheData.monthsValues[locale].platforms.web.push(webPlatform);
                    cacheData.monthsValues[locale].platforms.mobile.push(mobilePlatform);
                    cacheData.monthsValues[locale].confidence.push((confidence).toFixed(2));

                    for (var intent in props.processedMonths[locale][month].intents) {
                        if (props.processedMonths[locale][month].intents.hasOwnProperty(intent)) {

                            intentLabels.push(intent || "N/A");
                            intentValues.push(props.processedMonths[locale][month].intents[intent] || 0);
                        }
                    }

                    cacheData.monthsValues[locale].intents.push({
                        labels: intentLabels,
                        values: intentValues
                    });

                }
            }

            negativeCount = "";
            positiveCount = "";
            confidence = "";

            return this;
        },
        "processLabels": function () {

            for (var day in props.processedRange.pt) {
                if (props.processedRange.pt.hasOwnProperty(day)) {
                    cacheData.daysLabels.push(day);
                }
            }

            for (var week in props.processedWeeks.pt) {
                if (props.processedWeeks.pt.hasOwnProperty(week)) {
                    cacheData.weeksLabels.push(sugar.Date(props.processedWeeks.pt[week].weekInit).format("{MM}/{dd}/{year}").raw);
                }
            }

            for (var month in props.processedMonths.pt) {
                if (props.processedMonths.pt.hasOwnProperty(month)) {
                    cacheData.monthsLabels.push(month);
                }
            }

            return this;

        },
        "defineRange": function (initialRange) {
            for (var d = new Date(initialRange.start); d <= new Date(initialRange.end); d.setDate(d.getDate() + 1)) {
                var manipulatedDate = (sugar.Object.clone(sugar.Date(d).format("{MM}/{dd}/{year}").raw, true));
                console.log(manipulatedDate);
                props.processedRange.pt[manipulatedDate] = {
                    "week": sugar.Date.getISOWeek(d),
                    "month": sugar.Date(d).format("{Month}").raw,
                    "intents": {},
                    "language": {
                        "pt": 0,
                        "es": 0
                    },
                    "platform": {
                        "web": 0,
                        "mobile": 0
                    },
                    "feedback": {
                        "negative": 0,
                        "positive": 0
                    },
                    "confidence": 0
                };

                props.processedRange.es[manipulatedDate] = {
                    "week": sugar.Date.getISOWeek(d),
                    "month": sugar.Date(d).format("{Month}").raw,
                    "intents": {},
                    "language": {
                        "pt": 0,
                        "es": 0
                    },
                    "platform": {
                        "web": 0,
                        "mobile": 0
                    },
                    "feedback": {
                        "negative": 0,
                        "positive": 0
                    },
                    "confidence": 0
                };

                props.processedRange.access[manipulatedDate] = {
                    "week": sugar.Date.getISOWeek(d),
                    "month": sugar.Date(d).format("{Month}").raw,
                    "total": 0
                };
            }
            console.log("ALL DAYS FROM PT");
            console.log(props.processedRange["pt"]);
            console.log("ALL DAYS FROM ES");
            console.log(props.processedRange["es"]);
            console.log("ALL DAYS WITH ACCESS");
            console.log(props.processedRange["access"]);

            return this;
        },
        "processAccess": function (range) {
            range = range || props.processedRange;
            for (var day in range.access) {
                if (range.access.hasOwnProperty(day)) {
                    for (var country in range.access[day]) {
                        if (range.access[day].hasOwnProperty(country)) {
                            if (country !== "week" && country !== "month") {

                                if (props.processedMonths.access[range.access[day].month].hasOwnProperty(country)) {
                                    props.processedMonths.access[range.access[day].month][country] += range.access[day][country] || 0;
                                } else {
                                    props.processedMonths.access[range.access[day].month][country] = range.access[day][country] || 0;
                                }

                                if (props.processedWeeks.access[range.access[day].week].hasOwnProperty(country)) {
                                    props.processedWeeks.access[range.access[day].week][country] += range.access[day][country] || 0;
                                } else {
                                    props.processedWeeks.access[range.access[day].week][country] = range.access[day][country] || 0;
                                }

                            }
                        }
                    }



                }

            }

            return this;
        },
        "processMonth": function (locale, range) {
            range = range || props.processedRange;
            for (var day in range[locale]) {
                if (range[locale].hasOwnProperty(day)) {
                    if (props.processedMonths[locale].hasOwnProperty(range[locale][day].month)) {

                        props.processedMonths[locale][range[locale][day].month].monthInit = sugar.Date(day).beginningOfMonth().raw;
                        props.processedMonths[locale][range[locale][day].month].language.pt += range[locale][day].language.pt || 0;
                        props.processedMonths[locale][range[locale][day].month].language.es += range[locale][day].language.es || 0;
                        props.processedMonths[locale][range[locale][day].month].platform.web += range[locale][day].platform.web || 0;
                        props.processedMonths[locale][range[locale][day].month].platform.mobile += range[locale][day].platform.mobile || 0;
                        props.processedMonths[locale][range[locale][day].month].feedback.negative += range[locale][day].feedback.negative || 0;
                        props.processedMonths[locale][range[locale][day].month].feedback.positive += range[locale][day].feedback.positive || 0;
                        props.processedMonths[locale][range[locale][day].month].confidence += range[locale][day].confidence || 0;
                        props.processedMonths[locale][range[locale][day].month].dayCount += 1;
                    } else {
                        props.processedMonths[locale][range[locale][day].month] = {
                            "dayCount": 1,
                            "language": {
                                "pt": range[locale][day].language.pt || 0,
                                "es": range[locale][day].language.es || 0
                            },
                            "platform": {
                                "web": range[locale][day].platform.web || 0,
                                "mobile": range[locale][day].platform.mobile || 0
                            },
                            "feedback": {
                                "positive": range[locale][day].feedback.positive || 0,
                                "negative": range[locale][day].feedback.negative || 0
                            },
                            "intents": {},
                            "confidence": range[locale][day].confidence || 0
                        };
                    }
                    props.processedMonths.access[range.access[day].month] = {
                        "total": 0
                    };
                    for (var intent in range[locale][day].intents) {
                        if (range[locale][day].intents.hasOwnProperty(intent)) {
                            if (props.processedMonths[locale][range[locale][day].month].intents.hasOwnProperty(intent)) {
                                props.processedMonths[locale][range[locale][day].month].intents[intent] += range[locale][day].intents[intent] || 0;
                            } else {
                                props.processedMonths[locale][range[locale][day].month].intents[intent] = range[locale][day].intents[intent] || 0;
                            }
                        }
                    }
                }
            }

            return this;
        },
        "processWeeks": function (locale, range) {
            range = range || props.processedRange;

            for (var day in range[locale]) {
                if (range[locale].hasOwnProperty(day)) {
                    if (props.processedWeeks[locale].hasOwnProperty(range[locale][day].week)) {
                        props.processedWeeks[locale][range[locale][day].week].weekInit = sugar.Date(day).beginningOfISOWeek().raw;
                        props.processedWeeks[locale][range[locale][day].week].language.pt += range[locale][day].language.pt || 0;
                        props.processedWeeks[locale][range[locale][day].week].language.es += range[locale][day].language.es || 0;
                        props.processedWeeks[locale][range[locale][day].week].platform.web += range[locale][day].platform.web || 0;
                        props.processedWeeks[locale][range[locale][day].week].platform.mobile += range[locale][day].platform.mobile || 0;
                        props.processedWeeks[locale][range[locale][day].week].feedback.negative += range[locale][day].feedback.negative || 0;
                        props.processedWeeks[locale][range[locale][day].week].feedback.positive += range[locale][day].feedback.positive || 0;
                        props.processedWeeks[locale][range[locale][day].week].confidence += range[locale][day].confidence || 0;
                        props.processedWeeks[locale][range[locale][day].week].dayCount += 1;
                    } else {
                        props.processedWeeks[locale][range[locale][day].week] = {
                            "dayCount": 1,
                            "language": {
                                "pt": range[locale][day].language.pt || 0,
                                "es": range[locale][day].language.es || 0
                            },
                            "platform": {
                                "web": range[locale][day].platform.web || 0,
                                "mobile": range[locale][day].platform.mobile || 0
                            },
                            "feedback": {
                                "positive": range[locale][day].feedback.positive || 0,
                                "negative": range[locale][day].feedback.negative || 0
                            },
                            "intents": {},
                            "confidence": range[locale][day].confidence || 0,
                            "access": {}
                        }
                    }
                    props.processedWeeks.access[range.access[day].week] = {
                        "total": 0
                    };
                    for (var intent in range[locale][day].intents) {
                        if (range[locale][day].intents.hasOwnProperty(intent)) {
                            if (props.processedWeeks[locale][range[locale][day].week].intents.hasOwnProperty(intent)) {
                                props.processedWeeks[locale][range[locale][day].week].intents[intent] += range[locale][day].intents[intent] || 0;
                            } else {
                                props.processedWeeks[locale][range[locale][day].week].intents[intent] = range[locale][day].intents[intent] || 0;
                            }
                        }
                    }
                }
            }

            return this;
        },
        "queryMetrics": function (event) {

            var startDate = elements.startDateInput.val() || "",
                endDate = elements.endDateInput.val() || "";

            if (!startDate || !endDate) {
                console.log("Can not proceed without start and end date");
                return false;
            }

            methods.reinitializeEnv();

            props.range = sugar.Date.range(startDate, endDate);
            factory.getMetricsByRange(startDate, endDate).then(function (metricsData) {
                console.log("INITIAL OBJECT: ");
                console.log(metricsData);
                methods.defineRange(props.range);
                if (Array.isArray(metricsData.feedback)) {

                    // itera os documentos de feedback
                    metricsData.feedback.forEach(function (feedback) {

                        // obtem o dia do documento
                        var manipulated = sugar.Date(feedback.timestamp).format("{MM}/{dd}/{year}").raw;

                        // vê se o documento é pt
                        if (feedback.locale === "pt") {

                            // monta o processedRange e seus atributos por nome do dia
                            if (props.processedRange.pt[manipulated].language.hasOwnProperty("pt")) {
                                props.processedRange.pt[manipulated].language.pt += 1;
                            } else {
                                props.processedRange.pt[manipulated].language.pt = 1;
                            }

                            if (props.processedRange.pt[manipulated].intents.hasOwnProperty(feedback.intents)) {
                                props.processedRange.pt[manipulated].intents[feedback.intents] += 1;
                            } else {
                                props.processedRange.pt[manipulated].intents[feedback.intents] = 1;
                            }

                            if (feedback.confidence >= 0) {
                                props.processedRange.pt[manipulated].confidence = (feedback.confidence * 100);
                            }

                            if (feedback.platform === "web") {
                                if (props.processedRange.pt[manipulated].platform.hasOwnProperty("web")) {
                                    props.processedRange.pt[manipulated].platform.web += 1;
                                } else {
                                    props.processedRange.pt[manipulated].platform.web = 1;
                                }
                            } else {
                                if (props.processedRange.pt[manipulated].platform.hasOwnProperty("mobile")) {
                                    props.processedRange.pt[manipulated].platform.mobile += 1;
                                } else {
                                    props.processedRange.pt[manipulated].platform.mobile = 1;
                                }
                            }

                            if (feedback.type === "negative") {
                                if (props.processedRange.pt[manipulated].feedback.hasOwnProperty("negative")) {
                                    props.processedRange.pt[manipulated].feedback.negative += 1;
                                } else {
                                    props.processedRange.pt[manipulated].feedback.negative = 1;
                                }
                            } else {
                                if (props.processedRange.pt[manipulated].feedback.hasOwnProperty("positive")) {
                                    props.processedRange.pt[manipulated].feedback.positive += 1;
                                } else {
                                    props.processedRange.pt[manipulated].feedback.positive = 1;
                                }
                            }

                        } else {
                            //mesma coisa para espanhol

                            if (props.processedRange.es[manipulated].language.hasOwnProperty("es")) {
                                props.processedRange.es[manipulated].language.es += 1;
                            } else {
                                props.processedRange.es[manipulated].language.es = 1;
                            }

                            if (feedback.confidence >= 0) {
                                props.processedRange.es[manipulated].confidence = (feedback.confidence * 100);
                            }

                            if (props.processedRange.es[manipulated].intents.hasOwnProperty(feedback.intents)) {
                                props.processedRange.es[manipulated].intents[feedback.intents] += 1;
                            } else {
                                props.processedRange.es[manipulated].intents[feedback.intents] = 1;
                            }

                            if (feedback.platform === "web") {
                                if (props.processedRange.es[manipulated].platform.hasOwnProperty("web")) {
                                    props.processedRange.es[manipulated].platform.web += 1;
                                } else {
                                    props.processedRange.es[manipulated].platform.web = 1;
                                }
                            } else {
                                if (props.processedRange.es[manipulated].platform.hasOwnProperty("mobile")) {
                                    props.processedRange.es[manipulated].platform.mobile += 1;
                                } else {
                                    props.processedRange.es[manipulated].platform.mobile = 1;
                                }
                            }

                            if (feedback.type === "negative") {
                                if (props.processedRange.es[manipulated].feedback.hasOwnProperty("negative")) {
                                    props.processedRange.es[manipulated].feedback.negative += 1;
                                } else {
                                    props.processedRange.es[manipulated].feedback.negative = 1;
                                }
                            } else {
                                if (props.processedRange.es[manipulated].feedback.hasOwnProperty("positive")) {
                                    props.processedRange.es[manipulated].feedback.positive += 1;
                                } else {
                                    props.processedRange.es[manipulated].feedback.positive = 1;
                                }
                            }
                        }

                    });

                    metricsData.accesses.forEach(function (access) {
                        var manipulated = sugar.Date(access.timestamp).format("{MM}/{dd}/{year}").raw;

                        if (!props.processedRange.access[manipulated].hasOwnProperty("total")) {
                            props.processedRange.access[manipulated].total = 0;
                        }

                        if (access.country) {
                            props.processedRange.access[manipulated].total += 1;
                            if (props.processedRange.access[manipulated].hasOwnProperty(access.country)) {
                                props.processedRange.access[manipulated][access.country] += 1;
                            } else {
                                props.processedRange.access[manipulated][access.country] = 1;
                            }
                        }


                    });

                    methods.processMonth("pt").processMonth("es").processWeeks("pt").processWeeks("es").processLabels().processAccess().processValues("pt").processValues("es");
                    cacheData.intents = sugar.Array(cacheData.intents).unique().raw;
                    localStorage.setItem("test", JSON.stringify(cacheData));

                    builder.buildLineGraph("day", {
                        "parent": elements.feedbackGraph,
                        "type": "feedback"
                    });
                    builder.buildDoughnutGraph("day", {
                        "label": ["Mobile", "Web"],
                        "locale": "pt",
                        "parent": elements.platformGraph
                    });

                    builder.buildDoughnutGraph("day", {
                        "label": ["Mobile", "Web"],
                        "locale": "es",
                        "parent": elements.platformGraphEs
                    });

                    builder.buildLineGraph("day", {
                        "parent": elements.confidenceGraph,
                        "type": "confidence"
                    });

                    builder.buildStackGraph("day", {
                        "parent": elements.intentGraph,
                        "intents": cacheData.intents
                    });

                    builder.TESTGRAPH("day", {
                        "parent": elements.countryGraph
                    });


                } else {
                    throw new Error("Invalid feedback array");
                }

            }, function (err) {
                console.log(err);
            });
        },
        "init": function () {
            elements.startDateInput = $("#startDate");
            elements.endDateInput = $("#endDate");
            elements.queryButton = $("#applyDateButton");
            elements.feedbackGraph = $("#feedback-graph");
            elements.platformGraph = $("#pt-platform-graph");
            elements.platformGraphEs = $("#es-platform-graph");
            elements.confidenceGraph = $("#confidence-graph");
            elements.intentGraph = $("#intent-graph");
            elements.countryGraph = $("#location-graph");


            $("#feedback-filter").on("change", function () {
                builder.buildLineGraph($(this).val() || "day", {
                    "parent": elements.feedbackGraph,
                    "type": "feedback"
                });
            });

            $("#confidence-filter").on("change", function () {
                builder.buildLineGraph($(this).val() || "day", {
                    "parent": elements.confidenceGraph,
                    "type": "confidence"
                });
            });

            $("#intent-filter").on("change", function () {
                builder.buildStackGraph($(this).val() || "day", {
                    "parent": elements.intentGraph,
                    "intents": cacheData.intents
                });
            });
            $("#location-filter").on("change", function () {
                builder.TESTGRAPH($(this).val() || "day", {
                    "parent": elements.countryGraph
                });
            });

            elements.queryButton.on("click", methods.queryMetrics);
        }
    };

    $(document).ready(function () {
        methods.init();
    });


}());