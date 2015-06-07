var GameboyJS;
(function (GameboyJS) {
"use strict";

// Memory unit
var Memory = function(cpu) {
    this.addresses = {
        VRAM_START : 0x8000,
        VRAM_END   : 0x9FFF,

        EXTRAM_START : 0xA000,
        EXTRAM_END   : 0xBFFF,

        OAM_START : 0xFE00,
        OAM_END   : 0xFE9F,

        DEVICE_START: 0xFF00,
        DEVICE_END:   0xFF7F
    };

    this.MEM_SIZE = 65536; // 64KB

    this.MBCtype = 0;
    this.banksize = 0x4000;
    this.rom = null;
    this.mbc = null;
    this.cpu = cpu;
};

// Memory can be accessed as an Array
Memory.prototype = new Array();

Memory.prototype.reset = function() {
    this.length = this.MEM_SIZE;
    for (var i = this.addresses.VRAM_START; i <= this.addresses.VRAM_END; i++) {
        this[i] = 0;
    }
    for (var i = this.addresses.DEVICE_START; i <= this.addresses.DEVICE_END; i++) {
        this[i] = 0;
    }
    this[0xFFFF] = 0;
};

Memory.prototype.setRomData = function(data) {
    this.rom = data;
    this.loadRomBank(0);
    this.mbc = GameboyJS.MBC.getMbcInstance(this, this[0x147]);
    this.loadRomBank(1);
    this.mbc.loadRam(this.cpu.getGameName(), this.cpu.getRamSize());
};

Memory.prototype.loadRomBank = function(index) {
    var start = index ? 0x4000 : 0x0;
    var romStart = index * 0x4000;
    for (var i = 0; i < this.banksize; i++) {
        this[i + start] = this.rom[romStart + i];
    }
};

Memory.prototype.vram = function(address) {
    if (address < this.addresses.VRAM_START || address > this.addresses.VRAM_END) {
        throw 'VRAM access in out of bounds address ' + address;
    }

    return this[address];
};

Memory.prototype.oamram = function(address) {
    if (address < this.addresses.OAM_START || address > this.addresses.OAM_END) {
        throw 'OAMRAM access in out of bounds address ' + address;
    }

    return this[address];
};

Memory.prototype.deviceram = function(address, value) {
    if (address < this.addresses.DEVICERAM_START || address > this.addresses.DEVICERAM_END) {
        throw 'Device RAM access in out of bounds address ' + address;
    }
    if (typeof value === "undefined") {
        return this[address];
    } else {
        this[address] = value;
    }

};

// Memory read proxy function
// Used to centralize memory read access
Memory.prototype.rb = function (addr) {
    if (addr >= 0xFF10 && addr < 0xFF40) {
        var mask = apuMask[addr - 0xFF10];
        return this[addr] | mask;
    }
    if ((addr >= 0xA000 && addr < 0xC000)) {
        return this.mbc.readRam(addr);
    }
    return this[addr];
};

var apuMask = [
0x80,0x3F,0x00,0xFF,0xBF, // NR10-NR15
0xFF,0x3F,0x00,0xFF,0xBF, // NR20-NR25
0x7F,0xFF,0x9F,0xFF,0xBF, // NR30-NR35
0xFF,0xFF,0x00,0x00,0xBF, // NR40-NR45
0x00,0x00,0x70,           // NR50-NR52
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // Wave RAM
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
];

// Memory write proxy function
// Used to centralize memory writes and delegate specific behaviour
// to the correct units
Memory.prototype.wb = function(addr, value) {
    if (addr < 0x8000 || (addr >= 0xA000 && addr < 0xC000)) {
        this.mbc.manageWrite(addr, value);
    } else if (addr >= 0xFF10 && addr <= 0xFF3F) { // sound registers
        this.cpu.apu.manageWrite(addr, value);
    } else {
        this[addr] = value;
        if ((addr & 0xFF00) == 0xFF00) {
            if (addr == 0xFF02) {
                if (value & 0x80) {
                    this.cpu.enableSerialTransfer();
                }
            }
            if (addr == 0xFF04) {
                this.cpu.resetDivTimer();
            }
            if (addr == 0xFF46) { // OAM DMA transfer
                this.dmaTransfer(value);
            }
        }
    }
}

// Start a DMA transfer (OAM data from cartrige to RAM)
Memory.prototype.dmaTransfer = function(startAddressPrefix) {
    var startAddress = (startAddressPrefix << 8);
    for (var i = 0; i < 0xA0; i++) {
        this[this.addresses.OAM_START + i] = this[startAddress + i];
    }
};

// Helper to extract a bit from a byte
Memory.readBit = function(byte, index) {
    return (byte >> index) & 1;
};
GameboyJS.Memory = Memory;
}(GameboyJS || (GameboyJS = {})));
