import APU from './apu';
import {AbstractAudioChannel} from './channel';

class Channel1 extends AbstractAudioChannel {
    soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    soundLength = 64; // defaults to 64 periods
    lengthCheck = false;

    sweepTime = 0; // from 0 to 7
    sweepStepLength = 0x8000; // 1 / 128 seconds of instructions
    sweepCount = 0;
    sweepShifts = 0;
    sweepSign = 1; // +1 / -1 for increase / decrease freq

    frequency = 0;

    envelopeStep = 0;
    envelopeStepLength = 0x10000;// 1 / 64 seconds of instructions
    envelopeCheck = false;
    envelopeSign = 1;
    envelopeVolume;

    clockLength = 0;
    clockEnvelop = 0;
    clockSweep = 0;

    gainNode;
    oscillator;

    constructor(apu: APU, channelNumber, audioContext) {
        super();
        this.apu = apu;
        this.channelNumber = channelNumber;

        var gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        var oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = 1000;
        oscillator.connect(gainNode);
        oscillator.start(0);

        this.audioContext = audioContext;
        this.gainNode = gainNode;
        this.oscillator = oscillator;
    }

    play() {
        if (this.playing || !this.dac) return;
        this.playing = true;
        this.apu.setSoundFlag(this.channelNumber, 1);
        this.gainNode.connect(this.audioContext.destination);
        this.clockLength = 0;
        this.clockEnvelop = 0;
        this.clockSweep = 0;
        if (this.sweepShifts > 0) this.checkFreqSweep();
    }

    stop() {
        this.playing = false;
        this.apu.setSoundFlag(this.channelNumber, 0);
        this.gainNode.disconnect();
    }

    updateDAC(controlRegister: number): void {
        this.setDAC((controlRegister & 0xF8) > 0);
    }

    setDAC (value) {
        this.dac = value;
        if (!value) this.stop();
    }
    checkFreqSweep() {
        var oldFreq = this.getFrequency();
        var newFreq = oldFreq + this.sweepSign * (oldFreq >> this.sweepShifts);
        if (newFreq > 0x7FF) {
            newFreq = 0;
            this.stop();
        }

        return newFreq;
    }
    update(clockElapsed) {
        this.clockEnvelop += clockElapsed;
        this.clockSweep   += clockElapsed;

        if ((this.sweepCount || this.sweepTime) && this.clockSweep > (this.sweepStepLength * this.sweepTime)) {
            this.clockSweep -= (this.sweepStepLength * this.sweepTime);
            this.sweepCount--;

            var newFreq = this.checkFreqSweep(); // process and check new freq

            this.apu.memory[0xFF13] = newFreq & 0xFF;
            this.apu.memory[0xFF14] &= 0xF8;
            this.apu.memory[0xFF14] |= (newFreq & 0x700) >> 8;
            this.setFrequency(newFreq);

            this.checkFreqSweep(); // check again with new value
        }

        if (this.envelopeCheck && this.clockEnvelop > this.envelopeStepLength) {
            this.clockEnvelop -= this.envelopeStepLength;
            this.envelopeStep--;
            this.setEnvelopeVolume(this.envelopeVolume + this.envelopeSign);
            if (this.envelopeStep <= 0) {
                this.envelopeCheck = false;
            }
        }

        if (this.lengthCheck) {
            this.clockLength += clockElapsed;
            if (this.clockLength > this.soundLengthUnit) {
                this.soundLength--;
                this.clockLength -= this.soundLengthUnit;
                if (this.soundLength == 0) {
                    this.setLength(0);
                    this.stop();
                }
            }
        }
    }
    setFrequency(value) {
        this.frequency = value;
        this.oscillator.frequency.value = 131072 / (2048 - this.frequency);
    }
    getFrequency() {
        return this.frequency;
    }
    setLength(value) {
        this.soundLength = 64 - (value & 0x3F);
    }
    setEnvelopeVolume(volume) {
        this.envelopeCheck = volume > 0 && volume < 16;
        this.envelopeVolume = volume;
        this.gainNode.gain.value = this.envelopeVolume * 1/100;
    }
    disable() {
        this.oscillator.disconnect();
    }
    enable() {
        this.oscillator.connect(this.gainNode);
    }
}

export default Channel1;
