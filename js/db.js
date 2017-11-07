var Promise = require('bluebird');
var ibmdb = null; //require('ibm_db');
var credentials = require('../config/credentials.js');
var connString = "DRIVER={DB2};DATABASE=" + credentials.relational_datase.name + ";UID=" + credentials.relational_datase.username + ";PWD=" + credentials.relational_datase.password + ";HOSTNAME=" + credentials.relational_datase.hostname + ";port=" + credentials.relational_datase.port;
var pg = require('pg');
var pgconn = "postgres://"+credentials.answers_database.username+":"+credentials.answers_database.password+"@"+credentials.answers_database.hostname+":"+credentials.answers_database.port+"/"+credentials.answers_database.name;
var classifiersHandler = require('../model/classifierlist.js')();

exports.classifiers = function (classifierslist) {
  return new Promise(function ExecuteDBRequest(resolve, reject) {
    var client = new pg.Client(pgconn);
    var query = "SELECT key FROM CLASSIFIER WHERE id in ('"+credentials.answers_database.id.pt+"','"+credentials.answers_database.id.es+"') ORDER BY NAME;"

    client.connect(function (err) {
      if (err) {
        reject(err);
      } else {
        client.query(query, function (err, result) {
          if (err) {
            reject(err);
          } else if(!err && result.rows.length > 0) {
            try {
              classifiersHandler.set (0,result.rows[0].key)
              classifiersHandler.set (1,result.rows[1].key)
              resolve(classifiersHandler.get());
            } catch (e) {
              reject({message : e});
            }

          } else {
            var error = err || 'NOT_FOUND';
            reject({message : error.message || 'NOT_FOUND'});
          }

          client.end(function (err) {
            if (err) reject(err);
          });
        });
      }
    });
  })
}

exports.answerV2 = function ExecuteSelect(class1,class2) {
  return new Promise(function ExecuteDBRequest(resolve, reject) {
    var client = new pg.Client(pgconn);
    var query = "SELECT ID AS CLASS_ID,APP_ID,CONTENT FROM CLASS WHERE CLASSIFIER_ID IN("+credentials.answers_database.id.pt+","+credentials.answers_database.id.es+") AND ID IN('"+class1+"','"+class2+"')"
    var answers=[{},{}];
    console.log(query);

    client.connect(function (err) {
      if (err) {
        reject(err);
      } else {
        client.query(query, function (err, result) {
          if (err) {
            reject(err);
          } else if(!err && result.rows.length > 0) {
            try {
              answers[0].class_id = result.rows[0].class_id;
              answers[0].cluster = result.rows[0].app_id;
              answers[0].answer = result.rows[0].content;
              answers[1].class_id = result.rows[1].class_id;
              answers[1].cluster = result.rows[1].app_id;
              answers[1].answer = result.rows[1].content;
              resolve(answers);
            } catch (e) {
              reject({message : 'ERROR'});
            }

          } else {
            var error = err || 'NOT_FOUND';
            reject({message : error.message || 'NOT_FOUND'});
          }

          client.end(function (err) {
            if (err) reject(err);
          });
        });
      }
    });
  })
}



