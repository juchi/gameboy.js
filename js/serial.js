var ConsoleSerial = {
    current: '',
    timeout: null,
    out: function(data) {
        ConsoleSerial.current += String.fromCharCode(data);
        if (data == 10) {
            ConsoleSerial.print();
        } else {
            clearTimeout(ConsoleSerial.timeout);
            ConsoleSerial.timeout = setTimeout(ConsoleSerial.print, 500);
        }
    },
    in: function(){
        return 0xFF;
    },
    print: function() {
        clearTimeout(ConsoleSerial.timeout);
        console.log('serial: '+ConsoleSerial.current);
        ConsoleSerial.current = '';
    }
};
