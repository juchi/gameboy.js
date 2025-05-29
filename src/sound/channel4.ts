import APU from './apu';
import {AbstractAudioChannel} from './channel';

class Channel4 extends AbstractAudioChannel {
    soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    soundLength = 64; // defaults to 64 periods
    lengthCheck = false;

    clockLength = 0;

    constructor(apu, channelNumber, audioContext) {
        super();
        this.apu = apu;
        this.channelNumber = channelNumber;

        this.audioContext = audioContext;
    }

    play() {
        if (this.playing || !this.dac) return;
        this.playing = true;
        this.apu.setSoundFlag(this.channelNumber, 1);
        this.clockLength = 0;
    }
    stop() {
        this.playing = false;
        this.apu.setSoundFlag(this.channelNumber, 0);
    }
    updateDAC(controlRegister) {
        this.setDAC((controlRegister & 0xF8) > 0);
    }
    setDAC(value) {
        this.dac = value;
        if (!value) this.stop();
    }
    update(clockElapsed) {
        if (this.lengthCheck) {
            this.clockLength  += clockElapsed;
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
    setLength(value) {
        this.soundLength = 64 - (value & 0x3F);
    }
}

export default Channel4;
