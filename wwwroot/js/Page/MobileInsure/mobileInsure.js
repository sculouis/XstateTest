/******行動投保處理事件_Start************************/

function InitMobileInsureEventBinding()
{

    //個資聲明核取方塊
    $('input[name="ChkMobileInsure"]').change(function () {
        let ChkMobileInsureItem = $('input[name="ChkMobileInsure"]:checked');
        if (ChkMobileInsureItem.length == 4)
            $('#btnMobileInsure').prop('disabled', false);
        else
            $('#btnMobileInsure').prop('disabled', true);
    });
    //個資聲明確認鈕
    $('#btnMobileInsure').click(function () {
        $.ajax({
            url: "/MobileInsure/AgreeConsentPersonData",
            type: "POST",
            dataType: 'json', // 預期從server接收的資料型態
            //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
            async: false,
            data: { QuotNo: $('#hidQUOTENO').val()},
            success: function (result) {
                if (!result.Success)
                    MsgBox('錯誤', result.Msg, 'red');
                else {
                    $('#divMobileInsure').modal('hide');
                    ProcessMobileInsure();
                }
            },
            error: AjaxError
        });


    });
    //KYC線上填寫其他選項
    $('input[type=radio][name="Solicit"]').change(function () {
        var inputOtherText = $('input[name="Solicit"]:last').next('input[type="text"]');
        if ($(this).parent().text() == "其他")
            inputOtherText.css('visibility', 'visible');
        else
            inputOtherText.css('visibility', 'hidden');
    });

    $('input[name="InsuranceSource"]:last').click(function () {
        var inputOtherText = $(this).next('input[type="text"]');
        if ($(this).prop('checked'))
            inputOtherText.css('visibility', 'visible');
        else
            inputOtherText.css('visibility', 'hidden');
    });

    //KYC線上填寫確認鈕
    $('#btnKYCOnline').click(function () {
        let error = ValidKYC();
        if (error.length > 0) {
            MsgBox('錯誤', error.join('<br>'), 'red');
            return;
        }
        let Solicit = $('input[name="Solicit"]:checked');
        let InsuranceSource = $('input[name="InsuranceSource"]:checked');
        let Propose = $('input[name="Propose"]:checked');
        let QuoteKYC = $('#KYCOnline').serializeObject();
        QuoteKYC["QuotNo"] = KYCData[0]["QuotNo"];
        QuoteKYC["Solicit"] = QuoteKYC["Solicit"] != null && Solicit.length > 1 ? QuoteKYC["Solicit"].join(',') : Solicit.length == 1 ? QuoteKYC["Solicit"] : "";
        QuoteKYC["InsuranceSource"] = QuoteKYC["InsuranceSource"] != null && InsuranceSource.length > 1 ? QuoteKYC["InsuranceSource"].join(',') : InsuranceSource.length == 1 ? QuoteKYC["InsuranceSource"] : "";
        QuoteKYC["CustAttribute"] = QuoteKYC["CustAttribute"] != null && QuoteKYC["CustAttribute"].length > 0 ? QuoteKYC["CustAttribute"].join(',') : "";
        QuoteKYC["Propose"] = QuoteKYC["Propose"] != null && Propose.length > 1 ? QuoteKYC["Propose"].join(',') : Propose.length == 1 ? QuoteKYC["Propose"] : "";
        QuoteKYC["SalesRpt"] = QuoteKYC["SalesRpt"] != null && QuoteKYC["SalesRpt"].length > 0 ? QuoteKYC["SalesRpt"].join(',') : "";
        QuoteKYC["NationAP"] = $('input[name="NationAP"]:checked').val();
        QuoteKYC["NationCP"] = $('input[name="NationCP"]:checked').val();
        QuoteKYC["ToInsuredRelation"] = $('#ToInsuredRelation').text();
        QuoteKYC["RepresentativeA"] = $("#RepresentativeA").text();
        QuoteKYC["RepresentativeC"] = $("#RepresentativeC").text();
        QuoteKYC["ProposeOther"] = $('input[name="ProposeOther"]').val();

        //招攬經過其它
        let SolicitLast = $('input[name="Solicit"]:last');
        if (SolicitLast != undefined && SolicitLast.prop('checked')) {
            QuoteKYC["SolicitOther"] = $('input[name="SolicitOther"]').val();           
        }
        else {
            QuoteKYC["SolicitOther"] = "";
        }
        //保費來源其它
        let InsuranceSourceLast = $('input[name="InsuranceSource"]:last');
        if (InsuranceSourceLast != undefined && InsuranceSourceLast.prop('checked')) {
            QuoteKYC["InsuranceSourceOther"] = $('input[name="InsuranceSourceOther"]').val();    
        } else {
            QuoteKYC["InsuranceSourceOther"] = "";
        }

        $.ajax({
            url: "/MobileInsure/AddKYCOnline",
            type: "POST",
            dataType: 'json', // 預期從server接收的資料型態
            //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
            async: false,
            data: { "quoteKYCData": QuoteKYC },
            success: function (result) {
                if (!result.Success)
                    MsgBox('錯誤', result.Msg, 'red');
                else {
                    $('#divKYCOnline').modal('hide');
                    ProcessMobileInsure();
                }
            },
            error: AjaxError
        });

    });
    // file 是從 input 取得的 value
    function getImg(file, inputFile, fileIsPDF) {
        var _URL = window.URL || window.webkitURL; // 檢查各個瀏覽器的 method
        var img = new Image();
        img.onload = function () {
            if (this.width < 600 || this.height < 800) {
                MsgBox('上傳檔案錯誤', "上傳jpg, png 類型檔案像素須為600X800 以上", 'red');
            }
            else {
                ExeUpload(inputFile, fileIsPDF);
            }
            console.log(this.height, this.width);
        };
        img.src = _URL.createObjectURL(file);
    }


    //行動投保同意書上傳按鈕
    $('#btnAgreeMent').click(function () {
        let inputFile = $('#UploadFileDiv .uploadFile');
        if (inputFile == undefined || inputFile == null || inputFile.length == 0) {
            MsgBox('上傳檔案錯誤', "您未選擇檔案", 'red'); return false;
        }
        let isChecked = true;
        let fileIsPDF = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            inputFile.each(function (index, element) {
                if (index == 0) {
                    var fsize = element.files[0].size; //get file size
                    var ftype = element.files[0].type; // get file type
                    //Allowed file size is less than 4 MB
                    if (fsize > 4000000) {
                        MsgBox('上傳檔案錯誤', "您上傳的檔案當中超過4MB 容量大小限制", 'red');
                        //notify("Your total upload Size is: " + bytesToSize(fsize) + "<br/>File(s) is too big, it should be less than 27 MB.");
                        isChecked = false;
                    }
                    if (isChecked) {
                        //allowed file types
                        switch (ftype) {
                            case 'image/png':
                                //    //case 'image/gif':
                            case 'image/jpeg':
                            case 'image/pjpeg':
                                //case 'text/plain':
                                //case 'text/html':
                                //case 'application/x-zip-compressed':
                                //case 'application/x-rar-compressed':
                                //case 'application/octet-stream':
                                fileIsPDF = false;
                                getImg(element.files[0], inputFile, fileIsPDF);


                                break;
                            case 'application/pdf':
                                fileIsPDF = true;
                                //case 'application/msword':
                                //case 'application/vnd.ms-excel':
                                //case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                //case 'video/mp4':
                                break;
                            default:
                                MsgBox('上傳檔案錯誤', "請上傳jpg, pdf, png 類型檔案", 'red');
                                isChecked = false;
                        }
                    }
                }
            });
        } else {
            MsgBox('上傳檔案錯誤', "Please upgrade your browser, because your current browser lacks some new features we need!", 'red');
            //Output error to older unsupported browsers that doesn't support HTML5 File API
            //notify("Please upgrade your browser, because your current browser lacks some new features we need!");
            return false;
        }
        if (isChecked && fileIsPDF) {
            ExeUpload(inputFile, fileIsPDF);
        }
    });
    //KYC國籍控制 外國籍顯示輸入國籍代碼
    $('input[name="NationCC"], input[name="RgtNationCC"]').change(function () {
        let curRadio = $(this);
        let nationInput = curRadio.parent().parent().find('input[type="text"]');
        if (curRadio.parent().text() == "外國籍")
            nationInput.show();
        else
            nationInput.hide();

    });

}

