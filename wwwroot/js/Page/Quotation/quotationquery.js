/******全域變數區_Start****************************/
var QuotOtherData = null;
var KYCData = null;
var Countdown = null;       //查看作業記錄function變數
/******全域變數區_End******************************/

/******系統觸發事件_Start**************************/
//[初始化]
window.onload = function () {            //初始化_簽名版元件
    BlockUI('資料載入中，請稍後...');
    setTimeout(function () {
        /*--元件初始化---------------------------------------------*/
        creatDT();              //註冊報價單GRID元件
        creatDT2();             //註冊續保資料GRID元件
        creatDT3();             //註冊團體件資料GRID元件
        creatRevDT();           //註冊審核資料GRID元件
        RegSelectDate();        //註冊下拉日曆
        InitEventBinding();     //初始化_元件事件
        /*--預設值設定---------------------------------------------*/
        $('#iptQuotDate_S').val(GetDay('-1m')).blur();     //報價日期從，預帶前一個月
        $('#iptQuotDate_E').val(GetDay('')).blur();        //報價日期至，預帶今日
        /*--預設值設定---------------------------------------------*/
        $('#iptCreateDate_S').val(GetDay('-1m')).blur();     //上傳日期從，預帶前一個月
        $('#iptCreateDate_E').val(GetDay('')).blur();        //上傳日期至，預帶今日
        /*--元件啟用設定-------------------------------------------*/
        $('#divGrid').hide();//查詢區(關閉)
        $('#iGrid').find('i').removeClass().addClass('fa fa-angle-double-up');
        //初始化QuotOtherData
        InitQuotOther();
        //[畫面調整]
        $(window).bind('resize', function () {
            setTimeout(function () {
                $('#tblDataTable, #tblDataTable2, #tblReviewInfoDT').DataTable().columns.adjust().responsive.recalc();
                $.unblockUI();
            }, 50)
        });
        //焦點移至分頁最上方
        setTimeout(function () {
            $('html, body').animate({ scrollTop: 0 }, 0);
            $(window).resize();         //畫面調整
        }, 200);
        $.unblockUI();
    }, 1);
}
//事件初始化
function InitEventBinding() {
    /******控制項觸發事件_Start**************************/
    //[報價單類別]選取事件
    $('input[name=rdoContinue]').change(function (e) {
        var sKey = $('input[name=rdoContinue]:checked').val();
        switch (sKey) {
            case "Y":       //[續保查詢]
                $('#divQuery input[type=text]').parent().hide();    /*隱藏所有欄位*/
                /*顯示[上年度保單號碼][上年度強制證號][車主ID][牌照號碼]*/
                $('#iptPOLNUM,#iptOLDPOLNUM,#iptCustID,#iptLicenseNo').parent().show();
                $('#divInsuranceType').show();  /*顯示[保單狀態]*/
                $('#iGrid2').parent().show();
                $('#iGrid,#iGrid3').parent().hide();
                break;
            case "B":       //[團體件查詢]
                $('#divQuery input[type=text]').parent().hide();    /*隱藏所有欄位*/
                /*顯示[團體件序號][大保單號碼]*/
                $('#iptBatchNo,#iptAmwayNo').parent().show();
                $('#iptCreateDate_S,#iptCreateDate_E').attr('required', true).parent().show();
                $('#divInsuranceType').hide();      /*隱藏[保單狀態]*/
                $('#iGrid3').parent().show();
                $('#iGrid,#iGrid2').parent().hide();
                break;
            default:        //[一般查詢]
                $('#divQuery input[type=text]').parent().show();    /*顯示所有欄位*/
                /*顯示[團體件序號][大保單號碼][經手人][單位別]*/
                $('#iptPOLNUM,#iptOLDPOLNUM,#iptBatchNo,#iptBranchNo').parent().hide();
                $('#iptCreateDate_S,#iptCreateDate_E').removeAttr('required').parent().hide();
                $('#divInsuranceType').hide();      /*隱藏[保單狀態]*/
                $('#iGrid').parent().show();
                $('#iGrid2,#iGrid3').parent().hide();
                break;
        }
        setTimeout(function () {
            $('#tblDataTable, #tblDataTable2, #tblDataTable3, #tblReviewInfoDT').DataTable().columns.adjust().responsive.recalc();
            $.unblockUI();
        }, 50)
    });
    //註冊_[車險報價審核資料]視窗彈出事件
    $('#divReviewInfo').on('shown.bs.modal', function (e) {
        BlockUI('資料查詢中，請稍後...');
        $("#iptMEMO").val('');
        var url = "/Quotation/GetQuotationReview";
        var param = {
            sQUOTENO: $('#hidQuotNo_400').val()
        }
        setTimeout(function () {
            var dt = getdata(url, param);
            creatRevDT(dt);
            $("#iptMEMO").val(getObjToVal(dt[0].MEMO));
            $(window).resize();
            //重新調整畫面，避免RWD失效
            $('#tblReviewInfoDT').css('display', 'table');
            $('#tblReviewInfoDT').DataTable().responsive.recalc();
            $('#tblReviewInfoDT').DataTable().columns.adjust().responsive.recalc();
            $('#iptRevQUOTENO').val($('#hidQUOTENO').val());
            $.unblockUI();
        }, 500);
    });
    //列印選項控制
    $('.chkPrint').on('click', function () {
        switch ($(this).val()) {
            case "1":
                $('input:checkbox.chkPrint[value=2]').prop('checked', false);
                break;
            case "2":
                $('input:checkbox.chkPrint[value=1]').prop('checked', false);
                break;
        }
    });

    //[銷帳代號]改變事件
    $("#iptPayNo").on("blur", function (e) {
        var isNone = (this.value != "") ? "none" : "";
        $("#iptQuotDate_S,#iptQuotDate_E,#iptEddeDate_S,#iptEddeDate_E").parent().attr('style', 'display:' + isNone);
    });
    $("#iptPayNo").on("keyup", function (e) {
        var isNone = ($("#iptPayNo").val() != "") ? "none" : "";
        $("#iptQuotDate_S,#iptQuotDate_E,#iptEddeDate_S,#iptEddeDate_E").parent().attr('style', 'display:' + isNone);
    });
    //{郵寄報價文件}[收件者][副本]焦點離開事件
    $('#ipCustEmail,#ipAgntEmail').on("blur", function (e) {
        removeMsgInElm('#' + e.target.id);   //訊息移除
        if (this.value == '') { return; }
        if (!checkMail(this.value)) { ShowMsgInElm('#' + this.id, '輸入錯誤!'); }
        e.preventDefault();
        e.stopImmediatePropagation();
    });
    /******控制項觸發事件_End****************************/

    /******按鈕處理事件_Start****************************/
    //{條件區}[確認]按鈕
    $('#btnConfirm').click(function (e) {
        if (!ValidateDiv('divQuery')) { return; }
        var sAgentNo = $('#iptAgentNo').val();
        if (sAgentNo == "") { sAgentNo = $('#hidagntnum').val(); }
        else {
            //判斷輸入的經手人是否為，該用戶ID所可使用的經手人
            if ($('#hidagntnum').val().indexOf(sAgentNo) == -1) {
                ShowMsgInElm('#iptAgentNo', '[經手人]錯誤！'); $('#iptAgentNo').focus(); return;
            }
        }
        $('#btnAmwayPrint').parent().hide();
        var sIsContinue = $('input[name=rdoContinue]:checked').val();  //是否為續保件查詢
        switch (sIsContinue) {
            case "Y":       //[續保件]查詢
                let _sCHDRNUM = "";
                let iptPOLNUM = $('#iptPOLNUM').val();
                let iptOLDPOLNUM = $('#iptOLDPOLNUM').val();
                let iptCustID = $('#iptCustID').val();
                let iptLicenseNo = $('#iptLicenseNo').val();
                let hidagent = $('#hidagentReCodeList').val();
                let hidsalescode = $('#hidsalesReCodeList').val();
                let hidchannelcode = $('#hidchannelCode').val();    //ZAGT,ZAGS是內部人員
                let sInsuranceType = $('input[name=rdoInsuranceType]:checked').val();
                if (hidchannelcode == "ZAGT" || hidchannelcode == "ZAGS") {
                    //如果為內部人員，則不看[業務人員編號](帶','號則SP會判斷不看此條件)
                    hidsalescode = ",";
                }
                var isChecked = true;
                if (iptPOLNUM != "" && iptOLDPOLNUM != "") {
                    MsgBox('錯誤', '上年度保單號碼/上年度強制證號，請擇一輸入', 'red');
                    isChecked = false;
                }
                else if (iptPOLNUM == "" && iptOLDPOLNUM == "" && iptCustID == "" && iptLicenseNo == "") {
                    MsgBox('錯誤', '請至少輸入一個查詢條件', 'red');
                    isChecked = false;
                }
                if (iptPOLNUM != "") {
                    _sCHDRNUM = iptPOLNUM;
                }
                else if (iptOLDPOLNUM != "") {
                    _sCHDRNUM = iptOLDPOLNUM;
                }
                if (isChecked) {
                    BlockUI('資料查詢中，請稍後...');
                    $('#divQuery').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
                    $('#divGrid2').show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
                    setTimeout(function () {
                        var param = {
                            sCHDRNUM: _sCHDRNUM
                            , sCustID: iptCustID
                            , sLicenseNo: iptLicenseNo
                            , sAGNTNUM: hidagent
                            , sLIFEAGNT: hidsalescode
                            , sInsuranceType: sInsuranceType
                        }
                        creatDT2(getdata("/Quotation/GetProceedQuery", param));
                        $.unblockUI();
                    }, 60);
                }
                break;
            case "B":       //[團體件]查詢 
                $('#divQuery').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
                $('#divGrid3').show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
                BlockUI('資料查詢中，請稍後...');
                setTimeout(function () {
                    var param = {
                        sBatchNo: $('#iptBatchNo').val()
                        , sAmwayNo: $('#iptAmwayNo').val()
                        , sAgentNo: $('#iptAgentNo').val()
                        , sBranchNo: $('#iptBranchNo').val()
                        , sCreateDate_S: $('#iptCreateDate_S').val()
                        , sCreateDate_E: $('#iptCreateDate_E').val()
                    }
                    var dt3 = getdata("/QuotationBatch/GetQuotBatchMaster", param);
                    creatDT3(dt3.Data);
                    $(window).resize();
                    setTimeout(function () {
                        $('#tblDataTable3').DataTable().columns.adjust().responsive.recalc();
                    }, 100);
                    $.unblockUI();
                }, 60);
                break;
            default:        //[一般件]查詢
                $('#divQuery').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
                $('#divGrid').show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
                BlockUI('資料查詢中，請稍後...');
                setTimeout(function () {
                    var param = {
                        sQuotNo: $('#iptQuotNo').val()                  //報價單編號
                        , sQuotNo_400: $('#iptQuotNo_400').val()        //AS400報價單編號
                        , sQuotDate_S: $('#iptQuotDate_S').val()        //報價日期(起)
                        , sQuotDate_E: $('#iptQuotDate_E').val()        //報價日期(迄)
                        , sAgentNo: sAgentNo                            //經手人
                        , sCustID: $('#iptCustID').val()                //客戶ID
                        , sCustName: $('#iptCustName').val()            //客戶姓名
                        , sLicenseNo: $('#iptLicenseNo').val()          //牌照號碼
                        , sEddeDate_S: $('#iptEddeDate_S').val()        //生效日期(起)
                        , sEddeDate_E: $('#iptEddeDate_E').val()        //生效日期(迄)
                        , sIsConfirm: $('#rdoIsConfirm:checked').val()  //暫存類別(是否確定出單)
                        , sPayNo: $('#iptPayNo').val()                  //銷帳代號
                        , sAmwayNo: $('#iptAmwayNo').val()              //大保單號碼
                    }
                    creatDT(getdata("/Quotation/GetQuotationQueryData", param));
                    //if ($('#iptAmwayNo').val() != "" && $('#tblDataTable').DataTable().rows().count() > 0) {
                    //    $('#btnAmwayPrint').parent().show();    /*按鈕[大保單列印]*/
                    //}
                    $(window).resize();
                    $.unblockUI();
                }, 60);
                break;
        }
    });

    ////{條件區}[整批列印]按鈕
    //$('#btnBatchPrint').click(function () {
    //    //var formData = new FormData();
    //    //formData.append("sQuotNo", $('#iptQuotNo').val())                  //報價單編號
    //    //formData.append("sQuotNo_400", $('#iptQuotNo_400').val())        //AS400報價單編號
    //    //formData.append("sQuotDate_S", $('#iptQuotDate_S').val())        //報價日期(起)
    //    //formData.append("sQuotDate_E", $('#iptQuotDate_E').val())        //報價日期(迄)
    //    //formData.append("sAgentNo", sAgentNo)                            //經手人
    //    //formData.append("sCustID", $('#iptCustID').val())                //客戶ID
    //    //formData.append("sCustName", $('#iptCustName').val())            //客戶姓名
    //    //formData.append("sLicenseNo", $('#iptLicenseNo').val())          //牌照號碼
    //    //formData.append("sEddeDate_S", $('#iptEddeDate_S').val())        //生效日期(起)
    //    //formData.append("sEddeDate_E", $('#iptEddeDate_E').val())        //生效日期(迄)
    //    //formData.append("sIsConfirm", $('#rdoIsConfirm:checked').val())  //暫存類別(是否確定出單)
    //    //formData.append("sPayNo", $('#iptPayNo').val())                  //銷帳代號
    //    //formData.append("sAmwayNo", $('#iptAmwayNo').val())              //大保單號碼
    //    //$('#')

    //    var sAgentNo = $('#iptAgentNo').val();
    //    if (sAgentNo == "") { sAgentNo = $('#hidagntnum').val(); }
    //    else {
    //        //判斷輸入的經手人是否為，該用戶ID所可使用的經手人
    //        if ($('#hidagntnum').val().indexOf(sAgentNo) == -1) {
    //            ShowMsgInElm('#iptAgentNo', '[經手人]錯誤！'); $('#iptAgentNo').focus(); return;
    //        }
    //    }

    //});

    //{條件區}[清除]按鈕
    $('#btnClear').click(function (e) {
        $('#divQuery').find('input[type=text]').each(function () { $(this).val('') });    //清除特定div底下所有輸入項目的值
        $('#iptQuotDate_S').val(GetDay('-1m')).blur();     //報價日期從，預帶前一個月
        $('#iptQuotDate_E').val(GetDay('')).blur();        //報價日期至，預帶今日
        $('#iptEddeDate_S').val('').blur();
        $('#iptEddeDate_E').val('').blur();
        $('#iptPayNo').blur();
        $('#iptCreateDate_S').val(GetDay('-1m')).blur();     //上傳日期從，預帶前一個月
        $('#iptCreateDate_E').val(GetDay('')).blur();        //上傳日期至，預帶今日
        $("input[name=rdoContinue][value='N']").prop("checked", true).change();    //是否查詢暫存資料
    });
    //{列印區}[確定]按鈕
    $('#btnPrintConfirm').click(function () {
        let printItem = $(".chkPrint:checked").map(function () {
            return $(this).val();
        }).get();
        if (printItem != undefined && printItem.length > 0) {
            PrintReport("/Quotation/GenPDF", printItemModelInit(), printItem);
        }
        else {
            MsgBox('列印錯誤', '列印項目未選擇！', 'red');
        }
    });
    //{附件上傳區}[上傳]按鈕
    $("#btnUploadFile").click(function () {
        let inputFile = $('#UploadFileDiv .uploadFile');
        if (inputFile == undefined || inputFile == null || inputFile.length == 0) {
            MsgBox('上傳檔案錯誤', "您未選擇檔案", 'red'); return false;
        }
        inputFile = inputFile.filter(function (index) {
            return (inputFile[index].files.length > 0 && inputFile[index].files[0].name != "");
        });
        if (inputFile.length == 0) {
            MsgBox('上傳檔案錯誤', "您未選擇檔案", 'red'); return false;
        }
        else if (inputFile.length > 10) {
            MsgBox('上傳檔案錯誤', "檔案最多選擇10個", 'red'); return false;
        }
        let isChecked = true;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            inputFile.each(function (index, element) {
                var fsize = element.files[0].size; //get file size
                var ftype = element.files[0].type; // get file type
                //allowed file types
                switch (ftype) {
                    case 'image/png':
                        //case 'image/gif':
                    case 'image/jpeg':
                    case 'image/pjpeg':
                        //case 'text/plain':
                        //case 'text/html':
                        //case 'application/x-zip-compressed':
                        //case 'application/x-rar-compressed':
                        //case 'application/octet-stream':
                    case 'application/pdf':
                        //case 'application/msword':
                        //case 'application/vnd.ms-excel':
                        //case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        //case 'video/mp4':
                        break;
                    default:
                        MsgBox('上傳檔案錯誤', "請上傳jpg, pdf, png 類型檔案", 'red');
                        isChecked = false;
                }
                //Allowed file size is less than 4 MB
                if (fsize > 4000000) {
                    MsgBox('上傳檔案錯誤', "您上傳的檔案當中超過4MB 容量大小限制", 'red');
                    //notify("Your total upload Size is: " + bytesToSize(fsize) + "<br/>File(s) is too big, it should be less than 27 MB.");
                    isChecked = false;
                }
            });
        } else {
            MsgBox('上傳檔案錯誤', "Please upgrade your browser, because your current browser lacks some new features we need!", 'red');
            //Output error to older unsupported browsers that doesn't support HTML5 File API
            //notify("Please upgrade your browser, because your current browser lacks some new features we need!");
            return false;
        }
        if (isChecked) {
            BlockUI('檔案上傳中，請稍後...');
            setTimeout(function () {
                var formData = new FormData();
                formData.append('sQUOTENO', $('#hidQUOTENO').val());
                formData.append('sQUOTENO400', $('#hidQuotNo_400').val());
                let _strZautclsMail = $('#hidZautclsMail').val();
                //若有上傳檔案，則CC給經手人
                if (inputFile.length > 0) {
                    let ccMail = "";
                    let AEMailDT = getdata("/Quotation/GetAgntEMail", { sAGNTNUM: $("#divQuery").data("AgentNo") });
                    if (AEMailDT.length > 0) {
                        ccMail = getObjToVal(AEMailDT[0].EMAILLIST);        //從T8250取得EMail
                    }
                    if (checkMail(ccMail)) { _strZautclsMail += ";" + ccMail }
                }
                formData.append('sZautclsMail', _strZautclsMail);
                formData.append('sAgentNo', $("#divQuery").data("AgentNo"));
                inputFile.each(function (index, element) {
                    if (element.files.length > 0) {
                        formData.append("arfile", element.files[0]);
                    }
                });
                $.ajax({
                    type: 'post',
                    url: '/Quotation/UploadFile',
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                }).success(function (data) {
                    $.unblockUI();
                    setTimeout(function () { MsgBox('', data, 'green'); }, 500)
                }).error(function () {
                    $.unblockUI();
                    MsgBox('警告', "上傳失敗", 'red');
                });
            }, 200);
        }
    });
    //{附件上傳區}變更選取的檔名
    $('#divUploadOpt').on('change', 'input[name$="uploadFile"]', function () {
        let oThis = $(this);
        if (oThis[0].files.length > 0) {
            let set = new Set();
            let selectedItem = $('#UploadFileDiv .fileItem');
            if (selectedItem != undefined && selectedItem.length > 0) {
                selectedItem.each(function (index, item) {
                    set.add(item.innerText.replace("[", "").replace("]", ""));
                });
            }
            if (set.has(oThis[0].files[0].name)) {
                MsgBox('上傳檔案錯誤', "請勿選擇相同檔案!", 'red');
                oThis.val('')
            } else {
                let fileName = '[' + oThis[0].files[0].name + ']';
                oThis.parent().next('label').text(fileName);  //加入檔名
                oThis.parent().hide();                                      //自己隱藏
                oThis.parent().next().next().show();                        //顯示刪除icon
                preview(oThis.parent().prev("").prev("").show(), oThis.parent().prev("label").show(), this);    //預覽圖片
                $('#UploadFileDiv').append(oThis.parent().parent().removeClass().addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12 input-group'));
                $('#divUploadOpt').prepend($('#UploadFileTemplate').html());
            }
        }
    });
    //{附件上傳區}刪除當前檔案
    $('#UploadFileDiv').on('click', '.delFile', function () {
        let oThis = $(this);
        oThis.parent().parent().remove();
    });
    //{附件上傳區}關閉事件實作
    $("#divUploadMode").on("hide.bs.modal", function (e) {
        $('#UploadFileDiv > div').remove();
    });
    //郵寄按扭事件開啟信件內文視窗
    $("#btnSendMailConfirm").on("click", function (e) {
        var printItem = $(".chkPrint:checked").map(function () {
            return $(this).val();
        }).get();
        if (printItem != undefined && printItem.length > 0) {
            //讀取信件內容
            $.ajax({
                url: "/Quotation/GetMailInfo",
                type: "POST",
                dataType: 'json', // 預期從server接收的資料型態
                //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
                async: false,
                data: {
                    QuotNo: $('#hidQUOTENO').val()
                },
                success: function (result) {
                    if (result.Success) {
                        $('#ipCustEmail').val(result.Data[0]["CustEmail"]);
                        $('#ipAgntEmail').val(result.Data[0]["AgntEmail"]);
                        $('#ipSUBJECT').val(result.Data[0]["SUBJECT"]);
                        $('#hidCustID').val(result.Data[0]["CustID"]);
                        $('#hidQuotNo_400').val(result.Data[0]["QuotNo_400"]);
                        $('#hidCustName').val(result.Data[0]["CustName"]);
                        $('#hidLicenseNo').val(result.Data[0]["LicenseNo"]);
                        $('#ipBODY').html(result.Data[0]["BODY"].replace(/\|/g, '\n'));
                        $('#divSendMailAttachPDF').modal('show');
                    }
                },
                error: AjaxError
            });
        }
        else {
            MsgBox('郵件內容錯誤', '列印項目未選擇！', 'red');
        }
    });
    //發送mail 事件
    $('#btnSendConfirm').on("click", function () {
        let checkMsg = [];
        let printItem = $(".chkPrint:checked").map(function () {
            return $(this).val();
        }).get();
        let printItemModel = printItemModelInit();
        let attachPDFToMailModel = attachPDFToMailModelInit();
        if ($('#ipSUBJECT').val() == '')
            checkMsg.push("主旨未填寫");
        //mail 欄位檢核
        let arCustEmail = attachPDFToMailModel["CustEmail"] != '' ? attachPDFToMailModel["CustEmail"].split(';') : null;
        let arAgntEmail = attachPDFToMailModel["AgntEmail"] != '' ? attachPDFToMailModel["AgntEmail"].split(';') : null;
        if (arCustEmail == null) {
            checkMsg.push('收件者郵箱未填寫');
        }
        else {
            for (let c = 0; c < arCustEmail.length; c++) {
                if (!checkMail(arCustEmail[c])) {
                    checkMsg.push('收件者郵箱有誤，請修正');
                    break;
                }
            }
        }
        if (arAgntEmail != null) {
            for (let a = 0; a < arAgntEmail.length; a++) {
                if (!checkMail(arAgntEmail[a])) {
                    checkMsg.push('副件郵箱有誤，請修正');
                    break;
                }
            }
        }
        if (checkMsg.length > 0) {
            MsgBox('錯誤', checkMsg.join('<br/>'), 'red');
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        BlockUI('作業中，請稍後...');
        setTimeout(function () {
            $.ajax({
                url: "/Quotation/SendMailAttachPDF",
                type: "POST",
                dataType: 'json', // 預期從server接收的資料型態
                //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
                async: false,
                data: {
                    printItemModel: printItemModel,
                    arPrintItems: printItem,
                    attachPDFToMailModel: attachPDFToMailModel
                },
                success: function (result) {
                    if (result.Success) {
                        MsgBoxCloseFn('', result.Msg, 'green', function () { $('#divSendMailAttachPDF').modal('hide'); });
                    }
                    else {
                        MsgBox('錯誤', result.Msg, 'red');
                    }
                },
                error: AjaxError
            });
            $.unblockUI();
        }, 100);
    });
    //{[一般件]查詢區}[大保單列印]按鈕
    $('#btnAmwayPrint').on("click", function () {
        var sAmwayNo = $('#iptAmwayNo').val();          //大保單號碼
        var sQuotDate_S = $('#iptEddeDate_S').val();    //保單起日
        var sQuotDate_E = $('#iptEddeDate_E').val();    //保單迄日
        var sBatchNo = $('#iptBatchNo').val();          //團體件序號
        if (sBatchNo == "" && (sQuotDate_S == "" || sQuotDate_E == "")) {
            MsgBox('錯誤', "請輸入[生效日期]起訖日期", 'red'); return;
        }
        let sModel = {}
        sModel["sAmwayNo"] = sAmwayNo;
        sModel["sQuotDate_S"] = sQuotDate_S;
        sModel["sQuotDate_E"] = sQuotDate_E;
        sModel["sBatchNo"] = sBatchNo;
        var printForm = $('#printForm');
        //printForm.empty();
        //printForm.append($('<input>').attr({ type: 'hidden', id: 'sAmwayNo', name: 'sAmwayNo', value: sAmwayNo }));
        //printForm.append($('<input>').attr({ type: 'hidden', id: 'sQuotDate_S', name: 'sQuotDate_S', value: sQuotDate_S }));
        //printForm.append($('<input>').attr({ type: 'hidden', id: 'sQuotDate_E', name: 'sQuotDate_E', value: sQuotDate_E }));
        //printForm.append($('<input>').attr({ type: 'hidden', id: 'sBatchNo', name: 'sBatchNo', value: sBatchNo }));
        printForm.find('input').remove();       //要先清除，不然會記錄到上一次的查詢條件
        for (var field in sModel) {
            var item = $('<input>').attr({ type: 'hidden', id: field, name: field, value: sModel[field] });
            printForm.append(item);
        }
        printForm.prop('action', '/QuotationBatch/DolPrintAmwayExcel');
        printForm.submit();
    });
    /******按鈕處理事件_End*******************************/

    /******DataTable處理事件_Start************************/
    //報價單資料_點選觸發事件
    $(document).on("click", "#tblDataTable tbody tr", function () {
        var dt = $('#tblDataTable');
        var index = $(this).context._DT_RowIndex; //行?
        var thisDT = $(this).parent().parent().dataTable();
        if (typeof (index) != "undefined") {
            dt.find('.selected').css('color', '').css('font-weight', '').removeClass('selected');
            $(this).toggleClass('selected');
            dt.find('.selected').css('color', 'red').css('font-weight', 'bold');
        }
    });
    //續保資料_點選觸發事件
    $(document).on("click", "#tblDataTable2 tbody tr", function () {
        var dt = $('#tblDataTable2');
        var index = $(this).context._DT_RowIndex;
        if (typeof (index) != "undefined") {
            dt.find('.selected').css('color', '').css('font-weight', '').removeClass('selected');
            $(this).toggleClass('selected');
            dt.find('.selected').css('color', 'red').css('font-weight', 'bold');
        }
    });
    /******DataTable處理事件_End************************/

    /******行動投保處理事件_Start************************/
    InitMobileInsureEventBinding();
    /******行動投保處理事件處理事件_End************************/
}
//接收監聽事件
window.onmessage = function (e) {
    console.log(e.data);
    //資料解析
    if (e.data.length > 0) {
        var data = e.data[0];
        var syscode = getObjToVal(data["SysCode"]);         //使用[系統別]
        var canvas = document.getElementById("canvas");     //[簽名區]
        switch (syscode) {
            case "QuotationQuerySign":      ///*[簽名版回傳]處理*///
                BlockUI('作業中，請稍後');
                $('#divSignaturePad').modal('hide');    //關閉[簽名版]
                var sData = data["SignData"];           //設定_[簽名內容]
                let Base64ImgModel = [];
                for (let i = 0; i < sData.length; i++) {
                    if (getObjToVal(sData[i]["BASE64TEXT"]) == "" || getObjToVal(sData[i]["saveUrlFNM"]) == "") {
                        MsgBox('錯誤', "無法正確取得簽名檔資訊", 'red');
                        return;
                    }
                    //[Base64字串轉圖片]處理
                    Base64ImgModel.push({ sn: sData[i]["sn"], BASE64TEXT: getObjToVal(sData[i]["BASE64TEXT"]), FileName: getObjToVal(sData[i]["saveUrlFNM"]), QuotNo: getObjToVal(sData[i]["QuotNo"]) });
                }
                //寫入後端
                SaveBase64ToImage(Base64ImgModel);
                break;
            default:
                break;
        }
    }
}
/******系統觸發事件_End******************************/

/******DataTable處理事件_Start************************/
//建立DataTables
function creatDT(dtSource) {
    $('#tblDataTable').DataTable({
        destroy: true,
        language: DataTablsChineseLanguage,
        searching: false,
        autoWidth: false,
        info: false,
        processing: false,
        data: dtSource,
        fixedHeader: { header: true, headerOffset: 45 },
        lengthChange: false,
        paging: true,
        orderCellsTop: false,
        order: [0, 'desc'],    //預設排序為位置0
        columnDefs: [
            { className: "text-center", targets: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11] },
            { className: "text-right", targets: [6] }
        ],
        columns: [
            { data: "QuotNo" },         //報價單號碼
            { data: "QuotNo_400" },	    //AS400報價單號碼
            { data: "AmwayNo" },        //大保單號碼
            { data: "AgentNo" },	    //經手人
            { data: "BranchNo" },	    //單位
            { data: "LicenseNo" },	    //牌照號碼
            { data: "EddeDate" },	    //生效日期
            { data: "Name" },	        //被保險人
            { data: "TotalInsurance", render: $.fn.dataTable.render.number(',', '.', 0, '$') },	//保費
            { data: "QuotDate" },	    //報價日期
            { data: "PayNo" },          //銷帳代號
            {
                //目前狀態
                render: function (meta, type, data, row) {
                    return data.ReviewStatus.replace(/\|/g, "<br/>");
                }
            },
            { //執行
                "data": "id",
                "orderable": false, // 禁用排序
                "defaultContent": "",
                render: function (meta, type, data, row) {
                    var sHtml = '';
                    var sSelHtml = '';
                    var sExeList = getObjToVal(data.ExeList);
                    if (sExeList.indexOf('1') > -1) { sSelHtml += '<option value="1">修改</option>'; }
                    if (sExeList.indexOf('2') > -1) { sSelHtml += '<option value="2">複製為新件</option>'; }
                    if (sExeList.indexOf('3') > -1) { sSelHtml += '<option value="3">列印</option>'; }
                    if (sExeList.indexOf('4') > -1) { sSelHtml += '<option value="4">審核原因查詢</option>'; }
                    if (sExeList.indexOf('5') > -1) { sSelHtml += '<option value="5">要保輸入</option>'; }
                    if (sExeList.indexOf('6') > -1) { sSelHtml += '<option value="6">檢視</option>'; }
                    if (sExeList.indexOf('7') > -1) { sSelHtml += '<option value="7">附件上傳</option>'; }
                    if (sExeList.indexOf('8') > -1) { sSelHtml += '<option value="8">行動投保</option>'; }
                    if (sExeList.indexOf('9') > -1) { sSelHtml += '<option value="9">官網繳費</option>'; }
                    if (sExeList.indexOf('10') > -1) { sSelHtml += '<option value="10">轉予和安保代</option>'; }
                    sHtml = '';
                    sHtml += '<div class="input-group">';   //test
                    sHtml += '<select id="selGrid_' + row.row + '" class="form-control" style="width: 100px; height: 30px; padding: 0px 0px 0px 2px;"><option></option>' + sSelHtml + '</select> ';
                    sHtml += '<span class="input-group-btn">';//test
                    sHtml += '<span class="input-group-addon" style="width: 0px; padding: 0px; font-size: 0px; border: 0"></span>';  //test
                    //sHtml += '<button onclick="exeAction(' + '\'' + data.QuotNo + '\', \'' + data.QuotNo_400 + '\', \'' + data.AgentNo + '\', \'' + data.EddeDate + '\'' + ',  $(this).prev().val(), \''
                    sHtml += '<button onclick="exeAction(' + '\'' + data.QuotNo + '\', \'' + data.QuotNo_400 + '\', \'' + data.AgentNo + '\', \'' + data.EddeDate + '\'' + ',  $(this).parent().prev().val(), \''
                        + data.ForceInsuredFrom + '\', \'' + data.AnyInsuredFrom + '\', \'' + data.PBARExists + '\', \'' + data.ZautclsMail + '\')"';
                    sHtml += 'type="button" class="btn btn-info;" style="height: 30px;color: white;background-color: #337ab7;padding-top: 0px;padding-bottom: 0px;border-top-width: 0px;border-bottom-width: 0px;">執行</button>';
                    sHtml += '</span>';   //test
                    sHtml += '</div>';    //test
                    return sHtml;
                }
            }
        ]
    })
}
//建立DataTables車險報價審核資料
function creatRevDT(dtSource) {
    $('#tblReviewInfoDT').DataTable({
        destroy: true,
        language: DataTablsChineseLanguage,
        searching: false,
        autoWidth: false,
        info: false,
        processing: false,
        data: dtSource,
        fixedHeader: {
            header: true,
            headerOffset: 45
        },
        lengthChange: false,
        paging: false,
        orderCellsTop: false,
        order: [],    //預設排序為位置[空值]，表示不預設排序
        columnDefs: [
        {
            className: "text-center custom-middle-align",
            targets: [0 /*報價單號碼*/
                , 1  /*核保審核原因說明*/
                , 2  /*審核*/
                , 3  /*結果*/
                , 4  /*異動人*/
                , 5  /*異動日期*/
            ]
        }
        ],
        columns: [
            { data: "QUOTENO", orderable: false },	//報價單號碼
            { data: "LONGDESC" },	//核保審核原因說明
            { data: "CHKCOD" },	    //審核
            { data: "FLAG" },	    //結果
            { data: "USERID" },	    //異動人
            { data: function (source) { return $.datefomater(source.CHGDTE); } },   //異動日期
        ]
    });
}
//建立續保查詢 DataTables
function creatDT2(dtSource) {
    $('#tblDataTable2').DataTable({
        destroy: true,
        language: DataTablsChineseLanguage,
        searching: false,
        autoWidth: false,
        info: false,
        processing: false,
        data: dtSource,
        fixedHeader: { header: true, headerOffset: 45 },
        lengthChange: false,
        paging: true,
        orderCellsTop: false,
        //order: [0, 'desc'],    //預設排序為位置0
        columnDefs: [
            { className: "text-center", targets: [0, 1, 2, 3, 4, 5, 7] },
            { className: "text-right", targets: [6] },
        ],
        columns: [
            //{ data: "CHDRNUM" },	    //保單號碼
             { //執行
                 "orderable": false, // 禁用排序
                 "defaultContent": "",
                 render: function (meta, type, data, row) {
                     return data.CHDRNUM + '-' + padLeft(data.TRANNO, 5);
                 }
             },
            { data: "AgentNo" },	    //經手人代號
            { data: "BranchNo" },	    //單位別
            { data: "LicenseNo" },	    //牌照
            { data: "InsuredTo" },	    //保單到期日
            { data: "ZCNAME" },	    //被保險人ID
            { data: "TotalInsurance", render: $.fn.dataTable.render.number(',', '.', 0, '$') },	//保費
            { //執行
                "orderable": false, // 禁用排序
                "defaultContent": "",
                render: function (meta, type, data, row) {
                    var sHtml = '';
                    sHtml += '<button onclick="if(\'%breakInsurance%\' == \'1\' && \'%hidmode%\' != \'PROCEED\'){alert(\'以斷保件做新件報價，請與客戶確認是否同意使用原保單個人資料進行報價。\');} exeProceedIns(\'%CHDRNUM%\', \'%CHDRNUMType%\', \'%hidmode%\')" type="button" class="btn btn-info;" style="height: 30px;color: white;background-color: #337ab7;padding-top: 0px;padding-bottom: 0px;border-top-width: 0px;border-bottom-width: 0px;">' + (data.hidmode == 'PROCEED' ? '續保報價' : '複製為新件') + '</button>';
                    sHtml = sHtml.replace('%CHDRNUM%', data.CHDRNUM).replace('%CHDRNUMType%', data.CHDRNUMType).replace(/%hidmode%/g, data.hidmode).replace('%breakInsurance%', data.breakInsurance);
                    sHtml += '<button onclick="exeProceedIns(\'%CHDRNUM%\', \'%CHDRNUMType%\', \'PROCEEDVIEW\')" type="button" class="btn btn-info;" style="height: 30px;color: white;background-color: #337ab7;padding-top: 0px;padding-bottom: 0px;border-top-width: 0px;border-bottom-width: 0px;">檢視</button>';
                    sHtml = sHtml.replace('%CHDRNUM%', data.CHDRNUM).replace('%CHDRNUMType%', data.CHDRNUMType);
                    return sHtml;
                }
            }
        ]
    })
}
//建立團體件查詢 DataTables
function creatDT3(dtSource) {
    $('#tblDataTable3').DataTable({
        destroy: true,
        language: DataTablsChineseLanguage,
        searching: false,
        autoWidth: false,
        info: false,
        processing: false,
        data: dtSource,
        fixedHeader: { header: true, headerOffset: 45 },
        lengthChange: false,
        paging: true,
        orderCellsTop: false,
        order: [0, 'desc'],    //預設排序為位置0
        columnDefs: [
            { className: "text-center", targets: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
        //    , { className: "text-right", targets: [2, ] }
        ],
        columns: [
            //{ data: "BatchNo" },	    //0團體件序號
            { //0團體件序號
                width: "80px",
                data: function (source, type, val) {
                    return '<a id="aOpenDiv" style="cursor:pointer" onclick="selectBatchRow(\'' + source.BatchNo + '\',\'' + source.AmwayNo + '\');">' + source.BatchNo + '</a>';
                }
            },
            { width: "80px", data: "ProNUM" },	        //1作業次數
            { width: "80px", data: "AmwayNo" },	        //2大保單號碼
            { width: "80px", data: "AgentNo" },	        //3經手人代號
            { width: "80px", data: "BranchNo" },	    //4單位別
            { width: "80px", data: "InputCount" },	    //5匯入筆數
            { width: "80px", data: "BatchStatusDesc" },	    //6上傳結果
            { width: "80px", data: "ShiftDate" },	    //7上傳日期
            {
                width: "180px",                         //8功能區
                data: function (source, type, val, row) {
                    let arOpts = source.DDLItem.split("|");
                    let sOpts = "";
                    $(arOpts).each(function (index, element) {
                        let arOptItem = element.split(":");
                        if (arOptItem != undefined && element.length > 0)
                            sOpts += "<option value='" + arOptItem[0] + "'>" + arOptItem[1] + "</option>";
                    });
                    let sHtml = '';
                    sHtml += '<div class="col-lg-offset-2 col-lg-3 input-group">';
                    sHtml += ' <select id="selGrid_' + row.row + '" class="form-control" style="width: 100px; height: 30px; padding: 0px 0px 0px 2px;"><option></option>' + sOpts + '</select> ';
                    sHtml += ' <span class="input-group-btn">';
                    sHtml += '  <button type="button" onclick="exeBatchAct(\'' + source.BatchNo + '\', \'' + source.BatchStatus + '\' ,$(this).parent().prev().val())" class="btn btn-info;" style="height: 30px;color: white;background-color: #337ab7;padding-top: 0px;padding-bottom: 0px;border-top-width: 0px;border-bottom-width: 0px;">執行</button>';
                    sHtml += ' </span>';
                    sHtml += '</div>';
                    return sHtml;
                }
            }
        ]
    })
}
/******DataTable處理事件_End***************************/


/******自訂函式_Start**********************************/
///*==[控制類]_Start===========================*/
//[執行]動作處理
/*([quotno]:報價單號,[quotno_400]:400報價單號,[AgentNo]:經手人,[EddeDate]:生效日期,[elem]:按鈕物件, [ForceInsuredFrom]:強制險日期, [AnyInsuredFrom]:任意險日期)
,[PBARExists]:用來控制繳款單、預收保費證明是否可列印, [ZautclsMail]:審核人員mail*/
function exeAction(quotno, quotno_400, AgentNo, EddeDate, sAction, ForceInsuredFrom, AnyInsuredFrom, PBARExists, ZautclsMail) {
    $("#divQuery").data("QuotNo", quotno);
    $("#divQuery").data("QuotNo_400", quotno_400);
    $("#divQuery").data("AgentNo", AgentNo);
    $("#divQuery").data("InsSDATE", EddeDate);
    $('#hidQuotNo_400').val(quotno_400);
    $('#hidQUOTENO').val(quotno);
    $('#hidZautclsMail').val(ZautclsMail);

    let tblDataTable = $('#tblDataTable').DataTable().data().toArray();
    let currentDt = tblDataTable.filter(function (item, index, array) {
        return (item.QuotNo_400 == quotno_400);
    });
    switch (sAction) {
        case '1':       /*--[修改]--*/
            $('#hidmode').val('EDIT');
            if (chkEdit()) {
                document.getElementById("queryForm").target = "_self";
                $('#btnEdit').click();
            }
            break;
        case '2':       /*--[複製為新件]--*/
            $('#hidmode').val('COPY');
            document.getElementById("queryForm").target = "_self";
            $('#btnEdit').click();
            break;
        case '3':       /*--[列印]--*/
            if (PrecheckPrint("", "PNT")) {
                $('.chkPrint').prop('checked', false);
                $('input:checkbox.chkPrint').prop('disabled', false);
                if (ForceInsuredFrom != "" && AnyInsuredFrom == "") {               //單強時不可列印要保書
                    $('input:checkbox.chkPrint[value=0]').prop('disabled', true);
                } else if (ForceInsuredFrom == "" && AnyInsuredFrom != "") {        //單任時不可列印強制險要保書
                    $('input:checkbox.chkPrint[value=5]').prop('disabled', true);
                } else if (ForceInsuredFrom == "" && AnyInsuredFrom == "") {        //強加任時提供
                    $('input:checkbox.chkPrint[value=0]').prop('disabled', true);
                    $('input:checkbox.chkPrint[value=5]').prop('disabled', true);
                }
                //完美專案判別單任時不可列印繳費單、預收保費證明、請款憑證
                if (currentDt[0].ProgramCode != '' && ForceInsuredFrom == "" && AnyInsuredFrom != "") {
                    //value=2 繳款單
                    $('input:checkbox.chkPrint[value=2]').prop('disabled', true);
                    //value=1 預收保費證明
                    $('input:checkbox.chkPrint[value=1]').prop('disabled', true);
                    //value=3 請款憑證
                    $('input:checkbox.chkPrint[value=3]').prop('disabled', true);
                }

                if (PBARExists != "Y") {
                    $('input:checkbox.chkPrint[value=2]').prop('disabled', true);
                    $('input:checkbox.chkPrint[value=1]').prop('disabled', true);
                }
                $('#divPrintMode').modal('show');
            }
            break;
        case '4':       /*--[審核原因查詢]--*/
            $('#divReviewInfo').modal('show');
            break;
        case '5':       /*--[要保輸入]--*/
            $('#hidmode').val('TEMP');
            document.getElementById("queryForm").target = "_self";
            $('#btnEdit').click();
            break;
        case '6':       /*--[檢視]--*/
            $('#hidmode').val('VIEW');
            document.getElementById("queryForm").target = "_self";
            $('#btnEdit').click();
            break;
        case '7':       /*--[附件上傳]--*/
            $('#iptUploadQUOTENO').val(quotno + "    " + quotno_400);
            $('#divUploadMode').modal('show');
            $('#uploadFileTitle').text('附件上傳');
            break;
        case '8':       /*--[行動投保]--*/
            ProcessMobileInsure();
            break;
        case '9':       /*--[官網繳費]--*/
            $.ajax({
                url: "/Quotation/GetOfficialPaymentData",
                type: "POST",
                dataType: 'json', // 預期從server接收的資料型態
                //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
                async: false,
                data: {
                    QuotNo: quotno
                    , QuotNo_400: quotno_400
                    , UserID: $('#hiduserid').val()
                },
                success: function (result) {
                    if (result.Success) {
                        var win = window.open(result.Data[0]["Url"], '_blank');
                        var timer = setInterval(function () {
                            if (win != null) {
                                if (win.closed) {
                                    clearInterval(timer);
                                    $('#btnConfirm').click();// Refresh the parent page
                                }
                            }
                        }, 1000);
                    }
                    else {
                        alert(result.Msg);
                    }
                    //let OfficialPaymentForm = $('#OfficialPayment');
                    //if (result.Data != undefined && result.Data != null)
                    //{
                    //    let officialPaymentModel = result.Data[0];
                    //    for (var field in officialPaymentModel) {
                    //        var item = $('<input>').attr({
                    //            type: 'hidden',
                    //            id: field,
                    //            name: field,
                    //            value: officialPaymentModel[field]
                    //        });
                    //        OfficialPaymentForm.append(item);
                    //    }
                    //}
                    //OfficialPaymentForm.prop('method', 'get');
                    //OfficialPaymentForm.submit();
                },
                error: AjaxError
            });
            break;
        case '10':       /*--[轉予和安保代]--*/
            BlockUI('資料傳送中，請稍後...');
            setTimeout(function () {
                $.ajax({
                    url: "/Quotation/SendToHoanAPI",
                    type: "POST",
                    dataType: 'json',
                    async: false,
                    data: { sQuotNo_400: quotno_400 },
                    success: function (result) {
                        console.log(result);
                        if (result.STATUS == 'OK') {
                            MsgBox('', '處理完成！', 'green');
                        }
                        else {
                            var sMsg = getObjToVal(result.MESSAGE);
                            if (sMsg == '') { sMsg = getObjToVal(result.Message); }
                            MsgBox('失敗', '處理訊息：' + sMsg, 'red');
                        }
                    },
                    error: AjaxError
                });
            }, 1);
            break;
    }
}
//[續保查詢]轉頁帶入([CHDRNUM]:上年度保單號碼/上年度強制證號,[CHDRNUMType]:續保號碼類型(1:上年度保單號碼,2:上年度強制證號),[hidmode]:處理模式：續保作業 PROCEED , 複製為新件 PROCEEDNEW )
function exeProceedIns(CHDRNUM, CHDRNUMType, hidmode) {
    $('#hidCHDRNUM').val(CHDRNUM);          //上年度保單號碼/上年度強制證號
    $('#hidCHDRNUMType').val(CHDRNUMType);  //續保號碼類型(1:上年度保單號碼,2:上年度強制證號)
    $('#hidmode').val(hidmode);             //處理模式：續保作業 PROCEED , 複製為新件 PROCEEDNEW
    let oForm = $('#queryForm');
    oForm.prop("target", "_self");
    oForm.prop("action", "QuotationEdit" + (hidmode == "PROCEED" ? "?ConQuot" : ""))
    oForm.submit();
}
//[重新查詢]
function research() {
    $('#divQuery').show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
    creatDT([]);            //註冊GRID元件
    $('#divGrid').hide();   //查詢區(關閉)
    $('#iGrid').find('i').removeClass().addClass('fa fa-angle-double-up');
    $('#divGrid').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
    creatDT2([]);           //註冊GRID元件
    $('#divGrid2').hide();  //查詢區(關閉)
    $('#iGrid2').find('i').removeClass().addClass('fa fa-angle-double-up');
    $('#divGrid2').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
    creatDT3([]);           //註冊GRID元件
    $('#divGrid3').hide();  //查詢區(關閉)
    $('#iGrid3').find('i').removeClass().addClass('fa fa-angle-double-up');
    $('#divGrid3').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
    $('#btnClear').click();
}
//[團體件序號]明細查詢([batchno]:團體件序號, [amwayno]:大保單號碼)
function selectBatchRow(batchno, amwayno) {
    BlockUI('資料查詢中，請稍後...');
    setTimeout(function () {
        $('#divQuery').show(200);
        $("input[name=rdoContinue][value='N']").prop("checked", true).change();
        $('#divQuery').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
        $('#divGrid').show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
        var param = {
            sQuotNo: ''             //報價單編號
            , sQuotNo_400: ''       //AS400報價單編號
            , sQuotDate_S: ''       //報價日期(起)
            , sQuotDate_E: ''       //報價日期(迄)
            , sAgentNo: $('#iptAgentNo').val()    //經手人
            , sCustID: ''           //客戶ID
            , sCustName: ''         //客戶姓名
            , sLicenseNo: ''        //牌照號碼
            , sEddeDate_S: ''       //生效日期(起)
            , sEddeDate_E: ''       //生效日期(迄)
            , sBatchNo: batchno     //團體件序號
            , sAmwayNo: amwayno     //大保單號碼
        };
        $('#iptAmwayNo').val(amwayno);
        $('#iptBatchNo').val(batchno);
        $('#iptQuotDate_S,#iptQuotDate_E,#iptEddeDate_S,#iptEddeDate_E').removeAttr('required').parent().hide();
        creatDT(getdata("/Quotation/GetQuotationQueryData", param));
        if ($('#iptAmwayNo').val() != "" && $('#tblDataTable').DataTable().rows().count() > 0) {
            $('#btnAmwayPrint').parent().show();    /*按鈕[大保單列印]*/
        }
        $(window).resize();
        $.unblockUI();
    }, 60);
}
//{團體件}[執行]動作處理/*([quotno]:報價單號*/
function exeBatchAct(sBatchNo, sBatchStatus, sAction) {
    switch (sAction) {
        case '1':       /*--[下載結果檔]--*/
            var printForm = $('#printForm');
            printForm.find('input').remove();
            printForm.append($('<input>').attr({
                type: 'hidden', id: 'sBatchNo', name: 'sBatchNo', value: sBatchNo
            }));
            printForm.prop('action', '/QuotationBatch/DolBatchExcel');
            printForm.submit();
            break;
        case '2':       /*--[查看作業記錄]--*/
            $('#iptLogBatchNo').val(sBatchNo);
            $('#divBatchLog').modal('show');
            //第一次查詢
            GetQuotBatchLog(sBatchNo);
            clearInterval(Countdown);       //停止循環(要先做一次，才不會互相干擾)
            Countdown = setInterval(function () {
                if ($('#divBatchLog').is(":hidden")) {  //檢查是否關閉
                    clearInterval(Countdown);               //停止循環
                    $('#txtLog').val('');                   //清空內容
                } else {
                    console.log(sBatchNo)
                    GetQuotBatchLog(sBatchNo);              //查詢記錄
                }
            }, 10000);
            break;
        case '99':       /*--[重新執行]--*/
            $.ajax({
                url: "/QuotationBatch/ProcRestartLoop",
                type: "POST",
                dataType: "text",
                async: false,
                data: { sBatchNo: sBatchNo, sBatchStatus: sBatchStatus }
            });
            MsgBox('', '作業已重新執行中..', 'orange');
            break;
    };
}
/*====[控制類]_End=============================*/

///*==[檢核類]_Start===========================*/
//檢核_[修改]
function chkEdit() {
    var dt = getdata("/Quotation/ChkQuotEdit", {
        sAgentNo: $("#divQuery").data("AgentNo")
        , sInsSDATE: $("#divQuery").data("InsSDATE")
        , sQuotNo_400: $("#divQuery").data("QuotNo_400")
    });
    if (dt.length > 0) {
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") {
            MsgBox('錯誤', dt[0].MSG, 'red');
            return false;
        }
    }
    return true;
}
//檢核_[列印]
function PrecheckPrint(sPrintType, sActionType) {
    let quotno = $('#hidQUOTENO').val();
    let QuotNo_400 = $('#hidQuotNo_400').val();
    let AgentNo = $("#divQuery").data("AgentNo");
    let InsSDATE = $("#divQuery").data("InsSDATE");
    var checkresult = "";
    $.ajax({
        url: "/Quotation/PrecheckPrint",
        type: "POST",
        dataType: "text",
        async: false,
        data: {
            QuotNo_400: QuotNo_400
            , PayNo: "" //列表中取得
            , AgentNo: AgentNo
            , InsSDATE: InsSDATE.replace(/\//g, "")
            , PrintType: sPrintType
            , ActionType: sActionType
        },
        success: function (data) {
            checkresult = data;
        },
        error: AjaxError
    });
    if (checkresult != "") {
        MsgBox('列印發生錯誤!', checkresult.replace("|", "<br/>"), 'red');
    }
    return checkresult == "";
}
/*====[檢核類]_End=============================*/

///*==[資料處理類]_Start=======================*/
//處理_Base64字串轉存實體檔案(資料模型)
function SaveBase64ToImage(Base64ImgModel) {
    $.ajax({
        type: 'POST',
        url: "/Quotation/SaveBase64ToImage",
        data: { model: Base64ImgModel },
        dataType: 'json',
        success: function (result) {
            if (result.Success) {
                $.unblockUI();
                setTimeout(function () {
                    //MsgBox('要保書合併簽名', result.Msg, 'green');
                    $('#divSignaturePad').modal('hide');
                    ProcessMobileInsure();
                }, 500);
            }
            else
                MsgBox('錯誤', result.Msg.replace(/[|]/g, "<BR>"), 'red');
        }
    });
}
//將報表輸出
function PrintReport(dlLink, sModel, sPrintItems) {
    var printForm = $('#printForm');
    printForm.find('input').remove();
    $.each(sPrintItems, function (i, v) {
        var input = $("<input>").attr({ "type": "hidden", "name": "arPrintItems[]" }).val(v);
        printForm.append(input);
    });

    for (var field in sModel) {
        var item = $('<input>').attr({
            type: 'hidden',
            id: field,
            name: field,
            value: sModel[field]
        });
        printForm.append(item);
    }
    printForm.prop('action', dlLink);
    printForm.submit();
    //var oIframe = $("#printExport");
    //oIframe.prop("src", dlLink)
    //oIframe.off("load");
    //oIframe.appendTo("body");
    //oIframe.bind("load", function () {
    //    parent.iframeMsg("列印失敗");
    //});

    //var $ifrm = $("<iframe style='display:none' />");
    //$ifrm.attr("src", dlLink);
    //$ifrm.appendTo("body");
    //$ifrm.load(function () {
    //    //if the download link return a page
    //    //load event will be triggered
    //    //$("body").append(
    //    //"<div>Failed to download <i>'" + dlLink + "'</i>!");
    //    $("body").append("<script type='type/javascript'>parent.iframeMsg('[" + printItem + "]列印失敗')</script>");
    //});
}
//初始化列印資訊
function printItemModelInit() {
    let quotno = $('#hidQUOTENO').val();
    let userid = $('#hiduserid').val();
    let QuotNo_400 = $('#hidQuotNo_400').val();
    let AgentNo = $("#divQuery").data("AgentNo");
    let InsSDATE = $("#divQuery").data("InsSDATE");
    let printItemModel = {};
    printItemModel["QuotNo"] = quotno;
    printItemModel["CESSIONO"] = QuotNo_400;
    printItemModel["USERID"] = userid;
    printItemModel["QUOPRNDATE"] = "00000000";
    printItemModel["ADPRNDATE"] = "00000000";
    printItemModel["PAYPRNDATE"] = "00000000";
    printItemModel["ForcePrnDate"] = "00000000";
    printItemModel["KYCPrnDate"] = "00000000";
    //printItemModel["PAYPRNTYPE"] = " ";
    printItemModel["SEQNO_1"] = "        ";
    printItemModel["SEQNO_2"] = "        ";
    printItemModel["PAYNO"] = "           ";
    printItemModel["ReciptPrnDate"] = "";
    printItemModel["AgentNo"] = AgentNo;
    printItemModel["InsSDATE"] = InsSDATE;
    return printItemModel;
}
//蒐集寄件內文資訊
function attachPDFToMailModelInit() {
    let attachPDFToMailModel = {};
    attachPDFToMailModel["CustEmail"] = $('#ipCustEmail').val();
    attachPDFToMailModel["AgntEmail"] = $('#ipAgntEmail').val();
    attachPDFToMailModel["SUBJECT"] = $('#ipSUBJECT').val();
    attachPDFToMailModel["CustID"] = $('#hidCustID').val();
    attachPDFToMailModel["QuotNo_400"] = $('#hidQuotNo_400').val();
    attachPDFToMailModel["CustName"] = $('#hidCustName').val();
    attachPDFToMailModel["LicenseNo"] = $('#hidLicenseNo').val();
    //attachPDFToMailModel["BODY"] = $('#ipBODY').html();
    return attachPDFToMailModel;
}
//讀取[團體件作業記錄]
function GetQuotBatchLog(sBatchNo) {
    var dt = getdata("/QuotationBatch/GetQuotBatchLog", { sBatchNo: sBatchNo });
    var logmsg = '';
    for (let i = 0; i < dt.length ; i++) {
        logmsg += dt[i].DATADATE + ':' + dt[i].MSG + '\r\n';
    }
    $("#txtLog").val(logmsg);  //要刷新的div
}
/*====[資料處理類]_End=========================*/

function iframeMsg(msg) {
    MsgBox('錯誤', msg, 'red');
}

/*====[附件上傳]Start=============================*/
//數字格式化(@param:要轉換的數字,@param:指定小數第幾位做四捨五入)
function format_float(num, pos) {
    var size = Math.pow(10, pos);
    return Math.round(num * size) / size;
}
//預覽圖處理(@param)
function preview(oImg, oSize, input) {
    // 若有選取檔案
    if (input.files && input.files[0]) {
        var imgSrc = "";
        var fsize = input.files[0].size; //get file size
        var ftype = input.files[0].type; // get file type        
        switch (ftype) {        //allowed file types
            case 'image/jpeg':
            case 'image/pjpeg':
                break;
            case 'application/pdf':
                imgSrc = "/Content/Images/PDFicon.PNG";
                break;
        }
        // 檔案大小，把 Bytes 轉換為 KB
        var KB = format_float(fsize / 1024, 2);
        oSize.text("檔案大小：" + KB + " KB");
        if (imgSrc != "") {
            oImg.attr('src', imgSrc);
        } else {
            // 建立一個物件，使用 Web APIs 的檔案讀取器(FileReader 物件) 來讀取使用者選取電腦中的檔案
            var reader = new FileReader();
            // 事先定義好，當讀取成功後會觸發的事情
            reader.onload = function (e) {
                console.log(e);
                // 這裡看到的 e.target.result 物件，是使用者的檔案被 FileReader 轉換成 base64 的字串格式，
                // 在這裡我們選取圖檔，所以轉換出來的，會是如 『data:image/jpeg;base64,.....』這樣的字串樣式。
                // 我們用它當作圖片路徑就對了。
                oImg.attr('src', e.target.result);
                ////移除目前設定的影像長寬
                //oImg.removeAttr('width');
                //oImg.removeAttr('height');
                ////取得影像實際的長寬
                //var imgW = oImg.width();
                //var imgH = oImg.height();
                ////計算縮放比例
                //var w = 400 / imgW;
                //var h = 220 / imgH;
                //var pre = 1;
                //if (w > h) {
                //    pre = h;
                //} else {
                //    pre = w;
                //}
                ////設定目前的縮放比例
                //oImg.width(imgW * pre);
            }
            // 因為上面定義好讀取成功的事情，所以這裡可以放心讀取檔案
            reader.readAsDataURL(input.files[0]);
        }
    }
}

/*====[附件上傳]End===============================*/

/******自訂函式_End************************************/
