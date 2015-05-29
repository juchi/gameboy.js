var Channel1 = function(apu, channelNumber, audioContext) {
    this.apu = apu;
    this.channelNumber = channelNumber;
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
    this.envelopeSign = 1;

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
    this.apu.setSoundFlag(this.channelNumber, 1);
    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
    this.clockEnvelop = 0;
    this.clockSweep = 0;
};
Channel1.prototype.stop = function() {
    this.playing = false;
    this.apu.setSoundFlag(this.channelNumber, 0);
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
        this.setEnvelopeVolume(this.envelopeVolume + this.envelopeSign);
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
    this.oscillator.frequency.value = 131072 / (2048 - value);
};
Channel1.prototype.getFrequency = function() {
    return 2048 - 131072 / this.oscillator.frequency.value;
};
Channel1.prototype.setLength = function(value) {
    this.soundLength = 64 - (value & 0x3F);
};
Channel1.prototype.setEnvelopeVolume = function(volume) {
    this.envelopeCheck = volume > 0 && volume < 16 ? true : false;
    if (!this.envelopeCheck)this.stop();
    this.envelopeVolume = volume;
    this.gainNode.gain.value = this.envelopeVolume * 1/100;
};
Channel1.prototype.disable = function() {
    this.oscillator.disconnect();
};
Channel1.prototype.enable = function() {
    this.oscillator.connect(this.gainNode);
};
