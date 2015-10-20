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

    read() {
        var configRaw = fs.readFileSync(this.getConfigFullPath(), 'utf8');
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
        if (typeof config[name] !== 'undefined') {
            return null;
        }

        return config[name];
    }

    setValue(name, value) {
        // Read config if it empty
        this.getAll();

        this.configData[name] = value;
    }

    save() {
        var configRaw = JSON.stringify(this.configData, null, '  ');
        try {
            fs.writeFileSync(this.getConfigFullPath(), configRaw, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
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
