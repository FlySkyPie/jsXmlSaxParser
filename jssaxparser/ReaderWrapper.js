export class ReaderWrapper {
    constructor(reader) {
        this.reader = reader;
        this.peeked = [];
    }

    peekLen(len) {
        let peekedLen = this.peeked.length;
        if (len <= peekedLen) {
            return this.peeked.slice(-len).reverse().join("");
        }
        let returned = this.peeked.slice(0).reverse().join("");
        let lenToRead = len - peekedLen;
        //completes with read characters from reader
        let newRead = this.reader.read(returned, 0, lenToRead);
        returned += newRead;
        for (let i = 0; i < lenToRead; i++) {
            this.peeked.unshift(newRead.charAt(i));
        }
        return returned;
    }

    skip(n) {
        let i;
        for (i = 0; this.peeked.length !== 0 && i < n; i++) {
            this.peeked.pop();
        }
        n -= i;
        if (n) {
            this.reader.skip(n);
        }
    }

    /************ USED BY SCANNER ********************/

    /*
    consumes first char of peeked array, or consumes next char of Reader
    */
    next() {
        if (this.peeked.length !== 0) {
            return this.peeked.pop();
        }
        return this.reader.read();
    }

    /*
    read next char without consuming it
    if peeked buffer is not empty take the first one
    else take next char of Reader and keep it in peeked
    */
    peek() {
        let peekedLen = this.peeked.length;
        if (peekedLen !== 0) {
            return this.peeked[peekedLen - 1];
        }
        let returned = this.reader.read();
        this.peeked[0] = returned;
        return returned;
    }

    /*
    if dontSkipWhiteSpace is not passed, then it is false so skipWhiteSpaces is default
    if end of document, char is ''
    */
    nextChar(dontSkipWhiteSpace) {
        this.next();
        if (!dontSkipWhiteSpace) {
            this.skipWhiteSpaces();
        }
    }

    skipWhiteSpaces() {
        while (this.peek().search(ReaderWrapper.WS) !== -1) {
            this.next();
        }
    }

    /*
    ending char is the last matching the regexp
    return consumed chars
    */
    nextCharRegExp(regExp, continuation) {
        let returned = "", currChar = this.peek();
        while (true) {
            if (currChar.search(regExp) !== -1) {
                if (continuation && currChar.search(continuation.pattern) !== -1) {
                    let cb = continuation.cb.call(this);
                    if (cb !== true) {
                        return cb;
                    }
                    returned += currChar;
                    currChar = this.peek();
                    continue;
                }
                return returned;
            } else {
                returned += currChar;
                //consumes actual char
                this.next();
                currChar = this.peek();
            }
        }
    }

    /*
    same as above but with a char not a regexp and no continuation
    best for performance
    */
    nextCharWhileNot(ch) {
        let returned = "", currChar = this.peek();
        while (currChar !== ch) {
            returned += currChar;
            this.next();
            currChar = this.peek();
        }
        return returned;
    }

    /*

    */
    matchRegExp(len, regExp, dontConsume) {
        let follow = this.peekLen(len);
        if (follow.search(regExp) === 0) {
            if (!dontConsume) {
                this.skip(len);
            }
            return true;
        }
        return false;
    }

    /*
    */
    matchStr(str) {
        let len = str.length;
        let follow = this.peekLen(len);
        if (follow === str) {
            this.skip(len);
            return true;
        }
        return false;
    }

    /*
    if next char is ch
    */
    matchChar(ch) {
        if (this.equals(ch)) {
            this.next();
            return true;
        }
        return false;
    }

    /*
    beginnnig before quote
    ending after quote
    */
    quoteContent() {
        let quote = this.next();
        let content = this.nextCharWhileNot(quote);
        this.next();
        return content;
    }

    equals(ch) {
        return ch === this.peek();
    }

    unequals(ch) {
        return ch !== this.peek();
    }

    unread(str) {
        let i = str.length;
        //http://www.scottlogic.co.uk/2010/10/javascript-array-performance/
        while (i--) {
            this.peeked[this.peeked.length] = str.charAt(i);
        }
    }
}

/************ NOT USED BY SCANNER ********************/

ReaderWrapper.WS = new RegExp('[\\t\\n\\r ]');

