Gameboy.js
==========

A gameboy emulator written in JavaScript.

Work in progress, see the Features section.

## How to run

It is only needed to launch the index.html in a web browser, no additional dependencies are required.

There is no boot program provided (nor supported).
The execution starts automatically at address 0x0100 which is the start address of all ROMs.

Tests ROM can be downloaded [here](http://blargg.8bitalley.com/parodius/gb-tests/) and are basically runnable, but tests fail.

## Features

A good part but not all of the instructions are implemented yet.
Especially, most of the CBx instructions need to be programmed.

The LCD display is usable in background mode and allows the display of the tests.
However, the display performance is quite poor for now as it cannot run at the original 60Hz.

The serial port can be used by the program as an output and the received bytes are displayed in the console.

The following features are not currently supported at all:
* sprites
* window display
* sound
* interrupts
* boot program
* memory banking with MBC
* external RAM (cartridge RAM)
