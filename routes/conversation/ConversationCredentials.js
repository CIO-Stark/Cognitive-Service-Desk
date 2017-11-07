/**
 * Created by danielabrao on 2/28/17.
 */
(function (process) {
    "use strict";

    module.exports = {
        "creds": {
            "username": JSON.parse(process.env.VCAP_SERVICES)["conversation"][0].credentials.username,
            "password": JSON.parse(process.env.VCAP_SERVICES)["conversation"][0].credentials.password,
            "version": "v1",
            "version_date": "2017-02-03"
        },
        "pt": {
            "workspace_id": "3132255d-b5b3-4dcd-b01c-39e556bb4997"
        },
        "es": {
            "workspace_id": "3132255d-b5b3-4dcd-b01c-39e556bb4997"
        }
    };

}(process));