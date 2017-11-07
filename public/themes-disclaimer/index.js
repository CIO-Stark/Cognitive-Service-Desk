/**
 * Created by danielabrao on 12/13/16.
 */
(function () {
    "use strict";

    var themesArr = require("./partials/Themes.dataset.json"),
        themesPhrases = require("./partials/Themes.phrases.json"),
        properties = require("./partials/elements.script"),
        methods = require("./partials/methods.script");

    module.exports = function () {
        return {
            "themesArr": themesArr,
            "properties": properties,
            "methods": methods(properties, themesPhrases)
        };
    };
}());