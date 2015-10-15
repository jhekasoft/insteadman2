"use strict";

var fs = require('fs');
var childProcess = require('child_process');

class InsteadInterpreterFinder {

    constructor() {
        this.downloadLink = 'http://instead.syscall.ru/ru/download/';
        this.exactFilePaths = [];
    }

    getDownloadLink() {
        return this.downloadLink;
    }

    findInterpreter() {
        var foundPath = false;
        var here = this;
        this.exactFilePaths.forEach(function(path) {
            if (here.checkInterpreterPath(path)) {
                foundPath = path;
            }
        });

        return foundPath;
    }

    checkInterpreterPath(path) {
        try {
            return fs.statSync(path).isFile();
        } catch (err) {
            return false;
        }
    }

    checkInterpreter(interpreterCommand) {
        childProcess.exec(interpreterCommand + " -version", function(error, stdout, stderr) {
            console.log([error, stdout, stderr]);
        });
    }
}

class InsteadInterpreterFinderMac extends InsteadInterpreterFinder {
    constructor() {
        super();
        this.exactFilePaths = [
            '/Applications/Instead.app/Contents/MacOS/sdl-instead'
        ];
    }

}

class InsteadInterpreterFinderFreeUnix extends InsteadInterpreterFinder {


}

module.exports.InsteadInterpreterFinderMac = InsteadInterpreterFinderMac;
module.exports.InsteadInterpreterFinderFreeUnix = InsteadInterpreterFinderFreeUnix;
