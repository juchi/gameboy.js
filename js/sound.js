var APU = function() {
    this.enabled = false;
    this.channel1 = new Channel1();
};
APU.prototype.update = function(clockElapsed) {
    if (this.enabled == false) return;

    this.channel1.update(clockElapsed);
};

APU.prototype.manageWrite = function(addr, value) {
    if (addr == 0xFF26) {
        this.enabled = (value & 0x80) == 0 ? false : true;
    }
};

var Channel1 = function() {
    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.soundLength = 64; // defaults to 64 periods
    this.envelopeStepLength = 0x10000;// 1/ 64 seconds of instructions

    this.clockLength = 0;
    this.clockEnvelop = 0;

    this.envelopeStep = 0;

    var audioContext = new AudioContext();
    var oscillator = audioContext.createOscillator();
    oscillator.connect(audioContext.destination);
    oscillator.type = 'square';
    oscillator.frequency.value = 1000;

    this.audioContext = audioContext;
    this.oscillator = oscillator;
};

Channel1.prototype.play = function() {
    this.oscillator.connect(this.audioContext.destination);
};
Channel1.prototype.stop = function() {
    this.oscillator.disconnect();
};
Channel1.prototype.update = function(clockElapsed) {
    this.clockLength += clockElapsed;
    this.clockEnvelop += clockElapsed;

    if (this.clockEnvelop > this.envelopeStepLength) {
        this.envelopeStep--;
        if (this.envelopeStep == 0) {
            this.stop();
        }
    }

    if (this.lengthCheck && this.clockLength > this.soundLengthUnit * this.soundLength) {
        this.stop();
    }
};
Channel1.prototype.setFrequency = function(value) {
    this.oscillator.frequency.value = value;
};
Channel1.prototype.getFrequency = function() {
    return this.oscillator.frequency.value;
};
Channel1.prototype.setLength = function(value) {
    this.soundLength = 64 - (value & 0x3F);
};

APU.registers = {
    NR10: 0xFF10,
    NR11: 0xFF11,
    NR12: 0xFF12,
    NR13: 0xFF13,
    NR14: 0xFF14,

    NR21: 0xFF16,
    NR22: 0xFF17,
    NR23: 0xFF18,
    NR24: 0xFF19,

    NR30: 0xFF1A,
    NR31: 0xFF1B,
    NR32: 0xFF1C,
    NR33: 0xFF1D,
    NR34: 0xFF1E,

    NR41: 0xFF20,
    NR42: 0xFF21,
    NR43: 0xFF22,
    NR44: 0xFF23,

    NR50: 0xFF24,
    NR51: 0xFF25,
    NR52: 0xFF26
};
