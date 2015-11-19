var SettingsGui = {
    settingsChangeBuiltInInterpreter: function(active) {
        if (active) {
            $('#settings_instead_command_use_builtin').attr('aria-pressed', 'true');
            $('#settings_instead_command_use_builtin').addClass('active');
            $('#settings_instead_command_browse').attr('disabled', true);
            $('#settings_instead_command_detect').attr('disabled', true);
            $('#settings_instead_command').attr('readonly', true);
        } else {
            $('#settings_instead_command_use_builtin').attr('aria-pressed', 'false');
            $('#settings_instead_command_use_builtin').removeClass('active');
            $('#settings_instead_command_browse').attr('disabled', false);
            $('#settings_instead_command_detect').attr('disabled', false);
            $('#settings_instead_command').attr('readonly', false);
        }
    }
};

$('#settings').click(function () {
    manager.configurator.read();
    $('#settings_instead_command').val(manager.configurator.getInterpreterCommand());

    var canUseBuiltInInterpreter = manager.configurator.canUseBuiltInInterpreter();
    SettingsGui.settingsChangeBuiltInInterpreter(canUseBuiltInInterpreter);
    if (!canUseBuiltInInterpreter && !manager.configurator.interpreterFinder.isAvailableBuiltIn()) {
        $('#settings_instead_command_use_builtin').hide();
    }

    $('#settings_instead_command_help').html("&nbsp;");

    var availableLanguages = manager.configurator.getAvailableLanguages();
    $("#settings_lang").html('');
    availableLanguages.forEach(function (lang) {
        $("#settings_lang").append($('<option>', {value: lang.lang, text: lang.title}));
    });
    var lang = manager.configurator.getLang();
    if (!lang || 0 == lang.length) {
        lang = manager.configurator.defaultLang;
    }
    $('#settings_lang').val(lang);

    $('#settings_check_update_on_start').prop('checked', manager.configurator.canCheckUpdateOnStart());

    $('#settings_dialog').modal('show');
});

$('#settings_instead_command_use_builtin').click(function () {
    var here = this;
    setTimeout(function () {
        SettingsGui.settingsChangeBuiltInInterpreter('true' == $(here).attr('aria-pressed'));
    }, 100);

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

    var interpreterCommand = $('#settings_instead_command').val();
    if ('true' == $('#settings_instead_command_use_builtin').attr('aria-pressed')) {
        interpreterCommand = manager.configurator.interpreterFinder.getBuiltInPath();
    }

    manager.interpreterFinder.checkInterpreter(interpreterCommand, function (version) {
        if (false !== version) {
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

    console.log($('#settings_instead_command_use_builtin').attr('aria-pressed'));

    manager.configurator.setInterpreterPath($('#settings_instead_command').val());
    manager.configurator.setUseBuiltInInterpreter('true' == $('#settings_instead_command_use_builtin').attr('aria-pressed'));
    manager.configurator.setLang($('#settings_lang').val());
    manager.configurator.setCheckUpdateOnStart($('#settings_check_update_on_start').prop('checked'));
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
    ManGui.showUpdateChecking(false, function() {
        $btn.button('reset');
    });
});
