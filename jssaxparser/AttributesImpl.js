(function () {
    // Begin namespace

    /*
     int 	getIndex(java.lang.String qName)
              Look up the index of an attribute by XML qualified (prefixed) name.
     int 	getIndex(java.lang.String uri, java.lang.String localName)
              Look up the index of an attribute by Namespace name.
     int 	getLength()
              Return the number of attributes in the list.
     java.lang.String 	getLocalName(int index)
              Look up an attribute's local name by index.
     java.lang.String 	getQName(int index)
              Look up an attribute's XML qualified (prefixed) name by index.
     java.lang.String 	getType(int index)
              Look up an attribute's type by index.
     java.lang.String 	getType(java.lang.String qName)
              Look up an attribute's type by XML qualified (prefixed) name.
     java.lang.String 	getType(java.lang.String uri, java.lang.String localName)
              Look up an attribute's type by Namespace name.
     java.lang.String 	getURI(int index)
              Look up an attribute's Namespace URI by index.
     java.lang.String 	getValue(int index)
              Look up an attribute's value by index.
     java.lang.String 	getValue(java.lang.String qName)
              Look up an attribute's value by XML qualified (prefixed) name.
     java.lang.String 	getValue(java.lang.String uri, java.lang.String localName)
              Look up an attribute's value by Namespace name.
     */

    // Private helpers for AttributesImpl (private static treated as private instance below)
    function _getIndexByQName(qName) {
        let i = this.attsArray.length;
        while (i--) {
            if (this.attsArray[i].qName === qName) {
                return i;
            }
        }
        return -1;
    }
    function _getIndexByURI(uri, localName) {
        let i = this.attsArray.length;
        while (i--) {
            if (this.attsArray[i].namespaceURI === uri && this.attsArray[i].localName === localName) {
                return i;
            }
        }
        return -1;
    }
    function _getValueByIndex(index) {
        return this.attsArray[index] ? this.attsArray[index].value : null;
    }
    function _getValueByQName(qName) {
        let i = this.attsArray.length;
        while (i--) {
            if (this.attsArray[i].qName === qName) {
                return this.attsArray[i].value;
            }
        }
        return null;
    }
    function _getValueByURI(uri, localName) {
        let i = this.attsArray.length;
        while (i--) {
            if (this.attsArray[i].namespaceURI === uri && this.attsArray[i].localName === localName) {
                return this.attsArray[i].value;
            }
        }
        return null;
    }

    function _getPrefix(localName, qName) {
        let prefix = null;
        if (localName.length !== qName.length) {
            prefix = qName.split(":")[0];
        }
        return prefix;
    }

    class Sax_Attribute {
        constructor(namespaceURI, prefix, localName, qName, type, value) {
            this.namespaceURI = namespaceURI;
            //avoiding error, the empty prefix of attribute must be null
            if (prefix === undefined || prefix === "") {
                this.prefix = null;
            } else {
                this.prefix = prefix;
            }
            this.localName = localName;
            this.qName = qName;
            this.type = type;
            this.value = value;
        }
    }

    // INCOMPLETE
    // http://www.saxproject.org/apidoc/org/xml/sax/helpers/AttributesImpl.html
    class AttributesImpl {
        constructor(atts) {
            this.attsArray = [];
            if (atts) {
                this.setAttributes(atts);
            }
        }

        toString() {
            return "AttributesImpl";
        }

        // INTERFACE: Attributes: http://www.saxproject.org/apidoc/org/xml/sax/Attributes.html
        getIndex(arg1, arg2) {
            if (arg2 === undefined) {
                return _getIndexByQName.call(this, arg1);
            } else {
                return _getIndexByURI.call(this, arg1, arg2);
            }
        }

        getLength() {
            return this.attsArray.length;
        }

        //in order not to parse qname several times, add that convenience method
        getPrefix(index) {
            return this.attsArray[index].prefix;
        }

        getLocalName(index) {
            return this.attsArray[index].localName;
        }

        getQName(index) {
            return this.attsArray[index].qName;
        }

        //not supported
        getType(arg1, arg2) { // Should allow 1-2 arguments of different types: idnex or qName or uri+localName
            // Besides CDATA (default when not supported), could return "ID", "IDREF", "IDREFS", "NMTOKEN", "NMTOKENS", "ENTITY", "ENTITIES", or "NOTATION" (always in upper case).
            // "For an enumerated attribute that is not a notation, the parser will report the type as 'NMTOKEN'."
            // If uri and localName passed, should return the "attribute type as a string, or null if the attribute is not in the list or if Namespace processing is not being performed."
            // If qName passed, should return the "attribute type as a string, or null if the attribute is not in the list or if qualified names are not available."
            let index;
            if (!arg2) {
                if (arg1) {
                    //if it is an index, otherwise should return NaN
                    index = parseInt(arg1, 10);
                    //index may be 0
                    if (!index && index !== 0) {
                        //then it is qName
                        index = _getIndexByQName.call(this, arg1);
                    }
                }
            } else {
                index = _getIndexByURI.call(this, arg1, arg2);
            }
            if (index || index === 0) {
                let type = this.attsArray[index].type;
                if (type) {
                    return type;
                }
            }
            return "CDATA";
        }

        getURI(index) {
            return this.attsArray[index].namespaceURI;
        }

        getValue(arg1, arg2) {
            if (arg2 === undefined) {
                if (typeof arg1 === "string") {
                    return _getValueByQName.call(this, arg1);
                } else {
                    return _getValueByIndex.call(this, arg1);
                }
            } else {
                return _getValueByURI.call(this, arg1, arg2);
            }
        }

        // Other AttributesImpl methods
        addAttribute(uri, localName, qName, type, value) {
            let prefix = _getPrefix.call(this, localName, qName);
            this.addPrefixedAttribute(uri, prefix, localName, qName, type, value);
        }

        clear() {
            this.attsArray = [];
        }

        removeAttribute(index) {
            this.attsArray.splice(index, 1);
        }

        addAttributeAtIndex(index, uri, localName, qName, type, value) {
            let prefix = _getPrefix.call(this, localName, qName);
            if (index > this.attsArray.length) {
                this.attsArray[index] = new Sax_Attribute(uri, prefix, localName, qName, type, value);
            } else {        
                this.attsArray.splice(index, 0, new Sax_Attribute(uri, prefix, localName, qName, type, value));
            }
        }

        setAttribute(index, uri, localName, qName, type, value) {
            this.setURI(index, uri);
            this.setLocalName(index, localName);
            this.setQName(index, qName);
            this.setType(index, type);
            this.setValue(index, value);
        }

        setAttributes(atts) {
            for (let i = 0 ; i < atts.getLength() ; i ++) {
                this.addPrefixedAttribute(atts.getURI(i), atts.getPrefix(i), atts.getLocalName(i), atts.getType(i), atts.getValue(i));
            }
        }

        setLocalName(index, localName) {
            this.attsArray[index].localName = localName;
        }

        setQName(index, qName) {
            let att = this.attsArray[index];
            att.qName = qName;
            if (qName.indexOf(":") !== -1) {
                let splitResult = qName.split(":");
                att.prefix = splitResult[0];
                att.localName = splitResult[1];
            } else {
                att.prefix = null;
                att.localName = qName;
            }
        }

        setType(index, type) {
            this.attsArray[index].type = type;
        }

        setURI(index, uri) {
            this.attsArray[index].namespaceURI = uri;
        }

        setValue(index, value) {
            this.attsArray[index].value = value;
        }

        // CUSTOM CONVENIENCE METHODS
        //in order not to parse qname several times
        addPrefixedAttribute(uri, prefix, localName, qName, type, value) {
            this.attsArray.push(new Sax_Attribute(uri, prefix, localName, qName, type, value));
        }
    }

    /*
    Attributes2Impl()
              Construct a new, empty Attributes2Impl object.
    Attributes2Impl(Attributes atts)
              Copy an existing Attributes or Attributes2 object.
    */
    // http://www.saxproject.org/apidoc/org/xml/sax/ext/Attributes2Impl.html
    // When implemented, use this attribute class if this.features['http://xml.org/sax/features/use-attributes2'] is true
    class Attributes2Impl extends AttributesImpl {
        constructor(atts) {
            super(atts);
            if (atts) {
                //by default, isDeclared is false and isSpecified is false
                for (let i = 0 ; i < atts.getLength() ; i ++) {
                    this.setDeclared(atts.isDeclared(i));
                    this.setSpecified(atts.isSpecified(i));
                }
            }
        }

        toString() {
            return "Attributes2Impl";
        }

        isDeclared(indexOrQNameOrURI, localName) {
            let index = _getIndex(indexOrQNameOrURI, localName);
            return this.attsArray[index].declared;
        }

        isSpecified(indexOrQNameOrURI, localName) {
            let index = _getIndex(indexOrQNameOrURI, localName);
            return this.attsArray[index].specified;
        }

        // Other Attributes2Impl methods
        /*
         void 	addAttribute(java.lang.String uri, java.lang.String localName, java.lang.String qName, java.lang.String type, java.lang.String value)
                  Add an attribute to the end of the list, setting its "specified" flag to true.
        void 	removeAttribute(int index)
                  Remove an attribute from the list.
         void 	setAttributes(Attributes atts)
                  Copy an entire Attributes object.
         void 	setDeclared(int index, boolean value)
                  Assign a value to the "declared" flag of a specific attribute.
         void 	setSpecified(int index, boolean value)
                  Assign a value to the "specified" flag of a specific attribute.
         **/
        addAttribute(uri, localName, qName, type, value) {
            let prefix = _getPrefix.call(this, localName, qName);
            this.addPrefixedAttribute(uri, prefix, localName, qName, type, value);
            //index of just added attribute is atts.getLength - 1
            let index = this.getLength() - 1;
            //by default declared is false, and specified is true
            this.setDeclared(index, false);
            this.setSpecified(index, true);
        }

        setAttributes(atts) {
            
        }

        setDeclared(index, value) {
            this.attsArray[index].declared = value;
        }

        setSpecified(index, value) {
            this.attsArray[index].specified = value;
        }
    }

    // INTERFACE: Attributes2: http://www.saxproject.org/apidoc/org/xml/sax/ext/Attributes2.html
    /*
     boolean 	isDeclared(int index)
              Returns false unless the attribute was declared in the DTD.
     boolean 	isDeclared(java.lang.String qName)
              Returns false unless the attribute was declared in the DTD.
     boolean 	isDeclared(java.lang.String uri, java.lang.String localName)
              Returns false unless the attribute was declared in the DTD.
     boolean 	isSpecified(int index)
              Returns true unless the attribute value was provided by DTD defaulting.
     boolean 	isSpecified(java.lang.String qName)
              Returns true unless the attribute value was provided by DTD defaulting.
     boolean 	isSpecified(java.lang.String uri, java.lang.String localName)
              Returns true unless the attribute value was provided by DTD defaulting.
    */
    // Private helpers for Attributes2Impl (private static treated as private instance below)
    function _getIndex(arg1, arg2) {
        let index;
        if (arg2 === undefined) {
            if (typeof arg1 === "string") {
                index = _getIndexByQName.call(this, arg1);
            } else {
                index = arg1;
            }
        } else {
            index = _getIndexByURI.call(this, arg1, arg2);
        }
        return index;
    }

    this.AttributesImpl = AttributesImpl;
    this.Attributes2Impl = Attributes2Impl;
}()); // end namespace
