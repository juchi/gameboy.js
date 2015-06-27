var GameboyJS;
(function (GameboyJS) {
"use strict";

// A FileReader is able to load a local file from an input element
var RomFileReader = function() {
    this.domElement = document.getElementById('file');
};

// Initialize the Reader
// The callback argument willed be called when a file is successfully
// read, with the data as argument (Uint8Array)
RomFileReader.prototype.init = function(onLoadCallback) {
    var self = this;
    this.domElement.addEventListener('change', function(e){
        self.loadFromFile(e.target.files[0], onLoadCallback);
    });

};

RomFileReader.prototype.loadFromFile = function(file, cb) {
    if (file === undefined) {
        return;
    }
    var fr = new FileReader();
    var self = this;
    fr.onload = function() {
        cb(new Uint8Array(fr.result));
    };
    fr.onerror = function(e) {
        console.log('Error reading the file', e.target.error.code)
    };
    fr.readAsArrayBuffer(file);
};

GameboyJS.RomFileReader = RomFileReader;
}(GameboyJS || (GameboyJS = {})));
