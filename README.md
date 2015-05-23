Gameboy.js
==========

Gameboy.js is a gameboy emulator written in JavaScript.

It's a work in progress, see the Features section.

## How to run

Once the project is cloned, it is only needed to open the `index.html` in a web browser, no additional dependencies are required.
You can also directly go to the [demo site](http://juchi.github.io/gameboy.js/).

There is no boot program provided (nor supported).
The execution starts automatically at address 0x0100 which is the start address of all ROMs.

Tests ROM can be downloaded [here](http://blargg.8bitalley.com/parodius/gb-tests/) and are runnable, but most tests fail.
See the Tests section for more details.

Currently, some games are runnable (tested with Tetris, Super Mario) but are very slow.
It is not yet defined whether it's a timing bug in the emulator or if the emulator itself is running too slow.
This needs further investigation.

## Features

### Devices

The LCD screen is usable with background and sprite display but the window is not supported yet.

User input is available : arrow keys are mapped to the keyboard arrows,
and A, B, START and SELECT are mapped to G, B, H, N respectively.

The serial port can be used by the program as an output, the received bytes are displayed in the console (this is mainly used for tests).

### Internal processes

All of the standard Gameboy instructions are implemented. Super Gameboy and Gameboy Color are not supported.

The following features are in progress or partially working:
* Timer (seems buggy as "memory timing" test fails)
* sprites (no support for sprite flags)
* MBC (only MBC 1 is supported)

The following features are not currently supported at all:
* window display
* sound
* boot program
* external RAM (cartridge RAM)

## Tests

The tests perform as follow :

| Test               |  status  |
|--------------------|:--------:|
| CPU instructions   | pass     |
| instruction timing | pass     |
| memory timing      | fail     |
| DMG sound          | fail     |
| OAM bug            | fail     |
