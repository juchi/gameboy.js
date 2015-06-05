Gameboy.js
==========

Gameboy.js is a gameboy emulator written in JavaScript.

It's a work in progress, see the Features section.

## Browser support

Tested on:
* Firefox
* Chrome (not advised because of sound issues)

## How to run

Once the project is cloned, it is only needed to open the `index.html` in a web browser, no additional dependencies are required.
You can also directly go to the [demo site](http://juchi.github.io/gameboy.js/).

Tests ROM can be downloaded [here](http://blargg.8bitalley.com/parodius/gb-tests/) and are runnable, but most tests fail.
See the Tests section for more details.

Currently, some games are runnable (tested with Tetris, Super Mario, Pokemon Red).

## Features

### Devices

The LCD screen is usable with background, window, and sprite display.

User input is available : arrow keys are mapped to the keyboard arrows,
and A, B, START and SELECT are mapped to G, B, H, N respectively.

Game saves are working fine and are stored as serialized data in the LocalStorage.

Sound is partially implemented (the noise channel is not done yet) and is quite
good on Firefox (latest release) but really bad on Chrome.
This seems to be due to the implementation of the Web Audio API.

The serial port can be used by the program as an output,
the received bytes are displayed in the console (this is mainly used for tests).

### Internal processes

There is no boot program provided (nor supported).
The execution starts automatically at address 0x0100 which is the start address of all ROMs.

All of the standard Gameboy instructions are implemented. Super Gameboy and Gameboy Color are not supported.

The following features are in progress or partially working:
* Timer (seems buggy as "memory timing" test fails)
* sprites (no support for sprite flags)
* MBC (only MBC 1 and MBC 3 are partially supported)
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
