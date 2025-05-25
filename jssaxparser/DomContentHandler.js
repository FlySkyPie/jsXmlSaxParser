/* sax 2 methods
 void 	attributeDecl(java.lang.String eName, java.lang.String aName, java.lang.String type, java.lang.String mode, java.lang.String value)
          Report an attribute type declaration.
 void 	comment(char[] ch, int start, int length)
          Report an XML comment anywhere in the document.
 void 	elementDecl(java.lang.String name, java.lang.String model)
          Report an element type declaration.
 void 	endCDATA()
          Report the end of a CDATA section.
 void 	endDTD()
          Report the end of DTD declarations.
 void 	endEntity(java.lang.String name)
          Report the end of an entity.
 void 	externalEntityDecl(java.lang.String name, java.lang.String publicId, java.lang.String systemId)
          Report a parsed external entity declaration.
 InputSource 	getExternalSubset(java.lang.String name, java.lang.String baseURI)
          Tells the parser that if no external subset has been declared in the document text, none should be used.
 void 	internalEntityDecl(java.lang.String name, java.lang.String value)
          Report an internal entity declaration.
 InputSource 	resolveEntity(java.lang.String publicId, java.lang.String systemId)
          Invokes EntityResolver2.resolveEntity() with null entity name and base URI.
 InputSource 	resolveEntity(java.lang.String name, java.lang.String publicId, java.lang.String baseURI, java.lang.String systemId)
          Tells the parser to resolve the systemId against the baseURI and read the entity text from that resulting absolute URI.
 void 	startCDATA()
          Report the start of a CDATA section.
 void 	startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId)
          Report the start of DTD declarations, if any.
 void 	startEntity(java.lang.String name)
          Report the beginning of some internal and external XML entities.
*/

// CLASS (could be renamed or aliased to DefaultHandler2): http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
export class DomContentHandler {
    constructor() {
        this.saxParseExceptions = [];
        this.currentAttNodes = {};
        //if text coming is inside a cdata section then this boolean will be set to true
        this.cdata = false;
    }

    toString() {
        return "DomContentHandler";
    }

    // INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
    // implemented in DefaultHandler, DefaultHandler2:
    //  http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html and
    //  http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
    startDocument() {
        this.document = this._createDocument();
        if (this.locator) {
            //baseURI is read only (and not supported on IE)
            this.document.custBaseURI = this.locator.getSystemId();
        }
    }

    startElement(namespaceURI, localName, qName, atts) {
        let element;
        if (namespaceURI === '' || namespaceURI === null) { // namespaceURI should be null, not empty string, no?
            element = this.document.createElement(localName);
        } else {
            element = this.document.createElementNS(namespaceURI, qName);
        }
        this._appendToCurrentElement.call(this, element);
        this.currentElement = element;
        this._addAtts.call(this, atts);
        this._addNsDecls.call(this);
        this._setBaseUri.call(this, atts);
    }

    endElement(namespaceURI, localName, qName) {
        this.currentElement = this.currentElement.parentNode;
    }

    startPrefixMapping(prefix, uri) {
        /* not supported by all browsers*/
        if (this.document.createAttributeNS) {
            // We need to store the declaration for later addition to the element, since the
            //   element is not yet available
            let qName = prefix ? "xmlns:" + prefix : "xmlns";
            let att = this.document.createAttributeNS("http://www.w3.org/2000/xmlns/", qName);
            att.nodeValue = uri;
            if (!prefix) {
                prefix = ':'; // Put some unique value as our key which a prefix cannot use
            }
            this.currentAttNodes[prefix] = att;
        }
    }

    endPrefixMapping(prefix) {
    }

    processingInstruction(target, data) {
        let procInst = this.document.createProcessingInstruction(target, data);
        this._appendToCurrentElement.call(this, procInst);
    }

    ignorableWhitespace(ch, start, length) {
    }

    characters(ch, start, length) {
        if (this.cdata) {
            let cdataNode = this.document.createCDATASection(ch);
            this.currentElement.appendChild(cdataNode);
        } else {
            let textNode = this.document.createTextNode(ch);
            this.currentElement.appendChild(textNode);
        }
    }

    skippedEntity(name) {
    }

    endDocument() {
    }

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
        let commentNode = this.document.createComment(ch);
        this._appendToCurrentElement.call(this, commentNode);
    }

    endCDATA() {
        //used in characters() methods
        this.cdata = false;
    }

    endDTD() { }
    endEntity(name) { }

    startCDATA() {
        //used in characters() methods
        this.cdata = true;
    }

    startDTD(name, publicId, systemId) {
        if (document.implementation && document.implementation.createDocumentType) {
            let dt = document.implementation.createDocumentType(name, publicId, systemId);
            this._appendToCurrentElement.call(this, dt);
        }
    }

    startEntity(name) { }

    // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
    // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
    // DomContentHandler.prototype.resolveEntity(publicId, systemId) {};

    // INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
    resolveEntity(name, publicId, baseURI, systemId) { }

    getExternalSubset(name, baseURI) { }

    // INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
    notationDecl(name, publicId, systemId) { }

    unparsedEntityDecl(name, publicId, systemId, notationName) { }

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


    /* Private static helper function */
    _createDocument() {
        // code for IE
        let doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
        }
        // code for Mozilla, Firefox
        else {
            doc = document.implementation.createDocument(null, "", null);
        }
        return doc;
    }

    /* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
    _appendToCurrentElement(node) {
        if (!this.currentElement) {
            this.document.appendChild(node);
        } else {
            this.currentElement.appendChild(node);
        }
    }
    _addAtts(atts) {
        for (let i = 0; i < atts.getLength(); i++) {
            let namespaceURI = atts.getURI(i);
            let value = atts.getValue(i);
            if (namespaceURI === '' || namespaceURI === null) { // namespaceURI should be null, not empty string, no?
                let localName = atts.getLocalName(i);
                this.currentElement.setAttribute(localName, value);
            } else {
                let qName = atts.getQName(i);
                this.currentElement.setAttributeNS(namespaceURI, qName, value);
            }
        }
    }
    _addNsDecls() { // Will add namespaces (for true XHTML) where they are declared (even if not used at that point)
        if (this.currentElement.setAttributeNodeNS) {
            for (let prefix in this.currentAttNodes) {
                this.currentElement.setAttributeNodeNS(this.currentAttNodes[prefix]);
            }
            this.currentAttNodes = {};
        }
    }
    _setBaseUri(atts) {
        this.currentElement.custBaseURI = this.currentElement.parentNode.custBaseURI;
        for (let i = 0; i < atts.getLength(); i++) {
            let namespaceURI = atts.getURI(i);
            if (namespaceURI === "http://www.w3.org/XML/1998/namespace") {
                let localName = atts.getLocalName(i);
                if (localName === "base") {
                    let xmlBase = atts.getValue(i);
                    //remove eventual file name at the end of URI and append xmlBase
                    let idx = this.currentElement.custBaseURI.lastIndexOf('/');
                    this.currentElement.custBaseURI = this.currentElement.custBaseURI.substring(0, idx + 1) + xmlBase;
                }
            }
        }
    }

}

