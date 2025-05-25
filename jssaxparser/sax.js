/*global window, document, XMLHttpRequest, ActiveXObject, AnyName, Attribute, AttributeNode, Choice, Context, DatatypeLibrary, Element, ElementNode, Empty, Group, NOT_CHAR, 
Name, NotAllowed, OneOrMore, QName, SAXScanner, Text , TextNode, ValidatorFunctions, XMLFilterImpl2, NamespaceSupport, InputSource, StringReader, Attributes2Impl, AttributesImpl */
(function () {
    // Begin namespace

    let that = this; // probably window object

    /* Private static variables (constant) */


    // http://www.saxproject.org/apidoc/org/xml/sax/SAXException.html
    class SAXException extends Error {
        constructor(message, exception) { // java.lang.Exception
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

    SAXException.constructor = SAXException;

    // Not fully implemented
    // http://www.saxproject.org/apidoc/org/xml/sax/SAXNotSupportedException.html
    class SAXNotSupportedException extends SAXException {
        constructor(msg) { // java.lang.Exception
            this.message = msg || '';
        }
    }

    SAXNotSupportedException.constructor = SAXNotSupportedException;

    // http://www.saxproject.org/apidoc/org/xml/sax/SAXNotRecognizedException.html
    class SAXNotRecognizedException extends SAXException {
        constructor(msg) { // java.lang.Exception
            this.message = msg || '';
        }
    }

    SAXNotRecognizedException.constructor = SAXNotRecognizedException;

    //This constructor is more complex and not presently implemented;
    //  see Java API to implement additional arguments correctly
    // http://www.saxproject.org/apidoc/org/xml/sax/SAXParseException.html
    class SAXParseException extends SAXException {
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

    SAXParseException.constructor = SAXParseException;

    // NOTES:
    // 1) The following notes might not be perfectly up to date
    // 2) No property should be retrieved or set publicly.
    // 3) We have at least a skeleton for all non-deprecated, non-adapter SAX2 classes/interfaces/exceptions
    // 4) // The official SAX2 parse() method is not fully implemented (to accept an InputSource object constructed by a
    //    Reader (like StringReader would probably be best) or InputStream). For now the parseString() method can
    //    be used (and is more convenient than converting to an InputSource object).
    // 5) // The feature/property defaults are incomplete, as they really depend on the implementation and how far we
    //   implement them; however, we've added defaults, two of which (on namespaces) are required to be
    //   supported (though they don't need to support both true and false options).
    // 6) Currently does not call the following (lexicalHandler, dtdHandler, and errorHandler interface methods, are all supported, however):
    //  a) on the contentHandler: ignorableWhitespace(), skippedEntity() and for startElement(), support Attributes2 in 4th argument (rename AttributesImpl to Attributes2Impl and support interface)
    //  b) on the declarationHandler: externalEntityDecl()
    //  c) on entityResolver: resolveEntity() and for EntityResolver2 interface: resolveEntity() (additional args) or getExternalSubset()
    //  d) much of Locator information is not made available
    //  e) domNode

    class SAXParser {
        constructor(
            contentHandler,
            lexicalHandler,
            errorHandler,
            declarationHandler,
            dtdHandler,
            entityResolver,
            locator,
            domNode
        ) {
            // Implements SAX2 XMLReader interface (except for parse() methods)
            // XMLReader doesn't specify a constructor (though XMLFilterImpl does), so this class is able to define its own behavior to accept a contentHandler, etc.

            this.contentHandler = contentHandler;
            this.locator = locator;
            if (this.locator) { // Set defaults (if accessed before set)
                // For Locator (there are no standard fields for us to use; our Locator must support these)
                this.locator.columnNumber = -1;
                this.locator.lineNumber = -1;
                this.locator.publicId = null;
                this.locator.systemId = null;
                // For Locator2 (there are no standard fields for us to use; our Locator2 must support these)
                this.locator.version = null;
                this.locator.encoding = null;
                this.contentHandler.setDocumentLocator(locator);
            }
            this.dtdHandler = dtdHandler;
            this.errorHandler = errorHandler;
            this.entityResolver = entityResolver || null;

            if (typeof that.AttributesImpl !== 'function') {
                throw new SAXException("you must import an implementation of AttributesImpl, like AttributesImpl.js, in the html");
            }
            
            try {
                this.namespaceSupport = new NamespaceSupport();
            } catch(e2) {
                throw new SAXException("you must import an implementation of NamespaceSupport, like NamespaceSupport.js, in the html", e2);
            }

            this.disallowedGetProperty = [];
            this.disallowedGetFeature = [];
            this.disallowedSetProperty = [];
            this.disallowedSetFeature = [];

            this.disallowedSetPropertyValues = {};
            this.disallowedSetFeatureValues = {};

            // For official features and properties, see http://www.saxproject.org/apidoc/org/xml/sax/package-summary.html#package_description
            // We can define our own as well
            // Except where specified, all features and properties should be supported (in at least the default configuration)
            this.features = {}; // Boolean values
            this.features['http://xml.org/sax/features/external-general-entities'] = false; // Not supported yet
            this.features['http://xml.org/sax/features/external-parameter-entities'] = false; // Not supported yet
            this.features['http://xml.org/sax/features/is-standalone'] = undefined; // Can only be set during parsing
            this.features['http://xml.org/sax/features/lexical-handler/parameter-entities'] = false; // Not supported yet
            this.features['http://xml.org/sax/features/namespaces'] = true; // must support true
            this.features['http://xml.org/sax/features/namespace-prefixes'] = false; // must support false; are we now operating as true? (i.e., XML qualified names (with prefixes) and attributes (including xmlns* attributes) are available?)
            this.features['http://xml.org/sax/features/resolve-dtd-uris'] = true;
            this.features['http://xml.org/sax/features/string-interning'] = true; // Make safe to treat string literals as identical to String()
            this.features['http://xml.org/sax/features/unicode-normalization-checking'] = false;
            this.features['http://xml.org/sax/features/use-attributes2'] = true; // Not supported yet
            this.features['http://xml.org/sax/features/use-locator2'] = !!(locator && // No interfaces in JavaScript, so we duck-type:
                                                                                                                            typeof locator.getXMLVersion === 'function' &&
                                                                                                                            typeof locator.getEncoding === 'function'
                                                                                                                        ); // Not supported yet
            this.features['http://xml.org/sax/features/use-entity-resolver2'] = true;
            this.features['http://xml.org/sax/features/validation'] = false;
            this.features['http://xml.org/sax/features/xmlns-uris'] = false;
            this.features['http://xml.org/sax/features/xml-1.1'] = false; // Not supported yet

            this.features['http://apache.org/xml/features/nonvalidating/load-external-dtd'] = false;

            // Our custom features (as for other features, retrieve/set publicly via getFeature/setFeature):
            // We are deliberately non-conformant by default (for performance reasons)
            this.features['http://debeissat.nicolas.free.fr/ns/character-data-strict'] = false;
            /*for usual case it is possible to deactivate augmentation of XML instance from schema
            if that is activated, a schema of the XML is built during the parsing, and :
                - attributes are typed
                - whitespace normalization of attributes is possible
                - optional attributes which have default values are added
                - validation is possible
                that feature is automatically enabled if validation of attribute-whitespace-normalization is activated
            */
            this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation'] = false;
            //without that property sax_vs_browser.html.html does not work as Firefox will not normalize attribute value properly
            this.features['http://debeissat.nicolas.free.fr/ns/attribute-whitespace-normalization'] = false;

            this.properties = {}; // objects
            this.properties['http://xml.org/sax/properties/declaration-handler'] = this.declarationHandler = declarationHandler;
            this.properties['http://xml.org/sax/properties/document-xml-version'] = null; // string
            this.properties['http://xml.org/sax/properties/dom-node'] = this.domNode = domNode; // Not supported yet (if treating DOM node as though SAX2, this will be starting node)
            this.properties['http://xml.org/sax/properties/lexical-handler'] = this.lexicalHandler = lexicalHandler || null;
            this.properties['http://xml.org/sax/properties/xml-string'] = null; // Not supported yet (update with characters that were responsible for the event)
        }

        /* CUSTOM API */
        toString() {
            return "SAXParser";
        }

        // BEGIN SAX2 XMLReader INTERFACE
        getContentHandler() {
            // Return the current content handler (ContentHandler).
            return this.contentHandler;
        }

        getDTDHandler() {
            // Return the current DTD handler (DTDHandler).
            return this.dtdHandler;
        }

        getEntityResolver() {
            // Return the current entity resolver (EntityResolver).
            return this.entityResolver;
        }

        getErrorHandler() {
            // Return the current error handler (ErrorHandler).
            return this.errorHandler;
        }

        getFeature(name) { // (java.lang.String)
            // Look up the value of a feature flag (boolean).
            if (this.features[name] === undefined) {
              throw new SAXNotRecognizedException();
            } else if (this.disallowedGetFeature.indexOf(name) !== -1) {
              throw new SAXNotSupportedException();
            }
            return this.features[name];
        }

        getProperty(name) { // (java.lang.String)
            // Look up the value of a property (java.lang.Object).
            // It is possible for an XMLReader to recognize a property name but temporarily be unable to return its value. Some property values may be available only in specific contexts, such as before, during, or after a parse.
            if (this.properties[name] === undefined) {
              throw new SAXNotRecognizedException();
            } else if (this.disallowedGetProperty.indexOf(name) !== -1) {
              throw new SAXNotSupportedException();
            }
            return this.properties[name];
        }

        // For convenience, when dealing with strings as input, one can simply use our own parseString() instead of
        // XMLReader's parse() which expects an InputSouce (or systemId)
        // Note: The InputSource argument is not fully supported, as the parser currently does not use its methods for parsing
        parse(inputOrSystemId, noCache) { // (InputSource input OR java.lang.String systemId)
            // Parse an XML document (void). OR
            // Parse an XML document from a system identifier (URI) (void).
            // may throw java.io.IOException or SAXException
            let systemId, xmlAsString, path;
            //InputSource may not have been imported
            if (typeof that.InputSource === 'function' && inputOrSystemId instanceof InputSource) {
                let charStream = inputOrSystemId.getCharacterStream();
                let byteStream = inputOrSystemId.getByteStream();
                // Priority for the parser is characterStream, byteStream, then URI, but we only really implemented the systemId (URI), so we automatically go with that
                systemId = inputOrSystemId.getSystemId();
                if (charStream) {
                    if (charStream instanceof StringReader) { // Fix: This if-else is just a hack, until the parser may support Reader's methods like read()
                        xmlAsString = charStream.s;
                    } else {
                        throw "A character stream InputSource is not implemented at present unless it is a StringReader character stream (and that only if it is our own version which has the string on the 's' property)";
                    }
                } else if (byteStream || systemId) {
                    this.encoding = inputOrSystemId.getEncoding(); // To be used during XML Declaration checking
                    if (byteStream) {
                        throw "A byte stream InputSource is not implemented at present in SAXParser's parse() method";
                    }
                }
                if (!systemId && !xmlAsString) {
                    throw "The SAXParser parse() method must, at present, take an InputSource with a systemId or with a StringReader character stream";
                }
            } else if (typeof inputOrSystemId === "string") {
                systemId = inputOrSystemId;
            } else {
                throw "The argument supplied to SAXParser's parse() method was invalid";
            }
            this.systemId = systemId;
            if (!xmlAsString) { // If not set above
                // Fix: According to the specification for parse() (and InputSource's systemId constructor), the URL should be fully resolved (not relative)
                if (noCache) {
                    systemId += ((systemId.indexOf('?') === -1) ? '?' : '&') + '_saxQuertyTime=' + new Date().getTime();
                }
                xmlAsString = SAXParser.loadFile(systemId);
                //get the path to the file
                path = systemId.substring(0, systemId.lastIndexOf("/") + 1);
                this.baseURI = path;
            }
            this.parseString(xmlAsString);
        }

        parseString(xmlAsString) {
            let reader = new StringReader(xmlAsString);
            let readerWrapper = new ReaderWrapper(reader);
            this.initReaders(readerWrapper, reader);
            this.saxScanner.parse(readerWrapper);
        }

        initReaders(readerWrapper, reader) {
            let saxEvents = new XMLFilterImpl2(this);
            this.saxScanner = new SAXScanner(this, saxEvents);
            this.saxScanner.namespaceSupport = this.namespaceSupport;
            if (this.features['http://debeissat.nicolas.free.fr/ns/character-data-strict']) {
                this.saxScanner.CHAR_DATA_REGEXP = new RegExp(this.saxScanner.NOT_CHAR+'|[<&\\]]');
            } else {
                this.saxScanner.CHAR_DATA_REGEXP = /[<&\]]/;
            }
            if (!(this.features['http://apache.org/xml/features/nonvalidating/load-external-dtd'])) {
                this.saxScanner.loadExternalDtd = function(externalId) {};
            }
            if (this.features['http://xml.org/sax/features/validation']) {
                this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation'] = true;
                saxEvents.endDocument = this.endDocument_validating;
            }
            if (this.features['http://debeissat.nicolas.free.fr/ns/attribute-whitespace-normalization']) {
                saxEvents.attWhitespaceNormalize = SAXParser.attWhitespaceNormalize;
                if (this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation']) {
                    saxEvents.attWhitespaceCollapse = SAXParser.attWhitespaceCollapse;
                }
            }
            if (this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation']) {
                saxEvents.startDocument = this.startDocument_augmenting;
                saxEvents.startDTD = this.startDTD_augmenting;
                saxEvents.elementDecl = this.elementDecl_augmenting;
                saxEvents.attributeDecl = this.attributeDecl_augmenting;
                if (this.features['http://xml.org/sax/features/validation']) {
                    saxEvents.augmenting_elm = this.augmenting_elm;
                    saxEvents.startElement = this.startElement_validating;
                } else {
                    saxEvents.augmenting_elm = this.augmenting_elm;
                    saxEvents.startElement = this.startElement_augmenting;
                }
                saxEvents.endElement = this.endElement_augmenting;
                saxEvents.characters = this.characters_augmenting;
            }
            if (this.features['http://xml.org/sax/features/use-entity-resolver2']) {
                saxEvents.resolveEntity = this.resolveEntity;
            }
            if (this.features['http://xml.org/sax/features/use-attributes2']) {
                this.getAttributesInstance = this.getAttributes2Instance;
            } else {
                this.getAttributesInstance = this.getAttributes1Instance;
            }
            if (this.contentHandler.locator) {
                this.contentHandler.locator.reader = reader;
                this.contentHandler.locator.setSystemId(this.systemId);
                saxEvents.startDTDOld = saxEvents.startDTD;
                saxEvents.startDTD = function(name, publicId, systemId) {
                    // Check: name or publicId ?
                    this.getContentHandler().locator.setPublicId(name);
                    return this.startDTDOld(name, publicId, systemId);
            }
                this.contentHandler.locator.getColumnNumberOld = this.contentHandler.locator.getColumnNumber;
                this.contentHandler.locator.getLineNumberOld = this.contentHandler.locator.getLineNumber;
                this.contentHandler.locator.getColumnNumber = function () {
                    let columnNumber = this.reader.nextIdx - this.reader.s.substring(0, this.reader.nextIdx).lastIndexOf("\n");
                    this.setColumnNumber(columnNumber);
                    return this.getColumnNumberOld();
                };
                this.contentHandler.locator.getLineNumber = function () {
                    let lineNumber = this.reader.s.substring(0, this.reader.nextIdx).split("\n").length;
                    this.setLineNumber(lineNumber);
                    return this.getLineNumberOld();
                };
            }
            saxEvents.warning = this.warning;
            saxEvents.error = this.error;
            saxEvents.fatalError = this.fatalError;
        }

        /* convenient method in order to set all handlers at once */
        setHandler(handler) { // (ContentHandler/LexicalHandler/ErrorHandler/DeclarationHandler/DtdHandler)/EntityResolver(2)
            this.contentHandler = handler;
            this.lexicalHandler = handler;
            this.errorHandler = handler;
            this.declarationHandler = handler;
            this.dtdHandler = handler;
            this.entityResolver = handler;
        }

        setContentHandler(handler) { // (ContentHandler)
            // Allow an application to register a content event handler (void).
            this.contentHandler = handler;
        }

        setDTDHandler(handler) { // (DTDHandler)
            // Allow an application to register a DTD event handler (void).
            this.dtdHandler = handler;
        }

        setEntityResolver(resolver) { // (EntityResolver)
            // Allow an application to register an entity resolver (void).
            this.entityResolver = resolver;
        }

        setErrorHandler(handler) { // (ErrorHandler)
            // Allow an application to register an error event handler (void).
            this.errorHandler = handler;
        }

        setFeature(name, value) { // (java.lang.String, boolean)
            // Set the value of a feature flag (void).
            if (this.features[name] === undefined) { // Should be defined already in some manner
                throw new SAXNotRecognizedException();
            } else if (
                    (this.disallowedSetFeatureValues[name] !== undefined &&
                            this.disallowedSetFeatureValues[name] === value) ||
                        (this.disallowedSetFeature.indexOf(name) !== -1)
                    ){
                throw new SAXNotSupportedException();
            }
            this.features[name] = value;
        }

        setProperty(name, value) { // (java.lang.String, java.lang.Object)
            // Set the value of a property (void).
            // It is possible for an XMLReader to recognize a property name but to be unable to change the current value. Some property values may be immutable or mutable only in specific contexts, such as before, during, or after a parse.
            if (this.properties[name] === undefined) { // Should be defined already in some manner
                throw new SAXNotRecognizedException();
            } else if (
                        (this.disallowedSetPropertyValues[name] !== undefined &&
                            this.disallowedSetPropertyValues[name] === value) ||
                        (this.disallowedSetProperty.indexOf(name) !== -1)
                    ){
                throw new SAXNotSupportedException();
            }
            this.properties[name] = value;
            switch (name) { // Keep any aliases up to date as well
                case 'http://xml.org/sax/properties/lexical-handler':
                    this.lexicalHandler = value;
                    break;
                case 'http://xml.org/sax/properties/declaration-handler':
                    this.declarationHandler = value;
                    break;
                case 'http://xml.org/sax/properties/dom-node':
                    this.domNode = value;
                    break;
            }
        }

        // END SAX2 XMLReader INTERFACE


        // BEGIN FUNCTIONS WHICH SHOULD BE CONSIDERED PRIVATE
        getAttributes2Instance() {
            return new Attributes2Impl();
        }

        getAttributes1Instance() {
            return new AttributesImpl();
        }

        startDocument_augmenting() {
            //initializes the elements at saxParser level, not at XMLFilter
            this.elements = {};
            this.instanceContext = new Context("", []);
            let datatypeLibrary = new DatatypeLibrary();
            this.debug = false;
            this.validatorFunctions = new ValidatorFunctions(this, datatypeLibrary);
            return this.parent.contentHandler.startDocument.call(this.parent.contentHandler);
        }

        startDTD_augmenting(name, publicId, systemId) {
            this.pattern = this.elements[name] = new Element(new Name(null, name));

            this.context = new Context(publicId, []);
            if (this.parent && this.parent.lexicalHandler) {
                return this.parent.lexicalHandler.startDTD.call(this.parent.lexicalHandler, name, publicId, systemId);
            }
            return undefined;
        }

        /*
        [51]    	Mixed	   ::=   	'(' S? '#PCDATA' (S? '|' S? Name)* S? ')*'
                    | '(' S? '#PCDATA' S? ')'
        */
        static getPatternFromMixed(model, xmlFilter) {
            // if other elements
            let pattern, mixed = /^\( ?#PCDATA ?(\|.*) ?\)\*$/.exec(model);
            if (mixed !== null) {
                //remove whitespaces
                let elements = mixed[1].replace(/ /g, "");
                let splitOr = elements.split("|");
                //from the last to the second
                for (let i = splitOr.length - 1 ; i > 0 ; i--) {
                    //trim whitespaces
                    let elemName = splitOr[i];
                    if (!xmlFilter.elements[elemName]) {
                        xmlFilter.elements[elemName] = new Element(new Name(null, elemName));
                    }
                    //adds it to the current pattern
                    if (pattern) {
                        pattern = new Group(xmlFilter.elements[elemName], pattern);
                    } else {
                        pattern = xmlFilter.elements[elemName];
                    }
                }
                // it is a zero or more
                return new Choice(new Empty(), new OneOrMore(new Choice(new Text(), pattern)));
            }
            return new Text();
        }

        static getPatternFromChildren(model, xmlFilter) {
            let brackets = /^\( ?(.*) ?\)([*+?]?)$/.exec(model);
            if (brackets != null) {
                var restOfModel = brackets[1];
                var operator = brackets[2];
                var pattern = SAXParser.getPatternFromChildren(restOfModel, xmlFilter);
                switch (operator) {
                    case "?":
                        pattern = new Choice(pattern, new Empty());
                        break;
                    case "+":
                        pattern = new OneOrMore(pattern);
                        break;
                    case "*":
                        pattern = new Choice(new Empty(), new OneOrMore(pattern));
                        break;
                }
                return pattern;
            } else {
                let parsedModel = parseModelRegexp.exec(model);
                let name = parsedModel[1];
                var operator = parsedModel[2];
                let separator = parsedModel[4];
                var restOfModel = parsedModel[5];
                if (!xmlFilter.elements[name]) {
                    xmlFilter.elements[name] = new Element(new Name(null, name));
                }
                var pattern;
                switch (operator) {
                    case "?":
                        pattern = new Choice(xmlFilter.elements[name], new Empty());
                        break;
                    case "+":
                        pattern = new OneOrMore(xmlFilter.elements[name]);
                        break;
                    case "*":
                        pattern = new Choice(new Empty(), new OneOrMore(xmlFilter.elements[name]));
                        break;
                    //in case there is no operator, undefined
                    default:
                        pattern = xmlFilter.elements[name];
                        break;
                }
                if (restOfModel) {
                    var pattern2 = SAXParser.getPatternFromChildren(restOfModel, xmlFilter);
                }
                if (pattern2) {
                    if (separator === "|") {
                        pattern = new Choice(pattern, pattern2);
                    } else {
                        pattern = new Group(pattern, pattern2);
                    }
                }
                return pattern;
            }
        }

        /*
        [45]   	elementdecl	   ::=   	'<!ELEMENT' S  Name  S  contentspec  S? '>'	[VC: Unique Element Type Declaration]
        [46]   	contentspec	   ::=   	'EMPTY' | 'ANY' | Mixed | children 
        [51]    	Mixed	   ::=   	'(' S? '#PCDATA' (S? '|' S? Name)* S? ')*'
                    | '(' S? '#PCDATA' S? ')'
        */
        static getPatternFromModel(model, xmlFilter) {
            if (model === "EMPTY") {
                return new Empty();
            } else if (model === "ANY") {
                return new Choice(new Empty(), new OneOrMore(new Element(new AnyName())));
            } else {
                let pattern;
                if (/^\( ?#PCDATA/.test(model)) {
                    pattern = SAXParser.getPatternFromMixed(model, xmlFilter);
                } else {
                    pattern = SAXParser.getPatternFromChildren(model, xmlFilter);
                }
                return pattern;
            }
        }

        elementDecl_augmenting(name, model) {
            let pattern = SAXParser.getPatternFromModel(model, this);
            let element = this.elements[name];
            if (!element) {
                element = this.elements[name] = new Element(new Name(null, name), pattern);
            } else {
                //if attributes already declared
                if (element.pattern) {
                    if (pattern instanceof Text) {
                        //mixed patterns are transformed into interleave patterns between their unique child pattern and a text pattern.
                        element.pattern = new Interleave(element.pattern, pattern);
                    } else {
                        element.pattern = new Group(element.pattern, pattern);
                    }
                } else {
                    element.pattern = pattern;
                }
            }
            if (this.parent && this.parent.declarationHandler) {
                return this.parent.declarationHandler.elementDecl.call(this.parent.declarationHandler,  name, model);
            }
            return undefined;
        }

        static attWhitespaceNormalize(value) {
            value = value.replace(/\r\n/g, " ");
            return value.replace(/[\t\n\r]/g, " ");
        }

        static attWhitespaceCollapse(type, value) {
            if (type !== "string") {
                value = value.replace(/\s+/g, " ");
                //removes leading and trailing space
                value = value.replace(/^\s/, "").replace(/\s$/, "");
            }
            return value;
        }

        static addAttributesIn(pattern, attributes) {
            if (pattern) {
                if (pattern instanceof Choice) {
                    SAXParser.addAttributesIn(pattern.pattern1, attributes);
                    SAXParser.addAttributesIn(pattern.pattern2, attributes);
                } else if (pattern instanceof Interleave) {
                    SAXParser.addAttributesIn(pattern.pattern1, attributes);
                    SAXParser.addAttributesIn(pattern.pattern2, attributes);
                } else if (pattern instanceof Group) {
                    SAXParser.addAttributesIn(pattern.pattern1, attributes);
                    SAXParser.addAttributesIn(pattern.pattern2, attributes);
                } else if (pattern instanceof Attribute) {
                    attributes.push(pattern);
                }
            }
        }

        static augmentAttributes(elementNode, pattern) {
            if (pattern) {
                if (pattern instanceof Choice) {
                    SAXParser.augmentAttributes(elementNode, pattern.pattern1);
                    SAXParser.augmentAttributes(elementNode, pattern.pattern2);
                } else if (pattern instanceof Interleave) {
                    SAXParser.augmentAttributes(elementNode, pattern.pattern1);
                    SAXParser.augmentAttributes(elementNode, pattern.pattern2);
                } else if (pattern instanceof Group) {
                    SAXParser.augmentAttributes(elementNode, pattern.pattern1);
                    SAXParser.augmentAttributes(elementNode, pattern.pattern2);
                } else if (pattern instanceof Attribute) {
                    elementNode.addAttribute(pattern);
                }
            }
        }

        static isAlreadyDeclared(aName, attributes) {
            for (let i = 0 ; i < attributes.length ; i++) {
                let nameClass = attributes[i].nameClass
                if (nameClass.localName && nameClass.localName === aName) {
                    return true;
                }
            }
            return false;
        }

        attributeDecl_augmenting(eName, aName, type, mode, value) {
            let element = this.elements[eName];
            let alreadyDeclaredAttributes = [];
            if (!element) {
                element = this.elements[eName] = new Element(new Name(null, eName));
            } else {
                SAXParser.addAttributesIn(element.pattern, alreadyDeclaredAttributes);
            }
            if (SAXParser.isAlreadyDeclared(aName, alreadyDeclaredAttributes)) {
                this.warning("attribute : [" + aName + "] under element : [" + eName + "] is already declared", this.parent.saxScanner);
            } else {
                let datatype;
                if (type === "NMTOKENS" || type === "NMTOKEN") {
                    datatype = new Datatype("http://www.w3.org/2001/XMLSchema-datatypes", type);
                } else {
                    datatype = new Datatype("http://www.w3.org/2001/XMLSchema-datatypes", "string");
                }
                let paramList = [];
                //if it is an enumeration
                if (/^\(.+\)$/.test(type)) {
                    let typeToParse = type.replace(/^\(/, "").replace(/\)$/, "");
                    let values = typeToParse.split("|");
                    let i = values.length;
                    while (i--) {
                        paramList.push(new Param("enumeration", values[i]));
                    }
                }
                let attributePattern = new Attribute(new Name(null, aName), new Data(datatype, paramList));
                //stores the index in order to respect the order (only for tests validation purpose)
                attributePattern.index = alreadyDeclaredAttributes.length;
                //if it is optional
                if (mode !== "#REQUIRED") {
                    //if a default value is provided
                    if (value) {
                        let valueNormalized = SAXParser.attWhitespaceCollapse(type, value);
                        attributePattern.defaultValue = new Value(datatype, valueNormalized, this.context);
                    }
                    attributePattern = new Choice(attributePattern, new Empty());
                }
                if (element.pattern) {
                    let group = new Group(element.pattern, attributePattern);
                    element.pattern = group;
                } else {
                    element.pattern = attributePattern;
                }
            }
            if (this.parent && this.parent.declarationHandler) {
                return this.parent.declarationHandler.attributeDecl.call(this.parent.declarationHandler, eName, aName, type, mode, value);
            }
            return undefined;
        }

        augmenting_elm(namespaceURI, localName, qName, atts) {
            let attributeNodes = [];
            for (let i = 0 ; i < atts.getLength() ; i++) {
                let newAtt = new AttributeNode(new QName(atts.getURI(i), atts.getLocalName(i)), atts.getValue(i));
                newAtt.atts = atts;
                newAtt.index = i;
                //may need normalization
                newAtt.attWhitespaceCollapse = this.attWhitespaceCollapse;
                newAtt.setType = function(type) {
                    this.atts.setType(this.index, type);
                    if (this.attWhitespaceCollapse) {
                        let oldValue = this.atts.getValue(this.index);
                        let newValue = this.attWhitespaceCollapse(type, oldValue);
                        this.atts.setValue(this.index, newValue);
                    }
                    if (this.atts.setDeclared) {
                        this.atts.setDeclared(this.index, true);
                        this.atts.setSpecified(this.index, true);
                    }
                };
                attributeNodes.push(newAtt);
            }
            let newElement = new ElementNode(new QName(namespaceURI, localName), this.instanceContext, attributeNodes, []);
            newElement.atts = atts;
            newElement.addAttribute = function(pattern) {
                let qName = pattern.nameClass;
                //pattern is Attribute, pattern.pattern is Data
                let type = null;
                if (pattern.pattern instanceof Data || pattern.pattern instanceof DataExcept) {
                    type = pattern.pattern.datatype.localName;
                }
                let value = pattern.defaultValue.string;
                let index;
                if (pattern.index !== undefined && this.atts.addAttributeAtIndex) {
                    index = pattern.index;
                    this.atts.addAttributeAtIndex(pattern.index, qName.uri, qName.localName, qName.localName, type, value);
                } else {
                    index = atts.getLength();
                    this.atts.addAttribute(qName.uri, qName.localName, qName.localName, type, value);
                }
                //if attributes2 is used
                if (atts.setDeclared) {
                    atts.setDeclared(index, true);
                    atts.setSpecified(index, false);
                }
                this.attributeNodes.push(new AttributeNode(qName, value));
            };
            //this.childNode must be an ElementNode
            if (!this.childNode) {
                this.childNode = this.currentElementNode = newElement;
            } else {
                this.currentElementNode.childNodes.push(newElement);
                newElement.setParentNode(this.currentElementNode);
                this.currentElementNode = newElement;
            }
        }

        /*
        sets the type of the attributes from DTD
        and the default values of non present attributes
        */
        startElement_augmenting(namespaceURI, localName, qName, atts) {
            //may not have any DTD
            if (this.context) {
                this.augmenting_elm(namespaceURI, localName, qName, atts);
                //DTD augmentation
                let pattern = this.elements[localName];
                if (pattern) {
                    SAXParser.augmentAttributes(this.currentElementNode, pattern.pattern);
                }
            }
            return this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts);
        }

        startElement_validating(namespaceURI, localName, qName, atts) {
            //may not have any DTD
            if (this.context) {
                this.augmenting_elm(namespaceURI, localName, qName, atts);
                this.resultPattern = this.validatorFunctions.childDeriv(this.context, this.pattern, this.childNode);
                if (this.resultPattern instanceof NotAllowed && !(this.resultPattern instanceof MissingContent)) {
                    let str = "document not valid, message is : [" + this.resultPattern.message + "]";
                    if (this.resultPattern.pattern) {
                        str += ", expected was : [" + this.resultPattern.pattern.toHTML() + "], found is : [" + this.resultPattern.childNode.toHTML() + "]";
                    }
                    this.warning(str);
                }
            }
            return this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts);
        }

        endElement_augmenting(namespaceURI, localName, qName) {
            if (this.currentElementNode && this.currentElementNode.parentNode) {
                this.currentElementNode = this.currentElementNode.parentNode;
            }
            return this.parent.contentHandler.endElement.call(this.parent.contentHandler, namespaceURI, localName, qName);
        }

        characters_augmenting(ch, start, length) {
            //may not have any DTD
            if (this.context) {
                let newText = new TextNode(ch);
                this.currentElementNode.childNodes.push(newText);
            }
            return this.parent.contentHandler.characters.call(this.parent.contentHandler, ch, start, length);
        }

        endDocument_validating() {
            //if a dtd is present
            if (this.pattern) {
                this.resultPattern = this.validatorFunctions.childDeriv(this.context, this.pattern, this.childNode);
                if (this.resultPattern instanceof NotAllowed) {
                    //may be string directly
                    let found = this.resultPattern.childNode;
                    if (found.toHTML) {
                        found = found.toHTML();
                    }
                    throw new SAXException("document not valid, message is : [" + this.resultPattern.message + "], expected was : [" + this.resultPattern.pattern.toHTML() + "], found is : [" + found + "]");
                }
            }
            return this.parent.contentHandler.endDocument.call(this.parent.contentHandler);
        }

        static loadFile(fname) {
            let xmlhttp = null;
            if (window.XMLHttpRequest) {// code for Firefox, Opera, IE7, etc.
                xmlhttp = new XMLHttpRequest();
            } else if (window.ActiveXObject) {// code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (xmlhttp !== null) {
                xmlhttp.open("GET", fname, false);
                xmlhttp.send(null);
                if (xmlhttp.readyState === 4) {
                    return xmlhttp.responseText;
                }
            } else {
                throw new SAXException("Your browser does not support XMLHTTP, the external entity with URL : [" + fname + "] will not be resolved");
            }
            return false;
        }

        resolveEntity(entityName, publicId, baseURI, systemId) {
            let txt;
            if (baseURI) {
                txt = SAXParser.loadFile(baseURI + systemId);
            //new version of method
            } else {
                txt = SAXParser.loadFile(systemId);
            }
            if (txt) {
                //http://www.w3.org/TR/xml/#sec-line-ends replace \r\n and \r by \n
                txt = txt.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                return txt;
            }
            return "";
        }

        static getSAXParseException(message, locator, saxScanner) {
            let saxParseException = new SAXParseException(message, locator);
            return saxParseException;
        }

        warning(message, saxScanner) {
            let saxParseException = SAXParser.getSAXParseException(message, this.parent.contentHandler.locator, saxScanner);
            if (this.parent && this.parent.errorHandler) {
                this.parent.errorHandler.warning.call(this.parent.errorHandler, saxParseException);
            }
        }

        error(message, saxScanner) {
            let saxParseException = SAXParser.getSAXParseException(message, this.parent.contentHandler.locator, saxScanner);

            if (this.parent && this.parent.errorHandler) {

                this.parent.errorHandler.error.call(this.parent.errorHandler, saxParseException);
            }
        }

        fatalError(message, saxScanner) {
            let saxParseException = SAXParser.getSAXParseException(message, this.parent.contentHandler.locator, saxScanner);
            if (this.parent && this.parent.errorHandler) {
                this.parent.errorHandler.fatalError.call(this.parent.errorHandler, saxParseException);
            }
            throw saxParseException;
        }
    }

    /*
    [47]   	children	   ::=   	(choice | seq) ('?' | '*' | '+')?
    [48]   	cp	   ::=   	(Name | choice | seq) ('?' | '*' | '+')?
    [49]   	choice	   ::=   	'(' S? cp ( S? '|' S? cp )+ S? ')'
    [50]   	seq	   ::=   	'(' S? cp ( S? ',' S? cp )* S? ')'
    */
    /* XML Name regular expressions */
    // Should disallow independent high or low surrogates or inversed surrogate pairs and also have option to reject private use characters; but strict mode will need to check for sequence of 2 characters if a surrogate is found
    let NAME_START_CHAR = ":A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u0200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\ud800-\udbff\udc00-\udfff"; // The last two ranges are for surrogates that comprise #x10000-#xEFFFF; // Fix: Need to remove surrogate pairs here and handle elsewhere; also must deal with surrogates in entities
    let NAME_END_CHAR = ".0-9\u00B7\u0300-\u036F\u203F-\u2040-"; // Don't need escaping since to be put in a character class
    let parseModelRegexp = new RegExp("([" + NAME_START_CHAR + "][" + NAME_START_CHAR + NAME_END_CHAR + "]*)([*+?])? ?(([,|])?(.*))?");

    /*
    static XMLReader 	createXMLReader()
              Attempt to create an XMLReader from system defaults.
    static XMLReader 	createXMLReader(java.lang.String className)
              Attempt to create an XML reader from a class name.
    */
    class XMLReaderFactory {
        constructor() {
            throw 'XMLReaderFactory is not meant to be instantiated';
        }

        // PUBLIC API
        static createXMLReader(className) {
            if (className) {
                return new that[className]();
            }
            return new SAXParser(); // our system default XMLReader (parse() not implemented, however)
        }

        // CUSTOM CONVENIENCE METHODS

        static getSaxImport() {
            if (!that.saxImport) {
                let scripts = document.getElementsByTagName("script");
                for (let i = 0 ; i < scripts.length ; i++) {
                    let script = scripts.item(i);
                    let src = script.getAttribute("src");
                    if (src && src.match("sax.js")) {
                        that.saxImport = script;
                        return that.saxImport;
                    }
                }
            }
            return that.saxImport;
        }

        static getJsPath() {
            if (that.jsPath === undefined) {
                let scriptTag = XMLReaderFactory.getSaxImport();
                if (scriptTag) {
                    let src = scriptTag.getAttribute("src");
                    that.jsPath = src.substring(0, src.lastIndexOf("/") + 1);
                }
            }
            return that.jsPath;
        }

        static importJS(filename) {
            let scriptTag = XMLReaderFactory.getSaxImport();
            if (scriptTag !== undefined) {
                let path = XMLReaderFactory.getJsPath();
                if (path !== undefined) {
                    let script = document.createElement("script");
                    script.setAttribute("src", path + filename);
                    script.setAttribute("type", "text/javascript");
                    scriptTag.parentNode.insertBefore(script, scriptTag);
                } else {
                    throw new SAXException("could not get path of sax.js from the script markup");
                }
            } else {
                throw new SAXException("could not find script markup importing sax.js in the document");
            }
        }

        static checkDependencies() {
            if (typeof that.SAXScanner !== 'function') {
                try {
                    this.importJS("SAXScanner.js");
                } catch(e) {
                    throw new SAXException("implementation of SAXScanner, like SAXScanner.js, not provided and could not be dynamically loaded because of exception", e);
                }
            }
            //need an implementation of AttributesImpl
            if (typeof that.AttributesImpl !== 'function') {
                try {
                    this.importJS("AttributesImpl.js");
                } catch(e2) {
                    throw new SAXException("implementation of Attributes, like AttributesImpl.js, not provided and could not be dynamically loaded because of exception", e2);
                }
            }
            //also need an implementation of NamespaceSupport
            if (typeof that.NamespaceSupport !== 'function') {
                try {
                    this.importJS("NamespaceSupport.js");
                } catch(e3) {
                    throw new SAXException("implementation of NamespaceSupport, like NamespaceSupport.js, not provided and could not be dynamically loaded because of exception", e3);
                }
            }
            if (typeof that.XMLFilterImpl !== 'function') {
                try {
                    this.importJS("XMLFilterImpls.js");
                } catch(e4) {
                    throw new SAXException("implementation of XMLFilterImpl, like XMLFilterImpls.js, not provided and could not be dynamically loaded because of exception", e4);
                }
            }
            if (typeof that.Reader !== 'function') {
                try {
                    this.importJS("Reader.js");
                } catch(e4) {
                    throw new SAXException("implementation of Reader, like Reader.js, not provided and could not be dynamically loaded because of exception", e5);
                }
            }
            if (typeof that.ReaderWrapper !== 'function') {
                try {
                    this.importJS("ReaderWrapper.js");
                } catch(e4) {
                    throw new SAXException("implementation of ReaderWrapper.js, like ReaderWrapper.js, not provided and could not be dynamically loaded because of exception", e6);
                }
            }
        }
    }


    // Add public API to global namespace (or other one, if we are in another)
    this.SAXParser = SAXParser; // To avoid introducing any of our own to the namespace, this could be commented out, and require use of XMLReaderFactory.createXMLReader(); to get a parser

    // Could put on org.xml.sax.
    this.SAXException = SAXException;
    this.SAXNotSupportedException = SAXNotSupportedException;
    this.SAXNotRecognizedException = SAXNotRecognizedException;
    this.SAXParseException = SAXParseException;

    // Could put on org.xml.sax.helpers.
    this.XMLReaderFactory = XMLReaderFactory;

    XMLReaderFactory.checkDependencies();
}()); // end namespace
