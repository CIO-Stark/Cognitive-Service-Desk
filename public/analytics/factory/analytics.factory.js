/**
 * Created by leonim on 20/03/2017.
 */

(function () {
    "use strict";

    module.exports = function ($) {

        return {
            "getMetricsByRange": function (startDate, endDate) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        "method": "POST",
                        "url": "/timeFilter",
                        "data": {
                            "startDate": startDate,
                            "endDate": endDate
                        },
                        "success": function (data) {
                            resolve(data);
                        },
                        "error": function (err) {
                            reject(err);
                        }
                    });

                });

            }

        };
    };

}());