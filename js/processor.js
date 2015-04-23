var Processor = function() {

    this.INTERRUPTS = {
        TIMER: 2
    };
    this.interruptRoutines = {
        2: timerInterrupt
    };

    var proc = this;
    function timerInterrupt() {
        console.log('timer');
        proc.memory[0xFF42]++;
    }

    this.r = {A:0, F: 0, B:0, C:0, D:0, E:0, H:0, L:0, pc:0, sp:0};
    this.clock = {c: 0};
    this.memory = new Memory();
};

Processor.prototype.reset = function() {
    this.memory.reset();

    this.r.sp = 0xFFEF;
    this.r.pc = 0x0100;
/*
    this.memory[0x9800] = 1;
    this.memory[0x9801] = 1;
    this.memory[0x9802] = 1;
    this.memory[0x9813] = 1;
    this.memory[0x8000] = 255;
    this.memory[0x8001] = 255;
    this.memory[0x8002] = 255;
    this.memory[0x8003] = 255;
    this.memory[0x8004] = 255;
    this.memory[0x8005] = 255;
    this.memory[0x8006] = 255;
    this.memory[0x8007] = 255;
    this.memory[0x8008] = 255;
    this.memory[0x8009] = 255;
    this.memory[0x800A] = 255;
    this.memory[0x800B] = 255;
    this.memory[0x800C] = 255;
    this.memory[0x800D] = 255;
    this.memory[0x800E] = 255;
    this.memory[0x800F] = 255;*/

    this.memory[0xFF40] = 0x91;
    this.memory[0xFF41] = 0x0;
    this.memory[0xFF42] = 0x0;
    this.memory[0xFF43] = 0x0;
};

Processor.prototype.fillRomMemory = function(data, start) {
    start = start || 0;
    for (var i = 0; i < data.length; i++) {
        this.memory[i + start] = data[i];
    }
};

Processor.prototype.run = function() {
    this.frame();
};

Processor.prototype.frame = function() {
    //this.nextFrameTimer = setTimeout(this.frame.bind(this), 1000 / this.screen.FREQUENCY);

    var maxInstructions = 70224;
    this.clock.c = 0;
    var skipped = 0;

    while (this.clock.c < maxInstructions) {
        var opcode = this.memory[this.r.pc++];
        if (!opcodes[opcode]) {
            skipped++;
            this.clock.c += 4;
            continue;
        }
        opcodes[opcode](this);
    }
    this.screen.drawFrame();

    console.log('end frame - '+skipped+' instructions skipped');
};

Processor.prototype.timer = function() {
    var time = 1000;
    setTimeout(this.timer.bind(this), time);
    this.memory[this.TIMER_COUNTER]++;
    if (this.memory[this.TIMER_COUNTER] > 255) {
        this.memory[this.TIMER_COUNTER] = this.memory[this.TIMER_OVERFLOW];
    }

    this.interrupt(this.INTERRUPTS.TIMER);
};

Processor.prototype.interrupt = function(type) {
    if (this.isInterruptEnable(type)) {
        this.interruptRoutines[type]();
    }
};

Processor.prototype.isInterruptEnable = function(type) {
    return true;
};

