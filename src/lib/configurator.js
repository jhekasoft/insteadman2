"use strict";

var fs = require('fs-extra');
var expandHomeDir = require('expand-home-dir');
var glob = require("glob");
var path = require("path");

class Configurator {
    constructor() {
        this.defaultLang = 'en';
        this.interpreterGamePath = "~/.instead/games/";
        this.configPath = "~/.instead/manager/";
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
        this.configPath = expandHomeDir(this.configPath);
        this.configFilePath = this.configPath + this.configFilename;
        this.repositoriesPath = this.configPath + "repositories/";
        this.tempGamePath = this.configPath + "games/";
        this.skeletonPath = './resources/skeleton/';
        this.i18nPath = './resources/i18n/';
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
        
        // TODO: create recursive dir, copy skeleton config, write default settings
        try {
            fs.statSync(this.configFilePath).isFile()
        } catch (err) {
            fs.copySync(this.skeletonPath + this.configFilename, this.configFilePath);
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

    getGamesPath() {
        return expandHomeDir(this.getValue("games_path"))
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
            fs.mkdirSync(path);
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
    constructor() {
        super();
        this.configPath = "~\\Local Settings\\Application Data\\instead\\manager\\";
    }
}

module.exports.Configurator = Configurator;
module.exports.ConfiguratorMac = ConfiguratorMac;
module.exports.ConfiguratorFreeUnix = ConfiguratorFreeUnix;
module.exports.ConfiguratorWin = ConfiguratorWin;
