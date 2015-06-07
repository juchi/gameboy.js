var GameboyJS;
(function (GameboyJS) {
// Handler for the Serial port of the Gameboy
//
// It is designed for debug purposes as some tests output data on the serial port
//
// Will regularly output the received byte (converted to string) in the console logs
// This handler always push the value 0xFF as an input
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
GameboyJS.ConsoleSerial = ConsoleSerial;
}(GameboyJS || (GameboyJS = {})));