var opcodes = {
    0x00: function(p){p.clock.c += 4;},
    0x01: function(p){ops.LDrrnn(p, 'B', 'C');},
    0x02: function(p){ops.LDrrar(p, 'B', 'C', 'A');},
    0x03: function(p){ops.INCrr(p, 'B', 'C');},
    0x04: function(p){ops.INCr(p, 'B');},
    0x05: function(p){ops.DECr(p, 'B');},
    0x06: function(p){ops.LDrn(p, 'B');},
    0x07: function(p){p.r.F=0;var out=p.r.A & 0x80?1:0; out ? p.r.F|=0x10:p.r.F&=0xEF; p.r.A=((p.r.A<<1)+out)&0xFF;p.clock.c+=4;},
    0x08: function(p){},
    0x09: function(p){},
    0x0A: function(p){},
    0x0B: function(p){ops.DECrr(p, 'B', 'C');},
    0x0C: function(p){ops.INCr(p, 'C');},
    0x0D: function(p){ops.DECr(p, 'C');},
    0x0E: function(p){ops.LDrn(p, 'C');},
    0x0F: function(p){p.r.F=0;var out=p.r.A & 0x01; out ? p.r.F|=0x10:p.r.F&=0xEF; p.r.A=(p.r.A>>1)&(out*0x80);p.clock.c+=4;},

    0x10: function(p){p.r.pc++;p.clock.c+=4;},
    0x11: function(p){ops.LDrrnn(p, 'D', 'E');},
    0x12: function(p){ops.LDrrar(p, 'D', 'E', 'A');},
    0x13: function(p){ops.INCrr(p, 'D', 'E');},
    0x14: function(p){ops.INCr(p, 'D');},
    0x15: function(p){ops.DECCr(p, 'D');},
    0x16: function(p){ops.LDrn(p, 'D');},
    0x17: function(p){var c = p.r.F&0x10;p.r.F=0;var out=p.r.A & 0x80?1:0; out ? p.r.F|=0x10:p.r.F&=0xEF; p.r.A=(p.r.A<<1)+c;p.clock.c+=4;},
    0x18: function(p){},
    0x19: function(p){},
    0x1A: function(p){},
    0x1B: function(p){ops.DECrr(p, 'D', 'E');},
    0x1C: function(p){ops.INCr(p, 'E');},
    0x1D: function(p){ops.DECr(p, 'E');},
    0x1E: function(p){ops.LDrn(p, 'E');},
    0x1F: function(p){var c = p.r.F&0x10;p.r.F=0;var out=p.r.A & 0x01; out ? p.r.F|=0x10:p.r.F&=0xEF; p.r.A=(p.r.A>>1)&(c*0x80);p.clock.c+=4;},

    0x40: function(p){ops.LDrr(p, 'B', 'B');},
    0x41: function(p){ops.LDrr(p, 'B', 'C');},
    0x42: function(p){ops.LDrr(p, 'B', 'D');},
    0x43: function(p){ops.LDrr(p, 'B', 'E');},
    0x44: function(p){ops.LDrr(p, 'B', 'H');},
    0x45: function(p){ops.LDrr(p, 'B', 'L');},
    0x46: function(p){ops.LDrrra(p, 'B', 'H', 'L');},
    0x47: function(p){ops.LDrr(p, 'B', 'A');},
    0x48: function(p){ops.LDrr(p, 'C', 'B');},
    0x49: function(p){ops.LDrr(p, 'C', 'C');},
    0x4A: function(p){ops.LDrr(p, 'C', 'D');},
    0x4B: function(p){ops.LDrr(p, 'C', 'E');},
    0x4C: function(p){ops.LDrr(p, 'C', 'H');},
    0x4D: function(p){ops.LDrr(p, 'C', 'L');},
    0x4E: function(p){ops.LDrrra(p, 'C', 'H', 'L');},
    0x4F: function(p){ops.LDrr(p, 'C', 'A');},

    0x50: function(p){ops.LDrr(p, 'D', 'B');},
    0x51: function(p){ops.LDrr(p, 'D', 'C');},
    0x52: function(p){ops.LDrr(p, 'D', 'D');},
    0x53: function(p){ops.LDrr(p, 'D', 'E');},
    0x54: function(p){ops.LDrr(p, 'D', 'H');},
    0x55: function(p){ops.LDrr(p, 'D', 'L');},
    0x56: function(p){ops.LDrrra(p, 'D', 'H', 'L');},
    0x57: function(p){ops.LDrr(p, 'D', 'A');},
    0x58: function(p){ops.LDrr(p, 'E', 'B');},
    0x59: function(p){ops.LDrr(p, 'E', 'C');},
    0x5A: function(p){ops.LDrr(p, 'E', 'D');},
    0x5B: function(p){ops.LDrr(p, 'E', 'E');},
    0x5C: function(p){ops.LDrr(p, 'E', 'H');},
    0x5D: function(p){ops.LDrr(p, 'E', 'L');},
    0x5E: function(p){ops.LDrrra(p, 'E', 'H', 'L');},
    0x5F: function(p){ops.LDrr(p, 'E', 'A');},

    0x60: function(p){ops.LDrr(p, 'H', 'B');},
    0x61: function(p){ops.LDrr(p, 'H', 'C');},
    0x62: function(p){ops.LDrr(p, 'H', 'D');},
    0x63: function(p){ops.LDrr(p, 'H', 'E');},
    0x64: function(p){ops.LDrr(p, 'H', 'H');},
    0x65: function(p){ops.LDrr(p, 'H', 'L');},
    0x66: function(p){ops.LDrrra(p, 'H', 'H', 'L');},
    0x67: function(p){ops.LDrr(p, 'H', 'A');},
    0x68: function(p){ops.LDrr(p, 'L', 'B');},
    0x69: function(p){ops.LDrr(p, 'L', 'C');},
    0x6A: function(p){ops.LDrr(p, 'L', 'D');},
    0x6B: function(p){ops.LDrr(p, 'L', 'E');},
    0x6C: function(p){ops.LDrr(p, 'L', 'H');},
    0x6D: function(p){ops.LDrr(p, 'L', 'L');},
    0x6E: function(p){ops.LDrrra(p, 'L', 'H', 'L');},
    0x6F: function(p){ops.LDrr(p, 'L', 'A');},

    0x70: function(p){ops.LDrrar(p, 'H', 'L', 'B');},
    0x71: function(p){ops.LDrrar(p, 'H', 'L', 'C');},
    0x72: function(p){ops.LDrrar(p, 'H', 'L', 'D');},
    0x73: function(p){ops.LDrrar(p, 'H', 'L', 'E');},
    0x74: function(p){ops.LDrrar(p, 'H', 'L', 'H');},
    0x75: function(p){ops.LDrrar(p, 'H', 'L', 'L');},
    0x76: function(p){p.clock.c+=4;},
    0x77: function(p){ops.LDrrar(p, 'H', 'L', 'A');},
    0x78: function(p){ops.LDrr(p, 'A', 'B');},
    0x79: function(p){ops.LDrr(p, 'A', 'C');},
    0x7A: function(p){ops.LDrr(p, 'A', 'D');},
    0x7B: function(p){ops.LDrr(p, 'A', 'E');},
    0x7C: function(p){ops.LDrr(p, 'A', 'H');},
    0x7D: function(p){ops.LDrr(p, 'A', 'L');},
    0x7E: function(p){ops.LDrrra(p, 'A', 'H', 'L');},
    0x7F: function(p){ops.LDrr(p, 'A', 'A');},

    0x80: function(p){ops.ADDrr(p, 'A', 'B');},
    0x81: function(p){ops.ADDrr(p, 'A', 'C');},
    0x82: function(p){ops.ADDrr(p, 'A', 'D');},
    0x83: function(p){ops.ADDrr(p, 'A', 'E');},
    0x84: function(p){ops.ADDrr(p, 'A', 'H');},
    0x85: function(p){ops.ADDrr(p, 'A', 'L');},
    0x86: function(p){},
    0x87: function(p){ops.ADDrr(p, 'A', 'A');},

    0xA0: function(p){ops.ANDr(p, 'B');},
    0xA1: function(p){ops.ANDr(p, 'C');},
    0xA2: function(p){ops.ANDr(p, 'D');},
    0xA3: function(p){ops.ANDr(p, 'E');},
    0xA4: function(p){ops.ANDr(p, 'H');},
    0xA5: function(p){ops.ANDr(p, 'L');},
    0xA6: function(p){},
    0xA7: function(p){ops.ANDr(p, 'A');},
    0xA8: function(p){ops.XORr(p, 'B');},
    0xA9: function(p){ops.XORr(p, 'C');},
    0xAA: function(p){ops.XORr(p, 'D');},
    0xAB: function(p){ops.XORr(p, 'E');},
    0xAC: function(p){ops.XORr(p, 'H');},
    0xAD: function(p){ops.XORr(p, 'L');},
    0xAE: function(p){},
    0xAF: function(p){ops.XORr(p, 'A');},

    0xB0: function(p){ops.ORr(p, 'B');},
    0xB1: function(p){ops.ORr(p, 'C');},
    0xB2: function(p){ops.ORr(p, 'D');},
    0xB3: function(p){ops.ORr(p, 'E');},
    0xB4: function(p){ops.ORr(p, 'H');},
    0xB5: function(p){ops.ORr(p, 'L');},
    0xB6: function(p){},
    0xB7: function(p){ops.ORr(p, 'A');}
};

