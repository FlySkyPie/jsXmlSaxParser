/*
 XMLReader 	getParent()
          Get the parent reader.
 void 	setParent(XMLReader parent)
          Set the parent reader.
*/

// http://www.saxproject.org/apidoc/org/xml/sax/helpers/XMLFilterImpl.html
// Allows subclasses to override methods to filter input before reaching the parent's methods

export class XMLFilterImpl {
    constructor(parent) {
        if (parent) {
            if (!this._implements(parent,
                ['getContentHandler', 'getDTDHandler', 'getEntityResolver', 'getErrorHandler', 'getFeature', 'getProperty',
                    'parse', 'setContentHandler', 'setDTDHandler', 'setEntityResolver', 'setErrorHandler', 'setFeature', 'setProperty'])) {
                throw 'XMLFilterImpl must be given a parent which implements XMLReader';
            }
            this.parent = parent;
        }
        // If there is no parent and it is not set subsequently by setParent(), this class can only be used for event consuming
    }

    toString() {
        return "XMLFilterImpl";
    }

    // INTERFACE: XMLFilter: http://www.saxproject.org/apidoc/org/xml/sax/XMLFilter.html
    setParent(parent) { // e.g., SAXParser
        this.parent = parent;
    }

    getParent() {
        return this.parent;
    }

    // INTERFACE: XMLReader: http://www.saxproject.org/apidoc/org/xml/sax/XMLReader.html
    getContentHandler() {
        return this.parent.getContentHandler.call(this.parent);
    }

    getDTDHandler() {
        return this.parent.getDTDHandler.call(this.parent);
    }

    getEntityResolver() {
        return this.parent.getEntityResolver.call(this.parent);
    }

    getErrorHandler() {
        return this.parent.getErrorHandler.call(this.parent);
    }

    getFeature(name) { // (java.lang.String)
        return this.parent.getFeature.call(this.parent, name);
    }

    getProperty(name) { // (java.lang.String)
        return this.parent.getProperty.call(this.parent, name);
    }

    parse(inputOrSystemId) { // (InputSource input OR java.lang.String systemId)
        return this.parent.parse.call(this.parent, inputOrSystemId);
    }

    setContentHandler(handler) { // (ContentHandler)
        return this.parent.setContentHandler.call(this.parent, handler);
    }

    setDTDHandler(handler) { // (DTDHandler)
        return this.parent.setDTDHandler.call(this.parent, handler);
    }

    setEntityResolver(resolver) { // (EntityResolver)
        return this.parent.setEntityResolver.call(this.parent, resolver);
    }

    setErrorHandler(handler) { // (ErrorHandler)
        return this.parent.setErrorHandler.call(this.parent, handler);
    }

    setFeature(name, value) { // (java.lang.String, boolean)
        return this.parent.setFeature.call(this.parent, name, value);
    }

    setProperty(name, value) { // (java.lang.String, java.lang.Object)
        return this.parent.setProperty.call(this.parent, name, value);
    }

    // END SAX2 XMLReader INTERFACE

    // INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
    startDocument() {
        return this.parent ? this.parent.contentHandler.startDocument.call(this.parent.contentHandler) : undefined;
    }

    startElement(namespaceURI, localName, qName, atts) {
        return this.parent ? this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts) : undefined;
    }

    endElement(namespaceURI, localName, qName) {
        return this.parent ? this.parent.contentHandler.endElement.call(this.parent.contentHandler, namespaceURI, localName, qName) : undefined;
    }

    startPrefixMapping(prefix, uri) {
        return this.parent ? this.parent.contentHandler.startPrefixMapping.call(this.parent.contentHandler, prefix, uri) : undefined;
    }

    endPrefixMapping(prefix) {
        return this.parent ? this.parent.contentHandler.endPrefixMapping.call(this.parent.contentHandler, prefix) : undefined;
    }

    processingInstruction(target, data) {
        return this.parent ? this.parent.contentHandler.processingInstruction.call(this.parent.contentHandler, target, data) : undefined;
    }

    ignorableWhitespace(ch, start, length) {
        return this.parent ? this.parent.contentHandler.ignorableWhitespace.call(this.parent.contentHandler, ch, start, length) : undefined;
    }

    characters(ch, start, length) {
        return this.parent ? this.parent.contentHandler.characters.call(this.parent.contentHandler, ch, start, length) : undefined;
    }

    skippedEntity(name) {
        return this.parent ? this.parent.contentHandler.skippedEntity.call(this.parent.contentHandler, name) : undefined;
    }

    endDocument() {
        return this.parent ? this.parent.contentHandler.endDocument.call(this.parent.contentHandler) : undefined;
    }

    setDocumentLocator(locator) {
        return this.parent ? this.parent.contentHandler.setDocumentLocator.call(this.parent.contentHandler, locator) : undefined;
    }

    // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
    // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
    resolveEntity(publicId, systemId) {
        if (this.parent && this.parent.entityResolver) {
            return this.parent.entityResolver.resolveEntity.call(this.parent.entityResolver, publicId, systemId);
        }
        return undefined;
    }

    // INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
    notationDecl(name, publicId, systemId) {
        if (this.parent && this.parent.dtdHandler && this.parent.dtdHandler.notationDecl) {
            return this.parent.dtdHandler.notationDecl.call(this.parent.dtdHandler, name, publicId, systemId);
        }
        return undefined;
    }

    unparsedEntityDecl(name, publicId, systemId, notationName) {
        if (this.parent && this.parent.dtdHandler && this.parent.dtdHandler.unparsedEntityDecl) {
            return this.parent.dtdHandler.unparsedEntityDecl.call(this.parent.dtdHandler, name, publicId, systemId, notationName);
        }
        return undefined;
    }

    // INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
    warning(saxParseException) {
        if (this.parent && this.parent.errorHandler) {
            return this.parent.errorHandler.warning.call(this.parent.errorHandler, saxParseException);
        }
        return undefined;
    }

    error(saxParseException) {
        if (this.parent && this.parent.errorHandler) {
            return this.parent.errorHandler.error.call(this.parent.errorHandler, saxParseException);
        }
        return undefined;
    }

    fatalError(saxParseException) {
        if (this.parent && this.parent.errorHandler) {
            return this.parent.errorHandler.fatalError.call(this.parent.errorHandler, saxParseException);
        }
        return undefined;
    }

    // BEGIN CUSTOM API (could make all but parseString() private)
    // The following is not really a part of XMLFilterImpl but we are effectively depending on it
    parseString(xml) {
        return this.parent.parseString.call(this.parent, xml);
    }

    _implements(obj, arr) {
        for (let i = 0; i < arr.length; i++) {
            if (typeof obj[arr[i]] !== 'function') {
                return false;
            }
        }
        return true;
    }
}

