var Gameboy = function(canvas) {
    var cpu = new Processor();
    var screen = new Screen(canvas, cpu);
    var input = new Input(cpu);
    cpu.input = input;
    this.input = input;
    this.cpu = cpu;
    this.screen = screen;

    var rom = new Rom();
    var that = this;

    this.statusContainer = document.getElementById('status');
    this.gameNameContainer = document.getElementById('game-name');

    document.getElementById('file').addEventListener('change', function(e){
        rom.load(e.target.files[0], that.startRom.bind(that));
    });
    document.addEventListener('keydown', function(e) {
        input.manageKeyboardPress(e.keyCode);
    });
    document.addEventListener('keyup', function(e) {
        input.manageKeyboardRelease(e.keyCode);
    });
};

Gameboy.prototype.startRom = function(data) {
    this.cpu.reset();
    this.cpu.loadRom(data);
    this.setStatus('Game Running :');
    this.setGameName(this.cpu.getGameName());
    this.cpu.run();
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

Gameboy.prototype.setStatus = function(status) {
    this.statusContainer.innerText = status;
};

Gameboy.prototype.setGameName = function(name) {
    this.gameNameContainer.innerText = name;
};
Gameboy.prototype.setSoundEnabled = function(value) {
    if (value) {
        this.cpu.apu.connect();
    } else {
        this.cpu.apu.disconnect();
    }
};
