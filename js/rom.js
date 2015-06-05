var Rom = function() {
    this.data = [];
};

Rom.prototype.requestFile = function(filename, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        var rom = new Uint8Array(xhr.response);
        cb(rom);
    };

    xhr.send();
};

Rom.prototype.loadFromFile = function(file, cb) {
    if (file === undefined) {
        return;
    }
    var fr = new FileReader();
    var that = this;
    fr.onload = function() {
        that.data = new Uint8Array(fr.result);
        cb(that);
    };
    fr.onerror = function(e) {
        console.log('Error reading the file', e.target.error.code)
    };
    fr.readAsArrayBuffer(file);
};

// Validate the checksum of the cartridge header
Rom.prototype.validate = function() {
    var hash = 0;
    for (var i = 0x134; i <= 0x14C; i++) {
        hash = hash - this.data[i] - 1;
    }
    return (hash & 0xFF) == this.data[0x14D];
};
