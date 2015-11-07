var os = require('os');
var path = require('path');
var gui = require('nw.gui');
var statusBar = require('status-bar');
var interpreterFinderLib = require('./lib/interpreter_finder');
var configuratorLib = require('./lib/configurator');
var managerLib = require('./lib/manager');

if ("win32" == os.platform()) {
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderWin;
    var configurator = new configuratorLib.ConfiguratorWin;
    var manager = new managerLib.ManagerWin(configurator, insteadInterpreterFinder);
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

    var manager = new managerLib.ManagerMac(configurator, insteadInterpreterFinder);
} else {
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderFreeUnix;
    var configurator = new configuratorLib.ConfiguratorFreeUnix;
    var manager = new managerLib.ManagerFreeUnix(configurator), insteadInterpreterFinder;
}

var bar = statusBar.create({ total: 0 });
var globalGamesList = [];

var ManGui = {
    selectGame: function(gameId, item) {
        var game = globalGamesList[gameId];

        $('.games_list_item').removeClass('info');
        $(item).addClass('info');

        $('#game_block').data('game_id', gameId);
        $('#game_title').html(game.title);

        $("#game_logo").attr("src", ($("#game_logo").data("default-src")));
        if (game.image) {
            $('#game_logo').attr('src', game.image);
        }

        if (game.repositoryFilename) {
            $("#game_repository").text(game.repositoryFilename);
            $("#game_repository").show();
        } else {
            $("#game_repository").hide();
        }

        if (game.langs && game.langs.length) {
            $("#game_languages").html('');
            game.langs.forEach(function (lang) {
                $("#game_languages").append('<span class="label label-primary"">' + lang + '</span> ');
            });
            $("#game_languages").show();
        } else {
            $("#game_languages").hide();
        }

        if (game.version) {
            $("#game_version").text(game.version);
            $("#game_version").show();
        } else {
            $("#game_version").hide();
        }

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

    confirmDeletion: function(gameId) {
        var game = globalGamesList[gameId];
        $('#game_delete_confirmation_title').text(game.title);
        $('#game_confirm_delete').data('game_id', gameId);
        $('#game_delete_confirm_dialog').modal('show');
    },

    deleteGame: function(gameId, callback) {
        var game = globalGamesList[gameId];
        manager.deleteGame(game, function() {
            if (callback) callback();
            ManGui.render();
            ManGui.selectGame(gameId, $('#game_list_item-' + gameId));
        });
    },

    fillFilterRepositories: function() {
        var selectedRepository = $('#filter_repository').val();

        var repositories = manager.getRepositoryFiles(true);
        var $filterRepositories = $('#filter_repository');
        $filterRepositories.html('');
        $filterRepositories.append($('<option>', {value: '', text: $filterRepositories.data('label')}));
        repositories.forEach(function (repository) {
            $filterRepositories.append($('<option>', {value: repository, text: repository}));
        });

        if (selectedRepository) {
            $('#filter_repository').val(selectedRepository);
        }
    },

    fillFilterLanguages: function() {
        var selectedLanguage = $('#filter_language').val();

        var languages = manager.getGamelistLangs(globalGamesList);
        var $filterLanguages = $('#filter_language');
        $filterLanguages.html('');
        $filterLanguages.append($('<option>', {value: '', text: $filterLanguages.data('label')}));
        languages.forEach(function (language) {
            $filterLanguages.append($('<option>', {value: language, text: language}));
        });

        if (selectedLanguage) {
            $('#filter_language').val(selectedLanguage);
        }
    },

    render: function() {
        globalGamesList = manager.getSortedCombinedGameList();

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
                    '<td class="game_size_col">' +
                        '<span class="game_size">' + bar.format.storage(game.size).replace(/(.*)(\s)(.*)$/, '$1&nbsp;$3') + '</span>' +
                        '<div class="game_progress progress" style="display: none;">' +
                            '<div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">' +
                                '<span class="sr-only">0%</span>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '</tr>';
        });
        $('#games_list').append(gamesHtml);

        // About block
        $('#about_version').text(manager.version);
        $('#about_web_page').attr('href', manager.webPage);
        $('#about_web_page').text(manager.webPage);

        // Add version to default game title
        var defaultGameTitle = $("#game_title").data("default-text");
        defaultGameTitle = defaultGameTitle.replace('{version}', manager.version);
        $("#game_title").data("default-text", defaultGameTitle);

        $("#game_title").text($("#game_title").data("default-text"));
        $("#game_logo").attr("src", ($("#game_logo").data("default-src")));
        $("#game_repository").hide();
        $("#game_languages").hide();
        $("#game_version").hide();

        $('#game_install').hide();
        $('#game_run').hide();
        $('#game_info_group').hide();
        $('#game_delete').hide();

        $('.games_list_item').click(function () {
            var gameId = $(this).data('id');
            ManGui.selectGame(gameId, this);
        });

        ManGui.fillFilterRepositories();
        ManGui.fillFilterLanguages();

        ManGui.filterGames();

        $("#main").show();
        $("#manager_loader").hide();
    },

    filterGames: function() {
        var keyword = $('#filter_keyword').val();
        var repository = $('#filter_repository').val();
        var language = $('#filter_language').val();
        var onlyInstalled = 'true' == $('#filter_only_installed').attr('aria-pressed');
        var filteredGamesList = manager.filterGames(globalGamesList, keyword, repository, language, onlyInstalled);
        $('.games_list_item').hide();
        filteredGamesList.forEach(function (game) {
            $('#game_list_item-' + game.id).show();
        });
    },

    redrawGui: function() {
        $('#games_list_container').css('height', $(window).innerHeight() - $('#header_container').outerHeight() - 26);
    },

    chooseFile: function(defaultFilePath, callback) {
        var chooser = $('#file_chooser');

        if (defaultFilePath) {
            chooser.attr('nwworkingdir', path.dirname(defaultFilePath));
        }

        chooser.unbind('change');
        chooser.change(function(evt) {
            if (callback && $(this).val()) callback($(this).val());
        });

        chooser.trigger('click');
    },

    showUpdateCheking: function(showOnlyIfNeedUpdate, callback) {
        $('#update_check_failed').hide();
        $('#update_check_ok_updated').hide();
        $('#update_check_ok_need_update').hide();

        manager.checkUpdate(function (result) {
            var isNeedUpdate = false;

            if ('last' == result) {
                $('#update_check_ok_updated').show();
            } else if (result) {
                isNeedUpdate = true;
                if (result.last_version) {
                    $('#update_check_new_version').text(result.last_version);
                }
                if (result.download_link) {
                    $('#update_check_new_version_link').attr('href', result.download_link);
                    $('#update_check_new_version_link').text(result.download_link);
                }
                if (result.release_notes) {
                    $('#update_check_new_version_release_notes').html(result.release_notes);
                }
                $('#update_check_ok_need_update').show();
            } else {
                $('#update_check_failed').show();
            }

            if ((showOnlyIfNeedUpdate && isNeedUpdate) || !showOnlyIfNeedUpdate) {
                $('#update_dialog').modal('show');
            }

            if (callback) callback(result);
        });
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
                return ManGui.showError(t("Installation error"), t("Installation has failed. Please check INSTEAD command in settings."));
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

// i18n begin --------------------------
var i18nData = manager.readI18n('ru');
var translate = i18nData.i18n;
var i18nAttributes = [
    {id: 'filter_keyword', attr: 'placeholder'},
    {id: 'filter_repository', attr: 'data-label'},
    {id: 'filter_language', attr: 'data-label'},
    {id: 'repository_update', attr: 'data-loading-text'},
    {id: 'game_install', attr: 'data-loading-text'},
    {id: 'game_confirm_delete', attr: 'data-loading-text'},
    {id: 'settings_save', attr: 'data-loading-text'},
    {id: 'settings_about_check_update', attr: 'data-loading-text'},
    {id: 'game_info_external', attr: 'title'},
    {id: 'filter_reset', attr: 'title'},
    {id: 'settings_instead_command_help', attr: 'data-detected-ok-text'},
    {id: 'settings_instead_command_help', attr: 'data-detected-fail-text'},
    {id: 'settings_instead_command_help', attr: 'data-tested-ok-text'},
    {id: 'settings_instead_command_help', attr: 'data-tested-fail-text'}
];
function t(key) {
    if (!translate[key]) {
        return key;
    }


    return translate[key];
}
$('.i18n').each(function () {
    var key = ($(this).html().trim());
    if (translate[key]) {
        $(this).html(translate[key]);
    }
});
i18nAttributes.forEach(function (i18nItem) {
    var $el = $('#' + i18nItem.id);
    if ($el.length < 1) {
        return;
    }

    var key = $el.attr(i18nItem.attr);
    if (!translate[key]) {
        return;
    }

    $el.attr(i18nItem.attr, translate[key]);
});
// i18n end ----------------------------

$('#repository_update').click(function () {
    ManGui.updateRepositories(this);
});

$('#settings').click(function () {
    manager.configurator.read();
    $('#settings_instead_command').val(manager.configurator.getInterpreterCommand());

    $('#settings_instead_command_help').html("&nbsp;");

    $('#settings_dialog').modal('show');
});

$('#settings_instead_command_browse').click(function () {
    ManGui.chooseFile($('#settings_instead_command').val(), function (filePath) {
        if (filePath) $('#settings_instead_command').val(filePath);
    });
});

$('#settings_instead_command_detect').click(function () {
    $('#settings_instead_command_help').html("&nbsp;");
    $('#settings_instead_command_help').removeClass('text-danger');
    $('#settings_instead_command_help').removeClass('text-success');

    manager.interpreterFinder.findInterpreter(function (filePath) {
        if (filePath) {
            $('#settings_instead_command').val(filePath);
            $('#settings_instead_command_help').text($('#settings_instead_command_help').data('detected-ok-text'));
            $('#settings_instead_command_help').addClass('text-success');
            return;
        }

        $('#settings_instead_command_help').text($('#settings_instead_command_help').data('detected-fail-text'));
        $('#settings_instead_command_help').addClass('text-danger');
    });
});

$('#settings_instead_command_test').click(function () {
    $('#settings_instead_command_help').html("&nbsp;");
    $('#settings_instead_command_help').removeClass('text-danger');
    $('#settings_instead_command_help').removeClass('text-success');

    manager.interpreterFinder.checkInterpreter($('#settings_instead_command').val(), function (version) {
        if (version) {
            $('#settings_instead_command_help').text($('#settings_instead_command_help').data('tested-ok-text').replace('{version}', version));
            $('#settings_instead_command_help').addClass('text-success');
            return;
        };

        $('#settings_instead_command_help').text($('#settings_instead_command_help').data('tested-fail-text'));
        $('#settings_instead_command_help').addClass('text-danger');
    });
});

$('#settings_save').click(function () {
    var $btn = $(this).button('loading');

    manager.configurator.setInterpreterPath($('#settings_instead_command').val());
    manager.configurator.save();

    $btn.button('reset');
    $('#settings_dialog').modal('hide');

    $('#settings_dialog').on('hidden.bs.modal', function (e) {
        for(module in global.require.cache){
            if(global.require.cache.hasOwnProperty(module)){
                delete global.require.cache[module];
            }
        }
        location.reload();
    });
});

$('#settings_about_check_update').click(function () {
    var $btn = $(this).button('loading');
    ManGui.showUpdateCheking(false, function() {
        $btn.button('reset');
    });
});

$('#filter').click(function () {
    if ('false' == $(this).attr('aria-pressed')) {
        $('#filter_container').show();
    } else {
        $('#filter_container').hide();
    }
});

$('#game_run').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    manager.runGame(game, function (gameName) {
        if (gameName) {
            return console.log("Running " + gameName + ".");
        }

        ManGui.showError(t("Running error"), t("Running has failed. Please check INSTEAD command in settings."));
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
    ManGui.confirmDeletion(gameId);
});

$('#game_confirm_delete').click(function () {
    var gameId = $(this).data('game_id');

    var $btn = $(this).button('loading');
    ManGui.deleteGame(gameId, function () {
        $btn.button('reset');
        $('#game_delete_confirm_dialog').modal('hide');
    });
});

$('#filter_keyword').change(function () {
    ManGui.filterGames();
});

$('#filter_keyword').keyup(function () {
    ManGui.filterGames();
});

$('#filter_repository').change(function () {
    ManGui.filterGames();
});

$('#filter_language').change(function () {
    ManGui.filterGames();
});

$('#filter_only_installed').click(function () {
    setTimeout(function () {
        ManGui.filterGames();
    }, 50);
});

$('#filter_reset').click(function () {
    $('#filter_keyword').val('');
    $('#filter_repository').val('');
    $('#filter_language').val('');
    $('#filter_only_installed').attr('aria-pressed', 'false');
    $('#filter_only_installed').removeClass('active');
    ManGui.filterGames();
});

// Update repository files or just render list
var repositoryFiles = manager.getRepositoryFiles();
if (repositoryFiles.length < 1) {
    ManGui.updateRepositories($('#repository_update'));
} else {
    ManGui.render();
}

// Check updating
ManGui.showUpdateCheking(true);

$(window).load(function () {
    ManGui.redrawGui();
});

$(window).resize(function () {
    ManGui.redrawGui();
});

$('a[target=_blank]').on('click', function(){
    require('nw.gui').Shell.openExternal( this.href );
    return false;
});
