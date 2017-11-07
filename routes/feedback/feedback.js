exports.email = function(sendgrid,fs) {
  return function(req, res) {
    var email = req.body.email;
    var deviceid = req.body.deviceid;
    var deviceos = req.body.deviceos;
    var attachments = req.body.attachments;
    var comments = req.body.comments;
    var category = req.body.category;

    var att_size = attachments.length;

    var date = new Date();
    var time = date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();
    var date_beg = date.toISOString().substring(0, 10).replace(/-/g,'');
    var datetime = date_beg + time;

    var file_names = [
      '1_' + email + '_' + datetime + '.jpg',
      '2_' + email + '_' + datetime + '.jpg',
      '3_' + email + '_' + datetime + '.jpg'
    ];

    var path = '../tmp/';
    var _files_array = [];

    for (var i = 0; i < attachments.length; i += 1) {
      _files_array.push({
          filename: file_names[i],
          path: path + file_names[i]
      });
    }

    var _files_json = JSON.stringify(_files_array);
    var _files = JSON.parse(_files_json);

    var payload   = {

      files   : _files,
      to      : 'laciowa@br.ibm.com',
      from    : email,
      subject : 'Give a Feedback',
      text    : 'New mail feedback',
      html    : '<b> Email: </b>'+email+'</br>'+
                '<b> Category: </b>'+category+'</br>'+
                '<b> Device ID: </b>'+deviceid+'</br>'+
                '<b> Device OS: </b>'+deviceos+'</br></br>'+
                '<b> Comments: </b>'+comments
    };


    var removeImages = function (i) {
      if(i<att_size) {
        fs.unlink(path+file_names[i],function () {
          i++;
          removeImages(i);
        });
      }
    };


    var sendMail = function () {
      sendgrid.send(payload, function(err, json) {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(json);
        }
        removeImages(0);
      });
    };


    var decodeImage = function (i) {

      if(i<att_size) {
        fs.writeFile(path+file_names[i], new Buffer(attachments[i], "base64"),
        function(err) {
          i++;
          decodeImage(i);
        });
      }
      else {
        sendMail();
      }

    };

    decodeImage(0);

  }
};
