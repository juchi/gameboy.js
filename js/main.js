// Gameboy class
//
// This object is the entry point of the application
// Will delegate user actions to the emulated devices
// and provide information where needed
var Gameboy = function(canvas) {
    var cpu = new CPU(this);
    var screen = new Screen(canvas, cpu);
    var input = new Input(cpu);
    cpu.input = input;
    this.input = input;
    this.cpu = cpu;
    this.screen = screen;

    var rom = new Rom();
    var that = this;

    this.statusContainer   = document.getElementById('status');
    this.gameNameContainer = document.getElementById('game-name');
    this.errorContainer    = document.getElementById('error');

    document.getElementById('file').addEventListener('change', function(e){
        rom.loadFromFile(e.target.files[0], that.startRom.bind(that));
    });
    document.addEventListener('keydown', function(e) {
        input.manageKeyboardPress(e.keyCode);
    });
    document.addEventListener('keyup', function(e) {
        input.manageKeyboardRelease(e.keyCode);
    });
};

Gameboy.prototype.startRom = function(rom) {
    if (!rom.validate()) {
        this.error('The file is not a valid GameBoy ROM.');
        return;
    }

    this.errorContainer.classList.add('hide');
    this.cpu.reset();
    try {
        this.cpu.loadRom(rom.data);
        this.setStatus('Game Running :');
        this.setGameName(this.cpu.getGameName());
        this.cpu.run();
    } catch (e) {
        this.handleException(e);
    }
};

Gameboy.prototype.pause = function(value) {
    if (value) {
        this.setStatus('Game Paused :');
        this.cpu.pause();
    } else {
        this.setStatus('Game Running :');
        this.cpu.unpause();
    }
};

Gameboy.prototype.error = function(message) {
    this.setStatus('Error during execution');
    this.setError('An error occurred during execution:' + message);
    this.cpu.stop();
};

Gameboy.prototype.setStatus = function(status) {
    this.statusContainer.innerHTML = status;
};
// Display an error message
Gameboy.prototype.setError = function(message) {
    this.errorContainer.classList.remove('hide');
    this.errorContainer.innerHTML = message;
};
// Display an error message
Gameboy.prototype.setGameName = function(name) {
    this.gameNameContainer.innerHTML = name;
};
Gameboy.prototype.setSoundEnabled = function(value) {
    if (value) {
        this.cpu.apu.connect();
    } else {
        this.cpu.apu.disconnect();
    }
};

Gameboy.prototype.handleException = function(e) {
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
