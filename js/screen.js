var Screen = function(canvas, cpu) {
    cpu.screen = this;
    this.cpu = cpu;
    this.WIDTH = 160;
    this.HEIGHT = 144;
    this.PIXELSIZE = 2;
    this.FREQUENCY = 60;
    this.colors = [
        '#FFF',
        '#AAA',
        '#555',
        '#000'
    ];
    this.LCDC= 0xFF40;
    this.STAT= 0xFF41;
    this.SCY = 0xFF42;
    this.SCX = 0xFF43;
    this.LY  = 0xFF44;
    this.LYC = 0xFF45;

    this.vram = cpu.memory.vram.bind(cpu.memory);
    this.tilemap = {
        HEIGHT: 32,
        WIDTH: 32,
        START_0: 0x9800,
        START_1: 0x9C00,
        LENGTH: 0x0400 // 1024 bytes = 32*32
    };
    this.deviceram = cpu.memory.deviceram.bind(cpu.memory);
    this.VBLANK_TIME = 70224;
    this.clock = 0;
    this.mode = 2;
    this.line = 0;

    canvas.width = this.WIDTH * this.PIXELSIZE;
    canvas.height = this.HEIGHT * this.PIXELSIZE;

    this.context = canvas.getContext('2d');
};

Screen.prototype.update = function(clockElapsed) {
    this.clock += clockElapsed;

    switch (this.mode) {
        case 0: // HBLANK
            if (this.clock >= 204) {
                this.clock -= 204;
                this.line++;
                this.updateLY();
                if (this.line == 144) {
                    this.setMode(1);
                    this.cpu.requestInterrupt(Processor.INTERRUPTS.VBLANK);
                    this.drawFrame();
                } else {
                    this.setMode(2);
                }
            }
            break;
        case 1: // VBLANK
            if (this.clock >= 456) {
                this.clock -= 456;
                this.line++;
            }
            if (this.line > 153) {
                this.line = 0;
                this.setMode(2);
            }
            this.updateLY();
            break;
        case 2: // SCANLINE OAM
            if (this.clock >= 80) {
                this.clock -= 80;
                this.setMode(3);
            }
            break;
        case 3: // SCANLINE VRAM
            if (this.clock >= 172) {
                this.clock -= 172;
                this.setMode(0);
            }
            break;
    }
};

Screen.prototype.updateLY = function() {
    this.deviceram(this.LY, this.line);
    var STAT = this.deviceram(this.STAT);
    if (this.deviceram(this.LY) == this.deviceram(this.LYC)) {
        this.deviceram(this.STAT, STAT | (1 << 2));
        if (STAT & (1 << 6)) {
            this.cpu.requestInterrupt(Processor.INTERRUPTS.LCDC);
        }
    } else {
        this.deviceram(this.STAT, STAT & (0xFF - (1 << 2)));
    }
};

Screen.prototype.setMode = function(mode) {
    this.mode = mode;
    var newSTAT = this.deviceram(this.STAT);
    newSTAT &= 0xFC;
    newSTAT |= mode;
    this.deviceram(this.STAT, newSTAT);

    if (mode < 3) {
        if (newSTAT & (1 << (3+mode))) {
            this.cpu.requestInterrupt(Processor.INTERRUPTS.LCDC);
        }
    }
};

Screen.prototype.drawFrame = function() {

    this.clearScreen();
    var LCDC = this.deviceram(this.LCDC);
    var enable = Memory.readBit(LCDC, 7);
    if (enable) {
        this.drawBackground(LCDC);
        this.drawWindow();
    }
};

Screen.prototype.drawBackground = function(LCDC) {
    if (!Memory.readBit(LCDC, 0)) {
        return;
    }

    var buffer = new Array(256*256);
    var mapStart = Memory.readBit(LCDC, 3) ? this.tilemap.START_1 : this.tilemap.START_0;
    // browse BG tilemap
    for (var i = 0; i < this.tilemap.LENGTH; i++) {
        var tileIndex = this.vram(i + mapStart);

        var tileData = this.readTileData(tileIndex, LCDC);
        this.drawTile(tileData, i, buffer);
    }

    var bgx = this.deviceram(this.SCX);
    var bgy = this.deviceram(this.SCY);
    for (var x = 0; x < this.WIDTH; x++) {
        for (var y = 0; y < this.HEIGHT; y++) {
            color = buffer[((x+bgx) & 255) + ((y+bgy) & 255) * 256];
            this.drawPixel(x, y, color);
        }
    }
};

Screen.prototype.drawTile = function(tileData, index, buffer) {
    var x = index % 32;
    var y = (index / 32) | 0;

    for (var line = 0; line < 8; line++) {
        var b1 = tileData.shift();
        var b2 = tileData.shift();

        for (var pixel = 7; pixel >= 0; pixel--) {
            var colorValue = ((b1 & (1 << pixel)) >> pixel) + ((b2 & (1 << pixel)) >> pixel)*2;
            buffer[(x*8 + 7-pixel) + ((y*8)+line) * 256] = colorValue;
        }
    }
};

Screen.prototype.readTileData = function(tileIndex, LCDC) {
    var dataStart = Memory.readBit(LCDC, 4) ? 0x8000 : 0x8800;
    var tileSize  = 0x10; // 16 bytes / tile
    var tileData = new Array();

    tileStart = dataStart + (tileIndex*tileSize);
    for (var i = tileStart; i < tileStart + tileSize; i++) {
        tileData.push(this.vram(i));
    }

    return tileData;
};

Screen.prototype.drawWindow = function() {

};

Screen.prototype.clearScreen = function() {
    this.context.fillStyle = '#FFF';
    this.context.fillRect(0, 0, this.WIDTH * this.PIXELSIZE, this.HEIGHT * this.PIXELSIZE);
};
Screen.prototype.drawPixel = function(x, y, color) {
    if (this.colors[color] == '#FFF') {
        return;
    }
    this.context.fillStyle = this.colors[color];
    this.context.fillRect(x * this.PIXELSIZE, y * this.PIXELSIZE, this.PIXELSIZE, this.PIXELSIZE);
};
