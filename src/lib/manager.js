"use strict";

var fs = require('fs-extra');
var path = require('path');
var glob = require("glob");
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
var statusBar = require('status-bar');
var xml2js = require('xml2js');
var childProcess = require('child_process');
var manUtils = require('./man_utils');
var configuratorClass = require('./configurator').Configurator;
var gameClass = require('./models').Game;

class Manager {
    constructor(configurator) {
        this.webPage = 'http://instead.club';
        this.updateCheckUrl = 'https://raw.githubusercontent.com/jhekasoft/insteadman/master/version.json';
        if (!(configurator instanceof configuratorClass)) {
            throw "Wrong Configurator instance.";
        }
        this.configurator = configurator;
        this.interpreterFinder = this.configurator.interpreterFinder;
        this.version = this.configurator.managerVersion;
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
        var manager = this;
        files.forEach(function (gameFile) {
            let game = new gameClass();
            let gameName = path.basename(gameFile);

            // IDF
            let isIdf = false;
            let match = /(.*)\.idf$/i.exec(gameName);
            if (match) {
                gameName = match[1];
                isIdf = true;
            }

            game.name = gameName;
            game.title = game.name;
            game.installed = true;

            if (isIdf) {
                manager.addIdfGameData(game);
            } else {
                manager.addDirectoryGameData(game);
            }

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

                // TODO: fix code duplicate
                downloadedRepositoriesCount++;
                if (downloadedRepositoriesCount >= repositories.length) {
                    if (endDownloadingCallback) endDownloadingCallback(true);
                }

                console.error(err);
                downloadStatusCallback(repository, false);
            });
        });

        console.log("End update");
    }

    executeInstallGameCommand(gameFilepath, callback) {
        var interpreterCommand = this.configurator.getComputedInterpreterCommand();
        var command = '"' + interpreterCommand + '" -install "' + gameFilepath + '" -quit';
        console.log('Run command: ' + command);

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

            //file.on('hangup', function () {
            //
            //});

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

            // TODO: more pretty exception handling
            var resErr = new Error(err.message);
            resErr.code = "DOWNLOADERR";
            endInstallationCallback(false, resErr);
        });
    }

    executeRunGameCommand(gameName, callback) {
        var interpreterCommand = this.configurator.getComputedInterpreterCommand();
        var command = '"' + interpreterCommand + '" -game "' + gameName + '"';
        console.log('Run command: ' + command);

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

        // IDF
        try {
            var stat = fs.statSync(this.configurator.getGamesPath() + runningGameName + '.idf');
        } catch (err) {
        }
        if (stat) {
            runningGameName += '.idf';
        }

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
                // rm filename
                fs.unlinkSync(filename);
            }
        }
        fs.rmdirSync(dir);
    };

    deleteGame(game, callback) {
        var gamePath = this.configurator.getGamesPath() + game.name;

        var stat = null;
        try {
            stat = fs.statSync(gamePath);
        } catch (err) {
            var gamePath = this.configurator.getGamesPath() + game.name + ".idf";
            try {
                stat = fs.statSync(gamePath);
            } catch (err) {
                if (callback) callback(false);
                console.error("File/directory doesn't exist (" + err.message + ")");
                return;
            }
        }

        try {
            if (stat.isDirectory()) {
                this.deleteFolder(gamePath);
            } else {
                fs.unlinkSync(gamePath);
            }
        } catch (err) {
            if (callback) callback(false);
            console.error("File/directory removing error (" + err.message + ")");
            return;
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
        var keywordRegEx = new RegExp('.*' + manUtils.escapeRegExp(value) + '.*', 'i');
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

    checkUpdate(callback) {
        var manager = this;
        https.get(this.updateCheckUrl, function(res) {
            var body = '';
            res.on('data', function(data) {
                body += data;
            });
            res.on('end', function() {
                var result = null;
                try {
                    var result = JSON.parse(body);
                } catch (e) {
                    return callback('last');
                }

                if (result.last_version && manUtils.compareVersions(manager.version, '<', result.last_version)) {
                    return callback(result);
                } else {
                    return callback('last');
                }
            });
        }).on('error', function(e) {
            callback(false, e.message);
        });
    }

    addDirectoryGameData(game) {
        var gamePath = this.configurator.getGamesPath() + game.name;
        var mainLuaFilePath = path.join(gamePath, 'main.lua');

        try {
            var mainLuaContent = fs.readFileSync(mainLuaFilePath, 'utf8');
        } catch (err) {
            console.error("Error reading game info from " + mainLuaFilePath);
            return false;
        }

        let match = /--\s\$Name:\s*(.*)\$/i.exec(mainLuaContent);
        if (match) {
            game.title = match[1];
        }

        match = /--\s\$Version:\s*(.*)\$/i.exec(mainLuaContent);
        if (match) {
            game.version = match[1];
        }

        return game;
    }

    addIdfGameData(game) {
        // TODO: get more effective method
        var gamePath = this.configurator.getGamesPath() + game.name;
        var idfFilePath = gamePath + '.idf';

        try {
            var idfContent = fs.readFileSync(idfFilePath, 'utf8');
        } catch (err) {
            console.error("Error reading game info from " + idfFilePath);
            return false;
        }

        let match = /--\s\$Name:\s*(.*)\$/i.exec(idfContent);
        if (match) {
            game.title = match[1];
        }

        match = /--\s\$Version:\s*(.*)\$/i.exec(idfContent);
        if (match) {
            game.version = match[1];
        }

        return true;
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
