var APU = function(memory) {
    this.memory = memory;
    this.enabled = false;

    var audioContext = new AudioContext();
    this.channel1 = new Channel1(this, 1, audioContext);
    this.channel2 = new Channel1(this, 2, audioContext);
    this.channel3 = new Channel3(audioContext);
};
APU.prototype.update = function(clockElapsed) {
    if (this.enabled == false) return;

    this.channel1.update(clockElapsed);
    this.channel2.update(clockElapsed);
    this.channel3.update(clockElapsed);
};
APU.prototype.setSoundFlag = function(channel, value) {
    var mask = 0xFF - (1 << (channel - 1));
    value = value << (channel - 1)
    var byteValue = this.memory.rb(APU.registers.NR52);
    byteValue &= mask;
    byteValue |= value;
    this.memory[APU.registers.NR52] = byteValue;
}

APU.prototype.manageWrite = function(addr, value) {
    if (this.enabled == false && addr < APU.registers.NR52) {
        return;
    }
    this.memory[addr] = value;

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
            var envelopeVolume = (value & 0xF0) >> 4;
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
            frequency |= (value & 7) << 8;
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
            var envelopeVolume = (value & 0xF0) >> 4;
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
            frequency |= (value & 7) << 8;
            this.channel2.setFrequency(frequency);
            this.channel2.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) {
                this.channel2.play();
            }
            break;

        case 0xFF1A:
            // todo
            break;
        case 0xFF1B:
            this.channel3.setLength(value);
            break;
        case 0xFF1C:
            // todo
            break;
        case 0xFF1D:
            var frequency = this.channel3.getFrequency();
            frequency &= 0xF00;
            frequency |= value;
            this.channel3.setFrequency(frequency);
            break;
        case 0xFF1E:
            var frequency = this.channel3.getFrequency();
            frequency &= 0xFF;
            frequency |= (value & 7) << 8;
            this.channel3.setFrequency(frequency);
            this.channel3.lengthCheck = (value & 0x40) ? true : false;
            if (value & 0x80) {
                this.channel3.play();
            }
            break;
        case 0xFF30:case 0xFF31:case 0xFF32:case 0xFF33:case 0xFF34:case 0xFF35:case 0xFF36:case 0xFF37:
        case 0xFF38:case 0xFF39:case 0xFF3A:case 0xFF3B:case 0xFF3C:case 0xFF3D:case 0xFF3E:case 0xFF3F:
            var index = addr - 0xFF30;
            this.channel3.setWaveBufferByte(index, value);
            break;

        case 0xFF26:
            value &= 0xF0;
            this.memory[addr] = value;
            this.enabled = (value & 0x80) == 0 ? false : true;
            if (!this.enabled) {
                for (var i = 0xFF10; i < 0xFF27; i++)
                    this.memory[i] = 0;
                // todo stop sound
            }
            break;
    }
};

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

var Channel3 = function(audioContext) {
    this.playing = false;

    this.soundLength = 0;
    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.lengthCheck = false;

    this.clockLength = 0;

    this.buffer = new Float32Array(32);

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
    this.gainNode = gainNode;

    this.baseSpeed = 65536;
    var waveBuffer = audioContext.createBuffer(1, 32, this.baseSpeed);

    var bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = waveBuffer;
    bufferSource.loop = true;
    bufferSource.connect(gainNode);
    bufferSource.start();

    this.audioContext = audioContext;
    this.waveBuffer = waveBuffer;
    this.bufferSource = bufferSource;

};
Channel3.prototype.play = function() {
    this.playing = true;
    this.waveBuffer.copyToChannel(this.buffer, 0, 0);

    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
};
Channel3.prototype.stop = function() {
    this.playing = false;
    this.gainNode.disconnect();
};
Channel3.prototype.update = function(clockElapsed) {
    if (!this.playing) return;

    this.clockLength  += clockElapsed;

    if (this.lengthCheck && this.clockLength > this.soundLengthUnit * this.soundLength) {
        this.clockLength = 0;
        this.stop();
    }
};
Channel3.prototype.setFrequency = function(value) {
    value = 65536 / (2048  - value);
    this.bufferSource.playbackRate.value = value / this.baseSpeed;
};
Channel3.prototype.getFrequency = function() {
    var freq = 2048 - 65536 / (this.bufferSource.playbackRate.value * this.baseSpeed);
    return freq | 1;
};
Channel3.prototype.setLength = function(value) {
    this.soundLength = 256 - value;
};
Channel3.prototype.setWaveBufferByte = function(index, value) {
    var bufferIndex = index * 2;

    this.buffer[bufferIndex]   = (value >> 4) / 8 - 1; // value in buffer is in -1 -> 1
    this.buffer[bufferIndex+1] = (value & 0x0F) / 8 - 1;
};
Channel3.prototype.disable = function() {
    this.bufferSource.disconnect();
};
Channel3.prototype.enable = function() {
    this.bufferSource.connect(this.gainNode);
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
