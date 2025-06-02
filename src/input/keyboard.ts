import {JoypadDevice} from './input';

// Keyboard listener
// Does the mapping between the keyboard and the Input class
class Keyboard implements JoypadDevice {
    onPress: Function;
    onRelease: Function;

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
            self.managePress(e.keyCode);
            if (e.keyCode !== 9) // only keep Tab active
                e.preventDefault();
        });
        canvas.addEventListener('keyup', function(e) {
            self.manageRelease(e.keyCode);
            if (e.keyCode !== 9) // only keep Tab active
                e.preventDefault();
        });
    }

    managePress(keycode) {
        let key = this.translateKey(keycode);
        if (key) {
            this.onPress(key);
        }
    }

    manageRelease(keycode) {
        let key = this.translateKey(keycode);
        if (key) {
            this.onRelease(key);
        }
    }

    // Transform a keyboard keycode into a key of the Input.keys object
    translateKey(keycode) {
        let key = '';
        switch (keycode) {
            case 71: // G
                key = 'A';
                break;
            case 66: // B
                key = 'B';
                break;
            case 72: // H
                key = 'START';
                break;
            case 78: // N
                key = 'SELECT';
                break;
            case 37: // left
                key = 'LEFT';
                break;
            case 38: // up
                key = 'UP';
                break;
            case 39: // right
                key = 'RIGHT';
                break;
            case 40: // down
                key = 'DOWN';
                break;
        }

        return key;
    }
}

export default Keyboard;
