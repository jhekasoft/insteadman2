global.$ = window.$ = window.jQuery = global.jQuery = require('jquery');
global.document = document;
require('bootstrap');

var os = require('os');
var path = require('path');
var gui = require('nw.gui');
var statusBar = require('status-bar');
var interpreterFinderLib = require('./lib/interpreter_finder');
var configuratorLib = require('./lib/configurator');
var managerLib = require('./lib/manager');

var locale = window.navigator.language;
var version = gui.App.manifest.version;

if ("win32" == os.platform()) {
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderWin;
    var configurator = new configuratorLib.ConfiguratorWin(insteadInterpreterFinder, version, locale);
    var manager = new managerLib.ManagerWin(configurator);
} else if ("darwin" == os.platform()) {
    var mb = new gui.Menu({type:"menubar"});
    mb.createMacBuiltin("Insteadman");
    gui.Window.get().menu = mb;

    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderMac;
    var configurator = new configuratorLib.ConfiguratorMac(insteadInterpreterFinder, version, locale);

    var manager = new managerLib.ManagerMac(configurator);
} else {
    var insteadInterpreterFinder = new interpreterFinderLib.InsteadInterpreterFinderFreeUnix;
    var configurator = new configuratorLib.ConfiguratorFreeUnix(insteadInterpreterFinder, version, locale);
    var manager = new managerLib.ManagerFreeUnix(configurator);
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
        $('#game_logo').removeClass('active');
        if (game.image) {
            $('#game_logo').attr('src', game.image);
            $('#game_logo').addClass('active');
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
            if (game.isUpdateExist) {
                $('#game_install').show();
            } else {
                $('#game_install').hide();
            }
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
        $("#error_dialog_message").html(message);
        $('#error_dialog').modal('show');
    },

    updateRepositories: function(button) {
        var $btn = $(button).button('loading');
        manager.updateRepositories(
            function (repository, status) {
                if (!status) {
                    console.log(repository);
                    return ManGui.showError(t("Updating error"),
                        t("Can't update <strong>{repository}</strong> (URL: {repositoryUrl}) repository. Please check your connection.")
                            .replace('{repository}', repository.name)
                            .replace('{repositoryUrl}', repository.url)
                    );
                }
            },
            function () {
                $btn.button('reset');
                ManGui.render();
            }
        );
    },

    confirmDeletion: function(gameId) {
        var game = globalGamesList[gameId];
        $('#game_delete_confirmation_title').text(game.title);
        $('#game_confirm_delete').data('game_id', gameId).button('reset');
        $('#game_delete_confirm_dialog').modal('show');
    },

    deleteGame: function(gameId, callback) {
        var game = globalGamesList[gameId];
        manager.deleteGame(game, function(game) {
            if (callback) callback(game);
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

            var gameSize = '';
            if (game.size > 0) {
                gameSize = bar.format.storage(game.size).replace(/(.*)(\s)(.*)$/, '$1&nbsp;$3');
            }

            var version = game.version;
            if (game.isUpdateExist) {
                version = game.installedVersion;
                if (game.version != game.installedVersion) {
                    version += ' (' + game.version + ')';
                }
            }

            gamesHtml += '<tr class="games_list_item ' + rowClass + '" id="game_list_item-' + id + '" data-id="' + id + '">' +
                    '<td>' + gameTitle + '</td><td>' + version + '</td>' +
                    '<td class="game_size_col">' +
                        '<span class="game_size">' + gameSize + '</span>' +
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

    showUpdateChecking: function(showOnlyIfNeedUpdate, callback, showCheckOnStartOption) {
        $('#update_check_failed').hide();
        $('#update_check_ok_updated').hide();
        $('#update_check_ok_need_update').hide();
        $('#check_update_on_start_label').hide();

        manager.checkUpdate(function (result) {
            var isNeedUpdate = false;

            if ('last' == result) {
                $('#update_check_ok_updated').show();
            } else if (result) {
                isNeedUpdate = true;
                $('#update_check_current_version').text(manager.version);
                if (result.last_version) {
                    $('#update_check_new_version').text(result.last_version);
                }
                if (result.download_link) {
                    $('#update_check_new_version_link').attr('href', result.download_link);
                    $('#update_check_new_version_link').text(result.download_link);
                }

                var defaultReleaseNotesField = 'release_notes';
                var releaseNotesField = defaultReleaseNotesField;
                if (manager.configurator.getLang() != manager.configurator.defaultLang) {
                    releaseNotesField = defaultReleaseNotesField + '_' + manager.configurator.getLang();
                }
                if (result[releaseNotesField]) {
                    $('#update_check_new_version_release_notes').html(result[releaseNotesField]);
                } else if (result[defaultReleaseNotesField]) {
                    $('#update_check_new_version_release_notes').html(result[defaultReleaseNotesField]);
                }

                $('#update_check_ok_need_update').show();
            } else {
                $('#update_check_failed').show();
            }

            if ((showOnlyIfNeedUpdate && isNeedUpdate) || !showOnlyIfNeedUpdate) {
                // Check update on start
                if (showCheckOnStartOption) {
                    $('#check_update_on_start').prop('checked', manager.configurator.canCheckUpdateOnStart());
                    $('#check_update_on_start_label').show();
                }

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
        function (game, err) {
            console.log(game);

            if (!game) {
                $btn.button('reset');
                ManGui.render();

                // Downloading error
                if (err && "DOWNLOADERR" == err.code) {
                    return ManGui.showError(t("Installation error"), t("Download has failed. Please check your connection."));
                }
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
var i18nData = manager.configurator.readI18n(manager.configurator.getLang(), true);
var i18n = require('./lib/gui/modules/i18n')

function t(key) {
    return i18n.t(key);
}

i18n.translateAll(i18nData);
// i18n end ----------------------------

$('#repository_update').click(function () {
    ManGui.updateRepositories(this);
});

$('#filter').click(function () {
    if ('false' == $(this).attr('aria-pressed')) {
        $('#filter_container').show();
    } else {
        $('#filter_container').hide();
    }

    ManGui.redrawGui();
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

$('#game_logo').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    var game = globalGamesList[gameId];
    if (game.image) {
        $('#image_dialog_image').attr('src', game.image);
        $('#image_dialog').modal('show');
    }
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
    infoWindow.on ('loaded', function(){
        $(infoWindow.window).keyup(function(e){
            if(e.keyCode == 27){
                infoWindow.close();
            }
        });
    });
});

$('#game_delete').click(function () {
    var gameId = $(this).parents('#game_block').data('game_id');
    ManGui.confirmDeletion(gameId);
});

$('#game_confirm_delete').click(function () {
    var gameId = $(this).data('game_id');

    var $btn = $(this).button('loading');
    ManGui.deleteGame(gameId, function (game) {
        console.log(game);
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

$('#check_update_on_start').change(function () {
    manager.configurator.setCheckUpdateOnStart($(this).prop('checked'));
    manager.configurator.save();
    manager.configurator.read();
});

ManGui.render();

// Update repository files if it is needed
var repositoryFiles = manager.getRepositoryFiles();
if (repositoryFiles.length < 1) {
    ManGui.updateRepositories($('#repository_update'));
}

// Check updating
if (manager.configurator.canCheckUpdateOnStart()) {
    ManGui.showUpdateChecking(true, null, true);
}

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
