var GameboyJS;
(function (GameboyJS) {
"use strict";

// The Input management system
//
// The pressKey() and releaseKey() functions should be called by a device class
// like GameboyJS.Keyboard after a physical button trigger event
//
// They rely on the name of the original buttons as parameters (see Input.keys)
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
GameboyJS.Input = Input;
}(GameboyJS || (GameboyJS = {})));
