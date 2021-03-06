﻿

$(window).load(function () {
    //畫面完全載入後關閉BlockUi
    setTimeout($.unblockUI, 100);
})

//註冊-當有兩個Modal的時候，讓第二個Modal的Mask正常疊在第一個Modal上
$(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});

//補捉所有js事件
window.onerror = function (messageOrEvent, source, lineno, colno, error) {
    $.unblockUI();
    MsgBox('錯誤', error, 'red', null)
};

$(document).ready(function () {
    //解決提示訊息無法關閉事件
    $('body').on('blur', '[data-toggle="tooltip"]', function () {
        var nextObj = $(this).next();
        if (nextObj.hasClass('tooltip')) {
            nextObj.remove();
        }
    });

    //$("body").on("click", '.tooltip', function () {
    //    $(this).remove();
    //});
    //檢查路徑來初始化選單
    //var sUrlPath = window.location.href;
    //if (sUrlPath.toUpperCase().indexOf('QUOT') < 0) {
    //    $('#menu').hide();    //選單隱藏
    //    $('#page-wrapper').attr('style', 'margin:0 0 0 0;');    //邊框填滿//margin
    //} else {
    //    $('#menu').CustomMenu({
    //        buttonAppendDiv: '.content-main',
    //        menuDiv: '#menu'
    //    });
    //}

    //產生表單收合的icon
    $('#menu').CustomMenu({
        buttonAppendDiv: '.content-main',
        menuDiv: '#menu'
    });

    BlockUI();
    setTimeout(function () {
        //$(window).bind('beforeunload', function (e) {
        //     //暫時關閉
        //    //UnLockAS400(false);
        //    return '請確認是否不送出存檔直接離開?';
        //})
        $('[data-toggle="tooltip"]').tooltip();

        $('.panel-heading:not(div[data-checkbox="Y"])').css("cursor", "pointer");
        $('.panel-heading').prepend('<i class="fa fa-angle-double-down" ></i>');
        $('.panel-heading:not(div[data-checkbox="Y"])').click(function () {
            var Class = $(this).find('i').attr('class');
            if (Class == "fa fa-angle-double-down")
                $(this).find('i').removeClass().addClass('fa fa-angle-double-up')
            else
                $(this).find('i').removeClass().addClass('fa fa-angle-double-down')
        })
        $('input').attr('placeholder', function () { return $(this).prev('span').text().replace('＊', ''); });
        $('input').attr('autocomplete', 'off');


        //註冊_點擊panel-heading可摺疊panel_body
        $('.panel-heading:not(div[data-checkbox="Y"])').click(function () {
            $(this).next('.panel-body').toggle(200);
        })

        //註冊_輸入完自動加千分位(金額)
        $(".comma").AddComma();

        //註冊_輸入完自動加千分位(數字)
        $(".num").AddComma(true);

        //註冊_輸入完自動加千分位
        $(".int").IntOnly();

        //註冊_電話格式
        $('.tel').TelForm();

        //註冊_自動移到最上面
        scroller.init();

        //註冊_ToolTip
        //BindingToolTip();

        //$(document).ajaxStart(function () { $.blockUI({ message: '處理中，請稍後', }) })
        //$(document).ajaxStop(function () { $.unblockUI(); })

        //註冊_展出側邊選單
        $('#side-menu').metisMenu({
            toggle: true,
            activeClass: 'active'
        });

        //註冊-產生報表
        if ($('#btnPrint') != undefined) {
            $('body').append('<div class="modal fade" id="divReport" role="dialog">\
                        <div class="modal-dialog modal-lg">\
                            <div class="modal-content">\
                                <div class="modal-header">\
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>\
                                    <h4 class="modal-title">報表列印</h4>\
                                </div>\
                                <div style="margin-left:5px;">\
                                    <div class="col-lg-12">\
                                        <iframe class="embed-responsive-item" frameborder="0" scrolling="no"></iframe>\
                                    </div>\
                                </div><!-- /.modal-content -->\
                            </div><!-- /.modal-dialog -->\
                        </div><!-- /.modal -->\
                      </div>')

            $('#divReport').attr('width', "75%");
            $('#divReport').find("iframe").attr('width', "100%");
            $('#divReport').find("iframe").attr('height', "640px");

        }

        //註冊轉大寫事件 keyup event to UpperCase
        $(document).on('keyup', '.upperCase', function () {
            var result = this.value.match(/^.*[a-z]+.*$/);
            if (result != null) {
                this.value = this.value.toUpperCase();
            }
        });

        //轉大寫
        $.fn.UpperCase = function () {
            this.keyup(function () {
                $(this).val(this.value.toUpperCase());
            });
        };

        //註冊轉半形英數為全型
        $(document).on('blur', '.hftofl', function () {
            this.value = halfToFull(this.value);
        });

        //註冊轉全形英數為半型
        $('.fltohf').on('blur', function () {
            this.value = fullToHalf(this.value);
        });

        $.urlParam = function (name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results == null) {
                return null;
            }
            else {
                return decodeURI(results[1]) || 0;
            }
        }

        //jquery 擴充函式[序列化 form object to json]
        $.fn.serializeObject = function () {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };

        $(function () {
            $(window).bind("load resize", function () {
                var topOffset = 50;
                var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
                if (width < 768) {
                    $('div.navbar-collapse').addClass('collapse');
                    topOffset = 100; // 2-row-menu
                } else {
                    $('div.navbar-collapse').removeClass('collapse');
                }

                var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
                height = height - topOffset;
                if (height < 1) height = 1;
                if (height > topOffset) {
                    $("#page-wrapper").css("min-height", (height) + "px");
                }
            });

            var url = window.location;
            var element = $('ul.nav a').filter(function () {
                return this.href == url;
            }).addClass('active').parent().parent().addClass('in').parent();
            var element = $('ul.nav a').filter(function () {
                return this.href == url;
            }).addClass('active').parent();

            while (true) {
                if (element.is('li')) {
                    element = element.parent().addClass('in').parent();
                } else {
                    break;
                }
            }
        });
    }, 50)
    ////鎖右鍵
    //$(this).bind("contextmenu", function (e) {
    //    e.preventDefault();
    //});
});

// 計算本字串byte數
// (return: 純數值)
String.prototype.Blength = function () {
    var arr = this.match(/[^\x00-\xff]/ig);
    return arr == null ? this.length : this.length + arr.length;
};

// 檢查字元byte數(TextBox, TextArea用)是否超過，必需有設定maxLength
// (obj: 要檢查的文字輸入元件)
// (return: true(已超過) / false(未超過))
function checkCLength(obj) {
    return (obj.value.Blength() <= obj.maxLength);
}

