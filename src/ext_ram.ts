// Object for mapping the cartridge RAM
class ExtRam {
    gameName: string;
    extRam: Array<number>;
    ramSize: number;
    ramBanksize: number;
    ramBank: number;

    constructor() {
        this.extRam = null;
        this.ramSize = 0;
        this.ramBank = 0;
    }

    loadRam(game, size) {
        this.gameName = game;

        this.ramSize = size;
        this.ramBanksize = this.ramSize >= 0x2000 ? 8192 : 2048;

        var key = this.getStorageKey();
        var data = localStorage.getItem(key);
        if (data == null) {
            this.extRam = Array.apply(null, new Array(this.ramSize)).map(function(){return 0;});
        } else {
            this.extRam = JSON.parse(data);
            if (this.extRam.length != size) {
                console.error('Found RAM data but not matching expected size.');
            }
        }
    }

    setRamBank(bank) {
        this.ramBank = bank;
    }

    manageWrite(offset, value) {
        this.extRam[this.ramBank * 8192 + offset] = value;
    }

    manageRead(offset) {
        return this.extRam[this.ramBank * 8192 + offset];
    }

    getStorageKey() {
        return this.gameName + '_EXTRAM';
    }

    // Actually save the RAM in the physical storage (localStorage)
    saveRamData() {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.extRam));
    }
}

export default ExtRam;
