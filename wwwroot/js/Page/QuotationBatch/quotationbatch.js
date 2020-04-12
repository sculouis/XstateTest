/******系統觸發事件_Start******************************/
//全域變數宣告
var _arrAgentList = [];         //經手人下拉選單資料來源
var _arrAgentData = [];         //經手人,單位別,ID資料
var _arrBatchNoList = [];       //團體件序號下拉選單資料來源
var _arrLoadSysData = [];       //基礎資料
var _strMode = '';              //作業模式(EDIT:修改,TEMP:要保資料輸入,COPY:複製為新件,VIEW:檢視,PROCEED:續保作業,PROCEEDNEW:[續保作業]轉為[新件])
var _strBatchNo = '';           //團體件序號清單
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
        consLogDate("--==InitClick==--");
        InitClick();                //初始化_元件按鈕事件
        consLogDate("--==InitDefault==--");
        InitDefault();              //初始化_預設值
        consLogDate("--==Resize==--");
        $(window).resize();         //畫面調整
        $.unblockUI();
        consLogDate("----==WindowOnload_End(" + Math.floor(parseInt((new Date()) - onloadDate) / 1000) + ":" + padLeft(parseInt((new Date()) - onloadDate) % 1000, 3) + ")==------");
    }, 1);
    batchComplete();
};
//初始化_元件
function InitComp() {
    /*--SDS傳入資料處理---------------------------------------*/
    consLogDate("-==InitComp_SDS傳入資料處理==-");
    //經手人
    var agndata = $('#hidagntnum').val().split(',');
    var branchdata = $('#hidbranchlist').val().split(',');
    var agentIddata = $('#hidagentIdList').val().split(',');
    _arrAgentList = agndata;
    for (let i = 0; i < agndata.length; i++) {
        if (agndata[i].trim() != "") {
            _arrAgentData.push({ AgntNum: agndata[i], Branch: branchdata[i], AgntId: agentIddata[i] });
        };
    };
    /*--基礎資料查詢-------------------------------------------*/
    consLogDate("-==InitComp_基礎資料查詢==-");
    var dtSys = getdata("/Quotation/GetLoadSysData", { sProgCode: 'QUOTATIONBATCH' });                   //查詢[系統載入預設值]相關資訊
    /*--下拉選單初始化-----------------------------------------*/
    consLogDate("-==InitComp_下拉選單初始化");
    setDDL_SYSCODEDT(dtSys, 'T016', '#selPrnWayNo');                                //[編號(2)](大保單號碼2)*/
    setDDL_SYSCODEDT(dtSys, 'VENDORLIST', '#selVendorNo');                          //[車商代碼]*/
    ///團體件序號
    var batchnodata = getdata("/QuotationBatch/GetQuotBatchMaster", { sBatchNo: "", sAmwayNo: "", sAgentNo: "", sBranchNo: "", sCreateDate_S: "", sCreateDate_E: "" });
    for (let i = 0; i < batchnodata.Data.length; i++) {
        if (batchnodata.Data[i].TEXT.trim() != "") {
            _arrBatchNoList.push(batchnodata.Data[i].TEXT);
            _strBatchNo += '<option value="' + batchnodata.Data[i].TEXT + '">' + batchnodata.Data[i].TEXT + '</option>';
        };
    };
    $("#selBatchNo").empty().append('<option value="">請選擇</option>' + _strBatchNo).selectpicker('refresh');
    /*--系統參數設定-------------------------------------------*/
    consLogDate("-==InitComp_系統參數設定==-");
    _arrLoadSysData = dtSys;
    BindSelpikTabEvent();   //初始化 selectpicker tab 鍵事件
    /*--元件底色設定處理---------------------------------------*/
    setTimeout(function () {
        $('#selAGNTNUM,#selBatchNo').parent().find('.dropdown-toggle').attr('style', 'background-image: linear-gradient(to bottom, #fff 0%, #ffffff 100%);');     ///查詢式下拉選單，底色改為白色
        $("#selAGNTNUM,#selBatchNo").selectpicker('refresh');
    }, 50);
    setTimeout(function () {
        $('#iptBatchMail').attr('placeholder', '收件人限定[和泰內部人員](多個收件者，請用";"號區隔)');           //寄送EMail
    }, 70); //因為public.js裡設定50，所以這邊設定要大於50
};
//初始化_元件事件
function InitEvent() {
    ///----===={經手人/業務員資料}區塊_S=================================----
    //[團體件序號]初始化事件
    $("#selBatchNo").SetKeyinFunction({
        waitTime: 500,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            //let data = {};
            e.val(e.val().toUpperCase());
            let data = _arrBatchNoList.filter(function (x) { return x.indexOf(e.val()) > -1 });
            var OptionHtml = '';
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
                $(select).append(_strBatchNo).selectpicker('refresh');
                title.html("查無資料，請重新輸入關鍵字");
            }
        }
    });
    //[經手人]初始化事件
    $("#selAGNTNUM").SetKeyinFunction({
        waitTime: 500,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            e.val(e.val().toUpperCase());
            var OptionHtml = '';
            if (e.val().length > 0) {
                var data = _arrAgentList.filter(function (x) { return x.indexOf(e.val()) > -1 });
                $.each(data, function (index, data) {
                    //搜尋時第一筆資料先暫存
                    SetSelPikFirSearchItem(index, data.VALUE + '~|~' + data.TEXT);
                    OptionHtml += "<option value='" + data + "'>" + data + "</option>"
                });
            };
            var selObj = $(select);
            selObj.append(OptionHtml);
            selObj.selectpicker('refresh');
            title.html("請輸入關鍵字");
        }
    });
    //[團體件序號]選取事件
    $("#selBatchNo").on("change", function () {
        var sVal = getObjToVal($('#selBatchNo').val());
        if (sVal == '') {   //*----清空----*/
            $('#divQuoteDate').data("CHL_Code", "");    //通路別代碼
            $('#divQuoteDate').data("SalesNo", "");     //服務代碼/業務代號
            $('#divQuoteDate').data("AgentType", "");   //經手人類別
            setSelPick("#selAGNTNUM", [], '');                    /*[經手人]*/
            $("#selAGNTNUM").val('').selectpicker('refresh')      /*[經手人]*/
            $('#iptBranchNo').val("");          //單位別
            $('#iptCNTBRANCH').val("");         //業務人員編號 
            $('#iptCHL1').val("").change();     //CHL
            $('#iptAGNTNAME').val("");          //經手人名稱
            $('#selVendorNo').val("");          //車商代碼
            $('#iptVendorSalesNo').val("");     //車商業務員編號
            //--登入者為[收費員]特別處理_S-------------
            if ($('#hidTollClterData').val() == '') {
                $('#iptSalesmanRegNo').val(""); //業務員登錄字號
                $('#iptGenareaNM').val("");     //客服
            };
            //--登入者為[收費員]特別處理_E-------------
            $('#iptAgentTEL').val("");          //電話
            $('#iptAgentFAX').val("");          //傳真
            $('#iptAgentEMail').val("");        //E-MAIL
            $('#iptAmwayNo').val("");           //整批業務編號
            $('#selPrnWayNo').val("");          //編號(收費單列印方式)
            $('#iptBatchMail').val("");         //結果檔接收者E-MAIL
        }
        else {
            var dt = getdata("/QuotationBatch/GetQuotBatchMaster", { sBatchNo: sVal, sAmwayNo: "", sAgentNo: "", sBranchNo: "", sCreateDate_S: "", sCreateDate_E: "" });
            if (dt.Data.length > 0) {
                if (dt.length === 1 && typeof (dt.Data[0].MSG) != "undefined") { MsgBox('錯誤', dt.Data[0].MSG, 'red'); return; }
                $('#divQuoteDate').data("SalesNo", dt.Data[0].ServiceNo);            //服務代碼/業務代號
                $('#divQuoteDate').data("AgentType", dt.Data[0].AgentType);          //經手人類別
                var agentno = getObjToVal(dt.Data[0].AgentNo)
                setSelPick("#selAGNTNUM", [{ VALUE: agentno, TEXT: agentno }], agentno, true);      //經手人
                $('#divQuoteDate').data("CHL_Code", dt.Data[0].CHL1);                //通路別代碼
                $('#iptBranchNo').val(getObjToVal(dt.Data[0].BranchNo));             //單位別
                $('#iptCNTBRANCH').val(getObjToVal(dt.Data[0].LifeNo));              //業務人員編號                
                $('#iptCHL1').val(getObjToVal(dt.Data[0].CHL1) + ' - ' + getObjToVal(dt.Data[0].CHL1DESC)).change();  //CHL
                $('#iptAGNTNAME').val(getObjToVal(dt.Data[0].AgentName));            //經手人名稱
                $('#selVendorNo').val(getObjToVal(dt.Data[0].VendorNo));             //車商代碼
                $('#iptVendorSalesNo').val(getObjToVal(dt.Data[0].VendorSalesNo));   //車商業務員編號
                //--登入者為[收費員]特別處理_S-------------
                $('#iptSalesmanRegNo').val(getObjToVal(dt.Data[0].SalesmanRegNo));   //業務員登錄字號
                $('#iptGenareaNM').val(getObjToVal(dt.Data[0].ServiceName));         //客服
                //--登入者為[收費員]特別處理_E-------------
                $('#iptAgentTEL').val(getObjToVal(dt.Data[0].ServiceTel));           //電話
                $('#iptAgentFAX').val(getObjToVal(dt.Data[0].ServiceFax));           //傳真
                $('#iptAgentEMail').val(getObjToVal(dt.Data[0].ServiceMail));        //E-MAIL
                $('#iptAmwayNo').val(getObjToVal(dt.Data[0].AmwayNo));               //整批業務編號
                $('#selPrnWayNo').val(getObjToVal(dt.Data[0].PrnWayNo));             //編號(收費單列印方式)
                $('#iptBatchMail').val(getObjToVal(dt.Data[0].BatchMail));           //結果檔接收者E-MAIL
            }
        }
    });
    //[經手人]選取事件
    $("#selAGNTNUM").on("change", function () {
        removeMsgInElm('#selAGNTNUM');   ///訊息移除
        var sVal = getObjToVal($('#selAGNTNUM').val());
        if (sVal == '') { return; }
        //--==[單位別][經手人ID]_處理=====================================================--
        consLogDate("--selAGNTNUM_change[單位別][經手人ID]_處理");
        var sAgentId = '';
        var data = _arrAgentData.filter(function (x) { return x.AgntNum == sVal; });
        $.each(data, function (index, data) {
            $('#iptBranchNo').val(getObjToVal(data.Branch));    //單位別
            sAgentId = getObjToVal(data.AgntId);                //經手人ID
        });
        //--==車商代碼_處理================================================================--
        consLogDate("--selAGNTNUM_change[車商代碼]_處理");
        /*經手人代號前2碼為BD者，即為[和安經手人]。為[和安經手人]時才開放[車商代碼]*/
        var isNone = (sVal.substr(0, 2) == 'BD') ? "" : "none";
        $('#selVendorNo,#iptVendorSalesNo').parent().attr('style', 'display:' + isNone).val('');
        /*20190227 UPD BY WS-MICHAEL 當經手人為BD開頭時(車商)，要隱藏[業務人員編號]*/
        var isChtNone = (sVal.substr(0, 2) == 'BD') ? "none" : "";
        $('#iptCNTBRANCH').parent().attr('style', 'display:' + isChtNone).val('');
        //--==查詢資料_處理================================================================--
        consLogDate("--selAGNTNUM_change[查詢資料]_處理");
        var dt = getdata("/Quotation/GetAgntInfo", { KeyWord: sVal, sAgntID: sAgentId });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
            $('#divQuoteDate').data("CHL_Code", dt[0].CHL);                                          //通路別代碼
            $('#divQuoteDate').data("SalesNo", dt[0].SalesNo);                                       //服務代碼/業務代號
            $('#divQuoteDate').data("AgentType", getObjToVal(dt[0].AGTYPE));                         //經手人類別
            $('#iptCHL1').val(getObjToVal(dt[0].CHL) + ' - ' + getObjToVal(dt[0].CHLDESC)).change();    //CHL
            $('#iptAGNTNAME').val(getObjToVal(dt[0].AGNTDESC));                //經手人名稱
            //--登入者為[收費員]特別處理_S-------------
            if ($('#hidTollClterData').val() == '') {
                $('#iptSalesmanRegNo').val(getObjToVal(dt[0].SalesmanRegNo));      //業務員登錄字號
                $('#iptGenareaNM').val(getObjToVal(dt[0].GENAREANM));              //客服
            };
            //--登入者為[收費員]特別處理_E-------------
            $('#iptAgentTEL').val(getObjToVal(dt[0].TEL));                     //電話
            $('#iptAgentFAX').val(getObjToVal(dt[0].FAX));                     //傳真
            $('#iptAgentEMail').val(getObjToVal(dt[0].EMAIL));                 //E-MAIL
            if ($('#iptAgentEMail').val() == "") {
                let AEMailDT = getdata("/Quotation/GetAgntEMail", { sAGNTNUM: $('#selAGNTNUM').val() });
                if (AEMailDT.length > 0) {
                    $('#iptBatchMail').val(getObjToVal(AEMailDT[0].EMAILLIST));    //從T8250取得EMail
                }
            }
            $('#iptBatchMail').val(getObjToVal(dt[0].EMAIL));                  //E-MAIL
        } else {
            $('#divQuoteDate').data("CHL_Code", '');           //通路別代碼
            $('#iptCHL1').val('').change();                    //清空
            $('#iptBranchNo,#iptGenareaNM,#iptAGNTNAME,#iptSalesmanRegNo').val('');
            $('#iptAgentTEL,#iptAgentFAX,#iptAgentEMail,#iptBatchMail').val('');
            ShowMsgInElm('#selAGNTNUM', '查無經手人相關資料');
        };
        //--==[業務人員編號]&[大保單號碼]資料清空_處理================================================================--
        consLogDate("--selAGNTNUM_change[業務人員編號]&[大保單號碼]_處理");
        $('#iptCNTBRANCH,#iptAmwayNo,#selPrnWayNo').val('');
        $('#divQuoteDate').data('AgentSalesName', "");            //業務員名稱
    });
    //[業務人員編號]焦點離開事件
    $("#iptCNTBRANCH").on("blur", function (e) {
        var sVal = this.value;
        if (sVal == '') { return; };
        var sAGNTNUM = $("#selAGNTNUM").val();
        if (sAGNTNUM == '') { return; };
        var dt = getdata("/Quotation/GetAgntSalesInfo", { sAgentNo: sAGNTNUM, sLifeNo: sVal });
        if (dt.length > 0) {
            if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
            $('#divQuoteDate').data('AgentSalesName', getObjToVal(dt[0].AgentSalesName));            //業務員名稱
            $('#iptSalesmanRegNo').val(getObjToVal(dt[0].SalesmanRegNo));      //業務員登錄字號
        };
    });
    //{經手人/業務員資料}[通路別][CHL1]選取事件
    $("#iptCHL1").on("change", function () {
        var val = $('#divQuoteDate').data("CHL_Code");
        setDDL_SYSCODE('#selCHL2', ' ', 'T000', val);
        //非10/40通路, 應鎖住不可修改第二欄
        $('#selCHL2').attr('disabled', !(val == "10" || val == "40"));
    });
    //{經手人/業務員資料}[通路別][CHL2]選取事件
    $("#selCHL2").on("change", function () {
        var val = $('#selCHL2').val();
        $('#divQuoteDate').data("CHL_Code", val);
        $('#iptCHL1').val($('#selCHL2').find('option[value="' + val + '"]')[0].text).change();
        $('#selCHL2').val('');
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
            $('#iptGenareaNM').val($('#divQuoteDate').data("TOLLCLTERNAME"));     /*收費員名稱*/
            $('#iptSalesmanRegNo').val($('#divQuoteDate').data("TOLLCLTERREGNO"));     //業務員登錄字號
        };
        //--登入者為[收費員]特別處理_E-------------
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    ///----===={經手人/業務員資料}區塊_E=================================----

    //[瀏覽檔案]按鈕{檔案上傳}
    $('#uploadFile').on('change', function () {
        let oThis = $(this);
        if (oThis[0].files.length > 0) {
            $('#iptFileName').val(oThis[0].files[0].name);
        };
    });
};
//初始化_元件按鈕事件
function InitClick() {
    //[匯入]按鈕
    $('#btnImport').on("click", function (e) {
        BlockUI('檔案上傳中，請稍後...');
        setTimeout(function () {
            var isChk = true;
            //清空警告訊息
            removeMsgObjList($('#divSalesmanData').find('input,select'));
            //檢核_必填欄位
            if (!chkObjList($('#divSalesmanData,#divInputInfo').find('input,select'), true)) { isChk = false; };
            //檢核_[經手人]與[業務人員編號]
            if (isChk && !chkCntbranch()) { isChk = false; };
            //檢核_[經手人]與[編號](大保單號碼)
            if (isChk && !chkAgntAmwayno()) { $('#iptAmwayNo').focus(); isChk = false; };
            //檢核_[編號](大保單號碼)與[第二欄]
            if (isChk && $('#iptAmwayNo').val().trim() != "") {
                if ($('#iptAmwayNo').val().trim().substr(0, 1).indexOf('*') == -1 && $('#selPrnWayNo').val() == '') {
                    $('#selPrnWayNo').focus();
                    ShowMsgInElm('#selPrnWayNo', '必填欄位');
                    isChk = false;
                };
            };
            //檢核_[經手人]與[收費員代碼]
            if (isChk && !chkTollClterNo()) { isChk = false; };
            //檢核_寄送EMail
            if (isChk && !chkBatchMail()) { isChk = false; };
            //檢核_資料確認
            if (!isChk) { $.unblockUI(); return false; };
            //檢核_上傳檔案資訊
            if (isChk && !chkBatchFile()) { isChk = false; };
            if (!isChk) { $.unblockUI(); return false; };
            if (isChk) {
                var div = $('#divQuoteDate');
                var jData = [];
                jData.push({ colNM: "BatchMail", sVal: $('#iptBatchMail').val() });         //團體件作業Mail
                jData.push({ colNM: "AgentNo", sVal: $('#selAGNTNUM').val() });             //經手人代碼
                jData.push({ colNM: "AgentName", sVal: $('#iptAGNTNAME').val() });          //經手人名稱
                jData.push({ colNM: "AgentType", sVal: div.data("AgentType") });            //經手人類別
                jData.push({ colNM: "AgentSalesName", sVal: div.data("AgentSalesName") });  //業務員名稱
                jData.push({ colNM: "SalesmanRegNo", sVal: $('#iptSalesmanRegNo').val() }); //業務員登錄字號
                jData.push({ colNM: "BranchNo", sVal: $('#iptBranchNo').val() });           //單位別
                jData.push({ colNM: "LifeNo", sVal: $('#iptCNTBRANCH').val() });            //編號(壽通)
                jData.push({ colNM: "CHL1", sVal: div.data("CHL_Code") });                  //通路別1
                jData.push({ colNM: "CHL2", sVal: $('#selCHL2').val() });                   //通路別2
                jData.push({ colNM: "AmwayNo", sVal: $('#iptAmwayNo').val() });             //編號(大保單號碼/安麗直銷商)***********
                jData.push({ colNM: "PrnWayNo", sVal: $('#selPrnWayNo').val() });           //編號(收費單列印方式)**********
                jData.push({ colNM: "VendorNo", sVal: $('#selVendorNo').val() });	        //車商代碼(經銷商)
                jData.push({ colNM: "VendorSalesNo", sVal: $('#iptVendorSalesNo').val() }); //車商代碼(經銷商業務員編號)
                jData.push({ colNM: "ServiceNo", sVal: div.data("SalesNo") });              //服務代碼/業務代號
                jData.push({ colNM: "ServiceName", sVal: $('#iptGenareaNM').val() });       //服務人員
                jData.push({ colNM: "ServiceTel", sVal: $('#iptAgentTEL').val() });         //服務人員_電話
                jData.push({ colNM: "ServiceFax", sVal: $('#iptAgentFAX').val() });         //服務人員_傳真
                jData.push({ colNM: "ServiceMail", sVal: $('#iptAgentEMail').val() });      //服務人員_EMail
                jData.push({ colNM: "TollClterNo", sVal: $('#iptTollClterNo').val() });     //收費員代號
                jData.push({ colNM: "TollClterID", sVal: div.data("TOLLCLTERID") });        //收費員ID
                jData.push({ colNM: "TollClterName", sVal: div.data("TOLLCLTERNAME") });    //收費員名稱
                jData.push({ colNM: "TollClterRegNo", sVal: div.data("TOLLCLTERREGNO") });  //收費員登錄證號
                jData.push({ colNM: "BatchNo", sVal: $('#selBatchNo').val() });             //選取團體件序號
                var printForm = $('#printForm');
                $.each(jData, function (index, data) {
                    printForm.append($('<input>').attr({ type: 'hidden', id: data.colNM, name: data.colNM, value: data.sVal }));
                });
                printForm.prop('action', '/QuotationBatch/ProcBatchFile');
                printForm.submit();
            };
            $.unblockUI();
        }, 1);
    });
    //[清除]按鈕
    $('#btnClear').on("click", function (e) {
        $('input,select').each(function () { $(this).val(''); });      //所有[輸入框],[下拉選單],[文字框]清空
        setSelPick("#selAGNTNUM", [], '');                    /*[經手人]*/
        $("#selAGNTNUM").val('').selectpicker('refresh')      /*[經手人]*/
    });
    //[檢查]按鈕
    $('#btnCheck').on("click", function (e) {
        var isChk = true;
        //檢核_上傳檔案資訊
        if (isChk && !chkBatchFile()) { isChk = false; };
        if (!isChk) { return false; };
        if (isChk) {
            BlockUI('檔案上傳中，請稍後...');
            setTimeout(function () {
                var div = $('#divQuoteDate');
                var jData = [];
                jData.push({ colNM: "WorkType", sVal: "ALT" });         //作業型態(INS:新增,ALT:修改)
                var printForm = $('#printForm');
                $.each(jData, function (index, data) {
                    printForm.append($('<input>').attr({ type: 'hidden', id: data.colNM, name: data.colNM, value: data.sVal }));
                });
                printForm.prop('action', '/QuotationBatch/ProcBatchFile');
                printForm.submit();
                $.unblockUI();
            }, 1);

        };
    });
    //[轉檔]按鈕
    $('#btnTest1').on("click", function (e) {
        $.ajax({
            url: "/QuotationBatch/ProcQuotBatch",
            type: "POST",
            dataType: "text",
            async: false
        });
    });
    //[取級數]按鈕
    $('#btnTest2').on("click", function (e) {
        $.ajax({
            url: "/QuotationBatch/ProcGetLevel",
            type: "POST",
            dataType: "text",
            async: false
        });
        alert("[取級數]完成!");
    });
    //[計算保費]按鈕
    $('#btnTest3').on("click", function (e) {
        $.ajax({
            url: "/QuotationBatch/ProcGetCalAndSend400",
            type: "GET",//POST
            dataType: "text",
            async: false,
            data: { sModel: "CAL" }
        });
        alert("[計算保費]完成!");
    });
    //[送400]按鈕
    $('#btnTest4').on("click", function (e) {
        $.ajax({
            url: "/QuotationBatch/ProcGetCalAndSend400",
            type: "GET",//POST
            dataType: "text",
            async: false,
            data: { sModel: "SEND" }
        });
        alert("[計算保費]完成!");
    });
    //[產生檔案]按鈕
    $('#btnTest5').on("click", function (e) {
        $.ajax({
            url: "/QuotationBatch/CrtBatchPrintData",
            type: "GET",//POST
            dataType: "text",
            async: false
        });
        alert("[計算保費]完成!");
    });
};
//初始化_預設值
function InitDefault() {
    /*--預設值設定---------------------------------------------*/
    consLogDate("InitDefault()_預設值設定(S)");
    $('#iptBatchDate').val(GetDay(''));          //匯入日期，預帶今日
    var msg = $('#hidMsg').val();
    if (msg != '') { MsgBox('', msg, 'orange'); }
    //[收費員資料]處理
    InitDefault.InitTollClter();
    consLogDate("InitDefault()_預設值設定(E)");
};
//初始化_[收費員資料]
InitDefault.InitTollClter = function () {
    var hidTollClterData = $('#hidTollClterData');
    if (hidTollClterData.val() != '') {
        var dt = JSON.parse(hidTollClterData.val());
        /*GENAREA: "  20140421C...", TOLLCLTERID: "F220434859", TOLLCLTERNAME: "林愛玉", TOLLCLTERNO: "AP", TOLLCLTERREGNO: "FB1H121265"*/
        if (dt.length > 0) {
            $('#iptTollClterNo').val(getObjToVal(dt[0].TOLLCLTERNO)).attr('required', true);                       /*[收費員代碼]*/
            $('#divQuoteDate').data("TOLLCLTERID", getObjToVal(dt[0].TOLLCLTERID));         /*收費員ID*/
            $('#divQuoteDate').data("TOLLCLTERNAME", getObjToVal(dt[0].TOLLCLTERNAME));     /*收費員名稱*/
            $('#divQuoteDate').data("TOLLCLTERREGNO", getObjToVal(dt[0].TOLLCLTERREGNO));   /*收費員登錄證號*/
            _div1.find('#iptGenareaNM').val($('#divQuoteDate').data("TOLLCLTERNAME"));      /*收費員名稱*/
            _div1.find('#iptSalesmanRegNo').val($('#divQuoteDate').data("TOLLCLTERREGNO")); /*業務員登錄字號*/
            //打開[電話][傳真][EMail]欄位(登入時會用ID去T9982找資料，若有，則為電銷人員)
            _div1.find('#iptAgentTEL,#iptAgentFAX,#iptAgentEMail').attr('disabled', false);
            //關閉[業務人員編號]
            _div1.find('#iptCNTBRANCH').attr('disabled', true);
        } else {
            hidTollClterData.val('');
        };
    };
};
/******系統觸發事件_End********************************/


