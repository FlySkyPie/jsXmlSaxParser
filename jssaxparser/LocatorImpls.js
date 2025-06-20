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

// Begin namespace

/* Supporting classes  */
// NOT USED YET (Sax class should set, though only use Locator2 API if http://xml.org/sax/features/use-locator2 feature is set on the parser)

/*
public LocatorImpl()
    Zero-argument constructor.
        This will not normally be useful, since the main purpose of this class is to make a snapshot of an existing Locator.
public LocatorImpl(Locator locator)
    Copy constructor.
        Create a persistent copy of the current state of a locator. When the original locator changes, this copy will still keep the original values (and it can be used outside the scope of DocumentHandler methods).
Parameters:
    locator - The locator to copy.
*/
export class LocatorImpl {
    constructor(locator) {
        if (locator) {
            let properties = ['columnNumber', 'lineNumber', 'publicId', 'systemId'];
            for (let i = 0; i < properties.length; i++) {
                this[properties[i]] = locator[properties[i]];
            }
        }
    }

    // INTERFACE: Locator: http://www.saxproject.org/apidoc/org/xml/sax/Locator.html
    /*
     int 	getColumnNumber()
              Return the column number where the current document event ends.
     int 	getLineNumber()
              Return the line number where the current document event ends.
     java.lang.String 	getPublicId()
              Return the public identifier for the current document event.
     java.lang.String 	getSystemId()
              Return the system identifier for the current document event.
    */
    getColumnNumber() {
        return this.columnNumber;
    }

    getLineNumber() {
        return this.lineNumber;
    }

    getPublicId() {
        return this.publicId;
    }

    getSystemId() {
        return this.systemId;
    }

    /* From Java API (not an interface, but useful part of class) */
    /*
      void 	setColumnNumber(int columnNumber)
              Set the column number for this locator (1-based).
     void 	setLineNumber(int lineNumber)
              Set the line number for this locator (1-based).
     void 	setPublicId(java.lang.String publicId)
              Set the public identifier for this locator.
     void 	setSystemId(java.lang.String systemId)
              Set the system identifier for this locator.
     **/
    setColumnNumber(columnNumber) {
        this.columnNumber = columnNumber;
    }

    setLineNumber(lineNumber) {
        this.lineNumber = lineNumber;
    }

    setPublicId(publicId) {
        this.publicId = publicId;
    }

    setSystemId(systemId) {
        this.systemId = systemId;
    }
}

/*
public Locator2Impl()
    Construct a new, empty Locator2Impl object. This will not normally be useful, since the main purpose of this class is to make a snapshot of an existing Locator.
public Locator2Impl(Locator locator)
    Copy an existing Locator or Locator2 object. If the object implements Locator2, values of the encoding and versionstrings are copied, otherwise they set to null.
Parameters:
    locator - The existing Locator object.
 **/
export class Locator2Impl extends LocatorImpl {
    constructor(locator) {
        if (locator) {
            super(locator); // 'columnNumber', 'lineNumber', 'publicId', 'systemId'
            let properties = ['encoding', 'version'];
            for (let i = 0; i < properties.length; i++) {
                this[properties[i]] = locator[properties[i]];
            }
        }
    }

    /* INTERFACE: Locator2: http://www.saxproject.org/apidoc/org/xml/sax/ext/Locator2.html
      java.lang.String 	getEncoding()
              Returns the name of the character encoding for the entity.
     java.lang.String 	getXMLVersion()
              Returns the version of XML used for the entity.
     **/
    getEncoding() {
        return this.encoding;
    }

    getXMLVersion() {
        return this.version;
    }

    /* From Java API (not an interface, but useful part of class) */
    /*
     void 	setEncoding(java.lang.String encoding)
              Assigns the current value of the encoding property.
     void 	setXMLVersion(java.lang.String version)
              Assigns the current value of the version property.
     **/
    setEncoding(encoding) {
        this.encoding = encoding;
        // A DOM version cannot set the xmlEncoding property on the document in the contentHandler as it is read-only
    }

    setXMLVersion(version) {
        this.version = version;
        // A DOM version may wish to set the xmlVersion property on the document in the contentHandler (could use getContentHandler())
        // the standAlone property on the contentHandler document (also related to the XML Declaration) may be set after determining the value from a call to the contentHandler's getFeature('http://xml.org/sax/features/is-standalone')
    }
}
