/**
 * Created by danielabrao on 10/10/16.
 */
(function () {
    "use strict";

    module.exports = function generateLog(params) {
        var log = {
            data: params.logArr,
            date: new Date().toISOString().slice(0, 19).replace("T", " "),
            action: params.action
        };

        return new Promise(function (resolve, reject) {
            params.db.insert(log, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve("success");
                }
            });
        });
    };

}());