/******自訂函式_Start**********************************/
///*==[檢核類]_Start===========================*/
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
//檢核_{匯入資訊}[匯入檔案]
function chkBatchFile() {
    let inputFile = $('#uploadFile');
    if (inputFile == undefined || inputFile == null || inputFile.length == 0) {
        MsgBox('上傳檔案錯誤', "您未選擇檔案", 'red'); return false;
    };
    inputFile = inputFile.filter(function (index) {
        return (inputFile[index].files.length > 0 && inputFile[index].files[0].name != "");
    });
    if (inputFile.length == 0) {
        MsgBox('上傳檔案錯誤', "您未選擇檔案", 'red'); return false;
    };
    let isChecked = true;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        inputFile.each(function (index, element) {
            var fsize = element.files[0].size; //get file size
            var ftype = element.files[0].type; // get file type
            //allowed file types
            switch (ftype) {
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":   //xlsx
                    break;
                default:
                    MsgBox('上傳檔案錯誤', "請上傳xlsx 類型檔案", 'red');
                    isChecked = false;
            };
            //Allowed file size is less than 4 MB
            let mb = 10;
            if (fsize > mb * 1000000) {
                MsgBox('上傳檔案錯誤', "您上傳的檔案當中超過" + mb + "MB 容量大小限制", 'red');
                //notify("Your total upload Size is: " + bytesToSize(fsize) + "<br/>File(s) is too big, it should be less than 27 MB.");
                isChecked = false;
            }
        });
    } else {
        MsgBox('上傳檔案錯誤', "Please upgrade your browser, because your current browser lacks some new features we need!", 'red');
        //Output error to older unsupported browsers that doesn't support HTML5 File API
        //notify("Please upgrade your browser, because your current browser lacks some new features we need!");
        return false;
    };
    return true;
};
//檢核_{匯入資訊}[寄送EMail]
function chkBatchMail() {
    var sVal = getObjToVal($('#iptBatchMail').val()).toUpperCase();
    var maildata = sVal.split(';');
    emailRule = /\@HOTAINS.COM.TW$/;
    for (let i = 0; i < maildata.length; i++) {
        if (maildata[i].search(emailRule) == -1) {
            ShowMsgInElm('#iptBatchMail', '收件人E-Mail非[和泰內部人員]');
            return false;
        }
    }
    return true;
};
/*====[檢核類]_End=============================*/

function batchComplete() {
    if ($(location)[0].search.indexOf('Complete') > -1) {   //執行排程
        setTimeout(function () {
            MsgBox('', '匯入完成！<BR>報價平台檢核結果，請接收[E-Mail附件]或於[團體件查詢]下載結果檔。', 'orange');
        }, 1);
        setTimeout(function () {
            $.ajax({
                url: "/QuotationBatch/PsrTask",//PsrQuotBatch
                type: "POST",
                dataType: "text",
                async: false
            });
        }, 200);
    };
}

/******自訂函式_End************************************/