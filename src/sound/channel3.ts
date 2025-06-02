import APU from './apu';
import {AbstractAudioChannel} from './channel';

class Channel3 extends AbstractAudioChannel {
    soundLengthUnit = 0x4000; // 1 / 256 second of instructions

    buffer;
    gainNode;
    baseSpeed = 65536;

    waveBuffer;
    bufferSource;

    constructor(apu: APU, channelNumber, audioContext) {
        super();
        this.apu = apu;
        this.channelNumber = channelNumber;

        this.buffer = new Float32Array(32);

        var gainNode = audioContext.createGain();
        gainNode.gain.value = 1;
        this.gainNode = gainNode;

        var waveBuffer = audioContext.createBuffer(1, 32, this.baseSpeed);

        var bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = waveBuffer;
        bufferSource.loop = true;
        bufferSource.connect(gainNode);
        bufferSource.start(0);

        this.audioContext = audioContext;
        this.waveBuffer = waveBuffer;
        this.bufferSource = bufferSource;
    }

    play() {
        if (this.playing || !this.dac) return;
        this.playing = true;
        this.apu.setSoundFlag(this.channelNumber, 1);
        this.waveBuffer.copyToChannel(this.buffer, 0, 0);

        this.gainNode.connect(this.audioContext.destination);
        this.clockLength = 0;
    }
    stop() {
        this.playing = false;
        this.apu.setSoundFlag(this.channelNumber, 0);
        this.gainNode.disconnect();
    };
    updateDAC(controlRegister) {
        this.setDAC((controlRegister & 0x80) > 0);
    }

    update(clockElapsed) {
        this.checkLength(clockElapsed);
    }
    setFrequency(value) {
        value = 65536 / (2048  - value);
        this.bufferSource.playbackRate.value = value / this.baseSpeed;
    }
    getFrequency() {
        var freq = 2048 - 65536 / (this.bufferSource.playbackRate.value * this.baseSpeed);
        return freq | 1;
    }
    setLength(value) {
        this.soundLength = 256 - value;
    }
    setWaveBufferByte(index, value) {
        var bufferIndex = index * 2;

        this.buffer[bufferIndex]   = (value >> 4) / 8 - 1; // value in buffer is in -1 -> 1
        this.buffer[bufferIndex+1] = (value & 0x0F) / 8 - 1;
    }
    disable() {
        this.bufferSource.disconnect();
    }
    enable() {
        this.bufferSource.connect(this.gainNode);
    }
}

export default Channel3;
