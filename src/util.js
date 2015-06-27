var GameboyJS;
(function (GameboyJS) {
"use strict";

// Utility functions
var Util = {};

// Add to the first argument the properties of all other arguments
Util.extend = function(target /*, source1, source2, etc. */) {
    var sources = Array.prototype.slice.call(arguments);
    for (var i in sources) {
        var source = sources[i];
        for (var name in source) {
            target[name] = source[name];
        }
    }

    return target;
};
GameboyJS.Util = Util;
}(GameboyJS || (GameboyJS = {})));
