"use strict";

var fs = require('fs-extra');
var path = require('path');
var glob = require("glob");
var http = require('follow-redirects').http;
var statusBar = require('status-bar');
var xml2js = require('xml2js');
var childProcess = require('child_process');
var configuratorClass = require('./configurator').Configurator;
var gameClass = require('./models').Game;

class Manager {
    constructor(configurator) {
        if (!(configurator instanceof configuratorClass)) {
            throw "Wrong Configurator instance.";
        }
        this.configurator = configurator;
    }

    getRepositoryFiles(onlyFilenames) {
        onlyFilenames = onlyFilenames || false;
        var fullPaths = glob.sync(this.configurator.getRepositoriesPath() + "*.xml");

        if (!onlyFilenames) {
            return fullPaths;
        }

        var fileNames = [];
        fullPaths.forEach(function (filePath) {
            fileNames.push(path.basename(filePath));
        });

        return fileNames;
    }

    getGamelistLangs(gameList) {
        gameList = gameList || this.getSortedCombinedGameList();

        var languages = [];
        gameList.forEach(function (game) {
            if (game.langs && game.langs.length) {
                game.langs.forEach(function (lang) {
                    if (languages.indexOf(lang) > -1) {
                        return;
                    }
                    languages.push(lang);
                });
            }
        });
        return languages;
    }

    getGamesFromFile(filePath) {
        var games = [];
        var data = fs.readFileSync(filePath);
        var parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            if (err || !result) return;

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
        var titleA = gameA.title.toLowerCase();
        var titleB = gameB.title.toLowerCase();
        if (titleA == titleB) return 0;
        if (titleA > titleB) return 1; else return -1;
    }

    getLocalGameList() {
        var files = glob.sync(this.configurator.getGamesPath() + "*");
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

    // TODO: private/prublic
    getSortedCombinedGameList() {
        var gameList = this.getCombinedGameList();
        gameList.sort(this.sortingCompareGameByTitle);
        gameList = this.identifyGameList(gameList);
        //console.log(gameList);
        return gameList;
    }

    identifyGameList(gameList) {
        gameList.forEach(function (game, key) {
            game.id = key;
        });
        return gameList;
    }

    //getGamelistRepositories(gameList) {
    //
    //}

    updateRepositories(downloadStatusCallback, endDownloadingCallback) {
        var repositories = this.configurator.getRepositories();
        var repositoriesPath = this.configurator.getRepositoriesPath();
        var downloadedRepositoriesCount = 0;
        console.log([repositories, repositoriesPath]);

        repositories.forEach(function(repository) {
            var url = repository.url;
            var filename = repository.name + ".xml";
            var bar;
            var file = fs.createWriteStream(repositoriesPath + filename);

            console.log(url);
            http.get(url, function (res) {
                var total = res.headers['content-length'] || 0;
                bar = statusBar.create({total: total})
                    .on('render', function (stats) {
                        if (downloadStatusCallback) {
                            downloadStatusCallback(repository, {
                                percents: stats.percentage,
                                totalSize: stats.totalSize,
                                currentSize: stats.currentSize,
                                speed: stats.speed
                            });
                        }
                    });

                res.pipe(file);
                res.pipe(bar);

                file.on('finish', function () {
                    file.close(function () {
                        downloadedRepositoriesCount++;
                        if (downloadedRepositoriesCount >= repositories.length) {
                            if (endDownloadingCallback) endDownloadingCallback(true);
                        }
                    });
                });
            }).on('error', function (err) {
                if (bar) bar.cancel();
                fs.unlink(repositoriesPath + filename);
                downloadedRepositoriesCount++;
                console.error(err);
            });
        });

        console.log("End update");
    }

    executeInstallGameCommand(gameFilepath, callback) {
        var interpreterCommand = this.configurator.getInterpreterCommand();
        var command = '"' + interpreterCommand + '" -install "' + gameFilepath + '" -quit';
        console.log(command);
        childProcess.exec(command, function(error, stdout, stderr) {
            if (error) {
                if (callback) callback(false);
            } else {
                if (callback) callback(true);
            }
        });
    }

    installGame(game, downloadStatusCallback, beginInstallationCallback, endInstallationCallback) {
        var tempGamePath = this.configurator.getTempGamePath();
        this.configurator.checkAndCreateDirectory(tempGamePath);
        var tempPartGameFilepath = tempGamePath + 'tmp_' + game.name + '.part';
        var tempGameFilepath = tempGamePath + path.basename(game.url);

        var url = game.url;
        var bar;
        var file = fs.createWriteStream(tempPartGameFilepath);
        var here = this;
        http.get(url, function (res) {
            console.log(res);
            var total = res.headers['content-length'] || 0;
            console.log('total: ' + total);
            // TODO: try res.headers['content-disposition'] for filename
            // tempGameFilepath = ;
            bar = statusBar.create({total: total})
                .on('render', function (stats) {
                    downloadStatusCallback(game, {
                        percents: stats.percentage,
                        totalSize: stats.totalSize,
                        currentSize: stats.currentSize,
                        speed: stats.speed
                    });
                });

            res.pipe(file);
            res.pipe(bar);

            file.on('finish', function () {
                file.close(function() {
                    fs.move(tempPartGameFilepath, tempGameFilepath, {clobber: true}, function (err) {
                        if (err) return endInstallationCallback(false, err);
                        beginInstallationCallback(game);
                        here.executeInstallGameCommand(tempGameFilepath, function (result) {
                            fs.unlink(tempGameFilepath);
                            if (result) endInstallationCallback(game); else endInstallationCallback(false);
                        });
                    })
                });
            });
        }).on('error', function (err) {
            downloadStatusCallback(game, false);
            fs.unlink(tempPartGameFilepath);
            if (bar) bar.cancel();
            console.error(err);
        });
    }

    executeRunGameCommand(gameName, callback) {
        var interpreterCommand = this.configurator.getInterpreterCommand();
        var command = '"' + interpreterCommand + '" -game "' + gameName + '"';

        childProcess.exec(command, function(error, stdout, stderr) {
            if (error) {
                if (callback) callback(false);
            } else {
                if (callback) callback(gameName);
            }
        });
    }

    runGame(game, callback) {
        var runningGameName = game.name;
        // TODO: idf check and change runningGameName

        this.executeRunGameCommand(runningGameName, callback);
    }

    deleteFolder(dir) {
        // https://gist.github.com/tkihira/2367067
        var list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
            var filename = path.join(dir, list[i]);
            var stat = fs.statSync(filename);

            if (filename == "." || filename == "..") {
                // pass these files
            } else if (stat.isDirectory()) {
                // rmdir recursively
                this.deleteFolder(filename);
            } else {
                // rm fiilename
                fs.unlinkSync(filename);
            }
        }
        fs.rmdirSync(dir);
    };