var ops = {
    LDrrnn: function(p, r1, r2) {p.r[r2] = p.memory[p.r.pc];p.r[r1] = p.memory[p.r.pc+1]; p.r.pc+=2;p.clock.c += 12;},
    LDrrar: function(p, r1, r2, r3) {p.memory[(p.r[r1] << 8)+ p.r[r2]]=p.r[r3];p.clock.c += 8;},
    LDrrra: function(p, r1, r2, r3) {p.r[r1] = p.memory[(p.r[r2] << 8)+ p.r[r3]];p.clock.c += 8;},
    LDrn:   function(p, r1) {p.r[r1] = p.memory[p.r.pc++];p.clock.c += 8;},
    LDrr:   function(p, r1, r2) {p.r[r1] = p.r[r2];p.clock.c += 4;},
    INCrr:  function(p, r1, r2) {p.r[r2]=(p.r[r2]+1)&255; p.r[r2] == 0 ? p.r[r1] = (p.r[r1]+1)&255:null;p.clock.c += 8;},
    INCr:   function(p, r1) {p.r[r1] = (p.r[r1] + 1) & 255;p.clock.c += 4;},
    DECrr:  function(p, r1, r2) {p.r[r2] = (p.r[r2] - 1) & 255; if (p.r[r2] == 255) p.r[r1] = (p.r[r1] - 1) & 255;p.clock.c += 8;},
    DECr:   function(p, r1) {p.r[r1] = (p.r[r1] - 1) & 255;p.clock.c += 4;},
    ADDrr:  function(p, r1, r2) {var h=((p.r[r1]&0xF)+(p.r[r2]&0xF))&0x10;p.r[r1]+=p.r[r2];var c=p.r[r1]&0x100;p.r[r1]&=255;
        var f = 0;if (p.r[r1]==0)f+=0x80;if (h)f+=0x20;if (c)f+=0x10;p.r.F=f;
        p.clock.c += 4;},
    ORr:    function(p, r1) {p.r.A|=p.r[r1];p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 4;},
    ANDr:   function(p, r1) {p.r.A&=p.r[r1];p.r.F=(p.r.A==0)?0xA0:0x20;p.clock.c += 4;},
    XORr:   function(p, r1) {p.r.A^=p.r[r1];p.r.F=(p.r.A==0)?0x80:0x00;p.clock.c += 4;}
};
