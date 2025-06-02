// Object for mapping the cartridge RAM
class ExtRam {
    gameName: string;
    extRam: number[];
    ramSize: number;
    ramBanksize: number;
    ramBank: number;

    constructor() {
        this.ramSize = 0;
        this.ramBank = 0;
    }

    loadRam(game: string, size: number) {
        this.gameName = game;

        this.ramSize = size;
        this.ramBanksize = this.ramSize >= 0x2000 ? 8192 : 2048;

        let key = this.getStorageKey();
        let data = localStorage.getItem(key);
        if (data == null) {
            this.extRam = Array.apply(null, new Array(this.ramSize)).map(function(){return 0;});
        } else {
            this.extRam = JSON.parse(data);
            if (this.extRam.length != size) {
                console.error('Found RAM data but not matching expected size.');
            }
        }
    }

    setRamBank(bank: number) {
        this.ramBank = bank;
    }

    manageWrite(offset: number, value: number) {
        this.extRam[this.ramBank * 8192 + offset] = value;
    }

    manageRead(offset: number) {
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
