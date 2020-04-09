(function ($) {
    $.fn.CustomMenu = function (option) {
        var defaultSettings = {
            millisecond: 500,
            buttonAppendDiv: '',
            menuDiv:''
        };
        var settings = $.extend(defaultSettings, option);

        return this.each(function () {
            AppendButton();
            $(settings.buttonAppendDiv).on("click", "#btn-menu", function () {
                var isOpen = $(this).hasClass("open");
                var menuValue = isOpen ? "-210px" : "0px";
                var pageValue = isOpen ? '5px' : '205px';
                var btnValue = isOpen ? '0px' : '200px';
                $(settings.menuDiv).animate({
                    "margin-left": menuValue
                }, settings.millisecond, function () {
                    $("#btn-menu").find("i").toggleClass("fa-angle-left").toggleClass("fa-angle-right");
                    $("#btn-menu").toggleClass("open");
                });
                $("#page-wrapper").animate({
                    "margin-left": pageValue
                }, settings.millisecond);
                $("#btn-menu").animate({
                    "left": btnValue
                }, settings.millisecond);
            });
            //$(window).resize(function () {
            //    $("#page-wrapper").removeAttr('style');
            //    $(settings.menuDiv).removeAttr('style');
            //    $("#btn-menu").find("i").removeClass("fa-angle-right").addClass("fa-angle-left");
            //    $("#btn-menu").removeAttr('style').addClass('open');
            //});
        });

        function AppendButton() {
            $(settings.buttonAppendDiv).append('<div id="btn-menu" class="text-center open"><i class="fa fa-angle-left"></i></div>');
        }
    }
})(jQuery);