exports.answer = function ExecuteSelect(class1,class2) {
    return new Promise(function ExecuteDBRequest(resolve, reject) {
        var query = "SELECT (CASE lower(a.CLASS) WHEN '"+class1+"' THEN 1 WHEN '"+class2+"' THEN 2 END) ORDER, ANSWER FROM ANSWERS_BETA a WHERE lower(CLASS) IN ('"+class1+"','"+class2+"') ORDER BY 1 ASC;"
        var answers=[];
        ibmdb.open(connString, function(err, conn) {
            if (err) {
                reject(err.message);
            } else {
                console.log(query);
                conn.query(query, function(err, rows, moreResultSets) {
                    if(!err && rows.length > 0) {
                        try {
                            answers.push(rows[0].ANSWER.replace(/(\r\n|\n|\r|\")/g, ' '));
                            answers.push(rows[1].ANSWER.replace(/(\r\n|\n|\r|\")/g, ' '));
                            resolve(answers);
                        } catch (e) {
                            console.log(e);
                            answers.push(rows[0].ANSWER.replace(/(\r\n|\n|\r|\")/g, ' '));
                            resolve(answers);
                        }
                    }
                    else {
                        var error = err || 'NOT_FOUND';
                        reject({message : error.message || 'NOT_FOUND'});
                    }
                    conn.close(function CloseConnection(){
                        console.log("Connection Closed");
                    });
                });
            }
        });
    });
}

exports.feedback = function(params) {
  return new Promise(function ExecuteDBRequest(resolve, reject) {
    ibmdb.open(connString, function(err, conn) {
      if (err) {
          reject(err.message);
      } else {
        console.log(params);
        var query = "INSERT INTO ANALYTICS_FEEDBACK_BETA (CLIENT_ID,CONVERSATION_ID,USERID,PLATFORM,LANGUAGE,QUESTION,FEED1,CLUSTER1,FEED2,CLUSTER2,NEG_FDBK_COMMENT,TIMESTAMP,CONF) VALUES ("+params.client_id+","+params.conversation_id+",'"+params.userid+"','"+params.platform+"','"+params.lan+"','"+params.question+"',"+params.feed1+",'"+params.cluster1+"',"+params.feed2+",'"+params.cluster2+"','"+params.neg_fdbk_comment+"',CURRENT_TIMESTAMP,"+params.conf+");";
        console.log(query);
        conn.query(query, function(err, rows, moreResultSets) {
            if (!err ) resolve('Success - Feedack inserted');
            else reject(err);
            conn.close(function(){
                console.log("Connection Closed");
            });
        });
      }
    });
  })
}

exports.rating = function(params) {
    return new Promise(function ExecuteDBRequest(resolve, reject) {
        ibmdb.open(connString, function(err, conn) {
            if (err) {
                reject(err.message);
            } else {
                var query = "INSERT INTO ANALYTICS_RATING_BETA (CLIENT_ID,CONVERSATION_ID,PLATFORM,USERID,RATING,TIMESTAMP) VALUES ("+params.client_id+","+params.conversation_id+",'"+params.platform+"','"+params.userid+"',"+params.rating+",CURRENT_TIMESTAMP);";
                console.log(query);
                conn.query(query, function(err, rows, moreResultSets) {
                    if (!err ) resolve('Success - rating inserted');
                    else reject(err);
                    conn.close(function(){
                        console.log("Connection Closed");
                    });
                });
            }
        });
    })
};

exports.smeQueries = function(query) {
    return new Promise(function ExecuteDBRequest(resolve, reject) {
        ibmdb.open(connString, function(err, conn) {
            if (err) {
                reject(err.message);
            } else {
                conn.query(query, function(err, rows, moreResultSets) {
                    conn.close(function(){
                        if (!err ) {
                            resolve({
                                "rows": rows,
                                "bookmark": moreResultSets
                            });
                        } else {
                            reject(err);
                        }
                    });
                });
            }
        });
    })
};

exports.openConn = function () {
    return ibmdb.openSync(connString);
};

exports.adminQueries = function(query) {

    return new Promise(function (resolve, reject) {
        ibmdb.open(connString, function(err, conn) {
            if (err) {
                reject(err.message);
            } else {
                conn.query(query, function(err, rows, moreResultSets) {
                    console.log(err);
                    if (!err) {
                        conn.close(function(){
                            console.log("Connection Closed");
                        });
                        resolve({
                            "rows": rows,
                            "bookmark": moreResultSets
                        });
                    } else {
                        reject(err);
                    }
                });
            }
        });
    });

};

exports.mobile = function(params) {
    return new Promise(function ExecuteDBRequest(resolve, reject) {
        ibmdb.open(connString, function(err, conn) {
            if (err) {
                reject(err.message);
            } else {
                var query = "INSERT INTO ANALYTICS_MOBILE_BETA (USERID, COUNTRY, CHAT_USAGE_TIME, OS, MODEL) VALUES ('"+params.userid+"','"+params.country+"',"+params.chatusagetime+",'"+params.os+"','"+params.model+"')";
                console.log(query);
                conn.query(query, function(err, rows, moreResultSets) {
                    if (!err ) resolve('Success - mobile metrics inserted');
                    else reject(err);
                    conn.close(function(){
                        console.log("Connection Closed");
                    });
                });
            }
        });
    })
}
