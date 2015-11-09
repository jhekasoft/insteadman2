"use strict";

var fs = require('fs-extra');
var expandHomeDir = require('expand-home-dir');
var glob = require("glob");
var path = require("path");
var interpreterFinderClass = require('./interpreter_finder').InsteadInterpreterFinder;

class Configurator {
    constructor(interpreterFinder) {
        if (!(interpreterFinder instanceof interpreterFinderClass)) {
            throw "Wrong InterpreterFinder instance.";
        }
        this.interpreterFinder = interpreterFinder;

        this.managerVersion = '2.0.1';
        this.defaultLang = 'en';
        if (!this.interpreterGamePath) {
            this.interpreterGamePath = "~/.instead/games/";
        }
        if (!this.configPath) {
            this.configPath = "~/.instead/manager/";
        }
        this.configFilename = "instead-manager-settings.json";
        this.configData = {};

        this.configFilePath = null;
        this.repositoriesPath = null;
        this.tempGamePath = null;
        this.updateBasePaths();

        this.checkAndCreateDirectoriesAndFiles();
    }

    updateBasePaths() {
        this.interpreterGamePath = expandHomeDir(this.interpreterGamePath);
        this.configFilePath = expandHomeDir(this.configPath + this.configFilename);
        this.repositoriesPath = expandHomeDir(this.configPath + "repositories/");
        this.tempGamePath = expandHomeDir(this.configPath + "games/");
        this.skeletonPath = expandHomeDir('./resources/skeleton/');
        this.i18nPath = expandHomeDir('./resources/i18n/');
        this.configPath = expandHomeDir(this.configPath);
    }

    getRepositoriesPath() {
        return this.repositoriesPath;
    }

    getTempGamePath() {
        return this.tempGamePath;
    }

    checkAndCreateDirectoriesAndFiles() {
        this.checkAndCreateDirectory(this.configPath);
        this.checkAndCreateDirectory(this.repositoriesPath);
        this.checkAndCreateDirectory(this.tempGamePath);
        this.checkAndCreateDirectory(this.interpreterGamePath);

        try {
            fs.statSync(this.configFilePath).isFile()
        } catch (err) {
            fs.copySync(this.skeletonPath + this.configFilename, this.configFilePath);

            // Default settings
            this.read();

            this.setVersion(this.managerVersion);

            var interpreterPath = this.interpreterFinder.findInterpreterSync();
            if (!interpreterPath) interpreterPath = '';
            this.setInterpreterPath(interpreterPath);

            this.save();
        }
    }

    read() {
        var configRaw = fs.readFileSync(this.configFilePath, 'utf8');
        this.configData = JSON.parse(configRaw);
        return this.configData;
    }

    getAll() {
        if (0 == Object.keys(this.configData).length) {
            this.read();
        }

        return this.configData;
    }

    getValue(name) {
        var config = this.getAll();
        if (typeof config[name] === 'undefined') {
            return null;
        }

        return config[name];
    }

    getRepositories() {
        return this.getValue("repositories");
    }

    getLang() {
        return this.getValue("lang");
    }

    getInterpreterCommand() {
        return this.getValue("interpreter_command");
    }

    getComputedInterpreterCommand() {
       if (this.canUseBuiltInInterpreter()) {
           return this.interpreterFinder.getBuiltInPath();
       } else {
           return this.getInterpreterCommand();
       }
    }

    getGamesPath() {
        return this.interpreterGamePath;
        // return expandHomeDir(this.getValue("games_path"))
    }

    getVersion() {
        return this.getValue("version");
    }

    getUseBuiltInInterpreter() {
        return this.getValue("use_builtin_interpreter");
    }

    canUseBuiltInInterpreter() {
        // If isn't disabled usage and built-in interpreter is available
        var useBuiltInInterpreter = this.getUseBuiltInInterpreter();
        if (false !== useBuiltInInterpreter && this.interpreterFinder.isAvailableBuiltIn()) {
            return true;
        };

        return useBuiltInInterpreter;
    }

    setValue(name, value) {
        // Read config if it empty
        this.getAll();

        this.configData[name] = value;
    }

    setInterpreterPath(interpretorPath) {
        this.setValue("interpreter_command", interpretorPath);
    }

    setLang(lang) {
        this.setValue("lang", lang);
    }

    setVersion(version) {
        this.setValue("version", version);
    }

    setUseBuiltInInterpreter(useBuilInInterpreter) {
        return this.setValue("use_builtin_interpreter", useBuilInInterpreter);
    }

    save() {
        var configRaw = JSON.stringify(this.configData, null, '  ');
        try {
            fs.writeFileSync(this.configFilePath, configRaw, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    }

    checkAndCreateDirectory(path) {
        var isDirectoryExists = false;
        try {
            var stat = fs.statSync(path);
            isDirectoryExists = stat.isDirectory();
        } catch (err) {
        }

        if (!isDirectoryExists) {
            fs.mkdirsSync(path);
        }
    }

    readI18n(lang, fallback) {
        try {
            var i18nRaw = fs.readFileSync(this.i18nPath + lang + '.json', 'utf8');
        } catch (e) {
            if (!fallback) {
                return false;
            }
            var i18nRaw = fs.readFileSync(this.i18nPath + this.defaultLang + '.json', 'utf8');
        }

        return JSON.parse(i18nRaw);
    }

    getAvailableLanguages() {
        var fullPaths = glob.sync(this.i18nPath + '*.json');
        var langs = [];
        var configurator = this;
        fullPaths.forEach(function (fullPath) {
            let lang = path.basename(fullPath, '.json');
            let i18n = configurator.readI18n(lang);
            if (i18n.lang) {
                langs.push({lang: lang, title: i18n.lang});
            }
        });

        return langs;
    }
}

class ConfiguratorMac extends Configurator {

}

class ConfiguratorFreeUnix extends Configurator {

}

class ConfiguratorWin extends Configurator {
    constructor(interpreterFinder) {
        this.interpreterGamePath = "~/Local Settings/Application Data/instead/games/";
        this.configPath = "~/Local Settings/Application Data/instead/manager/";

        super(interpreterFinder);
    }
}

module.exports.Configurator = Configurator;
module.exports.ConfiguratorMac = ConfiguratorMac;
module.exports.ConfiguratorFreeUnix = ConfiguratorFreeUnix;
module.exports.ConfiguratorWin = ConfiguratorWin;
