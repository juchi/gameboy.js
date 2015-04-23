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
};

Memory.prototype = new Array();

Memory.prototype.reset = function() {
    this.length = this.MEM_SIZE;
    for (var i = this.addresses.VRAM_START; i < this.addresses.VRAM_END; i++) {
        this[i] = 0;
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

Memory.readBit = function(byte, index) {
    return (byte >> index) & 1;
};
