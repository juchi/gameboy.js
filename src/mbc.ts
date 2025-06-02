import ExtRam from './ext_ram';
import Memory from './memory';
import UnimplementedException from './exception';

// Memory bank controllers

abstract class MBC {
    memory: Memory;
    extRam: ExtRam;

    constructor(memory: Memory) {
        this.memory = memory;
        this.extRam = new ExtRam();
    }

    // Create an MBC instance depending on the type specified in the cartridge
    static getMbcInstance(memory, type) {
        var instance;
        switch (type) {
            case 0x00:
                instance = new MBC0(memory);
                break;
            case 0x01: case 0x02: case 0x03:
                instance = new MBC1(memory);
                break;
            case 0x0F: case 0x10: case 0x11: case 0x12: case 0x13:
                instance = new MBC3(memory);
                break;
            case 0x19: case 0x1A: case 0x1B: case 0x1C: case 0x1D: case 0x1E:
                instance = new MBC5(memory);
                break;
            default:
                throw new UnimplementedException('MBC type not supported');
        }

        return instance;
    }
}


class MBC1 extends MBC {
    romBankNumber = 1;
    mode = 0; // mode 0 = ROM, mode 1 = RAM
    ramEnabled = true;

    loadRam(game, size) {
        this.extRam.loadRam(game, size);
    }

    manageWrite(addr, value) {
        switch (addr & 0xF000) {
            case 0x0000: case 0x1000: // enable RAM
                this.ramEnabled = (value & 0x0A) ? true : false;
                if (!this.ramEnabled) {
                    this.extRam.saveRamData();
                }
                break;
            case 0x2000: case 0x3000: // ROM bank number lower 5 bits
                value &= 0x1F;
                if (value == 0) value = 1;
                var mask = this.mode ? 0 : 0xE0;
                this.romBankNumber = (this.romBankNumber & mask) +value;
                this.memory.loadRomBank(this.romBankNumber);
                break;
            case 0x4000: case 0x5000: // RAM bank or high bits ROM
                value &= 0x03;
                if (this.mode == 0) { // ROM upper bits
                    this.romBankNumber = (this.romBankNumber&0x1F) | (value << 5);
                    this.memory.loadRomBank(this.romBankNumber);
                } else { // RAM bank
                    this.extRam.setRamBank(value);
                }
                break;
            case 0x6000: case 0x7000: // ROM / RAM mode
                this.mode = value & 1;
                break;
            case 0xA000: case 0xB000:
                this.extRam.manageWrite(addr - 0xA000, value);
                break;
        }
    }
    readRam(addr) {
        return this.extRam.manageRead(addr - 0xA000);
    }
}

class MBC3 extends MBC {
    romBankNumber = 1;
    ramEnabled = true;

    loadRam(game, size) {
        this.extRam.loadRam(game, size);
    }

    manageWrite(addr, value) {
        switch (addr & 0xF000) {
            case 0x0000: case 0x1000: // enable RAM
                this.ramEnabled = (value & 0x0A) ? true : false;
                if (!this.ramEnabled) {
                    this.extRam.saveRamData();
                }
                break;
            case 0x2000: case 0x3000: // ROM bank number
                value &= 0x7F;
                if (value == 0) value = 1;
                this.romBankNumber = value;
                this.memory.loadRomBank(this.romBankNumber);
                break;
            case 0x4000: case 0x5000: // RAM bank
                this.extRam.setRamBank(value);
                break;
            case 0x6000: case 0x7000: // Latch clock data
                throw new UnimplementedException('cartridge clock not supported', false);
                break;
            case 0xA000: case 0xB000:
                this.extRam.manageWrite(addr - 0xA000, value);
                break;
        }
    }
    readRam(addr) {
        return this.extRam.manageRead(addr - 0xA000);
    }
}


// declare MBC5 for compatibility with most cartriges
// does not support rumble feature
let MBC5 = MBC3;

// MBC0 exists for consistency and manages the no-MBC cartriges
class MBC0 extends MBC {
    manageWrite(addr, value) {
        this.memory.loadRomBank(value);
        if (addr >= 0xA000 && addr < 0xC000) {
            this.extRam.manageWrite(addr - 0xA000, value);
            this.extRam.saveRamData();
        }
    }
    readRam(addr) {
        return this.extRam.manageRead(addr - 0xA000);
    }
    loadRam(game, size) {
        this.extRam.loadRam(game, size);
    }
}

export default MBC;
