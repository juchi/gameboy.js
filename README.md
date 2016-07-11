Gameboy.js
==========

Gameboy.js is a gameboy emulator written in JavaScript.

It's a work in progress, see the Features section.

## Browser support

Tested on:
* Firefox
* Chrome (sound issues)
* Safari (sound issues)

## Usage

### Run now

You can try the emulator directly on the [demo site](http://juchi.github.io/gameboy.js/).

Tests ROM can be downloaded [here](http://blargg.8bitalley.com/parodius/gb-tests/) and are runnable, but some tests fail.
See the Tests section for more details.

Currently, most tested games run (tested with Tetris, Super Mario, Pokemon Red)
but have some glitches.

### Run on a custom page

You can directly use the distributed compiled file in a custom HTML page of your own,
and create a new Gameboy object. It will expect a Canvas element and an optional options object.

```javascript
var canvas = document.getElementById('canvas');
new GameboyJS.Gameboy(canvas);
```

### Options

You can customize the configuration by passing a list of options to the Gameboy.

```javascript
var options, canvas;
//...
new GameboyJS.Gameboy(canvas, options);
```

* `pad`: Object representing the pad to use as a physical gamepad. The `class` key is mandatory and
  should contain the class implementing the device you want to play with.
  You can implement any kind of pad as long as this class implements the init() method.
  See GameboyJS.Keyboard class for an example of implementation. You may also provide
  a `mapping` object that will be used if you choose the GameboyJS.Gamepad class.
  Default is `{class: GameboyJS.Keyboard, mapping: null}`
* `zoom`: The zoom level as an integer. Default is 1
* `romReaders`: An array of ROM reader objects that can read a ROM file
  and send the data to the Gameboy.
  Default is empty (`[]`), leading to a GameboyJS.RomFileReader to be created.
* `statusContainerId`: ID of the HTML element for status display. Default is 'status'.
* `gameNameContainerId`: ID of the HTML element for game name display. Default is 'game-name'.
* `errorContainerId`: ID of the HTML element for error display. Default is 'error'.

### Build from source

If you want to build the compiled JavaScript file from source
to be sure you have the latest updates, just clone the repository
and run the grunt tasks :

```
git clone https://github.com/juchi/gameboy.js
npm install
./node_modules/.bin/grunt
```

## Features

### Devices

The LCD screen is working but still has some sprite glitches.

User input is available : arrow keys are mapped to the keyboard arrows,
and A, B, START and SELECT are mapped to G, B, H, N respectively.
Also, it's possible to use a gamepad using a custom `pad` option.

Game saves are working fine and are stored as serialized data in the LocalStorage.

Sound is partially implemented (the noise channel is not done yet) and is quite
good on Firefox (latest release) but really bad on Chrome and Safari.
This seems to be due to the implementation of the Web Audio API in webkit.

The serial port can be used by the program as an output,
the received bytes are displayed in the console (this is mainly used for tests).

The ROM files are accessed using an explorer on your computer.
Other methods may be included (AJAX and Drag & Drop are supported).

### Internal processes

There is no boot program provided (nor supported).
The execution starts automatically at address 0x0100 which is the start address of all ROMs.

All of the standard Gameboy instructions are implemented. Super Gameboy and Gameboy Color are not supported.

The following features are in progress or partially working:
* sprites (no support for sprite flags)
* MBC (only MBC 1, MBC 3 and MBC 5 are partially supported)
* sound (ok on Firefox, poor on Chrome)

The following features are not currently supported at all:
* boot program

## Tests

The tests perform as follow :

| Test               |  status  |
|--------------------|:--------:|
| CPU instructions   | pass     |
| instruction timing | pass     |
| memory timing      | fail     |
| DMG sound          | fail     |
| OAM bug            | fail     |
