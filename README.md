Gameboy.js
==========

Gameboy.js is a gameboy emulator written in JavaScript.

It's a work in progress, see the Features section.

## How to run

It is only needed to open the `index.html` in a web browser, no additional dependencies are required.

There is no boot program provided (nor supported).
The execution starts automatically at address 0x0100 which is the start address of all ROMs.

Tests ROM can be downloaded [here](http://blargg.8bitalley.com/parodius/gb-tests/) and are runnable, but mosts tests fail.
See the Tests section for more details.

Games are not runnable yet.

## Features

All of the standard Gameboy instructions are implemented. Super Gameboy and Gameboy Color are not supported.

The LCD display is usable in background mode and allows the display of the tests,
but it's not stable as display progress is not written back into the dedicated registers.
Also, the display performance is quite poor for now as it cannot run at the original 60Hz.

The serial port can be used by the program as an output and the received bytes are displayed in the console (this is mainly used for tests).

The following features are in progress or partially working:
* LCD background (the display registers are not updated as expected)
* LCD printing (performance to improve)
* interrupts (timer is working)
* MBC (MBC 1 is supported)

The following features are not currently supported at all:
* sprites
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
