// Utility functions
let Util = {
    // Add to the first argument the properties of all other arguments
    extend: function(target /*, source1, source2, etc. */) {
        let sources = Array.prototype.slice.call(arguments);
        for (let i in sources) {
            let source = sources[i];
            for (let name in source) {
                target[name] = source[name];
            }
        }

        return target;
    },
    testFlag: function(p, cc) {
        let test: number = 1;
        let mask: number = 0x10;
        if (cc == 'NZ' || cc == 'NC') test = 0;
        if (cc == 'NZ' || cc == 'Z')  mask = 0x80;
        return (test && p.r.F & mask) || (!test && !(p.r.F & mask));
    },
    getRegAddr: function(p, r1, r2) {
        return Util.makeword(p.r[r1], p.r[r2]);
    },

    // make a 16 bits word from 2 bytes
    makeword: function(b1: number, b2: number) {
        return (b1 << 8) + b2;
    },

    // return the integer signed value of a given byte
    getSignedValue: function(v: number) {
        return v & 0x80 ? v-256 : v;
        },

    // extract a bit from a byte
    readBit: function(byte: number, index: number) {
        return (byte >> index) & 1;
    }
};

export default Util;
