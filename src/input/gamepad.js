// This is the default buttons mapping for the Gamepad API
//
// Any other mapping can be provided as a constructor argument of the Gamepad object
// An alternative mapping should be an object with keys being the indexes
// of the gamepad buttons and values the normalized gameboy button names
var standardMapping = {
    0: 'A',
    1: 'B',
    8: 'SELECT',
    9: 'START',
    12: 'UP',
    13: 'DOWN',
    14: 'LEFT',
    15: 'RIGHT',
};

// Gamepad listener
// Communication layer between the Gamepad API and the Input class
// Any physical controller can be used but the mapping should be provided
// in order to get an optimal layout of the buttons (see above)
var Gamepad = function(mapping) {
    this.gamepad = null;
    this.state = {A:0,B:0,START:0,SELECT:0,LEFT:0,RIGHT:0,UP:0,DOWN:0};
    this.pullInterval = null;
    this.buttonMapping = mapping || standardMapping;
};

// Initialize the keyboard listeners and set up the callbacks
// for button press / release
Gamepad.prototype.init = function(canvas, onPress, onRelease) {
    this.onPress = onPress;
    this.onRelease = onRelease;

    var self = this;
    window.addEventListener('gamepadconnected', function(e) {
        self.gamepad = e.gamepad;
        self.activatePull();
    });
    window.addEventListener('gamepaddisconnected', function(e) {
        self.gamepad = null;
        self.deactivatePull();
    });
};

Gamepad.prototype.activatePull = function() {
    this.deactivatePull();
    this.pullInterval = setInterval(this.pullState.bind(this), 100);
};

Gamepad.prototype.deactivatePull = function() {
    clearInterval(this.pullInterval);
};

// Check the state of the current gamepad in order to detect any press/release action
Gamepad.prototype.pullState = function() {
    for (var index in this.buttonMapping) {
        var button = this.buttonMapping[index];
        var oldState = this.state[button];
        this.state[button] = this.gamepad.buttons[index].pressed;

        if (this.state[button] == 1 && oldState == 0) {
            this.managePress(button);
        } else if (this.state[button] == 0 && oldState == 1) {
            this.manageRelease(button);
        }
    }
};

Gamepad.prototype.managePress = function(key) {
    this.onPress(key);
};

Gamepad.prototype.manageRelease = function(key) {
    this.onRelease(key);
};

export default Gamepad;
