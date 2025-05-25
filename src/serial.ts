// Handlers for the Serial port of the Gameboy

interface SerialInterface {
    out(data: number): void;
    in(): number;
}

// The ConsoleSerial is an output-only serial port
// designed for debug purposes as some test roms output data on the serial port
//
// Will regularly output the received byte (converted to string) in the console logs
// This handler always push the value 0xFF as an input
class ConsoleSerial implements SerialInterface {
    current: string = '';
    timeout: ReturnType<typeof setTimeout> = null;
    out(data: number): void {
        this.current += String.fromCharCode(data);
        if (data == 10) {
            this.print();
        } else {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.print.bind(this), 500);
        }
    }
    in(): number {
        return 0xFF;
    }
    print(): void {
        clearTimeout(this.timeout);
        console.log('serial: ' + this.current);
        this.current = '';
    }
}

// A DummySerial outputs nothing and always inputs 0xFF
class DummySerial implements SerialInterface {
    out(): void {}
    in(): number {
        return 0xFF;
    }
}

export {ConsoleSerial, DummySerial, SerialInterface};
