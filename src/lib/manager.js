"use strict";

var fs = require('fs');
var path = require('path');
var glob = require("glob");
var http = require('follow-redirects').http;
var statusBar = require('status-bar');
var xml2js = require('xml2js');
var childProcess = require('child_process');
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

        var games = [];
        var data = fs.readFileSync(filePath);
        var parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            result.game_list.game.forEach(function (xmlGame) {
                var game = new gameClass();
                game.hydrateFromXml(xmlGame, path.basename(filePath));
                games.push(game);
            });
        });

        return games;
    }

    getGameList() {
        var gameList = [];
        var here = this;
        this.getRepositoryFiles().forEach(function(file) {
            gameList = gameList.concat(here.getGamesFromFile(file));
        });

        return gameList;
    }

    getSortedGameList() {
        return this.getGameList().sort(this.sortingCompareGameByTitle);
    }

    sortingCompareGameByTitle(gameA, gameB) {
        if (gameA.title == gameB.title) return 0;
        if (gameA.title > gameB.title) return 1; else return -1;
    }

    getLocalGameList() {
        var files = glob.sync(this.configurator.getGamesPath(true) + "*");
        var gameList = [];
        files.forEach(function (gameFile) {
            var game = new gameClass();
            // TODO: idf
            game.name = path.basename(gameFile);
            game.title = game.name;
            game.installed = true;
            gameList.push(game);
        });

        return gameList;
    }

    getSortedLocalGameList() {
        return this.getLocalGameList().sort(this.sortingCompareGameByTitle);
    }

    getCombinedGameList() {
        var gameList = this.getGameList();
        var localGameList = this.getLocalGameList();
        //var onlyLocalGameName = [];

        localGameList.forEach(function (localGame) {
            localGame.onlyLocal = true;
        });

        gameList.forEach(function (game) {
            localGameList.forEach(function (localGame) {
                if (game.name == localGame.name) {
                    game.installed = true;
                    localGame.onlyLocal = false;
                }
            });
        });

        localGameList.forEach(function (localGame) {
            if (localGame.onlyLocal) {
                gameList.push(localGame);
            }
        });

        return gameList;
    }

    getSortedCombinedGameList() {
        return this.getCombinedGameList().sort(this.sortingCompareGameByTitle);
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

    executeRunGameCommand(gameName, callback) {
        var interpreterCommand = this.configurator.getInterpreterCommand();
        var command = interpreterCommand + ' -game "' + gameName + '"';
        console.log(command);
        childProcess.exec(command, function(error, stdout, stderr) {
            if (error) {
                if (callback) callback(false);
            } else {
                if (callback) callback(stdout.trim());
            }
        });
    }

    runGame(game) {
        var runningGameName = game.name;
        // TODO: idf check and change runningGameName

        this.executeRunGameCommand(runningGameName);
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
