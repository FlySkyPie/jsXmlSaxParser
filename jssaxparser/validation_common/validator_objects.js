/*
that is the implementation of the following algorithm : http://www.thaiopensource.com/relaxng/derivative.html
*/

/*
First, we define the datatypes we will be using. URIs and local names are just strings.

type Uri = String

type LocalName = String

A ParamList represents a list of parameters; each parameter is a pair consisting of a local name and a value.

type ParamList = [(LocalName, String)]

A Context represents the context of an XML element. It consists of a base URI and a mapping from prefixes to namespace URIs.

type Prefix = String

type Context = (Uri, [(Prefix, Uri)])

A Datatype identifies a datatype by a datatype library name and a local name.

type Datatype = (Uri, LocalName)

A NameClass represents a name class.

data NameClass = AnyName
                 | AnyNameExcept NameClass
                 | Name Uri LocalName
                 | NsName Uri
                 | NsNameExcept Uri NameClass
                 | NameClassChoice NameClass NameClass

A Pattern represents a pattern after simplification.

data Pattern = Empty
               | NotAllowed
               | Text
               | Choice Pattern Pattern
               | Interleave Pattern Pattern
               | Group Pattern Pattern
               | OneOrMore Pattern
               | List Pattern
               | Data Datatype ParamList
               | DataExcept Datatype ParamList Pattern
               | Value Datatype String Context
               | Attribute NameClass Pattern
               | Element NameClass Pattern
               | After Pattern Pattern
    	
The After pattern is used internally and will be explained later.

Note that there is an Element pattern rather than a Ref pattern. In the simplified XML representation of patterns, every ref element refers to an element pattern. In the internal representation of patterns, we can replace each reference to a ref pattern by a reference to the element pattern that the ref pattern references, resulting in a cyclic data structure. (Note that even though Haskell is purely functional it can handle cyclic data structures because of its laziness.)

In the instance, elements and attributes are labelled with QNames; a QName is a URI/local name pair.

data QName = QName Uri LocalName

An XML document is represented as a ChildNode. There are two kinds of child node:

    * a TextNode containing a string;
    * an ElementNode containing a name (of type QName), a Context, a set of attributes (represented as a list of AttributeNodes, each of which will be an AttributeNode), and a list of children (represented as a list of ChildNodes).

data ChildNode = ElementNode QName Context [AttributeNode] [ChildNode]
                 | TextNode String

An AttributeNode consists of a QName and a String.

data AttributeNode = AttributeNode QName String
*/

export class Param {
    constructor(localName, string) {
        this.localName = localName;
        this.string = string;
    }

    toHTML() {
        return "<table><tr><th>Param</th></tr><tr><td>localName</td><td>" + this.localName + "</td></tr><tr><td>string</td><td>" + this.string + "</td></tr></table>";
    }

    toString() {
        return "Param";
    }
}

/*
map is an array of [(Prefix, Uri)] mappings
*/
export class Context {
    constructor(uri, map) {
        this.uri = uri;
        this.map = map;
    }

    toHTML() {
        let string = "<table><tr><th>Context</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td><table><tr><th>map</th></tr>";
        for (let i in this.map) {
            string += "<tr><td>" + i + "</td><td>" + this.map[i] + "</td></tr>";
        }
        return string + "</table></td></tr></table>";
    }

    toString() {
        return "Context";
    }
}

export class Datatype {
    constructor(uri, localName) {
        this.uri = uri;
        this.localName = localName;
    }

    toHTML() {
        return "<table><tr><th>Datatype</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>localName</td><td>" + this.localName + "</td></tr></table>";
    }

    toString() {
        return "Datatype";
    }
}

/*
data NameClass = AnyName
                 | AnyNameExcept NameClass
                 | Name Uri LocalName
                 | NsName Uri
                 | NsNameExcept Uri NameClass
                 | NameClassChoice NameClass NameClass
*/
export class AnyName {
    toHTML() {
        return "<table><tr><th>AnyName</th></tr></table>";
    }

    toString() {
        return "AnyName";
    }
}

export class AnyNameExcept {
    constructor(nameClass) {
        this.nameClass = nameClass;
    }

    toHTML() {
        return "AnyNameExcept";
    }

    toString() {
        return "AnyNameExcept";
    }
}

export class Name {
    constructor(uri, localName) {
        this.uri = uri;
        this.localName = localName;
    }

    toHTML() {
        return "<table><tr><th>Name</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>localName</td><td>" + this.localName + "</td></tr></table>";
    }

    toString() {
        return "Name";
    }
}

export class NsName {
    constructor(uri) {
        this.uri = uri;
    }

