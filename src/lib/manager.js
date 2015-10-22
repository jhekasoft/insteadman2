"use strict";

var fs = require('fs');
var path = require('path');
var glob = require("glob");
var http = require('follow-redirects').http;
var statusBar = require('status-bar');
var xml2js = require('xml2js');
var configuratorClass = require('./configurator').Configurator
var gameClass = require('./models').Game

class Manager {
    constructor(configurator) {
        if (!(configurator instanceof configuratorClass)) {
            throw "Wrong Configurator instance.";
        }
        this.configurator = configurator;
    }

    getRepositoryFiles() {
        return glob.sync(this.configurator.getRepositoriesPath() + "*.xml");
    }

    xmlGameParseLanguages(game) {

    }

    getGamesFromFile(filePath) {
        // TODO: this.xmlGameParseLanguages();

        var parser = new xml2js.Parser();
        fs.readFile(filePath, function(err, data) {
            parser.parseString(data, function (err, result) {
                console.dir(result);
                console.log('Done');
            });
        });

        return null;
    }

    getGameList() {
        var gameList = [];

        var parser = new xml2js.Parser();
        var here = this;
        this.getRepositoryFiles().forEach(function(file) {
           console.log(here.getGamesFromFile(file));
        });
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


    updateRepositories(downloadStatusCallback, beginRepositoryDownloadingCallback, endDownloadingCallback) {
        var repositories = this.configurator.getRepositories();
        var repositoriesPath = this.configurator.getRepositoriesPath();
        console.log([repositories, repositoriesPath]);

        repositories.forEach(function(repository) {
            var url = repository.url;
            var filename = repository.name + ".xml";
            var bar;
            var file = fs.createWriteStream(repositoriesPath + filename);
            console.log(url);
            http.get(url, function (res) {
                var total = res.headers['content-length'] || 0;
                bar = statusBar.create({ total: total })
                    .on('render', function (stats) {
                        process.stdout.write(
                            filename + ' ' +
                            this.format.storage(stats.currentSize) + ' ' +
                            this.format.speed(stats.speed) + ' ' +
                            this.format.time(stats.elapsedTime) + ' ' +
                            this.format.time(stats.remainingTime) + ' [' +
                            this.format.progressBar(stats.percentage) + '] ' +
                            this.format.percentage(stats.percentage));
                        process.stdout.cursorTo(0);
                    });

                res.pipe(bar);
                res.pipe(file);

                file.on('finish', function () {
                    file.close(function() {
                        console.log("download completed");
                    });
                });
                file.on('error', function (err) {
                    fs.unlink(dest),
                        function() {
                            console.log("error");
                        }
                });
            }).on('error', function (err) {
                if (bar) bar.cancel();
                console.error(err);
            });
        });
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