//執行上傳同意書
function ExeUpload(inputFile, fileIsPDF)
{
    BlockUI('檔案上傳中，請稍後...');
    setTimeout(function () {
        var formData = new FormData();
        formData.append('sQuotNo', $('#hidQUOTENO').val());
        formData.append("fileIsPDF", fileIsPDF);
        inputFile.each(function (index, element) {
            if (element.files.length > 0) {
                formData.append("arfile", element.files[0]);
                return false;
            }
        });

        $.ajax({
            type: 'post',
            url: '/MobileInsure/UploadFileAgreeMent',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
        }).success(function (result) {
            if (result.Success) {
                $.unblockUI();
                setTimeout(function () {
                    //MsgBox('同意書上傳', result.Msg, 'green');
                    $('#divUploadMode').modal('hide');
                    $('#uploadFileTitle').text('附件上傳');
                    ProcessMobileInsure();
                }, 500);
            } else {
                MsgBox('錯誤', result.Msg, 'red');
            }

        }).error(function (e) {
            $.unblockUI();
            MsgBox('警告', "上傳失敗", 'red');
        });
    }, 200);
}

//初始化 QuotOther Data
function InitQuotOther() {
    QuotOtherData = {};
    QuotOtherData["QuotNo"] = "";
    QuotOtherData["Signed"] = "";
    QuotOtherData["CmptQuot"] = "";
    QuotOtherData["AgreeMent"] = "";
    QuotOtherData["KYCFilled"] = "";
    QuotOtherData["ConsentPersonData"] = "";
    QuotOtherData["AnyInsrCaseNo"] = "";
    QuotOtherData["ForceInsrCaseNo"] = "";
    QuotOtherData["AgrmntCaseNo"] = "";
    QuotOtherData["KYCCaseNo"] = "";
    QuotOtherData["ForceInsrCaseNo"] = "";
}
//開啟簽名板([quotno]:報價單號,[quotno_400]:400報價單號)
function OpenSignaturePad(quotno, quotno_400) {
    $('#divSignaturePad').modal('show');    //開啟[簽名版iframe]
    var _signData = [{
        QuotNo: quotno,
        SysCode: "QuotationQuerySign",
        WateMark1: "和泰產險車險專用",
        WateMark2: "報價單號:" + quotno_400
    }];

    var result = getdata("/MobileInsure/GetQuotSignInfo", {
        sQuotNo: quotno
    });
    if (result.Success) {
        var arr = [];
        $.each(result.Data, function (i, item) {
            arr.push({ sn: item.SN, PROMPT: item.PROMPT, saveUrlFNM: item.URLFM, QuotNo: quotno });
        });
        _signData[0].SignData = arr;
    } else {
        MsgBox('錯誤', result.Msg, 'red');
        return;
    }

    //var url = "\\TempUpload\\" + quotno + "_";
    //_signData = [{
    //    SysCode: "QuotationQuerySign",
    //    WateMark1: "和泰產險車險專用",
    //    WateMark2: "報價單號:" + quotno_400,
    //    SignData: [
    //        { no: 1, PROMPT: "要保人", saveUrlFNM: url + "Proposer.jpg" },
    //        { no: 2, PROMPT: "被保險人", saveUrlFNM: url + "Q2.jpg", },
    //        //{ no: 3, desc: "被保險人2", saveUrlFNM: url + "Q3.jpg" },
    //        //{ no: 4, desc: "被保險人3", saveUrlFNM: url + "Q4.jpg" },
    //        //{ no: 5, desc: "被保險人4", saveUrlFNM: url + "Q5.jpg" },
    //        //{ no: 6, desc: "被保險人5", saveUrlFNM: url + "Q6.jpg" },
    //        //{ no: 7, desc: "被保險人6", saveUrlFNM: url + "Q7.jpg" },
    //        //{ no: 8, desc: "被保險人7", saveUrlFNM: url + "Q8.jpg" },
    //        //{ no: 9, desc: "被保險人8", saveUrlFNM: url + "Q9.jpg" },
    //        //{ no: 10, desc: "被保險人9", saveUrlFNM: url + "Q10.jpg" },
    //        { no: 11, PROMPT: "業務人員", saveUrlFNM: url + "_Sales.jpg" }
    //    ]
    //}];
    document.getElementById("myiframe").contentWindow.postMessage(_signData, '*'); //呼叫子頁
    //myiframe.contentWindow.postMessage(_signData, '*'); //呼叫子頁
}

