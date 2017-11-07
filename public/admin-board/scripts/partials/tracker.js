/**
 * Created by danielabrao on 10/7/16.
 */
(function () {
    "use strict";

    module.exports = {
        activeLog: {
            "dataObj": false,
            "menuEl": false
        },
        setData: function (dataObj) {
            this.activeLog.dataObj = dataObj;
            return this;
        },
        setMenu: function (menuObj) {
            this.activeLog.menuEl = menuObj;
            return this;
        },
        getData: function () {
            return this.activeLog.dataObj;
        },
        getMenu: function () {
            return this.activeLog.menuEl;
        }
    };

}());