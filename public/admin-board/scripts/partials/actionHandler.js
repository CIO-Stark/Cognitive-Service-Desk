/**
 * Created by danielabrao on 10/10/16.
 */
(function () {
    "use strict";

    module.exports = {
        bindAction: function (el, cb) {
            el.addEventListener("click", cb, false);
        },
        removeAction: function (el, cb) {
            el.removeEventListener("click", cb, false);
        }
    };

}());