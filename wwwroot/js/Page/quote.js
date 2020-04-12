/*====[初始化]====*/
$(document).ready(function () {
    BlockUI('資料載入中，請稍後...');
    var arr = [];
    setTimeout(function () {
        RegSelectDateYear();    //註冊下拉年曆
        RegSelectDateMonth();   //註冊下拉月份
        /*--SDS傳入資料處理_START----------------------------------*/
        //經手人
        var agndata = $('#hidagntnum').val().split(',');
        for (i = 0; i < agndata.length; i++) { if (agndata[i].trim() != "") { arr.push({ VALUE: agndata[i], TEXT: agndata[i] }); } }
        $('#divQuoteDate').data("arragnt", arr);
        //經手人單位別
        var branchdata = $('#hidbranchlist').val().split(',');
        var arrbranch = [];
        for (i = 0; i < agndata.length; i++) { if (agndata[i].trim() != "") { arrbranch.push({ VALUE: agndata[i], TEXT: branchdata[i] }); } }
        $('#divQuoteDate').data("arrbranch", arrbranch);
        //經手人ID
        var agentIddata = $('#hidagentIdList').val().split(',');
        var arragentId = [];
        for (i = 0; i < agndata.length; i++) { if (agndata[i].trim() != "") { arragentId.push({ VALUE: agndata[i], TEXT: agentIddata[i] }); } }
        $('#divQuoteDate').data("arragentId", arragentId);
        /*---------------------------------------------------------*/
        //移除輸入框裡的星號
        $('input').attr('placeholder', function () { return $(this).prev('span').text().replace('＊', ''); });
        //車險財損報價 標題隱藏
        $('#chkAddFl').parent().parent().next('.panel-body').toggle(200);
        //隱藏保障內容
        $('#tblSafeContent').hide();
        //隱藏{加保車體險或竊盜險報價}
        $("#divAddFinancialLoss").hide(200);
        $("#divAddFinancialLoss").prev().find('i').removeClass().addClass('fa fa-angle-double-up');
        //年齡選擇初始化
        var selAge = $('#selAge');
        for (var i = 15; i <= 99; i++) { selAge.append("<option value='" + i + "' >" + i + "</option>"); }
        var dtSys = getdata("/Quotation/GetLoadSysData", { sProgCode: "QUOTE" });   //查詢[系統載入預設值]相關資訊        
        setDDL_SYSCODEDT(dtSys, 'T007', '#selMANLEVEL', ' ', true);                 //[強制等級]
        setDDL_SYSCODEDT(dtSys, 'E004', '#selBodyFactor', ' ', true);               //[體係]
        setDDL_SYSCODEDT(dtSys, 'E003', '#selDutyFactor', ' ', true);               //[責係]
        setDDL_SYSCODEDT(dtSys, 'E001', '#selMANMVPZMTYPE', ' ', true);             //[強制車種]
        setDDL_SYSCODEDT(dtSys, 'E002', '#selMVPZMTYPE1', ' ', true);               //[任意車種]
        setDDL_SYSCODEDT(dtSys, 'E002', '#selMVPZMTYPE2', ' ', true);               //[任意車種]
        setDDL_SYSCODEDT(dtSys, 'E005', '#selZCARRY', ' ', true);                   //[責任險保障內容(簡易用)]
        setDDL_SYSCODEDT(dtSys, 'E006', '#selSafeContent', ' ', true);              //乘載人數(簡易用)
        HelperExplainInit(dtSys);                                                   //小幫手說明初始化
        $('#selZMAKE').parent().parent().prop('disabled', true);                    //廠型隱藏
        $('input[name=chkInsuranceKind]').parent().next('.panel-body').hide();      //險種區隱藏
        $('#divQuoteDate').data("ThiefInsList", getSysCode(dtSys, "THIEFINSLIST")); //車體/竊盜險種清單        
        CreatInsDT();       //險種表格預設
        InitEvent();
        $.unblockUI();
    }, 50);
});