// There is no XMLFilterImpl2 part of SAX2, but we add one to add the remaining interfaces covered in DefaultHandler2 but not
//  in XMLFilterImpl: DeclHandler, EntityResolver2, LexicalHandler

export class XMLFilterImpl2 extends XMLFilterImpl {
    constructor(parent) {
        // If there is no parent and it is not set subsequently by setParent(), this class can only be used for event consuming
        return XMLFilterImpl.call(this, parent);
    }

    toString() {
        return "XMLFilterImpl2";
    }

    // INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

    attributeDecl(eName, aName, type, mode, value) {
        if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.attributeDecl) {
            return this.parent.declarationHandler.attributeDecl.call(this.parent.declarationHandler, eName, aName, type, mode, value);
        }
        return undefined;
    }

    elementDecl(name, model) {
        if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.elementDecl) {
            return this.parent.declarationHandler.elementDecl.call(this.parent.declarationHandler, name, model);
        }
        return undefined;
    }

    externalEntityDecl(name, publicId, systemId) {
        if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.externalEntityDecl) {
            return this.parent.declarationHandler.externalEntityDecl.call(this.parent.declarationHandler, name, publicId, systemId);
        }
        return undefined;
    }

    internalEntityDecl(name, value) {
        if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.internalEntityDecl) {
            return this.parent.declarationHandler.internalEntityDecl.call(this.parent.declarationHandler, name, value);
        }
        return undefined;
    }

    // INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html

    comment(ch, start, length) {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.comment) {
            return this.parent.lexicalHandler.comment.call(this.parent.lexicalHandler, ch, start, length);
        }
        return undefined;
    }

    endCDATA() {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endCDATA) {
            return this.parent.lexicalHandler.endCDATA.call(this.parent.lexicalHandler);
        }
        return undefined;
    }

    endDTD() {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endDTD) {
            return this.parent.lexicalHandler.endDTD.call(this.parent.lexicalHandler);
        }
        return undefined;
    }

    endEntity(name) {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endEntity) {
            return this.parent.lexicalHandler.endEntity.call(this.parent.lexicalHandler, name);
        }
        return undefined;
    }

    startCDATA() {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startCDATA) {
            return this.parent.lexicalHandler.startCDATA.call(this.parent.lexicalHandler);
        }
        return undefined;
    }

    startDTD(name, publicId, systemId) {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startDTD) {
            return this.parent.lexicalHandler.startDTD.call(this.parent.lexicalHandler, name, publicId, systemId);
        }
        return undefined;
    }

    startEntity(name) {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startEntity) {
            return this.parent.lexicalHandler.startEntity.call(this.parent.lexicalHandler, name);
        }
        return undefined;
    }

    startCharacterReference(hex, number) {
        if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startCharacterReference) {
            return this.parent.lexicalHandler.startCharacterReference.call(this.parent.lexicalHandler, hex, number);
        }
        return undefined;
    }

    // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
    // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
    // XMLFilterImpl2.prototype.resolveEntity = function (publicId, systemId) {};
    // INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
    resolveEntity(name, publicId, baseURI, systemId) {
        if (this.parent && this.parent.entityResolver && this.parent.entityResolver.resolveEntity) {
            return this.parent.entityResolver.resolveEntity.call(this.parent.entityResolver, name, publicId, baseURI, systemId);
        }
        return undefined;
    }

    getExternalSubset(name, baseURI) {
        if (this.parent && this.parent.entityResolver && this.parent.entityResolver.getExternalSubset) {
            return this.parent.entityResolver.getExternalSubset.call(this.parent.entityResolver, name, baseURI);
        }
        return undefined;
    }
}
