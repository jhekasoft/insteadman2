"use strict";

var fs = require('fs');

class Manager {
    constructor(configurator) {
        this.configurator = configurator;
    }
}

class ManagerMac extends Manager {

}

class ManagerFreeUnix extends Manager {

}

class ManagerWin extends Manager {
}

module.exports.ManagerMac = ManagerMac;
module.exports.ManagerFreeUnix = ManagerFreeUnix;
module.exports.ManagerWin = ManagerWin;
