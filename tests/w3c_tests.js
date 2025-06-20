/*global document, alert, assertTrue, DomContentHandler, JsUnitException , DefaultHandler2, SAXException, textContent, InputSource, Serializer, XMLReaderFactory, diffString, loadFile */

function throwNotFatalException(errorHandler) {
    if (errorHandler.saxParseExceptions.length > 0) {
        throw errorHandler.saxParseExceptions[0];
    }
}

function testParse_xmlconf() {
    let contentHandler = new DomContentHandler();
    contentHandler.setDocumentLocator(new Locator2Impl());
    let saxParser = XMLReaderFactory.createXMLReader();
    saxParser.setFeature('http://apache.org/xml/features/nonvalidating/load-external-dtd', true);
    saxParser.setHandler(contentHandler);
    testCt++;
    try {
        saxParser.parse(new InputSource("xmlconf/xmlconf.xml"));
        throwNotFatalException(saxParser.errorHandler);
    } catch(e) {
        assertTrue(e.message, false);
    }
    xmlConf = contentHandler.document;
}

function parseTestCase(uri, strictChars) {
    let contentHandler2 = new DefaultHandler2();
    contentHandler2.setDocumentLocator(new Locator2Impl());
    let saxParser2 = XMLReaderFactory.createXMLReader();
    saxParser2.setFeature('http://apache.org/xml/features/nonvalidating/load-external-dtd', true);
    saxParser2.setHandler(contentHandler2);
    if (strictChars) {
        saxParser2.setFeature('http://debeissat.nicolas.free.fr/ns/character-data-strict', true);
    }
    try {
        saxParser2.parse(new InputSource(uri));
    } finally {}
    throwNotFatalException(saxParser2.errorHandler);
}


function parseTestCaseError(uri, strictChars) {
    let contentHandler2 = new DefaultHandler2();
    contentHandler2.setDocumentLocator(new Locator2Impl());
    let saxParser2 = XMLReaderFactory.createXMLReader();
    saxParser2.setFeature('http://apache.org/xml/features/nonvalidating/load-external-dtd', true);
    saxParser2.setHandler(contentHandler2);
    if (strictChars) {
        saxParser2.setFeature('http://debeissat.nicolas.free.fr/ns/character-data-strict', true);
    }
    try {
        saxParser2.parse(new InputSource(uri));
    } finally {}
}

function parseTestCase_invalid(uri, strictChars) {
    let contentHandler2 = new DefaultHandler2();
    contentHandler2.setDocumentLocator(new Locator2Impl());
    let saxParser2 = XMLReaderFactory.createXMLReader();
    saxParser2.setHandler(contentHandler2);
    saxParser2.setFeature('http://xml.org/sax/features/validation', true);
    saxParser2.setFeature('http://apache.org/xml/features/nonvalidating/load-external-dtd', true);
    if (strictChars) {
        saxParser2.setFeature('http://debeissat.nicolas.free.fr/ns/character-data-strict', true);
    }
    try {
        saxParser2.parse(new InputSource(uri));
    } finally {}
    throwNotFatalException(saxParser2.errorHandler);
}


function parseTestCase_valid(uri, validOutput, strictChars) {
    let serializer = new Serializer();
    serializer.setDocumentLocator(new Locator2Impl());
    let saxParser2 = XMLReaderFactory.createXMLReader();
    saxParser2.setHandler(serializer);
    saxParser2.setFeature('http://xml.org/sax/features/validation', true);
    saxParser2.setFeature('http://apache.org/xml/features/nonvalidating/load-external-dtd', true);
    saxParser2.setFeature('http://debeissat.nicolas.free.fr/ns/attribute-whitespace-normalization', true);
    if (strictChars) {
        saxParser2.setFeature('http://debeissat.nicolas.free.fr/ns/character-data-strict', true);
    }
    try {
        saxParser2.parse(new InputSource(uri));
    } finally {}
    if (validOutput) {
        let expected = loadFile(validOutput);
        if (expected !== serializer.string) {
            throw new SAXException("serialization output not correct : " + diffString(expected, serializer.string));
        }
    }
    throwNotFatalException(saxParser2.errorHandler);
}

    
function print_total_errs () {  
    let hr = document.createElementNS('http://www.w3.org/1999/xhtml', 'hr');
    let p = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
    testResultSummary = p.innerHTML = 'Total test failures: '+failedCt+'; Total not supported notices: '+notSupportedCt+'; Total tests: '+testCt;
    p.style.border = 'solid black 2px';
    p.style.fontSize = '20px';
    document.getElementById('outputDiv').appendChild(hr);
    document.getElementById('outputDiv').appendChild(p);
}

function prepareTestParse(testCaseId) {
    if (!xmlConf) {
        testParse_xmlconf();
    }
    let testSuite = getFirstChildElement(xmlConf, "TESTSUITE");
    let i = 0;
    let testcase;
    for (testcase = getFirstChildElement(testSuite, "TESTCASES"); testcase && i < testCaseId ; testcase = getNextSiblingElement(testcase, "TESTCASES")) {
        i++;
    }
    //there must be content of xmlconf\xmltest\xmltest.xml inside
    return testcase.getElementsByTagName("TEST");
}

function removeFileName(path) {
    let idx = path.lastIndexOf('/');
    return path.substring(0, idx + 1);
}

function getBaseUri(node, uri) {
    //remove eventual file name at the end of the path
    let baseUri = removeFileName(node.custBaseURI);
    return baseUri + uri;
}

