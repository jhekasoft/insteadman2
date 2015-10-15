"use strict";

class InsteadInterpreterFinder {

    constructor() {
        this.downloadLink = 'http://instead.syscall.ru/ru/download/';
    }

}

class InsteadInterpreterFinderFreeUnix extends InsteadInterpreterFinder {

    findInterpreter() {
        return 'Unix';
    }
}

module.exports.InsteadInterpreterFinderFreeUnix = InsteadInterpreterFinderFreeUnix;
