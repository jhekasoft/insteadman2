"use strict";

class Game {
    constructor() {
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
        this.installed = false;
    }
}

module.exports.Game = Game;
