import { RomReader } from './rom';

// A RomFileReader is able to load a local file from an input element
//
// Expects to be provided a file input element,
// or will try to find one with the "file" DOM ID
class RomFileReader implements RomReader {
    domElement: HTMLElement;
    callback: Function | undefined;

    constructor(el?: HTMLElement) {
        const domElement = el || document.getElementById('file');
        if (!domElement) {
            throw new Error('The RomFileReader needs a valid input element.');
        }
        this.domElement = domElement;

        let self = this;
        this.domElement.addEventListener('change', function(e) {
            const input = e.currentTarget as HTMLInputElement;
            if (input.files?.length)
                self.loadFromFile(input.files[0]);
        });
    }

    // The callback argument will be called when a file is successfully
    // read, with the data as argument (Uint8Array)
    setCallback(onLoadCallback: Function) {
        this.callback = onLoadCallback;
    }

    // Automatically called when the DOM input is provided with a file
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
            console.log('Error reading the file', e.target?.error?.message)
        };
        fr.readAsArrayBuffer(file);
    }
}



export default RomFileReader;
