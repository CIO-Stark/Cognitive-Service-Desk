(function() {
   "use strict";


    module.exports = function (app, io, cloudant, request) {
      var gActive_users = []
      var tokensDB = cloudant.db.use('user_tokens');


        io.on('connection', function (socket) {

	        socket.on('join', function (data) {
	            socket.join(data.email);
              socket.email = data.email;
	            console.log('user '+socket.id+' conectado a '+data.email)
	        });

          socket.once('disconnect', function() {
            if(userIndexOf(socket.email) > -1) {
              disconnectGenesys(socket.email).then(function(data){
                gActive_users.splice(userIndexOf(socket.email), 1)
                console.log('------- '+socket.email+' disconnected from Genesys -------')
              }).catch(function(error){
                console.log(error)
              })
            }
          })

          socket.on('StartGenesys', function(data) {

            if(userIndexOf(data.userid) == -1) {
              sendToGenesys(data.chat, data.userid).then(function(genesys_resp) {
                console.log('------- '+data.userid+' connected to Genesys -------')
                console.log('------- '+genesys_resp.service_id+' -------')
                console.log('')
                io.to(data.userid).emit('GenesysStarted', {service_id: genesys_resp.service_id});
                gActive_users.push({userid: data.userid, service_id: genesys_resp.service_id});
              }).catch(function(error) {
                console.log(error)
                //io.to(data.userid).emit('genesysError', {message: fail to send messsage to genesys})
              })
            }

          })

	    });

      function disconnectGenesys(email) {
        return new Promise(function (resolve, reject) {

          var service_id = gActive_users[userIndexOf(email)].service_id;

          console.log(gActive_users)
          console.log('removendo ' + service_id + ' user: '+email+ 'na posicao '+userIndexOf(email))

          var props = {
            method: 'POST',
            url: 'http://9.18.167.233:8010/genesys/1/service/'+service_id+'/ixn/chat/disconnect',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form: {}
          };

          request(props, function (error, response, body) {
            if(error) {
              reject ({message: 'error on disconnect '+service_id})
            } else {
              resolve ({message: 'service id '+service_id+' disconnected'})
            }
          });

        })

      }

      function userIndexOf(userid) {
        var user_index = -1;
        gActive_users.forEach(function(user,index) {
          if(user.userid == userid) {
            user_index = index;
          }
        })

        return user_index;
      }


      function insertToken(userid,token) {
        return new Promise(function (resolve, reject) {

          var document = {
            userid: userid,
            token: token,
            expired: 'False'
          }

          tokensDB.insert(document, function(err, result) {
            if(err) {
              reject({status: false, message: 'error in insert token in database'})
            } else {
              resolve({status: true, token: document.token})
            }
          })

        })
      }


      function destroyToken(userid) {
        return new Promise(function (resolve, reject) {

          if(userid && userid.trim().length > 0) {
            tokensDB.find({selector: {
              "userid" : userid
            }}, function(err, data) {
              if(err) {
                reject({status: false, message: 'unable to delete user token'})
              } else {
                if(data.docs.length > 0) {
                  for (var doc in data.docs) {
                    tokensDB.destroy(data.docs[doc]._id, data.docs[doc]._rev)
                  }
                  resolve({status: true})
                } else {
                  resolve({status: true})
                }
              }

            })
          }else {
            reject({status: false, message: 'userid was not specified to delete tokens'})
          }

        })
      }

      function GenerateNewToken(userid) {
        var time_part = new Date().getTime()
        var rand_part = (Math.random() * (999 - 0) + 0).toString(36).substr(3);
        var token = new Buffer(rand_part+'.'+time_part+'.'+userid).toString('base64')

        return token;
      }


      function decodeToken(token) {
        var data = (Buffer.from(token,'base64')).toString();

        var no_begin = data.substr(data.indexOf('.')+1, data.length);
        var date = no_begin.substr(0, no_begin.indexOf('.'))
        var userid = no_begin.substr(no_begin.indexOf('.')+1, no_begin.length)

        return {user: userid, issue_date:date, original_token:token, decoded_token: data}

      }


      function GetUserToken(userid) {
        return new Promise(function (resolve, reject) {
          tokensDB.find({selector: {
            "userid" : userid
          }}, function(err, data) {
            try {
              if(err) {
                reject({user: userid, error: 'Session not found'})
              } else {
                if(data.docs.length > 0) {
                  if(data.docs[0].expired === 'False') {
                    resolve({user:data.docs[0].user, token: data.docs[0].token})
                  } else {
                    reject({user:data.docs[0].user, error: 'Session expired'})
                  }
                } else {
                  reject({user: userid, error: 'Session not found'})
                }
              }
            } catch(error) {
              reject({user: userid, error: 'Could not get session'})
            }
          })
        })
      }


      function validateToken(gToken, uToken) {
        if(gToken === uToken) {

          var uToken_dec = decodeToken(uToken)
          var current_date = new Date();
          var token_date = new Date(Number(uToken_dec.issue_date));
          console.log(current_date)
          console.log(token_date)
          console.log(current_date - token_date)

          if((current_date - token_date) >= 1200000) {
            return {valid: false, message: 'Session expired'}
          } else {
            return {valid: true}
          }

        } else {
          return {valid: false, message: 'Invalid token'}
        }


      }

      function sendToGenesys(chat,userid,begin) {
        return new Promise(function (resolve, reject) {

          var props = {
            method: 'POST',
            url: '',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form: {}
          };

          props.url = 'http://9.18.167.233:8010/genesys/1/service/request-chat'
          props.form = {_verbose: 'true', chatHistory: 'teste history'}

          request(props, function (error, response, body) {
            if(error) {
              reject(error)
            } else {
              var service_id = JSON.parse(body)._id;
              props.url = 'http://9.18.167.233:8010/genesys/1/service/'+service_id+'/ixn/chat'
              props.form = {subject: 'Chat from Watson', email: userid}

              request(props, function (error, response, body) {
                var chatSessionId = JSON.parse(body).chatSessionId;
                resolve({service_id: service_id, chatSessionId: chatSessionId});
              })
            }
          });

        })
      }

      app.post('/sendToGenesys', function(req,res) {

        sendToGenesys('',req.body.userid).then(function(data) {
          res.send(JSON.parse(data))
        }).catch(function(error) {
          res.status(400).send(JSON.parse(error))
        })

      })

      app.post('/askGenesys', function(req, res) {

        var props = {
          method: 'POST',
          url: 'http://9.18.167.233:8010/genesys/1/service/'+req.body.service_id+'/ixn/chat/refresh',
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          form: {message: req.body.message}
        };

        request(props, function (error, response, body) {
          if(error) {
            res.status(400).send(JSON.parse(error))
          } else {
            res.send(JSON.parse(body))
          }
        });

      })


      function CheckMessage(service_id) {
        var props = {
          method: 'POST',
          url: 'http://9.18.167.233:8010/genesys/1/service/'+service_id+'/ixn/chat/refresh',
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          form: {}
        };
        return new Promise(function (resolve, reject) {
          request(props, function (error, response, body) {
            if(error) {
              reject(error)
            } else {
              resolve(JSON.parse(body))
            }
          });
        })
      }


      setInterval(function() {
        if(gActive_users.length > 0) {
          gActive_users.forEach(function(user) {
            CheckMessage(user.service_id).then(function(refresh) {
              if(refresh.hasOwnProperty('exception')) {
                io.to(user.userid).emit('finish_genesys', {message: 'The agent left your session'});
              } else if(refresh.transcriptToShow.length > 0) {
                if(refresh.transcriptToShow[refresh.transcriptToShow.length - 1][4] != 'CLIENT') {
                  var message = refresh.transcriptToShow[refresh.transcriptToShow.length - 1][2]
                  if(message.indexOf('joined') > -1) {
                    io.to(user.userid).emit('new_msg', {message: 'An agent joined your session'});
                  } else if(message.indexOf('typing') == -1) {
                    io.to(user.userid).emit('new_msg', {message: message});
                  }
                }
              }
            });
          })
        }
      }, 1000);



      //recebe mensagens do Genesys
      app.post('/message/send',function(req, res) {
        console.log(gActive_users)
        if(gActive_users.length > 0) {
          gActive_users.forEach(function(user) {
            CheckMessage(user.service_id).then(function(refresh) {
              console.log('validating '+user.service_id+' user: '+user.userid)
              // console.log(refresh)
              if(refresh.hasOwnProperty('exception')) {
                // io.to(user.userid).emit('new_msg', {message: 'saiu'});
                io.to(user.userid).emit('finish_genesys', {message: 'Chat with Genesys disconnected'});
              } else if(refresh.transcriptToShow.length > 0) {
                if(refresh.transcriptToShow[refresh.transcriptToShow.length - 1][4] != 'CLIENT') {
                  var message = refresh.transcriptToShow[refresh.transcriptToShow.length - 1][2]
                  // console.log('message: ', message)
                  if(message.indexOf('typing') == -1)
                    io.to(user.userid).emit('new_msg', {message: message});
                }
              } else {
                io.to(user.userid).emit('new_msg', {message: user.userid});
              }
            });
          })



        }

        res.send({message: 'foi'})


        })

        app.post('/session/end', function(req,res) {
          destroyToken(req.body.userid).then(function() {
            res.send({message: 'Session finished', userid: req.body.userid})
          }).catch(function(error) {
            res.status(400).send({message: error.message})
          })
        })
    }

}())
