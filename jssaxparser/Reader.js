import { EndOfInputException } from './SAXScanner';

// http://java.sun.com/j2se/1.4.2/docs/api/java/io/Reader.html
// Note: Can't put into "java.io" namespace since "java" is reserved for LiveConnect
// Note: The class is not fully implemented
export class Reader {
    constructor(lock) {
        if (lock) { // If this argument is passed, it should be an Object (critical sections will synchronize on the given object;
            // otherwise will be on the Reader itself)
            this.lock = lock; // "lock" is a field of the class
        }
    }

    close() {
        throw 'The Reader close() method is abstract';
    }

    mark(readAheadLimit) { // int

    }

    markSupported() {

    }

    read(cbuf, off, len) { // (char[] (, int, int))
        if (arguments.length > 4 || arguments.length === 2) {
            throw "Reader's read() method expects 0, 1, or 3 arguments";
        }
        if (!cbuf) {

        }
        if (!off) {

        }
        throw 'The Reader read() method with 3 arguments (char[], int, and int) is abstract.';
    }

    ready() {

    }

    reset() {

    }

    skip(n) { // long

    }
}

// http://java.sun.com/j2se/1.4.2/docs/api/java/io/StringReader.html
// Note: Can't put into "java.io" namespace since "java" is reserved for LiveConnect
// Note: The class is not fully implemented

export class StringReader extends Reader {
    constructor(s) { // String
        this.s = s; // Not part of the interface nor formally a part of the class
        this.nextIdx = 0;
        this.markIdx = 0;
        this.length = s.length;
    }

    close() {
    }

    mark(readAheadLimit) { // int not supported for StringReader
        this.markIdx = this.nextIdx;
    }

    markSupported() {
        return true;
    }

    read(cbuf, off, len) { // (char[] (, int, int))
        if (arguments.length === 0) {
            if (this.nextIdx >= this.length) {
                throw new EndOfInputException();
            }
            let ch = this.s.charAt(this.nextIdx);
            this.nextIdx++;
            return ch;
        }
        if (arguments.length === 1) {
            cbuf = this.s.substr(this.nextIdx);
            this.nextIdx = this.length;
            return cbuf;
        }
        this.nextIdx += off;
        if (this.nextIdx >= this.length) {
            throw new EndOfInputException();
        }
        //do not throw endOfInputException here, it can be just a test
        cbuf = this.s.substr(this.nextIdx, len);
        this.nextIdx += len;
        return cbuf;
    }

    ready() {
        return true;
    }

    reset() {
        this.nextIdx = this.markIdx;
    }

    skip(n) { // long
        this.nextIdx += n;
        return n;
    }
}

