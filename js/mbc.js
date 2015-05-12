var MBC = {};

MBC.getMbcInstance = function(memory, type) {
    var instance;
    switch (type) {
        case 0x00:
            instance = new MBCdummy();
            break;
        case 0x01:
            instance = new MBC1(memory);
            break;
        case 0x13:
            instance = new MBC3(memory);
            break;
        default:
            throw 'MBC type not supported';
    }

    return instance;
};

var MBC1 = function(memory) {
    this.memory = memory;
    this.romBankNumber = 1;
    this.mode = 0;
};

MBC1.prototype.manageWrite = function(addr, value) {
    switch (addr & 0xF000) {
        case 0x0000: case 0x1000: // enable RAM
            this.ram = value&0x0A ? 1 : 0;
            break;
        case 0x2000: case 0x3000: // ROM bank number lower 5 bits
            value &= 0x1F;
            if (value == 0) value = 1;
            var mask = this.mode ? 0 : 0xE0;
            this.romBankNumber = (this.romBankNumber & mask) +value;
            console.log('switch ROM bank to '+ this.romBankNumber);
            this.memory.loadRomBank(this.romBankNumber);
            break;
        case 0x4000: case 0x5000: // RAM bank or high bits ROM
            value &= 0x03;
            this.romBankNumber = (this.romBankNumber&0x1F) | (value << 5);
            console.log('switch ROM bank to '+ this.romBankNumber);
            this.memory.loadRomBank(this.romBankNumber);
            break;
        case 0x6000: case 0x7000: // ROM / RAM mode
            this.mode = value & 1;
            break;
        case 0xA000: case 0xB000:
            console.error('external ram not supported');
            break;
    }
};

var MBC3 = function(memory) {
    this.memory = memory;
    this.romBankNumber = 1;
    this.mode = 0;
};

MBC3.prototype.manageWrite = function(addr, value) {
    switch (addr & 0xF000) {
        case 0x0000: case 0x1000: // enable RAM
            this.ram = value&0x0A ? 1 : 0;
            break;
        case 0x2000: case 0x3000: // ROM bank number lower 5 bits
            value &= 0x7F;
            if (value == 0) value = 1;
            this.romBankNumber = value;
            this.memory.loadRomBank(this.romBankNumber);
            break;
        case 0x4000: case 0x5000: // RAM bank
            console.log('RAM bank not supported')
            break;
        case 0x6000: case 0x7000: // ROM / RAM mode
            this.mode = value & 1;
            break;
        case 0xA000: case 0xB000:
            console.error('external ram not supported');
            break;
    }
};

var MBCdummy = function() {};

MBCdummy.prototype.manageWrite = function() {
    console.error('ROM writing is not supported with MBC type 0');
};
