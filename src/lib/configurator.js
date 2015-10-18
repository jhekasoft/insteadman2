"use strict";

var fs = require('fs');
var expandHomeDir = require('expand-home-dir');

class Configurator {
    constructor() {
        this.configPath = "~/.instead/manager/";
        this.configFilename = "instead-manager-settings.json";
        this.configData = {};
    }

    getConfigFullPath() {
        return expandHomeDir(this.configPath + this.configFilename);
    }

    checkAndCreateConfigFile() {
        // TODO: create recursive dir, copy skeleton config, write default settings
        //try {
        //    return fs.statSync(this.getConfigFullPath()).isFile();
        //} catch (err) {
        //    fs.
        //}
    }

    readConfig() {
        var config = fs.readFileSync(this.getConfigFullPath(), 'utf8');
        this.configData = JSON.parse(config);
        return this.configData;
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

module.exports.ConfiguratorMac = ConfiguratorMac;
module.exports.ConfiguratorFreeUnix = ConfiguratorFreeUnix;
module.exports.ConfiguratorWin = ConfiguratorWin;