// 限制字元byte數(TextBox, TextArea用)，必需有設定maxLength
// (obj: 要限制的文字輸入元件, needAlert: 刪除過長字元時是否警告, checkMethod: 檢核字元數的函式，預設為checkCLength)
// (return: true(有刪除字元) / false(未刪除字元))
function limitCLength(obj, needAlert, checkMethod) {
    var result = false;
    if (checkMethod == undefined) {
        checkMethod = checkCLength; // 可依自訂規則計算字元數
    }
    var count = 0;
    if (obj.value.indexOf("<") >= 0) {
        obj.value = obj.value.replace(/\</ig, "＜");
    }
    if (obj.value.indexOf(">") >= 0) {
        obj.value = obj.value.replace(/\>/ig, "＞");
    }
    if (obj.maxLength > -1 && !checkMethod(obj)) {
        focus(); // 用新注音輸入且同時變更obj.value時會導致新注音將欄位原內容清空，為避免此問題先將焦點移開使該欄的新注音輸入中狀態失效，再刪除多餘的字
        $(obj).focus(); // 恢復理應在該欄上的焦點，此時已經不會再受新注音影響
        obj.value = obj.value.substring(0, obj.maxLength); // 大量刪除
        result = true;
    }
    while (obj.maxLength > -1 && !checkMethod(obj) && count < obj.maxLength) {
        focus();
        $(obj).focus();
        obj.value = obj.value.substring(0, obj.value.length - 1); // 字數微調
        ++count;
        result = true;
    }
    if (result && (needAlert == undefined || needAlert == true)) {
        alert('過長字元已被刪除');
    }
    return result;
}

function BlockUI(Message) {
    Message = Message == undefined ? "處理中..." : Message
    //註冊_畫面鎖定
    if (DetectMoible())
        $.blockUI({
            message: Message,
            css: {
                border: 'none',
                padding: '15px',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: .5,
                color: '#fff',
                margin: 0,
                width: '50%',
                top: '40%',
                left: '25%',
                textAlign: 'center',
                cursor: 'wait',
                'z-index' :10000
            },
        })
    else {
        $.blockUI({ message: Message })

    }
    setTimeout(function () {
        var ss = '';
    }, 1000)
}

/* 左邊補0 */
function padLeft(str, len) {
    str = '' + str;
    return str.length >= len ? str : new Array(len - str.length + 1).join("0") + str;
}

/* 右邊補0 */
function padRight(str, len) {
    str = '' + str;
    return str.length >= len ? str : str + new Array(len - str.length + 1).join("0");
}

/* 加千分號 */
function comma(e) {
    if (isInt(date)) {
        e.value = e.value.replace(/,/g, '.')
    }
}

/* 註冊_日曆功能 */
function RegFormDatetime(obj) {
    if (obj == undefined) {
        obj = ".form_datetime";
    }
    setTimeout(function () {
        $(obj).datetimepicker({
            language: 'zh-TW',
            format: "yyyy年mm月dd日hh時",
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            clearBtn: true,
            minView: 1,
            forceParse: 0,
            allowInputToggle: true
        })
    }, 200)
    //避免手機彈出KeyBoard
    $(obj).focus(function () {
        if (DetectMoible()) {
            $(this).blur();     //手機會分不清是要用選還Key的，所以避免手機彈出KeyBoard
        } else {
            ShowMsgInElm(this, "請點選日曆或輸入年月日時共十碼", false);
            //$(this).select();
            //$(this).data("datetimepicker").update($(this).val()); //將值設定回日曆
        }
    })
    $(obj).blur(function () {
        var strDate = $(this).val();
        if (strDate.length == 10 && strDate.indexOf("年") == -1) {
            strDate = strDate.substring(0, 4) + "年" + strDate.substring(4, 6) + "月" + strDate.substring(6, 8) + "日" + strDate.substring(8, 10) + "時";
            $(this).val(strDate);
            $(this).data("datetimepicker").update(strDate); //將值設定回日曆
        }
        else if (strDate == "") {
            $(this).val("");
            ShowMsgInElm(this, "請點選日曆或輸入年月日時共十碼", false);
        }
    });
    setTimeout(function () {
        $('.glyphicon-arrow-left').parent().append('<i class="fa fa-angle-double-left" aria-hidden="true"></i>');
        $('.glyphicon-arrow-left').remove();
        $('.glyphicon-arrow-right').parent().append('<i class="fa fa-angle-double-right" aria-hidden="true"></i>');
        $('.glyphicon-arrow-right').remove();
    }, 1000)
}