    deleteGame(game, callback) {
        var gameFolderPath = this.configurator.getGamesPath() + game.name;
        var gameIdfPath    = this.configurator.getGamesPath() + game.name + ".idf";

        if (fs.existsSync(gameFolderPath)) {
            this.deleteFolder(gameFolderPath);
        }
        if (fs.existsSync(gameIdfPath)) {
            fs.unlinkSync(gameIdfPath);
        }

        if (callback) callback(game);
    }

    filterGames(gameList, keyword, repository, lang, onlyInstalled) {
        if (repository) {
            gameList = this.filterGamesBy(gameList, this.isFoundRepository, repository);
        }

        if (lang) {
            gameList = this.filterGamesBy(gameList, this.isFoundLang, lang);
        }

        if (onlyInstalled) {
            gameList = this.filterGamesBy(gameList, this.isFoundOnlyInstalled, onlyInstalled);
        }

        if (keyword) {
            gameList = this.filterGamesBy(gameList, this.isFoundKeyword, keyword);
        }

        return gameList;
    }

    filterGamesBy(gameList, foundCallback, value) {
        var filteredGameList = [];
        gameList.forEach(function (game) {
            var isFound = foundCallback(game, value);
            if (isFound) {
                filteredGameList.push(game);
            }
        });

        return filteredGameList;
    }

    isFoundKeyword(game, value) {
        var keywordRegEx = new RegExp('.*' + Manager.escapeRegExp(value) + '.*', 'i');
        return keywordRegEx.exec(game.title) || keywordRegEx.exec(game.name);
    }

    isFoundRepository(game, value) {
        return value == game.repositoryFilename || value == game.repositoryFilename + '.xml';
    }

    isFoundLang(game, value) {
        return game.langs.indexOf(value) != -1;
    }

    isFoundOnlyInstalled(game, value) {
        return value == game.installed;
    }

    // see: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
    static escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
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
