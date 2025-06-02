// This exception should be thrown whenever a critical feature that
// has not been implemented is requested
class UnimplementedException extends Error {
    fatal: boolean;

    constructor(message: string, fatal?: boolean) {
        super();
        this.message = message;
        if (fatal === undefined) {
            fatal = true;
        }
        this.fatal = fatal || false;
    }
}
export default UnimplementedException;
