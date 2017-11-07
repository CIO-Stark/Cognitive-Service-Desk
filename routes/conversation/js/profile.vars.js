var Promise = require('bluebird');

exports.GetProfileVar = function(name,dialog,dialog_id,client_id) {
  var profile_var;

  var names = {
    first_name : 'username',
    email : 'size',
    uid : 'sauce'
  }

  var params = {
    dialog_id: dialog_id,
    client_id: client_id,
  };

  return new Promise(function GetProfileVariable(resolve, reject) {
    dialog.getProfile(params, function(err, res) {

      if(!err) {
        for(i=0;i<res.name_values.length;i++) {
          if(res.name_values[i].name == names[name]) profile_var = res.name_values[i].value;
        }

        if(profile_var) resolve(profile_var);
        else reject('Variable Not Found');

      } else {
        reject('Profile Dialog Error');
      }
    });
  });
}
