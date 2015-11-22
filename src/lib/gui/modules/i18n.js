"use strict";

module.exports = {
    translate: null,

    translateAll: function(i18nData) {
        this.translate = i18nData.i18n;
        var i18nAttributes = [
            {id: 'filter_keyword', attr: 'placeholder'},
            {id: 'filter_repository', attr: 'data-label'},
            {id: 'filter_language', attr: 'data-label'},
            {id: 'repository_update', attr: 'data-loading-text'},
            {id: 'game_install', attr: 'data-loading-text'},
            {id: 'game_update', attr: 'data-loading-text'},
            {id: 'game_confirm_delete', attr: 'data-loading-text'},
            {id: 'settings_save', attr: 'data-loading-text'},
            {id: 'settings_about_check_update', attr: 'data-loading-text'},
            {id: 'game_info_external', attr: 'title'},
            {id: 'filter_reset', attr: 'title'},
            {id: 'settings_instead_command_help', attr: 'data-detected-ok-text'},
            {id: 'settings_instead_command_help', attr: 'data-detected-fail-text'},
            {id: 'settings_instead_command_help', attr: 'data-tested-ok-text'},
            {id: 'settings_instead_command_help', attr: 'data-tested-fail-text'},
            {id: 'settings_instead_command', attr: 'placeholder'}
        ];

        var here = this;
        $('.i18n').each(function () {
            var key = ($(this).html().trim());
            if (here.translate[key]) {
                $(this).html(here.translate[key]);
            }
        });
        i18nAttributes.forEach(function (i18nItem) {
            var $el = $('#' + i18nItem.id);
            if ($el.length < 1) {
                return;
            }

            var key = $el.attr(i18nItem.attr);
            if (!here.translate[key]) {
                return;
            }

            $el.attr(i18nItem.attr, here.translate[key]);
        });
    },

    t: function(key) {
        if (!this.translate[key]) {
            return key;
        }

        return this.translate[key];
    }
};