function RegFormDate() {
    setTimeout(
        function () {
            $('.form_date').datetimepicker({
                language: 'zh-TW',
                format: "yyyy/mm/dd",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                clearBtn: true,
                minView: 2,
                forceParse: 0,
                allowInputToggle: true
            })
        }, 200)

    //避免手機彈出KeyBoard
    $('.form_date').focus(function () {
        ShowMsgInElm(this, "請點選日曆或輸入年月日共八碼", false);
        if (DetectMoible()) {
            $(this).blur();
        } else {
            $(this).select();
            $(this).data("datetimepicker").update($(this).val()); //將值設定回日曆
        }
    })
    $('.form_date').blur(function () {
        var strDate = $(this).val();
        if (strDate.length == 6 && strDate.indexOf("/") == -1) {
            strDate = parseInt(strDate.substring(0, 2)) + 1911 + "/" + strDate.substring(2, 4) + "/" + strDate.substring(4, 6);
            $(this).val(strDate);
            $(this).data("datetimepicker").update(strDate); //將值設定回日曆
        }
        if (strDate.length == 7 && strDate.indexOf("/") == -1) {
            strDate = parseInt(strDate.substring(0, 3)) + 1911 + "/" + strDate.substring(3, 5) + "/" + strDate.substring(5, 7);
            $(this).val(strDate);
            $(this).data("datetimepicker").update(strDate); //將值設定回日曆
        }
        else if (strDate.length == 8 && strDate.indexOf("/") == -1) {
            strDate = strDate.substring(0, 4) + "/" + strDate.substring(4, 6) + "/" + strDate.substring(6, 8);
            $(this).val(strDate);
            $(this).data("datetimepicker").update(strDate); //將值設定回日曆
        }
            //else if (strDate.length == 10 && strDate.indexOf("/") != -1) {//20180825 ADD BY WS-MICHAEL 可以輸入10碼日期格式
            //    $(this).data("datetimepicker").update(strDate); //將值設定回日曆
            //}
        else {
            var val = $(this).val();
            $(this).val(isNaN(Number(val.replace(/\//g, ""))) ? "" : val);
            ShowMsgInElm(this, "請點選日曆或輸入年月日共八碼", false);
        }
    });
    $('.form_date').keydown(function (e) {
        //8:backspace, 9:tab, 46:delete 110:小數點, 109:負號, 48~57:數字1-9, 37:方向鍵左, 39:方向鍵右
        if (e.which != 8 && e.which != 9 && e.which != 46 && e.which != 109
            && e.which != 229 && e.which != 13 && e.which != 0
            && (e.which < 48 || (e.which > 57 && e.which < 96) || e.which > 105)) {
            return false;
        }
    });

    setTimeout(function () {
        $('.glyphicon-arrow-left').parent().append('<i class="fa fa-angle-double-left" aria-hidden="true"></i>');
        $('.glyphicon-arrow-left').remove();
        $('.glyphicon-arrow-right').parent().append('<i class="fa fa-angle-double-right" aria-hidden="true"></i>');
        $('.glyphicon-arrow-right').remove();
    }, 1000)
}

function RegFormMonth() {

    setTimeout(
        function () {
            $('.form_date_month').datetimepicker({
                language: 'zh-TW',
                format: "yyyy/mm",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 3,
                clearBtn: true,
                minView: 3,
                forceParse: 0,
                allowInputToggle: true
            })
        }, 200)

    //避免手機彈出KeyBoard(年度/年月)
    $('.form_date_month').focus(function () {
        var isWindows = navigator.userAgent.match(/Windows/i)
        if (!isWindows) {
            $(this).blur();
        }
    })

    //年月輸入框_焦點離開事件
    $('.form_date_month').blur(function () {
        var strDate = $(this).val();
        if (strDate.length > 0) {
            if (strDate.length == 4 && strDate.indexOf("/") == -1) {
                strDate = parseInt(strDate.substring(0, 2)) + 1911 + "/" + strDate.substring(2, 4);
                $(this).val(strDate);
                $(this).data("datetimepicker").update(strDate); //將值設定回日曆
            } else if (strDate.length == 5 && strDate.indexOf("/") == -1) {
                strDate = parseInt(strDate.substring(0, 3)) + 1911 + "/" + strDate.substring(3, 5);
                $(this).val(strDate);
                $(this).data("datetimepicker").update(strDate); //將值設定回日曆
            } else if (strDate.length == 6 && strDate.indexOf("/") == -1) {
                strDate = strDate.substring(0, 4) + "/" + strDate.substring(4, 6);
                $(this).val(strDate);
                $(this).data("datetimepicker").update(strDate); //將值設定回日曆
            }
        }
    })

    setTimeout(function () {
        $('.glyphicon-arrow-left').parent().append('<i class="fa fa-angle-double-left" aria-hidden="true"></i>');
        $('.glyphicon-arrow-left').remove();
        $('.glyphicon-arrow-right').parent().append('<i class="fa fa-angle-double-right" aria-hidden="true"></i>');
        $('.glyphicon-arrow-right').remove();
    }, 1000)
}

function RegFormYear() {

    setTimeout(
        function () {
            $('.form_date_year').datetimepicker({
                language: 'zh-TW',
                format: "yyyy",
                autoclose: 1,
                startView: "decade",
                viewMode: "years",
                minView: 4,
                forceParse: 0,
                clearBtn: true,
                allowInputToggle: true
            })
        }, 200)

    //年月輸入框_焦點離開事件
    $('.form_date_year').blur(function () {
        var strDate = $(this).val();
        if (strDate.length > 0) {
            if (strDate.length == 3 || strDate.length == 2) {
                strDate = parseInt(strDate.substring(0, 3)) + 1911;
                $(this).val(strDate);
                $(this).data("datetimepicker").update(strDate); //將值設定回日曆
            }
        }
    })
    //避免手機彈出KeyBoard(年度/年月)
    $('.form_date_year').focus(function () {
        var isWindows = navigator.userAgent.match(/Windows/i)
        if (!isWindows) {
            $(this).blur();
        }
    })
    setTimeout(function () {
        $('.glyphicon-arrow-left').parent().append('<i class="fa fa-angle-double-left" aria-hidden="true"></i>');
        $('.glyphicon-arrow-left').remove();
        $('.glyphicon-arrow-right').parent().append('<i class="fa fa-angle-double-right" aria-hidden="true"></i>');
        $('.glyphicon-arrow-right').remove();
    }, 1000)
}

/* 註冊_下拉日曆選單 */
function RegSelectDate() {
    $('.form_selDate').each(function (e) {
        var obj = $(this);
        var objNM = obj.attr("id").replace('ipt', '');
        var isReq = ($(this)[0].attributes.required != undefined) ? 'required' : '';    //是否為必填欄位
        var isTWYear = getObjToVal(obj.attr("isTWYear"));           //是否為民國年
        var maxYear = parseInt(getObjToVal(obj.attr("maxYear")));   //最大年份
        var minYear = parseInt(getObjToVal(obj.attr("minYear")));   //最小年份
        var nowDate = new Date();                                   //系統時間
        var nowYear = nowDate.getFullYear();                        //系統年
        var iSNum = 0, iENum = 0;                                   //迴圈起迄
        //--[年份]處理-------------------------------------
        maxYear = isNaN(maxYear) ? 10 : maxYear;                    //最大年份(預設值後10年)
        minYear = isNaN(minYear) ? -10 : minYear;                   //最小年份(預設值前10年)
        iSNum = nowYear + minYear; iENum = nowYear + maxYear;       //起迄設定
        var sYearHtml = '<option value="">年</option>'
        for (var i = iENum; i >= iSNum; i--) {      //降冪排序
            sYearHtml += '<option value="' + i + '">' + (i - (isTWYear == 'Y' ? 1911 : 0)) + '</option>'
        };
        //--[月份]處理-------------------------------------
        iSNum = 1; iENum = 12;
        var sMonthHtml = '<option value="">月</option>'
        for (var i = iSNum; i <= iENum; i++) {    //升冪排序
            sMonthHtml += '<option value="' + i + '">' + i + '</option>'
        };
        //--[html語法組合]處理---------------------------
        var sAddonStyle = ' style="width: 0px; padding: 0px; font-size: 0px; border: 0" ';   //style縮小設定(不能設定隱藏，版面會跑掉)
        var str = ', \'' + obj.attr("id") + '\'';     //輸入參數
        var html = '';
        html += '<span class="input-group-addon" ' + sAddonStyle + ' ></span>';
        html += '<select id="sel' + objNM + 'Y" class="form-control" style="padding-left:5px; min-width:75px !important;" onChange="selDateChange(\'Y\'' + str + ');" ' + isReq + '>' + sYearHtml + '</select>';
        html += '<span class="input-group-addon" ' + sAddonStyle + '></span>';
        html += '<select id="sel' + objNM + 'M" class="form-control" style="padding-left:5px; min-width:57px !important;" onChange="selDateChange(\'M\'' + str + ');" ' + isReq + '>' + sMonthHtml + '</select>';
        html += '<span class="input-group-addon" ' + sAddonStyle + '></span>';
        html += '<select id="sel' + objNM + 'D" class="form-control" style="padding-left:5px; min-width:57px !important;" onChange="selDateChange(\'D\'' + str + ');" ' + isReq + '></select>';
        obj.hide().parent().append(html);       //隱藏輸入框，並產生[年][月][日]下拉選單
        ///obj.parent().append(html);  //test
        RegSelectDate.InitDaySelect(objNM);     //初始化[日期]欄位
    });
    $('.form_selDate').blur(function () {   //日期欄位設定後，須執行blur()事件，更新回下拉選單
        selDateChange('T', $(this).attr("id"));
    });
};
// 下拉日曆-初始化日期
RegSelectDate.InitDaySelect = function (objNM) {
    var objDay = $('#sel' + objNM + 'D');
    var valYear = parseInt(getObjToVal($('#sel' + objNM + 'Y').val()));
    var valMonth = parseInt(getObjToVal($('#sel' + objNM + 'M').val()));
    var valDay = parseInt(getObjToVal(objDay.val()));
    objDay.empty();    //清空下拉內容
    objDay.append('<option value="">日</option>');
    if (!isNaN(valYear) && !isNaN(valMonth)) {
        var iSNum = 1;
        var iENum = new Date(valYear, valMonth, 0).getDate();
        var sHtml = '';
        for (var i = iSNum; i <= iENum; i++) {      //降冪排序
            sHtml += '<option value="' + i + '">' + i + '</option>'
        };
        objDay.append(sHtml);
        if (!isNaN(valDay)) {
            objDay.val(valDay);
        };
    }
};
/* 下拉日曆-選單事件 */
function selDateChange(type, tagObjNM) {
    var objNM = tagObjNM.replace('ipt', '');
    var objYear = $('#sel' + objNM + 'Y');
    var objMonth = $('#sel' + objNM + 'M');
    var objDay = $('#sel' + objNM + 'D');
    if (type === 'T') {     //Text設定val().blur()事件(需要先將值設定，再觸發blur()事件，將值更新回下拉選單)
        var valdate = $('#' + tagObjNM).val();
        if (checkdate(valdate)) {
            var dateObj = new Date(valdate);        //將值更新回下拉選單
            objYear.val(dateObj.getFullYear());     //更新[年份]
            objMonth.val(getObjToVal(objYear.val()) == '' ? '' : dateObj.getMonth() + 1);   //更新[月份]
            RegSelectDate.InitDaySelect(objNM);     //初始化天數
            objDay.val(dateObj.getDate());          //更新[日期]
            if (objYear.val() == null) { $('#' + tagObjNM).val('').blur(); };   //若載入後的年份為NULL值，則清空(例如:選單只能選2018~2020，但是來源為2017年，所以會造成null)
        } else {
            objYear.val('');
            objMonth.val('');
            objDay.val('');
        };
    }
    else {
        var valYear = parseInt(getObjToVal(objYear.val()));
        var valMonth = parseInt(getObjToVal(objMonth.val()));
        var valDay = parseInt(getObjToVal(objDay.val()));
        if (type === 'Y' && isNaN(valYear)) {
            $('#sel' + objNM + 'M, #sel' + objNM + 'D').val('');    //若[年份]選擇"空白"，則清空[月][日]
        };
        if (type === 'Y' || type === 'M') {
            RegSelectDate.InitDaySelect(objNM);     //初始化天數
        };
        //組合日期格式，並寫回TEXT
        var valDate = valYear + '/' + padLeft(valMonth, 2) + '/' + padLeft(valDay, 2);
        if ($('#' + tagObjNM).val() == '' && !checkdate(valDate)) { }
        else {
            $('#' + tagObjNM).val(checkdate(valDate) ? valDate : '').change();
        };
    };
};

/* 註冊_下拉年曆選單 */
function RegSelectDateYear() {
    $('.form_selDateYear').each(function (e) {
        var obj = $(this);
        var isTWYear = getObjToVal(obj.attr("isTWYear"));           //是否為民國年
        var maxYear = parseInt(getObjToVal(obj.attr("maxYear")));   //最大年份
        var minYear = parseInt(getObjToVal(obj.attr("minYear")));   //最小年份
        var nowDate = new Date();                                   //系統時間
        var nowYear = nowDate.getFullYear();                        //系統年
        var iSNum = 0, iENum = 0;                                   //迴圈起迄
        //--[年份]處理-------------------------------------
        maxYear = isNaN(maxYear) ? 10 : maxYear;                    //最大年份(預設值後10年)
        minYear = isNaN(minYear) ? -10 : minYear;                   //最小年份(預設值前10年)
        iSNum = nowYear + minYear; iENum = nowYear + maxYear;       //起迄設定
        var sYearHtml = '<option value="">年</option>'
        for (var i = iENum; i >= iSNum; i--) {      //降冪排序
            sYearHtml += '<option value="' + i + '">' + (i - (isTWYear == 'Y' ? 1911 : 0)) + '</option>'
        };
        obj.append(sYearHtml);
    });
};
/* 註冊_下拉月份選單 */
function RegSelectDateMonth() {
    $('.form_selDateMonth').each(function (e) {
        var obj = $(this);
        var iSNum = 1, iENum = 12;                                   //迴圈起迄
        var sHtml = '<option value="">月</option>'
        for (var i = iSNum; i <= iENum; i++) {    //升冪排序
            sHtml += '<option value="' + i + '">' + i + '</option>'
        };
        obj.append(sHtml);
    });
};

/* 註冊_selectpicker tab 鍵時自動選取當前值 */
function BindSelpikTabEvent() {
    $('body').on('blur', '.bs-searchbox input', function (e) {
        let ulObj = $(this).parent().next();
        let liItem = ulObj.find('li');
        let selItem = $(this).parent().parent().next().find('option');
        var objddl = '#' + $(this).parent().parent().next().attr('id');
        liItem.each(function (index, element) {
            if ($(this).prop('class').indexOf('active') >= 0) {
                let selItemTextArr = $(selItem[index]).text().split(' - ');
                BindSelpikTabEvent.spkVal = $(selItem[index]).val() + '~|~' + (selItemTextArr.length == 2 ? selItemTextArr[1] : selItemTextArr[0]);
            }
        });

        if (ulObj.attr('aria-expanded') == 'false') {
            if (BindSelpikTabEvent.spkVal != '') {
                var sVal = BindSelpikTabEvent.spkVal.split('~|~');
                if (sVal !== null && sVal.length == 2) {
                    if (sVal[0] != sVal[1]) {
                        sVal[1] = sVal[1].replace(sVal[0] + "-", "");                                              
                    }  
                    setSelPick(objddl, [{ VALUE: sVal[0], TEXT: sVal[1] }], sVal[0], (sVal[0] == sVal[1]));
                }
            }
        }       
    })
}
BindSelpikTabEvent.spkVal = '';

/*註冊_電話格式*/
$.fn.TelForm = function () {
    var reg = /[0-9-#]/;
    this.css("ime-mode", "disabled");   //關閉輸入法(Chrome不適用)
    this.keypress(function (e) {        //限制打入非[0-9-#]號
        return reg.test(e.key);
    }).blur(function () {
    }).bind("paste", function (e) {     //限制貼上非[0-9-#]號
        if (DetectIE()) {
            return reg.test(window.clipboardData.getData("Text"));
        } else {
            return reg.test(e.originalEvent.clipboardData.getData('text/plain'));
        };
    });
};

/*自動加上千分號(金額/數字)*/
$.fn.AddComma = function (isNum) {
    //先將全形數字轉型為半形
    if (this.value != undefined)
        this.value = fullToHalf(this.value);
    //靠右
    $(this).IntOnly();
    this.css("text-align", "right");
    this.focus(function () {
        //當獲得focus時，要把千分位給拿掉 
        $(this).val(RemoveComma($(this).val()));
        $(this).select();
    }).blur(function () {
        //(金額)若欄位為空，自動設為0
        if (!isNum) {
            if (this.value == "") $(this).val(0);
        }
        //離開後加入千分位
        $(this).val(Comma($(this).val(), isNum));
    });
};

/*判斷_是否為數字*/
$.fn.IntOnly = function IntOnly() {
    //讓控制項只能輸入數字
    $(this).keydown(function (e) {
        //8:backspace, 9:tab, 46:delete 110:小數點, 109:負號, 48~57:數字1-9, 37:方向鍵左, 39:方向鍵右
        if (e.which != 8 && e.which != 9 && e.which != 46 && e.which != 109 && e.which != 110
            && e.which != 229 && e.which != 13 && e.which != 0 && e.which != 37 && e.which != 39
            && (e.which < 48 || (e.which > 57 && e.which < 96) || e.which > 105)) {
            //顯示訊息,並於1.5秒後自動消失
            ShowMsgInElm('#' + this.id, '只能輸入數字', true)
            return false;
        }
    });
    if (DetectMoible())
        $(this).blur(function (e) {
            if (!isInt($(this).val())) {
                //顯示訊息,並於1.5秒後自動消失
                ShowMsgInElm('#' + this.id, '只能輸入數字', true)
                $(this).val('');
                return false;
            }
        });
}

/*判斷_是否為刪除鍵*/
function DelKey(Em) {
    $(Em).keypress(function (e) {
        if (e.which == 46) {
            return true;
        }
    });
}

/*判斷_是否為IE*/
function DetectIE() {

    if (navigator.userAgent.match(/msie/i) || navigator.userAgent.match(/trident/i)) {
        return true;
    }
    else {
        return false;
    }
}

/*判斷_是否為手機*/
function DetectMoible() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}

/*判斷_是否為數字*/
function isInt(value) {
    return !isNaN(value) && (function (x) { return (x | 0) === x; })(parseFloat(value))
}

/*判斷_是否為英數*/
function CheckEnDigiVal(str) {
    var regExp = /^[\d|a-zA-Z]+$/;
    if (regExp.test(str))
        return true;
    else
        return false;
}

/*顯示-訊息在物件下方*/
function ShowMsgInElm(Elm, Msg, AutoDisplay) {
    var tempTitle = '';
    var tempOriginalTitle = '';
    //尚未綁定tooltip 綁定tooltip
    if ($(Elm).attr("data-toggle") != "tooltip") {
        if (getObjToVal($(Elm).attr('class')).indexOf('form_selDate') > -1) {    //如果有套用日期選單，則顯示在[年]的下拉選單上
            Elm = "#" + $(Elm).parent().find('select').attr('id');
        };
        $(Elm).attr('data-toggle', 'tooltip');
        $(Elm).attr('data-html', true);
        $(Elm).attr('title', Msg);
        $(Elm).attr('data-original-title', Msg);
    }
    else {
        //已經綁定tooltip 暫存原訊息
        tempTitle = $(Elm).attr('title');
        tempOriginalTitle = $(Elm).attr('data-original-title');
        //填入檢核訊息
        $(Elm).attr('title', Msg);
        $(Elm).attr('data-original-title', Msg);
    }
    $(Elm).tooltip('destroy').tooltip('show');
    $(Elm).attr('title', tempTitle);
    $(Elm).attr('data-original-title', tempOriginalTitle);

    //如為手機 8秒自動消失
    if (DetectMoible()) {
        setTimeout(function () {
            $(Elm).removeAttr('data-toggle');
            $(Elm).removeAttr('data-html');
            $(Elm).removeAttr('title');
            $(Elm).removeAttr('data-original-title');
            $(Elm).tooltip('hide');
        }, 8000);
    }
    //$(Elm).tooltip('toggle');
};
/*提示訊息在物件下方，N秒後自動消失*/
function ShowMsgInElmDisappear(Elm, Msg, Sec) {
    let tempTitle = $(Elm).attr('title');
    ShowMsgInElm(Elm, Msg);
    let iSec = isNaN(Sec) ? 8000 : Sec * 1000;  //預設8秒後自動消失
    setTimeout(function () {
        $(Elm).removeAttr('data-toggle');
        $(Elm).removeAttr('data-html');
        $(Elm).removeAttr('title');
        $(Elm).removeAttr('data-original-title');
        $(Elm).tooltip('hide');
        $(Elm).attr('title', tempTitle);
    }, iSec);
};
//處理_訊息移除
function removeMsgInElm(Elm) {
    if ($(Elm).attr("data-toggle") == "tooltip") {
        $(Elm).removeAttr('data-toggle');
        $(Elm).removeAttr('data-html');
        $(Elm).removeAttr('title');
        $(Elm).removeAttr('data-original-title');
        $(Elm).tooltip('hide');
    }
};
/*取消千分位*/
function RemoveComma(num) {
    return num.replace(/[$,]/g, "");
}

/*加入千分位*/
function Comma(nStr, isNum) {
    //先將全形數字轉型為半形
    if (nStr != undefined)
        nStr = fullToHalf(nStr);
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    var retstr = "$" + x1 + x2;
    if (isNum) {
        retstr = retstr.replace('$', "");
    }
    return retstr;
}

/*格式化-日期八碼變十碼*/
$.datefomater = function (date) {
    if (isInt(date)) {
        date = '' + date + ''
        var day = date.substring(6, 8);
        var month = date.substring(4, 6);
        var year = date.substring(0, 4);

        var date = year + "/" + month + "/" + day;
    }
    return date;
};

/*確認視窗*/
function MsgBox(title, content, color) {
    $.unblockUI();
    var confirm = $.confirm({
        title: title,
        content: content,
        //autoClose: 'close|3000',
        type: color,
        buttons: {
            close: {
                text: '關閉'
            }
        }
    });
    return confirm;
}

/*確認、取消視窗*/
function ConfirmBox(title, content, color, fn, fnc) {
    $.confirm({
        title: title,
        content: content,
        type: color,
        typeAnimated: true,
        buttons: {
            ok: {
                text: '確認',
                btnClass: 'btn-blue',
                action: fn
            },
            close: {
                text: '取消',
                btnClass: 'btn-with',
                action: fnc
            },
        }
    });
}
/*確認、取消視窗*/
function ConfirmBoxFnBtnName(title, content, color, fn, fnc, btnName, btnNamec) {
    $.confirm({
        title: title,
        content: content,
        type: color,
        typeAnimated: true,
        buttons: {
            ok: {
                text: btnName,
                btnClass: 'btn-blue',
                action: fn
            },
            close: {
                text: btnNamec,
                btnClass: 'btn-with',
                action: fnc
            },
        }
    });
}
/*確認視窗*/
function MsgBoxCloseFn(title, content, color, fnc) {
    $.unblockUI();
    var confirm = $.confirm({
        title: title,
        content: content,
        //autoClose: 'close|3000',
        type: color,
        buttons: {
            close: {
                text: '關閉',
                action: fnc
            }
        }
    });
    return confirm;
}
/*顯示呼叫Ajax發生的錯誤訊息*/
function AjaxError(xhr, errorType, exception) {
    $.unblockUI();
    if (xhr != undefined) {
        if (xhr.responseText == undefined) {
            MsgBox('連線發生錯誤', '連線發生錯誤或連線逾時，請[重新登入]系統！', 'red', '')
        }
        else {
            $("#PageForm").append("<div id='AjaxError'></div>");
            var Msg =
                '與AS400無法連線或連線發生錯誤<br><br>' +
                'xhr.responseText:' + xhr.responseText + '<br><br>' +
                'errorType:' + errorType + '<br>' +
                'exception:' + exception + '<br>'
            MsgBox('Ajax發生錯誤', Msg, 'red', '')
        }
        return 'AjaxError-' + xhr.responseText;
    }
}

/*產生今天日期-yyyy/mm/dd*/
function GetDay(option) {
    var formattedDate = new Date();
    if (option.indexOf('m') > 0) {
        option = parseInt(option.slice(0, -1));
        formattedDate.setMonth(formattedDate.getMonth() + option);
    }
    else if (option.indexOf('d') > 0) {
        option = parseInt(option.slice(0, -1));
        formattedDate.setDate(formattedDate.getDate() + option);
    }
    var d = formattedDate.getDate();
    var m = formattedDate.getMonth();
    m += 1;  // JavaScript months are 0-11
    var y = formattedDate.getFullYear();
    var date = y + "/" + padLeft(m, 2) + "/" + padLeft(d, 2);
    return date;
}

//增加年
function AddYears(strDate, year) {
    var date = new Date(strDate);
    year = parseInt(year);
        //例外處理 如為2/29增加一年為2/28
    if (date.getMonth() == 1 && date.getDate() == 29)
        date.setDate(date.getDate() - 1);
    date.setFullYear(date.getFullYear() + year);
    return [date.getFullYear(),
            padLeft(date.getMonth() + 1, 2),
            padLeft(date.getDate(), 2)].join('/');
}

/*判斷_是否為日期格式*/
function checkdate(input) {
    var validformat = /^\d{4}\/\d{2}\/\d{2}$/ //Basic check for format validity
    var returnval = false;
    if (!validformat.test(input)) {
        returnval = false;
    }
    else { //Detailed check for valid date ranges
        var yearfield = input.split("/")[0]
        var monthfield = input.split("/")[1]
        var dayfield = input.split("/")[2]
        var dayobj = new Date(yearfield, monthfield - 1, dayfield)
        if ((dayobj.getMonth() + 1 != monthfield) || (dayobj.getDate() != dayfield) || (dayobj.getFullYear() != yearfield)) {
            returnval = false;
        }
        else {

            returnval = true
        }
    }
    return returnval
}

/*處理_檢核div裡面的物件是否有值*/
function ValidateDiv(div) {
    var ValidateSuccess = true;
    var ElmList = $('#' + div).find('input,select');
    ElmList.each(function () {
        var Msg = '';
        if ($(this)[0].attributes.required != undefined && ($(this).val() == '' || $(this).val() == null)) {
            Msg += ' 必填欄位';
        }
        if ($(this)[0].attributes.min != undefined && (!isInt(RemoveComma($(this).val())) || RemoveComma($(this).val()) <= 0)) {
            Msg += ' 不可為零或空值';
        }
        if (Msg != '') {
            ValidateSuccess = false;
            ShowMsgInElm('#' + this.id, Msg, false);
        }
    })
    return ValidateSuccess;
}

function Logs(event) {
    window.event.cancelBubble = true; // Don't know if this works on iOS but it might!
    $.ajax({
        type: "GET",
        url: "/Payment/Logs",
        contentType: "application/json; charset=utf-8",
        data: "",
        datatype: "json",
        async: false,
        cache: false,
        success: function (data) {
            var s = ''
        },
        error: AjaxError
    });
};

function isValue(val) {
    var v = val.value;
    if (v == 'NaN' || v == null || v == '') {
        return 0;
    } else {
        //全行轉半型
        result = "";
        for (let i = 0; i <= v.length; i++) {
            if (v.charCodeAt(i) == 12288) {
                result += " ";
            } else {
                if (v.charCodeAt(i) > 65280 && v.charCodeAt(i) < 65375) {
                    result += String.fromCharCode(v.charCodeAt(i) - 65248);
                } else {
                    result += String.fromCharCode(v.charCodeAt(i));
                }
            }
        }
        val.value = result;
        v = result;
        return v;
    }
}

//判斷_身份證字號
function checkID(id) {
    tab = "ABCDEFGHJKLMNPQRSTUVXYWZIO"
    A1 = new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3);
    A2 = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5);
    Mx = new Array(9, 8, 7, 6, 5, 4, 3, 2, 1, 1);
    //驗證填入身分證字號長度及格式
    if (id.length != 10) return false;
    let e = tab.indexOf(id.charAt(0));
    if (e == -1) return false;
    sum = A1[e] + A2[e] * 9;
    for (let y = 1; y < 10; y++) {
        v = parseInt(id.charAt(y));
        if (isNaN(v)) return false;
        sum = sum + v * Mx[y];
    }
    if (sum % 10 != 0) return false;
    return true;
}

//判斷_護照號碼
function check_resident_ID(id) {
    //驗證填入身分證字號長度及格式
    if (id.length != 10) {
        /*20190211 USER(純純)回覆:持有居留證號者才可投保*/
        //if (id.length == 6 || id.length == 7 || id.length == 8) { return true; } else { return false; }
        return false;
    }
    //格式，用正則表示式比對第一個字母是否為英文字母
    if (isNaN(id.substr(2, 8)) ||
    (!/^[A-Z]$/.test(id.substr(0, 1))) || (!/^[A-Z]$/.test(id.substr(1, 1)))) {
        return false;
    }
    //按照轉換後權數的大小進行排序
    var idHeader = "ABCDEFGHJKLMNPQRSTUVXYWZIO";
    //這邊把身分證字號轉換成準備要對應的
    id = (idHeader.indexOf(id.substring(0, 1)) + 10) +
    '' + ((idHeader.indexOf(id.substr(1, 1)) + 10) % 10) + '' + id.substr(2, 8);
    //開始進行身分證數字的相乘與累加，依照順序乘上1987654321
    snumber = parseInt(id.substr(0, 1)) +
    parseInt(id.substr(1, 1)) * 9 +
    parseInt(id.substr(2, 1)) * 8 +
    parseInt(id.substr(3, 1)) * 7 +
    parseInt(id.substr(4, 1)) * 6 +
    parseInt(id.substr(5, 1)) * 5 +
    parseInt(id.substr(6, 1)) * 4 +
    parseInt(id.substr(7, 1)) * 3 +
    parseInt(id.substr(8, 1)) * 2 +
    parseInt(id.substr(9, 1));
    checkNum = parseInt(id.substr(10, 1));
    //模數 - 總和/模數(10)之餘數若等於第九碼的檢查碼，則驗證成功
    console.log(10 - snumber % 10);
    if ((10 - snumber % 10) == checkNum) {
        return true;
    } else if ((snumber % 10) == "0" && checkNum == "0") {  //若尾數為0，以0為檢查碼
        return true;
    } else {
        return false;
    }
}

//判斷_公司統編
function checkCompId(taxId) {
    var invalidList = "00000000,11111111";
    if (/^\d{8}$/.test(taxId) == false || invalidList.indexOf(taxId) != -1) {
        return false;
    }
    var validateOperator = [1, 2, 1, 2, 1, 2, 4, 1],
        sum = 0,
        calculate = function (product) { // 個位數 + 十位數
            var ones = product % 10,
                tens = (product - ones) / 10;
            return ones + tens;
        };
    for (var i = 0; i < validateOperator.length; i++) {
        sum += calculate(taxId[i] * validateOperator[i]);
    }
    if (sum % 10 == 0 || (taxId[6] == "7" && (sum + 1) % 10 == 0)) {
        isCorp = true;
        return true;
    } else {
        isCorp = false;
        return false;
    }
};

//判斷_Mail格式
function checkMail(mail) {
    emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    if (mail.search(emailRule) != -1) {
        return true;
    }
    else {
        return false;
    }
}

//驗證_手機號碼格式
function checkMobil(mobileNum) {     
    var phone_pattern = /([0-9]{10})|(\([0-9]{3}\)\s+[0-9]{3}\-[0-9]{4})/;
    if (mobileNum.length != 10) { return false; }      
    if (phone_pattern.test(mobileNum)) {
        //排除後8碼為相同號碼
        var results = [];
        for (var i = 0; i < mobileNum.length - 1; i++) {
            if (mobileNum[i + 1] === mobileNum[i]) {
                results.push(mobileNum[i]);
            }
        }        
        if (results.length == 7) {
            return false;
        } else {
            return true;
        }
    }    
}

//判斷_物件清單
function chkObjList(ObjList, isFocus) {
    resultFlag = true;
    ObjList.each(function (i, e) {
        var Msg = '';
        if (!$(this).is(":hidden") && $(this)[0].attributes.required != undefined && ($(this).val() == '' || $(this).val() == null)) {
            Msg += ' 必填欄位';
        };
        if (!$(this).is(":hidden") && $(this)[0].attributes.min != undefined && (!isInt(RemoveComma($(this).val())) || RemoveComma($(this).val()) <= 0)) {
            Msg += ' 不可為零或空值';
        };
        if (Msg != '') {
            resultFlag = false;
            var id = '#' + this.id;
            setTimeout(function () { ShowMsgInElm(id, Msg); }, 1);      //需要做延遲才不會消失
            //ShowMsgInElm('#' + this.id, Msg);
        };
        if (Msg != '' && isFocus) {
            if ($(this).attr('disabled') === 'disabled') {
                $(this).attr('disabled', false).focus().attr('disabled', true);     //focus() 需要先解開，再處理
            } else {
                $(this).focus();
            };
            isFocus = false;
        };
    });
    return resultFlag;
};

/*處理_自動轉大寫*/
$('[data-toupper="Y"]').keydown(function () { $(this).UpperCase() });

/*處理_找資料表欄位索引*/
function FindTableIndex(tblName, colName) {
    return $('#' + tblName + ' th:contains("' + colName + '")').index();
}

/*處理_資料查詢([surl]:呼叫URL,[param]:參數)*/
function getdata(surl, param) {
    var sDate = new Date();
    var eDate = new Date();
    var objdata;
    $.ajax({
        url: surl,
        type: "POST",
        dataType: "json",
        async: false,
        data: param,
        success: function (data) {
            objdata = data;
            eDate = new Date();
        },
        error: AjaxError
    });
    if (objdata == null || typeof (objdata) == "undefined") {
        objdata = [];
    }
    var diff = parseInt(eDate - sDate);
    var sec = Math.floor(diff / 1000);
    var slog = "(surl:" + surl + ",sec:";
    slog += (sec > 0 ? (sec + ":") : "");      //有秒數則顯示秒數
    slog += padLeft((diff % 1000), 3) + ")";         //顯示毫秒
    console.log(slog);
    return objdata;
};

/*處理_讀取物件text,value值([Obj]:物件名稱,[type]:讀取型態)*/
function getObjToVal(Obj, type) {
    if (typeof (Obj) == "undefined" || Obj == null) {
        return "";
    }
    else {
        if (type == "text") {
            return Obj.text;
        }
        else if (type == "value") {
            return Obj.value;
        }
        else {
            return Obj;
        }
    }
};

/*處理_把半形字串轉成全形([strVal]:字串.return 全形字串)*/
function halfToFull(strVal) {
    var temp = "";
    for (var i = 0; i < strVal.length; i++) {
        var charCode = strVal.charCodeAt(i);
        if (CheckEnDigiVal(charCode) && charCode <= 126 && charCode >= 33) {
            charCode += 65248;
        }
        //else if (charCode == 32) { // 半形空白轉全形
        //    charCode = 12288;
        //}
        if (String.fromCharCode(charCode).Blength() == 2 || charCode == 32 || charCode == 10) {
            //檢查字串byte數為2或半型空白，才把字元串回去
            temp = temp + String.fromCharCode(charCode);
        };
    }
    return temp;
};

/*處理_把全形字串轉成半形([str]:字串.return 半形字串)*/
function fullToHalf(strVal) {
    var str = strVal.toString();
    var result = '';
    for (let i = 0 ; i < str.length; i++) {
        code = str.charCodeAt(i);
        //獲取當前字元的unicode編碼 
        if (code >= 65281 && code <= 65373)//在這個unicode編碼範圍中的是所有的英文字母已經各種字元 
        {
            result += String.fromCharCode(str.charCodeAt(i) - 65248);//把全形字元的unicode編碼轉換為對應半形字元的unicode碼 
        } else if (code == 12288)//空格 
        {
            result += String.fromCharCode(str.charCodeAt(i) - 12288 + 32);
        } else {
            result += str.charAt(i);
        }
    } return result;
}

/*設定_下拉選單([dtsys]:資料來源,[sCodeNo]:代碼編號,[objddl]:物件名稱,[isdef]:是否需要空白選項,[isshowtext]:是否只顯示TEXT值,[defval]:預設值,[ischang]:是否執行change事件)*/
function setDDL_SYSCODEDT(dtsys, sCodeNo, objddl, isdef, isshowtext, defval, ischang) {
    if (typeof (dtsys) != "undefined") {
        isdef = typeof (isdef) == "undefined" ? ' ' : isdef;
        defval = typeof (defval) != "undefined" ? defval : false;
        isshowtext = typeof (isshowtext) != "undefined" ? isshowtext : false;
        ischang = typeof (ischang) != "undefined" ? ischang : false;
        setDDL(objddl
            , $.grep(dtsys, function (x) { return x.CodeNo === sCodeNo; })
            , isdef, isshowtext);
        if (defval != false) { $(objddl).val(defval); };    //設定預設值
        if (ischang) { $(objddl).change(); };               //執行change事件
    };
}

/*設定_下拉選單內容([objddl]:物件名稱,[ddldata]:資料來源,[isdef]:預設項目,[isshowtext]:是否只顯示TEXT值)*/
function setDDL(objddl, ddldata, isdef, isshowtext) {
    $(objddl).empty();
    if (!isdef == false)
        $(objddl).append($('<option></option>').val('').text(isdef));
    if (ddldata != null) {
        if (ddldata.length > 0) {
            var OptionHtml = '';
            $.each(ddldata, function (i, item) {
                if (isshowtext) {
                    OptionHtml += "<option value='" + item.VALUE + "'>" + item.TEXT + "</option>"
                } else {
                    OptionHtml += "<option value='" + item.VALUE + "'>" + item.VALUE + ' - ' + item.TEXT + "</option>"
                }
            });
            $(objddl).append(OptionHtml);
        };
    };
};

/*設定_查詢式下拉選單內容([objddl]:物件名稱,[ddldata]:資料來源,[isdef]:預設項目,[isshowtext]:是否只顯示TEXT值)*/
function setSelPick(objddl, ddldata, defVal, isshowtext) {
    if (objddl.indexOf('#') == -1) {
        objddl = '#' + objddl;
    };
    $(objddl).empty();
    if (ddldata != null) {
        if (ddldata.length > 0) {
            $.each(ddldata, function (i, item) {
                if (isshowtext) {
                    $(objddl).append($('<option></option>').val(item.VALUE).text(item.TEXT));
                } else {
                    $(objddl).append($('<option></option>').val(item.VALUE).text(item.VALUE + '-' + item.TEXT));
                }
            });
            $(objddl).selectpicker('refresh');
            if (typeof (defVal) != "undefined" && defVal != null) {
                $(objddl).selectpicker('val', defVal.trim()).change();
            }
        };
    }
};
/*設定_查詢式下拉搜尋第一個值*/
function SetSelPikFirSearchItem(index, value)
{
    //搜尋時第一筆資料先暫存
    if (index == 0) {
        BindSelpikTabEvent.spkVal = value
        //localStorage.setItem('spkVal', value);
    }
}

var listDate = new Date();
//顯示Log處理
function consLogDate(str) {
    str = getObjToVal(str);
    var now = new Date();
    var diff = parseInt(now - listDate);
    var sec = Math.floor(diff / 1000);
    listDate = now;
    now = now.getFullYear() + "/" + padLeft(parseInt(now.getMonth() + 1), 2) + "/" + padLeft(now.getDate(), 2) + " "
        + padLeft(now.getHours(), 2) + ':' + padLeft(now.getMinutes(), 2) + ':' + padLeft(now.getSeconds(), 2) + ':' + padLeft(now.getMilliseconds(), 3);
    now += "(" + (sec > 0 ? (sec + ":") : "");      //有秒數則顯示秒數
    now += padLeft((diff % 1000), 3) + ")";         //顯示毫秒
    console.log(now + ' ' + str);                   //顯示
};

//控制是否可輸入[擬繳區]
function DisabledAllSelectAndInput(bool) {
    $(".selectpicker").prop("disabled", bool);
    $(".iptDisabled").prop("disabled", bool);
}


