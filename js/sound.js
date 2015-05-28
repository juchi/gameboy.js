var APU = function() {
    this.enabled = false;

    var audioContext = new AudioContext();
    this.channel1 = new Channel1(audioContext);
    this.channel2 = new Channel1(audioContext);
};
APU.prototype.update = function(clockElapsed) {
    if (this.enabled == false) return;

    this.channel1.update(clockElapsed);
    this.channel2.update(clockElapsed);
};

APU.prototype.manageWrite = function(addr, value) {
    if (addr == 0xFF26) {
        this.enabled = (value & 0x80) == 0 ? false : true;
        if (!this.enabled) {
            // todo stop sound
        }
    }
    switch (addr) {
        case 0xFF10:
            this.sweepTime = ((value & 0x70) >> 4)&7;
            this.sweepSign = (value & 0x08) ? -1 : 1;
            this.sweepShifts = (value & 0x7);
            this.sweepCount = this.sweepShifts;
            break;
        case 0xFF11:
            // todo : bits 6-7
            this.channel1.setLength(value & 0x3F);
            break;
        case 0xFF12:
            // todo : bit 3
            var envelopeVolume = (value & 0x70) >> 4;
            this.channel1.setEnvelopeVolume(envelopeVolume);
            this.channel1.envelopeStep = (value & 0x07);
            break;
        case 0xFF13:
            var frequency = this.channel1.getFrequency();
            frequency &= 0xF00;
            frequency |= value;
            this.channel1.setFrequency(frequency);
            break;
        case 0xFF14:
            var frequency = this.channel1.getFrequency();
            frequency &= 0xFF;
            frequency |= (value & 3) << 8;
            this.channel1.setFrequency(frequency);
            this.channel1.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) this.channel1.play();
            break;


        case 0xFF16:
            // todo : bits 6-7
            this.channel2.setLength(value & 0x3F);
            break;
        case 0xFF17:
            // todo : bit 3
            var envelopeVolume = (value & 0x70) >> 4;
            this.channel2.setEnvelopeVolume(envelopeVolume);
            this.channel2.envelopeStep = (value & 0x07);
            break;
        case 0xFF18:
            var frequency = this.channel2.getFrequency();
            frequency &= 0xF00;
            frequency |= value;
            this.channel2.setFrequency(frequency);
            break;
        case 0xFF19:
            var frequency = this.channel2.getFrequency();
            frequency &= 0xFF;
            frequency |= (value & 3) << 8;
            this.channel2.setFrequency(frequency);
            this.channel2.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) this.channel2.play();
            break;
    }
};

var Channel1 = function(audioContext) {
    this.playing = false;

    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.soundLength = 64; // defaults to 64 periods
    this.lengthCheck = false;

    this.sweepTime = 0; // from 0 to 7
    this.sweepStepLength = 0x8000; // 1 / 128 seconds of instructions
    this.sweepCount = 0;
    this.sweepShifts = 0;
    this.sweepSign = 1; // +1 / -1 for increase / decrease freq

    this.envelopeStep = 0;
    this.envelopeStepLength = 0x10000;// 1 / 64 seconds of instructions
    this.envelopeCheck = false;

    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    var oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 1000;
    oscillator.connect(gainNode);
    oscillator.start();

    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.oscillator = oscillator;
};

Channel1.prototype.play = function() {
    this.playing = true;
    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;
};
Channel1.prototype.stop = function() {
    this.playing = false;
    this.gainNode.disconnect();
};
Channel1.prototype.update = function(clockElapsed) {
    if (!this.playing) return;

    this.clockLength  += clockElapsed;
    this.clockEnvelop += clockElapsed;
    this.clockSweep   += clockElapsed;

    if (this.sweepCount && this.clockSweep > (this.sweepStepLength * this.sweepTime)) {
        this.clockSweep -= (this.sweepStepLength * this.sweepTime);
        this.sweepCount--;
        var oldFreq = this.getFrequency();
        this.setFrequency(oldFreq + this.sweepSign * oldFreq / Math.pow(2, this.sweepShifts));
    }

    if (this.envelopeCheck && this.clockEnvelop > this.envelopeStepLength) {
        this.clockEnvelop -= this.envelopeStepLength;
        this.envelopeStep--;
        this.setEnvelopeVolume(this.envelopeVolume - 1);
        if (this.envelopeStep <= 0) {
            this.envelopeCheck = false;
        }
    }

    if (this.lengthCheck && this.clockLength > this.soundLengthUnit * this.soundLength) {
        this.clockLength = 0;
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
Channel1.prototype.setEnvelopeVolume = function(volume) {
    this.envelopeCheck = volume ? true : false;
    this.envelopeVolume = volume;
    this.gainNode.gain.value = this.envelopeVolume * 1/100;
}

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
