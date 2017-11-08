/**
 * Created by danielabrao on 2/28/17.
 */
(function (process) {
    "use strict";

    module.exports = {
        "creds": {
            "username": JSON.parse(process.env.VCAP)["conversation"][0].credentials.username,
            "password": JSON.parse(process.env.VCAP)["conversation"][0].credentials.password,
            "version": "v1",
            "version_date": "2017-02-03"
        },
        "pt": {
            "workspace_id": process.env.workspace_id || "8f90f83a-79d4-4cbc-a99c-be5ee98289de" //"4e75767a-b21e-4106-9d89-9286646e9914"
        }
    };

}(process));