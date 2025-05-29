import CPU from './cpu';

class Timer {
    DIV  = 0xFF04;
    TIMA = 0xFF05;
    TMA  = 0xFF06;
    TAC  = 0xFF07;

    mainTime  = 0;
    divTime   = 0;
    cpu;
    memory;

    constructor(cpu: CPU, memory) {
        this.cpu    = cpu;
        this.memory = memory;
    }

    update(clockElapsed: number) {
        this.updateDiv(clockElapsed);
        this.updateTimer(clockElapsed);
    }

    updateTimer(clockElapsed: number) {
        if (!(this.memory.rb(this.TAC) & 0x4)) {
            return;
        }
        this.mainTime += clockElapsed;

        let threshold = 64;
        switch (this.memory.rb(this.TAC) & 3) {
            case 0: threshold=64; break; // 4KHz
            case 1: threshold=1;  break; // 256KHz
            case 2: threshold=4;  break; // 64KHz
            case 3: threshold=16; break; // 16KHz
        }
        threshold *= 16;

        while (this.mainTime >= threshold) {
            this.mainTime -= threshold;

            this.memory.wb(this.TIMA, this.memory.rb(this.TIMA) + 1);
            if (this.memory.rb(this.TIMA) > 0xFF) {
                this.memory.wb(this.TIMA, this.memory.rb(this.TMA));
                this.cpu.requestInterrupt(CPU.INTERRUPTS.TIMER);
            }
        }
    }

    // Update the DIV register internal clock
    // Increment it if the clock threshold is elapsed and
    // reset it if its value overflows
    updateDiv(clockElapsed: number) {
        let divThreshold = 256; // DIV is 16KHz
        this.divTime += clockElapsed;
        if (this.divTime > divThreshold) {
            this.divTime -= divThreshold;
            let div = this.memory.rb(this.DIV) + 1;
            this.memory.wb(this.DIV, div&0xFF);
        }
    }

    resetDiv() {
        this.divTime = 0;
        this.memory[this.DIV] = 0; // direct write to avoid looping
    }
}

export default Timer;
