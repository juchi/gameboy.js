var Timer = function(cpu, memory) {
    this.cpu    = cpu;
    this.memory = memory;

    this.DIV  = 0xFF04;
    this.TIMA = 0xFF05;
    this.TMA  = 0xFF06;
    this.TAC  = 0xFF07;

    this.mainTime  = 0;
    this.divTime   = 0;
};

Timer.prototype.tick = function(clockElapsed) {
    this.updateDiv(clockElapsed);
    this.updateTimer(clockElapsed);
};

Timer.prototype.updateTimer = function(clockElapsed) {
    if (!(this.memory[this.TAC]&0x4)) {
        return;
    }
    this.mainTime += clockElapsed;

    var threshold = 64;
    switch (this.memory[this.TAC]&3) {
        case 0: threshold=64; break; // 4KHz
        case 1: threshold=1;  break; // 256KHz
        case 2: threshold=4;  break; // 64KHz
        case 3: threshold=16; break; // 16KHz
    }
    threshold *= 16;

    while (this.mainTime >= threshold) {
        this.mainTime -= threshold;

        this.memory[this.TIMA]++;
        if (this.memory[this.TIMA] > 0xFF) {
            this.memory.wb(this.TIMA, this.memory[this.TMA]);
            this.cpu.requestInterrupt(this.cpu.INTERRUPTS.TIMER);
        }
    }
};

Timer.prototype.updateDiv = function(clockElapsed) {
    var divThreshold = 256; // DIV is 16KHz
    if (this.divTime > divThreshold) {
        this.divTime -= divThreshold;
        var div = this.memory[this.DIV] + 1;
        this.memory.wb(this.DIV, div&0xFF);
    }
};
