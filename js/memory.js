var Memory = function(cpu) {
    this.addresses = {
        VRAM_START : 0x8000,
        VRAM_END   : 0x9FFF,

        EXTRAM_START : 0xA000,
        EXTRAM_END   : 0xBFFF,

        SPRITE_START : 0xFE00,
        SPRITE_END   : 0xFEFF,

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
    this.mbc = MBC.getMbcInstance(this, this[0x147]);
    this.loadRomBank(1);
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

Memory.prototype.rb = function (addr) {
    return this[addr];
};

Memory.prototype.wb = function(addr, value) {
    if (addr < 0x8000) {
        this.mbc.manageWrite(addr, value);
    } else {
        this[addr] = value;
        if ((addr & 0xF000) == 0xF000) {
            if (addr == 0xFF02) {
                if (value & 0x80) {
                    this.cpu.enableSerialTransfer();
                }
            }
            if (addr == 0xFF04) {
                this.cpu.resetDivTimer();
            }
        }
        this[addr] = value;
    }
}

Memory.readBit = function(byte, index) {
    return (byte >> index) & 1;
};
