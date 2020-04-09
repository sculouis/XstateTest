/*!
 * Bootstrap-select-search v0.1 By Nick
 */
(function ($) {
    $.fn.SetKeyinFunction = function (option) {
        var _defaultSetting = {
            waitTime: 1000,
            loadingText: 'Loading...',
            func: function (e) {
                console.log($(e).val());
            }
        };
        var _setting = $.extend(_defaultSetting, option);
        return this.each(function () {
            var flag = false;
            $(this).closest(".btn-group.bootstrap-select").find('input').on('keyup', function (e) {
                if (e.which == 40 || e.which == 38) { return; } //按[上][下]鍵選擇內容時，不做處理
                var thisInput = $(this);
                var select = thisInput.closest(".btn-group.bootstrap-select").find('select');
                $(select).empty().append("<option value=''>請選擇</option>").selectpicker('refresh');
                var title = thisInput.closest(".btn-group.bootstrap-select").find('.popover-title');
                title.html(_setting.loadingText);
                if (flag) {
                    return;
                }
                flag = true;
                setTimeout(function () {
                    flag = false;
                    _setting.func(thisInput, select, title);
                }, _setting.waitTime);
            });
        });
    };
})(jQuery);


/*!
 * Bootstrap-select v1.12.4 (https://silviomoreto.github.io/bootstrap-select)
 *
 * Copyright 2013-2017 bootstrap-select
 * Licensed under MIT (https://github.com/silviomoreto/bootstrap-select/blob/master/LICENSE)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define(["jquery"], function (a0) {
            return (factory(a0));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(root["jQuery"]);
    }
}(this, function (jQuery) {

    (function ($) {
        $.fn.selectpicker.defaults = {
            noneSelectedText: '沒有選取任何項目',
            noneResultsText: '沒有找到符合的結果',
            countSelectedText: '已經選取{0}個項目',
            maxOptionsText: ['超過限制 (最多選擇{n}項)', '超過限制(最多選擇{n}組)'],
            selectAllText: '選取全部',
            deselectAllText: '全部取消',
            multipleSeparator: ', '
        };
    })(jQuery);
}));