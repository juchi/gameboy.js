var GameboyJS;
(function (GameboyJS) {
"use strict";

// Utility functions
var Util = {};
Util.extend = function(target, source) {
    for (var name in source) {
        target[name] = source[name];
    }

    return target;
};
GameboyJS.Util = Util;
}(GameboyJS || (GameboyJS = {})));
