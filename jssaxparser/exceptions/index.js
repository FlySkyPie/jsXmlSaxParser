// http://www.saxproject.org/apidoc/org/xml/sax/SAXException.html
export class SAXException extends Error {
    constructor(message, exception) { // java.lang.Exception
        super()
        this.message = message;
        this.exception = exception;
    }

    getMessage() {
        return this.message;
    }

    getException() {
        return this.exception;
    }
}

// Not fully implemented
// http://www.saxproject.org/apidoc/org/xml/sax/SAXNotSupportedException.html
export class SAXNotSupportedException extends SAXException {
    constructor(msg) { // java.lang.Exception
        this.message = msg || '';
    }
}

// http://www.saxproject.org/apidoc/org/xml/sax/SAXNotRecognizedException.html
export class SAXNotRecognizedException extends SAXException {
    constructor(msg) { // java.lang.Exception
        this.message = msg || '';
    }
}

//This constructor is more complex and not presently implemented;
//  see Java API to implement additional arguments correctly
// http://www.saxproject.org/apidoc/org/xml/sax/SAXParseException.html
export class SAXParseException extends SAXException {
    constructor(msg, locator) { // java.lang.Exception //
        this.message = msg || '';
        this.locator = locator;
    }

    getColumnNumber() {
        if (this.locator) {
            return this.locator.getColumnNumber();
        }
    }

    getLineNumber() {
        if (this.locator) {
            return this.locator.getLineNumber();
        }
    }

    getPublicId() {
        if (this.locator) {
            return this.locator.getPublicId();
        }
    }

    getSystemId() {
        if (this.locator) {
            return this.locator.getSystemId();
        }
    }
}
