"use strict";

class Game {
    constructor() {
        this.id = null; // It will be set for recognizing game objects
        this.title = null;
        this.name = null;
        this.version = null;
        this.langs = [];
        this.lang = null;
        this.url = null;
        this.size = null;
        this.descurl = null;
        this.repositoryFilename = null;
        this.installed = false;
        this.onlyLocal = false;
        this.image = null;
    }

    // TODO: move to other place
    hydrateFromXml(xmlGame, repositoryFilename) {
        this.title = xmlGame.title[0];
        this.name = xmlGame.name[0];
        this.version = xmlGame.version[0];
        this.langs = [xmlGame.lang[0]]; // TODO: make normal parsing
        this.lang = xmlGame.lang[0];
        this.url = xmlGame.url[0];
        this.size = xmlGame.size[0];
        this.descurl = xmlGame.descurl[0];
        this.repositoryFilename = repositoryFilename;
        if (xmlGame.image && !/\/$/.test(xmlGame.image[0])) {
            this.image = xmlGame.image[0];
        }
    }
}

module.exports.Game = Game;
