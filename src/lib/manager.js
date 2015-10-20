"use strict";

var fs = require('fs');
var configuratorClass = require('./configurator').Configurator

class Manager {
    constructor(configurator) {
        if (!(configurator instanceof configuratorClass)) {
            throw "Wrong Configurator instance.";
        }
        this.configurator = configurator;
    }

    getRepositoryFiles() {

    }

    xmlGameParseLanguages(game) {

    }

    getGamesFromFile(filePath) {
        // this.xmlGameParseLanguages();
    }

    getGameList() {
        // this.getRepositoryFiles();
        // this.getGamesFromFile();
    }

    getSortedGameList() {
        // this.getGameList();
    }

    getLocalGameList() {

    }

    getSortedLocalGameList() {
        // this.getLocalGameList();
    }

    getCombinedGameList() {
        // this.getSortedGameList();
        // this.getSortedLocalGameList();
    }

    getSortedCombinedGameList() {
        // this.getCombinedGameList();
    }

    getGamelistRepositories(gameList) {

    }

    getGamelistLangs(gameList) {

    }


    updateRepositories() {

    }

    executeInstallGameCommand(gameName) {

    }

    installGame(game) {
        // this.executeInstallGameCommand();
    }

    executeRunGameCommand(gameName) {

    }

    runGame(name) {
        // this.executeRunGameCommand();
    }

    deleteGame(name) {

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
