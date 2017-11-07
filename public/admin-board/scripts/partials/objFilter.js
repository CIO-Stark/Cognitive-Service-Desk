/**
 * Created by danielabrao on 10/11/16.
 */
(function () {
    "use strict";
    module.exports = function (data) {
            var filteredData = [];
            data.forEach(function(entry) {
                //check/set user entry on filteredData
                var userExists = false;
                filteredData.forEach(function (filtered) {
                    if (filtered.USERID === entry.USERID) {
                        userExists = true;
                    }
                });
                if (!userExists) {
                    filteredData.push({USERID: entry.USERID, QUESTION: [], rowID: [], language: entry.LANGUAGE});
                }

                //check/set user problems on filteredData
                filteredData.forEach(function (filtered) {
                    if (filtered.USERID === entry.USERID) {
                        var problemExists = false;
                        filtered.QUESTION.forEach(function (QUESTION) {
                            if (QUESTION === entry.QUESTION) {
                                problemExists = true;
                            }
                        });
                        if (!problemExists) {
                            filtered.QUESTION.push(entry.QUESTION);
                            filtered.rowID.push(entry.ID);
                        }
                    }
                });
            });
            return filteredData;
        };
}());