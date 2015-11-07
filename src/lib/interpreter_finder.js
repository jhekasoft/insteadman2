"use strict";

var fs = require('fs');
var childProcess = require('child_process');

// TODO: can find several interpreters
class InsteadInterpreterFinder {

    constructor() {
        this.downloadLink = 'http://instead.syscall.ru/ru/download/';
        this.exactFilePaths = [];
    }

    getDownloadLink() {
        return this.downloadLink;
    }

    findInterpreter(callback) {
        callback(this.findInterpreterSync());
    }

    findInterpreterSync() {
        var isFound = false;
        var interpreterPath = false;
        var here = this;
        this.exactFilePaths.forEach(function(path) {
            if (isFound) {
                return;
            }
            if (here.checkInterpreterPath(path)) {
                interpreterPath = path;
                isFound = true;
            }
        });

        return interpreterPath;
    }

    checkInterpreterPath(path) {
        try {
            return fs.statSync(path).isFile();
        } catch (err) {
            return false;
        }
    }

    checkInterpreter(interpreterCommand, callback) {
        childProcess.exec(interpreterCommand + " -version", function(error, stdout, stderr) {
            if (error) {
                callback(false);
            } else {
                callback(stdout.trim());
            }
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

    // TODO: check
    findInterpreter(callback) {
        var interpreterCommand = "instead";
        childProcess.exec("which " + interpreterCommand, function(error, stdout, stderr) {
            if (error) {
                callback(false);
            } else {
                callback(interpreterCommand);
            }
        });
    }

    findInterpreterSync() {
        var interpreterCommand = "instead";
        try {
            var result = childProcess.execSync("which " + interpreterCommand);
            if (!result || 0 == result.length) {
                return false;
            }
        } catch(e) {
            return false;
        }

        return interpreterCommand;
    }
}

class InsteadInterpreterFinderWin extends InsteadInterpreterFinder {

    // TODO: finish and check
    constructor() {
        super();

        // mountvol /
        // [A-Z]+:.*$
        var drives = ["C:\\", "D:\\"];
        drives.forEach(function(drive) {
            this.exactFilePaths.push(drive + "Program Files\\Games\\INSTEAD\\sdl-instead.exe");
            this.exactFilePaths.push(drive + "Program Files (x86)\\Games\\INSTEAD\\sdl-instead.exe");
            this.exactFilePaths.push(drive + "Program Files\\INSTEAD\\sdl-instead.exe");
            this.exactFilePaths.push(drive + "Program Files (x86)\\INSTEAD\\sdl-instead.exe");
        })
    }
}

module.exports.InsteadInterpreterFinder = InsteadInterpreterFinder;
module.exports.InsteadInterpreterFinderMac = InsteadInterpreterFinderMac;
module.exports.InsteadInterpreterFinderFreeUnix = InsteadInterpreterFinderFreeUnix;
module.exports.InsteadInterpreterFinderWin = InsteadInterpreterFinderWin;
