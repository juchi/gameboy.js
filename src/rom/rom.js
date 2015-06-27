var GameboyJS;
(function (GameboyJS) {
"use strict";


var Rom = function(gameboy, romReader) {
    var data = [];
    var self = this;
    romReader.init(function(data) {
        if (!validate(data)) {
            gameboy.error('The file is not a valid GameBoy ROM.');
            return;
        }
        self.data = data;
        gameboy.startRom(self);
    });
};

Rom.prototype.requestFile = function(filename, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        var rom = new Uint8Array(xhr.response);
        cb(rom);
    };

    xhr.send();
};

// Validate the checksum of the cartridge header
function validate(data) {
    var hash = 0;
    for (var i = 0x134; i <= 0x14C; i++) {
        hash = hash - data[i] - 1;
    }
    return (hash & 0xFF) == data[0x14D];
};

GameboyJS.Rom = Rom;
}(GameboyJS || (GameboyJS = {})));
