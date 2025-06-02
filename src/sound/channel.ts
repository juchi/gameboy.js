import APU from './apu'

interface AudioChannel {
    play(): void;
    stop(): void;
    updateDAC(controlRegister: number): void;
    update(clockElapsed: number): void;
}

abstract class AbstractAudioChannel implements AudioChannel {
    apu: APU;
    channelNumber: number;
    audioContext: AudioContext;
    playing: boolean = false;
    dac: boolean = false;
    lengthCheck = false;
    clockLength = 0;
    soundLength = 64; // defaults to 64 periods
    soundLengthUnit = 0x4000; // 1 / 256 second of instructions

    abstract play(): void;
    abstract stop(): void;
    abstract updateDAC(controlRegister: number): void;
    abstract update(clockElapsed: number): void;
    abstract setLength(value: number): void;

    checkLength(clockElapsed: number) {
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

    protected setDAC(value: boolean) {
        this.dac = value;
        if (!value) this.stop();
    }
}

export {AudioChannel, AbstractAudioChannel};
