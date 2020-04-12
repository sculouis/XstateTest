/******系統觸發事件_Start******************************/
//全域變數宣告
var _arrAgentList = [];         //經手人下拉選單資料來源
var _arrAgentData = [];         //經手人,單位別,ID資料
var _arrLoadSysData = [];       //基礎資料
var _arrZMAKEList = [];         //廠型下拉選單資料來源
var _strMode = '';              //作業模式(EDIT:修改,TEMP:要保資料輸入,COPY:複製為新件,VIEW:檢視,PROCEED:續保作業,PROCEEDNEW:[續保作業]轉為[新件])
var _strBenList = '';           //受益人險種清單
var _strThiefInsList = '';      //車體/竊盜險種清單
var _strGetLevelList = '';      //取關貿係數險種清單
var _strLoadType = '';          //承載單位(P-人,T-噸)
var _strCategory = '';          //彙總類別(C:汽車,M:機車)
var _strZautclsMail = '';       //審核人Email
var _strCCDATES = '';           //任意保期(起)
var _strFRDATES = '';           //強制保期(起)
var _strHotCar = '';            //熱門車款
var _intRangeMax = 0;           //[重置價格]上限值
var _intRangeMin = 0;           //[重置價格]下限值
var _strDXPUrl = "https://ibm6-hot-app01.eisgroup.com/";
var _divQ = $('#divQuoteDate');     //{報價單編號}
var _div1 = $('#divSalesmanData');  //{經手人/業務員資料}
var _div2 = $('#divInsurerData');   //{被保險人及要保人資料}
var _div3 = $('#divCarInfo');       //{車籍資料}
var _div4 = $('#divInsInfo');       //{投保險種資料}
var _div5 = $('#divOtherData');     //{其他約定事項}
var _dtUserInsList;                 //活動方案下拉選單資料來源
/*====[初始化]====*/
window.onload = function () {
    var onloadDate = new Date();
    BlockUI('資料載入中，請稍後...');
    setTimeout(function () {
        consLogDate("--====WindowOnload_Start====--");
        consLogDate("--==InitComp==--");
        InitComp();                 //初始化_元件
        consLogDate("--==InitEvent==--");
        InitEvent();                //初始化_元件事件
        consLogDate("--==InitEventIns==--");
        InitEventIns();             //初始化_元件事件(險種相關)
        consLogDate("--==InitClick==--");
        InitClick();                //初始化_元件按鈕事件
        consLogDate("--==InitDefault==--");
        InitDefault();              //初始化_預設值
        consLogDate("--==Resize==--");
        $(window).resize();         //畫面調整
        $.unblockUI();
        consLogDate("----==WindowOnload_End(" + Math.floor(parseInt((new Date()) - onloadDate) / 1000) + ":" + padLeft(parseInt((new Date()) - onloadDate) % 1000, 3) + ")==------");
    }, 1);
};
//初始化_元件
function InitComp() {
    consLogDate("-==InitComp_註冊險種GRID元件==-");
    CreatInsDT([]);           //註冊險種GRID元件
    CreatBenDT([]);           //註冊受益人GRID元件
    //CreatCustDT();          //註冊客戶資料GRID元件
    consLogDate("-==InitComp_註冊日曆元件==-");
    if (((new Date()).getMonth() + 1) < 10) {
        //強制險[年份]大於等於11月時，才出現明年度的選項可選(目前月份<10月時，則顯示今年度就好)
        _div4.find('#iptFRDATES').attr("maxYear", '0');     /*[強制保期(起)]*/
    };
    if (((new Date()).getMonth() + 1) < 11) {
        //任意險[年份]大於等於11月時，才出現明年度的選項可選(目前月份<11月時，則顯示今年度就好)
        _div3.find('#selYRMANF,#selIssueYear').attr("maxYear", '0');    /*[製造年][原始發照年]*/
        //_div4.find('#iptFRDATES,#iptCCDATES').attr("maxYear", '0');     /*[強制保期(起)][任意保期(起)]*/
        _div4.find('#iptCCDATES').attr("maxYear", '0');     /*[任意保期(起)]*/
        _div4.find('#iptFRDATEE,#iptCCDATEE').attr("maxYear", '2');     /*[強制保期(迄)][任意保期(迄)]*/
    };
    if (((new Date()).getMonth() + 1) > 2) {
        //[年份]大於2月時，則關閉去年度的選項(目前月份>2月時，則顯示今年度就好)
        _div4.find('#iptFRDATES,#iptCCDATES').attr("minYear", '0');     /*[強制保期(起)][任意保期(起)]*/
        _div4.find('#iptFRDATEE,#iptCCDATEE').attr("minYear", '0');     /*[強制保期(迄)][任意保期(迄)]*/
    };
    RegSelectDate();        //註冊下拉日曆
    RegSelectDateYear();    //註冊下拉年曆
    RegSelectDateMonth();   //註冊下拉月份
    registerLimitCLength4AllText(); //將畫面上所有文字輸入元件全部加上字數限制檢查
    /*--SDS傳入資料處理---------------------------------------*/
    consLogDate("-==InitComp_SDS傳入資料處理==-");
    //經手人
    //var agndata = $('#hidagntnum').val().split(',');
    //var branchdata = $('#hidbranchlist').val().split(',');
    //var agentIddata = $('#hidagentIdList').val().split(',');
    //_arrAgentList = agndata;
    //for (let i = 0; i < agndata.length; i++) {
    //    if (agndata[i].trim() != "") {
    //        _arrAgentData.push({ AgntNum: agndata[i], Branch: branchdata[i], AgntId: agentIddata[i] });
    //    };
    //};
    /*--基礎資料查詢-------------------------------------------*/
    consLogDate("-==InitComp_基礎資料查詢==-");
    if (sessionStorage["dtSys"] == undefined)
        sessionStorage["dtSys"] = JSON.stringify(getdata("/Quotation/GetLoadSysData", { sProgCode: 'QUOTATIONEDIT' }));                   //查詢[系統載入預設值]相關資訊
    var dtSys = JSON.parse(sessionStorage["dtSys"]);
    /*--下拉選單初始化-----------------------------------------*/
    consLogDate("-==InitComp_下拉選單初始化");
    getPolicyProducerData();    //招攬機構
    //setDDL_SYSCODEDT(dtSys, 'T016', '#selPrnWayNo');                                //[編號(2)](大保單號碼2)
    setDDL_SYSCODEDT(dtSys, 'T007', '#selMANLEVEL', ' ', true);                     //[強制等級]
    setDDL_SYSCODEDT(dtSys, 'T017', '#selAPLNation,#selCTLNation', false, '', 'TWN');   //[國別]
    setDDL_SYSCODEDT(dtSys, 'T006', '#selRELA,#selDriRELA');                        //[關係]選單 {要保人及被保險人資料}[與被保險人關係], {列名駕駛人}[與要保人關係]
    setDDL_SYSCODEDT(dtSys, 'T010', '#selBenRELA');                                 //[關係]選單 {受益人資料}[與列名駕駛人關係]
    setDDL_SYSCODEDT(dtSys, 'T011', '#selMANMVPZMTYPE,#selMVPZMTYPE');              //[車種] {強制險資料}[強制車種]{任意險資料}[任意車種]
    setDDL_SYSCODEDT(dtSys, 'T004', '#selAPLSex,#selCTLSex,#selDriCLTSEX');         //[性別]
    setDDL_SYSCODEDT(dtSys, 'T005', '#selAPLMarriage,#selCTLMarriage');             //[婚姻]
    setDDL_SYSCODEDT(dtSys, 'T008', '#selBONUS');                                   //[獎金]
    setDDL_SYSCODEDT(dtSys, 'T009', '#selDepRate', ' ', true);                      //[折舊率]
    setDDL_SYSCODEDT(dtSys, 'T019', '#selCalCode', '', '', 'AQ');                   //[計算]
    setDDL_SYSCODEDT(dtSys, 'ADD1', '#selAPLADD1,#selCTLADD1,#selBenADD1');         //[地址]
    setDDL_SYSCODEDT(dtSys, 'ANYBONUS', '#selAnyBonusCode');                        //[佣金]
    setDDL_SYSCODEDT(dtSys, 'INSUREDLIST', '#selZCVRTYPE');                         //[險種](包括已停售險種)
    setDDL_SYSCODEDT(dtSys, 'BODYFACTOR', '#selBodyFactor', ' ', true);             //[體係]
    setDDL_SYSCODEDT(dtSys, 'DUTYFACTOR', '#selDutyFactor', ' ', true);             //[責係]
    setDDL_SYSCODEDT(dtSys, 'ZCAMPANLIST', '#selZCAMPAN');                          //[活動方案]
    setDDL_SYSCODEDT(dtSys, 'PROGRAMLIST', '#selProgramCode', ' ', true);           //[活動代碼]
    setDDL_SYSCODEDT(dtSys, 'VENDORLIST', '#selVendorNo');                          //[車商代碼]
    /*--系統參數設定-------------------------------------------*/
    consLogDate("-==InitComp_系統參數設定==-");
    //_arrLoadSysData = dtSys;                                                        //系統參數資料集
    //_strBenList = getSysCode(dtSys, "BENLIST");                                     //受益人險種清單
    //_strThiefInsList = getSysCode(dtSys, "THIEFINSLIST");                           //車體/竊盜險種清單
    //_strGetLevelList = getSysCode(dtSys, "GETLEVELLIST");                           //取關貿係數險種清單
    //_intRangeMax = parseInt(getSysCode(dtSys, "RANGEMAX"));                         //[重置價格]上限值
    //_intRangeMin = parseInt(getSysCode(dtSys, "RANGEMIN"));                         //[重置價格]下限值
    //$('#divQuoteDate').data("DrunkAmt", getSysCode(dtSys, "DRUNKAMT"));             //酒駕金額罰金
    //$('#divQuoteDate').data("InsAgrList", getSysCode(dtSys, "INSAGRDRI"));          //限駕險種清單
    /*--其他特殊註解處理---------------------------------------*/
    consLogDate("-==InitComp_其他特殊註解處理==-");
    setTimeout(function () {
        $('#iptCNTBRANCH').attr('placeholder', '編號(外部通路專用)');           //業務人員編號
        $('#iptAPLCustID,#iptCTLCustID').attr('placeholder', 'ID/統編');        //要保人ID/公司統編
        $('#iptAPLRepresentative,#iptCTLRepresentative').attr('placeholder', '代表人姓名');           //代表人
        $('#iptCTLADDPot,#iptAPLADDPot').attr('placeholder', '3碼郵遞區號');    //郵遞區號
        $('#iptCTLADDO,#iptAPLADDO').attr('placeholder', '地址');               //地址        
    }, 70); //因為public.js裡設定50，所以這邊設定要大於50
    /*--selectpicker元件設定處理-------------------------------*/
    consLogDate("-==InitComp_selectpicker元件設定處理==-");
    /*--元件底色設定處理---------------------------------------*/
    $('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%);');     ///查詢式下拉選單，底色改為白色
};
//初始化_元件事件
function InitEvent() {
    //強制險/任意險/受益人資料 顯示隱藏事件
    $("#chkMan,#chkAny,#chkBen").on("change", function (e) {
        var isChk = this.checked;
        var thisObj = $(this);
        var sObjNM = e.target.id;
        var chkMan = _div4.find("#chkMan");
        var chkAny = _div4.find("#chkAny");
        if (isChk) {
            thisObj.parent().next().next('.panel-info').show(200);
        } else {
            thisObj.parent().next().next('.panel-info').hide(200);
        };
        //強制險不需輸入「製造年」，但任意險需要，故改必輸"
        //if (chkMan.prop('checked') && !chkAny.prop('checked')) {
        //    $('#selYRMANF').removeAttr('required').prev().children().hide();
        //} else {
        //    $('#selYRMANF').attr('required', true).prev().children().show();
        //};
        switch (sObjNM) {
            case "chkMan":      /*----強制險--------------------------*/
                if (chkMan.prop('checked')) {
                    if (_div3.find('#selMANMVPZMTYPE').val() == "") {
                        ctrlMsg('MSFO3', '[強制車種]必須輸入！', '#selMANMVPZMTYPE');
                        chkMan.prop("checked", false);
                        thisObj.parent().next().next('.panel-info').hide(200);
                        return;
                    };
                    //{任意險}[保險期間](同強制險)開啟
                    $('#chkCCDATE').attr('disabled', false);
                    //保期一年期的勾選可以預設為勾勾嗎 ? 因為多數案件仍為一年期居多. 不需要時再清空
                    if ($("#iptFRDATES").val() == '' && $("#iptFRDATEE").val() == '') { //若保期[起日]有值，則更新[迄日]
                        $('#chkFRDATE1').prop('checked', true);
                        $('#divQuoteDate').data("FRDateYear", "1");
                        $("#iptFRDATES").val(GetDay('')).blur();
                        $('#iptFRDATEE').val(AddYears($("#iptFRDATES").val(), 1)).blur();
                    };
                    //如果開啟[強制險]則執行[取級數(強制險)]相關欄位_事件
                    $('#iptFRDATEE').change();
                } else {
                    //[強制車種]清空
                    _div3.find('#selMANMVPZMTYPE').val('');
                    //[強制險保期]清空
                    _div4.find('#iptFRDATES,#iptFRDATEE').val('').blur();
                    //{任意險}[保險期間](同強制險)鎖住
                    $('#chkCCDATE').attr('disabled', true).prop('checked', false);
                    //如果關閉[強制險]則刪除[險種資料]21的險種
                    var dt = $('#tblInsuranceList').DataTable();
                    $.each(dt.data(), function (i, item) {
                        if (item.ZCVRTYPE == "21") { dt.row(i).remove().draw(); };
                    });
                };
                break;
            case "chkAny":      /*----任意險--------------------------*/
                if (chkAny.prop('checked')) {
                    if (_div3.find('#selMVPZMTYPE').val() == "") {
                        ctrlMsg('MSFO3', '[任意車種]必須輸入！', '#selMVPZMTYPE');
                        chkAny.prop("checked", false).parent().next().next('.panel-info').hide(200);
                        return;
                    };
                } else {
                    _div3.find('#selMVPZMTYPE').val('');        //清空[任意車種]
                    CreatInsDT({});             //清除險種資料
                    chkMan.change();            //若有勾選強制險，則新增強制險
                    _div4.find('#selDepRate,#iptAnySerialNo').val('');   //清空[折舊率]
                };
                break;
            case "chkBen":      /*----受益人--------------------------*/
                $('#chkNewPageBen').attr('disabled', !isChk);    //另起新頁
                if (!isChk) { $('#chkNewPageBen').prop("checked", false); };
                if (isChk) {
                    $("#panBenData").show(200);
                } else { $("#panBenData").hide(200); };
                setTimeout(function () {
                    $('#tblBeneList').DataTable().columns.adjust().responsive.recalc();
                }, 200);
                break;
        };
    });
    //[上年度保單號碼]焦點離開事件
    $("#iptPOLNUM").on("blur", function (e) {
        if (this.value != '') {
            ShowMsgInElmDisappear('#btnQryPOLNUM', '請按我查詢！');
        };
    });
    //[上年度強制證號]焦點離開事件
    $("#iptOLDPOLNUM").on("blur", function (e) {
        if (this.value != '') {
            ShowMsgInElmDisappear('#btnQryOLDPOLNUM', '請按我查詢！');
        };
    });
    //初始化 selectpicker tab 鍵事件
    BindSelpikTabEvent();
    //[廠型]初始化事件
    _div3.find("#selZMAKE").SetKeyinFunction({
        waitTime: 350,
        width: 140,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            consLogDate("--selZMAKE_Keying_Start--");
            var OldKey = getObjToVal(_divQ.data("CarMakeOldKey"));
            var inputKey = (e.val().toUpperCase());
            inputKey = inputKey.replace(/'/g, '');  //20190926 modify by eric 廠牌輸入'會發生錯誤

            var seldata = [];
            if ((_arrZMAKEList.length == 0 && inputKey.length >= 2) || (inputKey.length >= 2 && OldKey.length > 1 && OldKey.substr(0, 2) != inputKey.substr(0, 2))) {         //查詢資料庫
                consLogDate("selZMAKE_Keying_資料庫查詢(S),Key:[" + inputKey + "]");
                _arrZMAKEList = getdata("/Quotation/GetDDL_ZMAKE", { sMakeDesc: inputKey });
                seldata = _arrZMAKEList;
                _divQ.data("CarMakeOldKey", inputKey);
                consLogDate("selZMAKE_Keying_資料庫查詢(E),Count:[" + _arrZMAKEList.length + "]");
            } else if (_arrZMAKEList.length > 0 && inputKey.length >= 2) {   //查詢暫存區
                consLogDate("selZMAKE_Keying_暫存區查詢(S)");
                seldata = $.grep(_arrZMAKEList, function (x) { return x.VALUE.indexOf(inputKey) > -1 || x.TEXT.indexOf(inputKey) > -1 });
                consLogDate("selZMAKE_Keying_暫存區查詢(E)");
            } else if (_arrZMAKEList.length > 0 && inputKey.length < 2) {    //清空暫存區
                consLogDate("selZMAKE_Keying_清空暫存區(S)");
                _arrZMAKEList = [];
                consLogDate("selZMAKE_Keying_清空暫存區(E)");
            };
            var selObj = $(select);
            if (seldata.length > 0) {
                consLogDate("selZMAKE_Keying_下拉內容組合(S)");
                var OptionHtml = '';
                $.each(seldata, function (index, data) {
                    //搜尋時第一筆資料先暫存
                    SetSelPikFirSearchItem(index, data.VALUE + '~|~' + data.TEXT);
                    OptionHtml += "<option value='" + data.VALUE + "'>" + data.VALUE + ' - ' + data.TEXT + "</option>"
                });
                selObj.append(OptionHtml);
                selObj.selectpicker('refresh');
                title.html("");
                consLogDate("selZMAKE_Keying_下拉內容組合(E)");
            }
            else {
                selObj.selectpicker('refresh');
                if (inputKey.length > 1) {
                    title.html("查無資料，請重新輸入關鍵字");
                } else {
                    selObj.append(_strHotCar).selectpicker('refresh');
                    title.html("請輸入至少2個關鍵字");
                };
                //搜尋不到時清除暫存值
                BindSelpikTabEvent.spkVal = '';
            }
            consLogDate("--selZMAKE_Keying_End--");
        }
    });
    //[廠型]選取事件
    _div3.find("#selZMAKE").on("change", function () {
        removeMsgInElm('#selZMAKE');   //訊息移除
        var sVal = _div3.find("#selZMAKE").val();
        var iptRESETPRICE = _div3.find('#iptRESETPRICE');       /*重置價格*/
        iptRESETPRICE.val('');
        if (sVal == "") { _div3.find('#selMANMVPZMTYPE,#selMVPZMTYPE').val(''); return; };
        //解析[廠牌名稱]取得CC數及乘載
        var sCarName = _div3.find("#selZMAKE").find(':selected').text();
        var sRetStr = '';
        $.ajax({
            url: "/Quotation/GetCarZCCaLoad",
            type: "POST",
            dataType: "text",
            async: false,
            data: { CarName: sCarName },
            success: function (data) { sRetStr = data; },
            error: AjaxError
        });
        if (sRetStr.split('|').length > 1) {
            _div3.find('#iptZCC').val(sRetStr.split('|')[0]);       /*CC數*/
            _div3.find('#iptZCARRY').val(sRetStr.split('|')[1]);    /*承載*/
        };
        //讀取[廠型]相關資訊
        var dt = getdata("/Quotation/GetZMAKEInfo", { sMakeCD: sVal });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
            iptRESETPRICE.attr('oldval', getObjToVal(dt[0].CARPRICE)).val(getObjToVal(dt[0].CARPRICE)).blur();          /*重置價格*/
            setDDL_INS('#selMANMVPZMTYPE', getObjToVal(dt[0].CARManList));    /*強制車種*/
            setDDL_INS('#selMVPZMTYPE', getObjToVal(dt[0].CARAnyList));       /*任意車種*/
            _div3.find('#selMANMVPZMTYPE,#selMVPZMTYPE').prepend("<option value=''></option>").val('');                 /*[車種]預設空白*/
            if (_div3.find('#iptZCC').val() == '') { _div3.find('#iptZCC').val(getObjToVal(dt[0].CARZCC)) };            /*排氣量*/
            if (_div3.find('#iptZCARRY').val() == '') { _div3.find('#iptZCARRY').val(getObjToVal(dt[0].CARLoad)) };     /*乘載(人/噸)*/
            //[強制車種19預設帶入]特別處理
            if (!$('#iptQUOTENO').data('isSysPass') && _div2.find('#rdoCTLCustType:checked').val() == "C") {
                /*************************************************************
                    法人點選車種自小貨時, 請代入 19 – 車種 公司行號自小貨 
                    被保險人為法人時，只要強制車種內車種19時，預設先帶19
                    教育訓練時要告知若試行, 造成錯誤太多, 則將刪除此項功能
                **************************************************************/
                _div3.find('#selMANMVPZMTYPE').val("19");
            };
        };
        //[CC數]特別處理
        if (_div3.find('#iptZCC').val().indexOf('.') > -1) {
            _div3.find('#iptZCC').val(Math.floor(_div3.find('#iptZCC').val()));
        };
        //清空[險種資料]保險費
        clrInsTBPremium();
        ////讀取[重置價格]
        //var dt = getdata("/Quotation/GetRESETPRICE", { sMakeCD: sVal });
        //if (dt.length > 0) {
        //    if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        //    iptRESETPRICE.attr('oldval', getObjToVal(dt[0].LIST)).val(getObjToVal(dt[0].LIST)).blur();
        //    iptRESETPRICE.data('oldval', getObjToVal(dt[0].LIST));
        //};
        ////讀取限制車種清單
        //var limitcartype = "";
        //dt = getdata("/Quotation/GetLimitCarType", { sMakeCD: sVal });
        //if (dt.length > 0) {
        //    if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        //    limitcartype = dt[0].LIST
        //    _divQ.data("LimitCarType", limitcartype);
        //};
        ////移除非限制車種以外的選項
        //setDDL_SYSCODEDT(_arrLoadSysData, 'T011', '#selMANMVPZMTYPE');  //[強制車種]
        //_div3.find('#selMANMVPZMTYPE >option').each(function (i, item) {
        //    if (limitcartype.indexOf(item.value) == -1) {
        //        _div3.find('#selMANMVPZMTYPE').find('option[value="' + item.value + '"]').remove();
        //    };
        //    //[強制車種19預設帶入]特別處理
        //    if (!$('#iptQUOTENO').data('isSysPass') && _div2.find('#rdoCTLCustType:checked').val() == "C" && item.value == "19") {
        //        /*************************************************************
        //          法人點選車種自小貨時, 請代入 19 – 車種 公司行號自小貨 
        //          被保險人為法人時，只要強制車種內車種19時，預設先帶19
        //          教育訓練時要告知若試行, 造成錯誤太多, 則將刪除此項功能
        //        **************************************************************/
        //        _div3.find('#selMANMVPZMTYPE').val("19");
        //    };
        //});
        //setDDL_SYSCODEDT(_arrLoadSysData, 'T011', '#selMVPZMTYPE');     //[任意車種]
        //_div3.find('#selMVPZMTYPE >option').each(function (i, item) {
        //    if (limitcartype.indexOf(item.value) == -1) {
        //        _div3.find('#selMVPZMTYPE').find('option[value="' + item.value + '"]').remove();
        //    };
        //});
    });
    ///----===={經手人/業務員資料}區塊_S=================================----
    //[經手人]初始化事件
    _div1.find("#selAGNTNUM").SetKeyinFunction({
        waitTime: 500,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            let data = {};
            e.val(e.val().toUpperCase());
            var OptionHtml = '';
            if (e.val().length > 0) {
                data = _arrAgentList.filter(function (x) { return x.indexOf(e.val()) > -1 });
            };
            if (data.length > 0) {
                $.each(data, function (index, data) {
                    //搜尋時第一筆資料先暫存
                    SetSelPikFirSearchItem(index, data.VALUE + '~|~' + data.TEXT);
                    OptionHtml += "<option value='" + data + "'>" + data + "</option>"
                });
                var selObj = $(select);
                selObj.append(OptionHtml);
                selObj.selectpicker('refresh');
                title.html("請輸入關鍵字");
            } else {
                //搜尋不到時清除暫存值
                BindSelpikTabEvent.spkVal = '';
                $(select).selectpicker('refresh');
                title.html("查無資料，請重新輸入關鍵字");
            }
        }
    });
    //[經手人]選取事件
    _div1.find("#selAGNTNUM").on("change", function () {
        removeMsgInElm('#selAGNTNUM');   ///訊息移除
        var sVal = getObjToVal(_div1.find('#selAGNTNUM').val());
        if (sVal == '') { return; }
        //--==[單位別][經手人ID]_處理=====================================================--
        consLogDate("--selAGNTNUM_change[單位別][經手人ID]_處理");
        var sAgentId = '';
        var data = _arrAgentData.filter(function (x) { return x.AgntNum == sVal; });
        $.each(data, function (index, data) {
            _div1.find('#iptBranchNo').val(getObjToVal(data.Branch).trim());    //單位別
            sAgentId = getObjToVal(data.AgntId);                //經手人ID
        });
        //--==車商代碼_處理================================================================--
        consLogDate("--selAGNTNUM_change[車商代碼]_處理");
        /*經手人代號前2碼為BD者，即為[和安經手人]。為[和安經手人]時才開放[車商代碼]*/
        var isNone = (sVal.substr(0, 2) == 'BD') ? "" : "none";
        _div1.find('#selVendorNo,#iptVendorSalesNo').parent().attr('style', 'display:' + isNone).val('');
        /*20190227 UPD BY WS-MICHAEL 當經手人為BD開頭時(車商)，要隱藏[業務人員編號]*/
        var isChtNone = (sVal.substr(0, 2) == 'BD') ? "none" : "";
        _div1.find('#iptCNTBRANCH').parent().attr('style', 'display:' + isChtNone).val('');
        //--==付款方式_處理================================================================--
        consLogDate("--selAGNTNUM_change[付款方式]_處理");
        setDDL_SYSCODEDT(_arrLoadSysData, 'T003', '#selPAYWAY', false, '', 'D000', true);            /*[付款方式]*/
        //--==查詢資料_處理================================================================--
        consLogDate("--selAGNTNUM_change[查詢資料]_處理");
        var dt = getdata("/Quotation/GetAgntInfo", { KeyWord: sVal, sAgntID: sAgentId });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
            _divQ.data("CHL_Code", dt[0].CHL);                                          //通路別代碼
            _divQ.data("SalesNo", dt[0].SalesNo);                                       //服務代碼/業務代號
            _divQ.data("AgentType", getObjToVal(dt[0].AGTYPE));                         //經手人類別
            _div1.find('#iptCHL1').val(getObjToVal(dt[0].CHL) + ' - ' + getObjToVal(dt[0].CHLDESC)).change();    //CHL
            _div1.find('#iptAGNTNAME').val(getObjToVal(dt[0].AGNTDESC));                //經手人名稱
            //--登入者為[收費員]特別處理_S-------------
            if ($('#hidTollClterData').val() == '') {
                _div1.find('#iptSalesmanRegNo').val(getObjToVal(dt[0].SalesmanRegNo));      //業務員登錄字號
                _div1.find('#iptGenareaNM').val(getObjToVal(dt[0].GENAREANM));              //客服
            };
            //--登入者為[收費員]特別處理_E-------------
            _div1.find('#iptAgentTEL').val(getObjToVal(dt[0].TEL));                     //電話
            _div1.find('#iptAgentFAX').val(getObjToVal(dt[0].FAX));                     //傳真
            _div1.find('#iptAgentEMail').val(getObjToVal(dt[0].EMAIL));                 //E-MAIL
            _div1.find('#selVendorNo').val(getObjToVal(dt[0].VendorNo));                //車商代碼            
            setDDL_INS('#selZCAMPAN', getObjToVal(dt[0].ZCAMPANLIST));                  //設定[活動方案]清單
            _divQ.data("ZCAMPANLIST", getObjToVal(dt[0].ZCAMPANLIST));
            _div4.find('#selZCAMPAN').prepend($('<option></option>').val('').text('')).val(''); //插入空白並預設
            var dtPay = getdata("/Quotation/ChkPAYPLANC012", { sAGNTNUM: sVal });       //如果經手人不可選擇C012分期付款
            if (dtPay.length > 0) {
                if (dtPay.length === 1 && typeof (dtPay[0].MSG) != "undefined") {
                    _div4.find('#selPAYWAY').find('option[value="C012"]').remove();     //移除[付款方式]:"C012"(分期付款)
                };
            };
        } else {
            _div1.find('#divQuoteDate').data("CHL_Code", '');           //通路別代碼
            _div1.find('#iptCHL1').val('').change();                    //清空
            _div1.find('#iptBranchNo,#iptGenareaNM,#iptAGNTNAME,#iptSalesmanRegNo').val('');
            _div1.find('#iptAgentTEL,#iptAgentFAX,#iptAgentEMail').val('');
            ShowMsgInElm('#selAGNTNUM', '查無經手人相關資料');
        };
        //--==[業務人員編號]&[大保單號碼]資料清空_處理================================================================--
        consLogDate("--selAGNTNUM_change[業務人員編號]&[大保單號碼]_處理");
        _div1.find('#iptCNTBRANCH,#iptAmwayNo,#selPrnWayNo').val('');
        _divQ.data('AgentSalesName', "");            //業務員名稱
    });
    //[單位別]焦點離開事件(20181221 DEL BY WS-Michael 只保留[下一步]時檢核)
    ////$("#iptBranchNo").on("blur", function (e) {
    ////    var sVal = getObjToVal($('#iptBranchNo').val());
    ////    if (sVal == "") { return; };
    ////    chkCntbranch("#iptBranchNo");
    ////    e.preventDefault();
    ////    e.stopImmediatePropagation();
    ////});
    //[單位別]改變事件
    $("#iptBranchNo").on("change", function (e) {
        console.log("iptBranchNo.change()");
        //$('#btnUnCTLCustID,#btnUnAPLCustID').click();
        //被保險人
        $('#btnUnCTLCustID').parent().hide();
        _div2.find("#iptCTL_CLNTNUM").val('').parent().hide();  /*客戶代碼*/
        _div2.find("#iptCTLCustID").data("Is70BNO", "");        /*是否有70單位別*/
        _div2.find("#iptCTLCustID").data("IsPEND", "");         /*是否有未決賠案*/
        //清空欄位
        $('#iptCTLCustID,#iptCTLName,#selCTLSex,#selCTLBirthdayY,#selCTLBirthdayM,#selCTLBirthdayD').val('');
        $('#iptCTLRepresentative,#selCTLMarriage,#iptCTLOfficeTel,#iptCTLHomeTel,#iptCTLCellPhone,#iptCTLFax,#iptCTLEmail,#selCTLADD1,#selCTLADD2,#iptCTLADDPot,#iptCTLADDO').val('');
        //預設值
        $('#selCTLNation').val('TWN');
        $("#rdoCTLCustType[value='P']").prop("checked", true).change();
        //要保人
        $('#btnUnAPLCustID').parent().hide();
        _div2.find("#iptAPL_CLNTNUM").val('').parent().hide();  //客戶代碼
        _div2.find("#iptAPLCustID").data("Is70BNO", "");        //是否有70單位別
        _div2.find("#iptAPLCustID").data("IsPEND", "");         //是否有未決賠案
        //清空欄位
        $('#selAPLNation,#iptAPLCustID,#iptAPLName,#selAPLSex,#selAPLBirthdayY,#selAPLBirthdayM,#selAPLBirthdayD').val('');
        $('#iptAPLRepresentative,#selAPLMarriage,#iptAPLOfficeTel,#iptAPLHomeTel,#iptAPLCellPhone,#iptAPLFax,#iptAPLEmail,#selAPLADD1,#selAPLADD2,#iptAPLADDPot,#iptAPLADDO').val('');
        //預設值
        $('#selAPLNation').val('TWN');
        $("#rdoAPLCustType[value='P']").prop("checked", true).change();
    });
    //[業務人員編號]焦點離開事件
    $("#iptCNTBRANCH").on("blur", function (e) {
        var sVal = this.value;
        if (sVal == '') { return; };
        var sAGNTNUM = _div1.find("#selAGNTNUM").val();
        if (sAGNTNUM == '') { return; };
        //20200206 ADD BY MICHAEL 若為[內部通路]的經手人，則不查詢GetAgntSalesInfo，因為[經手人]選取事件，已經帶出[業務員名稱][業務員登錄字號]。[經手人類別]第1碼非B/X/D(5碼或8碼和泰產險業務員)，則為[內部通路]
        if (('B|X|D').indexOf(_divQ.data("AgentType").substr(0, 1)) == -1) { return; };
        var dt = getdata("/Quotation/GetAgntSalesInfo", { sAgentNo: sAGNTNUM, sLifeNo: sVal });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
            _divQ.data('AgentSalesName', getObjToVal(dt[0].AgentSalesName));            //業務員名稱
            _div1.find('#iptSalesmanRegNo').val(getObjToVal(dt[0].SalesmanRegNo));      //業務員登錄字號
        };
        //chkCntbranch("#iptCNTBRANCH");  //(20181221 DEL BY WS-Michael 只保留[下一步]時檢核)
        //e.preventDefault();
        //e.stopImmediatePropagation();
    });
    //{經手人/業務員資料}[通路別][CHL1]選取事件
    $("#iptCHL1").on("change", function () {
        var val = _divQ.data("CHL_Code");
        setDDL_SYSCODE('#selCHL2', ' ', 'T000', val);
        //非10/40通路, 應鎖住不可修改第二欄
        _div1.find('#selCHL2').attr('disabled', !(val == "10" || val == "40"));
        //通路別代號應綁強制險優惠,若為40 才可開放強制險顯優惠欄位
        _div4.find('#iptSPECIAL').attr('disabled', !(val == "40"));
    });
    //{經手人/業務員資料}[通路別][CHL2]選取事件
    $("#selCHL2").on("change", function () {
        var val = $('#selCHL2').val();
        _divQ.data("CHL_Code", val);
        _div1.find('#iptCHL1').val(_div1.find('#selCHL2').find('option[value="' + val + '"]')[0].text).change();
        _div1.find('#selCHL2').val('');
        //若修改[通路別]時，則清空[優惠]欄位
        _div4.find('#iptSPECIAL').val('');
    });
    //{經手人/業務員資料}[整批業務編號]焦點離開事件
    $('#iptAmwayNo').on("blur", function (e) {
        var sVal = getObjToVal($('#iptAmwayNo').val());
        if (sVal != "") {
            chkAgntAmwayno();
            e.preventDefault();
            e.stopImmediatePropagation();
        };
    });
    //{經手人/業務員資料}[收費員代碼]焦點離開事件
    $('#iptTollClterNo').on("blur", function (e) {
        chkTollClterNo();
        //--登入者為[收費員]特別處理_S-------------
        if ($('#hidTollClterData').val() != '') {
            _div1.find('#iptGenareaNM').val($('#divQuoteDate').data("TOLLCLTERNAME"));     /*收費員名稱*/
            _div1.find('#iptSalesmanRegNo').val($('#divQuoteDate').data("TOLLCLTERREGNO"));     //業務員登錄字號
        };
        //--登入者為[收費員]特別處理_E-------------
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    ///----===={經手人/業務員資料}區塊_E=================================----
    //[要保人ID]焦點離開事件
    $('#iptAPLCustID').on("blur", function (e) {
        if (this.value == '') { return; }
        removeMsgInElm('#' + e.target.id);   //訊息移除
        this.value = this.value.toUpperCase();  //轉大寫
        var custtype = $('#rdoAPLCustType:checked').val();
        var custnation = $('#selAPLNation').val();
        chkID('#' + e.target.id, custtype, custnation);
        e.preventDefault();
        e.stopImmediatePropagation();
        setSex(custtype, custnation, this.value, 'selAPLSex');  //自動帶入性別
    });
    //[被保險人ID]焦點離開事件
    $('#iptCTLCustID').on("blur", function (e) {
        if (this.value == '') { return; }
        removeMsgInElm('#' + e.target.id);   //訊息移除
        this.value = this.value.toUpperCase();  //轉大寫
        var custtype = $('#rdoCTLCustType:checked').val();
        var custnation = $('#selCTLNation').val();
        chkID('#' + e.target.id, custtype, custnation);
        e.preventDefault();
        e.stopImmediatePropagation();
        setSex(custtype, custnation, this.value, 'selCTLSex');  //自動帶入性別
    });
    //[被保險人ID,生日,牌照]選取事件
    $('#iptCTLCustID,#iptCTLBirthday,#iptZREGNUM').on("change", function (e) {
        if (_div4.find('#iptForceSerialNo').val() != '') {
            _div4.find('#iptForceSerialNo').val('');    //清空[強制序號]
        };
        if (_div4.find('#iptAnySerialNo').val() != '') {
            _div4.find('#iptAnySerialNo').val('');      //清空[任意序號]
        };
        clrInsTBPremium();                          //清空[險種資料]保險費
        var objNM = e.target.id;                      /*異動物件名稱*/
        if (objNM == 'iptZREGNUM') {
            ctrlIns.UnlockProceedArea("ALL");   //20200312 ADD BY MICHAEL 若有異動[牌照]就要清空[舊保單號碼]
        }
    });
    //[付款方式]選取事件
    $('#selPAYWAY').on("change", function () {
        var key = $('#selPAYWAY').val();
        if (key != "") {
            //查詢_付款方式(一般)(繳別)(01:月繳,02:年繳)
            var syscode = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'T003_1' && x.VALUE == key; });
            if (syscode.length > 0) { $('#divQuoteDate').data("Paytype", getObjToVal(syscode[0].TEXT)); };
        };
        CreatInsDT($('#tblInsuranceList').DataTable().data());
        insuredDT();
    });
    //[客戶類別]選取事件
    $('#rdoAPLCustType,#rdoCTLCustType').on("change", function (e) {
        var objNM = e.target.name;
        var val = $('input[name=' + objNM + ']:checked').val();
        var iptNM = $(this).attr("openinput");
        $('#divInsurerData span[' + iptNM + ']').show();
        $('#divInsurerData span[' + iptNM + ']').parent().parent().hide();
        $('#divInsurerData span[' + iptNM + '=' + val + ']').parent().parent().show();
        $('#divInsurerData input[' + iptNM + ']').parent().hide();
        $('#divInsurerData input[' + iptNM + '=' + val + ']').parent().show();
        if (objNM == "rdoAPLCustType" && val == "C") {
            $("#selAPLNation").val("TWN");
            $("#iptAPLBirthday,#selAPLSex,#selAPLMarriage,#iptAPLHomeTel").val('');
        }
        else if (objNM == "rdoCTLCustType" && val == "C") {
            $("#selCTLNation").val("TWN");
            $("#iptCTLBirthday,#selCTLSex,#selCTLMarriage,#iptCTLHomeTel").val('');
        }
    });
    //{要保人及被保險人資料}[地址1]
    $('#selAPLADD1,#selCTLADD1').on("change", function () {
        var key = $(this).val();
        var add2 = $('#' + $(this).attr("add2"));
        var addo = $('#' + $(this).attr("addo"));
        //設定區域
        if (key == "") { add2.empty(); }
        else { setDDL_ADD('#' + $(this).attr("add2"), ' ', key); };
        addo.val(addo.val().replace($(this).data("oldtext"), ''));      //清除舊資料
        addo.val(addo.val().replace(add2.data("oldtext"), ''));         //清除舊資料
        var add1text = getSelText('#' + $(this).context.id, key).replace(/[ ]/g, '');       //讀取[縣市別]文字
        addo.val(add1text + addo.val().replace(/[ ]/g, ''));            //加上新資料
        $(this).data("oldtext", add1text);                              //設定新資料至[oldtext]
    });
    //{要保人及被保險人資料}[地址2]
    $('#selAPLADD2,#selCTLADD2').on("change", function () {
        var key = $(this).val();
        var add1 = $('#' + $(this).attr("add1"));   //縣市別
        var addo = $('#' + $(this).attr("addo"));   //鄉鎮區
        var addp = $('#' + $(this).attr("addp"));   //郵遞區號
        var add1text = getSelText('#' + $(this).attr("add1"), add1.val()).replace(/[ ]/g, '');      //讀取[縣市別]文字
        addo.val(addo.val().replace(add1.data("oldtext"), ''));         //清除舊資料
        addo.val(addo.val().replace($(this).data("oldtext"), ''));      //清除舊資料
        var add2text = getSelText('#' + $(this).context.id, key).replace(/[ ]/g, '');               //讀取[區域別]文字
        add2text = add1text == add2text ? "" : add2text;
        addo.val(add1text + add2text + addo.val().replace(/[ ]/g, '')); //加上新資料
        addp.val(key);
        $(this).data("oldtext", add2text);                              //設定新資料至[oldtext]
    });
    //{要保人及被保險人資料}[地址郵遞區號]
    $('#iptAPLADDPot,#iptCTLADDPot').on("blur", function (e) {
        removeMsgInElm('#' + e.target.id);   //訊息移除
        var iptObj = $(this);
        var sValue = iptObj.val();
        if (sValue == '') { return; };
        var add1 = $('#' + iptObj.attr("add1"));        //地址1
        var add2 = $('#' + iptObj.attr("add2"));        //地址2
        var adddt = getdata("/Quotation/GetDDL_Address", { sCityNo: "", sAreaNo: sValue });
        if (adddt != null) {
            if (adddt.length > 0) {
                add1.val(getObjToVal(adddt[0].VALUE)).change();     //選擇地址1
                add2.val(iptObj.val()).change();                    //選擇地址2
            } else {
                iptObj.val('');     //清空
                ShowMsgInElm('#' + e.target.id, '查無資料!');
            };
        } else {
            iptObj.val('');         //清空
            ShowMsgInElm('#' + e.target.id, '查無資料!');
        };
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    //[E-Mail]焦點離開事件
    $('#iptAPLEmail,#iptCTLEmail').on("blur", function (e) {
        removeMsgInElm('#' + e.target.id);   //訊息移除
        if (this.value == '') { return; };
        if (!checkMail(this.value)) { ShowMsgInElm('#' + this.id, '輸入錯誤!'); };
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    //[手機號碼]焦點離開事件
    //$('#iptCTLCellPhone,#iptCTLCellPhone').on("blur", function (e) {
    //    removeMsgInElm('#' + e.target.id);   //訊息移除
    //    if (this.value == '') { return; };
    //    if (!checkMobil(this.value)) { ShowMsgInElm('#' + this.id, '手機號碼格式不正確！'); };
    //    e.preventDefault();
    //    e.stopImmediatePropagation();
    //});
    //[與被保險人關係]選取事件
    $('#selRELA').on("change", function (e) {
        $('#chkISAPL').prop('checked', $('#selRELA').val() == "01")
        if ($('#selRELA').val() == "01") {
            $('#chkISAPL').change();    //關係若為01本人，則執行[同要保人]
        } else {
            $('#divAPLData').show();    //顯示[被保險人資料]區
        };
        chkRELA();
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    //[同被保險人]選取事件
    $('#chkISAPL').on("change", function () {
        var divCTL = $('#divCTLData');
        var divIns = $('#divInsurerData');
        if (this.checked) {
            divCTL.find("#rdoCTLCustType[value='" + $('#rdoAPLCustType:checked').val() + "']").prop("checked", true).change();  //客戶類別
            setDDLIsNullAdd('#selCTLNation', divIns.find('#selAPLNation').val());                           //國別
            divCTL.find('#iptCTLCustID').val(divIns.find('#iptAPLCustID').val());                           //ID/公司統編
            divCTL.find('#iptCTL_CLNTNUM').val(divIns.find('#iptAPL_CLNTNUM').val());                       //客戶代號
            divCTL.find('#iptCTLCustID').data("Is70BNO", divIns.find('#iptAPLCustID').data("Is70BNO"));     //是否有70單位別
            divCTL.find('#iptCTLCustID').data("IsPEND", divIns.find('#iptAPLCustID').data("IsPEND"));       //是否有未決賠案
            divCTL.find('#iptCTLRepresentative').val(divIns.find('#iptAPLRepresentative').val());           //代表人
            divCTL.find('#iptCTLName').val(divIns.find('#iptAPLName').val());                               //姓名/公司名稱
            divCTL.find('#iptCTLBirthday').val(divIns.find('#iptAPLBirthday').val()).blur();                //生日
            divCTL.find('#selCTLSex').val(divIns.find('#selAPLSex').val());                                 //性別
            divCTL.find('#selCTLMarriage').val(divIns.find('#selAPLMarriage').val());                       //婚姻
            divCTL.find('#iptCTLOfficeTel').val(divIns.find('#iptAPLOfficeTel').val());                     //公司電話
            divCTL.find('#iptCTLHomeTel').val(divIns.find('#iptAPLHomeTel').val());                         //家用電話
            divCTL.find('#iptCTLCellPhone').val(divIns.find('#iptAPLCellPhone').val());                     //手機號碼
            divCTL.find('#iptCTLFax').val(divIns.find('#iptAPLFax').val());                                 //傳真號碼
            divCTL.find('#selCTLADD1').val(divIns.find('#selAPLADD1').val()).change();                      //地址1
            divCTL.find('#selCTLADD2').val(divIns.find('#selAPLADD2').val());                               //地址2
            divCTL.find('#iptCTLADDO').val(divIns.find('#iptAPLADDO').val());                               //地址3
            divCTL.find('#iptCTLADDPot').val(divIns.find('#iptAPLADDPot').val());                           //地址(郵遞區號)
            divCTL.find('#iptCTLEmail').val(divIns.find('#iptAPLEmail').val());                             //E-Mail
            divCTL.find('#selRELA').val('01');    //與被保險人關係固定為01
            divCTL.hide();    //隱藏[被保險人資料]區
        } else {
            divCTL.show();    //顯示[被保險人資料]區
            divCTL.find('input[type=text],input[type=tel],select').each(function (i, item) {
                $(item).val('');        //清空資料
                if (item.id == "selCTLADD1") {              //[地址1]執行變更事件
                    $(item).change();
                } else if (item.id == "selCTLNation") {     //[國別]預設值為TWN
                    $(item).val('TWN');
                };
            });
            divCTL.find("#rdoCTLCustType[value='P']").prop("checked", true).change();   //[客戶類別]預設為"個人"
        };
    });
    //[牌照]焦點離開事件
    $('#iptZREGNUM').on("blur", function (e) {
        chkZREGNUM();   //[牌照]檢核事件
        //ctrlIns.UnlockProceedArea("ALL");     //20200312 DEL BY MICHAEL 改到change()事件執行[若有異動[牌照]就要清空[舊保單號碼]]
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    //[製造年]選取事件
    $('#selYRMANF').on("change", function (e) {
        var sYRMANF = _div3.find('#selYRMANF').val();
        var sZMAKE = _div3.find("#selZMAKE").val();
        _div3.find('#selIssueYear').val(sYRMANF);
        if (sYRMANF != '' && sZMAKE != '' && e.target.id == 'selYRMANF') {
            var iptRESETPRICE = _div3.find('#iptRESETPRICE');
            var sRestPriceOldVal = iptRESETPRICE.val().replace(/[$,]/g, "");
            //iptRESETPRICE.val('');
            //讀取[重置價格]
            var dt = getdata("/Quotation/GetRESETPRICE", { sMakeCD: sZMAKE, sYEAR: sYRMANF });
            if (dt.length > 0) {
                if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; };
                //iptRESETPRICE.attr('oldval', getObjToVal(dt[0].LIST)).val(getObjToVal(dt[0].LIST)).blur();
                //iptRESETPRICE.data('oldval', getObjToVal(dt[0].LIST));
                var sGetRestPrice = getObjToVal(dt[0].LIST);
                if (parseInt(sRestPriceOldVal) > 0 && sGetRestPrice != sRestPriceOldVal) {
                    ConfirmBoxFnBtnName('提醒', '車籍資料(製造年)異動, 請確認重置價格是否要更新??', 'orange'
                        , function () {
                            iptRESETPRICE.attr('oldval', sGetRestPrice).val(sGetRestPrice).blur();
                            iptRESETPRICE.data('oldval', sGetRestPrice);
                        }
                        , function () { }
                        , "更新", " 維持原金額");
                } else {
                    iptRESETPRICE.attr('oldval', sGetRestPrice).val(sGetRestPrice).blur();
                    iptRESETPRICE.data('oldval', sGetRestPrice);
                }

            };
        };
        if (_div4.find('#iptForceSerialNo').val() != '') {
            _div4.find('#iptForceSerialNo').val('');    //清空[強制序號]
        };
        if (_div4.find('#iptAnySerialNo').val() != '') {
            _div4.find('#iptAnySerialNo').val('');      //清空[任意序號]
        };
        clrInsTBPremium();                          //清空[險種資料]保險費
    });
    //[製造月]選取事件
    $('#selMNMANF').on("change", function (e) {
        if (_div4.find('#iptForceSerialNo').val() != '') {
            _div4.find('#iptForceSerialNo').val('');    //清空[強制序號]
        };
        if (_div4.find('#iptAnySerialNo').val() != '') {
            _div4.find('#iptAnySerialNo').val('');      //清空[任意序號]
        };
        clrInsTBPremium();                          //清空[險種資料]保險費
    });
    //[強制保險期間]按下事件
    $('#chkFRDATE1,#chkFRDATE2').on("change", function (e) {
        ctrlIns.Date(e.target.id);
        //if (this.checked) {
        //    var sObjNM = e.target.id;
        //    var year = 0;
        //    if ($('#' + sObjNM).prop('checked')) {
        //        year = document.getElementById(sObjNM).value;
        //    };
        //    $('#divQuoteDate').data("FRDateYear", year);
        //    $('#chkFRDATE1').prop('checked', (year == '1'));
        //    $('#chkFRDATE2').prop('checked', (year == '2'));
        //    if ($("#iptFRDATES").val() == '') { //若保期[起日]有值，則更新[迄日]
        //        $("#iptFRDATES").val(GetDay('')).blur();
        //    };
        //    $('#iptFRDATEE').val(AddYears($("#iptFRDATES").val(), year)).blur().change();
        //    $('#chkCCDATE').change();   //如果有點選[任意保期]，則更新[任意起迄日期]
        //} else {
        //    $('#divQuoteDate').data("FRDateYear", '');
        //};
    });
    //[任意保險期間]按下事件
    $('#chkCCDATE').on("change", function (e) {
        ctrlIns.Date(e.target.id);
        //if (this.checked) {
        //    $('#iptCCDATES').val($("#iptFRDATES").val()).blur();
        //    $('#iptCCDATEE').val($("#iptFRDATEE").val()).blur();
        //};
    });
    //[強制車種]選取事件
    $('#selMANMVPZMTYPE').on("change", function (e) {
        openSelYRMANF();    /*開啟/關閉_[製造年]必填*/
        var sVal = this.value;
        if (sVal == "") { _div4.find('#chkMan').prop('checked', false).change(); return; };
        _div4.find('#chkMan').prop('checked', true).change();
        var dt = [];
        //承載單位(P-人,T-噸)
        dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'T002_1' && x.VALUE == sVal; });
        _strLoadType = (dt.length > 0) ? getObjToVal(dt[0].TEXT) : '';
        //彙總類別(C:汽車,M:機車)
        dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'T011_1' && x.VALUE == sVal; });
        _strCategory = (dt.length > 0) ? getObjToVal(dt[0].TEXT) : '';
        ////當[強制車種]為22時，[任意車種]則帶03 20191129 DEL BY MICHAEL CCF20765
        //改為當[強制車種]為22時，[任意車種]則帶22 20200116 ADD BY MICHAEL
        ////if (sVal == "22") { $('#selMVPZMTYPE').val("03"); };
        if (sVal == "22") {
            $('#selMVPZMTYPE').val("22");
            if ($('#selMVPZMTYPE').val() == null) {
                $('#selMVPZMTYPE').val('');
                MsgBox('錯誤', '任意險查無22車種，請洽核保人員！', 'red');
            }
        };
    });
    //[任意車種]選取事件
    $('#selMVPZMTYPE').on("change", function (e) {
        openSelYRMANF();    /*開啟/關閉_[製造年]必填*/
        var sVal = this.value;
        if (sVal == "") { _div4.find('#chkAny').prop('checked', false); return; };
        var dt = [];
        //承載單位(P-人,T-噸)
        dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'T002_1' && x.VALUE == sVal; });
        _strLoadType = (dt.length > 0) ? getObjToVal(dt[0].TEXT) : '';
        //彙總類別(C:汽車,M:機車)
        dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'T011_1' && x.VALUE == sVal; });
        _strCategory = (dt.length > 0) ? getObjToVal(dt[0].TEXT) : '';
        //[折舊率]顯示處理
        dt = getdata("/Quotation/GetCarNature", { sMVPZMTYPE: sVal });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; };
            var deprate = $('#selDepRate').val();
            if (getObjToVal(dt[0].CARNATURE) == "C") {
                setDDL_SYSCODE('#selDepRate', ' ', 'T009C', '', '', '', true);      //營業用[折舊率]
            } else {
                setDDL_SYSCODE('#selDepRate', ' ', 'T009', '', '', '', true);       //自用[折舊率]
            };
            if (deprate != "") { $('#selDepRate').val(deprate); };
        };
        _div4.find('#chkAny').prop('checked', true).change();
    });
    //[酒次]焦點離開事件
    $('#iptDrunkFreq').on("blur", function (e) {
        var key = parseInt($('#iptDrunkFreq').val());
        var drunkamt = parseInt($('#divQuoteDate').data("DrunkAmt"));
        if (isNaN(key) || isNaN(drunkamt)) { return; };
        $('#iptDrunkAmt').val(key * drunkamt).blur();
    });
    //[重置價格]選取事件
    $('#iptRESETPRICE').on("change", function (e) {
        if ($('#iptQUOTENO').data('isSysPass')) { return; };   //當[報價單編號]查詢帶入資料時/[清除]，不處理資料異動事件
        /*--===============[參數宣告]_處理_Start===============================--*/
        var objNM = '#' + e.target.id;                      /*異動物件名稱*/
        var obj = $(objNM);                                 /*異動物件*/
        var sOldVal = getObjToVal(obj.attr('oldval'));      /*異動前內容*/
        /**--===============[參數宣告]_處理_End=================================--*/
        if (!chkResetpriceRange()) { return; };             //檢核_[重置價格]上下限
        if (chkEditTotalInsurance()) {
            if (obj.val() != sOldVal && sOldVal != "") {
                ConfirmBox('請確認', '您已經異動[險種資料]相關欄位，請確認是否異動?', 'orange'
                    , function () {/*--[確認]--*/
                        clrInsTBPremium();                  //清空[險種資料]保險費
                        insuredDT()                         //險種資料相關資料處理
                        obj.attr('oldval', obj.val());      //將[新值]更新至[舊值]內
                    }
                    , function () {/*--[取消]--*/
                        setRevOldval(objNM);                /*還原舊值*/
                    }
                );
            };
        };
    });
    //[險種資料]相關欄位_事件([任意車種],[任意保期(起)],[任意保期(迄)],[乘載],[發照年],[折舊率])
    /*內包含[取級數(任意險)]相關欄位_事件([任意車種],[任意保期(起)],[任意保期(迄)])*/
    $('#selMVPZMTYPE,#iptCCDATES,#iptCCDATEE,#iptZCARRY,#selIssueYear,#selDepRate').on("change", function (e) {
        if ($('#iptQUOTENO').data('isSysPass')) { return; };   //當[報價單編號]查詢帶入資料時/[清除]，不處理資料異動事件
        /*--===============[參數宣告]_處理_Start===============================--*/
        var objNM = '#' + e.target.id;                      /*異動物件名稱*/
        var obj = $(objNM);                           /*異動物件*/
        var sOldVal = getObjToVal(obj.attr('oldval'));      /*異動前內容*/
        var isChang = false;                                /*是否確認異動*/
        var isChkIns = false;                               /*是否檢核險種資料*/
        //var MVPPREMSum = 0;                                 /*總保費*/
        var iptCCDATES = _div4.find('#iptCCDATES');         /*[任意保期(起)]*/
        var iptCCDATEE = _div4.find('#iptCCDATEE');         /*[任意保期(迄)]*/
        var iptAnySerialNo = _div4.find('#iptAnySerialNo'); /*[任意序號]*/
        /**--===============[參數宣告]_處理_End=================================--*/

        /**--===============[各別欄位異動]_處理_Start===========================--*/
        //20200110 DEL BY MICHAEL 移至[重置價格]選取事件
        //if (objNM == "#iptRESETPRICE") {        /*[重置價格]*/
        //    if (!chkResetpriceRange()) { return; };             //檢核_[重置價格]上下限
        //};

        //else if (objNM == "#iptCCDATES") {    /*[任意保期_起]*/
        //    let dateValue = obj.val();
        //    if (checkdate(dateValue)) {
        //        //[任意保期(迄)]自動+1年
        //        //iptCCDATEE.val(AddYears(dateValue, 1)).blur();
        //        //鎖住[計算]欄位，預設為'AQ'(年繳)
        //        //_div4.find('#selCalCode').val('AQ').attr('disabled', true);
        //        //若有[上年度保單號碼]則代表目前為[續保作業]，因為有異動日期，所以要清空。(這樣會變成純新件報價)
        //        if (_divQ.find('#iptPOLNUM').val() != '') { _divQ.find('#btnUnPOLNUM').click(); };
        //    };
        //} else if (objNM == "#iptCCDATEE") {    /*[任意保期_迄]*/
        //    //檢核_任意保期(起/迄)
        //    //chkDateSE(iptCCDATES, iptCCDATEE);          
        //    //若有[上年度保單號碼]則代表目前為[續保作業]，因為有異動日期，所以要清空。(這樣會變成純新件報價)
        //    if (_divQ.find('#iptPOLNUM').val() != '') { _divQ.find('#btnUnPOLNUM').click(); };
        //};
        /**--===============[各別欄位異動]_處理_End=============================--*/

        /**--===============[險種資料]_處理_Start===============================--*/
        //var dt = $('#tblInsuranceList').DataTable();
        //if (dt.data().length > 0) { //若[險種資料]有資料時，則需要清空
        //    isChkIns = true;
        //    //保險費加總
        //    MVPPREMSum = dt.rows().data().map(function (x) { return x.MVPPREM });
        //    MVPPREMSum = MVPPREMSum.length > 0 ? MVPPREMSum.reduce(function (x, y) { return parseInt(x) + parseInt(y) }) : 0;
        //    if (isNaN(MVPPREMSum)) { obj.attr('oldval', obj.val()); return; };    //若[保險費]清空，則不再提醒
        //    if (!isNaN(MVPPREMSum) && MVPPREMSum != 0) {
        //        if (obj.val() != sOldVal && sOldVal != "") {
        //            ConfirmBox('請確認', '您已經異動[險種資料]相關欄位，請確認是否異動?', 'orange'
        //                , function () {
        //                    clrInsTBPremium();      //清空[險種資料]保險費
        //                    insuredDT()                         //險種資料相關資料處理
        //                    iptAnySerialNo.val("");             //任意序號
        //                    obj.attr('oldval', obj.val());      //將[新值]更新至[舊值]內
        //                    isChang = true;
        //                    ctrlIns.Date(e.target.id);                      //[日期]連動處理+[計算]欄位
        //                    ctrlIns.UnlockProceedArea("1");                 //執行任意險區域解鎖 UnlockProceedArea(1) 參數1 為任意險區
        //                }
        //                , function () {/*--[否]---*/
        //                    obj.val(sOldVal);   /*將[舊值]更新回來*/
        //                    //判斷若異動欄位為[任意保期(起)],[任意保期(迄)]，則需要加上blur()事件
        //                    if (objNM == "#iptCCDATES" || objNM == "#iptCCDATEE") {
        //                        obj.blur();
        //                        iptCCDATEE.val(iptCCDATEE.attr('oldval')).blur();   //連帶[任意保期(迄)]也一起更新回來
        //                    };
        //                }
        //            );
        //        };
        //    }
        //    //else {
        //    //    ctrlIns.Date(e.target.id);                      //[日期]連動處理+[計算]欄位
        //    //    ctrlIns.UnlockProceedArea("1");                 //執行任意險區域解鎖 UnlockProceedArea(1) 參數1 為任意險區
        //    //}
        //}
        //else {
        //    ctrlIns.Date(e.target.id);                      //[日期]連動處理+[計算]欄位
        //    ctrlIns.UnlockProceedArea("1");                 //執行任意險區域解鎖 UnlockProceedArea(1) 參數1 為任意險區
        //}
        if (chkEditTotalInsurance()) {
            if (obj.val() != sOldVal && sOldVal != "") {
                ConfirmBox('請確認', '您已經異動[險種資料]相關欄位，請確認是否異動?', 'orange'
                    , function () {/*--[確認]--*/
                        clrInsTBPremium();      //清空[險種資料]保險費
                        insuredDT()                         //險種資料相關資料處理
                        iptAnySerialNo.val("");             //任意序號
                        obj.attr('oldval', obj.val());      //將[新值]更新至[舊值]內
                        isChang = true;
                        ctrlIns.Date(e.target.id);                      //[日期]連動處理+[計算]欄位
                        //ctrlIns.UnlockProceedArea("1");                 //執行任意險區域解鎖 UnlockProceedArea(1) 參數1 為任意險區
                    }
                    , function () {/*--[取消]--*/
                        setRevOldval(objNM);     /*還原舊值*/
                        //obj.val(sOldVal);   /*將[舊值]更新回來*/
                        ////判斷若異動欄位為[任意保期(起)],[任意保期(迄)]，則需要加上blur()事件
                        //if (objNM == "#iptCCDATES" || objNM == "#iptCCDATEE") {
                        //    obj.blur();
                        //    iptCCDATEE.val(iptCCDATEE.attr('oldval')).blur();   //連帶[任意保期(迄)]也一起更新回來
                        //};
                    }
                );
            };
        }
        else {
            //[任意險序號]不為空且([任意車種]或[任意保期(起)]或[任意保期(迄)]有異動)
            if (iptAnySerialNo.val() != "" && (objNM == "#selMVPZMTYPE" || objNM == "#iptCCDATES" || objNM == "#iptCCDATEE")) {
                ConfirmBox('請確認', '您已經異動[取級數(任意險)]相關欄位，請確認是否異動?', 'orange'
                    , function () {/*--[確認]--*/
                        iptAnySerialNo.val("");
                        obj.attr('oldval', obj.val());
                        ctrlIns.Date(e.target.id);                      //[日期]連動處理+[計算]欄位
                        //ctrlIns.UnlockProceedArea("1");                 //執行任意險區域解鎖 UnlockProceedArea(1) 參數1 為任意險區
                    }
                    , function () {/*--[取消]--*/
                        setRevOldval(objNM);     /*還原舊值*/
                        //obj.val(sOldVal);   /*將[舊值]更新回來*/
                        ////判斷若異動欄位為[任意保期(起)],[任意保期(迄)]，則需要加上blur()事件
                        //if (objNM == "#iptCCDATES" || objNM == "#iptCCDATEE") {
                        //    obj.blur();
                        //    iptCCDATEE.val(iptCCDATEE.attr('oldval')).blur();   //連帶[任意保期(迄)]也一起更新回來
                        //};
                    }
                );
            } else {
                ctrlIns.Date(e.target.id);                      //[日期]連動處理+[計算]欄位
                //ctrlIns.UnlockProceedArea("1");                 //執行任意險區域解鎖 UnlockProceedArea(1) 參數1 為任意險
                obj.attr('oldval', obj.val());
            };
        };
        /**--===============[險種資料]_處理_End=================================--*/

        /**--===============[任意險序號]_處理_Start=============================--*/
        //if (dt.data().length <= 0 || MVPPREMSum == 0) {
        //    //判斷[取級數(任意險)]相關欄位_事件([任意車種],[任意保期(起)],[任意保期(迄)])
        //    if (iptAnySerialNo.val() != "" && (objNM == "#selMVPZMTYPE" || objNM == "#iptCCDATES" || objNM == "#iptCCDATEE")) {
        //        ConfirmBox('請確認', '您已經異動[取級數(任意險)]相關欄位，請確認是否異動?', 'orange'
        //            , function () {
        //                iptAnySerialNo.val("");
        //                obj.attr('oldval', obj.val());
        //            }
        //            , function () {
        //                obj.val(sOldVal);
        //            }
        //        );
        //    } else {
        //        obj.attr('oldval', obj.val());
        //    };
        //};
        /**--===============[任意險序號]_處理_End===============================--*/

        /**--===============[專案代號]_處理_Start=============================--*/
        //if ($('#iptProjectNo').val() == "" && $("#selMVPZMTYPE").val() != "" && iptCCDATES.val() != "" && iptCCDATEE.val() != "") {
        //    /*56…400的規則是如果專案代號未輸入，投保車種為01/02/32/34 & 保單別為MAE時，專案代號會動入"PMOT9115"*/
        //    if (('01|02|32|34').indexOf($("#selMVPZMTYPE").val()) > -1) {
        //        getAgeFactor();     //讀取_年齡係數
        //        if ($('#divQuoteDate').data("QuotType") == "MAE") { $('#iptProjectNo').val('PMOT9115'); };
        //    };
        //};
        /**--===============[任意險序號]_處理_End===============================--*/
    });
    //[取級數(強制險)]相關欄位_事件([強制車種],[強制保期(起)],[強制保期(迄)])
    $('#selMANMVPZMTYPE,#iptFRDATES,#iptFRDATEE').on("change", function (e) {
        if ($('#iptQUOTENO').data('isSysPass')) { return; };   //當[報價單編號]查詢帶入資料時/[清除]，不處理資料異動事件
        var objNM = '#' + e.target.id;
        var selMANMVPZMTYPE = $('#selMANMVPZMTYPE');
        var iptFRDATES = $('#iptFRDATES');
        var iptFRDATEE = $('#iptFRDATEE');
        var iFRYear = parseInt($('#divQuoteDate').data("FRDateYear"));
        ////if (objNM == '#iptFRDATES' && checkdate(iptFRDATES.val())) {
        ////    if (!isNaN(iFRYear)) {
        ////        //[強制保期(起)]自動+{保險期間}年
        ////        //iptFRDATEE.val(AddYears(iptFRDATES.val(), iFRYear)).blur();
        ////        //$('#chkCCDATE').change();
        ////        if ($('#iptOLDPOLNUM').val() != '') { $('#btnUnOLDPOLNUM').click(); };
        ////    };
        ////} else if (objNM == '#iptFRDATEE' && !isNaN(iFRYear)) {
        ////    if (iptFRDATEE.val() != AddYears(iptFRDATES.val(), iFRYear)) {
        ////        //若有變動[強制保期(迄)]則[保險期間]清空
        ////        //$('#chkFRDATE1,#chkFRDATE2').prop('checked', false);
        ////        //$('#divQuoteDate').data("FRDateYear", '');
        ////        //$('#chkCCDATE').change();
        ////        if ($('#iptOLDPOLNUM').val() != '') { $('#btnUnOLDPOLNUM').click(); };
        ////    };
        ////};
        //檢核_強制保期(起/迄)
        //chkDateSE(iptFRDATES, iptFRDATEE);
        //當[強制車種],[強制保期(起)],[強制保期(迄)]有值時的處理。
        if (iptFRDATES.val() != "" && iptFRDATEE.val() != "" && selMANMVPZMTYPE.val() != "") {
            //自動帶入21強制險資料處理
            var dt = $('#tblInsuranceList').DataTable();
            if (dt.rows().data().filter(function (x) { if (x.ZCVRTYPE == '21') { return true; } }).length == 0) {
                var data21 = getdata("/Quotation/GetINSURED21INFO", {
                    sMVPZMTYPE: selMANMVPZMTYPE.val(), sCCDATES: iptFRDATES.val().replace(/[/]/g, "")
                });
                if (data21 != null) {
                    if (data21.length > 0) {
                        if (data21.length === 1 && typeof (data21[0].MSG) != "undefined") {
                            MsgBox('錯誤', data21[0].MSG, 'red'); $('#selZCVRTYPE').val(''); $.unblockUI(); return;
                        };
                        dt.row.add({
                            ZCVRTYPE: "21"
                            , ZCVRTYPENM: getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', '21')
                            , SUMINA: getObjToVal(getObjToVal($($.parseXML("<LIST>" + getObjToVal(data21[0].SUMINA) + "</LIST>")).find("TEXT")[0]).textContent)
                            , SUMINB: getObjToVal(getObjToVal($($.parseXML("<LIST>" + getObjToVal(data21[0].SUMINB) + "</LIST>")).find("TEXT")[0]).textContent)
                            , SUMINC: getObjToVal(getObjToVal($($.parseXML("<LIST>" + getObjToVal(data21[0].SUMINC) + "</LIST>")).find("TEXT")[0]).textContent)
                            , ZFACTORA: ''  //[係數一]21險種固定為空值
                            , ZFACTORB: ''  //[係數二]21險種固定為空值
                            , EXCESS: ''    //[自負額]21險種固定為空值
                            , MVPPREM: 0    //[保險費]預設為0
                            , InsMonth: 0   //[月繳保險費]預設為0
                            , InsOrder: 0   //[險種排序]21險種固定為0
                        }).draw();
                        insuredDT();
                    };
                };
            };
        };
        //當[強制險序號]有值時_處理
        if ($('#iptForceSerialNo').val() != "") {
            if ($(objNM).val() != $(objNM).attr('oldval') && getObjToVal($(objNM).attr('oldval')) != "") {
                ConfirmBox('請確認', '您已經異動[取級數(強制險)]相關欄位，請確認是否異動?', 'orange'
                    , function () {
                        $('#iptForceSerialNo').val("");
                        $(objNM).attr('oldval', $(objNM).val());
                        ctrlIns.Date(e.target.id);                      ////[日期]連動處理+[計算]欄位
                        //ctrlIns.UnlockProceedArea("2");                 //執行強制證號區域解鎖 UnlockProceedArea(2) 參數2 為強制證號區
                    }
                    , function () {
                        setRevOldval(objNM);     /*還原舊值*/
                        //$(objNM).val($(objNM).attr('oldval')).blur();
                    }
               );
            } else {
                ctrlIns.Date(e.target.id);                      ////[日期]連動處理+[計算]欄位
                //ctrlIns.UnlockProceedArea("2");                 //執行強制證號區域解鎖 UnlockProceedArea(2) 參數2 為強制證號區
            };
        } else {
            ctrlIns.Date(e.target.id);                      ////[日期]連動處理+[計算]欄位
            //ctrlIns.UnlockProceedArea("2");                 //執行強制證號區域解鎖 UnlockProceedArea(2) 參數2 為強制證號區
        };
    });
    //[強制等級],[酒次]選取事件
    _div4.find('#selMANLEVEL,#iptDrunkFreq').on("change", function (e) {
        removeMsgInElm('#' + e.target.id);          //訊息移除
        _div4.find('#iptForceSerialNo').val('');    //清空[強制序號]
        clrInsTBPremium();                          //清空[險種資料]保險費
    });
    //[體係],[責係]選取事件
    _div4.find('#selBodyFactor,#selDutyFactor').on("change", function (e) {
        removeMsgInElm('#' + e.target.id);          //訊息移除
        _div4.find('#iptAnySerialNo').val('');      //清空[任意序號]
        clrInsTBPremium();                          //清空[險種資料]保險費
    });
    //[活動代碼]選取事件
    _div4.find('#selProgramCode').on("change", function (e) {
        removeMsgInElm('#' + e.target.id);          //訊息移除
        clrInsTBPremium();                          //清空[險種資料]保險費
    });
    //[專案代號]選取事件
    _div4.find('#iptProjectNo').on("blur", function (e) {
        chkProjectNo(true);
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    //電子式保險證(※如勾選電子式則不另寄紙本)
    $('#chkEmail').on("change", function () {
        if (this.checked) {
            if ($('#iptAPLEmail').val() == '' && $('#iptAPLCellPhone').val() == '') {
                ctrlMsg('MSFO2', '選擇電子式保險證，要保人[E-Mail]與[手機號碼]請至少擇一輸入！', '#iptAPLCellPhone');
                $("#chkEmail").prop("checked", false);
            };
        };
    });
    //[附件上傳]選取事件
    $('#uploadFile').on("change", function () {
        if (this.value != '') {
            //this.parentElement.style.display = 'none';      //[附件上傳]隱藏
            //document.getElementById('btnUploadClear').parentElement.style.display = '';     //[清空附件]顯示

            //document.getElementById('btnUploadClear').disabled = '';          //[清空附件]鎖住
        };
    });
};
//初始化_元件按鈕事件
function InitClick() {
    //[複製報價單]按鈕
    $('#btnQryQUOTENO').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            var sQuoteNo = $('#iptQUOTENO').val().trim();
            if (sQuoteNo == '') { ctrlMsg("SF", "", "#iptQUOTENO"); return; };
            $('#selAGNTNUM,#selZMAKE').attr('disabled', false);
            getWebQuotData(sQuoteNo, "COPY");
            $('#btnEdit1').click();
            $("#divQuoteDate").data("QuotNo_400", "");//400報價單號碼
            $('#iptQuotDate').val(GetDay(''));  //報價日期，預帶今日
            $('#iptAnySerialNo').val('');	    //任意序號
            $('#iptForceSerialNo,#iptMANZPREM,#iptBONUS,#selBONUS').val('');	    //強制序號,保費,獎金
            clrInsTBPremium();                  //清空[險種資料]保險費
            insuredDT()                         //險種資料相關資料處理
            $('#iptQUOTENO').val('');           //清空[報價單號碼]
            ctrlDiv(-1, "CLOSE");               //所有頁關閉
            ctrlDiv(1, "OPEN");                 //開啟第一頁
            $.unblockUI();
        }, 1);
    });
    //[上年度保單號碼][上年度強制證號]按鈕
    $('#btnQryPOLNUM,#btnQryOLDPOLNUM').on("click", function (e) {
        BlockUI('作業中，請稍後');
        var objBtnNM = '#' + $(this).attr('id');
        var objInpNM = '#' + $(this).parent().prev('input').attr('id');
        var sKey = _divQ.find(objInpNM).val().trim();
        setTimeout(function () {
            if (sKey == '') { ctrlMsg("SF", "", objInpNM); return; };               //判斷是否有填值
            $('#btnClose').click();         //[清除]
            if (!getProceedData(sKey)) { _divQ.find(objInpNM).val(''); return; };   //資料查詢
            _divQ.find(objBtnNM).parent().hide();       //隱藏[查詢]按鈕
            if (objBtnNM == '#btnQryPOLNUM') {          //按下[上年度保單號碼查詢]按鈕
                _divQ.find(objInpNM).attr('disabled', true);     //鎖住[上年度保單號碼]欄位
                _divQ.find('#iptOLDPOLNUM').val('');             //清空[上年度強制證號]欄位
                _divQ.find('#btnUnPOLNUM').parent().show();      //顯示[上年度保單號碼解鎖]按鈕
                //_divQ.find('#btnUnOLDPOLNUM').click();           //執行[上年度強制證號解鎖]按鈕
                _divQ.find('#btnUnOLDPOLNUM').parent().hide();
                _divQ.find('#iptOLDPOLNUM').val('').attr('disabled', false);
                _divQ.find('#btnQryOLDPOLNUM').parent().show();
            } else {                                    //按下[上年度強制證號查詢]按鈕
                _divQ.find(objInpNM).attr('disabled', true);     //鎖住[上年度保單號碼]欄位
                _divQ.find('#iptPOLNUM').val('');                //清空[上年度保單號碼]欄位
                _divQ.find('#btnUnOLDPOLNUM').parent().show();   //顯示[上年度強制證號解鎖]按鈕
                //_divQ.find('#btnUnPOLNUM').click();              //執行[上年度保單號碼解鎖]按鈕
                _divQ.find('#btnUnPOLNUM').parent().hide();
                _divQ.find('#iptPOLNUM').val('').attr('disabled', false);
                _divQ.find('#btnQryPOLNUM').parent().show();
            };
            if (_strMode != 'PROCEEDVIEW') {
                $('#btnEdit1').click();
                _divQ.find('#iptQuotDate').val(GetDay(''));  //報價日期，預帶今日
                clrInsTBPremium();      //清空[險種資料]保險費
            }
            insuredDT();            //險種資料相關資料處理
            //非載入處理
            if (_strMode != 'PROCEED' && _strMode != 'PROCEEDNEW' && _strMode != 'PROCEEDVIEW') {
                var isOverDate = false; //判斷是否過期
                var sDateS = GetDay('');    //承保日期(起)
                if (objBtnNM == '#btnQryPOLNUM') {          //按下[上年度保單號碼查詢]按鈕
                    sDateS = _strCCDATES;
                } else {                                    //按下[上年度強制證號查詢]按鈕
                    sDateS = _strFRDATES;
                };
                if (Date.parse(sDateS) < Date.parse(GetDay(''))) {
                    isOverDate = true;
                    MsgBox('提醒', "[續保起保日]不得小於[系統日]！<BR>將以[新件報價]作業處理！", 'orange');
                } else if (Date.parse(sDateS) > Date.parse(GetDay('90d'))) {
                    isOverDate = true;
                    MsgBox('提醒', "[續保起保日]不得超過[系統日]+90天！<BR>將以[新件報價]作業處理！", 'orange');
                };
                if (isOverDate) {
                    $('#spanTitle').text("建立新報價單");                                   //調整標題
                    _divQ.find('#iptPOLNUM,#iptOLDPOLNUM').val('').parent().hide();                  //隱藏清空[上年度保單號碼]/[上年度強制證號]欄位
                    $('#iptFRDATES,#iptFRDATEE,#iptCCDATES,#iptCCDATEE').val('').blur();    //清空[強制保期(起)][任意保期(起)]
                } else {
                    //$('#btnCTLCustID,#btnCTLCustNM').parent().hide();  //隱藏[客戶資料查詢]等...按鈕
                    //if ($('#iptAPLCustID').val() != '') {
                    //    $('#btnAPLCustID,#btnAPLCustNM').parent().hide();  //隱藏[客戶資料查詢]等...按鈕
                    //};
                    //$('#iptCTLCustID,#iptCTLName,#iptCTLBirthday,#selCTLSex,#iptAPLCustID,#iptAPLName,#iptAPLBirthday,#selAPLSex').attr('disabled', true);                    //鎖住[ID,姓名,生日,性別]
                };
                setDDL_SYSCODEDT(_arrLoadSysData, 'INSUREDLIST', '#selZCVRTYPE');  //[險種](舊保單帶入,顯示所有險種)
            };
            $.unblockUI();
        }, 1);
    });
    //[上年度保單號碼][上年度強制證號]解鎖按鈕
    $('#btnUnPOLNUM,#btnUnOLDPOLNUM').on("click", function (e) {
        var objBtnNM = '#' + $(this).attr('id');
        var objInpNM = '';
        _divQ.find(objBtnNM).parent().hide();
        if (objBtnNM == '#btnUnPOLNUM') {
            objInpNM = '#iptPOLNUM';
            objBtnNM = '#btnQryPOLNUM';
            MsgBox('提醒', "[上年度保單號碼]已清空！", 'orange');
        } else {
            objInpNM = '#iptOLDPOLNUM';
            objBtnNM = '#btnQryOLDPOLNUM';
            MsgBox('提醒', "[上年度強制證號]已清空！", 'orange');
        }
        _divQ.find(objInpNM).val('').attr('disabled', false);
        _divQ.find(objBtnNM).parent().show();
    });
    //[計算保費]按鈕
    $('#btnCalPre').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            var funstime = Date.now();
            listDate = funstime;    //重新計算時間
            consLogDate("-==btnCalPre_S==-");
            var isChk = true;
            //清空警告訊息
            removeMsgObjList("ALL");
            //檢核_{經手人/業務員資料}區塊資料
            consLogDate("-==btnCalPre_檢核{經手人/業務員資料}區塊資料==-");
            if (isChk) { ctrlDiv(1, "OPEN"); };
            if (isChk && !chkSub_SaleData()) { isChk = false; } else { ctrlDiv(1, "CLOSE"); };
            //檢核_{要保人及被保險人資料}區塊資料
            consLogDate("-==btnCalPre_檢核{要保人及被保險人資料}區塊資料==-");
            if (isChk) { ctrlDiv(2, "OPEN"); };
            if (isChk && !chkSub_ProtectPeopleData()) { isChk = false; } else { ctrlDiv(2, "CLOSE"); };
            //檢核_{車籍資料}區塊資料
            consLogDate("-==btnCalPre_檢核{車籍資料}區塊資料==-");
            if (isChk) { ctrlDiv(3, "OPEN"); };
            if (isChk && !chkSub_CarData()) { isChk = false; } else { ctrlDiv(3, "CLOSE"); };
            if (!isChk) { $.unblockUI(); return; };
            //檢核_{投保險種資料1}區塊資料
            consLogDate("-==btnCalPre_檢核{投保險種資料1}區塊資料==-");
            if (isChk && !chkSub_InsuredData1()) { isChk = false; };
            //[取級數]按鈕，不管結果為何，繼續往下走
            consLogDate("-==btnCalPre_[取級數]處理==-", funstime);
            if (isChk) { getLevel(); };
            //檢核_[強制險承保記錄]
            consLogDate("-==btnCalPre_檢核[強制險承保記錄]==-");
            if (isChk && !chkMCPInsured()) {
                if (_div4.find('#iptForceSerialNo').val() != '') {
                    _div4.find('#iptForceSerialNo').val('');    //清空[強制序號]
                };
                if (_div4.find('#iptAnySerialNo').val() != '') {
                    _div4.find('#iptAnySerialNo').val('');      //清空[任意序號]
                };
                return;
            };
            //檢核_{投保險種資料}區塊資料
            consLogDate("-==btnCalPre_檢核{投保險種資料}區塊資料==-");
            if (isChk && !chkSub_InsuredData()) { return }; //isChk = false;
            if (!isChk) { $.unblockUI(); return; };
            //讀取_年齡係數
            consLogDate("-==btnCalPre_讀取[年齡係數]資料==-");
            getAgeFactor();
            //控制[折舊率]處理
            consLogDate("-==btnCalPre_控制[折舊率]處理==-");
            ctrlIns.DepRate();
            var msg = mqQuotation(1);
            if (msg == "") { MsgBox('', '處理完成！', 'green'); };
            $.unblockUI();
            consLogDate("-==btnCalPre_E==-", funstime);
        }, 1);
    });
    //[預覽]按鈕
    $('#btnPreview').on('click', function () {

        var isChkPass = true;
        $.each($('#tblInsuranceList').DataTable().data(), function (i, item) {
            if ($('#selPAYWAY').val() == "C012") {
                //[付款方式]為C012(分期付款)時，則判斷[月繳保費]欄位
                if (item.InsMonth == 0 || item.InsMonth == null) { isChkPass = false; return false; };
            } else {
                //[付款方式]非C012(分期付款)時，則判斷[保險費]欄位
                if (item.MVPPREM == 0 || item.MVPPREM == null) { isChkPass = false; return false; };
            };
        });
        if (!isChkPass) {
            MsgBox('錯誤', '保費不得為0', 'red');
        }
        else {
            let param = { sMakeCD: $('#selZMAKE').val() };
            let dtZMAKEInfo = getdata("/Quotation/GetZMAKEInfo", param);
            $('#divCTLName').text($('#iptCTLName').val());
            //[被保險人生日]處理
            var sBirthday = $('#iptCTLBirthday').val();
            if (sBirthday == '') { sBirthday = '---/--/--'; }
            else { sBirthday = '(民國)' + (parseInt(sBirthday.substr(0, 4)) - 1911) + '' + sBirthday.substr(4, sBirthday.length) };
            $('#divCTLBirthday').text(sBirthday);
            $('#divAPLName').text($('#iptAPLName').val());
            //[要保險人生日]處理
            sBirthday = $('#iptAPLBirthday').val();
            if (sBirthday == '') { sBirthday = '---/--/--'; }
            else { sBirthday = '(民國)' + (parseInt(sBirthday.substr(0, 4)) - 1911) + '' + sBirthday.substr(4, sBirthday.length) };
            $('#divAPLBirthday').text(sBirthday);
            //[牌照]處理
            let ZREGNUM = $('#iptZREGNUM').val();
            ZREGNUM = ZREGNUM == "" ? "    " : ZREGNUM;
            $('#divZREGNUM').text(ZREGNUM);
            //[查詢序號]處理
            var sSerialNo = $('#iptForceSerialNo').val();
            sSerialNo = sSerialNo == "" ? "" : "(強)" + sSerialNo;
            if ($('#iptAnySerialNo').val() != "") {
                sSerialNo = (sSerialNo == "" ? "" : sSerialNo + " / ") + "(任)" + $('#iptAnySerialNo').val();
            }
            $('#divSerialNo').text(sSerialNo);
            //let ForceSerialNo = $('#iptForceSerialNo').val();
            //ForceSerialNo = ForceSerialNo == "" ? "    " : "(強)" + ForceSerialNo;
            //$('#divForceSerialNo').text(ForceSerialNo);
            //let AnySerialNo = $('#iptAnySerialNo').val();
            //AnySerialNo = AnySerialNo == "" ? "    " : "(任)" + AnySerialNo;
            //$('#divAnySerialNo').text(AnySerialNo);
            //[車種]處理
            let selMANMVPZMTYPE = $('#selMANMVPZMTYPE :selected').text();
            let selMVPZMTYPE = $('#selMVPZMTYPE :selected').text();
            let ZMTYPE = "";
            if (selMANMVPZMTYPE != "" && selMVPZMTYPE != "") {
                ZMTYPE = "(強)" + selMANMVPZMTYPE + " / (任)" + selMVPZMTYPE;
            }
            else if (selMANMVPZMTYPE != "") {
                ZMTYPE = "(強)" + selMANMVPZMTYPE;
            }
            else if (selMVPZMTYPE != "") {
                ZMTYPE = "(任)" + selMVPZMTYPE;
            }
            $('#divZMTYPE').text(ZMTYPE);
            //[廠型]處理
            $('#divZMAKE').text(dtZMAKEInfo[0].LONGDESC);
            //[保險期間]處理
            let fDate = $('#iptFRDATES').val() != '' && $('#iptFRDATEE').val() != '' ? "(強)" + $('#iptFRDATES').val() + ' ~ ' + $('#iptFRDATEE').val() + '<br/>' : '';
            let ccDate = $('#iptCCDATES').val() != '' && $('#iptCCDATEE').val() != '' ? "(任)" + $('#iptCCDATES').val() + ' ~ ' + $('#iptCCDATEE').val() + '<br/>' : '';
            $('#divPeriod').html((fDate + ccDate).substring(0, (fDate + ccDate).length - 5));
            //[險種資料]處理
            let INS_Arr = $('#tblInsuranceList').DataTable().data().toArray();
            let INS_ContentList = '<div class="row"></div>\
                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" style="margin-top:1px; border-bottom:1px solid #dddddd;">\
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-5 view-td-content" style="word-wrap: break-word;word-break: break-all;text-align:center;"><b>險種名稱</b></div>\
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-5 view-td-content" style="word-wrap: break-word;word-break: break-all;text-align:center;"><b>保險金額</b></div>\
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-2 view-td-content" style="text-align:center;"><b>保險費</b></div>\
                                </div>\
                                ';
            let isNotC012 = $('#selPAYWAY').val() != 'C012';
            let amount = 0;
            let totalAmount = 0;
            var arInsOrder = INS_Arr.map(function (item, index, array) {
                return item.InsOrder;
            }).sort(function (a, b) {
                return a - b;
            });

            arInsOrder.forEach(function (element) {
                for (let i = 0; i < INS_Arr.length; i++) {
                    if (element == INS_Arr[i].InsOrder) {
                        let SUMINA = INS_Arr[i].SUMINA != null && INS_Arr[i].SUMINA != '' && !isNaN(INS_Arr[i].SUMINA) ? formatAmount(parseInt(INS_Arr[i].SUMINA)) : '';
                        let SUMINB = INS_Arr[i].SUMINB != null && INS_Arr[i].SUMINB != '' && !isNaN(INS_Arr[i].SUMINB) ? formatAmount(parseInt(INS_Arr[i].SUMINB)) : '';
                        let SUMINC = INS_Arr[i].SUMINC != null && INS_Arr[i].SUMINC != '' && !isNaN(INS_Arr[i].SUMINC) ? formatAmount(parseInt(INS_Arr[i].SUMINC)) : '';
                        let SUMIN = (SUMINA != '' ? SUMINA + '/' : '')
                                + (SUMINB != '' ? SUMINB + '/' : '')
                                + (SUMINC != '' ? SUMINC + '/' : '');
                        SUMIN = SUMIN.substring(0, SUMIN.length - 1);
                        amount = isNotC012 ? INS_Arr[i].MVPPREM : INS_Arr[i].InsMonth;
                        INS_ContentList += '<div class="row"></div>\
                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" style="margin-top:1px; border-bottom:1px solid #dddddd;">\
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-5 view-td-content" style="word-wrap: break-word;word-break: break-all;"> {0} </div>\
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-5 view-td-content" style="word-wrap: break-word;word-break: break-all;text-align:right;"> {1} </div>\
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-2 view-td-content" style="text-align:right;"> {2} </div>\
                                </div>\
                                '.replace('{0}', '[' + INS_Arr[i].ZCVRTYPE + ']' + INS_Arr[i].ZCVRTYPENM)
                                             .replace('{1}', SUMIN)
                                             .replace('{2}', Comma(parseInt(amount)));
                        totalAmount += parseInt(amount);
                    }
                }
            });

            INS_ContentList += '<div class="row"></div>\
                            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" style="margin-top:1px; border-bottom:1px solid #dddddd;">\
                                <div class="col-lg-4 col-md-4 col-sm-4 col-xs-4" style="word-wrap: break-word;word-break: break-all;"> </div>\
                                <div class="col-lg-4 col-md-4 col-sm-4 col-xs-4" style="word-wrap: break-word;word-break: break-all;"> </div>\
                                <div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">  </div>\
                            </div>\
                                ';
            $('#divInsList').html('');
            $('#divInsList').append(INS_ContentList);
            $('#divTotalAmount').text(Comma(parseInt(totalAmount)));
            $('#popuInsInfo').modal('show');
        }
    });
    //[暫存]按鈕
    $('#btnStorCache').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            var isChk = true;
            //清空警告訊息
            removeMsgObjList("ALL");
            //檢核_{經手人/業務員資料}區塊資料
            if (isChk) { ctrlDiv(1, "OPEN"); };
            if (isChk && !chkSub_SaleData()) { isChk = false; } else { ctrlDiv(1, "CLOSE"); };
            if (!isChk) { return; };
            //報價單資料
            var QUOT_Arr = getQuotData();
            //報價單資料_強制險
            if ($('#chkMan').prop('checked')) {
                QUOT_Arr = $.extend({}, QUOT_Arr, getForceData());
            };
            //報價單資料_任意險
            if ($('#chkAny').prop('checked')) {
                QUOT_Arr = $.extend({}, QUOT_Arr, getAnyData());
            };
            QUOT_Arr = [QUOT_Arr];
            //險種資料
            var INS_Arr = $('#tblInsuranceList').DataTable().data().toArray();
            //客戶資料
            var Cust_Arr = getCustData();
            //受益人資料
            var BEN_Arr = getBenData();
            //約定駕駛人資料
            var ADI_Arr = getAgreeDriverData();
            ADI_Arr = (getObjToVal(ADI_Arr[0].AgreeDriver1) == '') ? [] : ADI_Arr;
            //報價單其他係數
            var Other_Arr = getQuotOtherData();
            //作業型態
            var worktype = (_strMode == "TEMP" || _strMode == "EDIT") ? "ALT" : "INS";  /*(TEMP:要保資料輸入,EDIT:修改)*/
            //寫入參數
            var param = {
                sWorkType: worktype, sProgCode: "QuotationEdit", QUOT_Data: QUOT_Arr
                , Cust_Data: Cust_Arr, INS_Data: INS_Arr, BEN_Data: BEN_Arr, ADI_Data: ADI_Arr
                , Other_Data: Other_Arr
            };
            var dt = getdata("/Quotation/QuotationEditSave", param);
            if (dt.length > 0) {
                if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
                    MsgBox('錯誤', dt[0].MSG, 'red'); return;
                };
                $('input,select,textarea,button').each(function () { this.disabled = true });      //所有[輸入框]disabled
                $('.navbar-toggle').attr('disabled', false);   //因為上述語法會將[選單]按鈕失效，所以再把按鈕打開
                let uploadFileMsg = "";
                let inputFile = $('#UploadFileDiv .uploadFile');
                if (inputFile != undefined && inputFile.length > 0) {
                    uploadFileMsg = '<br/>已選取的附件將不會上傳，下次再進入時，需重選…..';
                }
                MsgBox('', '報價單暫存成功！<BR>報價單號碼：[' + dt[0].QuotNo + ']' + uploadFileMsg, 'green');
            }
            $.unblockUI();
        }, 1);
    });
    //[確定]按鈕
    $('#btnSubmit').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            ///--==初始化資料============================================================--
            var dt = {};                /*資料集*/
            var isChk = true;           /*檢核標記*/
            removeMsgObjList("ALL");    /*清空警告訊息*/
            ///--==資檢核料==============================================================--
            //檢核_{經手人/業務員資料}區塊資料
            if (isChk) { ctrlDiv(1, "OPEN"); };
            if (isChk && !chkSub_SaleData()) { isChk = false; } else { ctrlDiv(1, "CLOSE"); };
            //檢核_{要保人及被保險人資料}區塊資料
            if (isChk) { ctrlDiv(2, "OPEN"); };
            if (isChk && !chkSub_ProtectPeopleData()) { isChk = false; } else { ctrlDiv(2, "CLOSE"); };
            //檢核_{車籍資料}區塊資料
            if (isChk) { ctrlDiv(3, "OPEN"); };
            if (isChk && !chkSub_CarData()) { isChk = false; } else { ctrlDiv(3, "CLOSE"); };
            //檢核_{投保險種資料}區塊資料
            if (isChk) { ctrlDiv(4, "OPEN"); };
            if (isChk && !chkSub_InsuredData()) { isChk = false; } else { ctrlDiv(4, "CLOSE"); };
            if (!isChk) { $.unblockUI(); return; };
            ///--==報價單資料準備==========================================================--
            //報價單資料
            var QUOT_Arr = getQuotData();
            //報價單資料_強制險
            if ($('#chkMan').prop('checked')) { QUOT_Arr = $.extend({}, QUOT_Arr, getForceData()); };
            //報價單資料_任意險
            if ($('#chkAny').prop('checked')) { QUOT_Arr = $.extend({}, QUOT_Arr, getAnyData()); };
            QUOT_Arr = [QUOT_Arr];
            //險種資料
            var INS_Arr = $('#tblInsuranceList').DataTable().data().toArray();
            //客戶資料
            var Cust_Arr = getCustData();
            //受益人資料
            var BEN_Arr = getBenData();
            //約定駕駛人資料
            var ADI_Arr = getAgreeDriverData();
            ADI_Arr = (getObjToVal(ADI_Arr[0].AgreeDriver1) == '') ? [] : ADI_Arr;
            //報價單其他係數
            var Other_Arr = getQuotOtherData();
            //作業型態(INS:新增,ALT:修改)
            var worktype = (_strMode == "TEMP" || _strMode == "EDIT") ? "ALT" : "INS";  /*(TEMP:要保資料輸入,EDIT:修改)*/
            //寫入參數
            var param = {
                sWorkType: worktype, sProgCode: "QuotationEdit"
                , QUOT_Data: QUOT_Arr, Cust_Data: Cust_Arr, INS_Data: INS_Arr, BEN_Data: BEN_Arr, ADI_Data: ADI_Arr, Other_Data: Other_Arr
            };
            //判斷是否先取WEB報價單號(暫存處理)
            if (isChk && worktype == "INS") {
                /*當新件時，先做暫存檔案到資料庫，取得Web報價單號，再發送MQ400*/
                dt = getdata("/Quotation/QuotationEditSave", param);
                if (dt.length > 0) {
                    if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; };
                    $("#iptQUOTENO").val(dt[0].QuotNo);
                    worktype = "ALT";
                }
            }
            if (isChk) {
                getAgeFactor();     //年齡係數_查詢
                var QuotNo400 = ""; //400報價單號碼
                ///--==發送MQ處理==========================================================--
                QuotNo400 = getObjToVal($("#divQuoteDate").data("QuotNo_400"));
                //若已經有[400報價單號碼]則進行修改
                if (QuotNo400 != "") {
                    //進行修改前的檢核
                    dt = getdata("/Quotation/ChkQuotMQEdit", { sQuotNo_400: QuotNo400 });
                    if (dt.length > 0) {
                        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; };
                    };
                    QuotNo400 = mqQuotation(1);     //發送MQ(計算) 修改前，做一次[計算保費]
                    if (QuotNo400 == "") {
                        QuotNo400 = mqQuotation(3); //發送MQ(修改)
                        if (QuotNo400 == "err") { return; };
                    } else if (QuotNo400 == "err") {
                        return;
                    };
                    if (QuotNo400 == "") { MsgBox('錯誤', '計算檢核失敗，[400報價單號碼]尚未取得！', 'red'); return; };
                }
                else {
                    QuotNo400 = mqQuotation(2);     //發送MQ(新增)
                    if (typeof (QuotNo400) == "undefined" || QuotNo400 == "err") { QuotNo400 = ""; };
                    if (QuotNo400 == "") { MsgBox('錯誤', '[400報價單號碼]尚未取得！', 'red'); return; };
                    $("#divQuoteDate").data("QuotNo_400", QuotNo400);
                };
                ///--==寫入資料庫處理 & 發送EMail==========================================--
                //報價單資料
                param.sWorkType = worktype;                             /*作業型態(INS:新增,ALT:修改)*/
                param.QUOT_Data[0].IsConfirm = 'Y';                     /*是否確定報價(Y:已報價資料,N:未報價/暫存資料)*/
                param.QUOT_Data[0].QuotNo = $("#iptQUOTENO").val();     /*Web報價單號碼*/
                param.QUOT_Data[0].QuotNo_400 = QuotNo400;              /*AS400報價單號碼*/
                param.QUOT_Data[0].ZautclsMail = _strZautclsMail;       /*核保人員EMail*/
                dt = getdata("/Quotation/QuotationEditSave", param);
                if (dt.length > 0) {
                    if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; };
                    $('input,select,textarea,button').each(function () { this.disabled = true });      //所有[輸入框]disabled
                    $('.navbar-toggle').attr('disabled', false);    //因為上述語法會將[選單]按鈕失效，所以再把按鈕打開
                    $("#iptQUOTENO").val(dt[0].QuotNo);
                    let inputFile = $('#UploadFileDiv .uploadFile');
                    if (_strZautclsMail != "") {
                        ///--==發送EMail處理_S========================================================--
                        _strZautclsMail += ";mercia.lee@hotains.com.tw;";   //20190919 ADD BY MICHAEL 無論如何加上穗金的Mail
                        consLogDate("--_strZautclsMail=" + _strZautclsMail);
                        var formData = new FormData();
                        //上傳檔案處理
                        inputFile.each(function (index, element) { if (element.files.length > 0) { formData.append("arfile", element.files[0]); }; });
                        //若有上傳檔案，則CC給經手人
                        if (inputFile.length > 0) {
                            let ccMail = "";
                            let AEMailDT = getdata("/Quotation/GetAgntEMail", { sAGNTNUM: $('#selAGNTNUM').val() });
                            if (AEMailDT.length > 0) {
                                ccMail = getObjToVal(AEMailDT[0].EMAILLIST);        //從T8250取得EMail
                            } else {
                                ccMail = getObjToVal($('#iptAgentEMail').val());    //從頁面上取得EMail
                            }
                            if (checkMail(ccMail)) { _strZautclsMail += ";" + ccMail }
                        }
                        consLogDate("--_strZautclsMail=" + _strZautclsMail);
                        formData.append('sQuotNo', dt[0].QuotNo);       /*報價單號碼*/
                        formData.append('sAddress', _strZautclsMail);   /*電子郵件地址*/
                        formData.append('sQuotNo400', QuotNo400);       /*400報價單單號*/
                        $.ajax({
                            url: "/Quotation/SendReviewMail",
                            type: "POST",
                            data: formData,
                            cache: false,
                            processData: false,
                            contentType: false,
                            success: function (data) { }
                        });
                        ///--==發送EMail處理_E========================================================--
                    };
                    let attachFileMsg = "";
                    if (inputFile.length > 0 && _strZautclsMail != "")
                        attachFileMsg = '<br/>附件已上傳';
                    else if (inputFile.length > 0 && _strZautclsMail == "")
                        attachFileMsg = '<br/>此報價無需送審或無核保人員郵箱，故不執行上傳作業';
                    MsgBox('', '資料處理完成！<BR>報價單號碼：[' + dt[0].QuotNo + ']<BR>400報價單號碼：[' + QuotNo400 + ']' + attachFileMsg
                        + (_strZautclsMail != "" ? "<BR><BR><span style='color:blue;'>說明: 此報價單需由核保人員進行人工審核，核簽完成後始能列印。</span>" : ""), 'green');
                }
            }
            $.unblockUI();
        }, 1);
    });
    //[清除]按鈕
    $('#btnClose').on("click", function (e) {
        consLogDate("--btnClose[清除]按鈕_Start--");
        $('#iptQUOTENO').data('isSysPass', true);
        $('#divSalesmanData input,#divInsurerData input[type=text],#divInsurerData input[type=tel]').val('');
        $('#divCarInfo input,#divInsInfo input[type=text],#divInsInfo input[type=tel],#divOtherData input').val('');
        $('select,textarea').each(function () { $(this).val(''); });      //所有[輸入框],[下拉選單],[文字框]清空
        consLogDate("--btnClose_[地址]");
        $('#selAPLADD1,#selCTLADD1,#selBenADD1').each(function () { $(this).val(''); }).change();
        consLogDate("--btnClose_[checkbox]");
        $('input[type=checkbox]').each(function () { $(this).prop('checked', false); }).change();
        consLogDate("--btnClose_[APLEmail]");
        $('#rdoAPLEmail:checked').prop("checked", false).change();
        consLogDate("--btnClose_[付款方式]");
        $('#selPAYWAY').val('D000');                        /*[付款方式]*/
        $('#selCalCode').val('AQ');                         /*[計算]*/
        $('#divQuoteDate').data("Paytype", "02");           /*查詢_付款方式(一般)(繳別)(01:月繳,02:年繳)*/
        consLogDate("--btnClose_[客戶類別]");
        $("#rdoAPLCustType[value='P'],#rdoCTLCustType[value='P']").prop("checked", true).change();      /*客戶類別(預設為:自然人)*/
        setSelPick("#selAGNTNUM,#selZMAKE", [], '');                    /*[經手人][廠型]*/
        $("#selAGNTNUM,#selZMAKE").val('').selectpicker('refresh')      /*[經手人][廠型]*/
        //CreatInsDT({});
        $('#iptQUOTENO').data('isSysPass', false);
        ctrlDiv(-1, "LOCK");            /*鎖住所有控制項*/
        $('#btnEdit1').click();         /*執行步驟一[編輯]*/
        consLogDate("--btnClose[清除]按鈕_End--");
    });
    //[下一步]按鈕1 {經手人/業務員資料}
    $('#btnNext1').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            consLogDate("-==btnNext1_S==-");
            consLogDate("-==btnNext1_檢核{經手人/業務員資料}區塊資料==-");
            var isChk = true;//chkSub_SaleData();                  //檢核_{經手人/業務員資料}區塊資料
            var divQD = $('#divQuoteDate');
            //var param = {
            //    sAgentNo: $("#selAGNTNUM").val()
            //    , sBranchNo: $("#iptBranchNo").val()
            //    , sLifeNo: $("#iptCNTBRANCH").val()
            //    , sCHL1: divQD.data("CHL_Code")
            //    , sCHL2: $("#selCHL2").val()
            //    , sSalesNo: divQD.data("SalesNo")
            //    , sAmwayNo: $("#iptAmwayNo").val()
            //    , sPrnWayNo: $("#selPrnWayNo").val()
            //    , sVendorNo: $('#selVendorNo').val()
            //    , sVendorSalesNo: $('#iptVendorSalesNo').val()
            //};
            //var ds = getdata("/Quotation/ChkQuotExistsStep1", param);      //報價單查詢
            //if (ds[0].ISEXISTS == '') {
            //    consLogDate("-==btnNext1_AS400檢核==-");
            //    if (isChk) { isChk = !(mqQuotation('1', '1') == "err"); };   //AS400檢核
            //    consLogDate("-==btnNext1_檢核通過==-");
            //}
            if (isChk) { ctrlDiv(1, "NEXT"); };             //檢核通過
            $.unblockUI();
            consLogDate("-==btnNext1_E==-");
        }, 1);
    });
    //[編輯]按鈕1   {經手人/業務員資料}
    $('#btnEdit1').on("click", function (e) {
        ctrlDiv(1, "EDIT");
        //特定欄位還是維持不啟用
        _div1.find('#iptAGNTNAME,#iptSalesmanRegNo,#iptCHL1,#iptGenareaNM,#iptAgentTEL,#iptAgentFAX,#iptAgentEMail').attr('disabled', true);
        //--[電銷人員]特別處理_S--
        if ($('#hidTollClterData').val() != '') {
            //打開[電話][傳真][EMail]欄位(登入時會用ID去T9982找資料，若有，則為電銷人員)
            _div1.find('#iptAgentTEL,#iptAgentFAX,#iptAgentEMail').attr('disabled', false);
            //關閉[業務人員編號]20191105 DEL BY MICHAEL [電銷人員]不鎖[業務人員編號]QA00030265
            //_div1.find('#iptCNTBRANCH').attr('disabled', true);
        };
        //--[電銷人員]特別處理_E--
    });
    //[下一步]按鈕2 {要保人及被保險人資料}
    $('#btnNext2').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            consLogDate("-==btnNext2_S==-");
            consLogDate("-==btnNext2_檢核{要保人及被保險人資料}區塊資料==-");
            var isChk = chkSub_ProtectPeopleData(); //檢核_{要保人及被保險人資料}區塊資料
            //確認_[婚姻][地址]
            if (isChk) {
                var sAPLCusType = $('#rdoAPLCustType:checked').val();      //要保人[客戶類別]
                var sCTLCusType = $('#rdoCTLCustType:checked').val();      //被保險人[客戶類別]
                var errMsg = '';
                /************************************************************************************
                一、移除婚姻狀況為必填欄位：同意
                1.	系統輸入移除，因婚姻狀況並非計算保費必要資料，僅為傳輸保發必要欄位，同業多帶入未婚。
                2.	因報價要保書內容已報部，若不想要重新申報，可調整無論婚姻狀況何值，要保書套印空白，同業多自要保書中移除。
                ************************************************************************************/
                //if (sAPLCusType == 'P' && $('#selAPLMarriage').val() == '') {
                //    errMsg += '要保人[婚姻],'; isChk = false;
                //};
                if (sAPLCusType == 'P' && $('#iptAPLADDO').val() == '') {
                    errMsg += '要保人[地址],'; isChk = false;
                };
                //if (sCTLCusType == 'P' && $('#selCTLMarriage').val() == '') {
                //    errMsg += '被保險人[婚姻],'; isChk = false;
                //};
                if (sCTLCusType == 'P' && $('#iptCTLADDO').val() == '') {
                    errMsg += '被保險人[地址],'; isChk = false;
                };
                if (!isChk) {
                    ConfirmBox('請確認', errMsg.substr(0, errMsg.length - 1) + '尚未填寫，是否繼續執行?', 'orange'
                        , function () {
                            if (!(mqQuotation('1', '2') == "err")) {  //AS400檢核
                                ctrlDiv(2, "NEXT");
                            };
                        }
                    );
                };
            };
            if (!isChk) {
                //判斷[錯誤訊息]，是否有被鎖住
                setTimeout(function () {
                    var ObjList = $('#divInsurerData [data-toggle="tooltip"]');
                    var isLock = false;
                    ObjList.each(function (i, e) {
                        var thisObj = $(this);
                        if (thisObj.attr('disabled') == 'disabled') {
                            isLock = true;
                        };
                    });
                    if (isLock) {
                        if (_div2.find("#iptAPLCustID").data("IsPEND") == "Y" || _div2.find("#iptCTLCustID").data("IsPEND") == "Y") {
                            MsgBox('錯誤', '該客戶代號有理賠案件處理中，若欲修改客戶資料請至AS400主系統進行修改。', 'red');
                        } else {
                            MsgBox('錯誤', '客戶資料必填欄位相關資料若欲修改，請至AS400主系統進行修改。', 'red');
                        };
                    };
                }, 100);
            };
            //客戶資料
            var Cust_Arr = getCustData();
            var param = {
                Cust_Data: Cust_Arr
            };
            var ds = getdata("/Quotation/ChkQuotExistsStep2", param);      //客戶資料查詢
            if (ds[0].ISEXISTS == '') {
                consLogDate("-==btnNext2_AS400檢核==-");
                if (isChk) { isChk = !(mqQuotation('1', '2') == "err"); };  //AS400檢核
                consLogDate("-==btnNext2_檢核通過==-");
            }
            //檢核通過
            if (isChk) { ctrlDiv(2, "NEXT"); };
            $.unblockUI();
            consLogDate("-==btnNext2_E==-");
        }, 1);
    });
    //[編輯]按鈕2   {要保人及被保險人資料}
    $('#btnEdit2').on("click", function (e) {
        ctrlDiv(2, "EDIT");
        CreatCustDT();          /*註冊客戶資料GRID元件*/
        ctrlInputCust();        /*{被保險人及要保人資料}[ID,姓名,生日,性別]等欄位處理*/
        //特定欄位還是維持不啟用
        $('#iptCTL_CLNTNUM,#iptAPL_CLNTNUM').attr('disabled', true);
    });
    //[下一步]按鈕3 {車籍資料}
    $('#btnNext3').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            consLogDate("-==btnNext3_S==-");
            consLogDate("-==btnNext3_檢核{車籍資料}區塊資料==-");
            var isChk = chkSub_CarData();           ///檢核_{車籍資料}區塊資料
            //if (isChk == true && $('#selMANMVPZMTYPE').val() != "" && $('#iptAPLEmail').val() == '' && $('#iptAPLCellPhone').val() == '') {
            //    isChk = false;
            //    //ctrlMsg('MSF2', '承保[強制險]時，要保人[E-MAIL][手機號碼]須輸入！', "#iptAPLCellPhone");
            //    ConfirmBox2('提醒', '為響應全面推廣電子式強制險保險證措施，<br>要保人資料之【E-mail】或【行動電話】請擇一輸入<br>請問是否繼續執行?', 'orange'
            //        , function () {/*--[確認]--*/
            //            if (!(mqQuotation('1', '3') == "err")) {  //AS400檢核
            //                ctrlDiv(3, "NEXT");
            //            };
            //        }
            //        , function () {/*--[修改要保人資料]---*/
            //            ctrlDiv('2', "OPEN", 0);
            //            $('#btnEdit2').click();
            //            setTimeout(function () { $('#iptAPLCellPhone').focus(); }, 500);
            //        }
            //    );
            //};
            //[CC數]特別處理
            let icc = _div3.find('#iptZCC').val().replace(/[,]/g, "");
            if (icc.indexOf('.') > -1) {
                _div3.find('#iptZCC').val(Math.floor(icc));
                icc = Math.floor(icc);
            };
            var param = {
                sCarTypeNo: $('#selZMAKE').val()	                                            //廠型
                , sMakeYear: $('#selYRMANF').val() + padLeft($('#selMNMANF').val(), 2)          //製造年月
                , sCarPrice: $('#iptRESETPRICE').val().replace(/[$,]/g, "")	                    //重置價格
                , sLicenseNo: $('#iptZREGNUM').val()	                                        //牌照
                , sLoad: $('#iptZCARRY').val()	                                                //乘載(人/噸)
                , sDisplacement: icc //$('#iptZCC').val().replace(/[,]/g, "")	                //排氣量
                , sIssueYear: $('#selIssueYear').val() + padLeft($('#selIssueMonth').val(), 2)	    //發照年月
                , sEngineNo: $('#iptEngineNo').val()	                                        //引擎號碼
                , sRecord: $('#txtRecords').val()	                                            //記錄
                , sForceCarType: $('#selMANMVPZMTYPE').val()	                                //強制車種
                , sAnyCarType: $('#selMVPZMTYPE').val()	                                        //任意車種
            };
            var ds = getdata("/Quotation/ChkQuotExistsStep3", param);      //報價單查詢
            if (ds[0].ISEXISTS == '') {
                consLogDate("-==btnNext3_AS400檢核==-");
                if (isChk) { isChk = !(mqQuotation('1', '3') == "err"); };   //AS400檢核
                consLogDate("-==btnNext3_檢核通過==-");
            }
            if (isChk) { ctrlDiv(3, "NEXT"); };     //檢核通過
            $('#tblInsuranceList').DataTable().columns.adjust().responsive.recalc();    //[險種資料]寬度重整
            $.unblockUI();
            consLogDate("-==btnNext3_E==-");
        }, 1);
    });
    //[編輯]按鈕3   {車籍資料}
    $('#btnEdit3').on("click", function (e) {
        ctrlDiv(3, "EDIT");
        //處理_熱門廠型
        var dt = [];
        if (getObjToVal(_div1.find('#selAGNTNUM').val()).substr(0, 2) == 'BD') {
            dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'HOTCAR_1'; });   //完美專案廠牌排名
        } else {
            dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'HOTCAR'; });     //非完美專案廠牌排名
        };
        _strHotCar = setHotCar(dt);
        if (_div3.find("#selZMAKE").val() == '' || _div3.find("#selZMAKE").val() == null) {
            _div3.find("#selZMAKE").empty().append('<option value="">請選擇</option>' + _strHotCar).selectpicker('refresh');
        };
    });
    //[下一步]按鈕4 {投保險種資料}
    $('#btnNext4').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            consLogDate("-==btnNext4_S==-");
            var isChk = true;
            //清空警告訊息
            consLogDate("-==btnNext4_清空警告訊息==-");
            removeMsgObjList("ALL");
            //檢核_{經手人/業務員資料}區塊資料
            consLogDate("-==btnNext4_開啟{經手人/業務員資料}區塊資料==-");
            if (isChk) { ctrlDiv(1, "OPEN"); };
            consLogDate("-==btnNext4_檢核{經手人/業務員資料}區塊資料==-");
            if (isChk && !chkSub_SaleData()) { isChk = false; } else { ctrlDiv(1, "CLOSE"); };
            //檢核_{要保人及被保險人資料}區塊資料
            consLogDate("-==btnNext4_開啟{要保人及被保險人資料}區塊資料==-");
            if (isChk) { ctrlDiv(2, "OPEN"); };
            consLogDate("-==btnNext4_檢核{要保人及被保險人資料}區塊資料==-");
            if (isChk && !chkSub_ProtectPeopleData()) { isChk = false; } else { ctrlDiv(2, "CLOSE"); };
            //檢核_{車籍資料}區塊資料
            consLogDate("-==btnNext4_開啟{要保人及被保險人資料}區塊資料==-");
            if (isChk) { ctrlDiv(3, "OPEN"); };
            consLogDate("-==btnNext4_檢核{要保人及被保險人資料}區塊資料==-");
            if (isChk && !chkSub_CarData()) { isChk = false; } else { ctrlDiv(3, "CLOSE"); };
            //檢核_{投保險種資料}區塊資料
            consLogDate("-==btnNext4_檢核{投保險種資料}區塊資料==-");
            if (isChk && !chkSub_InsuredData()) { isChk = false; };
            //若有險種資料但其中任一險種保費為0，需顯示錯誤訊息「保費不得為0，請按下「計算保費」按鈕，計算保費！」
            consLogDate("-==btnNext4_檢核[險種資料]==-");
            var isChkPass = true;
            $.each($('#tblInsuranceList').DataTable().data(), function (i, item) {
                if ($('#selPAYWAY').val() == "C012") {
                    //[付款方式]為C012(分期付款)時，則判斷[月繳保費]欄位
                    if (item.InsMonth == 0 || item.InsMonth == null) { isChkPass = false; return false; };
                } else {
                    //[付款方式]非C012(分期付款)時，則判斷[保險費]欄位
                    if (item.MVPPREM == 0 || item.MVPPREM == null) { isChkPass = false; return false; };
                };
            });
            if (!isChkPass) {
                MsgBox('錯誤', '保費不得為0，請按下「計算保費」按鈕，計算保費！', 'red'); isChk = false;
            };
            //讀取_年齡係數
            getAgeFactor();
            //AS400檢核
            consLogDate("-==btnNext4_AS400檢核==-");
            if (isChk) { isChk = !(mqQuotation('1', '4') == "err"); };
            //檢核通過
            consLogDate("-==btnNext4_檢核通過==-");
            if (isChk) { ctrlDiv(4, "NEXT"); };
            $.unblockUI();
            consLogDate("-==btnNext4_E==-");
        }, 1);
    });
    //[編輯]按鈕4   {投保險種資料}
    $('#btnEdit4').on("click", function (e) {
        ctrlDiv(4, "EDIT");
        //特定欄位還是維持不啟用([保費],[獎金],[強制序號],[任意序號],[總保費 NT],[計算])
        _div4.find('#iptMANZPREM,#iptBONUS,#iptForceSerialNo,#iptAnySerialNo,#iptTotalInsurance,#selCalCode').attr('disabled', true);
        //機車不需輸入強制等級，汽車才要 彙總類別(C:汽車,M:機車)
        var sCategory = "";
        var dt = _arrLoadSysData.filter(function (x) { return x.CodeNo == 'T011_1' && x.VALUE == $('#selMANMVPZMTYPE').val(); });
        sCategory = (dt.length > 0) ? getObjToVal(dt[0].TEXT) : '';
        if (sCategory == 'M') {
            //設定[空值].移除[必填].欄位[鎖住].隱藏[星號]
            _div4.find('#selMANLEVEL').val('4').removeAttr('required').attr('disabled', true).prev().children().hide();
            _div4.find('#iptDrunkFreq').val('0').removeAttr('required').attr('disabled', true).prev().children().hide();
            _div4.find('#chkFRDATE2').parent().show();
        } else {
            //設定[空值].設定[必填].欄位[解鎖].顯示[星號]
            _div4.find('#selMANLEVEL').attr('required', 'required').removeAttr('disabled').prev().children().show();
            _div4.find('#iptDrunkFreq').attr('required', 'required').removeAttr('disabled').prev().children().show();
            _div4.find('#chkFRDATE2').parent().hide();
        };
        //[強制車種]開啟強制資料
        _div4.find('#chkMan').prop('checked', !(_div3.find('#selMANMVPZMTYPE').val() == ""));
        //[任意車種]開啟任意資料
        _div4.find('#chkAny').prop('checked', !(_div3.find('#selMVPZMTYPE').val() == ""));
        if (_div4.find('#chkMan').prop('checked')) {
            //{任意險}[保險期間](同強制險)開啟
            _div4.find('#chkCCDATE').attr('disabled', false);
            //若保期[起迄日期日]有值，則更新[保險期間]
            if ($("#iptFRDATES").val() != '' && $("#iptFRDATEE").val() != '') {
                if (AddYears($("#iptFRDATES").val(), 1) == $("#iptFRDATEE").val()) { $('#chkFRDATE1').prop('checked', true); };
                if (AddYears($("#iptFRDATES").val(), 2) == $("#iptFRDATEE").val()) { $('#chkFRDATE2').prop('checked', true); };
            };
        } else {
            //{任意險}[保險期間](同強制險)鎖住
            _div4.find('#chkCCDATE').attr('disabled', true).prop('checked', false);
        };
        if (_div4.find('#chkAny').prop('checked')) {
            if (_div4.find('#chkMan').prop('checked')) {
                if (_div4.find('#iptCCDATES').val() == _div4.find('#iptFRDATES').val()
                 && _div4.find('#iptCCDATEE').val() == _div4.find('#iptFRDATEE').val()) {
                    $('#chkCCDATE').prop('checked', true);
                };
            };
            _dtUserInsList = getdata("/Quotation/getUserInsList", {});
            setDDLZCAMPAN(_dtUserInsList);    //設定[活動方案/自訂方案]下拉選單內容
            //[續保作業]時，[折舊率]不可修改
            $('#selDepRate').attr('disabled', ($('#iptOLDPOLNUM').val() != '' || $('#iptPOLNUM').val() != ''));
            //顯示提醒[我的最愛]
            ShowMsgInElmDisappear('#btnSetUserPro', '請按此建立管理[我的最愛]！');
        };
        _div4.find('#chkMan,#chkAny').change();
        var divIns = $('#divInsured');
        //關閉[險種資訊]
        divIns.hide(200);
        //移除下拉選單內容
        divIns.find('#selSUMINA,#selSUMINB,#selSUMINC,#selZFACTORA,#selZFACTORB,#selEXCESS').empty();
        divIns.find('#iptSUMINA,#iptSUMINC').val('');
        //移除必選欄位
        divIns.find('#selSUMINA,#selSUMINB,#selSUMINC,#selZFACTORA,#selZFACTORB,#selEXCESS,#iptSUMINA,#iptSUMINC').removeAttr('required');
        //預設為不可選取
        divIns.find('#selSUMINA,#selSUMINB,#selSUMINC,#selZFACTORA,#selZFACTORB,#selEXCESS,#iptSUMINA,#iptSUMINC').attr('disabled', true);
    });
    //[下一步]按鈕5 {其他約定事項}
    $('#btnNext5').on("click", function (e) {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            var isChk = true;
            //清空警告訊息
            removeMsgObjList($('#divOtherData').find('input,select'));
            //檢核_必填欄位
            ///if (isChk && !chkObjList($('#iptAGRDRI01,#iptAGRDRI02,#iptAGRDRI03,#iptAGRDRI04,#iptAGRDRI05'), true)) { isChk = false; };
            //檢核_傷害險被保險人必填欄位
            if (isChk) { isChk = chktblBeneList(); };
            //檢核_[附件上傳]
            if (isChk) { isChk = chkUploadFail(); };
            //AS400檢核
            if (isChk) { isChk = !(mqQuotation('1', '5') == "err"); };
            //檢核通過
            if (isChk) {
                ctrlDiv(5, "NEXT");
                $('#btnSubmit').attr('disabled', false);    //解開[確定]按鈕
            };
            $.unblockUI();
        }, 1);
    });
    //[編輯]按鈕5   {其他約定事項}
    $('#btnEdit5').on("click", function (e) {
        ctrlDiv(5, "EDIT");
        //若[受益人]對應險種清單為空時，則鎖住受益人資料
        if (_div5.find("select#selBenZCVRTYPE option").length == 0) {    //若[受益人]對應險種清單為空時
            CreatBenDT([]); //清空[受益人資料]
            _div5.find('#chkBen').prop('checked', false).change().attr('disabled', true);
        } else {
            _div5.find('#chkBen').attr('disabled', false);
        };
        setTimeout(function () {
            $('#tblBeneList').DataTable().columns.adjust().responsive.recalc();
        }, 3000);
    });
    //[附件上傳]按鈕{其他約定事項}
    $('#btnOpenUploadDiv').on("click", function (e) {
        $("#divUploadFile").modal('show');
    });
    //[瀏覽檔案]按鈕{檔案上傳}
    $('#divUploadFile').on('change', 'input[name$="uploadFile"]', function () {
        let oThis = $(this);
        if (oThis[0].files.length > 0) {
            let set = new Set();
            let selectedItem = $('#UploadFileDiv .fileItem');
            if (selectedItem != undefined && selectedItem.length > 0) {
                selectedItem.each(function (index, item) {
                    set.add(item.innerText.replace("[", "").replace("]", ""));
                });
            };
            if (set.has(oThis[0].files[0].name)) {
                MsgBox('上傳檔案錯誤', "請勿選擇相同檔案!", 'red');
                oThis.val('');
            } else {
                let fileName = '[' + oThis[0].files[0].name + ']';
                oThis.parent().next('label').text(fileName);            //顯示檔名
                oThis.parent().hide();                                  //隱藏[瀏覽檔案]按鈕
                oThis.parent().next().next().show();                    //顯示[刪除]按鈕
                getPreView(oThis.parent().prev("").prev("").show(), oThis.parent().prev("label").show(), this);    //預覽圖片
                $('#UploadFileDiv').append(oThis.parent().parent().removeClass().addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12 input-group'));
                $('#divUploadOpt').prepend($('#UploadFileTemplate').html());    //重新繪製[瀏覽檔案]
            };
        };
    });
    //[檔案上傳確定]按鈕
    $('#confirmUploadFile').on('click', function () {
        var isChk = true;
        //檢核_[附件上傳]
        if (isChk) { isChk = chkUploadFail(); };
        if (isChk) {
            let inputFile = $('#UploadFileDiv .uploadFile');
            $('#uploadFileCount').text('預計上傳' + inputFile.length + '個檔案');
            $("#divUploadFile").modal('hide');
        }
    });
    //[刪除]按鈕{檔案上傳}
    $('#divUploadFile').on('click', '.delFile', function () {
        let oThis = $(this);
        oThis.parent().parent().remove();
    });
    //[行動投保]按鈕
    $('#btnMobileInsure').on('click', function () {
        opener.OpenDivMobileInsure();
        window.close();
    });
};
//初始化_預設值
function InitDefault() {
    /*--預設值設定---------------------------------------------*/
    consLogDate("InitDefault()_預設值設定(S)");
    $('#iptQuotDate').val(GetDay(''));                                              //車險報價日期，預帶今日        
    $('.oldval').each(function (i, item) { $(item).attr('oldval', $(item).val()); });   //設定舊值
    /*--元件啟用設定-------------------------------------------*/
    consLogDate("InitDefault()_元件啟用設定");
    $('#chkMan,#chkAny,#chkBen').prop('checked', false).parent().next().next('.panel-info').hide(200);
    $("#rdoAPLCustType[value='P'],#rdoCTLCustType[value='P']").prop("checked", true).change();      /*客戶類別(預設為:自然人)*/
    //續保件報價(登入時開啟[上年度保單號碼],[上年度強制保險證號]欄位)
    if ($(location)[0].search.indexOf('ConQuot') > -1) {
        $('#iptPOLNUM,#iptOLDPOLNUM').parent().show();              //顯示[上年度保單號碼]/[上年度強制證號]欄位
        $('#spanTitle').text("續保件報價");                         //調整標題
    };
    //[收費員資料]處理
    InitDefault.InitTollClter();
    //傷害險名冊[法定受益人]處理
    //$('#selBenLEGAL').change();
    /*--載入處理設定-------------------------------------------*/
    consLogDate("InitDefault()_載入處理設定");
    _strMode = $('#hidmode').val();
    switch (_strMode) {
        case 'EDIT':            /*--[修改]模式--*/
            consLogDate("InitDefault_載入處理設定[修改]模式");
            $('#iptQUOTENO').attr('disabled', true);                    //鎖住[報價單號碼]
            getWebQuotData($('#iptQUOTENO').val(), "LOADDATA");         //讀取[報價單資料]
            $('#btnQryQUOTENO').parent().hide();                        //隱藏[複製報價單]按鈕
            $('#btnStorCache').parent().hide();                         //隱藏[暫存]按鈕
            $('#btnSubmit').parent().addClass('col-lg-offset-3')        //調整[確定]按鈕位置
            $('#spanTitle').text("修改報價單");                         //調整標題
            //setDDL('#selZCVRTYPE', getdata("/Quotation/GetINSUREDLIST", { sISUPD: 'Y' }), ' ');   //險種清單查詢(包括已停售險種)
            clrInsTBPremium()                                           //清空[險種資料]保險費
            insuredDT()                                                 //險種資料相關資料處理
            break;
        case 'TEMP':            /*--[要保資料輸入]模式--*/
            consLogDate("InitDefault()_載入處理設定[要保資料輸入]模式");
            $('#iptQUOTENO').attr('disabled', true);                    //鎖住[報價單號碼]
            getWebQuotData($('#iptQUOTENO').val(), "LOADTEMPDATA");     //讀取[報價單資料]
            $('#btnQryQUOTENO').parent().hide();                        //隱藏[複製報價單]按鈕
            break;
        case 'COPY':            /*--[複製為新件]模式--*/
            consLogDate("InitDefault()_載入處理設定[複製為新件]模式");
            $('#btnQryQUOTENO').click();                                //執行[複製報價單]
            setDDL_SYSCODEDT(_arrLoadSysData, 'INSUREDNEWLIST', '#selZCVRTYPE');  //[險種](限定可報價險種)
            setTimeout(function () {
                $('#iptQUOTENO').val('');                               //清空[報價單號碼]
            }, 50);
            break;
        case 'PROCEED':         /*--續保作業[續保報價]模式--*/
        case 'PROCEEDNEW':      /*--續保作業[複製為新件]模式--*/
            consLogDate("InitDefault()_載入處理設定[續保作業]模式");
            $('#iptPOLNUM,#iptOLDPOLNUM').parent().show();              //顯示[上年度保單號碼]/[上年度強制證號]欄位
            var sCHDRNUM = $('#hidCHDRNUM').val();
            var sCHDRNUMType = $('#hidCHDRNUMType').val();
            if (sCHDRNUMType == '1') {
                $('#iptPOLNUM').val(sCHDRNUM);                          //帶入[上年度保單號碼]
                $('#btnQryPOLNUM').click();                             //[上年度保單號碼]查詢
            } else if (sCHDRNUMType == '2') {
                $('#iptOLDPOLNUM').val(sCHDRNUM);                       //帶入[上年度強制證號]
                $('#btnQryOLDPOLNUM').click();                          //[上年度強制證號]查詢
            };
            if (_strMode == 'PROCEED') {                //----[續保作業]
                $('#spanTitle').text("續保件報價");                     //調整標題
            } else if (_strMode == 'PROCEEDNEW') {      //----[續保複製為新件]
                setTimeout(function () {
                    $('#iptPOLNUM,#iptOLDPOLNUM').val('').parent().hide();  //隱藏[上年度保單號碼]/[上年度強制證號]欄位
                    $('#btnUnCTLCustID,#btnUnAPLCustID').parent().show();   //顯示[(被保險人/要保人)客戶代號解鎖]按鈕
                    $('#iptFRDATES,#iptFRDATEE,#iptCCDATES,#iptCCDATEE').val('').blur();    //清空[強制保期(起)][任意保期(起)]
                }, 50);
            };
            break;
        case 'PROCEEDVIEW':     /*--續保作業[檢視]模式--*/
            $('#iptPOLNUM,#iptOLDPOLNUM').parent().show();              //顯示[上年度保單號碼]/[上年度強制證號]欄位
            var sCHDRNUM = $('#hidCHDRNUM').val();
            var sCHDRNUMType = $('#hidCHDRNUMType').val();
            if (sCHDRNUMType == '1') {
                $('#iptPOLNUM').val(sCHDRNUM);                          //帶入[上年度保單號碼]
            } else if (sCHDRNUMType == '2') {
                $('#iptOLDPOLNUM').val(sCHDRNUM);                       //帶入[上年度強制證號]
            };
            getProceedData(sCHDRNUM);
            $('#spanTitle').text("續保件報價");                     //調整標題
            $('#btnQryPOLNUM,#btnQryOLDPOLNUM,#btnQryQUOTENO,#btnStorCache,#btnSubmit,#btnClose').parent().hide();
            $('#iptQUOTENO,#iptPOLNUM,#iptOLDPOLNUM').attr('disabled', true);                    //鎖住[報價單號碼]
            ///設定下拉選單
            var sYear = getObjToVal(_divQ.data('F_CCDATE')).substr(0, 4);
            if (sYear != "") { $('#selFRDATESY').append('<option value="' + sYear + '">' + sYear + '</option>'); }
            sYear = getObjToVal(_divQ.data('F_CRDATE')).substr(0, 4);
            if (sYear != "") { $('#selFRDATEEY').append('<option value="' + sYear + '">' + sYear + '</option>'); }
            sYear = getObjToVal(_divQ.data('A_CCDATE')).substr(0, 4);
            if (sYear != "") { $('#selCCDATESY').append('<option value="' + sYear + '">' + sYear + '</option>'); }
            sYear = getObjToVal(_divQ.data('A_CRDATE')).substr(0, 4);
            if (sYear != "") { $('#selCCDATEEY').append('<option value="' + sYear + '">' + sYear + '</option>'); }
            ///載入值
            $('#iptQUOTENO').data('isSysPass', true);
            $('#iptFRDATES').val(getObjToVal(_divQ.data('F_CCDATE'))).blur();     //原保單強制起保日(續保件檢視用)
            $('#iptFRDATEE').val(getObjToVal(_divQ.data('F_CRDATE'))).blur();     //原保單強制迄止日(續保件檢視用)
            $('#iptCCDATES').val(getObjToVal(_divQ.data('A_CCDATE'))).blur();     //原保單任意起保日(續保件檢視用)
            $('#iptCCDATEE').val(getObjToVal(_divQ.data('A_CRDATE'))).blur();     //原保單任意迄止日(續保件檢視用)
            $('#iptQUOTENO').data('isSysPass', false);
            break;
        case 'VIEW':            /*--[檢視]模式--*/
            consLogDate("InitDefault()_載入處理設定[檢視]模式");
            getWebQuotData($('#iptQUOTENO').val(), "VIEW");             //讀取[報價單資料]
            $('#iptQUOTENO').attr('disabled', true);                    //鎖住[報價單號碼]
            $('#btnQryQUOTENO,#btnStorCache,#btnSubmit,#btnClose').parent().hide();
            break;
        case 'MobileInsureVIEW':            /*--[檢視]模式--*/
            consLogDate("InitDefault()_載入處理設定[行動投保檢視]模式");
            getWebQuotData($('#iptQUOTENO').val(), "MobileInsureVIEW");             //讀取[報價單資料]
            $('#iptQUOTENO').attr('disabled', true);                    //鎖住[報價單號碼]
            $('#btnQryQUOTENO,#btnStorCache,#btnSubmit,#btnClose').parent().hide();
            break;
        default:
            consLogDate("InitDefault_載入處理設定[新件]模式");
            //setDDL_SYSCODEDT(_arrLoadSysData, 'INSUREDNEWLIST', '#selZCVRTYPE');  //[險種](限定可報價險種)
            break;
    };
    consLogDate("InitDefault()_鎖住所有控制項");
    ctrlDiv(-1, "LOCK");            /*鎖住所有控制項*/
    if (_strMode == 'VIEW' || _strMode == 'PROCEEDVIEW' || _strMode == 'MobileInsureVIEW') {
        consLogDate("InitDefault()_載入處理設定[檢視]模式(開啟所有頁)");
        ctrlDiv(-1, "OPEN");        //開啟所有頁
        $('#btnEdit1,#btnEdit2,#btnEdit3,#btnEdit4,#btnEdit5').parent().hide();                 //[編輯]按鈕隱藏
        _div2.find('#btnCTLCustID,#btnCTLCustNM,#btnAPLCustID,#btnAPLCustNM').parent().hide();  //客戶資料查詢按鈕隱藏
        _div4.find('#btnInsNew,#btnCalPre').parent().hide();        //[投保險種][計算保費]按鈕隱藏
        _div4.find('#chkFRDATE1,#chkCCDATE').parent().parent().parent().hide()      //[保險期間]隱藏
        _div5.find('#btnBenNew,#btnUploadClear').parent().hide();                   //[新增受益人],[清空附件]按鈕隱藏
        _div5.find('#txtRecords').attr('disabled', false).attr('readonly', true);   //[記錄]開啟，不可修改
        $('#btnBack').parent().show();                              //[返回]按鈕顯示
        if (_strMode == 'MobileInsureVIEW') {
            $('#btnBack').parent().hide();
            $('#btnMobileInsure').parent().show();
        }
        if ($('#tblInsuranceList').DataTable().data().length > 0) {
            setTimeout(function () {
                consLogDate("tblInsuranceList_recalc1_Start");
                $('#tblInsuranceList').DataTable().columns.adjust().responsive.recalc();
                consLogDate("tblInsuranceList_recalc1_End");
            }, 3000);
        };
        if ($('#tblBeneList').DataTable().data().length > 0) {
            consLogDate("InitDefault()_載入處理設定[檢視]模式(調整[受益人資料]table)");
            //調整[受益人資料]table，在IE不知道為什麼要調2次，才會正常顯示
            setTimeout(function () {
                consLogDate("tblBeneList_recalc1_Start");
                $('#tblBeneList').DataTable().columns.adjust().responsive.recalc();
                consLogDate("tblBeneList_recalc1_End");
            }, 5000);
            setTimeout(function () {
                consLogDate("tblBeneList_recalc2_Start");
                $('#tblBeneList').DataTable().columns.adjust().responsive.recalc();
                consLogDate("tblBeneList_recalc2_End");
            }, 6000);
        };
    } else {
        consLogDate("InitDefault()_執行步驟一[編輯]");
        $('#btnEdit1').click();         /*執行步驟一[編輯]*/
    };
    //焦點移至分頁最上方
    //setTimeout(function () {
    //    $('html, body').animate({ scrollTop: 0 }, 0);
    //}, 200);
    consLogDate("InitDefault()_預設值設定(E)");
};
//初始化_[收費員資料]
InitDefault.InitTollClter = function () {
    //var hidTollClterData = $('#hidTollClterData');
    //if (hidTollClterData.val() != '') {
    //    var dt = JSON.parse(hidTollClterData.val());
    //    /*GENAREA: "  20140421C...", TOLLCLTERID: "F220434859", TOLLCLTERNAME: "林愛玉", TOLLCLTERNO: "AP", TOLLCLTERREGNO: "FB1H121265"*/
    //    if (dt.length > 0) {
    //        $('#iptTollClterNo').val(getObjToVal(dt[0].TOLLCLTERNO)).attr('required', true);                       /*[收費員代碼]*/
    //        $('#divQuoteDate').data("TOLLCLTERID", getObjToVal(dt[0].TOLLCLTERID));         /*收費員ID*/
    //        $('#divQuoteDate').data("TOLLCLTERNAME", getObjToVal(dt[0].TOLLCLTERNAME));     /*收費員名稱*/
    //        $('#divQuoteDate').data("TOLLCLTERREGNO", getObjToVal(dt[0].TOLLCLTERREGNO));   /*收費員登錄證號*/
    //        _div1.find('#iptGenareaNM').val($('#divQuoteDate').data("TOLLCLTERNAME"));      /*收費員名稱*/
    //        _div1.find('#iptSalesmanRegNo').val($('#divQuoteDate').data("TOLLCLTERREGNO")); /*業務員登錄字號*/
    //        //打開[電話][傳真][EMail]欄位(登入時會用ID去T9982找資料，若有，則為電銷人員)[電銷人員]不鎖[業務人員編號]
    //        _div1.find('#iptAgentTEL,#iptAgentFAX,#iptAgentEMail').attr('disabled', false);
    //    } else {
    //        hidTollClterData.val('');
    //    };
    //};
};
//畫面調整
$(window).bind('resize', function () {
    //BlockUI('畫面自動調整中，請稍後');
    setTimeout(function () {
        $('#tblInsuranceList, #tblBeneList, #tblCustInfo').DataTable().columns.adjust().responsive.recalc();
        ctrlZmakeWidth();   //[廠牌]寬度處理
        $.unblockUI();
    }, 200)
});
/******系統觸發事件_End********************************/


/******自訂函式_Start**********************************/
///*==[控制類]_Start===========================*/
//控制_區塊展開/關閉([divIndex]:處理div位置(-1為全部), [action]:動作, [sec]:開關秒數)
function ctrlDiv(divIndex, action, sec) {
    //開關秒數，預設2秒
    if (typeof (sec) == "undefined") { sec = 200; };
    //所有div清單
    var divList = "#divSalesmanData,#divInsurerData,#divCarInfo,#divInsInfo,#divOtherData";
    //所有div清單陣列
    var divArr = divList.split(',');
    //查詢divName
    var divNM = divIndex == -1 ? divList : divArr[divIndex - 1];
    //特別元件底色
    var sCol = "ffffff";
    //宣告暫存div
    var divObj = $(divNM);
    //處理動作
    if (action == "CLOSE") {
        /*--========== 動作_[關閉] ==========--*/
        divObj.hide(sec).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
    } else if (action == "OPEN") {
        /*--========== 動作_[展開] ==========--*/
        divObj.show(sec).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
    } else if (divIndex != -1 && action == "NEXT") {
        /*--========== 動作_[下一步] ==========--*/
        //所有[輸入框、按鈕]不啟用，[下一步]按鈕(隱藏),[編輯]按鈕(顯示,啟用)
        ctrlDiv(divIndex, "LOCK");
        //所有頁關閉
        ctrlDiv(-1, "CLOSE");
        //下頁開啟
        ctrlDiv((divIndex + 1), "OPEN");
        //下頁的[下一步]按鈕(顯示,啟用),[編輯]按鈕(隱藏)
        $('#btnEdit' + (divIndex + 1)).click();
        //GRID調整
        setTimeout(function () {
            $('#tblInsuranceList, #tblBeneList, #tblCustInfo').DataTable().columns.adjust().responsive.recalc();
        }, 500);
    } else if (divIndex != -1 && action == "EDIT") {
        /*--========== 動作_[編輯] ==========--*/
        //設定底色
        sCol = "ffffff";
        //所有[輸入框、按鈕]啟用
        divObj.find('input,select,button,textarea').each(function () { this.disabled = false; });
        //其他區塊處理
        for (let i = divIndex; i <= 5; i++) {
            //[下一步][編輯]按鈕(此步驟後面所有[下一步]&[編輯]按鈕先隱藏)
            $('#btnNext' + (i) + ',#btnEdit' + (i)).parent().hide();
        }
        //[下一步]按鈕(開啟本頁[啟用]按鈕)
        $('#btnNext' + (divIndex)).attr('disabled', false).parent().show();
        //所有頁關閉
        ctrlDiv(-1, "CLOSE", 0);
        //本頁開啟
        ctrlDiv(divIndex, "OPEN", 0);
        //焦點移至分頁最上方
        setTimeout(function () {
            setFocusDiv(divArr[divIndex - 1]);
        }, 200);
    } else if (action == "LOCK") {
        /*--========== 動作_[鎖住] ==========--*/
        //設定底色
        sCol = "eeeeee";
        //所有[輸入框、按鈕]不啟用
        divObj.find('input,select,button,textarea').each(function () { $(this).attr('disabled', true); });
        //[下一步]按鈕(隱藏),[編輯]按鈕(顯示,啟用)
        var iS = 1, iE = 5;
        if (divIndex != -1) { iS = divIndex; iE = divIndex; };
        for (let i = iS; i <= iE; i++) {
            $('#btnNext' + (i)).parent().hide();
            $('#btnEdit' + (i)).attr('disabled', false).parent().show();
        }
    } else if (divIndex != -1 && action == "FOCUS") {
        /*--========== 動作_[移至焦點區域] =========--*/
        //本頁開啟
        ctrlDiv(divIndex, "OPEN", 0);
        //焦點移至分頁最上方
        setTimeout(function () {
            setFocusDiv(divArr[divIndex - 1]);
        }, 200);
    };
    /*--========== [鎖住&編輯]物件底色_處理 =========--*/
    if (action == "EDIT" || action == "LOCK") {
        var iS = 1, iE = 5;
        if (divIndex != -1) { iS = divIndex; iE = divIndex; };
        for (let i = iS; i <= iE; i++) {
            if (i == 1) {
                $('#selAGNTNUM').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #' + sCol.substr(0, 3) + ' 0%, #' + sCol + ' 100%);');
                $("#selAGNTNUM").selectpicker('refresh');
            } else if (i == 2) {
                $('#rdoAPLCustType,#rdoCTLCustType').parent().parent().attr('style', 'width:0%; background-color:#' + sCol + ';border: 1px solid #cccccc;height:34px;');
            } else if (i == 3) {
                ctrlZmakeWidth();   //控制_[廠型]寬度處理
            } else if (i == 4) {
                $('#chkFRDATE1,#chkCCDATE').parent().parent().attr("style", 'width:0%; background-color:#' + sCol + ';border: 1px solid #cccccc;height:34px;');
            };
        };
        if ($('#btnSubmit').attr('disabled') != 'disabled') { $('#btnSubmit').attr('disabled', true); };
    };
    $.unblockUI();
};
//控制_訊息處理[(MsgType]:訊息類別(M:MsgBox,S:ShowMsgInElm,F:focus,Ox:ctrlDiv(x,"OPEN",0)), [Msg]:訊息內容, [ObjNM]:物件名稱)
function ctrlMsg(MsgType, Msg, ObjNM) {
    //先關閉遮蔽
    $.unblockUI();
    //訊息預設值
    if (Msg == "") { Msg = '必填欄位'; };
    //開啟區塊
    if (MsgType.indexOf('O') > -1) {
        var iDivIndex = MsgType.substr(MsgType.indexOf('O') + 1, 1);
        ctrlDiv(iDivIndex, "OPEN", 0);
        if (!$('#btnEdit' + iDivIndex).is(":hidden")) {
            ConfirmBox('請確認', Msg + '<BR>請問是否進行[編輯]?', 'orange'
                , function () {
                    $('#btnEdit' + iDivIndex).click();
                    setTimeout(function () { $(ObjNM).focus(); }, 500);
                }, function () {
                    ctrlDiv(iDivIndex, "CLOSE", 0);
                }
            );
        };
    };
    //焦點Focus處理
    if (MsgType.indexOf('F') > -1) {
        var fouObjNM = ObjNM;
        if (getObjToVal($(ObjNM).attr('class')).indexOf('form_selDate') > -1) {    //如果有套用日期選單，則顯示在[年]的下拉選單上
            fouObjNM = "#" + $(ObjNM).parent().find('select')[1].id;
        };
        if ($(fouObjNM).attr('disabled') === 'disabled') {
            $(fouObjNM).attr('disabled', false).focus().attr('disabled', true);  //focus() 需要先解開，再處理
        } else { $(fouObjNM).focus(); };
    };
    //顯示錯誤訊息
    if (MsgType.indexOf('S') > -1) { setTimeout(function () { $(ObjNM).each(function () { ShowMsgInElm('#' + this.id, Msg); }); }, 20); };
    //顯示錯誤訊息視窗
    if (MsgType.indexOf('M') > -1 && MsgType.indexOf('O') == -1) { setTimeout(function () { MsgBox('錯誤', Msg, 'red'); }, 500); };
};
//鎖住_{被保險人及要保人資料}[ID,姓名,生日,性別]等欄位([sType]:處理種類(ALL:全部,CTL:被保險人,APL:要保人),[action]:動作)
function ctrlInputCust() {
    var sBranchNo = $('#iptBranchNo').val().trim();   //[單位別]
    var isProceed = false;      //是否為續保作業
    isProceed = ($('#iptOLDPOLNUM').val() != '' || $('#iptPOLNUM').val() != '');

    var isLock_CTL = true;      //[要保人]是否鎖住
    isLock_CTL = (_div2.find('#iptCTL_CLNTNUM').val() != "");
    var is70BNO_CTL = false;    //[要保人]是否有70單位別
    is70BNO_CTL = (_div2.find("#iptCTLCustID").data("Is70BNO") == 'Y');
    var isPEND_CTL = false;     //[要保人]是否有未決賠案
    isPEND_CTL = (_div2.find("#iptCTLCustID").data("IsPEND") == 'Y');

    var isLock_APL = true;      //[被保險人]是否鎖住
    isLock_APL = (_div2.find('#iptAPL_CLNTNUM').val() != "");
    var is70BNO_APL = false;    //[被保險人]是否有70單位別
    is70BNO_APL = (_div2.find("#iptAPLCustID").data("Is70BNO") == 'Y');
    var isPEND_APL = false;     //[被保險人]是否有未決賠案
    isPEND_APL = (_div2.find("#iptAPLCustID").data("IsPEND") == 'Y');

    var sCol = "eeeeee";        //[客戶類別]底色
    var isLock = true;          //是否鎖住

    ///==[續保作業]處理_Start=================================
    if (isProceed) {
        $('#btnCTLCustID,#btnCTLCustNM,#btnUnCTLCustID').parent().hide();  //隱藏[客戶資料查詢]等...按鈕
    };
    //==[續保作業]處理_End===================================

    ///==[被保險人]欄位處理_Start=============================
    //{被保險人}[ID,姓名,生日,性別]等欄位
    $('#rdoCTLCustType,#selCTLNation,#iptCTLCustID,#iptCTLName,#selCTLSex,#selCTLBirthdayY,#selCTLBirthdayM,#selCTLBirthdayD').attr('disabled', isLock_CTL);
    //{被保險人}[客戶類別]
    sCol = (isLock_CTL) ? "eeeeee" : "ffffff";
    $('#rdoCTLCustType').parent().parent().attr('style', 'width:0%; background-color:#' + sCol + ';border: 1px solid #cccccc;height:34px;');
    //{被保險人}續保時，相關欄位處理
    if (isLock_CTL) {
        isLock = isPEND_CTL;    //是否有[未決賠案]
        if (!isLock) {  //沒有[未決賠案]時
            if (is70BNO_CTL) {  //則判斷[是否有70單位別]
                isLock = !(sBranchNo == '70');  //則判斷[目前單位是否為70]
            } else { isLock = false; }
        };
        console.log('[' + _div2.find('#iptCTL_CLNTNUM').val() + ']:[Is70BNO]=' + is70BNO_CTL + ',[IsPEND]=' + isPEND_CTL);
    } else { isLock = false; };
    $('#iptCTLRepresentative,#selCTLMarriage,#iptCTLOfficeTel,#iptCTLHomeTel,#iptCTLCellPhone,#iptCTLFax,#iptCTLEmail,#selCTLADD1,#selCTLADD2,#iptCTLADDPot,#iptCTLADDO').attr('disabled', isLock);
    //==[被保險人]欄位處理_End===============================

    ///==[要保人]欄位處理_Start===============================
    //{要保人}[ID,姓名,生日,性別]等欄位
    $('#rdoAPLCustType,#selAPLNation,#iptAPLCustID,#iptAPLName,#selAPLSex,#selAPLBirthdayY,#selAPLBirthdayM,#selAPLBirthdayD').attr('disabled', isLock_APL);
    //{要保人}[客戶類別]
    sCol = (isLock_APL) ? "eeeeee" : "ffffff";
    $('#rdoAPLCustType').parent().parent().attr('style', 'width:0%; background-color:#' + sCol + ';border: 1px solid #cccccc;height:34px;');
    //{要保人}續保時，相關欄位處理
    if (isLock_APL) {
        isLock = isPEND_APL;    //是否有[未決賠案]
        if (!isLock) {  //沒有[未決賠案]時
            if (is70BNO_APL) {  //則判斷[是否有70單位別]
                isLock = !(sBranchNo == '70');  //則判斷[目前單位是否為70]
            } else { isLock = false; }
        };
        console.log('[' + _div2.find('#iptAPL_CLNTNUM').val() + ']:[Is70BNO]=' + is70BNO_APL + ',[IsPEND]=' + isPEND_APL);
    } else { isLock = false; };
    $('#iptAPLRepresentative,#selAPLMarriage,#iptAPLOfficeTel,#iptAPLHomeTel,#iptAPLCellPhone,#iptAPLFax,#iptAPLEmail,#selAPLADD1,#selAPLADD2,#iptAPLADDPot,#iptAPLADDO').attr('disabled', isLock);
    //{要保人}[解鎖]按鈕顯示
    if (isLock_APL) {
        $('#btnUnAPLCustID').parent().show();
    } else { $('#btnUnAPLCustID').parent().hide(); };
    ///==[要保人]欄位處理_End=================================
};
//控制_[廠型]寬度處理
function ctrlZmakeWidth() {
    var sCol = "eee";
    sCol = ($('#btnNext3').is(":hidden")) ? "eee" : "fff";  //當[下一步]按鈕出現時，則帶fff底色
    var iWidth = $(window).width();
    if (iWidth >= 992) {
        //console.log('(1)iWidth:' + iWidth + ',window:' + $(window).width());
        $('#selZMAKE').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #' + sCol + ' 0%, #' + sCol + sCol + ' 100%);');
    } else if (iWidth < 992 && iWidth >= 751) {
        iWidth = iWidth - 318;
        //console.log('(2)iWidth:' + iWidth + ',window:' + $(window).width());
        $('#selZMAKE').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #' + sCol + ' 0%, #' + sCol + sCol + ' 100%); width:' + iWidth + 'px;');
    } else if (iWidth < 751) {
        iWidth = iWidth - 101;
        //console.log('(3)iWidth:' + iWidth + ',window:' + $(window).width());
        $('#selZMAKE').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #' + sCol + ' 0%, #' + sCol + sCol + ' 100%); width:' + iWidth + 'px;');
    };
    $("#selZMAKE").selectpicker('refresh');
};
//開啟_[自訂方案]說明
function openHple_SetUserPro(e) {
    var objBtnNM = '#' + $(e).attr('id');
    var msg = '';
    msg += "---------新增步驟----------|";
    msg += "步驟1:新增[承保內容]|";
    msg += "步驟2:開啟[自訂方案]|";
    msg += "步驟3:填入[自訂方案名稱]|";
    msg += "步驟4:按下[<i class='fa fa-floppy-o'></i>]鍵儲存|";
    msg += "---------修改步驟----------|";
    msg += "步驟1:選取[自訂方案]|";
    msg += "步驟2:調整[承保內容]|";
    msg += "步驟3:按下[<i class='fa fa-heart'></i>]開啟[我的最愛]|";
    msg += "步驟4:按下[<i class='fa fa-floppy-o'></i>]鍵儲存|";
    ShowMsgInElm($(objBtnNM), msg.replace(/[|]/g, "<br>"));
};
//開啟/關閉_[製造年]必填
function openSelYRMANF() {
    var selYRMANF = $('#selYRMANF,#selMNMANF');
    //單讀承保[強制險]不需輸入「製造年」
    if (_div3.find('#selMANMVPZMTYPE').val() != '' && _div3.find('#selMVPZMTYPE').val() == '') {
        selYRMANF.removeAttr('required').prev().children().hide();
    } else {
        selYRMANF.attr('required', true).prev().children().show();
    };
};
//控制_[投保險種資料]區塊處理
function ctrlIns() {
};
//控制_[強制任意險保期]([ObjAction]:觸發動作物件名稱)
ctrlIns.Date = function (ObjActNM) {
    let iptFRDATES = $('#iptFRDATES');      /*[強制保期(起)]*/
    let iptFRDATEE = $('#iptFRDATEE');      /*[強制保期(迄)]*/
    let iptCCDATES = $('#iptCCDATES');      /*[任意保期(起)]*/
    let iptCCDATEE = $('#iptCCDATEE');      /*[任意保期(迄)]*/
    let chkFRDATE1 = $('#chkFRDATE1');      /*[強制保險期間(一年期)]*/
    let chkFRDATE2 = $('#chkFRDATE2');      /*[強制保險期間(二年期)]*/
    let chkCCDATE = $('#chkCCDATE');        /*[任意保險期間(同強制險)]*/
    let isChkFR1 = document.getElementById("chkFRDATE1").checked;   /*是否勾選[強制保險期間(一年期)]*/
    let isChkFR2 = document.getElementById("chkFRDATE2").checked;   /*是否勾選[強制保險期間(一年期)]*/
    let isChkCC = document.getElementById("chkCCDATE").checked;   /*[任意保險期間(同強制險)]*/
    let iFRYear = parseInt($('#divQuoteDate').data("FRDateYear"));
    let value = "";
    switch (ObjActNM) {
        case "chkFRDATE1":      /*--==========[強制保險期間(一年期)]==========--*/
        case "chkFRDATE2":      /*--==========[強制保險期間(二年期)]==========--*/
            if (document.getElementById(ObjActNM).checked) {
                let year = document.getElementById(ObjActNM).value;
                $('#divQuoteDate').data("FRDateYear", year);
                chkFRDATE1.prop('checked', (year == '1'));
                chkFRDATE2.prop('checked', (year == '2'));
                if (iptFRDATES.val() == '') { //若保期[起日]有值，則更新[迄日]
                    iptFRDATES.val(GetDay('')).blur();
                };
                iptFRDATEE.val(AddYears(iptFRDATES.val(), year)).blur().change();
                chkCCDATE.change();   //如果有點選[任意保期]，則更新[任意起迄日期]
            } else {
                $('#divQuoteDate').data("FRDateYear", '');
            };
            break;
        case "chkCCDATE":       /*--==========[任意保險期間(同強制險)]==========--*/
            if (isChkCC) {
                iptCCDATES.val(iptFRDATES.val()).blur();    //[任意保期(起)]=[強制保期(起)]
                iptCCDATEE.val(iptFRDATEE.val()).blur();    //[任意保期(迄)]=[強制保期(迄)]
                ctrlIns.CalCode();                          //檢查[任意保期期間大於一年以上調整計算選項]
                ctrlIns.ProcessProjectNo();                 //專案代號處理
                if (isChkCC && iptCCDATES.val() != iptCCDATES.attr('oldval') && getObjToVal(iptCCDATES.attr('oldval')) != "") {
                    ctrlIns.UnlockProceedArea('1');     //若[任意保險期間(同強制險)]，則清空[上年度保單號碼]
                    if ($('#iptAnySerialNo').val() != "") { $('#iptAnySerialNo').val(''); };    //若有[任意險序號]，則清空
                };
            };
            break;
        case "iptCCDATES":      /*--==========[任意保期(起)]==========--*/
            //[任意保期(迄)]自動+1年
            if (checkdate(iptCCDATES.val())) { iptCCDATEE.val(AddYears(iptCCDATES.val(), 1)).blur(); };
            //連動[強制保期]
            if (isChkCC) {
                iptFRDATES.val(iptCCDATES.val()).blur();    //[強制保期(起)]=[任意保期(起)]
                iptFRDATEE.val(iptCCDATEE.val()).blur();    //[強制保期(迄)]=[任意保期(迄)]
                ctrlIns.Date("ChackFRDATE");                //檢查[強制保險期間]
            };
            ctrlIns.CalCode();                              //檢查[任意保期期間大於一年以上調整計算選項]
            ctrlIns.ProcessProjectNo();                 //專案代號處理
            break;
        case "iptCCDATEE":      /*--==========[任意保期(迄)]==========--*/
            //檢核_任意保期(起/迄)
            if (chkDateSE(iptCCDATES, iptCCDATEE)) {
                if (isChkCC) {
                    iptFRDATEE.val(iptCCDATEE.val()).blur()     //連動[強制保期(迄)]
                    ctrlIns.Date("ChackFRDATE");                //檢查[強制保險期間]
                };
                ctrlIns.CalCode();                              //檢查[任意保期期間大於一年以上調整計算選項]
                ctrlIns.ProcessProjectNo();                     //專案代號處理
            };
            break;
        case "selMANMVPZMTYPE":
            ctrlIns.ProcessingForce("#" + ObjActNM);        //控制_[強制險序號]&[判斷自動帶入21險種(強制險)承保險種]
            break;
        case "iptFRDATES":      /*--==========[強制保期(起)]==========--*/
            if (!isNaN(iFRYear)) {
                iptFRDATEE.val(AddYears(iptFRDATES.val(), iFRYear)).blur();     //[強制保期(迄)]=[強制保期(起)]自動+{保險期間(iFRYear)}年
            };
            ctrlIns.Date("chkCCDATE");          //連動[任意保險期間(同強制險)]
            ctrlIns.Date("ChackFRDATE");        //檢查[強制保險期間]
            ctrlIns.ProcessingForce("#" + ObjActNM);        //控制_[強制險序號]&[判斷自動帶入21險種(強制險)承保險種]
            if (isChkCC && iptFRDATES.val() != iptFRDATES.attr('oldval') && getObjToVal(iptFRDATES.attr('oldval')) != "") {
                ctrlIns.UnlockProceedArea('1');     //若[任意保險期間(同強制險)]，則清空[上年度保單號碼]
                if ($('#iptAnySerialNo').val() != "") { $('#iptAnySerialNo').val(''); };    //若有[任意險序號]，則清空
            };
            break;
        case "iptFRDATEE":      /*--==========[強制保期(迄)]==========--*/
            //檢核_強制保期(起/迄)
            if (chkDateSE(iptFRDATES, iptFRDATEE)) {
                ctrlIns.Date("chkCCDATE");      //連動[任意保險期間(同強制險)]
                ctrlIns.Date("ChackFRDATE");    //檢查[強制保險期間]                
                ctrlIns.ProcessingForce("#" + ObjActNM);
                if (isChkCC && iptFRDATEE.val() != iptFRDATEE.attr('oldval') && getObjToVal(iptFRDATEE.attr('oldval')) != "") {
                    ctrlIns.UnlockProceedArea('1');         //若[任意保險期間(同強制險)]，則清空[上年度保單號碼]
                    if ($('#iptAnySerialNo').val() != "") { $('#iptAnySerialNo').val(''); };    //若有[任意險序號]，則清空
                };
            };
            break;
        case "ChackFRDATE":      /*--==========檢查[強制保險期間]==========--*/
            if (iptFRDATEE.val() != AddYears(iptFRDATES.val(), iFRYear)) {
                $('#chkFRDATE1,#chkFRDATE2').prop('checked', false);        //若有變動[強制保期(迄)]則[保險期間]清空
            };
            break;
        default:
    };
};
//控制_[計算]欄位(任意保期期間大於一年以上調整[計算]選項)
ctrlIns.CalCode = function () {
    let iptCCDATES = _div4.find('#iptCCDATES');         /*[任意保期(起)]*/
    let iptCCDATEE = _div4.find('#iptCCDATEE');         /*[任意保期(迄)]*/
    //[任意保期]小於1年，則解開[計算]欄位
    let insuredperiod = ((Date.parse(iptCCDATEE.val())).valueOf()
        - (Date.parse(iptCCDATES.val())).valueOf()) / 86400000 / 365;                 //任意保期
    if (insuredperiod > 1 || AddYears(iptCCDATES.val(), 1) == iptCCDATEE.val()) {
        //鎖住[計算]欄位，預設為'AQ'(年繳)
        _div4.find('#selCalCode').val('AQ').attr('disabled', true);
    } else {
        //解開[計算]欄位
        _div4.find('#selCalCode').attr('disabled', false);
    };
};
//控制_[續保作業]續保解鎖 參數:area=1:為[上年度保單號碼]區解鎖,2:為[上年度強制證號]區解鎖
ctrlIns.UnlockProceedArea = function (area) {
    switch (area) {
        case "1":
            //若有[上年度保單號碼]則代表目前為[續保作業]，因為有異動日期，所以要清空。(這樣會變成純新件報價)
            if (_divQ.find('#iptPOLNUM').val() != '') { _divQ.find('#btnUnPOLNUM').click(); };
            break;
        case "2":
            //若有[上年度強制證號]則代表目前為[續保作業]，因為有異動日期，所以要清空。(這樣會變成純新件報價)
            if (_divQ.find('#iptOLDPOLNUM').val() != '') { _divQ.find('#btnUnOLDPOLNUM').click(); };
            break;
        default:
            if (_divQ.find('#iptPOLNUM').val() != '') { _divQ.find('#btnUnPOLNUM').click(); };
            if (_divQ.find('#iptOLDPOLNUM').val() != '') { _divQ.find('#btnUnOLDPOLNUM').click(); };
            break;
    };
};
//控制_[強制險序號]&[判斷自動帶入21險種(強制險)承保險種]
ctrlIns.ProcessingForce = function (objNM) {
    let selMANMVPZMTYPE = $('#selMANMVPZMTYPE');
    let iptFRDATES = $('#iptFRDATES');
    let iptFRDATEE = $('#iptFRDATEE');
    //當[強制車種],[強制保期(起)],[強制保期(迄)]有值時的處理。
    if (iptFRDATES.val() != "" && iptFRDATEE.val() != "" && selMANMVPZMTYPE.val() != "") {
        //自動帶入21強制險資料處理
        var dt = $('#tblInsuranceList').DataTable();
        if (dt.rows().data().filter(function (x) { if (x.ZCVRTYPE == '21') { return true; } }).length == 0) {
            var data21 = getdata("/Quotation/GetINSURED21INFO", {
                sMVPZMTYPE: selMANMVPZMTYPE.val(), sCCDATES: iptFRDATES.val().replace(/[/]/g, "")
            });
            if (data21 != null) {
                if (data21.length > 0) {
                    if (data21.length === 1 && typeof (data21[0].MSG) != "undefined") {
                        MsgBox('錯誤', data21[0].MSG, 'red'); $('#selZCVRTYPE').val(''); $.unblockUI(); return;
                    };
                    dt.row.add({
                        ZCVRTYPE: "21"
                        , ZCVRTYPENM: getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', '21')
                        , SUMINA: getObjToVal(getObjToVal($($.parseXML("<LIST>" + getObjToVal(data21[0].SUMINA) + "</LIST>")).find("TEXT")[0]).textContent)
                        , SUMINB: getObjToVal(getObjToVal($($.parseXML("<LIST>" + getObjToVal(data21[0].SUMINB) + "</LIST>")).find("TEXT")[0]).textContent)
                        , SUMINC: getObjToVal(getObjToVal($($.parseXML("<LIST>" + getObjToVal(data21[0].SUMINC) + "</LIST>")).find("TEXT")[0]).textContent)
                        , ZFACTORA: ''
                        , ZFACTORB: ''
                        , EXCESS: ''
                        , MVPPREM: 0    //保險費預設為0
                        , InsMonth: 0   //月繳保險費預設為0
                        , InsOrder: 0   //險種排序21險種固定為0
                    }).draw();
                    insuredDT();
                };
            };
        };
    };
    //當[強制險序號]有值時_處理
    if ($('#iptForceSerialNo').val() != "") {
        if ($(objNM).val() != $(objNM).attr('oldval') && getObjToVal($(objNM).attr('oldval')) != "") {
            ConfirmBox('請確認', '您已經異動[取級數(強制險)]相關欄位，請確認是否異動?', 'orange'
                , function () {
                    $('#iptForceSerialNo').val("");
                    $(objNM).attr('oldval', $(objNM).val());
                }
                , function () {
                    $(objNM).val($(objNM).attr('oldval')).blur();
                }
           );
        };
    };
};
//控制_專案代號處理
ctrlIns.ProcessProjectNo = function () {
    var iptCCDATES = $('#iptCCDATES');         /*[任意保期(起)]*/
    var iptCCDATEE = $('#iptCCDATEE');         /*[任意保期(迄)]*/
    var iptProjectNo = $('#iptProjectNo');     /*[專案代號]*/
    if ($('#iptProjectNo').val() == "" && ('01|02|32|34').indexOf($("#selMVPZMTYPE").val()) > -1 && iptCCDATES.val() != "" && iptCCDATEE.val() != "") {
        /*56…400的規則是如果專案代號未輸入，投保車種為01/02/32/34 & 保單別為MAE時，專案代號會動入"PMOT9115"*/
        getAgeFactor();     //讀取_年齡係數
        if ($('#divQuoteDate').data("QuotType") == "MAE") { $('#iptProjectNo').val('PMOT9115'); };
    };
};
//控制[折舊率]處理
ctrlIns.DepRate = function () {
    var dt = $('#tblInsuranceList').DataTable();
    var sZcvrTypeList = "";             //*險種清單*/
    var sZCVRTYPE = "";                 //*險種*/
    var bIsThief = false;               //*是否有承保車體竊盜險*/
    var selDepRate = $('#selDepRate');  //*[折舊率]*/
    $.each(dt.data(), function (i, item) {
        //險種
        sZCVRTYPE = getObjToVal(item.ZCVRTYPE);
        //記錄目前險種清單
        sZcvrTypeList += sZCVRTYPE + '|';
        //更新[折舊率](若有車體/竊盜險，則折舊率同時自動default 帶15%)。20190425 ADD BY WS-MICHAEL(若無則清空[折舊率])
        if (_strThiefInsList.indexOf(sZCVRTYPE.substring(0, 2)) > -1) { bIsThief = true; };
    });
    $('#divQuoteDate').data("ZcvrTypeList", sZcvrTypeList); //*險種清單*/
    //判斷是否有承保車體竊盜險
    if (bIsThief === true) {
        if (selDepRate.val().trim() == "") {
            //若[折舊率]沒有值，則預帶'A'(15%)
            selDepRate.val('A');
        };
    } else {
        selDepRate.val('');  //清空[折舊率]
    };
};

function ConfirmBox2(title, content, color, fn, fnc) {
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
                text: '修改要保人資料',
                btnClass: 'btn-with',
                action: fnc
            },
        }
    });
}
/*====[控制類]_End=============================*/

///*==[查詢類]_Start===========================*/
//查詢[報價單]資料
function getWebQuotData(sQuoteNo, sType) {
    consLogDate("--getWebQuotData_Start--");
    $('#iptQUOTENO').data('isSysPass', true);
    //--==查詢[報價單]資料================================================================--
    consLogDate("--getWebQuotData_查詢資料");
    var ds = getdata("/Quotation/GetQuot", { sQuotNo: sQuoteNo, sAgentNoList: $('#hidagntnum').val() });      //報價單查詢
    var dt = ds.DT;
    if (dt.length > 0) {
        consLogDate("--getWebQuotData_[報價單]資料載入");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        if (sType == 'COPY' && dt[0].IsConfirm == "N") { MsgBox('錯誤', "該[" + sQuoteNo + "](報價單編號)為暫存資料！<BR>請由[報價單查詢]執行[要保輸入]作業！", 'red'); return; };
        $('#iptQuotDate').val(dt[0].QuotDate);                      //報價日期
        $('#divQuoteDate').data("IsConfirm", dt[0].IsConfirm);      //是否確定報價(Y:已報價資料,N:未報價/暫存資料)
        $("#divQuoteDate").data("QuotNo_400", dt[0].QuotNo_400);    //400報價單號碼
        var sPolicyNo = getObjToVal(dt[0].PolicyNo);                //保單號碼/上年度保單號碼
        var sForceNo = getObjToVal(dt[0].ForceNo);                  //舊保險證號/上年度強制證號
        if (sPolicyNo != '' || sForceNo != '') {
            $('#iptPOLNUM').val(sPolicyNo).parent().show();
            $('#iptOLDPOLNUM').val(sForceNo).parent().show();
            if (sPolicyNo != '') {
                $('#iptPOLNUM').attr('disabled', true);
                $('#btnQryPOLNUM').parent().hide();
                $('#btnUnPOLNUM').parent().show();
            };
            if (sForceNo != '') {
                $('#iptOLDPOLNUM').attr('disabled', true);
                $('#btnQryOLDPOLNUM').parent().hide();
                $('#btnUnOLDPOLNUM').parent().show();
            };
        };
        ///--==[經手人/業務員資料]區塊處理=====================================================--
        consLogDate("--getWebQuotData_[報價單]資料載入(1)");
        var agentno = getObjToVal(dt[0].AgentNo);
        setSelPick("#selAGNTNUM", [{ VALUE: agentno, TEXT: agentno }], agentno, true);      //經手人
        consLogDate("--getWebQuotData_[報價單]資料載入(2)");
        ////----[單位別][經手人ID]_處理--------------------------------------------------------
        consLogDate("--getWebQuotData_[單位別][經手人ID]_處理");
        var sAgentId = '';
        var data = _arrAgentData.filter(function (x) { return x.AgntNum == agentno; });
        $.each(data, function (index, data) {
            _div1.find('#iptBranchNo').val(getObjToVal(data.Branch).trim());    //單位別
            sAgentId = getObjToVal(data.AgntId);                //經手人ID
        });
        ////----[車商代碼]_處理--------------------------------------------------------
        consLogDate("--getWebQuotData_[車商代碼]_處理");
        /*經手人代號前2碼為BD者，即為[和安經手人]。為[和安經手人]時才開放[車商代碼]*/
        var isNone = (agentno.substr(0, 2) == 'BD') ? "" : "none";
        _div1.find('#selVendorNo,#iptVendorSalesNo').parent().attr('style', 'display:' + isNone).val('');
        ////----[付款方式]_處理--------------------------------------------------------
        consLogDate("--getWebQuotData_[付款方式]_處理");
        setDDL_SYSCODEDT(_arrLoadSysData, 'T003', '#selPAYWAY', false, '', 'D000');            //[付款方式]
        ////----查詢資料_處理--------------------------------------------------------
        consLogDate("--getWebQuotData_[查詢資料]_處理");
        var dtAgn = getdata("/Quotation/GetAgntInfo", { KeyWord: agentno, sAgntID: sAgentId });
        if (dtAgn.length > 0) {
            consLogDate("--getWebQuotData_[GetAgntInfo]_agentno:" + agentno + ",sAgentId:" + sAgentId);
            if (dtAgn.length === 1 && typeof (dtAgn[0].MSG) != "undefined") { MsgBox('錯誤', dtAgn[0].MSG, 'red'); return; }
            _divQ.data("CHL_Code", dtAgn[0].CHL);                                           //通路別代碼
            _divQ.data('SalesNo', getObjToVal(dtAgn[0].SalesNo));                           //服務代碼/業務代號
            _divQ.data("AgentType", getObjToVal(dtAgn[0].AGTYPE));                             //經手人類別
            _div1.find('#iptCHL1').val(getObjToVal(dtAgn[0].CHL) + ' - ' + getObjToVal(dtAgn[0].CHLDESC)).change();    //CHL
            _div1.find('#iptAGNTNAME').val(getObjToVal(dtAgn[0].AGNTDESC));                 //經手人名稱
            _div1.find('#iptSalesmanRegNo').val(getObjToVal(dtAgn[0].SalesmanRegNo));       //業務員登錄字號
            setDDL_INS('#selZCAMPAN', getObjToVal(dtAgn[0].ZCAMPANLIST));                   //設定[活動方案]清單
            _divQ.data("ZCAMPANLIST", getObjToVal(dtAgn[0].ZCAMPANLIST));
            _div4.find('#selZCAMPAN').prepend($('<option></option>').val('').text('')).val(''); //插入空白並預設
            var dtPay = getdata("/Quotation/ChkPAYPLANC012", { sAGNTNUM: agentno });       //如果經手人不可選擇C012分期付款
            if (dtPay.length > 0) {
                if (dtPay.length === 1 && typeof (dtPay[0].MSG) != "undefined") {
                    _div4.find('#selPAYWAY').find('option[value="C012"]').remove();     //移除[付款方式]:"C012"(分期付款)
                };
            };
        };
        consLogDate("--getWebQuotData_[報價單]資料載入(3)");
        _div1.find('#selVendorNo').val(dt[0].VendorNo);			                            //車商代碼(1)
        _div1.find('#iptVendorSalesNo').val(dt[0].VendorSalesNo);	                        //車商代碼(2)
        _div1.find('#iptBranchNo').val(dt[0].BranchNo.trim());                              //單位別
        _div1.find('#iptCNTBRANCH').val(dt[0].LifeNo);                                      //編號(壽通)
        _div1.find('#iptSalesmanRegNo').val(dt[0].SalesmanRegNo); 		                    //業務員登錄字號
        _div1.find('#iptGenareaNM').val(getObjToVal(dt[0].GenareaNM));                      //客服
        _div1.find('#iptAgentTEL').val(getObjToVal(dt[0].AgentTEL));                        //電話
        _div1.find('#iptAgentFAX').val(getObjToVal(dt[0].AgentFAX));                        //傳真
        _div1.find('#iptAgentEMail').val(getObjToVal(dt[0].ServiceMail));                   //E-MAIL
        _div1.find('#iptTollClterNo').val(getObjToVal(dt[0].TollClterNo)); 	                //收費員代號
        _divQ.data("AgentSalesName", getObjToVal(dt[0].AgentSalesName));                    /*業務員名稱*/
        _divQ.data("TOLLCLTERID", getObjToVal(dt[0].TollClterID));                          /*收費員ID*/
        _divQ.data("TOLLCLTERNAME", getObjToVal(dt[0].TollClterName));                      /*收費員名稱*/
        _divQ.data("TOLLCLTERREGNO", getObjToVal(dt[0].TollClterRegNo));                    /*收費員登錄證號*/
        $('#iptProjectNo').val(getObjToVal(dt[0].ProjectNo)); 	                            //專案代號
        var sCHL1 = getObjToVal(dt[0].CHL1);                                                //通路別代碼
        var sCHL1DESC = getObjToVal(dt[0].CHL1DESC);                                        //通路別代碼說明
        if (sCHL1 != '' && sCHL1DESC != '') {
            $('#divQuoteDate').data("CHL_Code", sCHL1);
            _div1.find('#iptCHL1').val(sCHL1 + ' - ' + sCHL1DESC).change();      //CHL1([客服],[電話],[傳真])
            _div1.find('#selCHL2').val(dt[0].CHL2);                              //CHL2
        };
        ///--==[保單資料]區塊處理=====================================================--
        var sPayway = getObjToVal(dt[0].Payway);                //付款方式
        if (sPayway != "") { $('#selPAYWAY').val(sPayway); };   /*不等為空值時，則直接帶入*/
        if (sPayway == "C012") { $('#selPAYWAY').change(); };   /*若值為C012時，則進行選取事件(因為險種資料，要改帶月繳保費)*/
        if (getObjToVal($('#selPAYWAY').val()) == "") { $('#selPAYWAY').val('D000'); };   /*若帶入後，下拉選項的值為空時，則帶預設值D000(因為帶入值，不為下拉內容，會變成空白)*/
        _divQ.data("Paytype", getObjToVal(dt[0].Paytype));
        _div1.find('#iptAmwayNo').val(dt[0].AmwayNo); 				                        //編號(大保單號碼/安麗直銷商)
        _div1.find('#selPrnWayNo').val(dt[0].PrnWayNo); 				                    //編號(收費單列印方式)
        ///--==[要保人及被保險人資料]區塊處理=====================================================--
        _div2.find('#iptCTLCustID').val(dt[0].InsuredID);	                                //被保險人ID/公司統編
        _div2.find('#iptAPLCustID').val(dt[0].ProposerID);	                                //要保人ID/公司統編
        var iptCTL_CLNTNUM = _div2.find('#iptCTL_CLNTNUM');
        var iptAPL_CLNTNUM = _div2.find('#iptAPL_CLNTNUM');
        iptCTL_CLNTNUM.val(dt[0].CTL_CLNTNUM);	                            //被保險人客戶代號
        iptAPL_CLNTNUM.val(dt[0].APL_CLNTNUM);	                            //要保人客戶代號
        _div5.find('#iptAddIns').val(dt[0].AddInsured);                                     //附加被保險人
        _div5.find('#iptMortgage').val(dt[0].Mortgage);                                     //抵押權人
        _div2.find('#selRELA').val(getObjToVal(dt[0].ToInsuredRelation));                   //與被保險人關係
        ////----[被保險人]資料--------------------------------------------------------
        var ccusdt = ds.DT1;
        var nation = "";
        if (ccusdt.length > 0) {
            consLogDate("--getWebQuotData_[被保險人]資料載入");
            if (ccusdt.length === 1 && typeof (ccusdt[0].MSG) != "undefined") {
                ShowMsgInElm('#iptCTLCustID', ccusdt[0].MSG, true);
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            };
            _div2.find("#rdoCTLCustType[value='" + ccusdt[0].CustType + "']").prop("checked", true).change();     //客戶類別
            setDDLIsNullAdd('#selCTLNation', ccusdt[0].Nation);                             //國別
            _div2.find('#iptCTLName').val(ccusdt[0].Name);                                  //姓名/公司名稱
            _div2.find('#iptCTLRepresentative').val(ccusdt[0].Representative);              //代表人
            if (ccusdt[0].CustType == 'P') {                                                //客戶類別(P:自然人)
                _div2.find('#iptCTLBirthday').val($.datefomater(ccusdt[0].Birthday)).blur();//生日
                _div2.find('#selCTLSex').val(ccusdt[0].Sex);                                //性別
                _div2.find('#selCTLMarriage').val(ccusdt[0].Marriage);                      //婚姻
            };
            _div2.find('#iptCTLOfficeTel').val(ccusdt[0].OfficeTel);                        //公司電話
            _div2.find('#iptCTLHomeTel').val(ccusdt[0].HomeTel);                            //家用電話
            _div2.find('#iptCTLCellPhone').val(ccusdt[0].CellPhone);                        //手機號碼
            _div2.find('#iptCTLFax').val(ccusdt[0].Fax);                                    //傳真號碼
            _div2.find('#selCTLADD1').val(ccusdt[0].City).change();                         //縣市別
            _div2.find('#selCTLADD2').val(ccusdt[0].Zipcode).change();                      //區別
            _div2.find('#iptCTLADDO').val(ccusdt[0].Addr).blur();                           //地址
            _div2.find('#iptCTLEmail').val(ccusdt[0].Email);                                //Email
            var isEMail = _div2.find('#iptCTLEmail').val() == "" ? "N" : "Y";               //是否需要電子保單
            _div2.find("#rdoCTLEmail[value='" + isEMail + "']").prop("checked", true).change();
            _div2.find("#iptCTLCustID").data("Is70BNO", getObjToVal(ccusdt[0].IS70BNO));    //是否有70單位別
            _div2.find("#iptCTLCustID").data("IsPEND", getObjToVal(ccusdt[0].ISPEND));      //是否有未決賠案
        };
        if (_div2.find('#selRELA').val() == '01') {
            _div2.find('#selRELA').change();      //與被保險人關係
        } else {
            ////----[要保人]資料--------------------------------------------------------
            var acusdt = ds.DT2;
            if (acusdt.length > 0) {
                consLogDate("--getWebQuotData_[要保人]資料載入");
                if (acusdt.length === 1 && typeof (acusdt[0].MSG) != "undefined") {
                    ShowMsgInElm('#iptAPLCustID', acusdt[0].MSG);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                };
                _div2.find("#rdoAPLCustType[value='" + acusdt[0].CustType + "']").prop("checked", true).change();     //客戶類別
                _div2.find('#iptAPLCustID').val(acusdt[0].CustID);                          //要保人ID/公司統編
                setDDLIsNullAdd('#selAPLNation', acusdt[0].Nation);                             //國別
                _div2.find('#iptAPLName').val(acusdt[0].Name);                              //姓名/公司名稱
                _div2.find('#iptAPLRepresentative').val(acusdt[0].Representative);          //代表人
                if (acusdt[0].CustType == 'P') {                                            //客戶類別(P:自然人)
                    _div2.find('#iptAPLBirthday').val($.datefomater(acusdt[0].Birthday)).blur();    //生日
                    _div2.find('#selAPLSex').val(acusdt[0].Sex);                            //性別
                    _div2.find('#selAPLMarriage').val(acusdt[0].Marriage);                  //婚姻
                };
                _div2.find('#iptAPLOfficeTel').val(acusdt[0].OfficeTel);                    //公司電話
                _div2.find('#iptAPLHomeTel').val(acusdt[0].HomeTel);                        //家用電話
                _div2.find('#iptAPLCellPhone').val(acusdt[0].CellPhone);                    //手機號碼
                _div2.find('#iptAPLFax').val(acusdt[0].Fax);                                //傳真號碼
                _div2.find('#selAPLADD1').val(acusdt[0].City).change();                     //縣市別
                _div2.find('#selAPLADD2').val(acusdt[0].Zipcode).change();                  //區別
                _div2.find('#iptAPLADDO').val(acusdt[0].Addr).blur();                       //地址
                _div2.find('#iptAPLEmail').val(acusdt[0].Email);                            //Email
                var isEMail = _div2.find('#iptAPLEmail').val() == "" ? "N" : "Y";           //是否需要電子保單
                _div2.find("#rdoAPLEmail[value='" + isEMail + "']").prop("checked", true).change();
                _div2.find("#iptAPLCustID").data("Is70BNO", getObjToVal(acusdt[0].IS70BNO));       //是否有70單位別
                _div2.find("#iptAPLCustID").data("IsPEND", getObjToVal(acusdt[0].ISPEND));         //是否有未決賠案
            };
        };
        ////----[被保險人客戶代號]處理--------------------------------------------------------
        if (iptCTL_CLNTNUM.val() != "") {
            iptCTL_CLNTNUM.parent().show();         //顯示[(被保險人)客戶代號]欄位
            $('#btnUnCTLCustID').parent().show();   //顯示[(被保險人)客戶代號解鎖]按鈕
        };
        ////----[要保人客戶代號]處理--------------------------------------------------------
        if (iptAPL_CLNTNUM.val() != "") {
            iptAPL_CLNTNUM.parent().show();         //顯示[(要保人)客戶代號]欄位
            $('#btnUnAPLCustID').parent().show();   //顯示[(要保人)客戶代號解鎖]按鈕
        };
        ///--==[車籍資料]區塊處理=====================================================--
        consLogDate("--getWebQuotData_[車籍資料]資料載入(1)");
        var sCarTypeNo = getObjToVal(dt[0].CarTypeNo);
        setSelPick("#selZMAKE", [{ VALUE: sCarTypeNo, TEXT: getObjToVal(dt[0].CarTypeDesc) }], sCarTypeNo);    //廠型
        if (sCarTypeNo != "") { _div3.find('#selZMAKE').change(); };
        consLogDate("--getWebQuotData_[車籍資料]資料載入(2)");
        _div3.find('#selMANMVPZMTYPE').val(getObjToVal(dt[0].ForceCarType)).change();        //強制車種
        _div3.find('#selMVPZMTYPE').val(getObjToVal(dt[0].AnyCarType)).change();    //任意車種
        _div3.find('#selYRMANF').val(dt[0].MakeYear.substr(0, 4));                          //製造年
        _div3.find('#selMNMANF').val(parseInt(dt[0].MakeYear.substr(4, 2)).toString());     //製造月
        _div3.find('#iptRESETPRICE').val(dt[0].CarPrice).blur();                    //重置價格
        _div3.find('#iptZREGNUM').val(dt[0].LicenseNo);                             //牌照
        _div3.find('#iptZCARRY').val(dt[0].Load);                                   //乘載(人/噸)
        _div3.find('#iptZCC').val(dt[0].Displacement).blur();                       //排氣量
        _div3.find('#selIssueYear').val(getObjToVal(dt[0].IssueYear).replace('/', '').substr(0, 4));                //發照年
        _div3.find('#selIssueMonth').val(getObjToVal(dt[0].IssueMonth));            //發照月
        _div3.find('#iptEngineNo').val(dt[0].EngineNo);                             //引擎號碼
        $('#txtRecords').val(dt[0].Record).blur();                                  //記錄
        ///--==[投保險種資料]區塊處理=====================================================--
        ////----[強制險資料]--------------------------------------------------------
        consLogDate("--getWebQuotData_[強制險資料]資料載入");
        _strFRDATES = getObjToVal(dt[0].ForceInsuredFrom);                          //強制保期(起)
        _div4.find('#iptFRDATES').val(_strFRDATES).blur();                          //強制保期(起)
        _div4.find('#iptFRDATEE').val(dt[0].ForceInsuredTo).blur();                 //強制保期(迄)
        if ($('#iptFRDATEE').val() == AddYears($('#iptFRDATES').val(), 2)) {        //[保險期間]二年期處理
            $('#divQuoteDate').data("FRDateYear", "2"); //設定[保險期間]為二年期
            $('#chkFRDATE1').prop('checked', false);    //[保險期間]"一年期"取消勾選
            $('#chkFRDATE2').prop('checked', true);     //[保險期間]"二年期"勾選
        };
        _div4.find('#selMANLEVEL').val(dt[0].ForceLevel);                           //強制等級
        _div4.find('#iptMANZPREM').val(dt[0].ForceInsurance).blur();		        //強制保費
        _div4.find('#iptSPECIAL').val(dt[0].ForceOffer).blur();			            //強制優惠
        _div4.find('#selBONUS').val(getObjToVal(dt[0].ForceBonusCode));	            //獎金代號
        _div4.find("#iptBONUS").val(_div4.find('#selBONUS').find('option[value="' + $('#selBONUS').val() + '"]')[0].text);
        _div4.find('#iptDrunkFreq').val(dt[0].DrunkFreq);			                //酒駕次數
        _div4.find('#iptDrunkAmt').val(dt[0].DrunkAmt).blur();                      //酒駕金額
        _div4.find('#iptForceSerialNo').val(dt[0].ForceSerialNo);	                //強制序號
        _div4.find('#chkEmail').prop('checked', dt[0].IsEMail == "Y");              //電子式保險證(※如勾選電子式則不另寄紙本)
        ////----[任意險資料]--------------------------------------------------------
        consLogDate("--getWebQuotData_[任意險資料]資料載入");
        _strCCDATES = getObjToVal(dt[0].AnyInsuredFrom);                            //任意保期(起)
        _div4.find('#iptCCDATES').val(_strCCDATES).blur();                          //任意保期(起)
        _div4.find('#iptCCDATEE').val(dt[0].AnyInsuredTo).blur();                   //任意保期(迄)
        _div4.find('#selBodyFactor').val(getObjToVal(dt[0].BodyFactor));			//體係
        _div4.find('#selDutyFactor').val(getObjToVal(dt[0].DutyFactor));			//責係
        _div4.find('#iptAnySerialNo').val(dt[0].AnySerialNo);	                    //任意序號
        if (getObjToVal(dt[0].CalCode) != '') { _div4.find('#selCalCode').val(dt[0].CalCode); };         //計算
        _divQ.data("NewLevel", getObjToVal(dt[0].NewLevel));                        //新等級
        _divQ.data("OldLevel", getObjToVal(dt[0].OldLevel));                        //原等級
        _divQ.data("Alcohol", getObjToVal(dt[0].Alcohol));                          //酒償險加費註記
        _divQ.data("TaxiDutyFactor", getObjToVal(dt[0].TaxiDutyFactor));            //計程車責係
        _divQ.data("ThirdInsd", getObjToVal(dt[0].ThirdInsd));                      //第三人有無承保
        _divQ.data("MCPInsured", getObjToVal(dt[0].MCPInsured));                    //強制險承保記錄
        _divQ.data("MCPClaims", getObjToVal(dt[0].MCPClaims));                      //強制險理賠記錄
        _divQ.data("MVPInsured", getObjToVal(dt[0].MVPInsured));                    //任意險承保記錄
        _divQ.data("MVPClaims", getObjToVal(dt[0].MVPClaims));                      //任意險理賠記錄
        _divQ.data("QuyTIITime", getObjToVal(dt[0].QuyTIITime));                    //查詢時間
        ///--[投保險種資料]--------------------------------------------------------------
        _div4.find('#selDepRate').val(dt[0].DepRate);                               //折舊率
        _div4.find('#selProgramCode').val(dt[0].ProgramCode);                       //活動代碼
    } else {        //清空
        ///--[經手人 / 業務員資料]-------------------------------------------------------
        $('#selAGNTNUM,#iptCNTBRANCH,#iptSalesmanRegNo').val('');
        $('#divQuoteDate').data("CHL_Code", '');        //通路別代碼
        $('#iptCHL1').val('').change();
        $('#selCHL2').val('');
        $('#iptGenareaNM,#iptAgentTEL,#iptAgentFAX').val('');   //[客服],[電話],[傳真]
        ///--[保單資料]------------------------------------------------------------------
        $('#selPAYWAY,#iptAmwayNo,#selPrnWayNo').val('');
        ///--[要保人及被保險人資料]------------------------------------------------------
        $('#iptAPLCustID,#selRELA,#iptCTLCustID').val('').blur();
        $('#iptAddIns,#iptMortgage').val('');
        ///--[車籍資料]------------------------------------------------------------------
        $("#selZMAKE").val('').prev().prev().children().text('');
        $('#selYRMANF,#iptRESETPRICE,#iptZREGNUM,#iptZCARRY,#iptZCC,#selIssueYear,#iptEngineNo,#txtRecords').val('');
        ///--[強制險資料]----------------------------------------------------------------
        $('#iptFRDATES,#iptFRDATEE,#selMANLEVEL,#iptMANZPREM,#iptSPECIAL').val('');
        $('#selBONUS,#iptDrunkFreq,#iptDrunkAmt,#iptForceSerialNo').val('');
        ///--[任意險資料]----------------------------------------------------------------
        $('#iptCCDATES,#iptCCDATEE,#selMVPZMTYPE,#selBodyFactor,#selDutyFactor,#iptAnySerialNo,#selCalCode').val('');
        ///--[車商資料]------------------------------------------------------------------
        $('#selVendorNo,#iptVendorSalesNo').val('');
        ///--[投保險種資料]--------------------------------------------------------------
        $('#selDepRate').val('');
        $('#iptQUOTENO').data('isSysPass', false);
        MsgBox('錯誤', '查無資料！', 'red');
        $.unblockUI();
        return;
    };
    //--==查詢[報價單險種]資料============================================================--
    consLogDate("--getWebQuotData_[報價單險種]資料載入");
    $('#chkMan,#chkAny').prop('checked', false).parent().next().next('.panel-info').hide(200);
    dt = ds.DT3;
    if (dt.length > 0) {
        consLogDate("--getWebQuotData_[報價單險種]資料載入(1)");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        var dtIns = [];
        for (let i = 0; i < dt.length; i++) {
            if (dt[i].InsureType == '21') {     //有承保[強制險]則把區塊打開
                $('#chkMan').prop('checked', true).parent().next().next('.panel-info').show(200);
            } else {                            //有承保[任意險]則把區塊打開
                $('#chkAny').prop('checked', true).parent().next().next('.panel-info').show(200);
            };
            dtIns.push({
                ZCVRTYPE: dt[i].InsureType          //險種代號
                , ZCVRTYPENM: dt[i].InsureTypeNM    //險種說明
                , SUMINA: dt[i].InsureAmt1          //保額一
                , SUMINB: dt[i].InsureAmt2          //保額二
                , SUMINC: dt[i].InsureAmt3          //保額三
                , ZFACTORA: dt[i].Factor1           //係數一
                , ZFACTORB: dt[i].Factor2           //係數二
                , EXCESS: dt[i].DedItem             //自負額
                , MVPPREM: dt[i].Insurance          //保險費([修改]進來的時候才要帶入[保險費])
                , InsMonth: dt[i].InsMonth          //月繳保費([修改]進來的時候才要帶入[月繳保費])
                , InsOrder: dt[i].InsOrder          //排序
            });
        };
        consLogDate("--getWebQuotData_[報價單險種]資料載入(2)");
        var dtinsGrid = $('#tblInsuranceList').DataTable();
        for (let i = 0; i < dtIns.length; i++) {
            dtinsGrid.row.add(dtIns[i]);
        };
        consLogDate("--getWebQuotData_[報價單險種]資料載入(3)");
        insuredDT();         //險種資料相關資料處理
        consLogDate("--getWebQuotData_[報價單險種]資料載入(4)");
    } else {
        CreatInsDT([]);     //[報價單險種]清空
    };
    //--==查詢[報價單受益人]資料==========================================================--
    dtBen = ds.DT4;
    if (dtBen == null) { dtBen = []; };
    if (dtBen.length > 0) {
        consLogDate("--getWebQuotData_[報價單受益人]資料載入");
        if (dtBen.length === 1 && typeof (dtBen[0].MSG) != "undefined") { MsgBox('錯誤', dtBen[0].MSG, 'red'); return; }
        _div5.find("#chkBen").prop("checked", true).change();
        var retArr = [];    //回傳的陣列
        $.each(dtBen, function (i, item) {
            retArr.push({
                MEMBSEL: item.ListDriverID	            //列名駕駛人ID
                , ZCNAME: item.ListDriverName 	        //列名駕駛人姓名
                , CLTDOB: item.ListDriverBirth 	        //列名駕駛人生日
                , CLTSEX: item.ListDriverSex 	        //列名駕駛人性別
                , CLTSEXDesc: item.ListDriverSexDesc 	//列名駕駛人性別說明
                , TEL: item.ListDriverTel 	            //列名駕駛人電話
                , RELA: item.ToProposerRelation 	    //列名駕駛人與要保人關係
                , RELADesc: item.ToProposerRelationDesc //列名駕駛人與要保人關係說明
                , LEGAL: item.BenfitIsLegal 	        //受益人是否為法定
                , BenNAME: item.BenfitName 	            //受益人姓名
                , BenTEL: item.BenfitTel 	            //受益人電話
                , BenRELA: item.ToListRelation	        //與列名駕駛人關係
                , BenRELADesc: item.ToListRelationDesc  //與列名駕駛人關係說明
                , BenADDO: item.BenADDO                 //受益人完整地址
                , ADD1: item.City 	                    //受益人地址(縣市別)
                , ADD2: item.Zipcode 	                //受益人地址(區別)
                , ADDO: item.Addr 	                    //受益人地址
                , ZCVRTYPE: item.InsureType             //險種
            });
        });
        CreatBenDT(retArr);
        //setTimeout(function () {
        //    _div5.find('#tblBeneList').DataTable().columns.adjust().responsive.recalc();
        //}, 5000);
    } else {
        CreatBenDT([]);     //[報價單受益人]清空
    };
    //--==查詢[報價單約定駕駛人]資料======================================================--
    dt = ds.DT5;
    if (dt == null) { dt = []; };
    if (dt.length > 0) {
        consLogDate("--getWebQuotData_[報價單約定駕駛人]資料載入");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        $('#iptAGRDRI01').val(dt[0].AgreeDriver1)    //約定駕駛人1
        $('#iptAGRDRI02').val(dt[0].AgreeDriver2)    //約定駕駛人2
        $('#iptAGRDRI03').val(dt[0].AgreeDriver3)    //約定駕駛人3
        $('#iptAGRDRI04').val(dt[0].AgreeDriver4)    //約定駕駛人4
        $('#iptAGRDRI05').val(dt[0].AgreeDriver5)    //約定駕駛人5
    }
    else {
        $('#iptAGRDRI01,#iptAGRDRI02,#iptAGRDRI03,#iptAGRDRI04,#iptAGRDRI05').val('');
    };
    //--==查詢[報價單其他係數]資料======================================================--
    dt = ds.DT6;
    if (dt == null) { dt = []; };
    if (dt.length > 0) {
        consLogDate("--getWebQuotData_[報價單其他係數]資料載入");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        $("#chkNewPageBen").prop("checked", (getObjToVal(dt[0].IsNewPage) == "1"));    //傷險名冊另起新頁(空白:不另起新頁;1:要另起新頁)
        _divQ.data("NonClaimYears", getObjToVal(dt[0].NonClaimYears));                 //無賠款年度
        _divQ.data("ThreeYearsClaimCount", getObjToVal(dt[0].ThreeYearsClaimCount));   //三年度賠款次數
    } else {
        $('#chkNewPageBen').prop('checked', false);
    };
    //設定舊值
    $('.oldval').each(function (i, item) { $(item).attr('oldval', $(item).val()); })
    $.unblockUI();
    $('#iptQUOTENO').data('isSysPass', false);    //報價單資料載入_結束
    consLogDate("--getWebQuotData_End----");
};
//查詢[續保]資料
function getProceedData(sPolNum) {
    consLogDate("--getProceedData_Start--");
    $('#iptQUOTENO').data('isSysPass', true);
    ///--==查詢[報價單]資料================================================================--
    consLogDate("--getProceedData_查詢資料");
    var hidagent = $('#hidagentReCodeList').val();
    var hidsalescode = $('#hidsalesReCodeList').val();
    var hidchannelcode = $('#hidchannelCode').val();    //ZAGT,ZAGS是內部人員
    if (hidchannelcode == "ZAGT" || hidchannelcode == "ZAGS") {
        hidsalescode = ","; //如果為內部人員，則不看[業務人員編號](帶','號則SP會判斷不看此條件)
    };
    var ds = getdata("/Quotation/GetCHDRData", {
        sCHDRNUM: sPolNum
        , sAGNTNUM: hidagent
        , sLIFEAGNT: hidsalescode
        , sPOLNUM: $('#iptPOLNUM').val()        //[上年度保單號碼]
        , sFORCENO: $('#iptOLDPOLNUM').val()    //[上年度強制證號]
    }); //續保查詢
    var dt = ds.DT;
    //--==查詢[保單]資料============================================================--
    if (dt.length > 0) {
        consLogDate("--getProceedData_[報價單]資料載入");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return false; };
        var sPolicyNo = getObjToVal(dt[0].PolicyNo);                //保單號碼/上年度保單號碼
        var sForceNo = getObjToVal(dt[0].ForceNo);                  //舊保險證號/上年度強制證號
        if (sPolicyNo != '' || sForceNo != '') {
            $('#iptPOLNUM').val(sPolicyNo).parent().show();
            $('#iptOLDPOLNUM').val(sForceNo).parent().show();
            if (sPolicyNo != '') {
                $('#iptPOLNUM').attr('disabled', true);
                $('#btnQryPOLNUM').parent().hide();
                $('#btnUnPOLNUM').parent().show();
            };
            if (sForceNo != '') {
                $('#iptOLDPOLNUM').attr('disabled', true);
                $('#btnQryOLDPOLNUM').parent().hide();
                $('#btnUnOLDPOLNUM').parent().show();
            };
        };
        ///--[經手人 / 業務員資料]-------------------------------------------------------
        var agentno = getObjToVal(dt[0].AgentNo);
        setSelPick("#selAGNTNUM", [{ VALUE: agentno, TEXT: agentno }], agentno, true);    //經手人
        $("#selAGNTNUM").change();
        $('#iptBranchNo').val(getObjToVal(dt[0].BranchNo).trim());                      //單位別
        $('#iptCNTBRANCH').val(getObjToVal(dt[0].LifeNo).trim());                       //業務人員編號
        _div1.find('#iptAmwayNo').val(getObjToVal(dt[0].AmwayNo).trim()); 		        //編號(大保單號碼/安麗直銷商)
        _div1.find('#selPrnWayNo').val(getObjToVal(dt[0].PrnWayNo).trim()); 	        //編號(收費單列印方式)
        _div1.find('#selVendorNo').val(getObjToVal(dt[0].VendorNo).trim());	            //車商代碼(1)
        _div1.find('#iptVendorSalesNo').val(getObjToVal(dt[0].VendorSalesNo).trim());   //車商代碼(2)
        ///--[保單資料]------------------------------------------------------------------
        var sPayway = getObjToVal(dt[0].Payway);                //付款方式
        if (sPayway != "") { $('#selPAYWAY').val(sPayway); };   /*不等為空值時，則直接帶入*/
        if (sPayway == "C012") { $('#selPAYWAY').change(); };   /*若值為C012時，則進行選取事件(因為險種資料，要改帶月繳保費)*/
        if (getObjToVal($('#selPAYWAY').val()) == "") { $('#selPAYWAY').val('D000'); };   /*若帶入後，下拉選項的值為空時，則帶預設值D000(因為帶入值，不為下拉內容，會變成空白)*/
        ///--[被保險人及要保人資料]------------------------------------------------------
        _div2.find('#iptCTL_CLNTNUM').val(getObjToVal(dt[0].CTL_CLNTNUM));                  //被保險人客戶代號
        _div2.find('#iptAPL_CLNTNUM').val(getObjToVal(dt[0].APL_CLNTNUM));                  //要保人客戶代號
        _div2.find('#selRELA').val(getObjToVal(dt[0].ToInsuredRelation));                   //與被保險人關係
        ///[被保險人]資料
        var ccusdt = ds.DT1;
        if (ccusdt.length > 0) {
            if (ccusdt.length === 1 && typeof (ccusdt[0].MSG) != "undefined") {
                ShowMsgInElm('#iptCTLCustID', ccusdt[0].MSG, true);
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            };
            consLogDate("--getProceedData_[被保險人]資料載入");
            _div2.find("#iptCTLCustID").data("Is70BNO", getObjToVal(ccusdt[0].IS70BNO));       //是否有70單位別
            _div2.find("#iptCTLCustID").data("IsPEND", getObjToVal(ccusdt[0].ISPEND));         //是否有未決賠案
            $('#iptCTLCustID').val(ccusdt[0].CustID);                       //要保人ID/公司統編
            $("#rdoCTLCustType[value='" + ccusdt[0].CustType + "']").prop("checked", true).change();     //客戶類別
            //$('#selCTLNation').val(getObjToVal(ccusdt[0].Nation));              //國別
            setDDLIsNullAdd('#selCTLNation', ccusdt[0].Nation);                 //國別
            $('#iptCTLName').val(ccusdt[0].Name);                               //姓名/公司名稱
            $('#iptCTLRepresentative').val(ccusdt[0].Representative);           //代表人
            if (ccusdt[0].CustType == 'P') {        //客戶類別(P:自然人)
                $('#iptCTLBirthday').val($.datefomater(ccusdt[0].Birthday)).blur();//生日
                $('#selCTLSex').val(ccusdt[0].Sex);                             //性別
                $('#selCTLMarriage').val(ccusdt[0].Marriage);                   //婚姻
            }
            $('#iptCTLOfficeTel').val(ccusdt[0].OfficeTel);                     //公司電話
            $('#iptCTLHomeTel').val(ccusdt[0].HomeTel);                         //家用電話
            $('#iptCTLCellPhone').val(ccusdt[0].CellPhone);                     //手機號碼
            $('#iptCTLFax').val(ccusdt[0].Fax);                                 //傳真號碼
            $('#selCTLADD1').val(ccusdt[0].City).change();                      //縣市別
            $('#selCTLADD2').val(ccusdt[0].Zipcode).change();                   //區別
            $('#iptCTLADDO').val(ccusdt[0].Addr).blur();                        //地址
            $('#iptCTLEmail').val(ccusdt[0].Email);                             //Email
            var isEMail = $('#iptCTLEmail').val() == "" ? "N" : "Y";        //是否需要電子保單
            $("#rdoCTLEmail[value='" + isEMail + "']").prop("checked", true).change();
        };
        ///[要保人]資料
        var acusdt = ds.DT2;
        if (acusdt.length > 0) {
            consLogDate("--getProceedData_[要保人]資料載入");
            if (acusdt.length === 1 && typeof (acusdt[0].MSG) != "undefined") {
                ShowMsgInElm('#iptAPLCustID', acusdt[0].MSG);
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            };
            $('#iptAPLCustID').val(acusdt[0].CustID);                       //要保人ID/公司統編
            _div2.find("#iptAPLCustID").data("Is70BNO", getObjToVal(acusdt[0].IS70BNO));       //是否有70單位別
            _div2.find("#iptAPLCustID").data("IsPEND", getObjToVal(acusdt[0].ISPEND));         //是否有未決賠案
            if ($('#iptAPLCustID').val() == $('#iptCTLCustID').val()) {     //同要保人
                $('#selRELA').val('01').change();      //與被保險人關係
            } else {
                $("#rdoAPLCustType[value='" + acusdt[0].CustType + "']").prop("checked", true).change();     //客戶類別
                //$('#selAPLNation').val(getObjToVal(acusdt[0].Nation));              //國別
                setDDLIsNullAdd('#selAPLNation', acusdt[0].Nation);                 //國別
                $('#iptAPLName').val(acusdt[0].Name);                               //姓名/公司名稱
                $('#iptAPLRepresentative').val(acusdt[0].Representative);           //代表人
                if (acusdt[0].CustType == 'P') {                                    //客戶類別(P:自然人)
                    $('#iptAPLBirthday').val($.datefomater(acusdt[0].Birthday)).blur();    //生日
                    $('#selAPLSex').val(acusdt[0].Sex);                             //性別
                    $('#selAPLMarriage').val(acusdt[0].Marriage);                   //婚姻
                }
                $('#iptAPLOfficeTel').val(acusdt[0].OfficeTel);                     //公司電話
                $('#iptAPLHomeTel').val(acusdt[0].HomeTel);                         //家用電話
                $('#iptAPLCellPhone').val(acusdt[0].CellPhone);                     //手機號碼
                $('#iptAPLFax').val(acusdt[0].Fax);                                 //傳真號碼
                $('#selAPLADD1').val(acusdt[0].City).change();                      //縣市別
                $('#selAPLADD2').val(acusdt[0].Zipcode).change();                   //區別
                $('#iptAPLADDO').val(acusdt[0].Addr).blur();                        //地址
                $('#iptAPLEmail').val(acusdt[0].Email);                             //Email
                var isEMail = $('#iptAPLEmail').val() == "" ? "N" : "Y";            //是否需要電子保單
                $("#rdoAPLEmail[value='" + isEMail + "']").prop("checked", true).change();
            };
        };
        ///[被保險人客戶代號]處理
        if (_div2.find('#iptCTL_CLNTNUM').val() != "") {
            _div2.find('#iptCTL_CLNTNUM').parent().show();
        };
        ///[要保人客戶代號]處理
        if (_div2.find('#iptAPL_CLNTNUM').val() != "") {
            _div2.find('#iptAPL_CLNTNUM').parent().show();
        };
        ///--[車籍資料]------------------------------------------------------------------
        var sCarTypeNo = getObjToVal(dt[0].CarTypeNo);
        setSelPick("#selZMAKE", [{ VALUE: sCarTypeNo, TEXT: getObjToVal(dt[0].CarTypeDesc) }], sCarTypeNo);    //廠型
        if (sCarTypeNo != "") { $('#selZMAKE').change(); };
        //var sCarType = getObjToVal(dt[0].ForceCarType);         /*強制車種*/
        //if (sCarType == "") { sCarType = getObjToVal(dt[0].AnyCarType); }; /*任意車種*/
        //$('#selMVPZMTYPE').val(sCarType).change();              //車種
        $('#selMANMVPZMTYPE').val(getObjToVal(dt[0].ForceCarType)).change();        /*強制車種*/
        $('#selMVPZMTYPE').val(getObjToVal(dt[0].AnyCarType)).change();             /*任意車種*/
        var sMakeYear = getObjToVal(dt[0].MakeYear);
        $('#selYRMANF').val(sMakeYear.substr(0, 4));                           /*製造年*/
        $('#selMNMANF').val(parseInt(sMakeYear.substr(4, 2)).toString());      /*製造月*/
        if (getObjToVal(dt[0].CarPrice) != "") {
            $('#iptRESETPRICE').val(dt[0].CarPrice).blur();         //重置價格
        };
        $('#iptZREGNUM').val(dt[0].LicenseNo);                  //牌照
        $('#iptZCARRY').val(dt[0].Load);                        //乘載(人/噸)
        $('#iptZCC').val(dt[0].Displacement).blur();            //排氣量
        $('#selIssueYear').val(getObjToVal(dt[0].IssueYear).replace('/', '').substr(0, 4));                //發照年
        $('#selIssueMonth').val(getObjToVal(dt[0].IssueMonth)); //發照月
        $('#iptEngineNo').val(dt[0].EngineNo);                  //引擎號碼
        ///--[強制險資料]----------------------------------------------------------------
        _strFRDATES = getObjToVal(dt[0].ForceInsuredFrom);      //強制保期(起)
        $('#iptFRDATES').val(_strFRDATES).blur();               //強制保期(起)
        $('#iptFRDATEE').val(dt[0].ForceInsuredTo).blur();      //強制保期(迄)
        if ($('#iptFRDATEE').val() == AddYears($('#iptFRDATES').val(), 2)) {    //[保險期間]二年期處理
            $('#divQuoteDate').data("FRDateYear", "2"); //設定[保險期間]為二年期
            $('#chkFRDATE1').prop('checked', false);    //[保險期間]"一年期"取消勾選
            $('#chkFRDATE2').prop('checked', true);     //[保險期間]"二年期"勾選
        };
        $('#selMANLEVEL').val(dt[0].ForceLevel);                //強制等級
        _divQ.data('F_CCDATE', getObjToVal(dt[0].F_CCDATE));    //原保單強制起保日(續保件檢視用)
        _divQ.data('F_CRDATE', getObjToVal(dt[0].F_CRDATE));    //原保單強制迄止日(續保件檢視用)
        ///--[任意險資料]----------------------------------------------------------------
        _strCCDATES = getObjToVal(dt[0].AnyInsuredFrom);        //任意保期(起)
        $('#iptCCDATES').val(_strCCDATES).blur();               //任意保期(起)
        $('#iptCCDATEE').val(dt[0].AnyInsuredTo).blur();        //任意保期(迄)
        _divQ.data('A_CCDATE', getObjToVal(dt[0].A_CCDATE));    //原保單任意起保日(續保件檢視用)
        _divQ.data('A_CRDATE', getObjToVal(dt[0].A_CRDATE));    //原保單任意迄止日(續保件檢視用)
        ///--[投保險種資料]--------------------------------------------------------------
        $('#selDepRate').val(dt[0].DepRate);                    //折舊率
        ///--[其他約定事項]--------------------------------------------------------------
        _div5.find('#iptAddIns').val(dt[0].AddInsured);         //附加被保險人
        _div5.find('#iptMortgage').val(dt[0].Mortgage);         //抵押權人
        _div5.find('#txtRecords').val(dt[0].Record).blur();     //記錄
    };
    //--==查詢[險種]資料============================================================--
    dt = ds.DT3;
    if (dt.length > 0) {
        consLogDate("--getProceedData_[報價單險種]資料載入");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return false; };
        var dtIns = [];
        for (let i = 0; i < dt.length; i++) {
            if (dt[i].InsureType == '21') {
                $('#chkMan').prop('checked', true).change();
            } else {
                $('#chkAny').prop('checked', true).change();
            };
            dtIns.push({
                ZCVRTYPE: dt[i].InsureType          //險種代號
                , SUMINA: dt[i].InsureAmt1          //保額一
                , SUMINB: dt[i].InsureAmt2          //保額二
                , SUMINC: dt[i].InsureAmt3          //保額三
                , EXCESS: dt[i].DedItem             //自負額
                , ZFACTORA: dt[i].Factor1           //係數一
                , ZFACTORB: dt[i].Factor2           //係數二
                , MVPPREM: dt[i].Insurance          //保險費([修改]進來的時候才要帶入[保險費])
                , ZCVRTYPENM: dt[i].InsureTypeNM    //險種說明
                , InsMonth: dt[i].InsMonth          //月繳保費([修改]進來的時候才要帶入[月繳保費])
                , InsOrder: dt[i].InsOrder          //排序
            });
        }
        CreatInsDT(dtIns);
        insuredDT();            //險種資料相關資料處理
        insCarAgeDT();          //更新[險種資料區][係數一](車齡部份)
    };
    //--==查詢[受益人]資料==========================================================--
    var dtBen = ds.DT4;
    if (dtBen == null) { dtBen = []; };
    if (dtBen.length > 0) {
        consLogDate("--getWebQuotData_[報價單受益人]資料載入");
        if (dtBen.length === 1 && typeof (dtBen[0].MSG) != "undefined") { MsgBox('錯誤', dtBen[0].MSG, 'red'); return; }
        _div5.find("#chkBen").prop("checked", true).change();
        var retArr = [];    //回傳的陣列
        $.each(dtBen, function (i, item) {
            retArr.push({
                MEMBSEL: item.ListDriverID	            //列名駕駛人ID
                , ZCNAME: item.ListDriverName 	        //列名駕駛人姓名
                , CLTDOB: item.ListDriverBirth 	        //列名駕駛人生日
                , CLTSEX: item.ListDriverSex 	        //列名駕駛人性別
                , CLTSEXDesc: item.ListDriverSexDesc 	//列名駕駛人性別說明
                , TEL: item.ListDriverTel 	            //列名駕駛人電話
                , RELA: item.ToProposerRelation 	    //列名駕駛人與要保人關係
                , RELADesc: item.ToProposerRelationDesc //列名駕駛人與要保人關係說明
                , LEGAL: item.BenfitIsLegal 	        //受益人是否為法定
                , BenNAME: item.BenfitName 	            //受益人姓名
                , BenTEL: item.BenfitTel 	            //受益人電話
                , BenRELA: item.ToListRelation	        //與列名駕駛人關係
                , BenRELADesc: item.ToListRelationDesc  //與列名駕駛人關係說明
                , BenADDO: item.BenADDO                 //受益人完整地址
                , ADD1: item.City 	                    //受益人地址(縣市別)
                , ADD2: item.Zipcode 	                //受益人地址(區別)
                , ADDO: item.Addr 	                    //受益人地址
                , ZCVRTYPE: item.InsureType             //險種
            });
        });
        CreatBenDT(retArr);
        //setTimeout(function () {
        //    _div5.find('#tblBeneList').DataTable().columns.adjust().responsive.recalc();
        //}, 5000);
    } else {
        CreatBenDT([]);     //[報價單受益人]清空
    };
    //--==查詢[約定駕駛人]資料======================================================--
    dt = ds.DT5;
    if (dt == null) { dt = []; };
    if (dt.length > 0) {
        consLogDate("--getWebQuotData_[報價單約定駕駛人]資料載入");
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
        $('#iptAGRDRI01').val(dt[0].AgreeDriver1)    //約定駕駛人1
        $('#iptAGRDRI02').val(dt[0].AgreeDriver2)    //約定駕駛人2
        $('#iptAGRDRI03').val(dt[0].AgreeDriver3)    //約定駕駛人3
        $('#iptAGRDRI04').val(dt[0].AgreeDriver4)    //約定駕駛人4
        $('#iptAGRDRI05').val(dt[0].AgreeDriver5)    //約定駕駛人5
    }
    else {
        $('#iptAGRDRI01,#iptAGRDRI02,#iptAGRDRI03,#iptAGRDRI04,#iptAGRDRI05').val('');
    };
    //設定舊值
    $('.oldval').each(function (i, item) { $(item).attr('oldval', $(item).val()); })
    $.unblockUI();
    $('#iptQUOTENO').data('isSysPass', false);    //報價單資料載入_結束
    consLogDate("--getProceedData_End----");
    return true;
};
/*====[查詢類]_End=============================*/

///*==[檢核類]_Start===========================*/
//檢核_{經手人/業務員資料}區塊資料
function chkSub_SaleData() {
    var isChk = true;
    //清空警告訊息
    removeMsgObjList($('#divSalesmanData').find('input,select'));
    //檢核_必填欄位
    if (isChk && !chkObjList($('#divSalesmanData').find('input,select'), true)) { isChk = false; };
    //檢核_通路別(暫不檢核)
    ////if ($('#iptCHL1').val().trim() == '') { ctrlMsg('SF', '', '#iptCHL1'); };
    //檢核_[經手人]與[業務人員編號]
    if (isChk && !chkCntbranch()) { isChk = false; };
    //檢核_[經手人]與[編號](大保單號碼)
    if (isChk && !chkAgntAmwayno()) { $('#iptAmwayNo').focus(); isChk = false; };
    //檢核_[編號](大保單號碼)與[第二欄]
    if (isChk && $('#iptAmwayNo').val().trim() != "") {
        if ($('#iptAmwayNo').val().trim().substr(0, 1).indexOf('*') == -1 && $('#selPrnWayNo').val() == '') {
            ctrlMsg('SF', '', '#selPrnWayNo'); isChk = false;
        };
    };
    //檢核_[經手人]與[收費員代碼]
    if (isChk && !chkTollClterNo()) { isChk = false; };
    return isChk;
};
//檢核_{要保人及被保險人資料}區塊資料
function chkSub_ProtectPeopleData() {
    var isChk = true;
    var sCusType = "";      /*客戶類別*/
    var sNnation = "";      /*國別*/
    //執行[同要保人]
    if ($('#chkISAPL').prop('checked')) { $('#chkISAPL').change(); };
    //清空警告訊息
    removeMsgObjList($('#divInsurerData').find('input,select'));
    //檢核_必填欄位
    if (isChk && !chkObjList($('#divInsurerData').find('input,select'), true)) { isChk = false; };
    //檢核_被保險人ID/公司統編
    var sCTLCusType = $('#rdoCTLCustType:checked').val();      //客戶類別
    sNnation = $('#selCTLNation').val();                //國別
    if (isChk && !chkID('#iptCTLCustID', sCTLCusType, sNnation)) { $('#iptCTLCustID').focus(); isChk = false; };
    //檢核_要保人ID/公司統編
    var sAPLCusType = $('#rdoAPLCustType:checked').val();      //客戶類別
    sNnation = $('#selAPLNation').val();                //國別
    if (isChk && !chkID('#iptAPLCustID', sAPLCusType, sNnation)) { $('#iptAPLCustID').focus(); isChk = false; };
    //檢核_被保險人ID與性別
    if (sCTLCusType == "P") {
        var selSex = $('#selCTLSex').val();
        var idSex = $('#iptCTLCustID').val().substr(1, 1);
        if ((idSex == "1" && selSex != "1") || (idSex == "2" && selSex != "2")) {
            ShowMsgInElm('#iptCTLCustID', '被保險人ID與性別不符');
            if (isChk) { $('#iptCTLCustID').focus(); isChk = false; };
        }
    }
    //檢核_要保人ID與性別
    if (sAPLCusType == "P") {
        var selSex = $('#selAPLSex').val();
        var idSex = $('#iptAPLCustID').val().substr(1, 1);
        if ((idSex == "1" && selSex != "1") || (idSex == "2" && selSex != "2")) {
            ShowMsgInElm('#iptAPLCustID', '要保人ID與性別不符');
            if (isChk) { $('#iptAPLCustID').focus(); isChk = false; };
        }
    }
    /*是否為[續保]件，若是:則不檢核電話 20190729 UPD BY MICHAEL*/
    /*是否為[車商續保]件，若是:則不檢核電話*/
    let isBD = false;   //($('#selAGNTNUM').val().substring(0, 2) == "BD");
    isBD = ($('#iptPOLNUM').val() != '' || $('#iptOLDPOLNUM').val() != '');
    //檢核_[被保險人_電話]
    if (sCTLCusType == "P") {
        if (!isBD && $('#iptCTLOfficeTel').val() == "" && $('#iptCTLHomeTel').val() == "" && $('#iptCTLCellPhone').val() == "") {
            ShowMsgInElm('#iptCTLOfficeTel,#iptCTLHomeTel,#iptCTLCellPhone', '[公司],[家用],[手機]必須輸其中一欄位');
            if (isChk) { $('#iptCTLOfficeTel').focus(); isChk = false; };
        };
    } else {
        if (!isBD && $('#iptCTLOfficeTel').val() == "" && $('#iptCTLCellPhone').val() == "") {
            ShowMsgInElm('#iptCTLOfficeTel,#iptCTLCellPhone', '[公司],[手機]必須輸其中一欄位');
            if (isChk) { $('#iptCTLOfficeTel').focus(); isChk = false; };
        };
    };
    //檢核_[要保人_電話]
    if (sCTLCusType == "P") {
        if (!isBD && $('#iptAPLOfficeTel').val() == "" && $('#iptAPLHomeTel').val() == "" && $('#iptAPLCellPhone').val() == "") {
            ShowMsgInElm('#iptAPLOfficeTel,#iptAPLHomeTel,#iptAPLCellPhone', '[公司],[家用],[手機]必須輸其中一欄位');
            if (isChk) { $('#iptAPLOfficeTel').focus(); isChk = false; };
        };
    } else {
        if (!isBD && $('#iptAPLOfficeTel').val() == "" && $('#iptAPLCellPhone').val() == "") {
            ShowMsgInElm('#iptAPLOfficeTel,#iptAPLCellPhone', '[公司],[手機]必須輸其中一欄位');
            if (isChk) { $('#iptAPLOfficeTel').focus(); isChk = false; };
        };
    };
    //檢核_[與被保險人關係]
    if (isChk && !chkRELA()) { $('#selRELA').focus(); isChk = false; };
    //檢核_被保險人[EMail]
    if (isChk && _div2.find('#iptCTLEmail').val() != "") {
        if (!checkMail(_div2.find('#iptCTLEmail').val())) {
            ctrlMsg('SF', 'EMail格式錯誤！', '#iptCTLEmail'); isChk = false;
        };
    };
    //檢核_要保人[EMail]
    if (isChk && _div2.find('#iptAPLEmail').val() != "") {
        if (!checkMail(_div2.find('#iptAPLEmail').val())) {
            ctrlMsg('SF', 'EMail格式錯誤！', '#iptAPLEmail'); isChk = false;
        };
    };
    return isChk;
};
//檢核_{車籍資料}區塊資料
function chkSub_CarData() {
    var isChk = true;
    //清空警告訊息
    removeMsgObjList(_div3.find('input,select'));
    //檢核_必填欄位
    if (isChk && !chkObjList(_div3.find('input,select'), true)) { isChk = false; };
    //檢核_必填欄位，填完後再檢核其他
    if (!isChk) { $.unblockUI(); };
    //其他相關檢核
    var sForceCarType = getObjToVal(_div3.find('#selMANMVPZMTYPE').val());    /*強制車種*/
    var sAnyCarType = getObjToVal(_div3.find('#selMVPZMTYPE').val());         /*任意車種*/
    //[強制車種或任意車種必須選則其一]檢核
    if (isChk && sForceCarType == '' && sAnyCarType == '') {
        ShowMsgInElm('#selMANMVPZMTYPE,#selMVPZMTYPE', '必填欄位', true);
        MsgBox('錯誤', '強制車種或任意車種必須選則其一！', 'red');
        isChk = false;
    };
    //bak[乘載]欄位格式處理
    ////$('#iptZCARRY').val($('#iptZCARRY').val().split('.')[0]);
    ////20190104 DEL BY WS-MICHAEL Vian告知此規則已不檢核(RE: 新報價單問題_經手人:B8114G02 在Web 有多個車險無法報價)
    //bak檢核_[經手人&車種]
    ////若「經手人」第6碼是G/A/S/W）」，則「任意車種」與「強制車種」只可以是03/04/19/01/02/32/34/21，否則顯示錯誤訊息「此經手人不得輸入此車種！」
    ////20180905 ADD BY Michael AS400改規則，沒有告知web報價HT&HZ開頭的經手人不檢核
    ////var sAgntNum = getObjToVal($('#selAGNTNUM').val());                     //經手人
    ////if (isChk && ("|HT|HZ").indexOf(sAgntNum.substr(0, 2)) == -1 && ("|G|A|S|W").indexOf(sAgntNum.substr(5, 1)) > 0) {
    ////    if (("|01|02|03|04|19|21|32|34").indexOf(sCarType) == -1) {
    ////        ShowMsgInElm('#selMVPZMTYPE', "此經手人不得輸入此車種！", true);
    ////        $('#selMVPZMTYPE').focus(); isChk = false;
    ////    };
    ////};
    //檢核_[22強制車種]
    if (sForceCarType == '22' && sAnyCarType != '22' && sAnyCarType != '') {
        $('#selMVPZMTYPE').val('22');         /*[任意車種]自動帶入22車種*/
        if ($('#selMVPZMTYPE').val() == null) { $('#selMVPZMTYPE').val(''); MsgBox('錯誤', '任意險查無22車種，請洽核保人員！', 'red'); isChk = false; }
        else { MsgBox('注意', '[強制車種]為22時，[任意車種]將自動帶入22！', 'orange'); };
    }
    //檢核_[發照年&製造年] (發照年必須大於或等於製造年，若發照年小於製造年，則顯示錯誤訊息「發照年或製造年有誤！」)
    var sIssueYear = getObjToVal(_div3.find('#selIssueYear').val() + padLeft(_div3.find('#selIssueMonth').val(), 2));    /*發照年*/
    var sMakeYear = getObjToVal(_div3.find('#selYRMANF').val() + padLeft(_div3.find('#selMNMANF').val(), 2));           /*製造年*/
    if (isChk && !isNaN(sIssueYear) && !isNaN(sMakeYear)) {
        if (sIssueYear < sMakeYear) {
            ShowMsgInElm('#selIssueYear,#selYRMANF', '[製造年/月]不可小於[發照年/月]！', true);
            $('#selIssueYear').focus(); isChk = false;
        };
    };
    //檢核_[發照年&牌照](20181221 DEL BY WS-Michael 車牌檢核移至400檢核)
    /*若發照年月非空白，且不為新車(新車判別方式：任意或強制保期(迄)的YYY=發照年或發照年=製造年)
    ，則牌照號碼必須輸入。否則顯示錯誤訊息「牌照號碼不得為空白！」。*/
    ////var sLicenseNo = getObjToVal(_div3.find('#iptZREGNUM').val());                   //牌照
    ////if (isChk && sIssueYear != '' && (sIssueYear != sMakeYear || sIssueYear < (new Date()).getFullYear()) && sLicenseNo == '') {
    ////    ShowMsgInElm('#iptZREGNUM', '牌照號碼不得為空白！', true);
    ////    $('#iptZREGNUM').focus(); isChk = false;
    ////};
    //檢核_[牌照]
    if (isChk && !chkZREGNUM()) { $('#iptZREGNUM').focus(); isChk = false; };
    //檢核_[重置價格]
    if (isChk && !chkResetpriceRange()) { $('#iptRESETPRICE').focus(); isChk = false; };
    //檢核_[排氣量&乘載]
    if (isChk && !chkMultiComs('1')) { setFocusDiv('#divCarInfo'); isChk = false; };
    return isChk;
};
//檢核_{投保險種資料1}區塊資料
function chkSub_InsuredData1() {
    var isChk = true;
    //清空警告訊息
    removeMsgObjList($('#divInsInfo').find('input,select'));
    //檢核_強制險或任意險是否有勾選
    if ($('#chkMan').prop('checked') == false && $('#chkAny').prop('checked') == false) {
        MsgBox('錯誤', '強制險或任意險必須勾選其一！', 'red'); return false;
    };
    //檢核_強制險必填欄位
    if ($('#chkMan').prop('checked')) {
        if (isChk && !chkObjList($('#iptFRDATES,#iptFRDATEE'), true)) { isChk = false; };
    };
    //檢核_任意險必填欄位
    if ($('#chkAny').prop('checked')) {
        if (isChk && !chkObjList($('#iptCCDATES,#iptCCDATEE,#selCalCode'), true)) { isChk = false; };
    };
    return isChk;
};
//檢核_{投保險種資料}區塊資料
function chkSub_InsuredData() {
    var isChk = true;
    //清空警告訊息
    removeMsgObjList($('#divInsInfo').find('input,select'));
    //檢核_強制險或任意險
    if ($('#chkMan').prop('checked') == false && $('#chkAny').prop('checked') == false) {
        MsgBox('錯誤', '強制險或任意險必須勾選其一！', 'red'); return false;
    };
    //檢核_必填欄位
    if (isChk && !chkObjList($('#divInsInfo').find('input,select'), true)) { isChk = false; };
    //檢核_[強制險]相關資料
    if (isChk && !chkMan()) { isChk = false; };
    //檢核_[任意險]相關資料
    if (isChk && !chkAny()) { isChk = false; };
    //檢核_[折舊率]
    if (isChk && _div4.find('#chkAny').prop('checked') && !chkZDEPCODE()) { isChk = false; };
    //檢核_多欄位檢核
    if (isChk && !chkMultiComs('2')) { isChk = false; };
    //檢核_[險種]相關資料
    if (isChk && !chkInsData()) { isChk = false; };
    //檢核_[專案代號]
    if (isChk && !chkProjectNo()) { isChk = false; };
    return isChk;
};
//檢核_[ID]相關資料
function chkID(ObjNM, CustType, CustNation) {
    var ischk = true;
    var id = getObjToVal($(ObjNM).val());
    if (id == "") { ShowMsgInElm(ObjNM, '必填欄位！'); ischk = false; }
    else {
        if (CustType == "C") { if (!checkCompId(id)) { ShowMsgInElm(ObjNM, '[公司統一編號]有誤！'); ischk = false; }; }
        else if (CustType == "P" && CustNation == "TWN") {
            if (!checkID(id)) { ShowMsgInElm(ObjNM, '本國人[身份證字號]有誤！'); ischk = false; };
        } else if (CustType == "P" && CustNation == "FOR") {
            if (!check_resident_ID(id)) { ShowMsgInElm(ObjNM, '外國人[ID]有誤！'); ischk = false; };
        };
    };
    if (ischk == false) { return ischk; };
    return true;
};
//檢核_[客戶資料]開啟前
function chkCustInfoOpen(e) {
    var agntnum = getObjToVal($('#selAGNTNUM').val());
    if (agntnum == "") { MsgBox('錯誤', '請輸入經手人！', 'red'); return false; };
    var targetID = e.id;
    var custid = '', custname = '';
    if (targetID == "btnAPLCustID") {
        custid = getObjToVal($('#iptAPLCustID').val());
    } else if (targetID == "btnAPLCustNM") {
        custname = getObjToVal($('#iptAPLName').val());
    } else if (targetID == "btnCTLCustID") {
        custid = getObjToVal($('#iptCTLCustID').val());
    } else if (targetID == "btnCTLCustNM") {
        custname = getObjToVal($('#iptCTLName').val());
    };
    if (custid == "" && custname == "") { MsgBox('錯誤', '請輸入ID或名稱！', 'red'); return false; };
    var divCustInfo = $("#divCustInfo");
    divCustInfo.data("targetID", targetID);   //來源ID
    divCustInfo.data("AgntNO", agntnum);      //經手人
    divCustInfo.data("CustID", custid);       //客戶ID
    divCustInfo.data("CustName", custname);   //客戶名稱
    divCustInfo.modal('show');
};
//檢核_{經手人/業務員資料}[經手人]與[編號]&[單位別]
function chkCntbranch(targetID) {
    targetID = getObjToVal(targetID);
    var sAgntNum = getObjToVal($('#selAGNTNUM').val());
    var sCntBranch = getObjToVal($('#iptCNTBRANCH').val());
    var sBranchNo = getObjToVal($('#iptBranchNo').val());
    if (sAgntNum == "") { return false; };
    var dt = getdata("/Quotation/ChkAGNTNUM", { sAGNTNUM: sAgntNum, sCNTBRANCH: sCntBranch, sBRANCHNO: sBranchNo });
    if (dt.length > 0) {
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
            MsgBox('錯誤', dt[0].MSG, 'red');
            return false;
        }
    }
    return true;
};
//檢核_{經手人/業務員資料}[經手人]與[編號](大保單號碼)
function chkAgntAmwayno() {
    var sAgntNum = getObjToVal($('#selAGNTNUM').val());
    var sAmwayNo = getObjToVal($('#iptAmwayNo').val());
    if (sAgntNum == "") { return false; };
    var dt = getdata("/Quotation/ChkAGNTAMWAYNO", { sAGNTNUM: sAgntNum, sAMWAYNO: sAmwayNo });
    if (dt.length > 0) {
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
            ShowMsgInElm('#iptAmwayNo', dt[0].MSG);
            return false;
        }
    };
    return true;
};
//檢核_{經手人/業務員資料}[收費員代碼]
function chkTollClterNo() {
    var sVal = getObjToVal($('#iptTollClterNo').val());
    if (sVal == '') {
        $('#divQuoteDate').data("TOLLCLTERID", "");     /*收費員ID*/
        $('#divQuoteDate').data("TOLLCLTERNAME", "");   /*收費員名稱*/
        $('#divQuoteDate').data("TOLLCLTERREGNO", "");  /*收費員登錄證號*/
        return true;
    } else {
        var dt = getdata("/Quotation/GetTollClterInfo", { sTollClterNo: sVal, sTollClterID: '' });
        if (dt.length > 0) {
            $('#divQuoteDate').data("TOLLCLTERID", getObjToVal(dt[0].TOLLCLTERID));         /*收費員ID*/
            $('#divQuoteDate').data("TOLLCLTERNAME", getObjToVal(dt[0].TOLLCLTERNAME));     /*收費員名稱*/
            $('#divQuoteDate').data("TOLLCLTERREGNO", getObjToVal(dt[0].TOLLCLTERREGNO));   /*收費員登錄證號*/
        } else {
            ShowMsgInElm('#iptTollClterNo', '查無此[收費員代碼]');
            return false;
        };
    };
    return true;
};
//檢核_{要保人及被保險人資料}[與被保險人關係]
function chkRELA() {
    var rela = $('#selRELA').val();             //與被保險人關係
    var aplcid = $('#iptAPLCustID').val();       //要保人ID
    if (aplcid == "" && rela != "") {
        ShowMsgInElm('#selRELA', "與被保險人關係必須空白！");
        return false;
    } else if (aplcid != "" && rela == "") {
        ShowMsgInElm('#selRELA', "與被保險人關係必須輸入！");
        return false;
    };
    if (rela == "01" && $("#iptCTLCustID").val() != aplcid) {
        ShowMsgInElm('#selRELA', "與被保險人關係不符！");
        return false;
    };
    if (rela != "01" && $("#iptCTLCustID").val() == aplcid) {
        ShowMsgInElm('#selRELA', "與被保險人關係不符！");
        return false;
    };
    return true;
};
//檢核_{車籍資料}[牌照]
function chkZREGNUM() {
    var isChkPass = true;
    var ZREGNUM = $('#iptZREGNUM').val();           //牌照
    //var MVPZMTYPE = $('#selMVPZMTYPE').val();       //車種
    //var ZCC = $('#iptZCC').val();                   //排氣量
    if (ZREGNUM == '') {
        return true;             //若牌照為空時，則直接跳過此檢查(因為[強制險][任意險]會檢核是否必填牌照)
    } else {
        ZREGNUM = ZREGNUM.match(/^[\u4e00-\u9fa5|a-zA-Z0-9-]+$/);
        if (ZREGNUM == null) {
            ShowMsgInElm('#iptZREGNUM', "車牌格式有誤!", true);
            return false;
        };
    }
    //(20181221 DEL BY WS-Michael 車牌檢核移至400檢核)
    //if (typeof (ZREGNUM) == "undefined" || ZREGNUM == null || ZREGNUM == ""
    //    || typeof (MVPZMTYPE) == "undefined" || MVPZMTYPE == null || MVPZMTYPE == ""
    //    || typeof (ZCC) == "undefined" || ZCC == null || ZCC == "") {
    //    return;
    //}
    //var dt = getdata("/Quotation/ChkZREGNUM", { sZREGNUM: ZREGNUM, sMVPZMTYPE: MVPZMTYPE, sZCC: ZCC });
    //if (dt.length > 0) {
    //    if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
    //        console.log(dt[0].MSG);
    //        ShowMsgInElm('#iptZREGNUM', dt[0].MSG, true);
    //        //$('#iptZREGNUM').focus();
    //        //MsgBox('錯誤', dt[0].MSG, 'red');
    //        return false;
    //    }
    //};
    return isChkPass;
};
//檢核_{車籍資料}[重置價格]
function chkResetpriceRange() {
    var key = parseInt(getObjToVal($("#iptRESETPRICE").val()).replace(/[$,]/g, ""));
    var oldkey = parseInt(getObjToVal(_div3.find('#iptRESETPRICE').attr('oldval')).replace(/[$,]/g, ""));// parseInt(getObjToVal($("#iptRESETPRICE").attr('oldval')).replace(/[$,]/g, ""));
    if (isNaN(oldkey) || isNaN(key) || oldkey == key) { return true; };
    //var maxval = parseInt($('#divQuoteDate').data("RangeMax"));     //上限值(空白=無上限)
    //var minval = parseInt($('#divQuoteDate').data("RangeMin"));     //下限值(030=0.3)
    var val = ((key - oldkey) / key).toFixed(5)                     //差異比率
    if (!isNaN(_intRangeMax)) {     //上限值(空白=無上限)
        if (val > 0 && _intRangeMax != "" && val > _intRangeMax / 100) {
            MsgBox('錯誤', "[重置價格]調整超過規定！請重新輸入！", 'red');
            $('#iptRESETPRICE').val(Comma(oldkey));
            return false;
        };
    };
    if (!isNaN(_intRangeMin)) {     //下限值(030=0.3)
        if (val < 0 && _intRangeMin != "" && Math.abs(val) > _intRangeMin / 100) {
            MsgBox('錯誤', "[重置價格]調整超過規定！請重新輸入！", 'red');
            $('#iptRESETPRICE').val(Comma(oldkey, true));
            return false;
        };
    };
    return true;
};
//檢核_多欄位檢核([chkType]:檢核類別(1:車種類檢查;2:全部檢查))
function chkMultiComs(chkType) {
    var sAnyInsuredFrom = getObjToVal($('#iptCCDATES').val());                  //任意起保日
    var sAnyInsuredTo = getObjToVal($('#iptCCDATEE').val());                    //任意迄止日
    var sZcvrTypeList = getObjToVal($('#divQuoteDate').data("ZcvrTypeList"));   //已輸入險種代碼
    var sAgentNo = getObjToVal($('#selAGNTNUM').val());                         //經手人代號
    var sCarType = getObjToVal($('#selMVPZMTYPE').val());                       //車種
    var sDisplacement = getObjToVal($('#iptZCC').val().replace(/[,]/g, ""));    //排氣量
    var sLoad = getObjToVal($('#iptZCARRY').val().replace(/[,]/g, ""));         //乘載(人/噸)
    var sCarTypeNo = getObjToVal($('#selZMAKE').val());                         //廠型
    var sMakeYear = getObjToVal($('#selYRMANF').val());                         //製造年
    var sMortgage = getObjToVal($('#iptMortgage').val());                       //抵押權人
    var sInsuredID = getObjToVal($('#iptCTLCustID').val());                     //被保險人ID
    if (chkType == '1') {
        sAnyInsuredFrom = '';
        sAnyInsuredTo = '';
        sZcvrTypeList = '';
        sMortgage = '';
    } else if ($('#chkAny').prop('checked') == false) {
        sAnyInsuredFrom = '';
        sAnyInsuredTo = '';
        sMortgage = '';
    };
    var dt = getdata("/Quotation/ChkMultiComs", {
        sAnyInsuredFrom: sAnyInsuredFrom    //任意起保日
        , sAnyInsuredTo: sAnyInsuredTo      //任意迄止日
        , sZcvrTypeList: sZcvrTypeList      //已輸入險種代碼
        , sAgentNo: sAgentNo                //經手人代號
        , sAnyCarType: sCarType             //車種
        , sDisplacement: sDisplacement      //排氣量
        , sLoad: sLoad                      //乘載(人/噸)
        , sCarTypeNo: sCarTypeNo            //廠型
        , sMakeYear: sMakeYear              //製造年
        , sMortgage: sMortgage              //抵押權人
        , sInsuredID: sInsuredID            //被保險人ID
    });
    if (dt.length > 0) { if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return false; }; };
    return true;
};
//檢核_[強制險]相關資料
function chkMan() {
    if ($('#chkMan').prop('checked')) {     //強制險資料
        if (!chkObjList($('#iptFRDATES,#iptFRDATEE').parent().find('select'), true)) { return false; };     //必填欄位
        var forceinsuredfrom = $('#iptFRDATES').val();                      //強制保期(起)
        var forceinsuredto = $('#iptFRDATEE').val();                        //強制保期(迄)
        var forcecartype = $('#selMANMVPZMTYPE').val();                     //車種
        var category = _strCategory;                                        //車種彙總類別(C:汽車,M:機車)
        var licenseno = $('#iptZREGNUM').val();                             //牌照
        var ctlcusttype = $('#rdoCTLCustType:checked').val();               //客戶類別(被保險人)
        var agntnum = getObjToVal($('#selAGNTNUM').val());                  //經手人
        var iIssueYear = getObjToVal($('#selIssueYear').val());             //[發照年]
        var insuredperiod = ((Date.parse(forceinsuredto)).valueOf()
            - (Date.parse(forceinsuredfrom)).valueOf()) / 86400000 / 365;   //強制保期
        //檢核_強制保期(起/迄)
        if (!chkDateSE($('#iptFRDATES'), $('#iptFRDATEE'))) { $('#chkFRDATE1').focus(); return false; };
        /*************************************************************************
         20190102 ADD BY WS-MICHAEL 
         被保險人(車主) = 法人 
            1.檢核車牌可為空白之規則起保年月 <= 發照年月(無發照日)+1個月
            2.檢核保單合理性 發照年月 <= 起保年月
         被保險人(車主) = 自然人
            1.檢核保單合理性 發照年月 <= 起保年月
        ***************************************************************************/
        var iIssue_YM = Date.parse($('#selIssueYear').val() + '/' + $('#selIssueMonth').val() + '/1');      /*發照年月*/
        var iFRDATES_YM = Date.parse($('#selFRDATESY').val() + '/' + $('#selFRDATESM').val() + '/1');       /*起保年月*/
        if (iIssue_YM > iFRDATES_YM) { ctrlMsg('MSF', '[發照年月]或[強制保期(起)]不合理！', '#iptFRDATES'); return false; };
        if (ctlcusttype == "C" && licenseno == "") {
            if ($('#selIssueMonth').val() == "12") {
                iIssue_YM = Date.parse(parseInt($('#selIssueYear').val()) + 1 + '/1/1');
            } else {
                iIssue_YM = Date.parse($('#selIssueYear').val() + '/' + (parseInt($('#selIssueMonth').val()) + 1) + '/1');
            }
            if (iIssue_YM < iFRDATES_YM) { ctrlMsg('MSFO3', '[牌照]不可為空白！', '#iptZREGNUM'); return false; };
        };
        /**************************************************************************
         20181218 DEL BY WS-MICHAEL 與VIAN確認後，報價階段[車牌]不用檢核
         若發照年月非空白，且不為新車(新車判別方式：任意或強制保期(迄)的YYY=發照年或發照年=製造年)
         ，則牌照號碼必須輸入。否則顯示錯誤訊息「牌照號碼不得為空白！」。
        ***************************************************************************/
        //if (iIssueYear != '' && iIssueYear != new Date($('#iptFRDATES').val()).getFullYear() && licenseno == '') {
        //    ctrlMsg('MSFO3', '牌照號碼不得為空白！(不為新車)', '#iptZREGNUM'); return false;
        //};
        /*若強制車種屬於機車(以車種代號讀T9009, 車種類別若為M則為機車，C為汽車) 請參閱SQL_T9009_02，且強制保期大於2年，則顯示錯誤訊息「強制保期不合理」*/
        if (category == "M" && insuredperiod > 2) {  //車種類別若為M則為機車
            if (AddYears(forceinsuredfrom, 2) != forceinsuredto) {  //第二層判斷，當承保起日+2年，不等於承保迄日
                ctrlMsg('MSFO4', '機車且保期大於2年,強制保期不合理！', '#iptFRDATES,#iptFRDATEE'); return false;
            };
        };
        /*若強制險為汽車且保期大於1年，則顯示錯誤訊息「強制保期不合理！」*/
        if (category == "C" && insuredperiod > 1) {  //車種類別C為汽車
            if (AddYears(forceinsuredfrom, 1) != forceinsuredto) {  //第二層判斷，當承保起日+1年，不等於承保迄日
                ctrlMsg('MSFO4', '汽車且保期大於1年,強制保期不合理！', '#iptFRDATES,#iptFRDATEE'); return false;
            };
        };
        /*若「強制車種」為27不可輸入「牌照」，否則顯示錯誤訊息「選擇強制車種27，不可輸入牌照！」*/
        if (forcecartype == "27" && licenseno != '') {
            ctrlMsg('MSFO3', '選擇強制車種27，不可輸入牌照！', '#iptZREGNUM'); return false;
        };
        /*※ 若強制車種為15，則客戶必須是個人，否則顯示錯誤訊息「選擇強制車種15，客戶不得為法人」*/
        if (forcecartype == "15" && ctlcusttype == "C") {
            ctrlMsg('MSFO3', '選擇強制車種15，客戶不得為法人！', '#selMANMVPZMTYPE'); return false;
        };
        /*※ 若強制車種為21，則客戶必須是公司 (以客戶代號 查詢 CLNT Table 之CLTTYPE，P-自然人，C-法人請參閱SQL_CLNT_02 )，否則顯示錯誤訊息「選擇強制車種21，客戶不得為個人！」*/
        if (forcecartype == "21" && ctlcusttype == "P") {
            ctrlMsg('MSFO3', '選擇強制車種21，客戶不得為個人！', '#selMANMVPZMTYPE'); return false;
        };
        //強制險報價日檢核
        ////var dt = getdata("/Quotation/ChkFRDATES", { sFRDATES: $('#iptFRDATES').val(), sQUOTEDATE: $('#iptQuotDate').val() });
        ////if (dt.length > 0) {
        ////    if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
        ////        ctrlMsg('MSFO4', dt[0].MSG, '#iptFRDATES'); return false;
        ////    };
        ////};
        //[強制險]相關資料檢核
        dt = getdata("/Quotation/ChkMANDATA", { sForceCarType: forcecartype, sZCARRY: $('#iptZCARRY').val() });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
                ctrlMsg('MSFO4', dt[0].MSG, '#iptZCARRY'); return false;
            };
        };
    };
    return true;
}
//檢核_[任意險]相關資料
function chkAny() {
    if ($('#chkAny').prop('checked')) {     //任意險資料
        if (!chkObjList($('#iptCCDATES,#iptCCDATEE').parent().find('select'), true)) { return false; };     //必填欄位
        var anyinsyearfrom = getObjToVal($('#iptCCDATES').val()).substring(0, 4);   //[任意保期(起)](年)
        var anyinsyearto = getObjToVal($('#iptCCDATEE').val()).substring(0, 4);     //[任意保期(迄)](年)
        var anyinsfrom = getObjToVal($('#iptCCDATES').val());                       //[任意保期(起)]
        var anyinsto = getObjToVal($('#iptCCDATEE').val());                         //[任意保期(迄)]
        var iYRMANF = getObjToVal($('#selYRMANF').val()).substring(0, 4);           //[製造年](年)
        var iIssueYear = getObjToVal($('#selIssueYear').val()).substring(0, 4);     //[發照年月](年)
        var agntnum = $('#selAGNTNUM').val();                                       //[經手人]
        var mvpzmtype = $('#selMVPZMTYPE').val();                                   //[任意車種]
        var insuredperiod = ((Date.parse(anyinsto)).valueOf()
            - (Date.parse(anyinsfrom)).valueOf()) / 86400000 / 365;                 //任意保期
        //if (mvpzmtype == '22') { mvpzmtype = '03'; };   //任意險沒有22車種，故將22改為03  20191129 DEL BY MICHAEL CCF20765
        if (agntnum == '' || agntnum == null) { ctrlMsg('MSFO1', '', '#selAGNTNUM'); return false; };           //經手人
        if (mvpzmtype == '' || mvpzmtype == null) { ctrlMsg('MSFO3', '', '#selMVPZMTYPE'); return false; };     //車種
        if (iYRMANF == '' || iYRMANF == null) { ctrlMsg('MSFO3', '', '#selYRMANF'); return false; };            //製造年
        if (iIssueYear == '' || iIssueYear == null) { ctrlMsg('MSF03', '', '#selIssueYear'); return false; };     //發照年月
        //檢核_任意保期(起/迄)
        if (!chkDateSE($('#iptCCDATES'), $('#iptCCDATEE'))) { $('#chkCCDATE').focus(); return false; };
        /*************************************************************************
         20190102 ADD BY WS-MICHAEL 
         被保險人(車主) = 法人 
            1.檢核車牌可為空白之規則起保年月 <= 發照年月(無發照日)+1個月
            2.檢核保單合理性 發照年月 <= 起保年月
         被保險人(車主) = 自然人
            1.檢核保單合理性 發照年月 <= 起保年月
        ***************************************************************************/
        var licenseno = $('#iptZREGNUM').val();                             //牌照
        var iIssue_YM = Date.parse($('#selIssueYear').val() + '/' + $('#selIssueMonth').val() + '/1');      /*發照年月*/
        var iFRDATES_YM = Date.parse($('#selCCDATESY').val() + '/' + $('#selCCDATESM').val() + '/1');       /*起保年月*/
        if (iIssue_YM > iFRDATES_YM) { ctrlMsg('MSF', '[發照年月]或[任意保期(起)]不合理！', '#iptCCDATES'); return false; };
        var ctlcusttype = $('#rdoCTLCustType:checked').val();               //客戶類別(被保險人)
        if (ctlcusttype == "C" && licenseno == "") {
            if ($('#selIssueMonth').val() == "12") {
                iIssue_YM = Date.parse(parseInt($('#selIssueYear').val()) + 1 + '/1/1');
            } else {
                iIssue_YM = Date.parse($('#selIssueYear').val() + '/' + (parseInt($('#selIssueMonth').val()) + 1) + '/1');
            }
            if (iIssue_YM < iFRDATES_YM) { ctrlMsg('MSFO3', '[牌照]不可為空白！', '#iptZREGNUM'); return false; };
        };
        //任意險保期小於1年，要讓業務員選擇下拉【SQ-按月/ DQ-按天】，否則出現錯誤訊息【請選擇計算保費的方式】
        if (insuredperiod < 1) {
            if (AddYears(anyinsfrom, 1) != anyinsto && $("#selCalCode").val() == "AQ") {
                ctrlMsg('MSF', '任意險[保期]小於1年，[計算]不得為[AQ-年繳]！', '#selCalCode'); return false;
            };
        };
        /*發照年月必須小於等於任意保期起始年月，若發照年月大於任意保期起始年月，則顯示錯誤訊息「發照年月有誤！」*/
        if (!isNaN(new Date($('#iptCCDATES').val()).getFullYear()) && Date.parse(new Date($('#iptCCDATES').val()).getFullYear() + '/' + (new Date($('#iptCCDATES').val()).getMonth() + 1) + '/1')
            < Date.parse(new Date($('#selIssueYear').val()).getFullYear() + '/' + (new Date($('#selIssueYear').val()).getMonth() + 1) + '/1')) {
            ctrlMsg('MSFO3', '發照年月有誤！(發照年月必須小於等於任意保期起始年月)', '#selIssueYear'); return false;
        };
        /*若製造年(2019)大於系統日期1年(2018)則必須與任意保期起始年度(2019)相同，否則顯示錯誤訊息「製造年輸入錯誤！」*/
        if (!isNaN(anyinsyearfrom) && iYRMANF > new Date().getFullYear() && anyinsyearfrom != iYRMANF) {
            ctrlMsg('MSFO3', '製造年輸入錯誤！(製造年大於系統日期1年必須與任意保期起始年度相同)', '#selYRMANF'); return false;
        };
        //[任意車種]&[經手人]檢核(20190115 DEL BY WS-Michael 目前暫不檢核，交由400檢核)
        ////var data = getdata("/Quotation/ChkAGNTCARTYPE", { sAGNTNUM: agntnum, sMVPZMTYPE: mvpzmtype });
        ////if (data.length > 0) {
        ////    if (data.length === 1 && typeof (data[0].MSG) != "undefined") {
        ////        ctrlMsg('MSFO3', data[0].MSG, '#selMVPZMTYPE'); return false;
        ////    };
        ////};
    };
    return true;
}
//檢核_[折舊率]相關資料
function chkZDEPCODE() {
    var isChkPass = true;
    var sCarType = _div3.find('#selMVPZMTYPE').val();   //車種
    var sDepRate = _div4.find('#selDepRate').val();     //折舊率
    var sInsList = getObjToVal(_divQ.data("ZcvrTypeList"));        //險種代碼清單
    if (sCarType == "") { return isChkPass; };
    var dt = getdata("/Quotation/ChkZDEPCODE", {
        sMVPZMTYPE: sCarType, sZDEPCODE: sDepRate, sZCVRTYPELIST: sInsList
    });
    if (dt.length > 0) {
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
            ctrlMsg('MSF', dt[0].MSG, '#selDepRate');
            //setTimeout(function () { ShowMsgInElm('#selDepRate', dt[0].MSG); }, 5);
            return false;
        }
    }
    return isChkPass;
};
//檢核_[專案代號]
function chkProjectNo(isBlur) {
    var sVal = getObjToVal($('#iptProjectNo').val());
    if (sVal == '') {
        return true;
    } else {
        var dt = getdata("/Quotation/ChksProjectNo", { sProjectNo: sVal });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
                if (isBlur) {
                    ShowMsgInElm('#iptProjectNo', dt[0].MSG);
                } else {
                    ctrlMsg('MSF', dt[0].MSG, '#iptProjectNo');
                }
                return false;
            };
        };
    };
    return true;
};
//檢核_[保額一]的合理性
function chkSumina(sumina, resetprice) {
    if (sumina == '') { return true; }   //金額為空不檢核
    sumina = parseInt(sumina.replace(/[$,]/g, ""));
    resetprice = parseInt(resetprice.replace(/[$,]/g, ""));
    if (isNaN(sumina) || isNaN(resetprice)) { return false; };
    if (sumina == 0) { return true; }   //金額為0不檢核
    var pie = Math.abs((resetprice - sumina) / resetprice);
    if (pie > 0.35) { return false; };
    return true;
};
//檢核_[險種]相關資料
function chkInsData(isCal) {
    var isChkPass = true;
    var dt = $('#tblInsuranceList').DataTable();
    //無任何險種資料，請新增險種資料！
    if (dt.data().length == 0) {
        MsgBox('錯誤', '無任何險種資料，請新增險種資料！', 'red'); return;
    };
    //檢核[受益人](宜倖 & 惠莉說明了﹐受益人非必要欄位)
    ////剛宜倖 & 惠莉說明了﹐受益人非必要欄位，但列印時要印比表格供客戶填受益人，所以移除受益人必填檢核
    ////需檢核若此險種需輸入受益人資料但未輸入則顯示錯誤訊息「承保XX險種，需輸入受益人資料！」
    ////var zcvrtype = "";
    ////$.each(dt.data(), function (i, item) {
    ////    if (item.ISBEN == "Y") {
    ////        isChkPass = false; zcvrtype = item.ZCVRTYPE; return false;
    ////    }
    ////});
    ////if (!isChkPass) {
    ////    MsgBox('錯誤', '承保[' + zcvrtype + ']險種，需輸入受益人資料！', 'red'); return false;
    ////};
    var zcvrtypelist = '';          //險種代碼清單
    var suminalist = '';            //保額一清單
    var excesslist = '';            //自負額清單
    var inddatalist = '';           //險種資料
    dt.rows().data().map(function (x) {
        zcvrtypelist += getObjToVal(x.ZCVRTYPE) + '|';
        suminalist += getObjToVal(x.SUMINA) + '|';
        excesslist += getObjToVal(x.EXCESS) + '|';
        inddatalist += getObjToVal(x.ZCVRTYPE) + '|' + getObjToVal(x.SUMINA) + '|'
            + getObjToVal(x.SUMINB) + '|' + getObjToVal(x.SUMINC) + '|' + getObjToVal(x.EXCESS) + '|' + "^^";
    });
    var sFrdateS = Date.parse($('#iptFRDATES').val()) >= Date.parse($('#iptCCDATES').val()) ? $('#iptFRDATES').val() : $('#iptCCDATES').val()
    //檢核[主附險關係]相關資訊
    var dtSource = getdata("/Quotation/ChkINSRELATIONSHIP", {
        sZCVRTYPELIST: zcvrtypelist, sSUMINALIST: suminalist, sEXCESSLIST: excesslist, sFRDATES: sFrdateS, sISUPD: 'N'
    });
    if (dtSource.length > 0) {
        if (dtSource.length === 1 && typeof (dtSource[0].MSG) != "undefined") {
            MsgBox('錯誤', dtSource[0].MSG.replace(/[|]/g, '<BR>'), 'red'); return false;
        }
    };
    //檢核[必填欄位](20190107 DEL BY WS-Michael 暫不檢核，移至400檢核)
    ////dtSource = getdata("/Quotation/GetINSUREDINDIS", {
    ////    sZCVRTYPELIST: zcvrtypelist
    ////});
    ////if (dtSource.length > 0) {
    ////    if (dtSource.length === 1 && typeof (dtSource[0].MSG) != "undefined") {
    ////        MsgBox('錯誤', dtSource[0].MSG.replace(/[|]/g, '<BR>'), 'red'); return false;
    ////    }
    ////    else {
    ////        var msg = "";
    ////        var msg2 = "";
    ////        //必填欄位檢核
    ////        dt.rows().data().filter(function (x) {
    ////            for (i = 0; i < dtSource.length; i++) {
    ////                msg2 = "";
    ////                if (x.ZCVRTYPE == dtSource[i].InsureType) {
    ////                    //console.log(x.ZCVRTYPE)
    ////                    if (dtSource[i].InsAmt1Flag == "Y" && getObjToVal(x.SUMINA) == "" && getObjToVal(x.SUMINA) != 0) {
    ////                        msg2 += "[保額一]";
    ////                    }
    ////                    if (dtSource[i].InsAmt2Flag == "Y" && getObjToVal(x.SUMINB) == "") {
    ////                        msg2 += "[保額二]";
    ////                    }
    ////                    if (dtSource[i].InsAmt3Flag == "Y" && getObjToVal(x.SUMINC) == "") {
    ////                        msg2 += "[保額三]";
    ////                    }
    ////                    if (dtSource[i].Factor1Flag == "Y" && getObjToVal(x.ZFACTORA) == "") {
    ////                        msg2 += "[係數一]";
    ////                    }
    ////                    if (dtSource[i].Factor2Flag == "Y" && getObjToVal(x.ZFACTORB) == "") {
    ////                        msg2 += "[係數二]";
    ////                    }
    ////                    if (dtSource[i].SelfDedFlag == "Y" && getObjToVal(x.EXCESS) == "" && x.ZCVRTYPE != "29") {  //險種29不檢核[自負額]
    ////                        msg2 += "[自負額]";
    ////                    }
    ////                }
    ////                if (msg2 != "") {
    ////                    msg += "險種[" + x.ZCVRTYPE + "]：" + msg2 + "為必填欄位！|";
    ////                }
    ////            }
    ////        });
    ////        if (msg != "") {
    ////            MsgBox('錯誤', msg.replace(/[|]/g, '<BR>'), 'red');
    ////            return false;
    ////        };
    ////    };
    ////}
    //檢核[活動代碼](20190107 DEL BY WS-Michael 暫不檢核，移至400檢核)
    ////var ProgramCode = getObjToVal($('#selProgramCode').val());
    ////if (ProgramCode != "") {
    ////    var zcvrtypexcesslist = '';     //[險種]+[活動代碼]
    ////    dt.rows().data().map(function (x) {
    ////        return zcvrtypexcesslist += getObjToVal(x.ZCVRTYPE) + getObjToVal(x.EXCESS) + '|'
    ////    });
    ////    console.log(zcvrtypexcesslist);
    ////    dtSource = getdata("/Quotation/ChkPROGRAMCODE", {
    ////        sProgramCode: ProgramCode, sZCVRTYPELIST: zcvrtypexcesslist
    ////    });
    ////    if (dtSource.length > 0) {
    ////        if (dtSource.length === 1 && typeof (dtSource[0].MSG) != "undefined") {
    ////            MsgBox('錯誤', dtSource[0].MSG.replace(/[|]/g, '<BR>'), 'red');
    ////            return false;
    ////        }
    ////    };
    ////};
    //檢核_險種[91,92,93,94]與[車齡]
    if (zcvrtypelist.indexOf("91") != -1 || zcvrtypelist.indexOf("92") != -1 || zcvrtypelist.indexOf("93") != -1 || zcvrtypelist.indexOf("94") != -1) {
        if (getCarAge() > 2) {
            let sZcvrType = (zcvrtypelist.indexOf("91") != -1) ? "91" : "";
            sZcvrType += (zcvrtypelist.indexOf("92") != -1) ? ((sZcvrType == "" ? "" : ",") + "92") : "";
            sZcvrType += (zcvrtypelist.indexOf("93") != -1) ? ((sZcvrType == "" ? "" : ",") + "93") : "";
            sZcvrType += (zcvrtypelist.indexOf("94") != -1) ? ((sZcvrType == "" ? "" : ",") + "94") : "";
            MsgBox('錯誤', '車齡大於2年，不可承保[' + sZcvrType + ']險種', 'red'); return false;
        };
    };
    //檢核[險種28,29,30](改為直接更新[自負額])
    if (zcvrtypelist.indexOf("28") != -1 || zcvrtypelist.indexOf("29") != -1 || zcvrtypelist.indexOf("30") != -1) {
        dtSource = getdata("/Quotation/ChkINS282930", { sINSDATA: inddatalist, sCCDATES: $('#iptCCDATES').val().replace(/[/]/g, "") });
        if (dtSource.length > 0) {
            if (dtSource.length === 1 && typeof (dtSource[0].MSG) != "undefined") { MsgBox('錯誤', dtSource[0].MSG, 'red'); return false; };
            if (dtSource.length === 1 && typeof (dtSource[0].ZCVRTYPE) != "undefined") {
                //更新自負額
                $.each(dt.data(), function (i, item) {
                    if (item.ZCVRTYPE == dtSource[0].ZCVRTYPE) {
                        item.EXCESS = dtSource[0].EXCESS;
                        CreatInsDT(dt.data());  //20200305 ADD BY MICHAEL增加重整[承保內容]區塊，讓[自負額]順利帶上去後，再去計算保費
                    };
                });
            };
        };
    };
    return true;
};
//檢核_[強制險承保記錄]相關資料
function chkMCPInsured(isCal) {
    //強制險承保記錄
    var sMCPIns = getObjToVal($('#divQuoteDate').data("MCPInsured"));
    //sMCPIns = "0650KA04820200001~|~ZX-6713     ~|~20180319~|~20190319";     //test
    //sMCPIns = "06A0P110555800001~|~2869-VN     ~|~20190209~|~20200209";
    if (sMCPIns == "") {
        return true;
    } else {
        var alist = sMCPIns.split('~|~');
        var sMCPSDate = "";     //保單開始日期
        var sMCPEDate = "";     //保單終止日期
        var sFRDATES = $('#iptFRDATES').val();      //強制險保期(起)
        var sFRDATEE = $('#iptFRDATEE').val();      //強制險保期(迄)
        if (alist.length > 3) {
            sMCPSDate = alist[2];   /*ex:20180319*/
            sMCPEDate = alist[3];
            var dt = getdata("/Quotation/ChkMCPDATES", {
                sFRDATES: sFRDATES, sFRDATEE: sFRDATEE, sMCPDATES: sMCPSDate, sMCPDATEE: sMCPEDate
            });
            if (dt.length > 0) {
                if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
                    ctrlMsg('M', dt[0].MSG);    /*ex:強制險[承保期間]重疊，不可報價！<BR>(已承保期間20190101~20200101*/
                    return false;
                };
            };
        };
    };
    return true;
};
//檢核_[附件上傳]
function chkUploadFail() {
    let inputFile = $('#UploadFileDiv .uploadFile');
    let isChecked = true;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        if (inputFile.length > 10) {
            MsgBox('上傳檔案錯誤', "檔案最多選擇10個", 'red');
            isChecked = false;
            return isChecked
        }
        inputFile.each(function (index, element) {
            var fsize = element.files[0].size;  //取得檔案大小
            var ftype = element.files[0].type;  //取得檔案類別
            //檢查檔案類別
            switch (ftype) {
                case 'image/png':
                case 'image/jpeg':
                case 'image/pjpeg':
                case 'application/pdf':
                    break;
                default:
                    MsgBox('上傳檔案錯誤', "請上傳jpg, pdf, png 類型檔案", 'red');
                    isChecked = false;
                    return isChecked
            };
            //檢查檔案大小
            if (fsize > 4000000) {
                MsgBox('上傳檔案錯誤', "您上傳的檔案當中超過4MB 容量大小限制", 'red');
                isChecked = false;
                return isChecked
            };
        });
    } else {
        MsgBox('上傳檔案錯誤', "Please upgrade your browser, because your current browser lacks some new features we need!", 'red');
        isChecked = false;
    };
    return isChecked;
};
//檢核_[是否修改總保費]
function chkEditTotalInsurance() {
    var dt = $('#tblInsuranceList').DataTable();
    if (dt.data().length > 0) {
        //計算[總保費]
        let MVPPREMSum = dt.rows().data().map(function (x) { return x.MVPPREM });
        MVPPREMSum = MVPPREMSum.length > 0 ? MVPPREMSum.reduce(function (x, y) { return parseInt(x) + parseInt(y) }) : 0;
        //判斷[總保費]
        if (isNaN(MVPPREMSum)) { return false; };       //若為非數字，則直接回傳false
        if (!isNaN(MVPPREMSum) && MVPPREMSum != 0) { return true; }     //若[總保費]不為0，則需要修改險種資料的[保額一]&[保費]，回傳true
        else { return false; };
    };
};
//檢核_[是否取級數]
function chkGetLevel() {
    var dt = $('#tblInsuranceList').DataTable();
    var ischk = false;
    $.each(dt.data(), function (i, item) {
        if (_strGetLevelList.indexOf(getObjToVal(item.ZCVRTYPE.substr(0, 2))) > -1) {
            ischk = true;
        }
    });
    return ischk;
}
//檢核傷害險被保險人必填欄位並顯示錯誤訊息
function chktblBeneList() {
    var errMsgList = "";
    var dt = $('#tblBeneList').DataTable();
    $.each(dt.data(), function (i, item) {
        var errMsg = "";
        var errMsg2 = "";
        if (item.ZCVRTYPE == '') { errMsg += "[險種]"; }
        if (item.ZCNAME == '') { errMsg += "[姓名]"; }
        if (item.RELADesc == '') { errMsg += "[與要保人關係]"; }
        if (item.MEMBSEL == '') { errMsg += "[ID]"; }
        if (item.CLTDOB == '') { errMsg += "[生日]"; }
        if (item.CLTSEXDesc == '') { errMsg += "[性別]"; }
        if (item.LEGAL == '') { errMsg += "[法定]"; }
        if (item.MEMBSEL != '' && item.CLTSEXDesc != '') {
            var selSex = item.CLTSEX; //性別
            var idSex = item.MEMBSEL.substr(1, 1); //ID
            if ((idSex == "1" && selSex != "1") || (idSex == "2" && selSex != "2")) {
                errMsg2 = 'ID與性別不符！';
            }
        }
        var iCnt = i + 1;
        if (errMsg != "") { errMsg += '欄位必須輸入資料!'; }
        if (errMsg != "" || errMsg2 != "") { errMsgList += '第' + iCnt + '筆資料, ' + errMsg + errMsg2 + '<br/>'; }
    });
    if (errMsgList != "") { MsgBox('警告', errMsgList, 'red'); return false; }
    return true;
}
/*====[檢核類]_End=============================*/

///*==[資料處理類]_Start=======================*/
//處理_get
function get(sUrl_1, sUrl_2) {
    var objdata;
    $.ajax
    ({
        type: "GET",
        url: _strDXPUrl + sUrl_1 + "/v1/" + sUrl_2,
        async: false,
        contentType: 'application/json',    // 發送數據到服務器時所使用的內容類型        
        dataType: "json",                   // 服務器響應的數據類型
        beforeSend: function (xhr) {
            // 使用qa/qa賬戶登錄
            xhr.setRequestHeader("Authorization", "Basic cWE6cWE=");
        },
        success: function (data) {
            //console.log(data);
            objdata = data;
            //$('#t1').val(JSON.stringify(data));
            //alert("Success");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('XMLHttpRequest.status:' + XMLHttpRequest.status + ', XMLHttpRequest.readyState:' +
                XMLHttpRequest.readyState + ', textStatus:' + textStatus);
        }
    });
    return objdata;
}
//處理_取級數
function getLevel() {
    consLogDate("--getLevel_Start--");
    /*--===============[必填欄位檢核]處理==============================--*/
    consLogDate("--getLevel_[必填欄位檢核]處理");
    //強制險/任意險檢核
    if ($('#chkMan').prop('checked') == false && $('#chkAny').prop('checked') == false) {
        MsgBox('錯誤', '強制險或任意險必須勾選其一！', 'red'); return false;
    };
    //{要保人及被保險人資料}[客戶類別(被保險人)]
    if (typeof ($('#rdoCTLCustType:checked').val()) == "undefined" || $('#rdoCTLCustType:checked').val() == null) {
        ShowMsgInElm('#rdoCTLCustType', '必填欄位', false);
        $('#rdoCTLCustType').focus(); return false;
    };
    //取級數_必填欄位檢核
    if (!chkObjList($('#iptCTLCustID,#iptCTLBirthday,#selCTLSex,#iptZREGNUM,#iptZCARRY'))) { return false; };
    /*--===============[匯入參數]處理==============================--*/
    consLogDate("--getLevel_[匯入參數]處理");
    //自然人別(0:法人,1:自然人)
    var sCustType = (getObjToVal($('#rdoCTLCustType:checked').val())) == 'P' ? '1' : '0';
    //被保險人生日
    var BirthDay = $('#iptCTLBirthday').val().replace(/[/]/g, "");
    //彙總類別(2:汽車,3:機車)
    var sCarCategory = (_strCategory == 'C') ? '2' : (_strCategory == 'M') ? '3' : '';
    var InsuredFromDay = "" //保險起保日
    var forcelevel = "";    //強制等級
    var drunkfreq = "";     //酒次
    var bodyfactor = "";    //體係
    var dutyfactor = "";    //責係
    var MOTInfo_Arr = {     //匯入參數
        modeCode: "IWSA01"                      //查詢種類
        , QueryNO: "000000000"                  //Client查詢序號
        , CustType: sCustType                   //自然人別(0:法人,1:自然人)
        , QueryType: "N"                        //查詢類別(N:其他,R:續保)
        , CustID: $("#iptCTLCustID").val()      //身分證號碼(被保險人ID)
        , BirthYear: BirthDay.substr(0, 4)   //出生年
        , BirthMonth: BirthDay.substr(4, 2)  //出生月
        , BirthDay: BirthDay.substr(6, 2)    //出生日
        , Sex: $('#selCTLSex').val()            //性別(1-Male,2-Female)
        , LicenseNo: $("#iptZREGNUM").val()     //牌照
        , CarType: $('#selMVPZMTYPE').val()     //車種代碼
        , Load: $('#iptZCARRY').val()           //乘載數量
        , LoadType: _strLoadType                //承載單位(P-人,T-噸)
        , InsuredFromYear: ""                   //保險起保年
        , InsuredFromMonth: ""                  //保險起保月
        , InsuredFromDay: ""                    //保險起保日
        , Category: sCarCategory                //彙總類別(2:汽車,3:機車)
    };
    //$('#iptAnySerialNo,#iptForceSerialNo').val('')    //清空[強制序號][任意序號]
    var result = {};            //回傳結果
    var chkManFlag = false;     //檢核結果
    var chkAnyFlag = false;     //檢核結果
    var msg = "";               //訊息
    var confirmmsg = "";        //確認訊息
    var errmsgAll = "";         //錯誤訊息
    var errobj = "";            //出錯物件
    var sForceSerialNo = "";    //強制序號
    var sAnySerialNo = "";      //任意序號
    var selMANLEVEL = $("#selMANLEVEL");                //[強制等級]
    var iptDrunkFreq = $("#iptDrunkFreq");              //[酒次]
    var iptForceSerialNo = $('#iptForceSerialNo');      //強制序號
    var iptAnySerialNo = $('#iptAnySerialNo');          //任意序號
    var labManGetLevelMsg = $('#labManGetLevelMsg');    //強制錯誤訊息提示
    var labAnyGetLevelMsg = $('#labAnyGetLevelMsg');    //任意錯誤訊息提示
    /*--===============[預設值]處理==============================--*/
    $("#labManGetLevelMsg,#labAnyGetLevelMsg").text('');    //錯誤訊息提示清空
    $('#divQuoteDate').data("MCPInsured", "");
    /*************************************************************************/
    //*--===============[強制險(保發)查詢]處理============================--*//
    /*************************************************************************/
    if ($('#chkMan').prop('checked') && iptForceSerialNo.val() == '') {
        consLogDate("--getLevel_[強制險(保發)查詢]處理");
        //檢核_強制保期(起/迄),車種
        if ($('#selMANMVPZMTYPE').val() == '') { ShowMsgInElm('#selMANMVPZMTYPE', '必填欄位'); $('#selMANMVPZMTYPE').focus(); ctrlDiv(3, "OPEN"); return false; };
        if ($('#iptFRDATES').val() == '') { ShowMsgInElm('#iptFRDATES', '必填欄位'); $('#chkFRDATE1').focus(); return false; };
        if ($('#iptFRDATEE').val() == '') { ShowMsgInElm('#iptFRDATEE', '必填欄位'); $('#chkFRDATE1').focus(); return false; };
        if (!chkDateSE($('#iptFRDATES'), $('#iptFRDATEE'))) { return false; };      ///檢核_強制保期(起/迄)
        /*--===============[強制險(保發)查詢][發送訊息]處理==============================--*/
        consLogDate("--getLevel_[強制險(保發)查詢][發送訊息]處理");
        InsuredFromDay = $('#iptFRDATES').val().replace(/[/]/g, "");        //強制保期(起)
        MOTInfo_Arr.modeCode = "IWSA01";                                    //查詢種類
        MOTInfo_Arr.CarType = _div3.find('#selMANMVPZMTYPE').val();         //強制車種
        MOTInfo_Arr.InsuredFromYear = InsuredFromDay.substring(0, 4);       //保險起保年
        MOTInfo_Arr.InsuredFromMonth = InsuredFromDay.substr(4, 2);         //保險起保月
        MOTInfo_Arr.InsuredFromDay = InsuredFromDay.substr(6, 2);           //保險起保日
        result = getdata("/Quotation/GetWSLevel", { Prod_ID: "wsIWSA01In", MOTInfo_Data: MOTInfo_Arr });
        if (result != null || typeof (result) != "undefined") {
            /*--===============[強制險(保發)查詢][回傳訊息]處理==============================--*/
            consLogDate("--getLevel_[強制險(保發)查詢][回傳訊息]處理");
            if (result.Data.SysMsg != "") { MsgBox('', result.Data.SysMsg, 'orange') };
            //var msg = '';
            if (getObjToVal(selMANLEVEL.val()) == "") { msg += '[強制等級]'; };
            if (getObjToVal(iptDrunkFreq.val()) == "") { msg += '[酒次]'; };
            if (msg != "") { msg = "<BR>若欲計算保費，請自行輸入" + msg; };
            //20190321 UPD BY WS-MICHAEL 原本機車不送保發，改為送出後，只解析[強制險承保記錄]不拋錯誤訊息
            if (result.Data.ForceMsg != "" && sCarCategory != "3") { MsgBox('', '強制險回傳訊息：' + result.Data.ForceMsg + msg, 'orange') };
            if ((result.Data.ForceMsgCode == "000") || (sCarCategory == "3" && result.Data.ForceMsgCode == "X99")) {
                if (sCarCategory != "3") {
                    sForceSerialNo = getObjToVal(result.Data.ForceSerialNo);            //強制序號
                    iptForceSerialNo.val(getObjToVal(result.Data.ForceSerialNo));       //強制序號
                    forcelevel = getObjToVal(result.Data.ForceLevel);                   //強制等級
                    drunkfreq = getObjToVal(result.Data.DrunkFreq);                     //酒次
                    drunkfreq = drunkfreq == "" ? "0" : drunkfreq;
                };
                $('#divQuoteDate').data("ForceInsurEDTo", getObjToVal(result.Data.ForceInsurEDTo));     //關貿回傳_強制保期(迄)
                $('#divQuoteDate').data("MCPInsured", getObjToVal(result.Data.MCPInsured));     //強制險承保記錄
                $('#divQuoteDate').data("MCPClaims", getObjToVal(result.Data.MCPClaims));       //強制險理賠記錄
                $('#divQuoteDate').data("QuyTIITime", getObjToVal(result.Data.QuyTIITime));     //查詢時間
                chkManFlag = true;
            };
        };
        /*--===============[強制險(保發)查詢][回傳值檢核]處理==============================--*/
        if (chkManFlag) {
            var errmsgMan = "";
            /*--===============[強制險(保發)查詢][回傳值檢核](強制等級)處理==============================--*/
            consLogDate("--getLevel_[強制險(保發)查詢][回傳值檢核](強制等級)處理");
            if (forcelevel != '' && forcelevel != selMANLEVEL.val() && selMANLEVEL.val() != '') {
                errobj = "selMANLEVEL";
                msg = "[強制等級]與自保發取回的不一致(" + forcelevel + ")";
                ShowMsgInElm('#' + errobj, msg, true);
                //errmsgMan += msg + "|";
                confirmmsg += msg + "|";
                iptForceSerialNo.val('');     //清空[強制序號]
                $("#labManGetLevelMsg").text($("#labManGetLevelMsg").text() + ' ' + msg);
            } else if (forcelevel != '' && forcelevel != selMANLEVEL.val() && selMANLEVEL.val() == '') {
                selMANLEVEL.val(forcelevel);
            };
            /*--===============[強制險(保發)查詢][回傳值檢核](酒次)處理==============================--*/
            consLogDate("--getLevel_[強制險(保發)查詢][回傳值檢核](酒次)處理");
            if (drunkfreq != '' && drunkfreq != iptDrunkFreq.val() && iptDrunkFreq.val() != '') {
                errobj = "iptDrunkFreq";
                msg = "[酒次]與自保發取回的不一致(" + drunkfreq + ")";
                ShowMsgInElm('#' + errobj, msg, true);
                //errmsgMan += msg + "|";
                confirmmsg += msg + "|";
                iptForceSerialNo.val('');     //清空[強制序號]
                $("#labManGetLevelMsg").text($("#labManGetLevelMsg").text() + ' ' + msg);
            } else if (drunkfreq != '' && drunkfreq != iptDrunkFreq.val() && iptDrunkFreq.val() == '') {
                iptDrunkFreq.val(drunkfreq).blur();
            };
            iptDrunkFreq.blur();
            if (errmsgMan != "") {
                //errmsg = "回傳檢核有誤：\n\r" + errmsg.substring(0, errmsg.length - 1);
                errmsgAll += errmsgMan;
                $('#' + errobj).focus();
                chkManFlag = false;
            };
        };
    } else { chkManFlag = true; };
    /*************************************************************************/
    //*--===============[任意險(關貿)查詢]處理============================--*//
    /*************************************************************************/
    if ($('#chkAny').prop('checked') && iptAnySerialNo.val() == '') {
        if (chkGetLevel()) {
            consLogDate("--getLevel_[任意險(關貿)查詢]處理");
            if ($('#selMVPZMTYPE').val() == '') { ShowMsgInElm('#selMVPZMTYPE', '必填欄位'); $('#selMVPZMTYPE').focus(); ctrlDiv(3, "OPEN"); return false; };
            if ($('#iptCCDATES').val() == '') { ShowMsgInElm('#iptCCDATES', '必填欄位'); $('#chkCCDATE').focus(); return false; };
            if ($('#iptCCDATEE').val() == '') { ShowMsgInElm('#iptCCDATEE', '必填欄位'); $('#chkCCDATE').focus(); return false; };
            if (!chkDateSE($('#iptCCDATES'), $('#iptCCDATEE'))) { return false; };      ///檢核_任意保期(起/迄)
            var selBodyFactor = $('#selBodyFactor');    //*體係*/
            var selDutyFactor = $('#selDutyFactor');    //*責係*/
            /*--===============[任意險(關貿)查詢][發送訊息]處理==============================--*/
            consLogDate("--getLevel_[任意險(關貿)查詢][發送訊息]處理");
            InsuredFromDay = $('#iptCCDATES').val().replace(/[/]/g, "");        //任意保期(起)        
            MOTInfo_Arr.CarType = $('#selMVPZMTYPE').val(); //($('#selMVPZMTYPE').val() == "22") ? '03' : $('#selMVPZMTYPE').val(); //車種代碼  20191129 DEL BY MICHAEL CCF20765
            MOTInfo_Arr.modeCode = "IWS002";                                    //查詢種類
            MOTInfo_Arr.InsuredFromYear = InsuredFromDay.substring(0, 4);       //任意保期(起)_年
            MOTInfo_Arr.InsuredFromMonth = InsuredFromDay.substr(4, 2);         //任意保期(起)_月
            MOTInfo_Arr.InsuredFromDay = InsuredFromDay.substr(6, 2);           //任意保期(起)_日
            result = getdata("/Quotation/GetWSLevel", { Prod_ID: "wsIWS002In", MOTInfo_Data: MOTInfo_Arr });
            if (result != null || typeof (result) != "undefined") {
                /*--===============[任意險(關貿)查詢][回傳訊息]處理==============================--*/
                consLogDate("--getLevel_[任意險(關貿)查詢][回傳訊息]處理");
                var anymsgcode = getObjToVal(result.Data.AnyMsgCode);   //關貿回傳代碼
                if (getObjToVal(result.Data.SysMsg) != "") { MsgBox('', '任意險(關貿)處理訊息：' + result.Data.SysMsg, 'orange') }
                if (getObjToVal(result.Data.AnyMsg) != "" && anymsgcode != "X31" && anymsgcode != "I06") { MsgBox('', '任意險回傳訊息：' + result.Data.AnyMsg, 'orange') }
                if (anymsgcode == "000") {
                    sAnySerialNo = getObjToVal(result.Data.AnySerialNo);                            //任意序號
                    iptAnySerialNo.val(getObjToVal(result.Data.AnySerialNo));                       //任意序號
                    bodyfactor = Number(getObjToVal(result.Data.BodyFactor)).toFixed(2);            //體係
                    dutyfactor = Number(getObjToVal(result.Data.DutyFactor)).toFixed(2);            //責係
                    $('#divQuoteDate').data("NewLevel", getObjToVal(result.Data.NewLevel));         //新等級
                    $('#divQuoteDate').data("OldLevel", getObjToVal(result.Data.OldLevel));         //原等級
                    $('#divQuoteDate').data("Alcohol", getObjToVal(result.Data.Alcohol));           //酒償險加費註記
                    if ($('#divQuoteDate').data("Alcohol") != "00") { insuredAlcohol($('#divQuoteDate').data("Alcohol")); };
                    $('#divQuoteDate').data("TaxiDutyFactor", Number(getObjToVal(result.Data.TaxiDutyFactor)).toFixed(2));       //計程車責係
                    $('#divQuoteDate').data("ThirdInsd", getObjToVal(result.Data.ThirdInsd));       //第三人有無承保
                    $('#divQuoteDate').data("MVPInsured", getObjToVal(result.Data.MVPInsured));     //任意險承保記錄
                    $('#divQuoteDate').data("MVPClaims", getObjToVal(result.Data.MVPClaims));       //任意險理賠記錄
                    $('#divQuoteDate').data("QuyTIITime", getObjToVal(result.Data.QuyTIITime));     //查詢時間
                    $('#divQuoteDate').data("NonClaimYears", getObjToVal(result.Data.NonClaimYears)); //無賠款年度
                    $('#divQuoteDate').data("ThreeYearsClaimCount", getObjToVal(result.Data.ThreeYearsClaimCount)); //三年度賠款次數
                    ///--[計程車責系]特別處理--------------------------------------------------------
                    //20191105 ADD BY MICHAEL 當[任意車種]為15(計程車)的時候，要把[計程車責係]覆蓋到[責係] 20200220 ADD BY MICHAEL 07(營業車小客)
                    if ($('#selMVPZMTYPE').val() == "15" || $('#selMVPZMTYPE').val() == "07") { dutyfactor = $('#divQuoteDate').data("TaxiDutyFactor"); }
                    chkAnyFlag = true;
                };
                if ((anymsgcode == "X31")
                    || (anymsgcode == "I06"
                        && $('#rdoCTLCustType:checked').val() == "C" && $('#iptZREGNUM').val().trim() == ""
                        && getObjToVal($('#iptCCDATES').val()).substring(0, 7).replace(/[/]/g, '') == (getObjToVal($('#selIssueYear').val())) + padLeft(getObjToVal($('#selIssueMonth').val()), 2))) {
                    /**************************************************************************************
                    關貿回傳的錯誤碼為X31時，任意險的查詢序號為系統日+X31(例：20180914X31)
                    被保險人為法人 & 車牌空白 & 發照年月= 承保起日的年月取關貿回傳錯誤訊息
                    I06時，任意險查詢序號為系統日+關貿回傳的錯誤訊息(系統自動處理以下欄位值：車體係數為0，車責係數為0，險種24的係數A為00)
                    ****************************************************************************************/
                    //*--===============[任意險(關貿)查詢][回傳訊息](I06C31)特別處理==============================--*/
                    consLogDate("--getLevel_[任意險(關貿)查詢][回傳訊息](I06C31)特別處理");
                    iptAnySerialNo.val(GetDay('').replace(/[/]/g, '') + anymsgcode);
                    selBodyFactor.val("0.00");	                                //體係
                    selDutyFactor.val("0.00");	                                //責係
                    var dt = $('#tblInsuranceList').DataTable();
                    var s24data = dt.rows().data().filter(function (x) { return x.ZCVRTYPE == '24' });
                    if (s24data.length > 0) {
                        s24data[0].ZFACTORA = "00";
                        CreatInsDT(dt.data());
                    };
                    chkAnyFlag = true;
                };
            };
            //回傳值檢核
            if (chkAnyFlag) {
                /*--===============[任意險(關貿)查詢][回傳值檢核]處理==============================--*/
                var errmsgAny = "";
                /*--===============[任意險(關貿)查詢][回傳值檢核](體係)處理==============================--*/
                if (bodyfactor != '' && bodyfactor != selBodyFactor.val() && selBodyFactor.val() != '') {
                    consLogDate("--getLevel_[任意險(關貿)查詢][回傳值檢核](體係)處理");
                    errobj = "selBodyFactor";
                    msg = "[體係]與自關貿取回的不一致(" + bodyfactor + ")";
                    ShowMsgInElm('#' + errobj, msg, true);
                    //errmsgAny += msg + "|";
                    confirmmsg += msg + "|";
                    iptAnySerialNo.val('');       //清空[任意序號]
                    labAnyGetLevelMsg.text(labAnyGetLevelMsg.text() + ' ' + msg);
                } else if (bodyfactor != '' && bodyfactor != selBodyFactor.val() && selBodyFactor.val() == '') {
                    selBodyFactor.val(bodyfactor);      //帶入關貿回傳內容
                    if (selBodyFactor.val() == "") {
                        //無法帶入時，則提示訊息
                        errobj = "selBodyFactor";
                        msg = "[體係]無法帶入關貿內容(" + bodyfactor + ")，請洽系統管理者！";
                        ShowMsgInElm('#' + errobj, msg, true);
                        errmsgAny += msg + "|";
                        labAnyGetLevelMsg.text(labAnyGetLevelMsg.text() + ' ' + msg);
                    };
                };
                /*--===============[任意險(關貿)查詢][回傳值檢核](責係)處理==============================--*/
                if (dutyfactor != '' && dutyfactor != selDutyFactor.val() && selDutyFactor.val() != '') {
                    consLogDate("--getLevel_[任意險(關貿)查詢][回傳值檢核](責係)處理");
                    errobj = "selDutyFactor";
                    msg = "[責係]與自關貿取回的不一致(" + dutyfactor + ")";
                    ShowMsgInElm('#' + errobj, msg, true);
                    //errmsgAny += msg + "|";
                    confirmmsg += msg + "|";
                    iptAnySerialNo.val('');       //清空[任意序號]
                    labAnyGetLevelMsg.text(labAnyGetLevelMsg.text() + ' ' + msg);
                } else if (dutyfactor != '' && dutyfactor != selDutyFactor.val() && selDutyFactor.val() == '') {
                    selDutyFactor.val(dutyfactor);      //帶入關貿回傳內容
                    if (selDutyFactor.val() == null) {
                        //無法帶入時，則提示訊息
                        errobj = "selDutyFactor";
                        msg = "[責係]無法帶入關貿內容(" + dutyfactor + ")，請洽系統管理者！";
                        ShowMsgInElm('#' + errobj, msg, true);
                        errmsgAny += msg + "|";
                        labAnyGetLevelMsg.text(labAnyGetLevelMsg.text() + ' ' + msg);
                    };
                };
                if (errmsgAny != "") {
                    //errmsg = "回傳檢核有誤：\n\r" + errmsg.substring(0, errmsg.length - 1);
                    errmsgAll += errmsgAny;
                    $('#' + errobj).focus();
                    chkAnyFlag = false;
                }
            };
        } else {
            $('#selBodyFactor').val('0.00');
            $('#selDutyFactor').val('0.00');
        }

    } else { chkAnyFlag = true; };
    /*--===============[回傳檢核有誤]處理==============================--*/
    if (errmsgAll != "") {
        errmsgAll = errmsgAll.substring(0, errmsgAll.length - 1);
        errmsgAll = "回傳檢核有誤：<BR>" + errmsgAll.replace(/[|]/g, "<BR>").replace(/[\n\r]/g, "<BR>");
        MsgBox('', errmsgAll, 'orange');
    };
    /*--===============[確認訊息]處理==============================--*/
    if (confirmmsg != "") {
        errmsgAll = ""; //上面用完了，這裡接著使用，就不用再宣告一個變數
        errmsgAll += "<span style='color:blue;'>各從人因數係數欄位資料與自保發/關貿取得數值不一致！</span>|";
        errmsgAll += "<span style='color:red;'>欲由保發/關貿係數值取代原欄位資料，保費將重新計算，請按 <u>確認</u> 鍵。</span>|";
        errmsgAll += "<span style='color:blue;'>若欲維持相關欄位數值，請按 <u>取消</u> 鍵 ，並請檢附說明文件。</span>|";
        errmsgAll += "說明：|"
        confirmmsg = errmsgAll + confirmmsg;
        confirmmsg = confirmmsg.replace(/[|]/g, "<BR>");
        $.confirm({
            title: '請確認',
            content: confirmmsg,
            type: 'orange',
            typeAnimated: true,
            buttons: {
                ok: {
                    text: '確認',
                    btnClass: 'btn-blue',
                    action: function () {         /*--[確認]---*/
                        //[強制等級]處理
                        if (forcelevel != "" && forcelevel != selMANLEVEL.val()) { selMANLEVEL.val(forcelevel); };
                        //[酒次]處理
                        if (drunkfreq != "" && drunkfreq != iptDrunkFreq.val()) { iptDrunkFreq.val(drunkfreq).blur(); };
                        //[體係]處理
                        if (bodyfactor != "" && bodyfactor != selBodyFactor.val()) { selBodyFactor.val(bodyfactor); };
                        //[責係]處理
                        if (dutyfactor != "" && dutyfactor != selDutyFactor.val()) { selDutyFactor.val(dutyfactor); };
                        //[強制序號]處理
                        if (sForceSerialNo != "" && iptForceSerialNo.val() == "") { iptForceSerialNo.val(sForceSerialNo); };
                        //[任意序號]處理
                        if (sAnySerialNo != "" && iptAnySerialNo.val() == "") { iptAnySerialNo.val(sAnySerialNo); };
                        //清空[強制險]訊息
                        labManGetLevelMsg.text('');
                        //清空[任意險]訊息
                        labAnyGetLevelMsg.text('');
                        //清空[險種資料]保險費
                        clrInsTBPremium();
                        //清空警告訊息
                        removeMsgObjList($('#selMANLEVEL,#iptDrunkFreq,#selBodyFactor,#selDutyFactor'))
                        //重新[計算保費]
                        $('#btnCalPre').click();
                    }
                },
                close: {
                    text: '取消',
                    btnClass: 'btn-with',
                    action: function () { }
                },
            },
            columnClass: 'col-lg-offset-3 col-lg-5 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-7'
        });
    };
    consLogDate("--getLevel_End--");
    return (chkManFlag && chkAnyFlag);
};
//處理_險種資料相關資料處理
function insuredDT() {
    var dt = $('#tblInsuranceList').DataTable();
    /*--===============[更新險種名稱]_處理===========================--*/
    //_div4.find('#selDepRate').val('');  //預設為空 20190425 ADD BY WS-MICHAEL(若無則清空[折舊率])
    var sZcvrTypeList = '';
    $.each(dt.data(), function (i, item) {
        //更新險種名稱
        //item.ZCVRTYPENM = getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', item.ZCVRTYPE);
        //記錄目前險種清單
        sZcvrTypeList += getObjToVal(item.ZCVRTYPE) + '|';
        //更新[折舊率](若有車體/竊盜險，則折舊率同時自動default 帶15%)。20190425 ADD BY WS-MICHAEL(若無則清空[折舊率])
        if (_strThiefInsList.indexOf(getObjToVal(item.ZCVRTYPE).substring(0, 2)) > -1 && _div4.find('#selDepRate').val().trim() == '') {
            _div4.find('#selDepRate').val('A');
        };
    });
    $('#divQuoteDate').data("ZcvrTypeList", sZcvrTypeList); //險種清單
    CreatInsDT(dt.data());
    /*--===============[保險費]欄位加總_處理=========================--*/
    var MVPPREMSum = dt.rows().data().map(function (x) { return x.MVPPREM });
    //當[付款方式]為"分期付款"，則加總[月繳年保費]欄位的金額
    if ($('#selPAYWAY').val() == "C012") { MVPPREMSum = dt.rows().data().map(function (x) { return x.InsMonth }); };
    MVPPREMSum = MVPPREMSum.length > 0 ? MVPPREMSum.reduce(function (x, y) { return parseInt(x) + parseInt(y) }) : 0;
    $('#iptTotalInsurance').val(Comma(parseInt(MVPPREMSum)));
    /*--===============[限駕險種]_處理==============================--*/
    var agrdrinum = "";
    //查詢[限駕險種]參數一
    dt.rows().data().map(function (x) {
        if (getObjToVal($('#divQuoteDate').data("InsAgrList")).indexOf(x.ZCVRTYPE) > -1) {  //[限駕險種]清單
            agrdrinum = x.ZFACTORA; return;
        };
    });
    if (agrdrinum != '') {
        //若有:則依照[參數一]限制必填欄位
        for (let i = 1; i <= parseInt(agrdrinum) ; i++) {
            _div5.find('#iptAGRDRI0' + parseInt(i).toString()).parent().show();
        };
    } else {
        //若無:則取消必填欄位
        _div5.find('#iptAGRDRI01,#iptAGRDRI02,#iptAGRDRI03,#iptAGRDRI04,#iptAGRDRI05').parent().hide();
    };
    /*--===============[受益人險種]_處理============================--*/
    _div5.find("#selBenZCVRTYPE").empty();   //[受益人險種]清空
    dt.rows().data().map(function (x) {
        if (getObjToVal(_strBenList).indexOf(x.ZCVRTYPE) > -1) {
            _div5.find("#selBenZCVRTYPE").append($('<option></option>').val(x.ZCVRTYPE).text(x.ZCVRTYPE + ' - ' + getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', x.ZCVRTYPE)));
        };
    });
    if (_div5.find("select#selBenZCVRTYPE option").length == 0) {    //若[受益人]對應險種清單為空時
        if ($('#tblBeneList').DataTable().data().length > 0) {
            CreatBenDT([]); //清空[受益人資料]
        };
        _div5.find('#chkBen').prop('checked', false).change();
    };
    /*--===============[設定舊值]_處理==============================--*/
    $('.oldval').each(function (i, item) { $(item).attr('oldval', $(item).val()); });
}
//處理_險種24取級數後特別處理(酒償險加費註記)
function insuredAlcohol(alcohol) {
    var dt = $('#tblInsuranceList').DataTable();
    var isChang = false;
    $.each(dt.rows().data(), function (i, item) {
        if (item.ZCVRTYPE == "24") {
            item.ZFACTORA = alcohol;
            isChang = true;
        }
    });
    if (isChang) {
        CreatInsDT(dt.data());
    }
}
//處理_發送mqQuotation(skind:類別(1:計算保費,2:新增報價,3:修改報價,4:刪除報價))(sKindType:檢核類別(1:步驟一檢核,2:步驟一檢核....))<================
function mqQuotation(skind, sKindType) {
    var funstime = Date.now();
    consLogDate("--mqQuotation_Start--");
    sKindType = getObjToVal(sKindType);
    //if (sKindType != '') { return true; };  //---test記得註解    
    /*--===============[報價單資料]讀取============================--*/
    consLogDate("--mqQuotation_[報價單資料]讀取");
    var QUOT_Arr = getQuotData();
    //報價單資料_強制險
    if ($('#chkMan').prop('checked')) {
        consLogDate("--mqQuotation_[報價單(強制險)資料]讀取");
        QUOT_Arr = $.extend({}, QUOT_Arr, getForceData());
        if (skind == '1') {     //[試算]的時候將[強制保費]歸0
            QUOT_Arr.ForceInsurance = "0";     /*強制保費*/
        };
    };
    //報價單資料_任意險
    if ($('#chkAny').prop('checked')) {
        consLogDate("--mqQuotation_[報價單(任意險)資料]讀取");
        QUOT_Arr = $.extend({}, QUOT_Arr, getAnyData());
    };
    //單獨承保強制險(如果為單強，則同更新至任意[車種][保險起迄日期])
    ////if (getObjToVal(QUOT_Arr.QuotType) == "MCP") {
    ////    QUOT_Arr.AnyCarType = QUOT_Arr.ForceCarType;            //車種
    ////    QUOT_Arr.AnyInsuredFrom = QUOT_Arr.ForceInsuredFrom;    //保險起日
    ////    QUOT_Arr.AnyInsuredTo = QUOT_Arr.ForceInsuredTo;        //保險迄日
    ////};
    //第三步驟檢核_特別處理(當單獨選擇[強制車種]時，則把車種帶入[任意車種]送檢核)
    if (sKindType == "3" && _div3.find('#selMVPZMTYPE').val() == "") {
        QUOT_Arr.AnyCarType = _div3.find('#selMANMVPZMTYPE').val();
        //強制22車種特別處理
        if (QUOT_Arr.AnyCarType == '22') {
            var selMVPZMTYPE = $('#selMVPZMTYPE');
            selMVPZMTYPE.val('22')
            if (selMVPZMTYPE.val() == null) {
                selMVPZMTYPE.val('')
                QUOT_Arr.AnyCarType = '03';
            }
        }
        //[製造年]處理(因為單強時，[製造年]可以不輸入，但是會發生錯誤!所以將[發照年]代入[製造年])
        if (_div3.find('#selYRMANF').val() == "") {
            QUOT_Arr.MakeYear = _div3.find('#selIssueYear').val();
        };
    };
    //陣列處理
    QUOT_Arr = [QUOT_Arr];
    /*--===============[險種資料]讀取==============================--*/
    consLogDate("--mqQuotation_[險種資料]讀取");
    var INS_Arr = JSON.parse(JSON.stringify($('#tblInsuranceList').DataTable().data().toArray()));
    /*--===============[車體/竊盜保額]讀取&[保費]處理==============--*/
    var dtcsum = "";
    $.each(INS_Arr, function (i, item) {
        if (skind == '1') {     //[試算]的時候將[保費]歸0
            item.MVPPREM = "0";     /*保險費*/
            item.InsMonth = "0";    /*月繳保費*/
            //20190227 DEL BY WS-MICHAEL 因為秀琴說:USER會自己調整[保額一]的值，所以不得清為0
            //if (_strThiefInsList.indexOf(getObjToVal(item.ZCVRTYPE).substring(0, 2)) > -1) {
            //    item.SUMINA = "0";      /*保額一清空*/
            //};
        };
        if (_strThiefInsList.indexOf(getObjToVal(item.ZCVRTYPE).substring(0, 2)) > -1) { dtcsum = item.SUMINA; };
    });
    /*--===============[客戶資料]讀取==============================--*/
    consLogDate("--mqQuotation_[客戶資料]讀取");
    var Cust_Arr = getCustData();
    /*--===============[受益人資料]讀取============================--*/
    consLogDate("--mqQuotation_[受益人資料]讀取");
    var BEN_Arr = getBenData();
    /*--===============[約定駕駛人資料]讀取========================--*/
    consLogDate("--mqQuotation_[約定駕駛人資料]讀取");
    var ADI_Arr = getAgreeDriverData();
    /*--===============[約定駕駛人資料]讀取========================--*/
    consLogDate("--mqQuotation_[報價單其他係數]讀取");
    var Other_Arr = getQuotOtherData();
    /*--===============[MQ發送]處理================================--*/
    //return true;    //test---------
    consLogDate("--mqQuotation_[MQ發送]處理");
    var sMQModeDesc = (skind == "1") ? "計算" : "確定";
    var param = {
        sKIND: skind, sKINDTYPE: sKindType, sDTCSUM: dtcsum, QUOT_Data: QUOT_Arr, Cust_Data: Cust_Arr
        , INS_Data: INS_Arr, BEN_Data: BEN_Arr, ADI_Data: ADI_Arr
        , Other_Data: Other_Arr
    };
    var result = getdata("/Quotation/SendMQQuotation", param);      //發送MQ
    if (result != null || typeof (result) != "undefined" || result.length > 0) {
        var errmsg = "";    /*錯誤訊息*/
        //--[MQ回傳訊息](險種)處理-------------------------
        consLogDate("--mqQuotation_[MQ回傳訊息]處理");
        errmsg = getObjToVal(result.Data.SendMQERRER);          //發送失敗訊息
        if (errmsg != "") { MsgBox('錯誤', errmsg, 'red'); return "err"; };
        var sInsDesc = getObjToVal(result.Data.INSDESC);      //險種回傳訊息
        if (sInsDesc == "") { MsgBox('錯誤', "AS400無回傳訊息，請重新" + sMQModeDesc + "！", 'red'); return "err"; };
        //--[MQ回傳訊息](錯誤碼)處理-------------------------
        consLogDate("--mqQuotation_[MQ回傳訊息](錯誤碼)處理");
        var errlist = getObjToVal(result.Data.ERRER).split("|||");      //
        var errArr = []     //錯誤訊息陣列
        $.each(errlist, function (i, item) {
            var errArr2 = errlist[i].split("~|~");
            if (getObjToVal(errArr2[0]).trim() != "" && getObjToVal(errArr2[0]).trim() != "00") {
                errArr.push({
                    ERRDESC: getObjToVal(errArr2[1])     //錯誤說明
                });
            };
        });
        $.each(errArr, function (i, item) {
            errmsg += item.ERRDESC + "|";
        });
        if (errmsg != "") {
            errmsg = errmsg.substring(0, errmsg.length - 1);
            errmsg = errmsg.replace(/[|]/g, "<BR>");
            MsgBox('AS400錯誤', errmsg, 'red'); return "err";
        };
        if (skind == "1") {
            var dtcsum = parseInt(getObjToVal(result.Data.DTCSUM));         //車體保額
            if (isNaN(dtcsum)) { dtcsum = 0; };
            //強制險_處理
            if ($('#chkMan').prop('checked')) {
                //--[MQ回傳訊息](獎金,優惠金額)(試算模式)處理-------------------------
                consLogDate("--mqQuotation_[MQ回傳訊息](獎金,優惠金額)(試算模式)處理");
                if (sKindType == '') {  //[步驟檢核]時不處理更新動作
                    //[強制險保費]_更新處理
                    var mcpprem = parseInt(getObjToVal(result.Data.MCPPREM));
                    if (!isNaN(mcpprem)) { $('#iptMANZPREM').val(parseInt(mcpprem)).blur(); }
                    else { $('#iptMANZPREM').val(""); };
                    //[獎金代號]_更新處理
                    var mcpbcode = getObjToVal(result.Data.MCPBCODE);               //獎金代號                
                    $("#selBONUS").val(mcpbcode);
                    $("#iptBONUS").val($('#selBONUS').find('option[value="' + mcpbcode + '"]')[0].text);
                };
                //佣金代號(暫不使用)
                var mvpbcode = getObjToVal(result.Data.MVPBCODE);
                //[優惠金額]_檢核(比對優惠金額有無超過上限)
                var mcpdisamt = parseInt(getObjToVal(result.Data.MCPDISAMT));             //優惠金額上限
                if (isNaN(mcpdisamt)) { mcpdisamt = 0; };
                if (mcpdisamt > 0) {
                    var ispecial = parseInt($("#iptSPECIAL").val().replace(/[$,]/g, ""));
                    if (!isNaN(ispecial)) {
                        if (ispecial > mcpdisamt) {
                            errmsg += "優惠金額應調整為" + mcpdisamt + "以下，請修正！|";
                        };
                    };
                };
                //錯誤訊息處理
                if (errmsg.length > 0) {
                    errmsg = errmsg.substring(0, errmsg.length - 1);
                    errmsg = errmsg.replace(/[|]/g, "<BR>");
                    MsgBox('錯誤', errmsg, 'red'); return "err";
                };
            };
            //--[MQ回傳訊息](險種)(試算模式)處理-------------------------
            consLogDate("--mqQuotation_[MQ回傳訊息](險種)(試算模式)處理");
            /*險種資料處理*/
            var inslist = sInsDesc.split("|||");
            var insArr = [];
            $.each(inslist, function (i, item) {
                //console.log(inslist[i]);
                inslist2 = inslist[i].split("~|~");
                if (getObjToVal(inslist2[0]).trim() != "") {
                    insArr.push({
                        ZCVRTYPE: getObjToVal(inslist2[0])      //險種別
                        , MVPPREM: getObjToVal(inslist2[1])     //實收保費
                        , MONAMT: getObjToVal(inslist2[2])      //月繳年保費
                        , ERROR: getObjToVal(inslist2[3])       //錯誤碼
                        , ERRDESC: getObjToVal(inslist2[4])     //錯誤說明
                    });
                };
            });
            //險種錯誤代碼處理
            var errArr = $.grep(insArr, function (x) { return x.ERRDESC.trim() != "" });
            $.each(errArr, function (i, item) {
                errmsg += "險種[" + item.ZCVRTYPE + "]" + item.ERRDESC;
            });
            if (errmsg.length > 0) {
                errmsg = errmsg.substring(0, errmsg.length - 1);
                errmsg = errmsg.replace(/[|]/g, "<BR>");
                MsgBox('AS400錯誤', errmsg, 'red'); return "err";
            };
            //更新[險種內容](保費,月繳保費,保額一)([步驟檢核]時不處理更新動作)
            if (sKindType == '') {
                let strPassInsList = "91|92|93|94"; //針對險種91/92/93/94的保額不回壓 20190425 BY ADD WS-MICHAEL
                var dt = $('#tblInsuranceList').DataTable();
                $.each(dt.data(), function (i, item) {
                    $.each(insArr, function (j, jitem) {
                        if (item.ZCVRTYPE.substr(0, 2) == jitem.ZCVRTYPE) {
                            item.MVPPREM = jitem.MVPPREM;
                            item.InsMonth = jitem.MONAMT;
                            if (_strThiefInsList.indexOf(getObjToVal(item.ZCVRTYPE).substring(0, 2)) > -1       //如果為車體竊盜險，則更新[保額一]
                                && strPassInsList.indexOf(getObjToVal(item.ZCVRTYPE).substring(0, 2)) == -1) {   //如果為91/92/93/94的保額不回壓[保額一]
                                item.SUMINA = dtcsum;
                            };
                        };
                    });
                });
                //CreatInsDT(dt.data());
                insuredDT();    //處理_險種資料相關資料處理
                $('#labDraggingMsg').text((getObjToVal(result.Data.RDSDASSIST) == "0") ? '不符合贈送拖吊資格' : '');     //判斷顯示此台車是否有贈送拖吊
            };
        };
        _strZautclsMail = getObjToVal(result.Data.ZAUTCLSMAIL)
        consLogDate("--mqQuotation_End--", funstime);
        if (skind == "1") { return ""; }                                                //如果為[計算]則直接跳離
        else { return getObjToVal(result.Data.CESSIONO).replace("undefined", ""); };    //如果為[確定]則回傳400單號
    } else { MsgBox('錯誤', "AS400無回傳訊息，請重新" + sMQModeDesc + "！", 'red'); return "err"; };
};
//處理_熱門廠型
function setHotCar(dt) {
    var str = "";
    str = '<optgroup label="熱門廠型">';
    for (let i = 0 ; i < dt.length; i++) {
        str += '<option value="' + dt[i].VALUE + '">' + dt[i].VALUE + ' - ' + dt[i].TEXT + '</option>';
    };
    str += '</optgroup>';
    return str;
};
//處理_格式化金額單位
function formatAmount(val) {
    let formatAmount = '';
    if (val / 10000 >= 1) {
        formatAmount = Comma(val / 10000, true).toString() + '萬';
    }
    else if (val / 1000 >= 1) {
        formatAmount = (val / 1000).toString() + '仟';
    }
    else formatAmount = val;
    return formatAmount;
}
/*====[資料處理類]_End=========================*/

///*==[讀取類]_Start===========================*/
//讀取_招攬機構資料
function getPolicyProducerData() {
    //var estxt = encodeBase64('qa:qa');
    var datas = get("agent", "agencies?channelCd=agency");
    console.log(datas);
    var objddl = "#selPolicyProducer";
    $(objddl).append($('<option></option>').val('').text(''));
    var OptionHtml = "";
    datas.map(function (data) {
        OptionHtml += "<option value='" + data.code + "'>" + data.name + "</option>"
    })
    $(objddl).append(OptionHtml);
}
//讀取_頁面報價單資料
function getQuotData() {
    var divQD = $('#divQuoteDate');
    var QuyTIITime = getObjToVal(divQD.data("QuyTIITime"));
    if (QuyTIITime == "") {
        var dt = new Date();
        QuyTIITime = dt.getFullYear().toString()
        + padLeft((dt.getMonth() + 1), 2)
        + padLeft(dt.getDate(), 2)
        + padLeft(dt.getHours(), 2)
        + padLeft(dt.getMinutes(), 2)
        + padLeft(dt.getSeconds(), 2);
    };
    //[CC數]特別處理
    let icc = _div3.find('#iptZCC').val().replace(/[,]/g, "");
    if (icc.indexOf('.') > -1) {
        _div3.find('#iptZCC').val(Math.floor(icc));
        icc = Math.floor(icc);
    };
    var retdata = {
        QuotNo: $("#iptQUOTENO").val()                                          //報價單號碼
        , QuotDate: $("#iptQuotDate").val().replace(/[/]/g, "")                 //報價單日期
        , QuotNo_400: divQD.data("QuotNo_400")                                  //400報價單號碼
        , AgentNo: $("#selAGNTNUM").val()                                       //經手人代碼
        , AgentName: $("#iptAGNTNAME").val()                                    //經手人名稱
        , AgentType: divQD.data("AgentType")                                    //經手人類別
        , AgentSalesName: divQD.data("AgentSalesName")                          //業務員名稱
        , BranchNo: $("#iptBranchNo").val()                                     //單位別
        , LifeNo: $("#iptCNTBRANCH").val()                                      //編號(壽險通路)
        , SalesmanRegNo: $('#iptSalesmanRegNo').val()                   		//業務員登錄字號
        , CHL1: divQD.data("CHL_Code")                                          //通路別1
        , CHL2: $("#selCHL2").val()                                             //通路別2
        , Payway: $("#selPAYWAY").val()                                         //付款方式
        , Paytype: divQD.data("Paytype")                                        //繳別
        , AmwayNo: $("#iptAmwayNo").val()                                       //編號(大保單號碼/安麗直銷商)
        , PrnWayNo: $("#selPrnWayNo").val()                                     //編號(收費單列印方式)
        , ProposerID: $("#iptAPLCustID").val()                                  //要保人ID
        , APL_CLNTNUM: $("#iptAPL_CLNTNUM").val()                               //要保人客戶代號
        , ToInsuredRelation: $("#selRELA").val()                                //與被保險人關係
        , InsuredID: $('#iptCTLCustID').val()	                                //被保險人ID
        , CTL_CLNTNUM: $('#iptCTL_CLNTNUM').val()	                            //被保險人客戶代號
        , AddInsured: $('#iptAddIns').val()	                                    //附加被保險人
        , Mortgage: $('#iptMortgage').val()	                                    //抵押權人
        , CarTypeNo: $('#selZMAKE').val()	                                    //廠型
        , AnyCarType: $('#selMVPZMTYPE').val()	                                //任意車種
        , MakeYear: $('#selYRMANF').val() + padLeft($('#selMNMANF').val(), 2)   //製造年月
        //, MakeYear: $('#selYRMANF').val()	                                    //製造年
        , CarPrice: $('#iptRESETPRICE').val().replace(/[$,]/g, "")	            //重置價格
        , LicenseNo: $('#iptZREGNUM').val()	                                    //牌照
        , Load: $('#iptZCARRY').val()	                                        //乘載(人/噸)
        , Displacement: icc //$('#iptZCC').val().replace(/[,]/g, "")	                //排氣量
        , IssueYear: $('#selIssueYear').val() + padLeft($('#selIssueMonth').val(), 2)	    //發照年月
        , EngineNo: $('#iptEngineNo').val()	                                    //引擎號碼
        , Record: $('#txtRecords').val()	                                    //記錄
        , CalCode: $('#selCalCode').val()	                                    //計算
        , VendorNo: $('#selVendorNo').val()	                                    //車商代碼(經銷商)
        , VendorSalesNo: $('#iptVendorSalesNo').val()	                        //車商代碼(經銷商業務員編號)
        , QuotType: divQD.data("QuotType")                                      //保單別
        , ProgramCode: $('#selProgramCode').val()                               //活動代碼
        , DepRate: $('#selDepRate').val()	                                    //折舊率
        , TotalInsurance: $('#iptTotalInsurance').val().replace(/[$,]/g, "")    //總保費
        , AgeFactor: divQD.data("AgeFactor")                                    //年齡係數
        , IsConfirm: 'N'                                                        //是否確定報價(預設為N:暫存資料)
        , VerifyStatus: divQD.data("VerifyStatus")                              //核保狀態
        , NewLevel: divQD.data("NewLevel")                                      //新等級
        , OldLevel: divQD.data("OldLevel")                                      //原等級
        , IncFactor: divQD.data("Alcohol")                                      //酒償險加費註記
        , TaxiDutyFactor: divQD.data("TaxiDutyFactor")                          //計程車責係
        , ThirdInsd: divQD.data("ThirdInsd")                                    //第三人有無承保
        , PolicyNo: $('#iptPOLNUM').val()                                       //保單號碼/上年度保單號碼
        , ForceNo: $('#iptOLDPOLNUM').val()                                     //舊保險證號/上年度強制證號
        , MCPInsured: divQD.data("MCPInsured")                                  //強制險承保記錄
        , MCPClaims: divQD.data("MCPClaims")                                    //強制險理賠記錄
        , MVPInsured: divQD.data("MVPInsured")                                  //任意險承保記錄
        , MVPClaims: divQD.data("MVPClaims")                                    //任意險理賠記錄
        , QuyTIITime: QuyTIITime                                                //查詢時間
        , SalesNo: divQD.data("SalesNo")	                                    //服務代碼/業務代號
        , GenareaNM: $('#iptGenareaNM').val()	                                //服務人員
        , AgentTEL: $('#iptAgentTEL').val()	                                    //服務電話
        , AgentFAX: $('#iptAgentFAX').val()	                                    //服務傳真
        , ServiceMail: $('#iptAgentEMail').val()	                            //服務Email
        , TollClterNo: $('#iptTollClterNo').val()	                            //收費員代號
        , TollClterID: divQD.data("TOLLCLTERID")	                            //收費員ID
        , TollClterName: divQD.data("TOLLCLTERNAME")	                        //收費員名稱
        , TollClterRegNo: divQD.data("TOLLCLTERREGNO")	                        //收費員登錄證號
        , ProjectNo: $('#iptProjectNo').val()	                                //專案代號
        , ZautclsMail: _strZautclsMail	                                        //核保人員EMail
        , UserName: $('#hidagentName').val()	                                //登入者名稱/報價人員
    };
    return retdata;
}
//讀取_(頁面)要保人/被保險人資料
function getCustData() {
    var retdata = [];
    //(要保人資料)
    var sCustType = $('input[name=rdoAPLCustType]:checked').val();
    var sBirthday = (sCustType == 'C') ? '' : getObjToVal($("#iptAPLBirthday").val()).replace(/[/]/g, "");
    var sSex = (sCustType == 'C') ? '' : getObjToVal($("#selAPLSex").val());
    var sMarriage = (sCustType == 'C') ? '' : getObjToVal($("#selAPLMarriage").val());
    var sRepresentative = (sCustType == 'P') ? '' : getObjToVal($("#iptAPLRepresentative").val());
    retdata.push({
        CustID: $("#iptAPLCustID").val()                                //要保人ID
        , CLNTNUM: $('#iptAPL_CLNTNUM').val()	                        //要保人客戶代號
        , CustType: sCustType                                           //客戶類別
        , Nation: $("#selAPLNation").val()                              //國籍
        , Representative: sRepresentative                               //代表人
        , Birthday: sBirthday                                           //生日
        , Name: $("#iptAPLName").val()                                  //姓名
        , Sex: sSex                                                     //性別
        , Marriage: sMarriage                                           //婚姻
        , City: $("#selAPLADD1").val()                                  //縣市別
        , Zipcode: $("#selAPLADD2").val()                               //區別
        , Addr: $("#iptAPLADDO").val()                                  //地址
        , Email: $("#iptAPLEmail").val()                                //e-mail
        , OfficeTel: $("#iptAPLOfficeTel").val()                        //公司電話
        , HomeTel: $("#iptAPLHomeTel").val()                            //家用電話
        , CellPhone: $("#iptAPLCellPhone").val()                        //手機號碼
        , Fax: $("#iptAPLFax").val()                                    //傳真號碼
        , AgentNo: $("#selAGNTNUM").val()                               //經手人代號
        , DataType: "A"                                                 //資料類別(A:要保人,C:被保險人)
        , Memo: ""                                                      //備註
    });
    //(被保險人資料)
    sCustType = $('input[name=rdoCTLCustType]:checked').val();
    sBirthday = (sCustType == 'C') ? '' : getObjToVal($("#iptCTLBirthday").val()).replace(/[/]/g, "");
    sSex = (sCustType == 'C') ? '' : getObjToVal($("#selCTLSex").val());
    sMarriage = (sCustType == 'C') ? '' : getObjToVal($("#selCTLMarriage").val());
    sRepresentative = (sCustType == 'P') ? '' : getObjToVal($("#iptCTLRepresentative").val());
    retdata.push({
        CustID: $("#iptCTLCustID").val()                                //被保險人ID
        , CLNTNUM: $('#iptCTL_CLNTNUM').val()	                        //被保險人客戶代號
        , CustType: sCustType                                           //客戶類別
        , Nation: $("#selCTLNation").val()                              //國籍
        , Representative: sRepresentative                               //代表人
        , Birthday: sBirthday                                           //生日
        , Name: $("#iptCTLName").val()                                  //姓名
        , Sex: sSex                                                     //性別
        , Marriage: sMarriage                                           //婚姻
        , City: $("#selCTLADD1").val()                                  //縣市別
        , Zipcode: $("#selCTLADD2").val()                               //區別
        , Addr: $("#iptCTLADDO").val()                                  //地址
        , Email: $("#iptCTLEmail").val()                                //e-mail
        , OfficeTel: $("#iptCTLOfficeTel").val()                        //公司電話
        , HomeTel: $("#iptCTLHomeTel").val()                            //家用電話
        , CellPhone: $("#iptCTLCellPhone").val()                        //手機號碼
        , Fax: $("#iptCTLFax").val()                                    //傳真號碼
        , AgentNo: $("#selAGNTNUM").val()                               //經手人代號
        , DataType: "C"                                                 //資料類別(A:要保人,C:被保險人)
        , Memo: ""                                                      //備註
    });
    return retdata;
}
//讀取_(頁面)強制險資料
function getForceData() {
    var mcpprem = parseInt(getObjToVal($('#iptMANZPREM').val().replace(/[$,]/g, "")));         //強制險保費
    if (isNaN(mcpprem)) { mcpprem = "0"; };
    var retdata = {
        ForceInsuredFrom: $('#iptFRDATES').val().replace(/[/]/g, "")	        //強制起保日
        , ForceInsuredTo: $('#iptFRDATEE').val().replace(/[/]/g, "")	        //強制迄止日
        , ForceCarType: $('#selMANMVPZMTYPE').val()	                            //強制車種
        , ForceLevel: $('#selMANLEVEL').val()	                                //強制等級
        , ForceInsurance: mcpprem                                               //強制保費
        , ForceOffer: $('#iptSPECIAL').val().replace(/[$,]/g, "")	            //強制優惠
        , ForceBonusCode: $('#selBONUS').val()	                                //獎金代號
        , DrunkFreq: $('#iptDrunkFreq').val()	                                //酒駕次數
        , DrunkAmt: $('#iptDrunkAmt').val().replace(/[$,]/g, "").trim()         //酒駕金額
        , ForceSerialNo: $('#iptForceSerialNo').val()	                        //強制序號
        , IsEMail: ($("#chkEmail").prop("checked") ? "Y" : "")                  //電子式保險證(※如勾選電子式則不另寄紙本)
    };
    return retdata;
}
//讀取_(頁面)任意險資料
function getAnyData() {
    var retdata = {
        AnyInsuredFrom: $('#iptCCDATES').val().replace(/[/]/g, "")	            //任意起保日
        , AnyInsuredTo: $('#iptCCDATEE').val().replace(/[/]/g, "")	            //任意迄止日
        , AnyCarType: $('#selMVPZMTYPE').val()	                                //任意車種
        , BodyFactor: $('#selBodyFactor').val()	                                //體係
        , DutyFactor: $('#selDutyFactor').val()	                                //責係
        , AnySerialNo: $('#iptAnySerialNo').val()	                            //任意序號
        , CalCode: $('#selCalCode').val()	                                    //計算
        , AnyBonusCode: $('#selAnyBonusCode').val()	                            //佣金
    };
    return retdata;
}
//讀取_(頁面)受益人資料
function getBenData() {
    var retdata = [];
    var dt = $('#tblBeneList').DataTable();
    $.each(dt.data(), function (j, jitem) {
        retdata.push({
            InsureType: jitem.ZCVRTYPE           //險種
            , ListDriverID: jitem.MEMBSEL	    //列名駕駛人ID
            , ListDriverName: jitem.ZCNAME	    //列名駕駛人姓名
            , ListDriverBirth: jitem.CLTDOB.replace(/[/]/g, "")	    //列名駕駛人生日
            , ListDriverSex: jitem.CLTSEX	    //列名駕駛人性別
            , ListDriverTel: jitem.TEL	        //列名駕駛人電話
            , ToProposerRelation: jitem.RELA	//列名駕駛人與要保人關係
            , BenfitIsLegal: jitem.LEGAL	    //受益人是否為法定
            , BenfitName: jitem.BenNAME	        //受益人姓名
            , BenfitTel: jitem.BenTEL	        //受益人電話
            , City: jitem.ADD1	                //受益人地址(縣市別)
            , Zipcode: jitem.ADD2	            //受益人地址(區別)
            , Addr: jitem.ADDO	                //受益人地址
            , ToListRelation: jitem.BenRELA	    //與列名駕駛人關係
        });
    });
    return retdata;
}
//讀取_(頁面)約定駕駛人資料
function getAgreeDriverData() {
    var retdata = [];
    retdata.push({
        AgreeDriver1: $('#iptAGRDRI01').val()      //約定駕駛人1
        , AgreeDriver2: $('#iptAGRDRI02').val()    //約定駕駛人2
        , AgreeDriver3: $('#iptAGRDRI03').val()    //約定駕駛人3
        , AgreeDriver4: $('#iptAGRDRI04').val()    //約定駕駛人4
        , AgreeDriver5: $('#iptAGRDRI05').val()    //約定駕駛人5
    });
    return retdata;
}
//讀取_(頁面)報價單其他係數
function getQuotOtherData() {
    var retdata = [];
    retdata.push({
        IsNewPage: ($("#chkNewPageBen").prop("checked") ? "1" : "")      //傷險名冊另起新頁(空白:不另起新頁;1:要另起新頁)
        , IsBilling: ""    //是否要出單(0:不出單; 1:要出單; 由業務人員勾選)
        , Signed: ""       //已簽名(0:未簽名; 1:已簽名; 由系統判斷)
        , CaseNumber: ""    //影像歸檔產出的進件序號
        , PayResult: ""     //繳費結果
        , NonClaimYears: $('#divQuoteDate').data("NonClaimYears")                            //無賠款年度
        , ThreeYearsClaimCount: $('#divQuoteDate').data("ThreeYearsClaimCount")              //三年度賠款次數
    });
    return retdata;
}
//讀取_年齡係數
function getAgeFactor() {
    //被保險人為自然人且車種為03/04/22才計算年齡係數，否則其它狀況年齡係數皆為1
    var SEX = $('#selCTLSex').val();            //被保險人_性別
    var BIRTHDAY = $('#iptCTLBirthday').val();       //被保險人_生日
    var CCDATES = $('#iptCCDATES').val();       //保險起日(預設任意險保險起日)
    var MVPZMTYPE = $('#selMVPZMTYPE').val();   //車種(預設任意險車種)
    var QUOTTYPE = '';                          //保單別(MCP:強制年齡係數,MVP:任意年齡係數一年期,MAE:任意年齡係數二年期)
    var dtIns = $('#tblInsuranceList').DataTable();
    if (dtIns.rows().data().filter(function (x) { if (x.ZCVRTYPE != '21') { return true; } }).length == 0) {
        //if ($('#chkMan').prop('checked') == true && $('#chkAny').prop('checked') == false) {
        QUOTTYPE = "MCP";                           //強制年齡係數
        CCDATES = $('#iptFRDATES').val();           //保險起日(改為強制險起保日)
        MVPZMTYPE = $('#selMVPZMTYPE').val();    //車種(改為強制險車種)    
    }
    else {
        QUOTTYPE = "MVP";           //任意年齡係數一年期
        if ((((Date.parse($('#iptCCDATEE').val())).valueOf()
            - (Date.parse($('#iptCCDATES').val())).valueOf()) / 86400000 / 365) >= 2) {
            QUOTTYPE = "MAE";       //任意年齡係數二年期
        };
    };
    $('#divQuoteDate').data("QuotType", QUOTTYPE);
    if ($('#rdoCTLCustType:checked').val() != 'P') { $('#divQuoteDate').data("AgeFactor", "01000000"); return; };    //不為自然人，不做查詢
    if (('03|04|22').indexOf(MVPZMTYPE) == -1) { $('#divQuoteDate').data("AgeFactor", "01000000"); return; };     //車種不為03/04/22，不做查詢
    var dt = getdata("/Quotation/GetAGEFACTOR", { sSEX: SEX, sBIRTHDAY: BIRTHDAY, sCCDATES: CCDATES, sQUOTTYPE: QUOTTYPE });
    if (dt.length > 0) {
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
            MsgBox('錯誤', dt[0].MSG, 'red');
            return;
        }
        $('#divQuoteDate').data("AgeFactor", dt[0].Factor);
    }
}
//*==[讀取類]_End=============================*/
/******自訂函式_End************************************/
