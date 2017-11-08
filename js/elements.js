(function () {
    "use strict";

    module.exports = function () {
    	var elementList = {
                //"intentname": "replace html snipped",
                };

        return {
        	"list": function(){ return elementList
        	},
            "get": function (el) {
                if (elementList[el]) {
                    return elementList[el];
                } else {
                    return "";
                }
            },
            "set": function (el, val) {
                elementList[el] = val;
            }
        };
    };

}());
