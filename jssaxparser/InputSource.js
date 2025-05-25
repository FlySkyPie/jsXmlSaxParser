// http://java.sun.com/j2se/1.4.2/docs/api/org/xml/sax/InputSource.html
// Could put in org.xml.sax namespace

// For convenience, when dealing with raw strings as input, one can simply use own parseString() instead of
// XMLReader's parse() which expects an InputSouce (or
// systemId (file URL)); note that resolveEntity() on EntityResolver and also getExternalSubset() on EntityResolver2 return
// an InputSource and Locator and Locator2 also have notes on InputSource

class InputSource {
    constructor(input) {
        if (!input) {
            return;
        }
        if (typeof input === 'string') {
            this.systemId = input;
        }
        else if (input instanceof InputStream) {
            this.byteStream = input;
        }
        else if (input instanceof Reader) { // Should not have a byte-order mark
            this.characterStream = input;
        }
    }

    getByteStream() {
        return this.byteStream || null; // InputStream
    }

    getCharacterStream() { // Should apparently not have a byte-order mark (see constructor)
        return this.characterStream || null; // Reader
    }

    getEncoding() {
        return this.encoding || null; // String
    }

    getPublicId() {
        return this.publicId || null; // String
    }

    getSystemId() {
        return this.systemId || null; // String
    }

    setByteStream(byteStream) { // InputStream
        this.byteStream = byteStream;
    }

    setCharacterStream(characterStream) { // Reader
        this.characterStream = characterStream;
    }

    setEncoding(encoding) { // No effect on character stream
        this.encoding = encoding;
    }

    setPublicId(publicId) { // String
        this.publicId = publicId;
    }

    setSystemId(systemId) { // String
        this.systemId = systemId;
    }
}