window.onload = function () {
    //載入廠型資訊
    $("#selZMAKE").SetKeyinFunction({
        waitTime: 250,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            var OldKey = getObjToVal($('#divQuoteDate').data("CarMakeOldKey"));
            var data = $('#divQuoteDate').data("CarMakeData");
            if (typeof (data) == "undefined") { data = []; };
            var inputKey = (e.val().toUpperCase());
            inputKey = inputKey.replace(/'/g, '');  //20190926 modify by eric 廠牌輸入'會發生錯誤

            if ((data.length == 0 && inputKey.length >= 2) || (OldKey.length > 1 && OldKey.substr(0, 2) != inputKey.substr(0.2))) {         //查詢資料庫
                data = getdata("/Quotation/GetDDL_ZMAKE", { sMakeDesc: inputKey, sCarType: $('#selMVPZMTYPE2').val() });
                $('#divQuoteDate').data("CarMake", data);
            } else if (data.length > 0 && inputKey.length >= 2) {   //查詢暫存區
                data = $.grep(data, function (x) { return x.VALUE.indexOf(inputKey) > -1 || x.TEXT.indexOf(inputKey) > -1 });
            } else if (data.length > 0 && inputKey.length < 2) {    //清空暫存區
                data = [];
                $('#divQuoteDate').data("CarMakeData", data);
            }
            if (data.length > 0) {
                var OptionHtml = '';
                $.each(data, function (index, data) {
                    //搜尋時第一筆資料先暫存
                    SetSelPikFirSearchItem(index, data.VALUE + '~|~' + data.TEXT);
                    OptionHtml += "<option value='" + data.VALUE + "'>" + data.VALUE + ' - ' + data.TEXT + "</option>";
                });
                $(select).append(OptionHtml);
                $(select).selectpicker('refresh');
                title.html("");
            }
            else {
                //搜尋不到時清除暫存值
                BindSelpikTabEvent.spkVal = '';
                $(select).selectpicker('refresh');
                if (inputKey.length > 1) {
                    title.html("查無資料，請重新輸入關鍵字");
                } else {
                    title.html("請輸入至少2個關鍵字");
                };
            }
        }
    });
    //載入經手人資訊
    $("#selAGNTNUM").SetKeyinFunction({
        waitTime: 250,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            var data = {};
            e.val(e.val().toUpperCase());
            if (e.val().length > 0) {
                data = $('#divQuoteDate').data("arragnt");
                data = $.grep(data, function (x) { return x.VALUE.indexOf(e.val()) > -1 });
            }
            if (data.length > 0) {
                var OptionHtml = '';
                $.each(data, function (index, data) {
                    //搜尋時第一筆資料先暫存
                    SetSelPikFirSearchItem(index, data.VALUE + '~|~' + data.TEXT);
                    OptionHtml += "<option value='" + data.VALUE + "'>" + data.TEXT + "</option>";
                });
                $(select).append(OptionHtml);
                $(select).selectpicker('refresh');
                title.html("請輸入關鍵字");
            } else {
                //搜尋不到時清除暫存值
                BindSelpikTabEvent.spkVal = '';
                $(select).selectpicker('refresh');
                title.html("查無資料，請重新輸入關鍵字");
            }
        }
    });
    //初始化 selectpicker tab 鍵事件
    BindSelpikTabEvent();
    //[畫面調整]
    $(window).bind('resize', function () {
        //BlockUI('畫面自動調整中，請稍後');
        setTimeout(function () {
            var sCol = "eee";
            $('#tblSafeContent').DataTable().columns.adjust().responsive.recalc();
            var SSeW = $('#selMVPZMTYPE2').width();
            var stdSpnW = $('#standard').width();
            var iWidth = $(window).width();
            $('#selZMAKE').parent().prev().attr("style", 'width:' + stdSpnW + 'px;');
            $('#selAGNTNUM').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%); width:100%;');
            if (iWidth >= 992) {
                $('#selZMAKE').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%);');
                $('#selSafeType').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%);');
            } else if (iWidth < 992 && iWidth >= 751) {
                $('#selZMAKE').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%); width:' + $('#selZMAKE').parent().width() + 'px;');
                $('#selSafeType').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%); width:' + SSeW + 'px;');
            } else if (iWidth < 751) {
                $('#selZMAKE').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%); width:' + $('#selZMAKE').parent().width() + 'px;');
                $('#selSafeType').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%); width:' + SSeW + 'px;');
            }
            $.unblockUI();
        }, 500)
    });
    $(window).resize();
};
/******自訂函式_Start********************************/
//保障內容資料讀取顯示
function CreatInsDT(dtSource) {
    $('#tblSafeContent').show();
    var Val = $('#selSafeContent').val();
    BlockUI("讀取中，請稍後");
    setTimeout(function () {
        $('#tblSafeContent').DataTable({
            destroy: true,
            language: DataTablsChineseLanguage,
            searching: false,
            autoWidth: false,
            info: false,
            processing: true,
            data: dtSource,
            fixedHeader: {
                header: true,
                headerOffset: 45
            },
            lengthChange: false,
            paging: false,
            orderCellsTop: false,
            order: [7, 'asc'],    //預設排序為位置[空值]，表示不預設排序
            columnDefs: [
            {
                className: "text-center custom-middle-align",
                targets: [4, 5, 6]
            },
            {
                className: "text-right",
                targets: [1, 2, 3]
            },
            {
                visible: false, targets: [4, 5, 7]
            }
            ],
            columns: [
                { width: "17%", data: "ZCVRTYPE_NAME" }
                , { width: "17%", data: "SUMINA", render: $.fn.dataTable.render.number(',', '.', 0) }
                , { width: "17%", data: "SUMINB", render: $.fn.dataTable.render.number(',', '.', 0) }
                , { width: "17%", data: "SUMINC", render: $.fn.dataTable.render.number(',', '.', 0) }
                , { width: "5%", data: "ZFACTORA" }	//係數一
                , { width: "5%", data: "ZFACTORB" }	//係數二
                , { width: "17%", data: "EXCESS" } //自負額
                , { width: "5%", data: "InsOrder" }
            ],
        });
        $.unblockUI();
    }, 500);
};
//處理_div訊息移除
function removeMsgObjList(ObjList) {
    ObjList.each(function (i, e) {
        if ($(this).attr("data-toggle") == "tooltip") {
            $(this).removeAttr('data-toggle');
            $(this).removeAttr('data-html');
            $(this).removeAttr('title');
            $(this).removeAttr('data-original-title');
            $(this).tooltip('hide');
        };
    });
};
//處理_訊息移除
function removeMsgInElm(Elm) {
    if ($(Elm).attr("data-toggle") == "tooltip") {
        $(Elm).removeAttr('data-toggle');
        $(Elm).removeAttr('data-html');
        $(Elm).removeAttr('title');
        $(Elm).removeAttr('data-original-title');
        $(Elm).tooltip('hide');
    };
};
//小幫手說明初始化
function HelperExplainInit(dtSys) {
    var sContent = "";
    var sCloseContent = "<div class='col-lg-2 col-md-4 col-sm-6 col-xs-12 input-group' style='margin:0px auto;text-align:center;'><button type='button' style='width:100%' class='btn btn-primary' data-dismiss='modal'><i class='fa fa-times' aria-hidden='true'></i> 關閉</button></div>";
    $(dtSys).each(function (i, elm) {
        if (elm["CodeNo"] == "E007") {
            sContent += elm["TEXT"] + "<br/>";
            switch (elm["VALUE"]) {
                case "1":
                    $('#btnMANLEVEL').attr('data-qContext', "<div class='panel-body' style='padding-left:10px; padding-right:10px;'>" + elm["TEXT"] + sCloseContent + "<br/></div>");
                    break;
                case "2":
                    $('#btnDutyFactor').attr('data-qContext', "<div class='panel-body' style='padding-left:10px; padding-right:10px;'>" + elm["TEXT"] + sCloseContent + "<br/></div>");
                    break;
                case "3":
                    $('#btnBodyFactor').attr('data-qContext', "<div class='panel-body' style='padding-left:10px; padding-right:10px;'>" + elm["TEXT"] + sCloseContent + "<br/></div>");
                    break;
                case "4":
                    $('#btnCLTDOB').attr('data-qContext', "<div class='panel-body' style='padding-left:10px; padding-right:10px;'>" + elm["TEXT"] + sCloseContent + "<br/></div>");
                    break;
            }
        }
    });
    $('#btnHelperExplain').attr('data-qContext', "<div class='panel-body' style='padding-left:10px; padding-right:10px;'>" + sContent + sCloseContent + "<br/></div>");
};
//讀取_系統參數設定值([dtsys]:資料來源,[sCodeNo]:代碼編號)
function getSysCode(dtsys, sCodeNo) {
    if (typeof (dtsys) != "undefined") {
        var dt = $.grep(dtsys, function (x) { return x.CodeNo === sCodeNo; });
        if (dt != null) {
            if (dt.length > 0) {
                return getObjToVal(dt[0].VALUE);
            };
        };
    };
};
//初始化_元件事件
function InitEvent() {
    //險種勾選事件
    $('input[name=chkInsuranceKind]').click(function () {
        let curItem = $(this);
        if (curItem.prop('checked')) {
            curItem.parent().next('.panel-body').show(200);
        } else {
            curItem.parent().next('.panel-body').hide(200);
        }
    });

    $('.selectpicker[data-source="ajax"]').on('hide.bs.select', function (e) {
        var Text = $(this).find(":selected").text();
        var Val = $(this).find(":selected").val();
        $(this).empty();
        $(this).append("<option value='" + Val + "' select>" + Text + "</option>");
        $(this).selectpicker('render');
        $(this).selectpicker('refresh');
    });
    //送出計算保費
    $('#btnSubmit').click(function () {
        BlockUI('作業中，請稍後');
        QuoteParm = {};
        var Validate = true;
        var errCount = 0;
        //清空警告訊息
        removeMsgObjList($('#divPhysicalinjury').find('input,select'));
        Validate = ValidateDiv('divPhysicalinjury');
        if (!Validate) {
            $('#selAGNTNUM').focus();
            $.unblockUI();
            return;
        };
        //查詢資料
        var dt = getdata("/Quotation/GetAgntInfo", { KeyWord: $('#selAGNTNUM').val() });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
                MsgBox('錯誤', dt[0].MSG, 'red'); return;
            }
            QuoteParm.ZCHLCDE = dt[0].CHL,//通路
            QuoteParm.ZCHLTYP = "Z"//通路別
        }
        else {
            Validate = false;
            ShowMsgInElm('#selAGNTNUM', '非授權的經手人代號');
            errCount++;
        };
        /*1. 若無勾選財損，【折舊率】欄位以0或空白帶入，請PG確認計算保費時不會出現保費0或1
          2. 若勾選財損，【折舊率】欄位一律固定以15%帶入
          3. 折舊率值因固定，所以目前請隱藏不用下拉選擇
        */
        var zdepcode = "";  //折舊率帶空值
        //if ($('#chkAddFl').prop('checked')) {
        //    zdepcode = "A"; //2. 若勾選財損，【折舊率】欄位一律固定以15%帶入
        //    removeMsgObjList($('#divAddFinancialLoss').find('input,select'));
        //    Validate = ValidateDiv('divAddFinancialLoss');
        //    var ID = $('#iptMEMBSEL').val();
        //    if (!checkID(ID) && !check_resident_ID(ID)) {
        //        Validate = false;
        //        ShowMsgInElm('#iptMEMBSEL', '身分證字號或居留證號錯誤');
        //    }
        //}
        //驗證被保險人(車主)資料
        removeMsgObjList($('#divProfile').find('input,select'));
        Validate = ValidateDiv('divProfile');
        errCount = !Validate ? errCount + 1 : errCount;
        //*驗證險種區
        var chkMan = $('#chkMan');
        var chkAny1 = $('#chkAny1');
        var chkAny2 = $('#chkAny2');
        if (!chkMan.prop('checked') && !chkAny1.prop("checked") && !chkAny2.prop("checked")) {
            ShowMsgInElm('#chkMan', '險種資料必須勾選一項');
            errCount++;
        };
        if (chkMan.prop("checked")) {
            removeMsgObjList($('#divInsInfo1').find('input,select'));
            Validate = ValidateDiv('divInsInfo1');
            errCount = !Validate ? errCount + 1 : errCount;
        };
        if (chkAny1.prop("checked")) {
            removeMsgObjList($('#divInsInfo2').find('input,select'));
            Validate = ValidateDiv('divInsInfo2');
            errCount = !Validate ? errCount + 1 : errCount;
        };
        if (chkAny2.prop("checked")) {
            removeMsgObjList($('#divInsInfo3').find('input,select'));
            Validate = ValidateDiv('divInsInfo3');
            errCount = !Validate ? errCount + 1 : errCount;
        };
        var sIssueYear = getObjToVal($('#selIssueYear').val());                 //發照年
        var sMakeYear = getObjToVal($('#selYRMANF').val());                     //製造年
        var Today = new Date();
        //製造年
        if ($('#selYRMANF').val() != '') {
            //不可比系統日期的年度大多過1年，否則顯示錯誤訊息「製造年輸入錯誤」
            if ($('#selYRMANF').val() > Today.getFullYear() + 1 || $('#selYRMANF').val() < 1900) {
                Validate = false;
                ShowMsgInElm('#selYRMANF', '[製造年]輸入錯誤！', true);
                errCount++;
            };
        };
        //檢核_[發照年&製造年] /*發照年必須大於或等於製造年，若發照年小於製造年，則顯示錯誤訊息「發照年或製造年有誤！」*/
        if (!isNaN(sIssueYear) && !isNaN(sMakeYear)) {
            if (sIssueYear < sMakeYear) {
                ShowMsgInElm('#selIssueYear,#selYRMANF', '發照年或製造年有誤！', true);
                $('#selIssueYear').focus();
                errCount++;
            };
        };
        //發照日期
        ////if ($('#iptGETDATE').val().length > 0) {
        ////    if ($('#iptGETDATE').val().substr(0, 4) < $('#selYRMANF').val()) {
        ////        Validate = false;
        ////        ShowMsgInElm('#iptGETDATE', '出廠年不可大於發照日期');
        ////        errCount++;
        ////    }
        ////}
        if (errCount > 0) {
            $.unblockUI();
            chkObjList($('#mainContent').find('input,select'), true);
            return;
        };
        //******************保障內容 Start*********************
        var source = [];
        var EasyQoutInsData = [];
        var Val = $('#selSafeContent').val();
        if ($('#chkAny1').prop('checked') && Val != '') {
            EasyQoutInsData = getdata("/Quote/GetEasyQoutInsType", { sType: Val, ZCARRY: $('#selZCARRY :selected').text().replace('人', '') });     //保障內容查詢
            if (EasyQoutInsData.length > 0) {
                source = [];
                $(EasyQoutInsData).each(function (i, QoutInsItem) {
                    var Element = {};
                    Element.ZCVRTYPE = QoutInsItem.InsureType;  //險種
                    Element.EXCESS = QoutInsItem.DedItem;   //自負額
                    Element.SUMINA = QoutInsItem.InsureAmt1;    //保額一
                    Element.SUMINB = QoutInsItem.InsureAmt2;//保額二
                    Element.SUMINC = QoutInsItem.InsureAmt3;//保額三
                    Element.ZCVRTYPE_NAME = QoutInsItem.InsureName;
                    Element.ZFACTORA = QoutInsItem.Factor1;
                    Element.ZFACTORB = QoutInsItem.Factor1;
                    Element.InsOrder = QoutInsItem.InsOrder;
                    source.push(Element);
                });
            };
        };
        var forcePackage = [{
            "ZCVRTYPE": "21",
            "ZCVRTYPE_NAME": "強制險",
            "SUMINA": "200000",
            "SUMINB": "2000000",
            "SUMINC": "2000000",
            "ZFACTORA": "",	//係數一
            "ZFACTORB": "",	//係數二
            "EXCESS": "",	//自負額
            "InsOrder": 0
        }];
        if ($('#chkMan').prop("checked")) {
            source = source != "" ? forcePackage.concat(source) : forcePackage;
        };
        var Item = [];
        if ($('#chkAny2').prop("checked") && $('#selSafeType').val() != null) {
            $.each($('#selSafeType').val(), function (i, v) {
                var Element = {}
                switch (v) {
                    case "A":
                        Element.ZCVRTYPE = "01",//險種
                        Element.EXCESS = "01" //自負額
                        Element.InsOrder = 1;
                        Element.ZCVRTYPE_NAME = "甲式車體損失險";
                        break;
                    case "B":
                        Element.ZCVRTYPE = "05",//險種
                       Element.EXCESS = "55" //自負額
                        Element.InsOrder = 2;
                        Element.ZCVRTYPE_NAME = "乙式車體損失險";
                        break;
                    case "C":
                        Element.ZCVRTYPE = "05",//險種
                       Element.EXCESS = "52" //自負額
                        Element.InsOrder = 2;
                        Element.ZCVRTYPE_NAME = "丙式車體損失險";
                        break;
                    case "D":
                        Element.ZCVRTYPE = "11",//險種
                       Element.EXCESS = "10" //自負額
                        Element.InsOrder = 13;
                        Element.ZCVRTYPE_NAME = "竊盜損失險";
                        break;
                }
                Element.SUMINA = "0";//保額一
                Element.SUMINB = "";//保額二
                Element.SUMINC = "";//保額三
                Element.ZFACTORA = "";
                Element.ZFACTORB = "";
                Item.push(Element);
            });
        };
        if (Item.length > 0) {
            source = source != "" ? Item.concat(source) : Item;
        };
        //******************保障內容 End*********************
        //險種區資料收集
        if (chkMan.prop("checked")) {
            QuoteParm.MCPZMTYPE = $('#selMANMVPZMTYPE').val();   //強制險車種
            var MCPAGTO = '0' + $('#selMANLEVEL').val();
            QuoteParm.MCPAGTO = MCPAGTO.substr(MCPAGTO.length - 2);    //強制險等級
            QuoteParm.MCPCCDATE = GetDay('').replace(/\//g, '');
            QuoteParm.MCPTERM = "01";
        };
        if (chkAny1.prop("checked")) {
            QuoteParm.ZCARRY = $('#selZCARRY').val();   //乘載
            QuoteParm.TPLFACT = $('#selDutyFactor').val();  //車責係數
        } else {
            switch ($('#selMANMVPZMTYPE').val()) {
                case "03":
                    QuoteParm.ZCARRY = "0050";
                    break;
                case "04":
                    QuoteParm.ZCARRY = "0020";
                    break;
                case "22":
                    QuoteParm.ZCARRY = "0070";
                    break;
            };
        };
        if (chkAny2.prop("checked")) {
            QuoteParm.COMPFACT = $('#selBodyFactor').val(); //車體係數
            QuoteParm.YRMANF = $('#selYRMANF').val();//製造年
            var selIssueMonth = '0' + $('#selIssueMonth').val()
            QuoteParm.GETDATE = sIssueYear.replace(/\//g, '') + selIssueMonth.substr(selIssueMonth.length - 2);//發照年月日 
            QuoteParm.ZMAKE = $('#selZMAKE').val();//廠型代號
            QuoteParm.ZCC = $('#iptZCC').val();//排氣量
        } else {
            QuoteParm.ZMAKE = "0700000";//廠型代號
        };
        if (chkAny1.prop("checked") || chkAny2.prop("checked")) {
            QuoteParm.MVPCCDATE = GetDay('').replace(/\//g, '');
            QuoteParm.MVPTERM = "01";
        };
        Item = [];
        if (source != "") {
            $.each(source, function (i, v) {
                var Element = {};
                if (v.ZCVRTYPE == "21")
                    return;
                Element.ZCVRTYPE = v.ZCVRTYPE;//險種
                Element.SUMINA = v.SUMINA;//保額一
                Element.SUMINB = v.SUMINB;//保額二
                Element.SUMINC = v.SUMINC;//保額三
                Element.EXCESS = v.EXCESS;//自負額
                Element.ZFACTORA = v.ZFACTORA;
                Element.ZFACTORB = v.ZFACTORB;
                Item.push(Element);
                switch (v.ZCVRTYPE) {
                    case "01":
                        v.EXCESS = "3/5/7仟";
                        break;
                    case "05":
                        v.EXCESS = "無";
                        break;
                    case "11":
                        v.EXCESS = "10%";
                        break;
                };
            });
        };
        QuoteParm.MVPZMTYPE = chkAny1.prop('checked') || chkAny2.prop('checked') ? $('#selMVPZMTYPE1').val() : "";   //任意險車種
        QuoteParm.CLTDOB = $('#iptCLTDOB').val().replace(/\//g, '');//生日
        QuoteParm.CLTSEX = $('#selCLTSEX').val();//性別
        //QuoteParm.ZDEPCODE = zdepcode;//$('#selZDEPCODE').val();//折舊率代號
        QuoteParm.AGNTNUM = $('#selAGNTNUM').val();//經手人代號
        QuoteParm.SafeContent = {};
        QuoteParm.SafeContent = Item;
        consLogDate("--簡易試算[MQ發送]_Start--");
        $.ajax({
            url: '/Quote/Quote',
            type: "POST",
            dataType: 'json',
            data: { QuoteParm: QuoteParm },
            async: false,
            success: function (data) {
                if (data.Success) {
                    consLogDate("--[MQ發送_回傳]處理--");
                    consLogDate("SUM:" + Comma(parseInt(data.SUM)) + "");
                    $('#iptTotalInsurance').val(Comma(parseInt(data.SUM)));
                    var ThiefInsList = $('#divQuoteDate').data("ThiefInsList");  //車體/竊盜險種清單
                    $.each(source, function (i, item) {
                        if (ThiefInsList.indexOf(item.ZCVRTYPE) > -1) { //如果為車體竊盜險，則更新保額一
                            item.SUMINA = data.DTCSUM;
                        }
                    });
                }
                else {
                    MsgBox('錯誤', "AS400無回傳訊息，請重新試算！", 'red');
                }
            },
            cache: false
        });
        consLogDate("--簡易試算[MQ發送]_End--");
        CreatInsDT(source);
        $.unblockUI();
    });
    //註冊小幫手說明事件綁定
    $('.qContext').on('click', function () {
        var thisItem = $(this);
        var divHelper = $('#divHelper');
        divHelper.find('h4').html(thisItem.attr('title'));
        divHelper.find('.modal-body').html(thisItem.attr('data-qContext'));
        divHelper.modal('show');
    });
    //[經手人]選取事件
    $('#selAGNTNUM').change(function (e) {
        var Val = $('#selAGNTNUM').val();
        if (Val == '' || Val == null) { return; }
        removeMsgInElm('#' + e.target.id);   //訊息移除
    });
    //[廠型]選取事件
    $('#selZMAKE').change(function (e) {
        $(window).resize();
    });
    //[車體險及竊盜險]選取事件
    $('#chkAny2').click(function () {
        $(window).resize();
    });
    /******下拉選單處理_Start******************************/
    //計算年齡
    $("#selAge").change(function () {
        if ($(this).val() != "") {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            today = (yyyy - $(this).val()) + '/' + mm + '/' + dd;
            $('#iptCLTDOB').val(today);
        }
        else {
            $('#iptCLTDOB').val("");
        }
    });
    //車種連動控制
    $('#selMANMVPZMTYPE, #selMVPZMTYPE1, #selMVPZMTYPE2').change(function () {
        //if ($(this).val() == "22") {
        //    $('#selMVPZMTYPE1, #selMVPZMTYPE2').val("22");
        //} else {
        //    $('#selMANMVPZMTYPE, #selMVPZMTYPE1, #selMVPZMTYPE2').val($(this).val());
        //}
        //20200117 UPD BY MICHAEL 調整強制車種22，任意也自動帶22
        $('#selMANMVPZMTYPE, #selMVPZMTYPE1, #selMVPZMTYPE2').val($(this).val());
        if ($(this).val() == "") {
            $('#selZMAKE').parent().parent().prop('disabled', true);
        } else {
            $('#selZMAKE').parent().parent().show().prop('disabled', false);
        }
        $("#selZMAKE").empty().siblings('button').prop('title', '').children('span.filter-option.pull-left').text("請選擇");
        $("#selZMAKE").selectpicker('refresh').selectpicker('val', '');
    });
    //險種選甲式時自負額為"是"
    $('#selSafeType').change(function () {
        if ($(this).val() == null) {
            $('#selSelfsums').val('');
            $('#selSelfsums').prop('disabled', false);
            return;
        }
        else {
            if ($(this).val().length > 0) {
                var v1 = $(this).val()[0];
            }
            if ($(this).val().length > 1) {
                var v2 = $(this).val()[1];
            }
            if (v1 == 1 || v2 == 1) {
                $('#selSelfsums').val('Y');
                $('#selSelfsums').prop('disabled', 'disabled');
            } else {
                $('#selSelfsums').val('');
                $('#selSelfsums').prop('disabled', false);
            }
        }
    });
    /******下拉選單處理_End********************************/
};
//查詢現在時間
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
/******自訂函式_End********************************/
