// A RomAjaxReader is able to load a file through an AJAX request
class RomAjaxReader {
    callback: Function;

    // The callback argument will be called when a file is successfully
    // read, with the data as argument (Uint8Array)
    setCallback(onLoadCallback) {
        this.callback = onLoadCallback;
    }

    // This function should be called by application code
    // and will trigger the AJAX call itself and push data to the ROM object
    loadFromUrl(url) {
        if (!url) {
            throw 'No url has been set in order to load a ROM file.';
        }
        let cb = this.callback;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            let rom = new Uint8Array(xhr.response);
            cb && cb(rom);
        };

        xhr.send();
    }
}

export default RomAjaxReader;
