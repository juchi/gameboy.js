import CPU from '../cpu';

// The Input management system
//
// The pressKey() and releaseKey() functions should be called by a device class
// like GameboyJS.Keyboard after a physical button trigger event
//
// They rely on the name of the original buttons as parameters (see Input.keys)
var Input = function(cpu, pad, canvas) {
    this.cpu = cpu;
    this.memory = cpu.memory;
    this.P1 = 0xFF00;
    this.state = 0;
    this.interruptQueue = [];

    pad.init(canvas, this.pressKey.bind(this), this.releaseKey.bind(this));
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
    this.delayInterrupt(key);
};

Input.prototype.releaseKey = function(key) {
    var mask = 0xFF - Input.keys[key];
    this.state &= mask;
};

// do not send the interrupt right away, due to the way javascript works :
// the key event fires when no other code is running, meaning when the frame()
// in the GPU has finished rendering. This means the interrupt will always run
// at LY = 144, which prevents the game to generate entropy for the key press actions
//
// the event is stored in a queue which is processed the next time the LY register is
// at the randomly determined value
Input.prototype.delayInterrupt = function(key) {
    let ly = (Math.random() * 153) | 0;
    this.interruptQueue.push({ly: ly, key: key});
};

Input.prototype.update = function() {
    if (this.interruptQueue.length > 0) { // check for interrupt to fire
        if (this.interruptQueue[0].ly === this.memory.rb(this.cpu.gpu.LY)) {
            let v = this.interruptQueue.shift();
            this.state |= Input.keys[v.key];
            this.cpu.requestInterrupt(CPU.INTERRUPTS.HILO);
        }
    }

    var value = this.memory.rb(this.P1);
    value = ((~value) & 0x30); // invert the value so 1 means 'active'
    if (value & 0x10) { // direction keys listened
        value |= (this.state & 0x0F);
    } else if (value & 0x20) { // action keys listened
        value |= ((this.state & 0xF0) >> 4);
    } else if ((value & 0x30) === 0) { // no keys listened
        value &= 0xF0;
    }

    value = ((~value) & 0x3F); // invert back
    this.memory[this.P1] = value;
};

export default Input;
