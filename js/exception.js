var GameboyJS;
(function (GameboyJS) {
"use strict";

function UnimplementedException(message, fatal) {
    this.message = message;
    this.name = UnimplementedException;
    if (fatal === undefined) {
        fatal = true;
    }
    this.fatal = fatal;
}
GameboyJS.UnimplementedException = UnimplementedException;
}(GameboyJS || (GameboyJS = {})));
