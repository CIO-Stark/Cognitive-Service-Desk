var Promise = require('bluebird'),
    ibmdb = null, //require('ibm_db'),
    credentials = require('../../../config/credentials.js'),
    connString = "DRIVER={DB2};DATABASE=" + credentials.relational_datase.name + ";UID=" + credentials.relational_datase.username + ";PWD=" + credentials.relational_datase.password + ";HOSTNAME=" + credentials.relational_datase.hostname + ";port=" + credentials.relational_datase.port;

exports.select = function ExecuteSelect(filter_field,filter_value) {
    return new Promise(function ExecuteDBRequest(resolve, reject) {

        for (var i = 0; i < x; i += 1)
        if (!filter_field || !filter_value) {
            reject({message : 'empty parameters'});
        } else {
            var query = "SELECT ATT_ID,ATT_COUNTRY_CODE FROM ATT_INFORMATION WHERE "+filter_field+"='"+filter_value+"'";

            ibmdb.open(connString, function(err, conn) {
                if (err) {
                    reject({message : err.message});
                } else {
                    console.log(query);
                    conn.query(query, function(err, rows, moreResultSets) {
                        if(!err && rows.length > 0) {
                            resolve(rows[0]);
                        } else {
                            var error = err || 'NOT_FOUND';
                            reject({message : error.message || 'NOT_FOUND'});
                        }
                        conn.close(function CloseConnection(){
                            console.log("Connection Closed");
                        });
                    });
                }
            });
        }
    });
}