    toHTML() {
        return "<table><tr><th>NsName</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr></table>";
    }

    toString() {
        return "NsName";
    }
}

export class NsNameExcept {
    constructor(uri, nameClass) {
        this.uri = uri;
        this.nameClass = nameClass;
    }

    toHTML() {
        return "<table><tr><th>NsNameExcept</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>nameClass</td><td>" + this.nameClass.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "NsNameExcept";
    }
}

export class NameClassChoice {
    constructor(nameClass1, nameClass2) {
        this.nameClass1 = nameClass1;
        this.nameClass2 = nameClass2;
    }

    toHTML() {
        return "<table><tr><th>NameClassChoice</th></tr><tr><td>nameClass1</td><td>" + this.nameClass1.toHTML() + "</td></tr><tr><td>nameClass2</td><td>" + this.nameClass2.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "NameClassChoice";
    }
}

/*
data Pattern = Empty
               | NotAllowed
               | Text
               | Choice Pattern Pattern
               | Interleave Pattern Pattern
               | Group Pattern Pattern
               | OneOrMore Pattern
               | List Pattern
               | Data Datatype ParamList
               | DataExcept Datatype ParamList Pattern
               | Value Datatype String Context
               | Attribute NameClass Pattern
               | Element NameClass Pattern
               | After Pattern Pattern
*/
export class Empty {
    toHTML() {
        return "<table><tr><th>Empty</th></tr></table>";
    }

    toString() {
        return "Empty";
    }
}

/*
priority gives a rank of pertinence between NotAllowed message
*/
export class NotAllowed {
    constructor(message, pattern, childNode, priority) {
        this.message = message;
        this.pattern = pattern;
        this.childNode = childNode;
        this.priority = priority;
    }

    toHTML() {
        let string = "<table><tr><th>NotAllowed</th></tr><tr><td>message</td><td>" + this.message + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr><tr><td>childNode</td><td>";
        //childNode may be a string directly
        if (this.childNode.toHTML) {
            string += this.childNode.toHTML();
        } else {
            string += this.childNode;
        }
        return string + "</td></tr></table>";
    }

    toString() {
        return "NotAllowed";
    }
}

export class MissingContent extends NotAllowed {
    constructor(message, pattern, childNode, priority) {
        this.message = message;
        this.pattern = pattern;
        this.childNode = childNode;
        this.priority = priority;
    }

    toHTML() {
        let string = "<table><tr><th>MissingContent</th></tr><tr><td>message</td><td>" + this.message + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr><tr><td>childNode</td><td>";
        //childNode may be a string directly
        if (this.childNode.toHTML) {
            string += this.childNode.toHTML();
        } else {
            string += this.childNode;
        }
        return string + "</td></tr></table>";
    }

    toString() {
        return "MissingContent";
    }
}

MissingContent.constructor = NotAllowed;

export class Text {
    toHTML() {
        return "<table><tr><th>Text</th></tr></table>";
    }

    toString() {
        return "Text";
    }
}

export class Choice {
    constructor(pattern1, pattern2) {
        this.pattern1 = pattern1;
        this.pattern2 = pattern2;
    }

    toHTML() {
        return "<table><tr><th>Choice</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "Choice";
    }
}

export class Interleave {
    constructor(pattern1, pattern2) {
        this.pattern1 = pattern1;
        this.pattern2 = pattern2;
    }

    toHTML() {
        return "<table><tr><th>Interleave</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "Interleave";
    }
}

export class Group {
    constructor(pattern1, pattern2) {
        this.pattern1 = pattern1;
        this.pattern2 = pattern2;
    }

    toHTML() {
        return "<table><tr><th>Group</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "Group";
    }
}

export class OneOrMore {
    constructor(pattern) {
        this.pattern = pattern;
    }

    toHTML() {
        return "<table><tr><th>OneOrMore</th></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "OneOrMore";
    }
}

export class List {
    constructor(pattern) {
        this.pattern = pattern;
    }

    toHTML() {
        return "<table><tr><th>List</th></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "List";
    }
}

export class Data {
    constructor(datatype, paramList) {
        this.datatype = datatype;
        this.paramList = paramList;
    }

    toHTML() {
        let string = "<table><tr><th>Data</th></tr><tr><td>datatype</td><td>" + this.datatype.toHTML() + "</td></tr><tr><td><table><tr><th>paramList</th></tr>"
        let i = this.paramList.length;
        while (i--) {
            string += "<tr><td>" + this.paramList[i].toHTML() + "</td></tr>";
        }
        return string + "</table></td></tr></table>";
    }

    toString() {
        return "Data";
    }
}