function testParse_valid(testCaseId) {
    let tests = prepareTestParse(testCaseId);
    for (let i = 0 ; i < tests.length ; i++) {
        let test = tests.item(i);
        let type = test.getAttribute("TYPE");
        if (type === "valid") {
            testCt++;
            let uri = test.getAttribute("URI");
            let parentUri = removeFileName(test.custBaseURI);
            let uriBased = parentUri + uri;
            let outputAttr = test.getAttribute("OUTPUT");
            var validOutput;
            if (outputAttr) {
                validOutput = parentUri + outputAttr;
            }
            let testLabel = textContent(test);
            try {
                parseTestCase_valid(uriBased, validOutput);
                output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>valid<\/td><\/tr>";
            } catch(e) {
                let conformance = isAssumedNotConformant(uri);
                if (conformance) {
                    notSupportedCt++;
                    output.innerHTML += "<tr style=\"background-color: orange\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + conformance + "<\/td><\/tr>";
                } else {
                    failedCt++;
                    output.innerHTML += "<tr style=\"background-color: red\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>FAILED, exception found :" + e.message + "<\/td><\/tr>";
                }
            }
        }
    }
}
    
function testParse_invalid(testCaseId) {
    let tests = prepareTestParse(testCaseId);    
    for (let i = 0 ; i < tests.length ; i++) {
        let test = tests.item(i);
        let type = test.getAttribute("TYPE");
        if (type === "invalid") {
            testCt++;
            let uri = test.getAttribute("URI");
            let uriBased = getBaseUri(test, uri);
            let testLabel = textContent(test);
            try {
                parseTestCase_invalid(uriBased);
                //should have been exceptions
                assertTrue("invalid XML not detected in uri : " + uri + ", expected message was : " + testLabel, false);
            } catch(e) {
                //e may be the jsunit exception, in that case test is failed
                if (e instanceof SAXParseException) {
                    output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + e.message + " at line " + e.getLineNumber() + " at column " + e.getColumnNumber() + "<\/td><\/tr>";
                } else if (e instanceof SAXException) {
                    output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + e.message + "<\/td><\/tr>";
                } else {
                    let conformance = isAssumedNotConformant(uri);
                    if (conformance) {
                        notSupportedCt++;
                        output.innerHTML += "<tr style=\"background-color: orange\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + conformance + "<\/td><\/tr>";
                    } else {
                        failedCt++;
                        output.innerHTML += "<tr style=\"background-color: red\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>FAILED<\/td><\/tr>";
                    }
                }
            }
        }
    }
}



function testParse_not_wf(testCaseId) {
    let tests = prepareTestParse(testCaseId);
    for (let i = 0 ; i < tests.length ; i++) {
        let test = tests.item(i);
        let type = test.getAttribute("TYPE");
        if (type === "not-wf") {
            testCt++;
            let uri = test.getAttribute("URI");
            let uriBased = getBaseUri(test, uri);
            let testLabel = textContent(test);
            try {
                parseTestCase(uriBased, testForStrictCharacterData(uri));
                //should have been exceptions
                assertTrue("not-wf XML not detected in uri : " + uri + ", test label was : " + testLabel, false);
            } catch(e) {
                //e may be the jsunit exception, in that case test is failed
                if (e instanceof SAXParseException) {
                    output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + e.message + " at line " + e.getLineNumber() + " at column " + e.getColumnNumber() + "<\/td><\/tr>";
                } else if (e instanceof SAXException) {
                    output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + e.message + "<\/td><\/tr>";
                } else {
                    let conformance = isAssumedNotConformant(uri);
                    if (conformance) {
                        notSupportedCt++;
                        output.innerHTML += "<tr style=\"background-color: orange\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + conformance + "<\/td><\/tr>";
                    } else {
                        failedCt++;
                        output.innerHTML += "<tr style=\"background-color: red\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>FAILED<\/td><\/tr>";
                    }
                }
            }
        }
    }
}

function testParse_error(testCaseId) {
    let tests = prepareTestParse(testCaseId);
    for (let i = 0 ; i < tests.length ; i++) {
        let test = tests.item(i);
        let type = test.getAttribute("TYPE");
        if (type === "error") {
            testCt++;
            let uri = test.getAttribute("URI");
            let uriBased = getBaseUri(test, uri);
            let testLabel = textContent(test);
            try {
                parseTestCaseError(uriBased, testForStrictCharacterData(uri));
                //should have been exceptions
                assertTrue("error in XML not detected in uri : " + uri + ", test label was : " + testLabel, false);
            } catch(e) {
                //e may be the jsunit exception, in that case test is failed
                if (e instanceof SAXParseException) {
                    output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + e.message + " at line " + e.getLineNumber() + " at column " + e.getColumnNumber() + "<\/td><\/tr>";
                } else if (e instanceof SAXException) {
                    output.innerHTML += "<tr><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + e.message + "<\/td><\/tr>";
                } else {
                    let conformance = isAssumedNotConformant(uri);
                    if (conformance) {
                        notSupportedCt++;
                        output.innerHTML += "<tr style=\"background-color: orange\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>" + conformance + "<\/td><\/tr>";
                    } else {
                        failedCt++;
                        output.innerHTML += "<tr style=\"background-color: red\"><td>" + uri + "<\/td><td>" + testLabel + "<\/td><td>FAILED<\/td><\/tr>";
                    }
                }
            }
        }
    }
}

function testParse(testCaseId) {
    testParse_xmlconf();
    testParse_valid(testCaseId);
    testParse_invalid(testCaseId);
    testParse_not_wf(testCaseId);
    testParse_error(testCaseId);
}

