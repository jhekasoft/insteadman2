var os = require('os');
var gui = require('nw.gui');
var statusBar = require('status-bar');
var interpreterFinderLib = require('./lib/interpreter_finder');
var configuratorLib = require('./lib/configurator');
var managerLib = require('./lib/manager');

if ("win32" == os.platform()) {
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderWin;
    var configurator = new configuratorLib.ConfiguratorWin;
    var manager = new managerLib.ManagerWin(configurator);
} else if ("darwin" == os.platform()) {
    var mb = new gui.Menu({type:"menubar"});
    mb.createMacBuiltin("Insteadman");
    gui.Window.get().menu = mb;

    
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderMac;
    //        insteadInterpreterFinder.findInterpreter(function(interpreterPath) {
    //            insteadInterpreterFinder.checkInterpreter(interpreterPath, function(version) {
    //                version = version || "not found";
    //                document.getElementById('interpreter_version').innerText = version;
    //            });
    //        });

    var configurator = new configuratorLib.ConfiguratorMac;
    //        console.log(configurator.getValue("lang"));
    //        console.log(configurator.getValue("lang1"));
    //        configurator.setValue("lang1", "dd");
    //        console.log(configurator.getAll());
    //        if (configurator.save()) {
    //            console.log("ok");
    //        }

    var manager = new managerLib.ManagerMac(configurator);
} else {
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderFreeUnix;
    var configurator = new configuratorLib.ConfiguratorFreeUnix;
    var manager = new managerLib.ManagerFreeUnix(configurator);
}

var bar = statusBar.create({ total: 0 });
var globalGamesList = [];

var ManGui = {
    selectGame: function(gameId, item) {
        var game = globalGamesList[gameId];
        $('#game_block').data('game_id', gameId);
        $('#game_title').text(game.title);
        if (game.image) {
            $('#game_logo').attr('src', game.image);
        } else {
            $("#game_logo").attr("src", ($("#game_logo").data("default-src")));
        }

        $('.games_list_item').removeClass('info');
        $(item).addClass('info');

        if (game.installed) {
            $('#game_install').hide();
            $('#game_run').show();
            $('#game_delete').show();
        } else {
            $('#game_install').show();
            $('#game_run').hide();
            $('#game_delete').hide();
        }

        if (game.descurl) {
            $('#game_info_group').show();
        } else {
            $('#game_info_group').hide();
        }
    },

    showError: function(title, message) {
        $("#error_dialog_title").text(title);
        $("#error_dialog_message").text(message);
        $('#error_dialog').modal('show');
    },

    updateRepositories: function(button) {
        var $btn = $(button).button('loading')
        manager.updateRepositories(null, function () {
            $btn.button('reset');
            ManGui.render();
        });
    },

    render: function() {
        globalGamesList = manager.getSortedCombinedGameList();
        console.log(globalGamesList);

        $('#games_list .games_list_item').remove();

        var gamesHtml = '';

        globalGamesList.forEach(function (game, id) {
            var gameTitle = game.title;
            var rowClass = '';
            if (game.installed) {
                gameTitle = '<strong>' + gameTitle + '</strong>';
                // rowClass = 'success';
            }
            gamesHtml += '<tr class="games_list_item ' + rowClass + '" id="game_list_item-' + id + '" data-id="' + id + '">' +
                    '<td>' + gameTitle + '</td><td>' + game.version + '</td>' +
                    '<td>' +
                        '<span class="game_size">' + bar.format.storage(game.size) + '</span>' +
                        '<div class="game_progress progress" style="display: none;">' +
                            '<div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">' +
                                '<span class="sr-only">0%</span>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '</tr>';
        });
        $('#games_list').append(gamesHtml);

        $("#game_title").text($("#game_title").data("default-text"));
        $("#game_logo").attr("src", ($("#game_logo").data("default-src")));
        $('#game_buttons').children().hide();

        $('.games_list_item').click(function () {
            var gameId = $(this).data('id');
            ManGui.selectGame(gameId, this);
        });

        $("#manager_loader").hide();
    }
};

$('#game_install').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    $('#game_list_item-' + gameId + ' .game_size').hide();
    $('#game_list_item-' + gameId + ' .game_progress').show();

    var $btn = $(this).button('loading');

    manager.installGame(game,
        function (game, status) {
            console.log([game, status]);

            var percents = Math.round(status.percents * 100);
            var gameProgress = $('#game_list_item-' + gameId + ' .game_progress');
            gameProgress.find('.progress-bar').attr('aria-valuenow', percents);
            gameProgress.find('.progress-bar').css('width', percents + '%');
            gameProgress.find('.sr-only').text(bar.format.percentage(status.percents));

            if (!game) {
                ManGui.render();
            }
        },
        function (game) {
            console.log(game);
            //ManGui.render();
        },
        function (game) {
            console.log(game);

            if (!game) {
                ManGui.render();
                return ManGui.showError("Installation error", "Installation has failed. Please check INSTEAD command in settings.");
            }

            var percents = 100;
            var gameProgress = $('#game_list_item-' + gameId + ' .game_progress');
            gameProgress.find('.progress-bar').attr('aria-valuenow', percents);
            gameProgress.find('.progress-bar').css('width', percents + '%');
            gameProgress.find('.sr-only').text(bar.format.percentage(status.percents));

            setTimeout(function () {
                $btn.button('reset');
                ManGui.render();
                ManGui.selectGame(gameId, $('#game_list_item-' + gameId));
            }, 200);
        }
    )
});

$('#repository_update').click(function () {
    ManGui.updateRepositories(this);
});

$('#settings').click(function () {
    for(module in global.require.cache){
        if(global.require.cache.hasOwnProperty(module)){
            delete global.require.cache[module];
        }
    }
    location.reload()
});

$('#game_run').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    manager.runGame(game, function (gameName) {
        if (gameName) {
            return console.log("Running " + gameName + ".");
        }

        ManGui.showError("Running error", "Running has failed. Please check INSTEAD command in settings.");
    });
});

$('#game_info_external').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    gui.Shell.openExternal(game.descurl);
});

$('#game_info').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    var infoWindow = gui.Window.open(game.descurl, {toolbar: false, focus: true});
});

$('#game_delete').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    manager.deleteGame(game, function() {
        ManGui.render();
        ManGui.selectGame(gameId, $('#game_list_item-' + gameId));
    });
});

// Update repository files or just render list
var repositoryFiles = manager.getRepositoryFiles();
if (repositoryFiles.length < 1) {
    ManGui.updateRepositories($('#repository_update'));
} else {
    ManGui.render();
}
