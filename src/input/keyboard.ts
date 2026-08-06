import {JoypadDevice} from './input';

// Keyboard listener
// Does the mapping between the keyboard and the Input class
class Keyboard implements JoypadDevice {
    onPress: Function | undefined;
    onRelease: Function | undefined;

    // Initialize the keyboard listeners and set up the callbacks
    // for button press / release
    init(canvas: HTMLElement, onPress: Function, onRelease: Function) {
        this.onPress = onPress;
        this.onRelease = onRelease;
        if (canvas.getAttribute('tabIndex') === null)  {
            canvas.setAttribute('tabIndex', '1');
        }

        let self = this;
        canvas.addEventListener('keydown', function(e) {
            self.managePress(e.code);
            if (e.code !== "Tab") // only keep Tab active
                e.preventDefault();
        });
        canvas.addEventListener('keyup', function(e) {
            self.manageRelease(e.code);
            if (e.code !== "Tab") // only keep Tab active
                e.preventDefault();
        });
    }

    managePress(code) {
        let key = this.translateKey(code);
        if (key && this.onPress) {
            this.onPress(key);
        }
    }

    manageRelease(code) {
        let key = this.translateKey(code);
        if (key && this.onRelease) {
            this.onRelease(key);
        }
    }

    // Transform a keyboard code into a key of the Input.keys object
    translateKey(keycode) {
        let key = '';
        switch (keycode) {
            case "KeyG":
                key = 'A';
                break;
            case "KeyB":
                key = 'B';
                break;
            case "KeyH":
                key = 'START';
                break;
            case "KeyN":
                key = 'SELECT';
                break;
            case "ArrowLeft":
                key = 'LEFT';
                break;
            case "ArrowUp":
                key = 'UP';
                break;
            case "ArrowRight":
                key = 'RIGHT';
                break;
            case "ArrowDown":
                key = 'DOWN';
                break;
        }

        return key;
    }
}

export default Keyboard;
