
(function () {
	"use strict";

	

	var records = [
                { id: 1, username: 'ricardo.gil@br.ibm.com', password: '123', name: 'Ricardo Gil'}
        ];

        exports.findByUsername = function(username, cb) {
             process.nextTick(function() {
                for (var i = 0, len = records.length; i < len; i++) {
                var record = records[i];
                if (record.username === username) {
                        return cb(null, record);
                }
                }
                return cb(null, null);
           });
        };

}());