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

    abstract play(): void;
    abstract stop(): void;
    abstract updateDAC(controlRegister: number): void;
    abstract update(clockElapsed: number): void;
}

export {AudioChannel, AbstractAudioChannel};
