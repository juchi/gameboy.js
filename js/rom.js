var Rom = function() {};

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

Rom.prototype.load = function(file, cb) {
    if (file === undefined) {
        return;
    }
    var fr = new FileReader();
    fr.onload = function() {
        var rom = new Uint8Array(fr.result);
        cb(rom);
    };
    fr.onerror = function(e) {
        console.log('Error reading the file', e.target.error.code)
    };
    fr.readAsArrayBuffer(file);
};
