function view_memory(addr, memory) {
    addr = addr & 0xFFF0;
    var pad = '00';
    var str = addr.toString(16) + ':';
    for (var i = addr; i < addr + 0x10; i++) {
        if ((i & 0x1) == 0) {
            str += ' ';
        }
        var val = memory[i] || 0;

        val = val.toString(16);
        str += pad.substring(val.length) + val;
    }

    return str;
}
