"use strict";

class Game {
    constructor(gameData) {
        this.title = gameData.title || null;
        this.name = gameData.name || null;
        this.version = gameData.version || null;
        this.langs = gameData.langs || [];
        this.lang = gameData.lang || null;
        this.url = gameData.url || null;
        this.size = gameData.size || null;
        this.descurl = gameData.descurl || null;
        this.repositoryFilename = gameData.repositoryFilename || null;
        this.installed = gameData.installed || false;
    }
}

module.exports.Game = Game;
