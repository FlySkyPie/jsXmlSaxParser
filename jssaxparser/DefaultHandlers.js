// Overridable handlers which ignore all parsing events (though see resolveEntity() and fatalError())

// http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
// Could put on org.xml.sax.helpers.
export class DefaultHandler {
    constructor() {
        this.saxParseExceptions = [];
    }

    // INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
    startDocument() {
    }

    startElement(namespaceURI, localName, qName, atts) {
    }

    endElement(namespaceURI, localName, qName) {
    }

    startPrefixMapping(prefix, uri) {
    }

    endPrefixMapping(prefix) {
    }

    processingInstruction(target, data) {
    }

    ignorableWhitespace(ch, start, length) {
    }

    characters(ch, start, length) {
    }

    skippedEntity(name) {
    }

    endDocument() {
    }

    setDocumentLocator(locator) {
        this.locator = locator;
    }

    // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
    // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
    resolveEntity(publicId, systemId) {
        return null;
    }

    // INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
    notationDecl(name, publicId, systemId) {
    }

    unparsedEntityDecl(name, publicId, systemId, notationName) {
    }

    // INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
    warning(saxParseException) {
        this.saxParseExceptions.push(saxParseException);
    }

    error(saxParseException) {
        this.saxParseExceptions.push(saxParseException);
    }

    fatalError(saxParseException) {
        throw saxParseException;
    }
}

// http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
// Could put on org.xml.sax.ext.
export class DefaultHandler2 extends DefaultHandler {
    constructor() {
        super();
    }

    // INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

    attributeDecl(eName, aName, type, mode, value) {
    }

    elementDecl(name, model) {
    }

    externalEntityDecl(name, publicId, systemId) {
    }

    internalEntityDecl(name, value) {
    }

    // INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html

    comment(ch, start, length) {
    }

    endCDATA() {
    }

    endDTD() {
    }

    endEntity(name) {
    }

    startCDATA() {
    }

    startDTD(name, publicId, systemId) {
    }

    startEntity(name) {
    }

    // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
    // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
    // DefaultHandler2.prototype.resolveEntity = function (publicId, systemId) {};
    // INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
    resolveEntity(name, publicId, baseURI, systemId) {
    }

    getExternalSubset(name, baseURI) {
    }
}

