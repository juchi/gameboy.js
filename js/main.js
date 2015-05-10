var Gameboy = function(canvas) {
    var cpu = new Processor();
    var screen = new Screen(canvas, cpu);
    this.cpu = cpu;
    this.screen = screen;

    var rom = new Rom();
    var that = this;
    document.getElementById('file').addEventListener('change', function(e){
        rom.load(e.target.files[0], that.startRom.bind(that));
    });
};

Gameboy.prototype.startRom = function(data) {
    this.cpu.reset();
    this.cpu.loadRom(data);
    this.cpu.run();
};

Gameboy.prototype.pause = function(value) {
    if (value) {
        this.cpu.pause();
    } else {
        this.cpu.unpause();
    }
};
