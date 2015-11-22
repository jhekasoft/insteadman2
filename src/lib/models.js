"use strict";

class Game {
    constructor() {
        this.id = null; // It will be set for recognizing game objects
        this.title = null;
        this.name = null;
        this.version = null;
        this.installedVersion = null;
        this.langs = [];
        this.lang = null;
        this.url = null;
        this.size = null;
        this.descurl = null;
        this.repositoryFilename = null;
        this.installed = false;
        this.onlyLocal = false;
        this.image = null;
        this.isUpdateExist = false;
    }

    // TODO: move to other place
    hydrateFromXml(xmlGame, repositoryFilename) {
        var game = this;

        // Langs parsing
        if (xmlGame.langs && xmlGame.langs[0].lang) {
            // format: <langs><lang>en</lang><lang>ru</lang></langs>
            xmlGame.langs[0].lang.forEach(function (lang) {
                game.langs.push(lang);
            });
        } else if(xmlGame.lang && xmlGame.lang[0]) {
            // format: <lang>en,ru</lang>
            this.langs = xmlGame.lang[0].split(/\s*,\s*/);
        }
        if (this.langs.length) {
            this.lang = this.langs[0];
        }

        this.title = xmlGame.title[0];
        this.name = xmlGame.name[0];
        this.version = xmlGame.version[0];

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