//預覽合併簽名檔核取方塊
$('#divReviewed').on('change', 'input[name="ChkReviewed"]', function (event) {
    let ChkReviewed = $('input[name="ChkReviewed"]');
    let ChkMobileInsureItem = $('input[name="ChkReviewed"]:checked');
    $('#btnReviewed').prop('disabled', ChkMobileInsureItem.length != ChkReviewed.length);
});

//合併簽名檔確認鈕
$('#btnReviewed').click(function () {
    $.ajax({
        url: "/MobileInsure/IsReviewed",
        type: "POST",
        dataType: 'json', // 預期從server接收的資料型態
        //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
        async: false,
        data: { sQuotNo: $('#hidQUOTENO').val() },
        success: function (result) {
            if (!result.Success)
                MsgBox('錯誤', result.Msg, 'red');
            else {
                $('#divReviewed').modal('hide');
                ProcessMobileInsure();
            }
        },
        error: AjaxError
    });


});

//開啟預覽合併簽名檔結果([quotno]:報價單號,[quotno_400]:400報價單號)
function OpenReviewed(quotno, quotno_400) {
    SetReviewed(quotno);
    $('#divReviewed').modal('show');    //開啟預覽合併簽名檔結果
}

//設定預覽合併簽名檔選項(items:合併簽名檔後結果檔)
function SetReviewed(quotno) {
    $.ajax({
        url: "/MobileInsure/GetReviewed",
        type: "POST",
        dataType: 'json', // 預期從server接收的資料型態
        //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
        async: false,
        data: { sQuotNo: quotno },
        success: function (result) {
            if (!result.Success)
                MsgBox('錯誤', '無法取得預覽檔案資訊', 'red');
            else {
                if (result.Data != undefined && result.Data.length > 0) {
                    fileList = JSON.parse(result.Data[0]['Reviewed']);
                    let panelbody = $('#divReviewed .panel-body');
                    panelbody.find('.reviewedItem').remove();
                    let sItemContent = "";
                    for (let i = 0; i < fileList.length; i++) {
                        sItemContent += '<div class="reviewedItem">\
                                <label class="mouse_pointer input-group">\
                                    <input type="checkbox" class="label_cbx" value="" name="ChkReviewed">' + fileList[i]['FileTitle'] + '<a href="' + fileList[i]['FileUrl'] + '" target="_blank">(附件)</a>\
                                </label>\
                            </div>';
                    }
                    panelbody.prepend(sItemContent);
                }
            }
        },
        error: AjaxError
    });


   
}

