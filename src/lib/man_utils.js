"use strict";

module.exports = {
    /**
     * Examples:
     * compareVersions('1.2.0', '==', '1.2'); // true
     * compareVersions('00001', '==', '1.0.0'); // true
     * compareVersions('1.2.0', '<=', '1.2'); // true
     * compareVersions('2.2.0', '<=', '1.2'); // false
     *
     * @see: http://stackoverflow.com/a/20095486
     * @param {string} v1
     * @param {string} comparator
     * @param {string} v2
     * @returns {boolean|null}
     */
    compareVersions: function(v1, comparator, v2) {
        if (!v1 || !v2) {
            return null;
        }

        comparator = comparator == '=' ? '==' : comparator;
        var v1parts = v1.split('.'), v2parts = v2.split('.');
        var maxLen = Math.max(v1parts.length, v2parts.length);
        var part1, part2;
        var cmp = 0;
        for (var i = 0; i < maxLen && !cmp; i++) {
            part1 = parseInt(v1parts[i], 10) || 0;
            part2 = parseInt(v2parts[i], 10) || 0;
            if (part1 < part2) {
                cmp = 1;
            }

            if (part1 > part2) {
                cmp = -1;
            }
        }
        return eval('0' + comparator + cmp);
    },

    /**
     * @see: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
     *
     * @param str
     * @returns {string}
     */
    escapeRegExp: function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
};
