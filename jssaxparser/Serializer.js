export class Serializer {
    constructor() {
        this.warnSaxParseExceptions = [];
        this.saxParseExceptions = [];
        this.currentPrefixMapping = {};
        this.string = "";
        //may not be dumped to the XML
        this.dtd = "";
        this.dtdDumped = false;
        //if cdata, then characters must be entified
        this.cdata = false;
    }

    entify(str) { // FIX: this is probably too many replaces in some cases and a call to it may not be needed at all in some cases
        //must not replace '&' of entities or character references
        return str.replace(/&(?!(amp;|gt;|lt;|quot;|#))/g, '&amp;').replace(/>/g, '&gt;').replace(new RegExp('<', 'g'), '&lt;').replace(/"/g, '&quot;');
    }

    startDocument() { }

    startElement(namespaceURI, localName, qName, atts) {
        this.string += '<' + qName;
        //adds namespace attributes
        for (let i in this.currentPrefixMapping) {
            this.string += ' xmlns:' + i + '="' + this.currentPrefixMapping[i] + '"'; // .toLowerCase()
        }
        this.currentPrefixMapping = {};
        for (let i = 0; i < atts.getLength(); i++) {
            let value = atts.getValue(i);
            value = value.replace(/\n/g, "&#10;");
            value = value.replace(/\r/g, "&#13;");
            value = value.replace(/\t/g, "&#9;");
            this.string += ' ' + atts.getQName(i) + '="' + value + '"'; // .toLowerCase()
        }
        this.string += '>';
    }

    endElement(namespaceURI, localName, qName) {
        this.string += '</' + qName + '>';
    }

    startPrefixMapping(prefix, uri) {
        this.currentPrefixMapping[prefix] = uri;
    }

    endPrefixMapping(prefix) { }

    processingInstruction(target, data) {
        data = data.replace(/\r\n/g, "\n");
        this.string += '<?' + target + ' ' + data + '?>';
    }

    ignorableWhitespace(ch, start, length) {
        for (let i = 0; i < ch.length; i++) {
            let charCode = ch.charCodeAt(i);
            if (charCode !== 32) {
                this.string += "&#" + ch.charCodeAt(i) + ";";
            } else {
                this.string += ch.charAt(i);
            }
        }
        //this.string += ch;
    }

    characters(ch, start, length) {
        ch = ch.replace(/\n/g, "&#10;");
        ch = ch.replace(/\r/g, "&#13;");
        ch = ch.replace(/\t/g, "&#9;");
        this.string += this.entify(ch);
    }

    skippedEntity(name) { }
    endDocument() { }

    setDocumentLocator(locator) {
        this.locator = locator;
    }

    // INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

    attributeDecl(eName, aName, type, mode, value) { }

    elementDecl(name, model) { }
    externalEntityDecl(name, publicId, systemId) { }
    internalEntityDecl(name, value) { }

    // INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
    comment(ch, start, length) {
        //this.string += '<!-- ' + ch + ' -->';
    }

    endCDATA() {
        //this.string += ']]>';
        this.cdata = false;
    }

    endDTD() {
        if (this.dtdDumped) {
            this.dtd += "]>\n";
            this.string += this.dtd;
        }
    }

    endEntity(name) { }

    startCDATA() {
        //this.string += '<![CDATA[';
        this.cdata = true;
    }

    startDTD(name, publicId, systemId) {
        this.dtd += '<!DOCTYPE ' + name + " [\n";
    }

    startEntity(name) { }

    // Not a standard SAX method
    startCharacterReference(hex, number) {
        //this.string += '&#' + (hex ? 'x' : '') + number + ';';
    }

    // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
    // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
    // Serializer.prototype.resolveEntity(publicId, systemId) {};

    // INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
    resolveEntity(name, publicId, baseURI, systemId) { }

    getExternalSubset(name, baseURI) { }

    // INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
    notationDecl(name, publicId, systemId) {
        this.dtdDumped = true;
        this.dtd += '<!NOTATION ' + name;
        if (publicId) {
            this.dtd += " PUBLIC '" + publicId + "'>\n";
        }
        if (systemId) {
            this.dtd += " SYSTEM '" + systemId + "'>\n";
        }
    }

    unparsedEntityDecl(name, publicId, systemId, notationName) { }

    // INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
    warning(saxParseException) {
        this.warnSaxParseExceptions.push(saxParseException);
    }

    error(saxParseException) {
        this.saxParseExceptions.push(saxParseException);
    }

    fatalError(saxParseException) {
        throw saxParseException;
    }
}
