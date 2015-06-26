var GameboyJS;
(function (GameboyJS) {
"use strict";

// The Input management system
//
// Only manageKeyboardPress, manageKeyboardRelease, translateKeyboardKey
// are tied to a keyboard usage,
// other functions rely on the name of the original buttons
var Input = function(cpu) {
    this.cpu = cpu;
    this.memory = cpu.memory;
    this.P1 = 0xFF00;
    this.state = 0;
};

Input.keys = {
    START:  0x80,
    SELECT: 0x40,
    B:      0x20,
    A:      0x10,
    DOWN:   0x08,
    UP:     0x04,
    LEFT:   0x02,
    RIGHT:  0x01
};

Input.prototype.pressKey = function(key) {
    this.state |= Input.keys[key];
};

Input.prototype.releaseKey = function(key) {
    var mask = 0xFF - Input.keys[key];
    this.state &= mask;
};

Input.prototype.update = function() {
    var value = this.memory.rb(this.P1);
    value = (~value) & 0x30;
    if (value & 0x10) { // direction keys listened
        value |= this.state & 0x0F;
    } else if (value & 0x20) { // action keys listened
        value |= ((this.state & 0xF0) >> 4);
    } else if ((value & 0x30) == 0) { // no keys listened
        value &= 0xF0;
    }

    if (this.memory.rb(this.P1) & value & 0x0F) {
        this.cpu.requestInterrupt(GameboyJS.CPU.INTERRUPTS.HILO);
        console.log('hilo interrupt');
    }

    value = (~value) & 0x3F;
    this.memory.wb(this.P1, value);
};

Input.prototype.manageKeyboardPress = function(keycode) {
    var key = this.translateKeyboardKey(keycode);
    if (key) {
        this.pressKey(key);
    }
};

Input.prototype.manageKeyboardRelease = function(keycode) {
    var key = this.translateKeyboardKey(keycode);
    if (key) {
        this.releaseKey(key);
    }
};

// Transform a keyboard keycode into a key of the Input.keys object
Input.prototype.translateKeyboardKey = function(keycode) {
    var key = null;
    switch (keycode) {
        case 71: // G
            key = 'A';
            break;
        case 66: // B
            key = 'B';
            break;
        case 72: // H
            key = 'START';
            break;
        case 78: // N
            key = 'SELECT';
            break;
        case 37: // left
            key = 'LEFT';
            break;
        case 38: // up
            key = 'UP';
            break;
        case 39: // right
            key = 'RIGHT';
            break;
        case 40: // down
            key = 'DOWN';
            break;
    }

    return key;
};
GameboyJS.Input = Input;
}(GameboyJS || (GameboyJS = {})));
