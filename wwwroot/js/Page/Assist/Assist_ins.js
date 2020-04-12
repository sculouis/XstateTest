//全域變數宣告
var _strInsGroupList = '06|16|28|29|30|31|37|38|48|74|76|9B|D1|D2|D3|A6';      /*需要做群組的險種清單*/
//初始化_元件事件(險種相關)
function InitEventIns() {
    /*====== 控制項觸發事件_Start ======================*/
    ///險種資料_點選觸發事件
    $(document).on("click", "#tblInsuranceList tbody tr", function (e) {/**/
        if (e.target.tagName == "BUTTON") {
            var index = $(this).context._DT_RowIndex; //行?
            if (typeof (index) != "undefined") {
                $('#tblInsuranceList').find('.selected').removeClass('selected');   //清除所有指定的css(指定selected)
                $(this).toggleClass('selected');                //選取設定css
            }
        }
    });
    //[活動方案]_選取事件
    $("#selZCAMPAN").on("change", function () {
        $('#divSetUserPro').hide(); //關閉[自訂方案]
        var selZCAMPAN = $(this);
        var key = selZCAMPAN.val();
        if (key == "0") { $.unblockUI(); return; }
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            removeMsgObjList("ALL");    //清空警告訊息
            /*--===============[檢核]_處理=================================--*/
            var isChk = true;
            if ($('#btnNext4').is(":hidden")) { //當[下一步]按鈕，隱藏時檢核
                //檢核_{經手人/業務員資料}區塊資料
                if (isChk) { ctrlDiv(1, "OPEN"); }
                if (isChk && !chkSub_SaleData()) { isChk = false; } else { ctrlDiv(1, "CLOSE"); }
                //檢核_{要保人及被保險人資料}區塊資料
                if (isChk) { ctrlDiv(2, "OPEN"); }
                if (isChk && !chkSub_ProtectPeopleData()) { isChk = false; } else { ctrlDiv(2, "CLOSE"); }
                //檢核_{車籍資料}區塊資料
                if (isChk) { ctrlDiv(3, "OPEN"); }
                if (isChk && !chkSub_CarData()) { isChk = false; } else { ctrlDiv(3, "CLOSE"); }
                if (!isChk) { selZCAMPAN.val(''); $.unblockUI(); return; }
            }
            //檢核_[強制險]相關資料
            if (isChk && !chkMan()) { isChk = false; }
            //檢核_[任意險]相關資料
            if (isChk && !chkAny()) { isChk = false; }
            if (!isChk) { selZCAMPAN.val(''); $.unblockUI(); return; }
            /*--===============[活動方案]_處理=================================--*/
            var sZCAMPANList = "";  //[活動方案]清單
            var dt = $('#tblInsuranceList').DataTable();
            if (key == "") {
                var dtS = [];
                sZCAMPANList = getObjToVal($('#divQuoteDate').data("ZCAMPANList"));    //讀取上一次的[活動方案]清單
                dt.rows().data().filter(function (item) {
                    //掃描目前Grid資料
                    if (sZCAMPANList.indexOf(item.ZCVRTYPE) == -1) {
                        //若不在[活動方案]清單，則先存入陣列中
                        dtS.push({
                            ZCVRTYPE: item.ZCVRTYPE
                            , ZCVRTYPENM: item.ZCVRTYPENM
                            , SUMINA: item.SUMINA
                            , SUMINB: item.SUMINB
                            , SUMINC: item.SUMINC
                            , ZFACTORA: item.ZFACTORA
                            , ZFACTORB: item.ZFACTORB
                            , EXCESS: item.EXCESS
                            , MVPPREM: 0
                            , InsMonth: 0  //月繳保費0
                            , InsOrder: item.InsOrder  //排序
                        });
                        return;
                    }
                })
                dt.clear().draw();      //清空Grid
                CreatInsDT(dtS);     //將資料帶入
            }
            else {
                var dtSource = getdata("/Assist/GetZCAMPAN", { sZCAMPAN: key, sMVPZMTYPE: $('#selMVPZMTYPE').val(), sCarAge: getCarAge(), sZCARRY: $('#iptZCARRY').val() });
                if (!dtSource.Success) {
                    MsgBox('錯誤', dtSource.Msg, 'red'); selZCAMPAN.val(''); return;
                }
                else {
                    //先將[活動方案]存入陣列裡
                    var dtZCAMPAN = [];
                    $.each(dtSource.Data, function (i, item) {
                        dtZCAMPAN.push({
                            ZCVRTYPE: item.INSTYPE
                            , SUMINA: item.SUMINA
                            , SUMINB: item.SUMINB
                            , SUMINC: item.SUMINC
                            , ZFACTORA: item.ZFACTORA
                            , ZFACTORB: item.ZFACTORB
                            , EXCESS: item.EXCESS
                            , MVPPREM: 0  //保險費預設為0
                            , ZCVRTYPENM: getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', item.INSTYPE)
                            , InsMonth: 0  //月繳保費0
                            , InsOrder: item.InsOrder  //排序
                        });
                        sZCAMPANList += item.INSTYPE + "|";  //[活動方案]清單
                    });
                    console.log("sZCAMPANList=" + sZCAMPANList);
                    var sdtList = "";
                    //查詢目前Grid裡面的資料
                    dt.rows().data().filter(function (item) {
                        if (sZCAMPANList.indexOf(item.ZCVRTYPE) == -1 && getObjToVal($('#divQuoteDate').data("ZCAMPANList")).indexOf(item.ZCVRTYPE) == -1) {
                            //若沒有在[活動方案]陣列裡的資料，則加入陣列中
                            dtZCAMPAN.push({
                                ZCVRTYPE: item.ZCVRTYPE
                                , SUMINA: item.SUMINA
                                , SUMINB: item.SUMINB
                                , SUMINC: item.SUMINC
                                , EXCESS: item.EXCESS
                                , ZFACTORA: item.ZFACTORA
                                , ZFACTORB: item.ZFACTORB
                                , MVPPREM: 0  //保險費預設為0
                                , ZCVRTYPENM: getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', item.ZCVRTYPE)
                                , InsMonth: 0  //月繳保費0
                                , InsOrder: item.InsOrder  //排序
                            });
                        }
                        sdtList += item.ZCVRTYPE + "|";
                        return;
                    })
                    //console.log("sdtList=" + sdtList);
                    dt.clear().draw();          //清空Grid
                    CreatInsDT(dtZCAMPAN);      //將資料帶入
                    insuredDT();
                    insCarAgeDT();              //更新[險種資料區][係數一](車齡部份)
                    $('#divQuoteDate').data("ZCAMPANList", sZCAMPANList);   //將[活動方案]清單，存起來，以供清除時使用
                }
            }
            ctrlDiv(-1, "OPEN");                 //開啟所有頁籤
            $.unblockUI();
        }, 1);
    });
    //[險種]_選取事件
    $("#selZCVRTYPE").on("change", function () {
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            /*--===============[設定參數值]_處理_Start===========================--*/
            var dt = $('#tblInsuranceList').DataTable();
            var selZCVRTYPE = $("#selZCVRTYPE");                            //[險種]
            var MVPZMTYPE = getObjToVal($('#selMVPZMTYPE').val());          //車種代碼
            var ZMAKE = getObjToVal($('#selZMAKE').val());                  //廠牌代碼
            var ZCVRTYPELIST = getObjToVal($('#divQuoteDate').data("ZcvrTypeList"));     //已選險種代碼
            var CCDATES = $('#iptCCDATES').val().replace(/[/]/g, "");       //任意保期(起)
            var CCDATEE = $('#iptCCDATEE').val().replace(/[/]/g, "");       //任意保期(迄)
            var EXCESS = getObjToVal($('#selEXCESS').val());                //已選自付額代碼
            var ZCARRY = getObjToVal($('#iptZCARRY').val());                //乘載
            var RESETPRICE = $('#iptRESETPRICE').val().replace(/[$,]/g, "");            //重置價格
            var isInsLoad = getObjToVal($('#divQuoteDate').data("isInsLoad"));           //是否為帶入資料
            /*--===============[設定參數值]_處理_End=============================--*/

            /*--===============[設定初始化]_處理_Start===========================--*/
            //移除下拉選單內容
            _div4.find('#selSUMINA,#selSUMINB,#selSUMINC,#selZFACTORA,#selZFACTORB,#selEXCESS').empty();
            _div4.find('#iptSUMINA,#iptSUMINC').val('');
            //移除必選欄位
            _div4.find('#selSUMINA,#selSUMINB,#selSUMINC,#selZFACTORA,#selZFACTORB,#selEXCESS,#iptSUMINA,#iptSUMINC').removeAttr('required').attr('readonly', true);
            /*--===============[設定初始化]_處理_End=============================--*/

            /*--===============[檢核]_處理_Start=================================--*/
            var key = selZCVRTYPE.val();
            if (key == '') { $.unblockUI(); return; }
            var isChk = true;
            if ($('#btnNext4').is(":hidden")) { /*當[下一步]按鈕隱藏時,檢核*/
                //檢核_{經手人/業務員資料}區塊資料
                if (isChk) { ctrlDiv(1, "OPEN"); }
                if (isChk && !chkSub_SaleData()) { isChk = false; } else { ctrlDiv(1, "CLOSE"); }
                //檢核_{要保人及被保險人資料}區塊資料
                if (isChk) { ctrlDiv(2, "OPEN"); }
                if (isChk && !chkSub_ProtectPeopleData()) { isChk = false; } else { ctrlDiv(2, "CLOSE"); }
                //檢核_{車籍資料}區塊資料
                if (isChk) { ctrlDiv(3, "OPEN"); }
                if (isChk && !chkSub_CarData()) { isChk = false; } else { ctrlDiv(3, "CLOSE"); }
                if (!isChk) { $.unblockUI(); selZCVRTYPE.val(''); return; }
            }
            //檢核_強制險或任意險
            if ($('#chkMan').prop('checked') == false && $('#chkAny').prop('checked') == false) {
                MsgBox('錯誤', '強制險或任意險必須勾選其一！', 'red'); $.unblockUI(); selZCVRTYPE.val(''); return;
            }
            //檢核_[強制險]相關資料
            if (isChk && !chkMan()) { isChk = false; }
            //檢核_[任意險]相關資料
            if (key != '21') {
                if (isChk && !chkAny()) { isChk = false; }
            }
            if (!isChk) { $.unblockUI(); selZCVRTYPE.val(''); return; }
            /*--===============[檢核]_處理_End===================================--*/
            //[強制險]輸入處理
            if (key == '21') {
                CCDATES = $('#iptFRDATES').val().replace(/[/]/g, "");       //強制保期(起)
                CCDATEE = $('#iptFRDATEE').val().replace(/[/]/g, "");       //強制保期(迄)
            }
            var data;
            /*--===============[險種[3B,35]特別處理程序]_處理_Start===========================--*/
            if (key == '3B' || key == '35') {
                if (ZCVRTYPELIST.indexOf('31') == -1) {
                    MsgBox('錯誤', '未輸入險種31，不得輸入險種' + key + '！', 'red'); $('#selZCVRTYPE').val(''); return;
                } else {
                    var s31SUMINA, s31SUMINB, s31SUMINC
                    dt.rows().data().map(function (item) {
                        if (item.ZCVRTYPE === '31') {
                            s31SUMINA = item.SUMINA; s31SUMINB = item.SUMINB; s31SUMINC = item.SUMINC;
                        }
                    });
                    if (key == '3B') {
                        //---------險種[3B]_處理_Start-------
                        if (s31SUMINA * 10 == s31SUMINC) {
                            data = getdata("/Quotation/GetINSURED3BINFO", {
                                sSUMINA: s31SUMINA, sSUMINB: s31SUMINB, sSUMINC: s31SUMINC
                            })
                            if (data != null) {
                                if (data.length > 0) {
                                    if (data.length === 1 && typeof (data[0].MSG) != "undefined") {
                                        MsgBox('錯誤', data[0].MSG, 'red');
                                        $('#selZCVRTYPE').val(''); $.unblockUI(); return;
                                    }
                                    setDDL_INS("#selSUMINC", data[0].SUMIN3BC, dt);
                                    $('#iptSUMINC').attr('style', 'display:none');
                                    $('#selSUMINC').attr('style', 'display:');
                                    $('#selSUMINC').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                            }
                        } else {
                            MsgBox('錯誤', '險種31的保額一~三非殘廢增額10倍型！', 'red'); $('#selZCVRTYPE').val(''); return;
                        }
                        //---------險種[3B]_處理_End---------
                    } else if (key == "35") {
                        //---------險種[35]_處理_Start-------
                        data = getdata("/Quotation/GetINSURED35INFO", {
                            sSUMINA: s31SUMINA, sSUMINB: s31SUMINB, sSUMINC: s31SUMINC
                        })
                        if (data != null) {
                            if (data.length > 0) {
                                if (data.length === 1 && typeof (data[0].MSG) != "undefined") {
                                    MsgBox('錯誤', data[0].MSG, 'red');
                                    $('#selZCVRTYPE').val(''); $.unblockUI(); return;
                                }
                                setDDL_INS("#selSUMINC", data[0].SUMIN35C, dt);
                                $('#iptSUMINC').attr('style', 'display:none');
                                $('#selSUMINC').attr('style', 'display:');
                                $('#selSUMINC').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                            }
                        }
                        //---------險種[35]_處理_End---------
                    }
                }
                $.unblockUI();
                return;
            }
            /*--===============[險種[3B,35]特別處理程序]_處理_End=============================--*/

            /*--===============[險種選擇]_處理_Start==========================================--*/
            data = getdata("/Quotation/GetINSUREDINFO", {
                sZCVRTYPE: key, sMVPZMTYPE: MVPZMTYPE, sZMAKE: ZMAKE, sZCVRTYPELIST: ZCVRTYPELIST
                , sCCDATES: CCDATES, sCCDATEE: CCDATEE, sEXCESS: EXCESS, sZCARRY: ZCARRY, sRESETPRICE: RESETPRICE
            });
            if (data != null) {
                if (data.length > 0) {
                    if (data.length === 1 && typeof (data[0].MSG) != "undefined") {
                        MsgBox('錯誤', data[0].MSG, 'red');
                        $('#selZCVRTYPE').val(''); $.unblockUI(); return;
                    }
                    if (_strInsGroupList.indexOf(key) > -1) {       /*需要做群組的險種清單*/
                        var EXCESSList = "28|29|30";
                        if (EXCESSList.indexOf(key) > -1) {
                            //---------險種[28,29,30]特別處理程序_Start-------
                            $.each(data, function (idx, item) {
                                var sGListC = item.SUMINC;
                                var sGListE = item.EXCESS; //奇怪的符號
                                $TEXTC = $($.parseXML(sGListC)).find("TEXT");
                                $TEXTE = $($.parseXML(sGListE)).find("TEXT");
                                $VALUEE = $($.parseXML(sGListE)).find("VALUE");
                                var arr = [];
                                var ssuminC = "";
                                //組合陣列
                                for (let i = 0; i < $TEXTC.length; i++) {
                                    ssuminC += $TEXTC[i].textContent + "|";
                                    arr.push({
                                        SUMINC: $TEXTC[i].textContent, EXCESS: $TEXTE[i].textContent, VALUE: $VALUEE[i].textContent
                                    });
                                }
                                $("#divInsured").data("insArr", arr);           /*暫存陣列*/
                                setDDL_INS("#selSUMINC", ssuminC, dt);          /*設定[保額三]*/
                                $('#iptSUMINC').attr('style', 'display:none');  /*隱藏[保額三]輸入欄位*/
                                $('#selSUMINC').attr('style', 'display:');      /*顯示[保額三]下拉欄位*/
                                if (item.SUMINCREQ == 'Y') {                    /*設定[保額三]下拉欄位為必填欄位*/
                                    $('#selSUMINC').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                setDDLRep("selSUMINC");                         /*[保額三]移除重複選項*/
                                if (item.EXCESSREQ == 'Y') {                    /*設定[自負額]下拉欄位為必填欄位*/
                                    $('#selEXCESS').removeAttr('disabled').attr('readonly', false);//.attr('required', 'required')
                                }
                                $("#selEXCESS").empty();                        /*清空[自負額]下拉內容*/
                                $('#divQuoteDate').data('SelInsOrder', item.InsOrder);  /*暫存[險種順序]*/
                            });
                            //---------險種[28,29,30]特別處理程序_End---------
                        } else {
                            //---------[保額一~三]做群組,[係數1,2],[自負額]_Start-------
                            $.each(data, function (idx, item) {
                                var sListA = "<LIST>" + item.SUMINA + "</LIST>";
                                var sListB = "<LIST>" + item.SUMINB + "</LIST>";
                                var sListC = "<LIST>" + item.SUMINC + "</LIST>";
                                $TEXTA = $($.parseXML(sListA)).find("TEXT");
                                $TEXTB = $($.parseXML(sListB)).find("TEXT");
                                $TEXTC = $($.parseXML(sListC)).find("TEXT");
                                var arr = [];
                                var ssuminA = "";
                                var sSUMINC = "";
                                for (let i = 0; i < $TEXTA.length; i++) {
                                    ssuminA += $TEXTA[i].textContent + "|";
                                    sSUMINC = $TEXTC[i] != null ? $TEXTC[i].textContent : '';
                                    arr.push({
                                        //SUMINA: $TEXTA[i].textContent, SUMINB: $TEXTB[i].textContent, SUMINC: $TEXTC[i].textContent
                                        SUMINA: $TEXTA[i].textContent, SUMINB: $TEXTB[i].textContent, SUMINC: sSUMINC
                                    });
                                }
                                $("#divInsured").data("insArr", arr);
                                setDDL_INS("#selSUMINA", ssuminA, dt);
                                $('#iptSUMINA').attr('style', 'display:none');
                                $('#selSUMINA').attr('style', 'display:');
                                if (item.SUMINAREQ == 'Y') {
                                    $('#selSUMINA').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                setDDLRep("selSUMINA");
                                if (item.SUMINBREQ == 'Y') {
                                    $('#selSUMINB').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                $('#iptSUMINC').attr('style', 'display:none');
                                $('#selSUMINC').attr('style', 'display:');
                                if (item.SUMINCREQ == 'Y') {
                                    $('#selSUMINC').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                setDDL_INS("#selZFACTORA", item.ZFACTORA);
                                setDDL_INS("#selZFACTORB", item.ZFACTORB);
                                //setDDL_INS("#selEXCESS", item.EXCESS.replace(/[&#x0F;]/g, ''));
                                setDDL_INS("#selEXCESS", item.EXCESS);
                                if (item.ZFACTORAREQ == 'Y') {
                                    $('#selZFACTORA').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                if (item.ZFACTORBREQ == 'Y') {
                                    $('#selZFACTORB').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                if (item.EXCESSREQ == 'Y') {
                                    $('#selEXCESS').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                                $('#divQuoteDate').data('SelInsOrder', item.InsOrder);
                                //----------險種預設值_處理_Start-----------------
                                var CarAge = "";//車齡
                                if (isInsLoad != "true" && ("16|A6").indexOf(key) > -1) {
                                    CarAge = padLeft(parseInt(getCarAge()) + 1, 2);    //車齡+1
                                    $('#selZFACTORA').val(CarAge);
                                }
                                //----------險種預設值_處理_End-------------------
                            });
                        }
                        //---------[保額一~三]做群組,[係數1,2],[自負額]_處理_End---------
                    } else {
                        //---------[保額一~三],[係數1,2],[自負額]_處理_Start-------------
                        $.each(data, function (i, item) {
                            var iIssueYear = getObjToVal($('#selIssueYear').val()) + '/' + getObjToVal($('#selIssueMonth').val());          //[發照年月]
                            var inssdate = getObjToVal($('#iptFRDATES').val());     //強制保期(起)
                            if (inssdate == "") {
                                inssdate = getObjToVal($('#iptCCDATES').val());     //任意保期(起)
                            }
                            if (inssdate != "") { inssdate = inssdate.substr(0, 4); }
                            /*若不為新車，則帶入0*/
                            if (iIssueYear != '' && iIssueYear != inssdate) { RESETPRICE = 0; }
                            //setDDL_INS("#selSUMINA", item.SUMINA, dt);
                            if (item.SUMINA.indexOf("{USER}") > -1) {
                                $('#iptSUMINA').attr('style', 'display:').val(RESETPRICE).blur();
                                $('#selSUMINA').attr('style', 'display:none');
                                if (item.SUMINAREQ == 'Y') {
                                    $('#iptSUMINA').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                            } else {
                                setDDL_INS("#selSUMINA", item.SUMINA, dt);
                                $('#iptSUMINA').attr('style', 'display:none');
                                $('#selSUMINA').attr('style', 'display:');
                                if (item.SUMINAREQ == 'Y') {
                                    $('#selSUMINA').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                            }
                            setDDL_INS("#selSUMINB", item.SUMINB, dt);
                            if (item.SUMINC.indexOf("{USER}") > -1) {
                                $('#iptSUMINC').attr('style', 'display:');
                                $('#selSUMINC').attr('style', 'display:none');
                                if (item.SUMINCREQ == 'Y') {
                                    $('#iptSUMINC').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                            }
                            else {
                                setDDL_INS("#selSUMINC", item.SUMINC, dt);
                                $('#iptSUMINC').attr('style', 'display:none');
                                $('#selSUMINC').attr('style', 'display:');
                                if (item.SUMINCREQ == 'Y') {
                                    $('#selSUMINC').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                                }
                            }
                            setDDL_INS("#selZFACTORA", item.ZFACTORA);
                            setDDL_INS("#selZFACTORB", item.ZFACTORB);
                            setDDL_INS("#selEXCESS", item.EXCESS.replace("&#x0F;", ""));

                            //---------險種[28,29,30]特別處理程序_Start-------
                            //var EXCESSList = "28|29|30";
                            //if (EXCESSList.indexOf(key) > -1) {
                            //    $("#selEXCESS").append($('<option></option>').val('').text(''));
                            //    $("#selEXCESS").val('');
                            //}
                            ///$("#selEXCESS").change(); //這邊不可以change()事件，不然會造成無限迴圈
                            //---------險種[28,29,30]特別處理程序_End---------

                            //---------設定必選欄位_處理_Start----------------
                            if (item.SUMINBREQ == 'Y') {
                                $('#selSUMINB').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                            }
                            if (item.ZFACTORAREQ == 'Y') {
                                $('#selZFACTORA').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                            }
                            if (item.ZFACTORBREQ == 'Y') {
                                $('#selZFACTORB').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                            }
                            if (item.EXCESSREQ == 'Y') {
                                $('#selEXCESS').attr('required', 'required').removeAttr('disabled').attr('readonly', false);
                            }
                            $('#divQuoteDate').data('SelInsOrder', item.InsOrder);      /*險種順序*/
                            //---------設定必選欄位_處理_End------------------

                            //----------險種預設值_處理_Start-----------------
                            if (isInsLoad != "true") {
                                var CarAge = "";//車齡
                                if (("21|46|47").indexOf(key) > -1) {
                                    $('#selSUMINA')[0].selectedIndex = 1
                                    $('#selSUMINA').change();
                                } else if (key == "05") {       //乙式[自負額]預帶55
                                    $('#selEXCESS').val("55");
                                } else if (key == "0552") {     //丙式[自負額]預帶52
                                    $('#selEXCESS').val("52");
                                } else if (("16|A6").indexOf(key) > -1) {
                                    CarAge = padLeft(parseInt(getCarAge()) + 1, 2);    //車齡+1
                                    $('#selZFACTORA').val(CarAge);
                                } else if (key == "11" || key == "73") {
                                    $('#selEXCESS').val("10");
                                } else if (("91|92|93|94").indexOf(key) > -1) {
                                    CarAge = key == "91" ? "A" : key == "92" ? "B" : key == "93" ? "C" : key == "94" ? "D" : "";
                                    CarAge += getCarAge();    //車齡
                                    $('#selZFACTORA').val(CarAge);
                                }
                            }
                            //----------險種預設值_處理_End-------------------
                        });
                        //---------[保額一~三],[係數1,2],[自負額]_處理_End---------------
                    }
                }
            }
            /*--===============[險種選擇]_處理_End============================================--*/
            $.unblockUI();
        }, 1);
    });
    //[保額一],[保額二],[保額三]_選取事件
    $("#selSUMINA,#selSUMINB,#selSUMINC").on("change", function () {
        var sVal = $(this).val();
        if (_strInsGroupList.indexOf($('#selZCVRTYPE').val()) == -1) {      //非需要做群組的險種清單
            if (sVal == '') { return; }
            $('#selSUMINA').val(sVal);
            $('#selSUMINB').val(sVal);
            $('#selSUMINC').val(sVal);
        }
    });
    //[保額一]_選取事件
    $("#selSUMINA").on("change", function () {
        var sVal = $(this).val();
        if (_strInsGroupList.indexOf($('#selZCVRTYPE').val()) > -1) {       //為需要做群組的險種清單
            var arr = [];
            arr = $("#divInsured").data("insArr");
            arr = $.grep(arr, function (x) {
                return x.SUMINA == sVal;
            });
            var suminb = "";
            arr.map(function (x) {
                suminb += getObjToVal(x.SUMINB) + '|';
            });
            setDDL_INS("#selSUMINB", suminb);
            setDDLRep("selSUMINB");     //移除[保額二]的重覆選項
            $("#selSUMINC").empty();    //清空[保額三]
            if ($("#selSUMINB option[value!='']").length == 1) {    //若選項只有一個，則預設第一筆
                $("#selSUMINB")[0].selectedIndex = 1;
                $("#selSUMINB").change();
            }
        }
    });
    //[保額二]_選取事件
    $("#selSUMINB").on("change", function () {
        var sVal = $(this).val();
        if (_strInsGroupList.indexOf($('#selZCVRTYPE').val()) > -1) {       //為需要做群組的險種清單
            var sVal1 = $('#selSUMINA').val();
            var arr = [];
            arr = $("#divInsured").data("insArr");
            arr = $.grep(arr, function (x) {
                return x.SUMINA == sVal1 && x.SUMINB == sVal;
            });
            var suminC = "";
            arr.map(function (x) {
                suminC += getObjToVal(x.SUMINC) + '|';
            });
            setDDL_INS("#selSUMINC", suminC);
            setDDLRep("selSUMINC");
            if ($("#selSUMINC option[value!='']").length == 1) {    //若選項只有一個，則預設第一筆
                $("#selSUMINC")[0].selectedIndex = 1
            }
        }
    });
    //[保額三]_選取事件
    $("#selSUMINC").on("change", function () {
        var sVal = $(this).val();
        var sEXCESSList = "28|29|30";
        if (sEXCESSList.indexOf($('#selZCVRTYPE').val()) > -1) {       //為需要做群組的險種清單
            var arr = [];
            arr = $("#divInsured").data("insArr");
            arr = $.grep(arr, function (x) { return x.SUMINC == sVal; });
            var sEXCESS = "";
            arr.map(function (x) {
                sEXCESS += '<VALUE>' + getObjToVal(x.VALUE) + '</VALUE><TEXT>' + getObjToVal(x.EXCESS) + '</TEXT>|';
            });
            setDDL_INS("#selEXCESS", sEXCESS);
            setDDLRep("selEXCESS");
        }
    });
    //[自付額]_選取事件
    $("#selEXCESS").on("change", function () {
        var sVal = $(this).val();
        //var sEXCESSList = "28|29|30";
        //if (sEXCESSList.indexOf($('#selZCVRTYPE').val()) > -1) {
        //    $('#selZCVRTYPE').change();
        //    setTimeout(function () {
        //        $('#selEXCESS').val(sVal);
        //    }, 20);
        //}
    });
    //[保額一]_焦點離開事件(20190115 DEL BY WS-Michael 暫不檢核，由400檢核)
    ////$("#iptSUMINA").on("blur", function (e) {
    ////    if (!chkSumina($(this).val(), $('#iptRESETPRICE').val())) {
    ////        ShowMsgInElm('#iptSUMINA', "[保額一]超過規定的範圍，請重新輸入！");
    ////        e.preventDefault();
    ////        e.stopImmediatePropagation();
    ////        $(this).val('');
    ////    }
    ////});
    /*====== 控制項觸發事件_End ========================*/

    /*====== 按鈕處理事件_Start ========================*/
    //[新增險種]按鈕(開啟險種輸入資訊)
    $("#btnInsNew").on("click", function () {
        if ($('#divInsured').is(":hidden")) {
            $('#divInsured').show(200);                 //開啟[險種資訊]
            $('#btnInsAdd').show();                     //顯示[確定新增]按鈕
            $('#btnInsUpd').hide();                     //隱藏[確定儲存]按鈕
            $('#selZCVRTYPE').val('').change().removeAttr('disabled');   //解開[險種]下拉選單
        } else {
            $('#divInsured').hide(200);
        }
    });
    //[確定新增]按鈕
    $("#btnInsAdd").on("click", function () {
        removeMsgObjList($('#divInsured').find('input,select'));    //清空警告訊息 
        if (!ValidateDiv('divInsured')) { return; }
        var ZCVRTYPE = getObjToVal($('#selZCVRTYPE').val());
        if (ZCVRTYPE == "") { ShowMsgInElm('#selZCVRTYPE', '必填欄位'); return; }
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            var chk = false;
            var dt = $('#tblInsuranceList').DataTable();
            dt.rows().data().map(function (x) {
                if (ZCVRTYPE.substr(0, 2) == x.ZCVRTYPE.substr(0, 2)) {
                    chk = true;
                    MsgBox('錯誤', '險種[' + ZCVRTYPE + ']不可重複輸入！', 'red');
                    return;
                }
            });
            if (chk) { return; }
            var ZCVRTYPELIST = '';                      //已選險種代碼
            dt.rows().data().map(function (x) {
                return ZCVRTYPELIST += x.ZCVRTYPE + '|'
            });
            var SUMINA = $('#selSUMINA :selected').text().replace(/[$,]/g, "");     //保額一
            var SUMINB = $('#selSUMINB :selected').text().replace(/[$,]/g, "");     //保額二
            var SUMINC = "";                                                        //保額三
            var EXCESS = getObjToVal($('#selEXCESS').val());                        //自付額
            var ZFACTORA = getObjToVal($('#selZFACTORA').val());                    //係數一
            var ZFACTORB = getObjToVal($('#selZFACTORB').val());                    //係數二
            ///判斷[保額一]是否為自行輸入
            if ($('#iptSUMINA').is(":hidden")) {
                SUMINA = $('#selSUMINA :selected').text().replace(/[$,]/g, "");
            } else {
                SUMINA = $('#iptSUMINA').val().replace(/[$,]/g, "");
                //(20190115 DEL BY WS-Michael 暫不檢核，由400檢核)
                //if (!chkSumina(SUMINA, $('#iptRESETPRICE').val())) {
                //    MsgBox('警告', '[保額一]超過規定的範圍，請重新輸入！', 'orange'); return;
                //}
            }
            //判斷[保額三]是否為自行輸入
            if ($('#iptSUMINC').is(":hidden")) {
                SUMINC = $('#selSUMINC :selected').text().replace(/[$,]/g, "");
            } else {
                SUMINC = $('#iptSUMINC').val().replace(/[$,]/g, "");
            }
            var dtChk = getdata("/Quotation/ChkINSADD", {
                sZCVRTYPE: ZCVRTYPE	                                        //險種代碼
                , sAGNTNUM: $('#selAGNTNUM').val()	                        //經手人
                , sZCVRTYPELIST: ZCVRTYPELIST	                            //已輸入險種代碼
                , sEXCESS: EXCESS	                                        //已選自付額代碼
                , sCLTDOB: $('#iptCTLBirthday').val()	                    //被保險人生日
                , sSUMINA: SUMINA	                                        //保額一
                , sSUMINB: SUMINB	                                        //保額二
                , sZFACTORA: ZFACTORA	                                    //係數一
                , sZCARRY: $('#iptZCARRY').val()	                        //乘載
                , sGETDATE: $('#selIssueYear').val() + '/' + getObjToVal($('#selIssueMonth').val())	//發照年月
                , sCCDATES: $('#iptCCDATES').val().replace(/[/]/g, "")	    //任意保期起
                , sCLTTYPE: $('#rdoCTLCustType:checked').val()              //客戶類別(被保險人)
            });
            if (dtChk.length > 0) {
                if (dtChk.length === 1 && typeof (dtChk[0].MSG) != "undefined") {
                    MsgBox('錯誤', dtChk[0].MSG, 'red');
                    return;
                }
            }
            dt.row.add({
                ZCVRTYPE: ZCVRTYPE
                , ZCVRTYPENM: getSysCodeVal(_arrLoadSysData, 'INSUREDLIST', ZCVRTYPE)
                , SUMINA: SUMINA
                , SUMINB: SUMINB
                , SUMINC: SUMINC
                , ZFACTORA: ZFACTORA
                , ZFACTORB: ZFACTORB
                , EXCESS: EXCESS
                , MVPPREM: 0  //保險費預設為0
                , InsMonth: 0  //月繳保費0
                , InsOrder: parseInt(getObjToVal($('#divQuoteDate').data('SelInsOrder')))
            });
            CreatInsDT(dt.data());
            insuredDT();
            $('#selZCVRTYPE').val('').change();
            $('#divInsured').hide();
            $("#btnInsNew").focus();
            $('#labInsuranceMsg').text('新增險種資料成功').show();
            setTimeout(function () {
                $('#labInsuranceMsg').hide();
            }, 5000);
            $.unblockUI();
        }, 1);
    });
    //[確定儲存]_選取事件
    $("#btnInsUpd").on("click", function () {
        removeMsgObjList($('#divInsured').find('input,select'));    //清空警告訊息    
        if (!ValidateDiv('divInsured')) { return; }     //必填欄位檢查
        BlockUI('作業中，請稍後');
        setTimeout(function () {
            var isUpdate = false;
            var dt = $('#tblInsuranceList').DataTable();
            var trRow = dt.rows().data().filter(function (x) { return x.ZCVRTYPE == $('#selZCVRTYPE').val() });
            trRow = trRow[0];
            if (typeof (trRow) != "undefined") {
                if (trRow.ZCVRTYPE != $('#selZCVRTYPE').val()) {
                    MsgBox('警告', '不得修改[險種]，請用刪除功能!', 'orange'); return;
                }
                //[保額一]處理
                var SUMINA = "";
                if ($('#iptSUMINA').is(":hidden")) {
                    SUMINA = $('#selSUMINA :selected').text().replace(/[$,]/g, "");
                } else {
                    SUMINA = $('#iptSUMINA').val().replace(/[$,]/g, "");
                    //(20190115 DEL BY WS-Michael 暫不檢核，由400檢核)
                    //if (!chkSumina(SUMINA, $('#iptRESETPRICE').val())) {
                    //    MsgBox('警告', '[保額一]超過規定的範圍，請重新輸入！', 'orange'); return;
                    //}
                }
                //[保額二]處理
                var SUMINB = $('#selSUMINB :selected').text().replace(/[$,]/g, "");
                //[保額三]處理
                var SUMINC = "";
                if ($('#iptSUMINC').is(":hidden")) {
                    SUMINC = $('#selSUMINC :selected').text().replace(/[$,]/g, "");
                } else {
                    SUMINC = $('#iptSUMINC').val().replace(/[$,]/g, "");
                }
                trRow.SUMINA = SUMINA,
                trRow.SUMINB = SUMINB,
                trRow.SUMINC = SUMINC,
                trRow.ZFACTORA = $('#selZFACTORA').val();
                trRow.ZFACTORB = $('#selZFACTORB').val();
                trRow.EXCESS = $('#selEXCESS').val();
                trRow.MVPPREM = 0;      //保險費預設為0
                trRow.InsMonth = 0;     //月繳保費預設為0
                if (trRow.ZCVRTYPE == '31') {
                    //--險種[3B]特別處理程序_START--------------
                    var s3Bdata = dt.rows().data().filter(function (x) { return x.ZCVRTYPE == '3B'; });
                    if (s3Bdata.length > 0) { s3Bdata[0].SUMINC = ""; }
                    //--險種[3B]特別處理程序_END----------------
                }
                CreatInsDT(dt.data());
                insuredDT() //險種資料相關資料處理
                $('#selZCVRTYPE').val('').change();
                $('#divInsured').hide();
                $("#btnInsNew").focus();
                $('#labInsuranceMsg').text('修改資料成功').show();
                setTimeout(function () {
                    $('#labInsuranceMsg').hide();
                }, 5000);
            } else {
                MsgBox('警告', '不得修改[險種]，請用刪除功能!', 'orange');
            }
            $.unblockUI();
        }, 1);
    });
    //[自訂方案]按鈕
    $('#btnSetUserPro').on("click", function (e) {
        var divSet = $('#divSetUserPro');
        if (divSet.is(":hidden")) {
            divSet.show(200);   /*開啟[自訂方案]設定*/
            var sZCAMPAN = $('#selZCAMPAN').val();
            if (sZCAMPAN.length == 1 && sZCAMPAN != '0') {
                //當[活動方案]內，有選擇"自訂方案"時
                divSet.find('#iptProgramName1,#iptProgramName2,#iptProgramName3,#iptProgramName4,#iptProgramName5').parent().hide();  /*所有[欄位]隱藏*/
                divSet.find('#btnDelPro1,#btnDelPro2,#btnDelPro3,#btnDelPro4,#btnDelPro5').parent().hide();                 /*所有[刪除]按鈕隱藏*/
                divSet.find('#iptProgramName' + sZCAMPAN).parent().show();                          /*顯示該"自訂方案"的欄位*/
                if (divSet.find('#iptProgramName' + sZCAMPAN).val() != '') {
                    divSet.find('#btnDelPro' + sZCAMPAN + ',#btnSavePro' + sZCAMPAN).parent().show();   /*顯示該"自訂方案"的[儲存],[刪除]按鈕*/
                }
            } else {
                divSet.find('#iptProgramName1,#iptProgramName2,#iptProgramName3,#iptProgramName4,#iptProgramName5').parent().show();
                divSet.find('#btnSavePro1,#btnSavePro2,#btnSavePro3,#btnSavePro4,#btnSavePro5').parent().hide();
                divSet.find('#btnDelPro1,#btnDelPro2,#btnDelPro3,#btnDelPro4,#btnDelPro5').parent().hide();
                for (let i = 0; i <= 5; i++) {
                    if (divSet.find('#iptProgramName' + i).val() != "") {   /*[活動方案]有設定值時*/
                        divSet.find('#btnDelPro' + i).parent().show();      /*顯示[刪除]按鈕*/
                    } else {
                        divSet.find('#btnSavePro' + i).parent().show();     /*顯示[儲存]按鈕*/
                    }
                }
            }
        } else {
            divSet.hide(200);   /*關閉[自訂方案]設定*/
        }
    });
    //[儲存方案]按鈕
    $('#btnSavePro1,#btnSavePro2,#btnSavePro3,#btnSavePro4,#btnSavePro5').on("click", function (e) {
        var sProNo = $(this).attr("porno");
        var sProNM = $('#iptProgramName' + sProNo).val();
        if (sProNM == "") { ctrlMsg("SF", "", "#iptProgramName" + sProNo); return; }
        var INS_Arr = $('#tblInsuranceList').DataTable().data().toArray();  //險種資料
        INS_Arr = INS_Arr.filter(function (x) { return x.ZCVRTYPE != '21' });
        if (INS_Arr.length == 0) { MsgBox('錯誤', "[承保內容]無任意險種，請重新選擇！", 'red'); return; }
        ConfirmBox('確認儲存?', '請確認是否將目前[承保內容]儲存至[' + sProNM + ']?', 'orange', function () {
            BlockUI('作業中，請稍後');
            setTimeout(function () {
                var param = {sProgramNo: sProNo, sProgramName: sProNM, sProgCode: "QuotationEdit", INS_Data: INS_Arr}    //寫入參數
                var dt = getdata("/Quotation/UserInsSettingSave", param);   //[儲存]後，[查詢]自訂方案清單
                setDDLZCAMPAN(dt);  //設定[活動方案/自訂方案]下拉選單內容
                _div4.find('#selZCAMPAN').val(sProNo);
                ///[活動方案]清單處理
                var sZCAMPANList = "";    //[活動方案]清單
                $.each(INS_Arr, function (i, item) {
                    if (item.ZCVRTYPE != "21") {    //不含21強制險
                        sZCAMPANList += item.ZCVRTYPE + "|";  //[活動方案]清單
                    }
                });
                console.log("sZCAMPANList=" + sZCAMPANList);
                $('#divQuoteDate').data("ZCAMPANList", sZCAMPANList);   //將[活動方案]清單，存起來，以供清除時使用
                $('#divSetUserPro').hide(200);  //關閉[自訂方案]
                MsgBox('', '[' + sProNM + ']儲存完成！', 'green');
            }, 1);
        });
    });
    //[刪除方案]按鈕
    $('#btnDelPro1,#btnDelPro2,#btnDelPro3,#btnDelPro4,#btnDelPro5').on("click", function (e) {
        var sProNo = $(this).attr("porno");
        var sProNM = $('#iptProgramName' + sProNo).val();
        ConfirmBox('確認刪除?', '請確認是否將目前方案[' + sProNM + ']進行刪除?', 'orange', function () {
            BlockUI('作業中，請稍後');
            setTimeout(function () {
                var dt = getdata("/Quotation/UserInsSettingDel", { sProgramNo: sProNo });
                setDDLZCAMPAN(dt);              //設定[活動方案/自訂方案]下拉選單內容
                $('#selZCAMPAN').val('');       //清空[活動方案]
                $('#iptProgramName' + sProNo).val('');
                $('#divSetUserPro').hide(200);  //關閉[自訂方案]
                MsgBox('', '[' + sProNM + ']刪除完成！', 'green');
            }, 1);
        });
    });
    //[清除任意承保險種]按鈕
    $('#btnDelInsAny').on("click", function (e) {
        CreatInsDT({});                     //清除險種資料
        _div4.find("#chkMan").change();     //若有勾選強制險，則新增強制險
        $('#selZCAMPAN').val('');           //清空[活動方案]
    });
    /*====== 按鈕處理事件_End ==========================*/
}

/******DataTable處理事件_Start***********************/
//險種試算資料_建立DataTables
function CreatInsDT(dtSource) {
    consLogDate("CreatInsDT_(" + dtSource.length + ")");
    var dtObjid = "tblInsuranceList";
    var hideid = 9;
    if ($('#selPAYWAY').val() == "C012") { hideid = 8; }//當[付款方式]為"分期付款"，則隱藏[保險費]欄位    
    $('#' + dtObjid).DataTable({
        destroy: true,
        dom: '<"top">rt<"bottom">pli<"clear">',
        language: DataTablsChineseLanguage,
        searching: false,
        autoWidth: false,
        info: false,
        processing: false,
        data: dtSource,
        fixedHeader: { header: true, headerOffset: 45 },
        pagingType: "full_numbers",
        lengthChange: false,
        paging: false,
        orderCellsTop: false,
        order: [12, 'asc'],    //預設排序為位置[空值]，表示不預設排序
        columnDefs: [
        { visible: false, targets: [0, 1, hideid, 10, 11, 12] },
        {
            className: "text-center custom-middle-align",
            targets: [
            0   /*刪除*/
            , 1 /*編輯*/
            , 10 //FindTableIndex(dtObjid, '係數一') + 1
            , 11 //FindTableIndex(dtObjid, '係數二') + 1
            , 7 //FindTableIndex(dtObjid, '自負額') + 1
            ]
        },
        {
            className: "text-left custom-middle-align",
            targets: [3   /*險種*/]
        },
        {
            className: "text-right custom-middle-align",
            targets: [
            4 //FindTableIndex(dtObjid, '保額一') + 1
            , 5 //FindTableIndex(dtObjid, '保額二') + 1
            , 6 //FindTableIndex(dtObjid, '保額三') + 1
            , 8 //FindTableIndex(dtObjid, '保險費') + 1
            , 9 //FindTableIndex(dtObjid, '月繳保費') + 1
            ]
        }
        ],
        columns: [
        {   //[刪除]按鈕
            width: "4%"/*"50px"*/,
            data: function (source, type, val) {
                return '<button style="min-width:10px!important" type="button" class="btn btn-info" id="btnInsDel" onclick="return insDel(\'' + source.ZCVRTYPE + '\')"><i class="fa fa-times"></i> 刪除</button>'
            }
        }
        , { //[編輯]按鈕
            width: "4%"/*"50px"*/,
            data: function (source, type, val) {
                return '<button style="min-width:10px!important" type="button" class="btn btn-info" id="btnInsLoad" onclick="return insLoad(\'' + source.ZCVRTYPE + '\')"><i class="fa fa-share"></i> 編輯</button>'
            }
        }
        , { width: "6%", data: "ZCVRTYPE", className: "text-center" }	//險種代碼//, className: "hide_column"
        , { width: "30%", data: "ZCVRTYPENM", className: "custom-middle-align" }	//險種
        , { width: "12%", data: "SUMINA", render: $.fn.dataTable.render.number(',', '.', 0, '') }	//保額一
        , { width: "12%", data: "SUMINB", render: $.fn.dataTable.render.number(',', '.', 0, '') }	//保額二
        , { width: "12%", data: "SUMINC", render: $.fn.dataTable.render.number(',', '.', 0, '') }	//保額三
        , { width: "8%", data: "EXCESS" }   //自負額
        , { width: "12%", data: "MVPPREM", render: $.fn.dataTable.render.number(',', '.', 0, '') } //保險費
        , { width: "0%", data: "InsMonth", render: $.fn.dataTable.render.number(',', '.', 0, '') }	//月繳保費
        , { width: "0%", data: "ZFACTORA" }	            //係數一
        , { width: "0%", data: "ZFACTORB" }	            //係數二
        , { width: "0%", data: "InsOrder" }              //險種順序
        // 上述visible: false失效時，再改用下面這段hide_column隱藏欄位
        //, { data: "MVPPREM", render: $.fn.dataTable.render.number(',', '.', 0, ''), className: hideid == 7 ? "hide_column" : "" } //保險費
        //, { data: "InsMonth", render: $.fn.dataTable.render.number(',', '.', 0, ''), className: hideid == 8 ? "hide_column" : "" }	//月繳保費
        ]
    })
    consLogDate("CreatInsDT_(E)");
}
/******DataTable處理事件_End*************************/


/******自訂函式_Start********************************/
//[刪除]處理
function insDel(zcvrtype) {
    console.log(zcvrtype);
    ConfirmBox('確認刪除?', '是否確認刪除?', 'orange', function () {
        var dt = $('#tblInsuranceList').DataTable();
        $.each(dt.rows().data(), function (i, item) {
            if (item.ZCVRTYPE == zcvrtype) {
                if (zcvrtype == '21') {
                    $("#chkMan").prop("checked", false).change();
                }
                dt.row('.selected').remove().draw();
            }
        });
        ctrlIns.DepRate();      //更新[折舊率]
        //CreatInsDT(dt.data());
        insuredDT();
        $('#divInsured').hide();
    });
}
//[編輯帶入]處理
function insLoad(zcvrtype) {
    BlockUI('作業中，請稍後');
    setTimeout(function () {
        $('#divInsured').show(200);                 //開啟[險種資訊]
        $('#btnInsAdd').hide();                     //隱藏[確定新增]按鈕
        $('#btnInsUpd').show();                     //顯示[確定儲存]按鈕
        var dt = $('#tblInsuranceList').DataTable();
        var thisDT = $.grep(dt.rows().data(), function (x) {
            return x.ZCVRTYPE === zcvrtype;
        });
        if (thisDT.length > 0) {
            $('#btnInsUpd').removeAttr('disabled');         //[修改]按鈕設定可使用
            $('#divQuoteDate').data("isInsLoad", true);     //設定[是否為帶入資料](true:是)
            $('#selZCVRTYPE').val(zcvrtype).change();       //[險種]選取
            $('#divQuoteDate').data("isInsLoad", false);    //設定[是否為帶入資料](false:否)
            setTimeout(function () {
                if ($('#selZCVRTYPE').val() == '') { $('#divInsured').hide(); return; }
                ///--[險種]處理----------------------------------------------------------
                //---------險種[28,29,30]特別處理程序_Start-------
                var EXCESSList = "28|29|30";
                if (EXCESSList.indexOf(zcvrtype) > -1) {
                    $('#selSUMINC').val(thisDT[0].SUMINC).change();
                    $('#selEXCESS').val(thisDT[0].EXCESS);
                    //$('#selEXCESS').val(thisDT[0].EXCESS).change();
                    //setTimeout(function () {
                    //    $('#selSUMINC').val(getObjToVal(thisDT[0].SUMINC).toString().replace(/[,]/g, ""));
                    //}, 500);
                    return;
                }
                //---------險種[28,29,30]特別處理程序_End---------
                //$('#selZCVRTYPE').val(thisDT[0].ZCVRTYPE).change();
                $('#selZFACTORA').val(thisDT[0].ZFACTORA);
                $('#selZFACTORB').val(thisDT[0].ZFACTORB);
                $('#selEXCESS').val(thisDT[0].EXCESS);
                //--[保額一～三]處理_Start-----------------------------------------------
                var SUMINA = getObjToVal(thisDT[0].SUMINA).toString().replace(/[,]/g, "");
                var SUMINB = getObjToVal(thisDT[0].SUMINB).toString().replace(/[,]/g, "");
                var SUMINC = getObjToVal(thisDT[0].SUMINC).toString().replace(/[,]/g, "");
                var selSUMINA = $('#selSUMINA')[0];
                var selSUMINB = $('#selSUMINB')[0];
                var selSUMINC = $('#selSUMINC')[0];
                var arr = [];
                //判斷[下拉選單]內容與文字是否相同
                var isSame = true;
                if (selSUMINA.length > 0
                    && (getObjToVal(selSUMINA[1], "text").replace(/[,]/g, "") != getObjToVal(selSUMINA[1], "value"))) {
                    isSame = false;
                } else if (selSUMINB.length > 0
                    && (getObjToVal(selSUMINB[1], "text").replace(/[,]/g, "") != getObjToVal(selSUMINB[1], "value"))) {
                    isSame = false;
                } else if (selSUMINC.length > 0
                    && (getObjToVal(selSUMINC[1], "text").replace(/[,]/g, "") != getObjToVal(selSUMINC[1], "value"))) {
                    isSame = false;
                }
                if (isSame) {
                    //若相同，則直接設定來源值
                    //$('#selSUMINA').val(SUMINA);
                    if ($('#iptSUMINA').is(":hidden")) {
                        $('#selSUMINA').val(SUMINA).change();
                    } else {
                        $('#iptSUMINA').val(SUMINA).blur();
                    }
                    $('#selSUMINB').val(SUMINB).change();
                    //$('#selSUMINC').val(SUMINC);
                    if ($('#iptSUMINC').is(":hidden")) {
                        $('#selSUMINC').val(SUMINC);
                    } else {
                        $('#iptSUMINC').val(SUMINC).blur();
                    }
                } else {
                    //若不相同，則需要找出相同檔次，再將id值，設定回去
                    var len = 0;
                    var val = "";
                    if (selSUMINA.length > 0) { len = selSUMINA.length; }
                    else if (selSUMINB.length > 0) { len = selSUMINB.length; }
                    else if (selSUMINC.length > 0) { len = selSUMINC.length; }
                    for (let i = 0; i < len; i++) {
                        if (selSUMINA.length > 0) { val = selSUMINA[i].value; }
                        else if (selSUMINB.length > 0) { val = selSUMINB[i].value; }
                        else if (selSUMINC.length > 0) { val = selSUMINC[i].value; }
                        arr.push({
                            ID: val
                                , SUMINA: getObjToVal(selSUMINA[i], "text").replace(/[,]/g, "")
                                , SUMINB: getObjToVal(selSUMINB[i], "text").replace(/[,]/g, "")
                                , SUMINC: getObjToVal(selSUMINC[i], "text").replace(/[,]/g, "")
                        });
                    }
                    $.each(arr, function (i, item) {
                        if (item.SUMINA == SUMINA && item.SUMINB == SUMINB && item.SUMINC == SUMINC) {
                            $('#selSUMINA, #selSUMINB, #selSUMINC').val(item.ID);
                        }
                    });
                }
                //--[保額一～三]處理_End-------------------------------------------------
            }, 20);
        }
        $('#selZCVRTYPE').focus().attr('disabled', true);   //鎖住[險種]下拉選單
        $.unblockUI();
    }, 1);
}
//計算車齡
function getCarAge() {
    /*計算車齡，目前WEB是否也要加上?
      規則:「車齡」，是以「保單生效年月」與「發照年月」判斷。「車齡」小於12個月視為「一年車」；
     「車齡」大於等於12個月且小於24個月視為「兩年車」…其餘類推。*/
    var iIssueYear = getObjToVal($('#selIssueYear').val()) + '/' + getObjToVal($('#selIssueMonth').val());          //[發照年月]
    var inssdate = getObjToVal($('#iptCCDATES').val());     //任意保期(起)
    if (inssdate == "") {
        inssdate = getObjToVal($('#iptFRDATES').val());     //強制保期(起)
    }
    if (inssdate.length == 10) {
        iIssueYear = iIssueYear + "/01";
        inssdate = inssdate.substr(0, 8) + "01";
    } else {
        return "";
    }
    var diffyear = (new Date(inssdate)).getFullYear() - (new Date(iIssueYear)).getFullYear();
    var diffmonth = ((new Date(inssdate)).getMonth() + 1) - ((new Date(iIssueYear)).getMonth() + 1) + (diffyear * 12);
    //var diffmonth = (new Date(inssdate)).getMonth() - (new Date(iIssueYear)).getMonth();
    //$('#txtRecords').val('inssdate=' + inssdate + ',iIssueYear=' + iIssueYear);
    if (isNaN(diffyear) || isNaN(diffmonth)) {
        return "";
    }
    var CarAge = parseInt(diffmonth / 12);
    //var diffMmun = diffmonth + (diffyear * 12);
    //var CarAge = parseInt(diffMmun / 12);
    //console.log("diffyear=" + diffyear);
    //console.log("diffmonth=" + diffmonth);
    //console.log("diffMmun=" + diffMmun);
    //console.log("CarAge=" + CarAge);
    return CarAge;
}
//移除重複選單
function setDDLRep(objNM) {
    var val = "";
    $("#" + objNM + " option").each(function (i, e) {
        val = this.value;
        if ($("#" + objNM + " option[value='" + val + "']").length > 1)
            $("#" + objNM + " option[value='" + val + "']:gt(0)").remove();
    });
}
//清空[險種資料]保險費
function clrInsTBPremium() {
    consLogDate("clrInsTBPremium_(S)");
    var dt = _div4.find('#tblInsuranceList').DataTable();
    var MVPPREMSum = dt.rows().data().map(function (x) { return x.MVPPREM });
    //當[付款方式]為"分期付款"，則加總[月繳年保費]欄位的金額
    if ($('#selPAYWAY').val() == "C012") { MVPPREMSum = dt.rows().data().map(function (x) { return x.InsMonth }); }
    MVPPREMSum = MVPPREMSum.length > 0 ? MVPPREMSum.reduce(function (x, y) { return parseInt(x) + parseInt(y) }) : 0;
    if (MVPPREMSum > 0) {
        $.each(dt.data(), function (i, item) {
            if (_strThiefInsList.indexOf(getObjToVal(item.ZCVRTYPE).substring(0, 2)) > -1) {     //車體/竊盜險種清單
                item.SUMINA = "0";  //如果為車體/竊盜險，則保額一清為0
            }
            item.MVPPREM = "0";     //保險費
            item.InsMonth = "0";    //月繳保費
        });
        CreatInsDT(dt.data());      //更新[險種資料]
    }
    _div4.find('#iptTotalInsurance').val('');   //[總保費]清空
    consLogDate("clrInsTBPremium_(E)");
}
//更新[險種資料區][係數一](車齡部份)
function insCarAgeDT() {
    var CarAge = "";    //車齡
    var sZCVRTYPE = ""; //險種
    $.each($('#tblInsuranceList').DataTable().data(), function (i, item) {
        sZCVRTYPE = getObjToVal(item.ZCVRTYPE);
        //更新[係數一]
        if (("16|A6").indexOf(sZCVRTYPE) > -1) {
            CarAge = padLeft(parseInt(getCarAge()) + 1, 2);    //車齡+1
            item.ZFACTORA = CarAge;
        } else if (("91|92|93|94").indexOf(sZCVRTYPE) > -1) {
            CarAge = sZCVRTYPE == "91" ? "A" : sZCVRTYPE == "92" ? "B" : sZCVRTYPE == "93" ? "C" : sZCVRTYPE == "94" ? "D" : "";
            CarAge += getCarAge();    //車齡
            item.ZFACTORA = CarAge;
        }
    });
}
/******自訂函式_End**********************************/