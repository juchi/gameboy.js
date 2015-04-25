var Memory = function() {
    this.addresses = {
        VRAM_START : 0x8000,
        VRAM_END   : 0x9FFF,

        EXTRAM_START : 0xA000,
        EXTRAM_END   : 0xBFFF,

        SPRITE_START : 0xFE00,
        SPRITE_END   : 0xFEFF
    };

    this.MEM_SIZE = 65536; // 64KB

    this.romBankNumber = 0;
    this.MBCtype = 0;
    this.banksize = 0x3FFF;
    this.rom = null;
};

Memory.prototype = new Array();

Memory.prototype.reset = function() {
    this.length = this.MEM_SIZE;
    for (var i = this.addresses.VRAM_START; i < this.addresses.VRAM_END; i++) {
        this[i] = 0;
    }
};

Memory.prototype.setRomData = function(data) {
    this.rom = data;

    this.loadRomBank(0);
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

Memory.prototype.deviceram = function(address) {
    if (address < this.addresses.DEVICERAM_START || address > this.addresses.DEVICERAM_END) {
        throw 'Device RAM access in out of bounds address ' + address;
    }

    return this[address];
};
Memory.prototype.wb = function(addr, value) {
    switch (addr & 0xF000) {
        case 0x0000: case 0x1000: // enable RAM
            break;
        case 0x2000: case 0x3000: // ROM bank number lower 5 bits
            value &= 0x1F;
            if (value == 0) value = 1;
            this.romBankNumber = (this.romBankNumber&0xE0) +value;
            this.loadRomBank(this.romBankNumber);
            break;
        default:
            this[addr] = value;
    }
}

Memory.readBit = function(byte, index) {
    return (byte >> index) & 1;
};
