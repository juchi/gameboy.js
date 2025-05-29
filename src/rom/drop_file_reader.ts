// A RomDropFileReader is able to load a drag and dropped file
class RomDropFileReader {
    dropElement: HTMLElement;
    callback: Function;

    constructor(el) {
        this.dropElement = el;
        if (!this.dropElement) {
            throw 'The RomDropFileReader needs a drop zone.';
        }

        let self = this;
        this.dropElement.addEventListener('dragenter', function(e) {
            e.preventDefault();
            if (e.target !== self.dropElement) {
                return;
            }
            self.dropElement.classList.add('drag-active');
        });
        this.dropElement.addEventListener('dragleave', function(e) {
            e.preventDefault();
            if (e.target !== self.dropElement) {
                return;
            }
            self.dropElement.classList.remove('drag-active');
        });
        this.dropElement.addEventListener('dragover', function(e) {
            e.preventDefault();
            self.dropElement.classList.add('drag-active');
        });
        this.dropElement.addEventListener('drop', function (e) {
            self.dropElement.classList.remove('drag-active');
            if (e.dataTransfer.files.length == 0) {
                return;
            }
            e.preventDefault();
            self.loadFromFile(e.dataTransfer.files[0]);
        });
    }

    // The callback argument will be called when a file is successfully
    // read, with the data as argument (Uint8Array)
    setCallback(onLoadCallback) {
        this.callback = onLoadCallback;
    }

    // The file loading logic is the same as the regular file reader
    loadFromFile(file) {
        if (file === undefined) {
            return;
        }
        let fr = new FileReader();
        let cb = this.callback;

        fr.onload = function() {
            cb && cb(new Uint8Array(fr.result as ArrayBuffer));
        };
        fr.onerror = function(e) {
            console.log('Error reading the file', e.target.error.code)
        };
        fr.readAsArrayBuffer(file);
    }
}

export default RomDropFileReader;
