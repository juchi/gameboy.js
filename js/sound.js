var APU = function() {
    this.enabled = false;
};
APU.prototype.update = function(clockElapsed) {
    if (this.enabled == false) return;
};

APU.prototype.manageWrite = function(addr, value) {
    if (addr == 0xFF26) {
        this.enabled = (value & 0x80) == 0 ? false : true;
    }
};


APU.registers = {
    NR10: 0xFF10,
    NR11: 0xFF11,
    NR12: 0xFF12,
    NR13: 0xFF13,
    NR14: 0xFF14,

    NR21: 0xFF16,
    NR22: 0xFF17,
    NR23: 0xFF18,
    NR24: 0xFF19,

    NR30: 0xFF1A,
    NR31: 0xFF1B,
    NR32: 0xFF1C,
    NR33: 0xFF1D,
    NR34: 0xFF1E,

    NR41: 0xFF20,
    NR42: 0xFF21,
    NR43: 0xFF22,
    NR44: 0xFF23,

    NR50: 0xFF24,
    NR51: 0xFF25,
    NR52: 0xFF26
};
