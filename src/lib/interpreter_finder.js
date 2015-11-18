"use strict";

var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');

class InsteadInterpreterFinder {

    constructor() {
        this.exactFilePaths = [];
        this.builtInPath = null; // built-in INSTEAD interpreter path (with InsteadMan)
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
        childProcess.exec('"' + interpreterCommand + '" -version', function(error, stdout, stderr) {
            if (error) {
                callback(false);
            } else {
                callback(stdout.trim());
            }
        });
    }

    isAvailableBuiltIn() {
        return this.checkInterpreterPath(this.builtInPath);
    }

    getBuiltInPath() {
        return this.builtInPath;
    }
}

class InsteadInterpreterFinderMac extends InsteadInterpreterFinder {
    constructor() {
        super();

        this.builtInPath = '../../MacOS/sdl-instead';
        this.exactFilePaths = [
            '/Applications/Instead.app/Contents/MacOS/sdl-instead'
        ];
    }

}

class InsteadInterpreterFinderFreeUnix extends InsteadInterpreterFinder {
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
            var result = childProcess.execSync("which " + interpreterCommand, {encoding: 'utf-8'});
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

    constructor() {
        super();

        this.builtInPath = path.dirname(process.execPath) + "\\sdl-instead.exe";

        var finder = this;

        var mountResult = childProcess.execSync("mountvol /", {encoding: 'utf-8'});
        var drives = mountResult.match(/[A-Z]+:.*/g);
        drives.forEach(function(drive) {
            finder.exactFilePaths.push(drive + "Program Files\\Games\\INSTEAD\\sdl-instead.exe");
            finder.exactFilePaths.push(drive + "Program Files (x86)\\Games\\INSTEAD\\sdl-instead.exe");
            finder.exactFilePaths.push(drive + "Program Files\\INSTEAD\\sdl-instead.exe");
            finder.exactFilePaths.push(drive + "Program Files (x86)\\INSTEAD\\sdl-instead.exe");
        })
    }
}

module.exports.InsteadInterpreterFinder = InsteadInterpreterFinder;
module.exports.InsteadInterpreterFinderMac = InsteadInterpreterFinderMac;
module.exports.InsteadInterpreterFinderFreeUnix = InsteadInterpreterFinderFreeUnix;
module.exports.InsteadInterpreterFinderWin = InsteadInterpreterFinderWin;
