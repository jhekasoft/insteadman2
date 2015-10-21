"use strict";

var fs = require('fs');
var path = require('path');
var http = require('follow-redirects').http;
var statusBar = require('status-bar');
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