//開啟個資聲明視窗
function OpenDivMobileInsure() {
    $('input[name="ChkMobileInsure"]').prop('checked', false);
    $('#divMobileInsure').modal('show');
}
//行動投保出單作業
function ProcessBilling(quotno) {
    $.ajax({
        type: 'POST',
        url: "/MobileInsure/ProcessBilling",
        data: { sQuotNo: quotno},
        dataType: 'json',
        success: function (result) {
            $.unblockUI();
            setTimeout(function () {
                var btnConfirm = $('#btnConfirm');
                MsgBox('行動投保', result.Msg, result.Success ? 'green' : 'red');
                if (btnConfirm) {
                    btnConfirm.click();
                }
            }, 500);
        }
    });
}
//取得KYC頁面資料
function GetKYCData(quotno) {
    let readKYCSuccess = false;
    $.ajax({
        type: 'POST',
        url: "/MobileInsure/GetKYCData",
        data: { sQuotNo: quotno },
        dataType: 'json',
        async: false,
        success: function (result) {
            if (result.Success) {
                KYCData = result.Data;
                readKYCSuccess = true;
            }
            else
                MsgBox('讀取KYC資料', result.Msg.replace(/[|]/g, "<BR>"), 'red');
        }
    });
    return readKYCSuccess;
}
//行動投保流程控制
function ProcessMobileInsure() {
    let quotno = $("#divQuery").data("QuotNo");
    let quotno_400 = $("#divQuery").data("QuotNo_400");
    //讀取行動投保現階段
    $.ajax({
        url: "/MobileInsure/GetMobileInsureStep",
        type: "POST",
        dataType: 'json', // 預期從server接收的資料型態
        //contentType: 'application/json; charset=utf-8', // 要送到server的資料型態
        async: false,
        data: { "QuotNo": quotno },
        success: function (result) {
            if (!result.Success)
                MsgBox('錯誤', result.Msg, 'red');
            else {
                let step = result.Data[0]["Step"];
                switch (step) {
                    case "0":
                        $('#hidmode').val('MobileInsureVIEW');
                        document.getElementById("queryForm").target = "_blank";
                        $('#btnEdit').click();
                        break;
                    case "1":
                        let emptySpace = "<p style='visibility:hidden'>    </p>";
                        //清除KYC填寫內容
                        $('input[name="NationAP"], input[name="OcptnAP"], input[name="NationCP"], input[name="OcptnCP"], input[name="NationCC"], input[name="GndrCC"], input[name="RgtNationCC"], input[name="Solicit"], input[name="InsuranceSource"], input[name="CustAttribute"], input[name="Propose"], input[name="SalesRpt"]').prop('checked', false);
                        $('input[name="CntryCodeAP"], input[name="CntryCodeCP"], input[name="RgtrCodeCC"], input[name="SolicitOther"], input[name="InsuranceSourceOther"], input[name="ProposeOther"]').val('');
                        $('#RepresentativeA, #RepresentativeC').text('');
                        if (GetKYCData(quotno)) {
                            //以下要保人
                            $('#ProposerName').text(KYCData[0]["ProposerName"]);
                            $('#NationAP_L').prop('checked', KYCData[0]["ResidentA"] == "TWN");
                            $('#NationAP_F').prop('checked', KYCData[0]["ResidentA"] == "FOR");
                            if (KYCData[0]["ResidentA"] == "FOR") {
                                $('#CntryCodeAP').val(KYCData[0]["NationA"]).show();
                            }
                            else {
                                $('#CntryCodeAP').val(KYCData[0]["NationA"]).hide();
                            }
                            if (KYCData[0]["RepresentativeA"] != "")
                                $('#RepresentativeA').text(KYCData[0]["RepresentativeA"]);
                            else
                                $('#RepresentativeA').html(emptySpace);
                            if (KYCData[0]["ToInsuredRelation"] != "")
                                $('#ToInsuredRelation').text(KYCData[0]["ToInsuredRelation"])
                            else
                                $('#ToInsuredRelation').html(emptySpace)
                            //if (KYCData[0]["CustTypeA"] != "C") {
                            //    $('input[name="NationAC"], input[name="GndrAC"], input[name="RgtNationAC"]').prop('disabled', true);
                            //    $('input[name="CntryCodeAC"], input[name="RgtrCodeAC"]').prop('readonly', true);
                            //}

                            //以下被保人
                            $('#InsuredName').text(KYCData[0]["InsuredName"]);
                            $('#NationCP_L').prop('checked', KYCData[0]["ResidentC"] == "TWN");
                            $('#NationCP_F').prop('checked', KYCData[0]["ResidentC"] == "FOR");
                            if (KYCData[0]["ResidentC"] == "FOR")
                                $('#CntryCodeCP').val(KYCData[0]["NationC"]);
                            else {
                                $('#CntryCodeCP').val(KYCData[0]["NationC"]).hide();
                            }
                            if (KYCData[0]["RepresentativeC"] != "")
                                $('#RepresentativeC').text(KYCData[0]["RepresentativeC"]);
                            else
                                $('#RepresentativeC').html(emptySpace);
                            if (KYCData[0]["CustTypeC"] != "C") {
                                $('input[name="NationCC"], input[name="GndrCC"], input[name="RgtNationCC"]').prop('disabled', true);
                                $('input[name="CntryCodeCC"], input[name="RgtrCodeCC"]').prop('readonly', true);
                            }
                            $('#divKYCOnline').modal('show');
                        }
                        break;
                    case "2":
                        OpenSignaturePad(quotno, quotno_400);   //開啟簽名板
                        break;
                    case "3":
                        OpenReviewed(quotno, quotno_400);   //開啟合併簽名要保書預覽
                        break;
                    case "4":
                        $('#iptUploadQUOTENO').val(quotno + "    " + quotno_400);
                        $('#divUploadMode').modal('show');  //開啟行動投保同意書上傳
                        $('#uploadFileTitle').text('行動投保同意書上傳');
                        $('#btnUploadFile').parent().hide();
                        $('#btnAgreeMent').parent().show();
                        break;
                    case "5":
                        BlockUI('作業中，請稍後...');
                        ProcessBilling(quotno);
                        break;
                }
            }
        },
        error: AjaxError
    });


}
//KYC 驗證
function ValidKYC() {
    errorItem = [];
    if ($('input[name="OcptnAP"]:checked').length == 0) {
        errorItem.push("要保人職業未填寫");
    }
    if ($('input[name="OcptnCP"]:checked').length == 0) {
        errorItem.push("被保人職業未填寫");
    }
    //驗證被保人為法人時，法人資訊需填寫
    if (KYCData[0]["CustTypeC"] == "C") {
        if ($('input[name="NationCC"]:checked').length == 0) {
            errorItem.push("法人負責人國籍未填寫");
        }
        else if ($('input[name="NationCC"]:checked').val() == "chk_12" && $('#CntryCodeCC').val() == "") {
            errorItem.push("法人負責人國別碼未填寫");
        }
        if ($('input[name="GndrCC"]:checked').length == 0) {
            errorItem.push("法人負責人性別未填寫");
        }
        if ($('input[name="RgtNationCC"]:checked').length == 0) {
            errorItem.push("法人註冊地未填寫");
        }
        else if ($('input[name="RgtNationCC"]:checked').val() == "chk_41" && $('#RgtrCodeCC').val() == "") {
            errorItem.push("法人註冊地國別碼未填寫");
        }
    }
    //招攬經過檢查
    let Solicit = $('input[name="Solicit"]:checked');
    if (Solicit == undefined || Solicit == null || Solicit.length == 0) {
        errorItem.push("招攬經過未填寫");
    }
    let SolicitLast = $('input[name="Solicit"]:last');
    if (SolicitLast != undefined && SolicitLast.prop('checked') && $('input[name="SolicitOther"]').val().length == 0)
    {
        errorItem.push("招攬經過其它未填寫");
    }

    //保費來源檢查
    let InsuranceSource = $('input[name="InsuranceSource"]:checked');
    if (InsuranceSource == undefined || InsuranceSource == null || InsuranceSource.length == 0) {
        errorItem.push("保費來源未填寫");
    }
    let InsuranceSourceLast = $('input[name="InsuranceSource"]:last');
    if (SolicitLast != undefined && InsuranceSourceLast.prop('checked') && $('input[name="InsuranceSourceOther"]').val().length == 0) {
        errorItem.push("保費來源其它未填寫");
    }
    //客戶屬性檢查
    if ($('input[name="CustAttribute"]:not(:last):checked').length != 4) {
        errorItem.push("客戶屬性未填寫完成");
    }
    //業務報告檢查
    if ($('input[name="SalesRpt"]:checked').length != 5) {
        errorItem.push("業務報告未填寫完成");
    }
    return errorItem;
}
/******行動投保處理事件處理事件_End************************/
