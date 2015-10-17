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

    findInterpreter(callback) {
        var isFound = false;
        var here = this;
        this.exactFilePaths.forEach(function(path) {
            if (here.checkInterpreterPath(path)) {
                isFound = true;
                callback(path);
                return false;
            }
        });

        if (!isFound) {
            callback(false);
        }
    }

    checkInterpreterPath(path) {
        try {
            return fs.statSync(path).isFile();
        } catch (err) {
            return false;
        }
    }

    checkInterpreter(interpreterCommand, callback) {
        //try {
        //    var result = childProcess.execSync("which ls", {encoding: "ascii"});
        //    console.log(result);
        //} catch (err) {
        //    console.log('fail');
        //}

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
        var interpreterCommand = "instead"
        childProcess.exec("which " + interpreterCommand, function(error, stdout, stderr) {
            if (error) {
                callback(false);
            } else {
                callback(interpreterCommand);
            }
        });
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

module.exports.InsteadInterpreterFinderMac = InsteadInterpreterFinderMac;
module.exports.InsteadInterpreterFinderFreeUnix = InsteadInterpreterFinderFreeUnix;
