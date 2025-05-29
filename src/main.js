import Rom from './rom/rom';
import RomFileReader from './rom/file_reader';
import RomDropFileReader from './rom/drop_file_reader';
import RomAjaxReader from './rom/ajax_reader';
import Keyboard from './input/keyboard';
import Util from './util';
import CPU from './cpu';
import GPU from './display/gpu';
import Screen from './display/screen';
import Input from './input/input';
import UnimplementedException from './exception';
import Debug from './debug';

let defaultOptions = {
    pad: {class: Keyboard, mapping: null},
    zoom: 1,
    romReaders: [],
    statusContainerId: 'status',
    gameNameContainerId: 'game-name',
    errorContainerId: 'error'
};

// Gameboy class
//
// This object is the entry point of the application
// Will delegate user actions to the emulated devices
// and provide information where needed
class Gameboy {
    constructor(canvas, options) {
        options = options || {};
        this.options = Util.extend({}, defaultOptions, options);

        var cpu = new CPU(this);
        var screen = new Screen(canvas, this.options.zoom);
        var gpu = new GPU(screen, cpu);
        cpu.gpu = gpu;

        var pad = new this.options.pad.class(this.options.pad.mapping);
        var input = new Input(cpu, pad, canvas);
        cpu.input = input;

        this.cpu = cpu;
        this.screen = screen;
        this.input = input;
        this.pad = pad;

        this.createRom(this.options.romReaders);

        this.statusContainer   = document.getElementById(this.options.statusContainerId) || document.createElement('div');
        this.gameNameContainer = document.getElementById(this.options.gameNameContainerId) || document.createElement('div');
        this.errorContainer    = document.getElementById(this.options.errorContainerId) || document.createElement('div');
    }

    // Create the ROM object and bind one or more readers
    createRom(readers) {
        var rom = new Rom(this);
        if (readers.length == 0) {
            // add the default rom reader
            var romReader = new RomFileReader();
            rom.addReader(romReader);
        } else {
            for (var i in readers) {
                if (readers.hasOwnProperty(i)) {
                    rom.addReader(readers[i]);
                }
            }
        }
    }

    startRom(rom) {
        this.errorContainer.classList.add('hide');
        this.cpu.reset();
        try {
            this.cpu.loadRom(rom.data);
            this.setStatus('Game Running :');
            this.setGameName(this.cpu.getGameName());
            this.cpu.run();
            this.screen.canvas.focus();
        } catch (e) {
            this.handleException(e);
        }
    }

    pause(value) {
        if (value) {
            this.setStatus('Game Paused :');
            this.cpu.pause();
        } else {
            this.setStatus('Game Running :');
            this.cpu.unpause();
        }
    }

    error(message) {
        this.setStatus('Error during execution');
        this.setError('An error occurred during execution:' + message);
        this.cpu.stop();
    }

    setStatus(status) {
        this.statusContainer.innerHTML = status;
    }

    // Display an error message
    setError(message) {
        this.errorContainer.classList.remove('hide');
        this.errorContainer.innerHTML = message;
    }

    // Display the name of the game running
    setGameName(name) {
        this.gameNameContainer.innerHTML = name;
    }

    setSoundEnabled(value) {
        if (value) {
            this.cpu.apu.connect();
        } else {
            this.cpu.apu.disconnect();
        }
    }
    setScreenZoom(value) {
        this.screen.setPixelSize(value);
    }
    handleException(e) {
        if (e instanceof UnimplementedException) {
            if (e.fatal) {
                this.error('This cartridge is not supported ('+ e.message +')');
            } else {
                console.error(e.message);
            }
        } else {
            throw e;
        }
    }
}

export {
    Gameboy,
    RomFileReader,
    RomDropFileReader,
    RomAjaxReader,
    Util,
    Debug
};
