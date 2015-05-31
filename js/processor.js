var Processor = function() {
    this.interruptRoutines = {
        0: function(p){ops.RSTn(p, 0x40);},
        1: function(p){ops.RSTn(p, 0x48);},
        2: function(p){ops.RSTn(p, 0x50);},
        3: function(p){ops.RSTn(p, 0x58);},
        4: function(p){ops.RSTn(p, 0x60);}
    };

    this.r = {A:0, F: 0, B:0, C:0, D:0, E:0, H:0, L:0, pc:0, sp:0};
    this.IME = true;
    this.clock = {c: 0, serial: 0};
    this.isHalted = false;
    this.isPaused = false;
    this.usingBootRom = false;

    this.createDevices();
};

Processor.INTERRUPTS = {
    VBLANK: 0,
    LCDC:   1,
    TIMER:  2,
    SERIAL: 3,
    HILO:   4
};

Processor.prototype.createDevices = function() {
    this.memory = new Memory(this);
    this.timer = new Timer(this, this.memory);
    this.input = null;
    this.apu = new APU(this.memory);

    this.SERIAL_INTERNAL_INSTR = 512; // instr to wait per bit if internal clock
    this.enableSerial = 0;
    this.serialHandler = ConsoleSerial;
};

Processor.prototype.reset = function() {
    this.memory.reset();

    this.r.sp = 0xFFFE;
};

Processor.prototype.loadRom = function(data) {
    this.memory.setRomData(data);
};

Processor.prototype.getRamSize = function() {
    var size = 0;
    switch (this.memory.rb(0x149)) {
        case 1:
            size = 2048;
            break;
        case 2:
            size = 2048 * 4;
            break;
        case 3:
            size = 2048 * 16;
            break;
    }

    return size;
};

Processor.prototype.getGameName = function() {
    var name = '';
    for (var i = 0x134; i < 0x143; i++) {
        var char = this.memory.rb(i) || 32;
        name += String.fromCharCode(char);
    }

    return name;
};

Processor.prototype.run = function() {
    if (this.usingBootRom) {
        this.r.pc = 0x0000;
    } else {
        this.r.pc = 0x0100;
    }
    this.frame();
};

Processor.prototype.stop = function() {
    clearTimeout(this.nextFrameTimer);
};

Processor.prototype.frame = function() {
    if (!this.isPaused) {
        this.nextFrameTimer = setTimeout(this.frame.bind(this), 1000 / Screen.physics.FREQUENCY);
    }

    this.clock.c = 0;
    var vblank = false;

    while (!vblank) {
        var oldInstrCount = this.clock.c;
        if (!this.isHalted) {
            var opcode = this.fetchOpcode();
            map[opcode](this);
            this.r.F &= 0xF0; // tmp fix

            if (this.enableSerial) {
                var instr = this.clock.c - oldInstrCount;
                this.clock.serial += instr;
                if (this.clock.serial >= 8 * this.SERIAL_INTERNAL_INSTR) {
                    this.endSerialTransfer();
                }
            }
        } else {
            this.clock.c += 4;
        }

        var elapsed = this.clock.c - oldInstrCount;
        vblank = this.screen.update(elapsed);
        this.timer.update(elapsed);
        this.input.update();
        this.apu.update(elapsed);
        this.checkInterrupt();
    }
};

Processor.prototype.fetchOpcode = function() {
    var opcode = this.memory.rb(this.r.pc++);
    if (opcode === undefined) {console.log(opcode + ' at ' + (this.r.pc-1).toString(16));this.stop();return;}
    if (!map[opcode]) {
        console.error('Unknown opcode '+opcode.toString(16)+' at address '+(this.r.pc-1).toString(16)+', stopping execution...');
        this.stop();
        return null;
    }

    return opcode;
};

// read register
Processor.prototype.rr = function(register) {
    return this.r[register];
};

// write register
Processor.prototype.wr = function(register, value) {
    this.r[register] = value;
};

Processor.prototype.halt = function() {
    this.isHalted = true;
};
Processor.prototype.unhalt = function() {
    this.isHalted = false;
};
Processor.prototype.pause = function() {
    this.isPaused = true;
};
Processor.prototype.unpause = function() {
    if (this.isPaused) {
        this.isPaused = false;
        this.frame();
    }
};

Processor.prototype.checkInterrupt = function() {
    if (!this.IME) {
        return;
    }
    for (var i = 0; i < 5; i++) {
        var IFval = this.memory.rb(0xFF0F);
        if (Memory.readBit(IFval, i) && this.isInterruptEnable(i)) {
            IFval &= (0xFF - (1<<i));
            this.memory.wb(0xFF0F, IFval);
            this.disableInterrupts();
            this.clock.c += 4; // 20 clocks to serve interrupt, with 16 for RSTn
            this.interruptRoutines[i](this);
            break;
        }
    }
};

Processor.prototype.requestInterrupt = function(type) {
    var IFval = this.memory.rb(0xFF0F);
    IFval |= (1 << type)
    this.memory.wb(0xFF0F, IFval) ;
    this.unhalt();
};

Processor.prototype.isInterruptEnable = function(type) {
    return Memory.readBit(this.memory.rb(0xFFFF), type) != 0;
};

Processor.prototype.enableInterrupts = function() {
    this.IME = true;
};
Processor.prototype.disableInterrupts = function() {
    this.IME = false;
};

Processor.prototype.enableSerialTransfer = function() {
    this.enableSerial = 1;
    this.clock.serial = 0;
};

Processor.prototype.endSerialTransfer = function() {
    this.enableSerial = 0;
    var data = this.memory.rb(0xFF01);
    this.memory.wb(0xFF02, 0);
    this.serialHandler.out(data);
    this.memory.wb(0xFF01, this.serialHandler.in());
};

Processor.prototype.resetDivTimer = function() {
    this.timer.resetDiv();
};
