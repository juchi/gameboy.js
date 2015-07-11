var GameboyJS;
(function (GameboyJS) {
"use strict";

// Screen device
var Screen = function(canvas) {
    canvas.width = Screen.physics.WIDTH * Screen.physics.PIXELSIZE;
    canvas.height = Screen.physics.HEIGHT * Screen.physics.PIXELSIZE;

    this.context = canvas.getContext('2d');
    this.imageData = this.context.createImageData(canvas.width, canvas.height);
};

Screen.colors = [
    0xFF,
    0xAA,
    0x55,
    0x00
];

Screen.physics = {
    WIDTH    : 160,
    HEIGHT   : 144,
    PIXELSIZE: 1,
    FREQUENCY: 60
};

Screen.prototype.clearScreen = function() {
    this.context.fillStyle = '#FFF';
    this.context.fillRect(0, 0, Screen.physics.WIDTH * Screen.physics.PIXELSIZE, Screen.physics.HEIGHT * Screen.physics.PIXELSIZE);
};

Screen.prototype.fillImageData = function(buffer) {
    for (var y = 0; y < Screen.physics.HEIGHT; y++) {
        for (var x = 0; x < Screen.physics.WIDTH; x++) {
            var offset = y * 160 + x;
            var v = Screen.colors[buffer[offset]];
            this.imageData.data[offset * 4] = v;
            this.imageData.data[offset * 4 + 1] = v;
            this.imageData.data[offset * 4 + 2] = v;
            this.imageData.data[offset * 4 + 3] = 255;
        }
    }
};

Screen.prototype.render = function(buffer) {
    this.fillImageData(buffer);
    this.context.putImageData(this.imageData, 0, 0);
}

GameboyJS.Screen = Screen;
}(GameboyJS || (GameboyJS = {})));