export class DataExcept {
    constructor(datatype, paramList, pattern) {
        this.datatype = datatype;
        this.paramList = paramList;
        this.pattern = pattern;
    }

    toHTML() {
        let string = "<table><tr><th>DataExcept</th></tr><tr><td>datatype</td><td>" + this.datatype.toHTML() + "</td></tr><tr><td><table><tr><th>paramList</th></tr>"
        let i = this.paramList.length;
        while (i--) {
            string += "<tr><td>" + this.paramList[i].toHTML() + "</td></tr>";
        }
        return string + "</table></td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "DataExcept";
    }
}

export class Value {
    constructor(datatype, string, context) {
        this.datatype = datatype;
        this.string = string;
        this.context = context;
    }

    toHTML() {
        return "<table><tr><th>Data</th></tr><tr><td>datatype</td><td>" + this.datatype.toHTML() + "</td></tr><tr><td>string</td><td>" + this.string + "</td></tr><tr><td>context</td><td>" + this.context.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "Value";
    }
}

/*
defaultValue must be an instance of Value
*/
export class Attribute {
    constructor(nameClass, pattern, defaultValue) {
        this.nameClass = nameClass;
        this.pattern = pattern;
        this.defaultValue = defaultValue;
    }

    toHTML() {
        let string = "<table><tr><th>Attribute</th></tr><tr><td>nameClass</td><td>" + this.nameClass.toHTML() + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
        if (this.defaultValue) {
            string += "</td></tr><tr><td>defaultValue</td><td>" + this.defaultValue.toHTML();
        }
        return string + "</td></tr></table>";
    }

    toString() {
        return "Attribute";
    }
}

export class Element {
    constructor(nameClass, pattern) {
        this.nameClass = nameClass;
        this.pattern = pattern;
    }

    toHTML() {
        return "<table><tr><th>Element</th></tr><tr><td>nameClass</td><td>" + this.nameClass.toHTML() + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "Element";
    }
}

export class After {
    constructor(pattern1, pattern2) {
        this.pattern1 = pattern1;
        this.pattern2 = pattern2;
    }

    toHTML() {
        return "<table><tr><th>After</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
    }

    toString() {
        return "After";
    }
}

export class QName {
    constructor(uri, localName) {
        this.uri = uri;
        this.localName = localName;
    }

    toHTML() {
        return "<table><tr><th>QName</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>localName</td><td>" + this.localName + "</td></tr></table>";
    }

    toString() {
        return "QName";
    }
}

/*
data ChildNode = ElementNode QName Context [AttributeNode] [ChildNode]
                 | TextNode String
*/
export class ElementNode {
    constructor(qName, context, attributeNodes, childNodes) {
        this.qName = qName;
        this.context = context;
        this.attributeNodes = attributeNodes;
        this.childNodes = childNodes;
    }

    setParentNode(parentNode) {
        this.parentNode = parentNode;
    }

    /*
    used for augmenting the XML instance, by default does not do anything
    */
    addAttribute(pattern) { }

    toHTML() {
        let string = "<table><tr><th>ElementNode</th></tr><tr><td>qName</td><td>" + this.qName.toHTML() + "</td></tr><tr><td>context</td><td>" + this.context.toHTML() + "</td></tr><tr><td>attributeNodes</td><td><table>";
        for (var i in this.attributeNodes) {
            string += "<tr><td>" + this.attributeNodes[i].toHTML() + "</td></tr>";
        }
        string += "</table></td></tr><tr><td>childNodes</td><td><table>";
        for (var i = 0; i < this.childNodes.length; i++) {
            string += "<tr><td>" + this.childNodes[i].toHTML() + "</td></tr>";
        }
        string += "</table>";
        if (this.parentNode) {
            string += "</td></tr><tr><td>parentNode</td><td>" + this.parentNode.qName.localName;
        }
        return string + "</td></tr></table>";
    }

    toString() {
        return "ElementNode";
    }
}

export class TextNode {
    constructor(string) {
        this.string = string;
    }

    toHTML() {
        return "<table><tr><th>TextNode</th></tr><tr><td>string</td><td>[" + this.string + "]</td></tr></table>";
    }

    toString() {
        return "TextNode";
    }
}

export class AttributeNode {
    constructor(qName, string) {
        this.qName = qName;
        this.string = string;
    }

    /*
    used for augmenting the XML instance, by default does not do anything
    */
    setType(type) { }

    toHTML() {
        return "<table><tr><th>AttributeNode</th></tr><tr><td>qName</td><td>" + this.qName.toHTML() + "</td></tr><tr><td>string</td><td>" + this.string + "</td></tr></table>";
    }

    toString() {
        return "AttributeNode";
    }
}
