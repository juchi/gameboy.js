function UnimplementedException(message, fatal) {
    this.message = message;
    this.name = UnimplementedException;
    if (fatal === undefined) {
        fatal = true;
    }
    this.fatal = fatal;
}
