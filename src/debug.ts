import {Gameboy} from './main';
import Util from './util';

let Debug: any = {};
// Output a range of 16 memory addresses
Debug.view_memory = function(addr: number, gameboy: Gameboy): string {
    let memory = gameboy.cpu.memory;
    addr = addr & 0xFFF0;
    let pad = '00';
    let str = addr.toString(16) + ':';
    for (let i = addr; i < addr + 0x10; i++) {
        if ((i & 0x1) == 0) {
            str += ' ';
        }
        let val: number = memory[i] || 0;
        let stringVal = val.toString(16)
        str += pad.substring(stringVal.length) + stringVal;
    }

    return str;
};

Debug.view_tile = function(gameboy: Gameboy, index: number, dataStart?: number): void {
    let memory = gameboy.cpu.memory;
    let gpu = gameboy.cpu.gpu;
    let LCDC = memory.deviceram(gpu.LCDC);
    if (typeof dataStart === 'undefined') {
        dataStart = 0x8000;
        if (!Util.readBit(LCDC, 4)) {
            dataStart = 0x8800;
            index = Util.getSignedValue(index) + 128;
        }
    }

    let tileData = gameboy.cpu.gpu.readTileData(index, dataStart);

    let pixelData = new Array(8 * 8)
    for (let line = 0; line < 8; line++) {
        let b1 = tileData.shift();
        let b2 = tileData.shift();

        for (let pixel = 0; pixel < 8; pixel++) {
            let mask = (1 << (7-pixel));
            let colorValue = ((b1 & mask) >> (7-pixel)) + ((b2 & mask) >> (7-pixel))*2;
            pixelData[line * 8 + pixel] = colorValue;
        }
    }

    let i = 0;
    while (pixelData.length) {
        console.log(i++ + ' ' + pixelData.splice(0, 8).join(''));
    }
};

Debug.list_visible_sprites = function(gameboy: Gameboy) {
    let memory = gameboy.cpu.memory;
    let indexes = [];
    for (let i = 0xFE00; i < 0xFE9F; i += 4) {
        let x = memory.oamram(i + 1);
        let y = memory.oamram(i);
        let tileIndex = memory.oamram(i + 2);
        if (x == 0 || x >= 168) {
            continue;
        }
        indexes.push({oamIndex:i, x:x, y:y, tileIndex:tileIndex});
    }

    return indexes;
};

export default Debug;
