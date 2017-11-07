/**
 * Created by danielabrao on 7/13/16.
 */
module.exports = function smeModule() {
    "use strict";

    var smeFactory = {
        getSecondaryActions: function (q, ajax, type) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: ["/getSecondaryActions?type=", type].join(''),
                type: 'get',
                success: function (data) {
                    q.resolve(data);
                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        getFeedbacks: function (q, ajax, country, type) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: ["/getFeedbacks?country=", country, '&type=', type].join(''),
                type: 'get',
                success: function (data) {
                    q.resolve(data);
                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        getResolvedFeedbacks: function (q, ajax, country, type) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: ["/getResolvedFeedbacks?country=", country, '&type=', type].join(''),
                type: 'get',
                success: function (data) {
                    q.resolve(data);
                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        getMetrics: function (q, ajax, options) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: ["/calendarTest?year=", options.year, '&quarter=', options.quarter, '&type=', options.type, '&language=', options.language].join(''),
                type: 'get',
                success: function (data) {
                    q.resolve(data);
                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        exportData: function (q, ajax, query, context) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: context === 'backlog' ? "/saveBacklog" : '/saveActionTaken',
                type: 'post',
                data: {
                    querystring: query
                },
                success: function (data) {
                    q.resolve(data);
                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        exportScorecard: function (q, ajax, data) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: '/saveScorecard',
                type: 'post',
                data: {
                    x: data
                },
                success: function (data) {
                    q.resolve(data);
                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        takeAction: function (q, ajax, action) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: "/takeAction",
                type: 'post',
                data: {
                    "feedback": action
                },
                success: function (data) {
                    console.log(data);
                    q.resolve(data);

                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        getDialogCount: function (q, ajax, dates, language) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: "/getDialogCount",
                type: 'post',
                data: {
                    "dates": dates,
                    "language": language
                },
                success: function (data) {
                    console.log(data);
                    q.resolve(data);

                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        },
        takeDialogAction: function (q, ajax, feedback, language) {
            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: "/takeDialogAction",
                type: 'post',
                data: {
                    "feedback": feedback,
                    "language": language
                },
                success: function (data) {
                    console.log(data);
                    q.resolve(data);

                },
                error: function (err) {
                    q.reject(err.responseText);
                }
            });
            return q.promise();
        }
    };

    return {
        smeFactory: smeFactory
    };

};