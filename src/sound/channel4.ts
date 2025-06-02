import APU from './apu';
import {AbstractAudioChannel} from './channel';

class Channel4 extends AbstractAudioChannel {
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

    update(clockElapsed) {
        this.checkLength(clockElapsed);
    }
    setLength(value) {
        this.soundLength = 64 - (value & 0x3F);
    }
}

export default Channel4;
