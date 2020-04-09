
$(document).ready(function () {

    var sltSeqNoHtml;//繳費下拉選單，須一直存在

    //產生客票來源清單(只須執行一次)
    selZReasonSrc();

    //註冊日曆(yyyy/MM/dd)
    RegFormDate();

    //資料載入-擬繳日預帶今日
    $('#iptPayDte').val(GetDay(''));
    $('#iptPayDtePrint').val(GetDay(''));

    //資料查詢-初始化
    PaymentDataTableInit();

    //初始化DatetimePicker foucs blur事件
    InitDatetimePickerEvents();

    RegFormDatetime($('#iptTranDateX_BringIn'));
});

//#region ==============================================資料載入==============================================

//資料載入- 輸入值變更事件
$('#iptAcc,#iptPayDte,#iptAccPrint,#iptPayDtePrint').on('change', function (e) {
    this.value = this.value.toUpperCase();  //轉大寫
    if (this.id == 'iptAcc' || this.id == 'iptPayDte') {
        var AccNum = $('#iptAcc').val();
        var PayDte = $('#iptPayDte').val();
        selPrintSeqSrc(document.getElementById('selPrint01'), AccNum, PayDte, true);
    }

    if (this.id == 'iptAccPrint' || this.id == 'iptPayDtePrint') {
        var AccNum = $('#iptAccPrint').val();
        var PayDte = $('#iptPayDtePrint').val();
        selPrintSeqSrc(document.getElementById('selPrint02'), AccNum, PayDte, true);
    }
})


//資料載入- 取得列印序號
function selPrintSeqSrc(Obj, AccNum, PayDte, ShowMsg) {

    if (AccNum != '' && PayDte != '') {
        if (ShowMsg) {
            BlockUI('載入列印序號，請稍後');
        }

        //setTimeout(function () {
        $.ajax({
            url: "/Payment/PrintSeqSrc",
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                UserAccount: AccNum,
                PayDate: PayDte.replace(/\//g, ''),
                AccDept: $('#selAccDept').val()
            },
            timeout: 1000 * 10,
            success: function (Result) {
                if (Result.ProcessSuccess == true) {
                    $(Obj).find('option').remove().end();

                    if (Obj.id == 'selPrint01') {
                        var option = document.createElement("option");
                        option.text = '未列印明細';
                        option.value = 9900;
                        $(Obj).append(option);
                    }
                    $.each(Result.ProcessMessage.split(';'), function (index, value) {
                        var option = document.createElement("option");
                        option.value = value;
                        if (value != 9900 && value != '') {
                            option.text = value;
                        }
                        else if (Obj.id == 'selPrint01' && value == '') {
                            option.value = 9900;
                            option.text = '';
                        }
                        else if (Obj.id == 'selPrint02' && value == 9900) {
                            option.text = '已擬繳未列印';
                        }
                        else if (Obj.id == 'selPrint02' && value == '') {
                            option.text = '無可列印序號';
                        }

                        if ((Obj.id == 'selPrint01' && value != 9900 && value != '') || (Obj.id == 'selPrint02')) {
                            $('#btnPrint').prop("disabled", false);
                            $(Obj).append(option);
                        }

                        if (value == '') {
                            $('#btnPrint').prop("disabled", true);
                        }
                    });

                    $.unblockUI();
                }
                else {
                    $.unblockUI();
                    MsgBox('取列印序號失敗', Result.ProcessMessage, 'red', '');
                }
            },
            error: function () { $.unblockUI(); AjaxError(); }
        });
        //}, 100)

        //$.unblockUI();
    }

}
//資料載入- 查詢AS400資料
$("#btnSearchAs400").on("click", function () {
    //暫時關閉
    //if ($('#iptAcc').val() == '' || $('#iptAgent').val() == '' || $('#iptPayDte').val() == '') {
    //    MsgBox('檢核訊息', '請填寫繳費經手人、出單經手人、擬繳日期欄位', 'red');
    //    return;
    //} 
    BlockUI("請稍後");
    ReadAS400();
});

//#endregion ==============================================資料載入==============================================


//#region ==============================================下載報表區塊==============================================
var confirm;
//下載報表區塊- 報表按鈕事件
$('#btnPrint').click(function (e) {
    var Acc = $('#iptAccPrint').val();
    var PayDate = $('#iptPayDtePrint').val().replace(/\//g, '');
    var PrintSeq = $('#selPrint02').val();

    if (Acc == '' || PayDate == '') {
        MsgBox('檢核訊息', '請填寫繳費經手人、擬繳日期欄位', 'red');
        return;
    }

    BlockUI("報表產生中，請稍後");

    setTimeout(function () {
        $.ajax({
            type: "POST",
            url: "/ReportViewer/Report",
            async: false,
            cache: false,
            data: {
                UserAccount: Acc
                , ReportName: 'Payment'
                , PrintSeq: PrintSeq
                , PayDate: PayDate
            },
            success: function (data) {
                if (data.Success == false) {
                    MsgBox('下載報表失敗', data.Msg, 'red');
                }
                else {
                    var FileName = data.FileName;
                    $("#hiddenFileName").val(FileName);
                    $("#formMain").attr("action", "/ReportViewer/DownloadFile");
                    $("#formMain").submit();

                    confirm = MsgBox('下載報表完成', FileName.split('_')[0] + ".pdf", 'green');
                    setTimeout(function () {
                        /*取得列印序號*/
                        var AccNum1 = $('#iptAcc').val();
                        var PayDte1 = $('#iptPayDte').val();
                        selPrintSeqSrc(document.getElementById('selPrint01'), AccNum1, PayDte1, false);

                        var AccNum2 = $('#iptAccPrint').val();
                        var PayDte2 = $('#iptPayDtePrint').val();
                        selPrintSeqSrc(document.getElementById('selPrint02'), AccNum2, PayDte2, false);
                    }, 10)
                }
            },
            error: AjaxError
        });
    }, 50)

    $.unblockUI();
});
//下載錯誤
$("#downloadIframe").load(function () {
    var iframeDocument = document.getElementById("downloadIframe").contentDocument;
    var content = iframeDocument.getElementsByTagName("body")[0].textContent;
    if (content.indexOf("系統發生錯誤") > -1) {
        DisabledAllSelectAndInput(false);
        confirm.close();
        MsgBox("下載訊息", content, "red");
        document.getElementById("downloadIframe").contentDocument.getElementsByTagName("body")[0].textContent = "";
    }
});
//#endregion ==============================================下載報表區塊==============================================

//#region ==============================================資料查詢區塊==============================================
//資料查詢區塊- 資料查詢-初始化
function PaymentDataTableInit() {
    // 綁定『每頁筆數』 change事件
    $('#sltPaymentDataTblPageLength').on("change", function () {
        BlockUI('載入中，請稍後');
        var pageLength = $(this).val() == "" ? 10 : $(this).val();

        setTimeout(function () {
            $('#tblPaymentDataList').DataTable().page.len(pageLength).draw();
            $('#tblPaymentDataList').DataTable().columns.adjust().responsive.recalc();
            $.unblockUI();
        }, 100);
    });

    // 綁定『查詢』 click事件
    $("#btnSearchPaymentData").on("click", function () {
        //驗證
        if ($("#iptAccNum").val() == '' && $("#iptAgntNum").val() == '' && $("#iptPolNum").val() == '') {
            MsgBox('檢核訊息', '請填寫繳費經手人、出單經手人、保險單號任一欄位', 'red');
        }
        else {
            BlockUI('載入中，請稍後');
            setTimeout(function () {
                //取得資料
                var dataSource = GetPaymentDatas();
                //設定Datatable
                CreatePaymentDatasTable(dataSource);
            }, 100);
        }
    });

    CreatePaymentDatasTable([]);
}

//資料查詢區塊- 取得查詢資料
function GetPaymentDatas() {
    var responseDatas = [];
    $.ajax({
        type: 'POST',
        url: '/Payment/GetPaymentDatas',
        dataType: 'json',
        async: false,
        data: {
            ACCNUM: $("#iptAccNum").val(),
            AGNTNUM: $("#iptAgntNum").val(),
            POLNUM: $("#iptPolNum").val()
        },
        success: function (data) {
            responseDatas = data;
        },
        error: AjaxError
    });
    return responseDatas;
}

//資料查詢區塊- 建立擬繳資料查詢DataTable
function CreatePaymentDatasTable(dataSource) {
    var datatable = $('#tblPaymentDataList');
    //清除目前設定
    datatable.DataTable().clear();
    datatable.DataTable().destroy();

    //複製設定物件
    var language = $.extend(true, {}, DataTablsChineseLanguage);
    language.zeroRecords = "查無資料";

    //擬繳資料查詢_建立DataTables
    datatable.DataTable({
        bDeferRender: true,
        destroy: true,
        dom: '<"top">rt<"bottom">pli<"clear">',
        language: language,
        searching: false,
        autoWidth: false,
        processing: true,
        data: dataSource,
        fixedHeader: {
            header: true,
            headerOffset: 45
        },
        pagingType: "full_numbers",
        lengthChange: false,
        paging: true,
        orderCellsTop: true,
        columnDefs: [
            {
                width: "5%",
                className: "text-center custom-middle-align",
                targets: [
                    FindTableIndex('tblPaymentDataList', '保單號碼'),
                    FindTableIndex('tblPaymentDataList', '繳費經手人'),
                    FindTableIndex('tblPaymentDataList', '出單經手人'),
                    FindTableIndex('tblPaymentDataList', '生效日期'),
                    FindTableIndex('tblPaymentDataList', '要保人'),
                    FindTableIndex('tblPaymentDataList', '被保險人'),
                    FindTableIndex('tblPaymentDataList', '擬繳金額'),
                    FindTableIndex('tblPaymentDataList', '擬繳日期'),
                ]
            },
        ],
        columns: [
            {
                data: "POLNUM"
            },//保單號碼
            {
                data: "AGNTNUM"
            },//繳費經手人 
            {
                data: "ACCNUM"
            },//出單經手人 
            {   //生效日期
                data: function (source, type, val) {
                    var hidNAME = $.datefomater(source.EFFDATE)
                    return hidNAME;
                }
            },
            {
                data: "APLNAME"
            },//要保人
            {
                data: "ZCNAME"
            },//被保險人
            {
                data: "ZPREM", render: $.fn.dataTable.render.number(',', '.', 0, '$')
            },//擬繳金額
            {   //擬繳日期
                data: function (source, type, val) {
                    var hidNAME = $.datefomater(source.PAYDTE)
                    return hidNAME;
                }
            },
        ],
    })

    //排序保險明細下方的物件
    $("#tblPaymentDataList_info").addClass("col-lg-6 col-lg-pull-6");
    $("#tblPaymentDataList_paginate").addClass("col-lg-6 col-lg-push-6");
    $.unblockUI();
}

//取得出單經手人的入帳單位
$('#iptAgent').change(function () {
    BlockUI('取得出單經手人入帳單位中');
    $.ajax({
        url: "/Payment/GetFinBranchCode",
        type: "POST",
        dataType: "json",
        async: false,
        data: { Account: $(this).val() },
        timeout: 5000 * 10,
        success: function (result) {
            $('#selAccDept').val(result);
        },
        error: function () {
            MsgBox('入帳單位預帶錯誤', '查無該出單經手人的入帳單位<br>\
                    請自行確認入帳單位是否正確', 'red');
        }
    });
    unblockUI();
})
//#endregion ==============================================資料查詢區塊==============================================

//#region ==============================================繳費來源區塊==============================================

//繳費來源區塊- 讓 Modal 呼叫使用
function unblockUI() {
    $.unblockUI()
};

//繳費來源區塊- 換頁
$('#sltPayTblPageLength').change(function () {
    BlockUI('載入中，請稍後');
    var pageLength = $(this).val();
    setTimeout(function () {
        $('#tblPaymentCheckList').DataTable().page.len(pageLength).draw();
        $('#tblPaymentCheckList').DataTable().columns.adjust().responsive.recalc();
        $.unblockUI();
    }, 100)
})

//繳費來源區塊- 註冊_新增匯款-動態產生按鈕，所以要重覆註冊事件
$("#btnAddMt").on("click", function (e) {
    BlockUI('作業中，請稍後');

    setTimeout(function () {
        var ColIndex = FindTableIndex('tblInsuranceList', '繳費來源');
        var MtMode = $('#pay_status').find('option[value="99"]').length == 0 ? "Add" : "Upd";
        var Msg = '';

        //$('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
        //    if (this.data().SEQNO == '99')
        //        Msg += "保單編號:" + this.data().POLNUM + "<br>"
        //});

        //if (Msg != '') {
        //    MsgBox('檢核訊息', "以下保單編號已使用匯款繳費 <br> 金額不可修改回零 <br>" + Msg, 'red');
        //}

        if (!ValidateDiv('divPayment')) {
            $('#iptMtAll').css('color', 'red');
            return;
        }

        $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            if (MtMode == 'Add') {
                $('#tblInsuranceList').DataTable().cell(rowIdx, ColIndex).nodes().to$().find('select').append($("<option></option>").attr("value", "99").text("匯款/劃撥-" + $('#iptMtAll').val()));
            }
            else {
                $('#tblInsuranceList').DataTable().cell(rowIdx, ColIndex).nodes().to$().find('select option[value="99"]').text("匯款/劃撥-" + $('#iptMtAll').val());
            }
        });

        if (MtMode == 'Add') {
            $('#pay_status').append($("<option></option>").attr("value", "99").text("匯款/劃撥-" + $('#iptMtAll').val()));
            $('#sltSeqNo_BringIn').append($("<option></option>").attr("value", "99").text("匯款/劃撥-" + $('#iptMtAll').val()));
            MsgBox('新增成功', '新增匯款/劃撥-' + $("#iptMtAll").val() + '成功', 'green');
        }
        else {
            $('#pay_status').find('option[value="99"]').text("匯款/劃撥-" + $('#iptMtAll').val());
            $('#sltSeqNo_BringIn').find('option[value="99"]').text("匯款/劃撥-" + $('#iptMtAll').val());
            MsgBox('修改成功', '修改匯款/劃撥-' + $("#iptMtAll").val() + '成功', 'green');
        }

        sltSeqNoHtml = $('#sltSeqNo_BringIn')[0].outerHTML;
        $('#tblInsuranceList').DataTable().draw();

        $('#iptMtTemp').val(RemoveComma($("#iptMtAll").val()));
        $('#iptMtAll').css('color', 'black');

        //計算匯款餘額
        var Mt_Remain = parseInt(RemoveComma($("#iptMtAll").val())) - parseInt(RemoveComma($("#iptMtPay").val()));
        $("#iptMtRemain").val(Comma(Mt_Remain));
        Caculate();
        $.unblockUI();
    }, 100)
});

//繳費來源區塊- 匯款方式改變時，顏色跟著改變
$("#iptMtAll").on("change", function (e) {
    if (RemoveComma($('#iptMtAll').val()) != RemoveComma($('#iptMtTemp').val())) {
        $('#iptMtAll').css('color', 'red');
    }
    else {
        $('#iptMtAll').css('color', 'black');
    }
})

//繳費來源區塊- 篩選區_欄位觸發事件
$('#iptSearchAllPayList').keyup(function () {
    $('#tblPaymentCheckList').DataTable().draw();
});

//繳費來源區塊- 註冊_開啟繳費來源事件
$('#divPayment').on('shown.bs.modal', function (e) {
    $(window).resize();
    $('#iAddCheck').tooltip('toggle');
});

//繳費來源區塊- DataTableErrorMessage
$('#tblPaymentCheckList').on('error.dt', function (e, settings, techNote, message) {
    MsgBox(message);
}).DataTable();

//繳費來源區塊- 產生客票來源清單
function selZReasonSrc() {
    $.ajax({
        url: "/Payment/ZReasonSrc",
        type: "POST",
        dataType: "json",
        timeout: 1000 * 10,
        success: function (result) {
            var option = document.createElement("option");
            option.value = '';
            option.text = '請選擇';
            $('#selZReason').append(option);

            $.each(result, function (index, value) {
                var option = document.createElement("option");
                option.value = value['DESCITEM'];
                option.text = value['LONGDESC'];
                $('#selZReason').append(option);
            });
        },
        error: AjaxError
    });
}

//繳費來源區塊- 檢核票據代號
function ChkZnoTeex(DESCITEM) {
    var Result = '';
    $.ajax({
        url: "/Payment/ChkZnoTeex",
        type: "POST",
        dataType: "json",
        timeout: 1000 * 10,
        async: false,
        data: {
            DESCITEM: $('#iptZNoteex').val().trim()
        },
        success: function (result) {
            Result = result;
        },
        error: AjaxError
    });

    return Result;
}

//繳費來源區塊- 檢核分行代號
function ChkPayBank(BANKKEY) {
    var Result = '';
    $.ajax({
        url: "/Payment/ChkPayBank",
        type: "POST",
        dataType: "json",
        timeout: 1000 * 10,
        async: false,
        data: {
            BANKKEY: $('#iptPayBank').val().trim()
        },
        success: function (result) {
            Result = result;
        },
        error: AjaxError
    });

    return Result;
}

//繳費來源區塊- 產生繳費明細
function CreatPayTable() {
    $('#tblPaymentCheckList').DataTable({
        destroy: true,
        dom: '<"top">rt<"bottom">pli<"clear">',
        responsive: true,
        language: DataTablsChineseLanguage,
        //pagingType: "full_numbers",
        //lengthMenu: [[10, 30, 50, 100], [10, 30, 50, 100]],
        //pageLength: 10,
        lengthChange: false,
        paging: true,
        processing: true,
        data: PaymentSource,
        searching: true,
        fixedHeader: {
            header: true
        },
        orderCellsTop: true,
        columns: [
            {
                data: "SEQNO", name: "SEQNO"
            },
            {
                data: function (source, type, val) {
                    return $.datefomater(source.ZNOTEDUE)
                }
            },
            {
                data: "ZCHEQNUM", name: "ZCHEQNUM"
            },
            {
                data: "ZNOTEEX", name: "ZNOTEEX"
            },
            {
                data: "PAYBANK", name: "PAYBANK"
            },
            {
                data: function (source, type, val) {
                    return Comma(source.ORIGAMT)
                }, name: "ORIGAMT"
            },
            {
                data: function (source, type, val) {
                    value = $('#selZReason').find('option[value="' + source.ZREASON + '"]')[0].text;
                    value = value == '請選擇' ? '' : value;
                    return value;
                }
            },
            {
                data: "SURNAME", name: "SURNAME"
            },
            {
                //編輯
                data: function (source, type, val) {
                    var NUMCON = source.NUMCON == undefined ? 01 : source.NUMCON;
                    return '<td><input type="hidden" id="iptNumCon" value="' + NUMCON + '"/><input id="iptRemainCol" value="' + source.ORIGAMT + '" type="hidden"><a href="#" class="aUpdPaymentCheckList" onclick="UpdPaymentCheckList(this)" style="cursor:pointer" data-toggle="modal" data-target="#divAddorAlterCheck"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a> | <a href="#" class="aDelPaymentCheckList" onclick="DelPaymentCheckList(this)"><i class="fa fa-trash-o" aria-hidden="true"></i></a></td>';
                },
            },
        ],
        columnDefs: [
            {
                className: "text-center",
                targets: [
                    FindTableIndex('tblPaymentCheckList', '資料序號'),
                    FindTableIndex('tblPaymentCheckList', '票據到期日期'),
                    FindTableIndex('tblPaymentCheckList', '支票號碼'),
                    FindTableIndex('tblPaymentCheckList', '票交所代號'),
                    FindTableIndex('tblPaymentCheckList', '付款行代號'),
                    FindTableIndex('tblPaymentCheckList', '客票來源'),
                    FindTableIndex('tblPaymentCheckList', '發票人名稱'),
                    FindTableIndex('tblPaymentCheckList', '編輯'),
                ]
            },
            {
                className: "td text-right", targets: [
                    FindTableIndex('tblPaymentCheckList', '金額'),]
            },
            {
                orderable: false,
                targets: FindTableIndex('tblPaymentCheckList', '編輯')
            }
        ],
    });

}

//繳費來源區塊- 註冊_新增支票檔-動態產生按鈕，所以要重覆註冊事件
$("#aAddCheck").on("click", function () {
    $('#divAddorAlterCheck input').val('');
    var tblPaymentCheckListLastRow = $('#tblPaymentCheckList').DataTable().data().length - 1;
    var LastSeqNo = tblPaymentCheckListLastRow == -1 ? 0 : $('#tblPaymentCheckList').DataTable().row(tblPaymentCheckListLastRow).data().SEQNO;
    var cnt = padLeft(parseInt(LastSeqNo) + 1, 2);
    $("#iptSeqNo").val(cnt);
    $("#h4Money").html('新增票據');
    $("#btnAddorAlterCheck").html('新增');
    $('#selZReason').removeAttr('required');
    //清空客票來源
    $('#selZReason').val('');
})

//繳費來源區塊- 註冊_確認新增或修改支票檔-動態產生按鈕，所以要重覆註冊事件
$('#btnAddorAlterCheck').click(function (e) {
    BlockUI('作業中，請稍後');

    var Validate = true;
    Validate = ValidateDiv('divAddorAlterCheck');
    //暫時關閉
    if ($('#iptZNoteex').val() != '' && ChkZnoTeex($('#iptZNoteex').val()) == "N") {
        Validate = false;
        ShowMsgInElm('#iptZNoteex', '非正確的票據所代號');
    }
    if ($('#iptPayBank').val() != '' && ChkPayBank($('#iptPayBank').val()) == "N") {
        Validate = false;
        ShowMsgInElm('#iptPayBank', '非正確的付款行代號');
    }
    if (!Validate) {
        $.unblockUI();
        return;
    }

    $('#divAddorAlterCheck').modal('toggle');
    if ($(this).text() == '新增') {
        $('#tblPaymentCheckList').DataTable().row.add({
            SEQNO: $('#iptSeqNo').val(),
            ZNOTEDUE: $('#iptZNoTedue').val().replace(/\//g, ''),
            ZCHEQNUM: $('#iptZCheQnum').val(),
            ZNOTEEX: $('#iptZNoteex').val(),
            PAYBANK: $('#iptPayBank').val(),
            ORIGAMT: RemoveComma($('#iptOrigAmt').val()),
            ZREASON: $('#selZReason').val() || '',
            SURNAME: $('#iptSurName').val()
        }).draw();

        //跳到最後頁
        $('#tblPaymentCheckList').DataTable().page('last').draw('page');

        //目前序號
        var Cnt = $('#iptSeqNo').val()

        //寫入保單明細的每個繳費來源中
        var ColIndex = FindTableIndex('tblInsuranceList', '繳費來源');
        $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            $('#tblInsuranceList').DataTable().cell(rowIdx, ColIndex).nodes().to$().find('select').append('<option value=' + Cnt + '>支票(' + Cnt + ")-" + $('#iptOrigAmt').val() + '</option>');
        });
        $('#pay_status').append('<option value=' + Cnt + '>支票(' + Cnt + ")-" + $('#iptOrigAmt').val() + '</option>');
        $('#sltSeqNo_BringIn').append('<option value=' + Cnt + '>支票(' + Cnt + ")-" + $('#iptOrigAmt').val() + '</option>');
        MsgBox('新增成功', '新增支票(' + Cnt + ")-" + $('#iptOrigAmt').val() + '成功', 'green');
    }
    else if ($(this).text() == '修改') {
        var RowIndex = $('#tblPaymentCheckList').DataTable().column().data().indexOf($('#iptSeqNo').val());
        var trRow = $('#tblPaymentCheckList').DataTable().rows().data().filter(function (x) {
            return x.SEQNO == $('#iptSeqNo').val()
        })[0];
        trRow.NUMCON = $('#iptNumCon').val();
        trRow.SEQNO = $('#iptSeqNo').val();
        trRow.ZREASON = $('#selZReason').val() || '';
        trRow.ZNOTEDUE = $('#iptZNoTedue').val().replace(/\//g, '');
        trRow.ZCHEQNUM = $('#iptZCheQnum').val();
        trRow.ZNOTEEX = $('#iptZNoteex').val();
        trRow.PAYBANK = $('#iptPayBank').val();
        trRow.ORIGAMT = RemoveComma($('#iptOrigAmt').val());
        trRow.SURNAME = $('#iptSurName').val();
        var ColIndex = FindTableIndex('tblInsuranceList', '繳費來源');
        $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            $('#tblInsuranceList').DataTable().cell(rowIdx, ColIndex).nodes().to$().find('select').find('option[value=' + $('#iptSeqNo').val() + ']').text('支票(' + $('#iptSeqNo').val() + ')-' + $('#iptOrigAmt').val());
        });
        $('#tblPaymentCheckList').DataTable().row(RowIndex).data(trRow).draw();
        $('#pay_status').find('option[value=' + $('#iptSeqNo').val() + ']').text('支票(' + $('#iptSeqNo').val() + ')-' + $('#iptOrigAmt').val());
        $('#sltSeqNo_BringIn').find('option[value=' + $('#iptSeqNo').val() + ']').text('支票(' + $('#iptSeqNo').val() + ')-' + $('#iptOrigAmt').val());
        MsgBox('修改成功', '修改支票(' + $('#iptSeqNo').val() + ")-" + $('#iptOrigAmt').val() + '成功', 'green');
    }
    sltSeqNoHtml = $('#sltSeqNo_BringIn')[0].outerHTML;
    $('#tblInsuranceList').DataTable().draw();
    $.unblockUI();
    Caculate();
});

//繳費來源- 刪除
function DelPaymentCheckList(Element) {
    var trRow = $(Element).parents('tr');
    var CurrentVal = $('#tblPaymentCheckList').DataTable().row(trRow).data().SEQNO;
    var Validate = '';

    $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
        var colVal = this.data().SEQNO;
        if (colVal == CurrentVal) {
            Validate += this.data().POLNUM + "<br>";
            return false;
        }
    });

    if (Validate != '') {
        MsgBox('刪除失敗', '此支票已對應到保單號碼<br>' + Validate, 'red');
        return;
    }

    ConfirmBox('確認刪除?', '是否確認刪除支票(' + CurrentVal + ')?', 'orange', function () {
        $('#tblPaymentCheckList').DataTable().row(trRow).remove().draw();
        var ColIndex = FindTableIndex('tblInsuranceList', '繳費來源');
        $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
            $('#tblInsuranceList').DataTable().cell(rowIdx, ColIndex).nodes().to$().find('select').find('option[value=' + CurrentVal + ']').remove();
        });

        $('#sltSeqNo_BringIn').find('option[value=' + CurrentVal + ']').remove();;

        sltSeqNoHtml = $('#sltSeqNo_BringIn')[0].outerHTML;
        Caculate();
    });
}

//繳費來源- 更新
function UpdPaymentCheckList(Element) {
    var trRow = $(Element).parents('tr');
    var RowData = $('#tblPaymentCheckList').DataTable().row(trRow).data();

    var ZReasonRequired = $('#tblInsuranceList').DataTable().rows().data().filter(function (x) { return x.SEQNO == RowData.SEQNO && x.CTYPE == "Y" }).length > 0 ? true : false;

    if (ZReasonRequired) { $('#selZReason').attr('required', 'required') } else $('#selZReason').removeAttr('required');

    $("#h4Money").html('修改票據');
    $("#btnAddorAlterCheck").html('修改');
    $('#iptSeqNo').val(RowData.SEQNO),
        $('#iptZNoTedue').val($.datefomater(RowData.ZNOTEDUE)),
        $('#iptZCheQnum').val(RowData.ZCHEQNUM),
        $('#iptZNoteex').val(RowData.ZNOTEEX),
        $('#iptPayBank').val(RowData.PAYBANK),
        $('#iptOrigAmt').val(Comma(RowData.ORIGAMT)),
        $('#selZReason').val(RowData.ZREASON),
        $('#iptSurName').val(RowData.SURNAME)
}

//繳費來源- 抓取DataTables的ErrMode訊息
$('#tblPaymentCheckList').on('error.dt', function (e, settings, techNote, message) { MsgBox('Error', message, 'red'); }).DataTable();

//繳費來源- 已繳現金金額 (已繳現金金額-(匯費、郵資+暫收款+應付款))
$("#iptRemittance,#iptTemporaryCredit,#iptPayables").on("keyup blur", function () {  //匯費、郵資, 暫收款, 應付款 
    var Cash = RemoveComma($('#MoneyPayTemp').val());  //取得原始金額
    var strValue = ($(this).val()).toString();          //input轉字串
    if (strValue[0] == "0" && strValue.length > 1) {      //如果數字第一位為0 && 數字為數大於1 則 
        $(this).val(strValue.substr(1));                //去掉最左一位數
    }
    if (($(this).val() < 0) || isNaN($(this).val()) || ($(this).val()).indexOf(".") !== -1) { //input < 0 || 輸入不是數字 ||包含小數點 則
        $(this).val("");                               //input 欄位空 ""
    }
    var Remittance = parseInt(RemoveComma($("#iptRemittance").val() == "" ? "0" : $("#iptRemittance").val()));                // 如果沒有值則設為0 並轉為數字型態
    var TemporaryCredit = parseInt(RemoveComma($("#iptTemporaryCredit").val() == "" ? "0" : $("#iptTemporaryCredit").val()));    // 如果沒有值則設為0 並轉為數字型態
    var Payables = parseInt(RemoveComma($("#iptPayables").val() == "" ? "0" : $("#iptPayables").val()));                  // 如果沒有值則設為0 並轉為數字型態
    var result = Cash - (Remittance + TemporaryCredit + Payables);      //result 為 """已繳現金金額-(匯費、郵資+暫收款+應付款)"""

    if (!isNaN(result)) {                   //if result 不是 Not a Number
        $("#ipMoneyPay").val(Comma(result)) //將result放至 已繳現金金額("#ipMoneyPay)
    }
})

//#endregion ==============================================繳費來源區塊==============================================

//#region ==============================================保單明細區塊==============================================

//保單明細區塊- 建立繳費來源HTML物件
function SeqNoHtml() {
    //保單明細區塊- 建立繳費來源下拉HTML
    var elmPayment = document.createElement("select")
    elmPayment.id = "";
    var MtAllTemp = 0;
    var CashIndex = 0;
    var AllocationIndex = 0;
    var option = document.createElement("option");
    option.value = '';
    option.text = '請選擇';
    elmPayment.appendChild(option);
    var option = document.createElement("option");
    option.value = '98';
    option.text = '現金';
    elmPayment.appendChild(option);
    $.each(PaymentSource, function (i, v) {
        var option = document.createElement("option");
        if (v != undefined && v.SEQNO == '99') {
            MtAllTemp = Comma(v.ORIGAMT);
            option.value = v.SEQNO;
            option.text = '匯款/劃撥-' + Comma(v.ORIGAMT);
            elmPayment.appendChild(option)
            $('#iptMtAll').val(Comma(v.ORIGAMT));
        }
        else if (v != undefined && v.SEQNO != '98' && v.SEQNO != '91' && v.SEQNO != '92' && v.SEQNO != '93') {
            option.value = v.SEQNO;
            option.text = '支票(' + v.SEQNO + ')-' + Comma(v.ORIGAMT);
            elmPayment.appendChild(option);
        }
    });

    //篩選-繳費來源
    $('#pay_status').find('option').remove();
    var option = document.createElement("option");
    option.value = '';
    option.text = '請選擇';
    $('#pay_status').append(option);
    var option = document.createElement("option");
    option.value = 'Y';
    option.text = '已選擇繳費來源';
    $('#pay_status').append(option);
    var option = document.createElement("option");
    option.value = 'N';
    option.text = '未選擇繳費來源';
    $('#pay_status').append(option);
    var option = document.createElement("option");
    option.value = '98';
    option.text = '現金';
    $('#pay_status').append(option);
    $.each(PaymentSource, function (i, v) {
        var option = document.createElement("option");
        if (v != undefined && v.SEQNO == '99') {
            MtAllTemp = Comma(v.ORIGAMT);
            option.value = v.SEQNO;
            option.text = '匯款/劃撥-' + Comma(v.ORIGAMT);
            $('#pay_status').append(option);
        }
        else if (v != undefined && v.SEQNO != '98' && v.SEQNO != '91' && v.SEQNO != '92' && v.SEQNO != '93') {
            option.value = v.SEQNO;
            option.text = '支票(' + v.SEQNO + ')-' + Comma(v.ORIGAMT);
            $('#pay_status').append(option);
        }
    });


    MtAllTemp = Comma(PaymentSource.filter(function (x) { x.SEQNO === '98' }).map(function (x) { x.ORIGAMT })) || '$0';
    
    //註冊_匯款總額加千分號
    //$("#iptMtAll").val(MtAllTemp);
    var CashIndex = PaymentSource.map(function (d) { return d['SEQNO']; }).indexOf('99');
    if (CashIndex != -1) PaymentSource.splice(CashIndex, 1);

    var AllocationIndex = PaymentSource.map(function (d) { return d['SEQNO']; }).indexOf('98');
    if (AllocationIndex != -1) PaymentSource.splice(AllocationIndex, 1);

    //SEQNO91~93不須於繳費明細中列出，因此先設值並於PaymentSource中移除
    var RemittanceIndex = PaymentSource.map(function (d) { return d['SEQNO']; }).indexOf('91');
    if (RemittanceIndex != -1) {
        $("#iptRemittance").val(Comma(PaymentSource[RemittanceIndex].ORIGAMT)); 
        PaymentSource.splice(RemittanceIndex, 1);
    }

    var TemporaryCreditIndex = PaymentSource.map(function (d) { return d['SEQNO']; }).indexOf('92');
    if (TemporaryCreditIndex != -1) {
        $("#iptTemporaryCredit").val(Comma(PaymentSource[TemporaryCreditIndex].ORIGAMT));
        PaymentSource.splice(TemporaryCreditIndex, 1);
    }

    var PayablesIndex = PaymentSource.map(function (d) { return d['SEQNO']; }).indexOf('93');
    if (PayablesIndex != -1) {
        $("#iptPayables").val(Comma(PaymentSource[PayablesIndex].ORIGAMT));
        PaymentSource.splice(PayablesIndex, 1);
    }

    elmPayment.setAttribute('class', 'form-control input-sm');
    elmPayment.setAttribute('id', 'sltSeqNo');
    return elmPayment.outerHTML;
}

$('#btnBatch_Del').click(function () {
    var Msg = '處理中，請稍後';
    BlockUI(Msg);
    setTimeout(function () {
        var tmpData;
        var processMsg = [];
        $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {

            tmpData = this.data();

            if (tmpData.SEQNO != '') {

                tmpData.SEQNO = '';
                tmpData.TRANDATEX = '';
                rowNode = this.node();
                RowColor(rowIdx);
                var item = $(rowNode).find('#sltSeqNo');
                item.val('');
                var iptTranDateX = $(rowNode).find('.iptTranDateX').val("");

                if (iptTranDateX == undefined) {
                    iptTranDateX = $(rowNode).next('tr.child').find('.iptTranDateX').val("");
                }

                processMsg.push(tmpData.POLNUM + "-" + tmpData.TRANNO);
            }

        });
        if (processMsg.length == 0) {
            MsgBox('刪除結果', '無任何可刪除的保單', 'green');
        }
        else {
            MsgBox('刪除結果', '以下保單已刪除，請確認<br/>' + processMsg.join('<br/>'), 'green');
        }

        $.unblockUI()
    }, 200)
});

//保單明細區塊- 帶入下表按鈕事件
$("#btnBringInDt").click(function () {
    var Msg = $('#sltSeqNo_BringIn').val() != '' ? '逐筆檢核中，請稍後' : '處理中，請稍後';
    BlockUI(Msg);
    setTimeout(function () {
        var BringIn = {
            SeqNo: $('#sltSeqNo_BringIn').val(),
            ZFlag: $('#sltZFlag_BringIn').val(),
            TranDateX: $('#iptTranDateX_BringIn').val(),
            CTYPE: $('#sltCType_BringIn').val()
        };

        if (BringIn.SeqNo == 0 && BringIn.ZFlag == '' && BringIn.TranDateX == '' && BringIn.CType == '') {
            MsgBox('檢核訊息', '請填寫帶入資料至少任一欄位', 'red');
            $.unblockUI()
            return;
        }

        var ErroMsg = '';
        $('#tblInsuranceList').DataTable().rows({ page: 'current' }).every(function (rowIdx, tableLoop, rowLoop) {
            ErroMsg = Validate(this, BringIn, rowIdx, ErroMsg);
        });

        if (ErroMsg) {
            MsgBox('檢核訊息', ErroMsg, 'red');
        }

        Caculate();
        $.unblockUI()
    }, 200)
})

function Validate(obj, BringIn, rowIdx, ErroMsg) {
    rowNode = obj.node();

    //只帶入未繳費項目
    if (obj.data().SEQNO == '') {
        if (BringIn.SeqNo != '') {
            obj.data().SEQNO = BringIn.SeqNo;
            $(rowNode).find('#sltSeqNo').val(BringIn.SeqNo);
        }

        if (BringIn.ZFlag != '') {
            obj.data().ZFLAG = BringIn.ZFlag;
            $(rowNode).find('#sltZFlag').val(BringIn.ZFlag);
            $(rowNode).next('tr.child').find('#sltZFlag').val(BringIn.ZFlag)
        }

        if (BringIn.CType != '') {
            obj.data().CTYPE = BringIn.CTYPE;
            $(rowNode).find('#sltCType').val(BringIn.CType);
            $(rowNode).next('tr.child').find('#sltCType').val(BringIn.CType)
        }

        if (BringIn.TranDateX != '') {
            obj.data().TRANDATEX = BringIn.TranDateX;
            var iptTranDateX = $(rowNode).find('.iptTranDateX').val(BringIn.TranDateX);
            if (iptTranDateX == undefined) {
                $(rowNode).next('tr.child').find('.iptTranDateX').val(BringIn.TranDateX);
            }

            RegFormDatetimeNoSetTimeOut(iptTranDateX);
        }
        if (BringIn.RSeqNum != '' && BringIn.RSeqNum != undefined) {
            obj.data().RSEQNUM = BringIn.RSeqNum;
            $(rowNode).next('tr.child').find('#sltRSeqNum').val(BringIn.RSeqNum);
            if (iptRSeqNum == undefined) {
                var iptRSeqNum = $(rowNode).find('#sltRSeqNum').val(BringIn.RSeqNum);
            }
        }

        Msg = BringIn.SeqNo != '' ? InsureValidate(rowIdx) : "";

        ErroMsg += Msg != '' ? Msg + '<br> <hr class="hrHotains">' : "";

        if (BringIn.SeqNo != '' && Msg != '') {
            obj.data().SEQNO = "";
            $(rowNode).find('#sltSeqNo').val("");
        }

        RowColor(rowIdx);
    }

    return ErroMsg;
}

//保單明細區塊- 計算各項餘額
function Caculate() {
    //取得目前已繳款的明細
    var AlreadyPaid = $('#tblInsuranceList').DataTable().rows().data().filter(function (x) {
        return x.SEQNO != ''
    });

    //計算目前已繳現金
    var Cash = AlreadyPaid.filter(function (x) {
        return x.SEQNO === '98'
    }).map(function (x) {
        return x.ZPREMS
    });
    Cash = Cash.length > 0 ? Cash.reduce(function (x, y) {
        return parseInt(x) + parseInt(y)
    }) : 0;

    //計算目前已繳匯款/劃撥
    ////劃撥總金額
    var MtAll = parseInt(RemoveComma($('#iptMtAll').val()));
    ////已繳劃撥金額
    var alMt = AlreadyPaid.filter(function (x) {
        return x.SEQNO === '99'
    }).map(function (x) {
        return x.ZPREMS
    });
    alMt = alMt.length > 0 ? alMt.reduce(function (x, y) {
        return parseInt(x) + parseInt(y)
    }) : 0;
    

    ////當已繳劃撥金額 > 劃撥總金額時，已繳劃撥等於劃撥總金額，多的放到現金，由現金繳付
    Cash += alMt > MtAll ? parseInt(alMt) - parseInt(MtAll) : 0;
    alMt = alMt > MtAll ? MtAll : alMt;
    ////劃撥餘額
    var MtRemain = parseInt(MtAll) - parseInt(alMt)

    //計算目前已繳支票
    ////已繳支票-序號
    var alCheckZ = AlreadyPaid.filter(function (x) {
        return x.SEQNO != '99' && x.SEQNO != '98' && x.SEQNO != '91' && x.SEQNO != '92' && x.SEQNO != '93' && x.SEQNO != ''
    });
    ////已繳支票-支票總金額
    var CheckPay = alCheckZ.length > 0 ? $('#tblPaymentCheckList').DataTable().rows().data().filter(function (x) {
        return alCheckZ.map(function (x) { return x.SEQNO }).toArray().toString().indexOf(x.SEQNO) > -1
    }) : 0;
    CheckPay = CheckPay.length > 0 ? CheckPay.map(function (x) { return x.ORIGAMT }).reduce(function (x, y) {
        return parseInt(x) + parseInt(y)
    }) : 0;
    ////已繳支票-擬繳總金額
    alCheckZ = alCheckZ.length > 0 ? alCheckZ.map(function (x) { return x.ZPREMS }).reduce(function (x, y) {
        return parseInt(x) + parseInt(y)
    }) : 0;
    ////支票-總金額
    var CheckAll = $('#tblPaymentCheckList').DataTable().rows().data().map(function (x) {
        return x.ORIGAMT
    });
    CheckAll = CheckAll.length > 0 ? CheckAll.reduce(function (x, y) {
        return parseInt(x) + parseInt(y)
    }) : 0;
    ////當已繳支票金額 >支票總金額時，已繳支票等於支票總金額，多的放到現金，由現金繳付
    CheckPay = alCheckZ > CheckPay ? CheckPay : alCheckZ;
    Cash += alCheckZ > CheckPay ? parseInt(alCheckZ) - parseInt(CheckPay) : 0;
    ////支票餘額
    var CheckRemain = parseInt(CheckAll) - parseInt(CheckPay);
    //// 已繳現金金額 = 已繳現金金額-(匯費、郵資+暫收款+應付款)
    var Remittance = parseInt(RemoveComma($("#iptRemittance").val()));               
    var TemporaryCredit = parseInt(RemoveComma($("#iptTemporaryCredit").val()));    
    var Payables = parseInt(RemoveComma($("#iptPayables").val()));                
    var result = Cash - (Remittance + TemporaryCredit + Payables);      //result 為 """已繳現金金額-(匯費、郵資+暫收款+應付款)"""

    $("#iptRemittance").val(Comma(Remittance));
    $("#iptTemporaryCredit").val(Comma(TemporaryCredit));
    $("#iptPayables").val(Comma(Payables));
    $('#ipMoneyPay').val(Comma(result));
    $('#MoneyPayTemp').val(Comma(Cash));//新增ipMoneyPay Temp
    $('#iptCheckPay').val(Comma(CheckPay));
    $('#iptCheckRemain').val(Comma(CheckRemain));
    $('#iptCheckAll').val(Comma(CheckAll))
    $('#iptMtPay').val(Comma(alMt));
    $('#iptMtRemain').val(Comma(MtRemain));
}

//保單明細區塊- 變換列的顏色
function RowColor(rowIndex) {
    var data = $('#tblInsuranceList').DataTable().row(rowIndex).data();
    var row = $('#tblInsuranceList').DataTable().row(rowIndex);

    if (data.SEQNO != '') {
        $(row.node()).next('tr.child').find('select,input,span').removeClass('datatable_row_color').addClass('datatable_selectrow_color');
        $(row.node()).next('tr.child').find('select:not(#sltSeqNo),input,span').prop('disabled', true);
        $(row.node()).find('select,input,td').removeClass('datatable_row_color').addClass('datatable_selectrow_color');
        $(row.node()).find('select:not(#sltSeqNo),input').prop('disabled', true);
    }
    else {
        $(row.node()).next('tr.child').find('select,input,span').removeClass('datatable_selectrow_color').addClass('datatable_row_color');
        $(row.node()).next('tr.child').find('select:not(#sltSeqNo),input,span').prop('disabled', false);
        $(row.node()).find('select,input,td').removeClass('datatable_selectrow_color').addClass('datatable_row_color');
        $(row.node()).find('select:not(#sltSeqNo),input').prop('disabled', false);
    }
}

//保單明細區塊- 欄位變更後驗證檢查
function InsureValidate(rowIndex) {
    var ErroMsg = '';
    var row = $('#tblInsuranceList').DataTable().row(rowIndex).data();
    var rowNode = $('#tblInsuranceList').DataTable().row(rowIndex).node();

    var SEQNO = row.SEQNO
    var CTYPE = row.CTYPE;
    var ZFLAG = row.ZFLAG;
    var sltRSeqNum = $(rowNode).next('tr.child').find('#sltRSeqNum')[0] || $(rowNode).find('#sltRSeqNum')[0];
    var RSEQNUM = row.RSEQNUM;
    var TRANDATEX = row.TRANDATEX;
    var TRANDATE = row.TRANDATE;
    var tblPayData = $('#tblPaymentCheckList').DataTable().rows().data().filter(function (x) { return x.SEQNO == SEQNO })[0];
    var ZREASON = tblPayData == undefined ? '' : tblPayData.ZREASON

    if (SEQNO != '') {

        ErroMsg += (SEQNO != '91' && SEQNO != '92' && SEQNO != '93' && SEQNO != '98' && SEQNO != '99' && CTYPE == '' && ZREASON != '') ? "客票註記、" : ""

        ErroMsg += (TRANDATEX == '') ? "收費日期、" : "";

        if (SEQNO != '91' && SEQNO != '92' && SEQNO != '93' && SEQNO != '98' && SEQNO != '99' && ZFLAG == '' && row.POLPFX != '') {
            ErroMsg += "收費出單特殊票期、";
        }

        if (ErroMsg != '') {
            ErroMsg = ErroMsg.slice(0, -1) + '不可為空白<br>';
        }

        if (SEQNO != '91' && SEQNO != '92' && SEQNO != '93' && SEQNO != '98' && SEQNO != '99' && CTYPE == 'Y' && ZREASON == '') {
            ErroMsg += "無填客票原因，客票註記不可為'是'<br>";
        }


        var SeqNum = $(sltRSeqNum).val();
        if ((row.POLPFX != "R" && row.RSEQNEED == 'Y' && SEQNO != '99') &&
            (row.POLPFX != "R" && RSEQNUM == '' || (RSEQNUM > 2 || RSEQNUM < 1 || RSEQNUM == undefined))) {
            ErroMsg += "尚未產生預收保費證明，請產生預收保費證明後，重新登入進行擬繳";
        }
        else if (row.RSEQNEED == 'Y' && RSEQNUM != '' && SEQNO != '99' && SeqNum != undefined) {
            SeqNum = SeqNum.length == 1 ? ('0' + SeqNum) : SeqNum;
            RSEQNUM = SeqNum;
            row.RSEQNUM = SeqNum;
            $(sltRSeqNum).val(RSEQNUM);
        }
    }

    if (ErroMsg == '') {
        if (SEQNO == '98' && parseInt(row.ZPREMS) > 50000)
            ErroMsg += '無法使用現金繳付超過五萬元的保單<br><br>';


        //收費出單-現金、匯款/劃撥檢核
        if (SEQNO == '98' || SEQNO == '99') {

            if ((row.POLPFX != '' && row.POLPFX != 'E' && row.ORGTRNO == row.TRANNO && row.CNTTYPE == 'MCP') && parseInt(GetDateNumber(TRANDATEX)) > parseInt(row.FCCDATE)) {
                ErroMsg += '收費出單非支票，強制險單收費日期(' + $.datefomater(GetDateNumber(TRANDATEX)) + ') 不得超過立約日期(' + $.datefomater(row.FCCDATE) + ') <br><br>';
            }

            var PE = false;
            var Name = row.POLPFX == 'E' ? '批單試算' : '批單';

            if (row.POLPFX == 'E' ||
                (row.POLPFX != '' && row.ORGTRNO != 0 && row.ORGTRNO != row.TRANNO) ||
                (row.POLPFX == 'P' && row.ORGTRNO != row.TRANNO)) {
                PE = true;
            }

            if (PE && row.TRANDATE != '' && parseInt(GetDateNumber(TRANDATEX)) > parseInt(row.TRANDATE)) {       
                ErroMsg += '車險' + Name + '非支票已簽發，收費日期(' + $.datefomater(GetDateNumber(TRANDATEX)) + ') 不得超過交易日期(' + $.datefomater(row.TRANDATE) + ')<br><br>';
            }
            else if (PE && row.TRANDATE == '' && parseInt(GetDateNumber(TRANDATEX)) > parseInt(GetDay('0').replace(/\//g, ''))) {
                ErroMsg += '車險' + Name + '非支票未簽發，收費日期(' + $.datefomater(GetDateNumber(TRANDATEX)) + ') 不得超過系統日期(' + GetDay('0') + ')<br><br>';
            }
            else if (row.POLPFX != '' && PE == false && parseInt(GetDateNumber(TRANDATEX)) > parseInt(row.EFFECDTA)) {
                ErroMsg += '收費出單非支票，收費日期(' + $.datefomater(GetDateNumber(TRANDATEX)) + ') 不得超過生效日期(' + $.datefomater(row.EFFECDTA) + ')<br><br>';
            }
        }

        //收費出單-支票檢核
        if (SEQNO != '' && SEQNO != '98' && SEQNO != '99' && x.SEQNO != '91' && x.SEQNO != '92' && x.SEQNO != '93') {
            var ZNOTEDUE = $('#tblPaymentCheckList').DataTable().rows().data().filter(function (x) {
                return x.SEQNO == SEQNO
            })[0].ZNOTEDUE;
            if (row.FLGS == '%')
                ErroMsg += '折扣單無法使用支票繳費<br><br>';

            if (row.POLPFX != '' && parseInt(GetDateNumber(TRANDATEX)) > parseInt(row.EFFDATEX))
                ErroMsg += '收費出單使用支票，收費日期(' + $.datefomater(GetDateNumber(TRANDATEX)) + ')不得超過支票延繳日(' + $.datefomater(row.EFFDATEX) + ')<br><br>';

            if (row.POLPFX != '' && ZFLAG == 'N' && parseInt(ZNOTEDUE) > parseInt(row.ZNOTEDUEO1))
                ErroMsg += '收費出單使用支票，票據到期日期(' + $.datefomater(ZNOTEDUE) + ')不得超過支票票期(' + $.datefomater(row.ZNOTEDUEO1) + ')<br><br>';

            if (row.POLPFX != '' && ZFLAG == 'Y' && parseInt(ZNOTEDUE) > parseInt(row.ZNOTEDUEO2))
                ErroMsg += '收費出單使用支票，票據到期日期(' + $.datefomater(ZNOTEDUE) + ')不得超過特殊支票票期(' + $.datefomater(row.ZNOTEDUEO2) + ')<br><br>';

            if (ErroMsg == "" && ZFLAG == 'Y')
            {
                $('#divValidCheck').modal('show');
            }
        }
    }

    if (ErroMsg != '') {
        //可修改的欄位，錯誤時恢復原值
        row.SEQNO = "";
        return '保單號碼:' + row.POLNUM + "<br><br>" + ErroMsg;
    }

    return '';
}

//保單明細區塊- 篩選區
$.fn.dataTableExt.afnFiltering.push(
    function (settings, data, dataindex) {
        //BlockUI會導致使用者輸入卡卡
        if (settings.nTable.id == 'tblPaymentCheckList') {
            var data = $('#tblPaymentCheckList').DataTable().row(dataindex).data();

            //所有欄位
            var SearchAllPayList = $('#iptSearchAllPayList').val().trim().toUpperCase() || '';

            var AllPayListJson = '';

            $.each(data, function (i, v) {
                AllPayListJson += v
            })

            AllPayListJson = AllPayListJson.trim().toUpperCase();

            if (
                (AllPayListJson.indexOf(SearchAllPayList) >= 0)
            ) {
                return true;
            }
            else {
                return false;
            };

        }
        else if (settings.nTable.id == 'tblInsuranceList') {
            //只限保單明細進篩選條件
            var data = $('#tblInsuranceList').DataTable().row(dataindex).data();

            //交易日期起迄
            var s_trandate = $('#s_trandate').val().replace(/\//g, '') || '';
            var e_trandate = $('#e_trandate').val().replace(/\//g, '') || '';
            var trandate = data.TRANDATE.replace(/\//g, '');
            s_trandate = s_trandate == '' ? trandate : s_trandate;
            e_trandate = e_trandate == '' ? trandate : e_trandate;

            //生效日期起迄
            var s_effectivedate = $('#s_effectivedate').val().replace(/\//g, '') || '';
            var e_effectivedate = $('#e_effectivedate').val().replace(/\//g, '') || '';
            var effectivedate = data.EFFECDTA.replace(/\//g, '');
            s_effectivedate = s_effectivedate == '' ? effectivedate : s_effectivedate;
            e_effectivedate = e_effectivedate == '' ? effectivedate : e_effectivedate;

            //保單號碼
            var insur_no = $('#insur_no').val().trim().toUpperCase() || '';
            var insur_no_col = data.POLNUM.trim().toUpperCase();
            insur_no = insur_no == '' ? insur_no_col : insur_no;

            //保單別
            var insure_type = $('#insure_type').val().trim().toUpperCase() || '';
            var insure_type_col = data.CNTTYPE.trim().toUpperCase();
            insure_type = insure_type == '' ? insure_type_col : insure_type;

            //保單別
            var stcc = $('#iptStcc').val().trim().toUpperCase() || '';
            var stcc_col = data.STCC.trim().toUpperCase();
            stcc = stcc == '' ? stcc_col : stcc;

            //被保人姓名
            var custom_nm = $('#custom_nm').val().trim().toUpperCase() || '';
            var custom_nm_col = data.ZCNAME.trim().toUpperCase();
            custom_nm = custom_nm == '' ? custom_nm_col : custom_nm;

            //要保人姓名
            var aplname = $('#aplname').val().trim().toUpperCase() || '';
            var aplname_col = data.APLNAME.trim().toUpperCase();
            aplname = aplname == '' ? aplname_col : aplname;


            //繳費方式
            var pay_status = $('#pay_status').val();
            pay_status_col = data.SEQNO
            if (pay_status == 'Y' && pay_status_col != 0) pay_status_col = 'Y';
            else if (pay_status == 'N' && pay_status_col == 0) pay_status_col = 'N'
            pay_status = pay_status == '' ? pay_status_col : pay_status;

            //統計代號
            var allocstat = $('#allocstat').val() || '';
            var allocstat_col = data.ALLOCSTAT;
            allocstat = allocstat == '' ? allocstat_col : allocstat;

            //所有欄位
            var SearchAllInsureList = $('#iptSearchAllInsureList').val().trim().toUpperCase() || '';
            var AllInsureListJson = '';

            $.each(data, function (i, v) {
                AllInsureListJson += v
            })

            AllInsureListJson = AllInsureListJson.trim().toUpperCase();

            if (s_trandate == '' && e_trandate == '' && s_effectivedate == '' && e_effectivedate == ''
                && insur_no == '' && insure_type == '' && custom_nm == '' && aplname == '' && pay_status == '' && SearchAllInsureList == '')
                return true;
            if (
                (stcc_col.indexOf(stcc) >= 0) &&
                (insur_no_col.indexOf(insur_no) >= 0) &&
                (trandate >= s_trandate && trandate <= e_trandate) &&
                (effectivedate >= s_effectivedate && effectivedate <= e_effectivedate) &&
                (insure_type_col.indexOf(insure_type) >= 0) &&
                (custom_nm_col.indexOf(custom_nm) >= 0) &&
                (aplname_col.indexOf(aplname) >= 0) &&
                (allocstat_col.trim().toUpperCase().indexOf(allocstat.trim().toUpperCase()) >= 0) &&
                (pay_status == pay_status_col) &&
                (AllInsureListJson.indexOf(SearchAllInsureList) >= 0)
            ) {
                return true;
            }
            else {
                return false
            };
        }
    }
);

//保單明細區塊- 換頁
$('#sltInsureTblPageLength').change(function () {
    BlockUI('載入中，請稍後');
    var pageLength = $(this).val() == "" ? 10 : $(this).val();

    setTimeout(function () {
        $('#tblInsuranceList').DataTable().page.len(pageLength).draw();
        $('#tblInsuranceList').DataTable().columns.adjust().responsive.recalc();
        $.unblockUI();
    }, 100)
})

//保單明細區塊- 畫面摺疊展開事件
$('#tblInsuranceList').DataTable().on('responsive-display', function (e, datatable, row, showHide, update) {
    BlockUI('欄位縮放中，請稍後');
    setTimeout(function () {
        var rowNode = row.node();
        var sltSeqNo = $(rowNode).next('tr.child').find('#sltSeqNo')[0] || $(rowNode).find('#sltSeqNo')[0];
        $(sltSeqNo).val(row.data().SEQNO);
        var sltCType = $(rowNode).next('tr.child').find('#sltCType')[0] || $(rowNode).find('#sltCType')[0];
        $(sltCType).val(row.data().CTYPE);
        var sltZFlag = $(rowNode).next('tr.child').find('#sltZFlag')[0] || $(rowNode).find('#sltZFlag')[0];
        $(sltZFlag).val(row.data().ZFLAG);
        var sltRSeqNum = $(rowNode).next('tr.child').find('#sltRSeqNum')[0] || $(rowNode).find('#sltRSeqNum')[0];
        $(sltRSeqNum).val(row.data().RSEQNUM)
        var iptTranDateX = $(rowNode).next('tr.child').find('.iptTranDateX')[0] || $(rowNode).find('.iptTranDateX')[0];
        $(iptTranDateX).val(row.data().TRANDATEX)
        //日曆為動態產生，所以要各別註冊
        RegFormDatetimeNoSetTimeOut(iptTranDateX);

        //datetimepicker重新給值
        var date = row.data().TRANDATEX;
        RowColor(row.index());
        $('#tblInsuranceList').css('display', 'table');
        $('#tblInsuranceList').DataTable().responsive.recalc();
        $('#tblInsuranceList').DataTable().columns.adjust().responsive.recalc();
        $.unblockUI();
    }, 100)
});

//保單明細區塊- 畫面RWD縮放事件
$('#tblInsuranceList').DataTable().on('responsive-resize', function (e, datatable, columns) {
});

//保單明細區塊- 當視窗調整時，呼叫DataTables的自適應函式
var delay = true;
$(window).bind('resize', function () {
    $('#tblInsuranceList').DataTable().columns.adjust().responsive.recalc();
    $('#tblPaymentCheckList').DataTable().columns.adjust().responsive.recalc();
    $.unblockUI();
});

//保單明細區塊- 當保單明細重新渲染畫時，觸發視窗調整
$('#tblInsuranceList').on('draw.dt', function () {
    setTimeout(function () {
        $(window).resize();
        RegFormDatetimeNoSetTimeOut();
    }, 1);
})

//保單明細區塊- 明細輸入項變更事件
$('#tblInsuranceList tbody').on('change', '#sltSeqNo,#sltZFlag,#sltCType,#sltRSeqNum,.iptTranDateX', function () {
    var tr_row = $(this).parents('tr');

    if (tr_row[0] != undefined && tr_row[0].className == 'child') {
        tr_row = $(this).parents('tr').prev('tr');
    }

    var row = $('#tblInsuranceList').DataTable().row(tr_row);

    row.data().SEQNO = $(this)[0].id == 'sltSeqNo' ? $(this).val() : row.data().SEQNO;
    tr_row.find("#sltSeqNo").val(row.data().SEQNO);
    row.data().CTYPE = $(this)[0].id == 'sltCType' ? $(this).val() : row.data().CTYPE;
    row.data().ZFLAG = $(this)[0].id == 'sltZFlag' ? $(this).val() : row.data().ZFLAG;
    row.data().RSEQNUM = $(this)[0].id == 'sltRSeqNum' ? $(this).val() : row.data().RSEQNUM;

    row.data().TRANDATEX = tr_row.find(".iptTranDateX").val();
    var rowIdx = row.index();

    var ErroMsg = InsureValidate(rowIdx);

    if (ErroMsg != '') {
        row.data().SEQNO = "";
        tr_row.find("#sltSeqNo").val(row.data().SEQNO);

        MsgBox('檢核訊息', ErroMsg, 'red');

    } else if ($(this)[0].id == 'sltSeqNo') {
        RowColor(rowIdx);
        Caculate();
    }
});

//保單明細區塊- 篩選區_欄位觸發事件
$('#insure_type,#insur_no,#custom_nm,#aplname,#iptSearchAllInsureList,#iptSearchAllPayList,#iptStcc,#allocstat').on('keyup paste', function () {
    setTimeout(function () {
        $('#tblInsuranceList').DataTable().draw();
    }, 1000);
});

//保單明細區塊- 篩選區_欄位觸發事件
$('#s_trandate,#e_trandate,#s_effectivedate,#e_effectivedate,#pay_status').change(function () {
    setTimeout(function () {
        $('#tblInsuranceList').DataTable().draw();
    }, 1000);
});

//保單明細區塊- 抓取DataTables的ErrMode訊息
$.fn.dataTable.ext.errMode = 'none';
$('#tblInsuranceList').on('error.dt', function (e, settings, techNote, message) {
    MsgBox('Error', message, 'red');
}).DataTable();

//保單明細區塊- 產生保費明細
function CreateInsureTable() {
    //保單明細_建立DataTables
    $('#tblInsuranceList').DataTable({
        destroy: true,
        bDeferRender: true,
        dom: '<"top">rt<"bottom">pli<"clear">',
        language: DataTablsChineseLanguage,
        searching: true,
        autoWidth: false,
        createdRow: function (row, data, dataIndex) {
            if (data.SEQNO != "") {
                $('td', row).addClass('datatable_selectrow_color')
                    .find('input,select').addClass('datatable_selectrow_color');

                $(row).find('select:not(#sltSeqNo),input').prop('disabled', true);
            }
        },
        processing: true,
        data: InsureanceSource,
        fixedHeader: {
            header: true,
            headerOffset: 45
        },
        pagingType: "full_numbers",
        lengthChange: false,
        paging: true,
        orderCellsTop: true,
        columnDefs: [
            {
                width: "2%",
                className: "text-center custom-middle-align",
                targets: [
                    FindTableIndex('tblInsuranceList', '交易日期'),
                    FindTableIndex('tblInsuranceList', '生效日期'),
                    FindTableIndex('tblInsuranceList', '保單號碼'),
                    FindTableIndex('tblInsuranceList', '保單序號'),
                    FindTableIndex('tblInsuranceList', '被保險人'),
                    FindTableIndex('tblInsuranceList', '要保人'),
                    FindTableIndex('tblInsuranceList', '保單別'),
                    FindTableIndex('tblInsuranceList', '大保單號碼'),
                    FindTableIndex('tblInsuranceList', '特殊票期'),
                    FindTableIndex('tblInsuranceList', '客票註記'),
                    FindTableIndex('tblInsuranceList', '收據號碼'),
                    FindTableIndex('tblInsuranceList', '繳費來源'),
                ]
            },
            {
                width: "2%",
                className: "text-right custom-middle-align",
                targets: [
                    FindTableIndex('tblInsuranceList', '應收保費'),
                    FindTableIndex('tblInsuranceList', '擬繳保費'),
                ]
            },
            {
                width: "3%",
                className: "text-center custom-middle-align",
                targets: [
                    FindTableIndex('tblInsuranceList', '收費日期'),
                ]
            },
            {

                orderable: false,
                targets: [
                    FindTableIndex('tblInsuranceList', '繳費來源'),
                    FindTableIndex('tblInsuranceList', '特殊票期'),
                    FindTableIndex('tblInsuranceList', '客票註記'),
                    FindTableIndex('tblInsuranceList', '收據號碼'),]
            }
        ],
        columns: [
            {   //交易日期
                data: function (source, type, val) {
                    var hidNAME = $.datefomater(source.TRANDATE)
                    return hidNAME; ZCARRY
                }
            },
            {   //生效日期 
                data: function (source, type, val) {
                    var hidNAME = $.datefomater(source.EFFECDTA)
                    return hidNAME;
                }
            },
            {   //收費日期
                data: function (source, type, val) {
                    var date = source.TRANDATEX;
                    if (date != "" && date.indexOf('年') < 0) {
                        time = source.TRANTIMEEX != '' ? source.TRANTIMEEX + '時' : '';
                        date = date.substring(0, 4) + '年' +
                            date.substring(4, 6) + '月' +
                            date.substring(6, 8) + '日' + time;
                    }
                    var hidNAME = '<input value="' + date + '"  style="width:140px !important" placeholder="請點選" class="iptTranDateX form-control date form_datetime input-sm">';
                    return hidNAME;
                }
            },
            {
                data: "POLNUM"
            },//保單號碼
            {
                data: "TRANNO"
            },//保單序號
            {
                data: "ZCNAME"
            },//被保險人
            {
                data: "APLNAME"
            },//要保人
            {
                data: "STCC"
            },//主險別
            {
                data: "CNTTYPE"
            },//保單別
            {
                data: "ZBIGNO"
            },//大保單號碼
            {
                data: "ZPREM", render: $.fn.dataTable.render.number(',', '.', 0, '$')
            },//應收保費
            {
                data: "ZPREMS", render: $.fn.dataTable.render.number(',', '.', 0, '$')
            },//擬繳保費            
            {
                //{ data: "ZFLAG" },//特殊票期
                //特殊票期
                data: function (source, type, val) {
                    if (source.ZFLAG == '') {
                        source.ZFLAG = "N";
                    }
                    var selected1 = source.ZFLAG == "Y" ? "selected" : "";
                    var selected2 = source.ZFLAG == "N" ? "selected" : "";

                    var hidNAME = '<td><select id="sltZFlag" class="form-control input-sm"><option value="">請選擇</option><option value="Y" ' + selected1 + '>是</option><option value="N"  ' + selected2 + '>否</option></select></td>';
                    return hidNAME;
                },
            },
            {
                //客票註記
                data: function (source, type, val) {
                    var selected1 = source.CTYPE == "Y" ? "selected" : "''";
                    var selected2 = source.CTYPE == "N" ? "selected" : "''";
                    var hidNAME = '<td><select id="sltCType" class="form-control input-sm"><option value="">請選擇</option><option value="Y" ' + selected1 + '>是</option><option value="N"  ' + selected2 + '>否</option></select></td>';
                    return hidNAME;
                }
            },
            //{   //優惠金額
            //    data: "ZPREMC", render: $.fn.dataTable.render.number(',', '.', 0, '$')
            //},
            {
                //收據號碼 : RSeqNum
                //收據檢核 : RseqNeed
                data: function (source, type, val) {
                    var hidNAME
                    if ((source.RSEQNEED == 'Y' && source.RSEQNUM == "") || (source.RSEQNUM_NEW == 'Y')) {
                        source.RSEQNUM_NEW = 'Y';
                        hidNAME = '<input id="sltRSeqNum" style="width:30px !important" class="form-control  input-sm">'
                    }
                    else if (source.RSEQNUM_NEW != 'Y') {
                        if (parseInt(source.RSEQNUM) == 1)
                            hidNAME = "郵寄票據";
                        else if (parseInt(source.RSEQNUM) == 2)
                            hidNAME = "臨櫃繳款";
                        else
                            hidNAME = source.RSEQNUM
                    }
                    return hidNAME;
                }
            },
            {
                //支票延繳日期期:EffDateX
                //支票票期:ZNOTEDUE01
                //特殊支票票期:ZNOTEDUE02
                //立約日期:FccDate
                //繳費來源:SeqNo
                data: function (source, type, val) {
                    var Html = '<td>' + sltSeqNoHtml.replace('selected', 0).replace('_BringIn', '').replace('"' + source.SEQNO + '"', '"' + source.SEQNO + '" selected') + '</td>';
                    return Html;
                }
            }
        ],
    })
}

//保單明細區塊- 讀取AS400資料
function ReadAS400() {
    var Msg = '';

    var DateOption = $('#selDateInterval').val();
    var GetLastDay

    if (DateOption == '3') {
        DateOption = GetDay('-3m');
        GetLastDay = GetDay('3m');
    }
    else if (DateOption == '6') {
        DateOption = GetDay('-6m');
        GetLastDay = GetDay('6m');
    }
    else if (DateOption == '12') {
        DateOption = GetDay('-12m');
        GetLastDay = GetDay('12m');
    }
    else if (DateOption == 'All') {
        DateOption = '19110101';
        GetLastDay = GetDay('120m');
    }

    DateOption = DateOption.replace(/\//g, '');
    GetLastDay = GetLastDay.replace(/\//g, '');

    $.ajax({
        type: "POST",
        url: "/Payment/Search",
        datatype: "json",
        timeout: 60000 * 10,
        cache: false,
        data: {
            UserAccount: $('#iptAcc').val().trim(),
            PolicyAccount: $('#iptAgent').val().trim(),
            PayDate: $('#iptPayDte').val().replace(/\//g, ''),
            Date: DateOption + "-" + GetLastDay,
            AccDept: $('#selAccDept').val(),
            PrintSeq: $('#selPrint01').val()
        },
        success: function (data) {
            var Result = data;
            //如果發生Exception
            if (Result.ProcessSuccess == undefined) {
                Msg = data;
            }

            if (!Result.ProcessSuccess) {
                Msg = Result.ProcessMessage;

                if (Msg == "資料使用中" || Msg == "鎖定失敗") {
                    Msg = '資料使用中, 請待別人作業完成，或自行按取消解鎖';
                }
            }
            else if (Result.ProcessSuccess) {
                InsureanceSource = Result.ProcessData.DataDetail;
                PaymentSource = Result.ProcessData.DataHeader;

                if (InsureanceSource.length == 0 && PaymentSource.length == 0) {
                    Msg = '無任何可繳費的保單';
                    UnLockAS400(false);
                }
            }
        },
        error: function AjaxError(xhr, errorType, exception) {
            Msg = '網路連線發生錯誤，請確認網路是否正常<br><br>' + xhr.responseText + 'AjaxError'
        },
        complete: function () {
            var InsureanceSourceError = Msg;
            if (InsureanceSourceError != '') {
                MsgBox('資料讀取訊息', InsureanceSourceError, 'red');
                setTimeout(function () { $.unblockUI() }, 500);
            } else {
                InitTableByAS400Data();
            }
        }
    });

    return Msg;
}
function InitTableByAS400Data() {
    var isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
    var eventName = isOnIOS ? "pagehide" : "beforeunload";
    window.addEventListener(eventName, UnLockAS400);

    //篩選資料表-清除所有欄位原先值
    $('#divSearch').find('input,select').val('');
    //繳費明細表-清除所有欄位原先值
    $('#divInsuranceList').find('input,select').val('');
    //可繳劃撥/匯款金額
    $('#iptMtAll').val('$0');
    //匯費 郵資
    $('#iptRemittance').val('$0');
    //暫收款
    $('#iptTemporaryCredit').val('$0');
    //應付款
    $('#iptPayables').val('$0');

    $.each(InsureanceSource, function (i, v) {
        v.SEQNO = v.SEQNO == 0 ? '' : '' + padLeft(parseInt(v.SEQNO), 2) + '';
    });

    $.each(PaymentSource, function (i, v) {
        v.SEQNO = padLeft(parseInt(v.SEQNO), 2);
    });

    //讀取繳費來源下拉的Html
    sltSeqNoHtml = SeqNoHtml();

    //建立InsureTable
    CreateInsureTable();
    //排序保險明細下方的物件
    $("#tblInsuranceList_info").addClass("col-lg-6 col-lg-pull-6");
    $("#tblInsuranceList_paginate").addClass("col-lg-6 col-lg-push-6");

    //保單明細_複製繳費來源給帶入的繳費來源
    $('#sltSeqNo_BringIn').find('option').remove().end()
    $('#sltSeqNo').find('option').clone().appendTo('#sltSeqNo_BringIn');
    $('#sltSeqNo_BringIn').val('');

    //繳費明細_建立Table
    CreatPayTable();
    //排序繳費來源下方的物件
    $("#tblPaymentCheckList_info").addClass("col-lg-6 col-lg-pull-6");
    $("#tblPaymentCheckList_paginate").addClass("col-lg-6 col-lg-push-6");

    //載入後自動開啟繳費來源，順便計算金額與藍化有選取繳費來源的列
    $("#divSearch,.hrHotains,#divInsuranceList").fadeIn(300);

    //隱藏-擬繳查詢區塊
    $('#divPaymentData').fadeOut();

    //隱藏-取消按鈕
    $('#iptAcc').prop("disabled", true);
    $('#selAccDept').prop("disabled", true);
    $('#iptAgent').prop("disabled", true);
    $('#iptPayDte').prop("disabled", true);
    $('#selDateInterval').prop("disabled", true);
    $('#selPrint01').prop("disabled", true);

    //隱藏_查詢按鈕
    $('#btnSearchAs400').closest('div').fadeOut(500);

    //隱藏_列印區塊
    $('#divPrint').fadeOut(500);

    //顯示_送出與取消按鈕
    $('#btnSubmit').closest('div').fadeIn(500);
    $('#btnCancleSearchAs400').closest('div').fadeIn(500);

    //重新調整畫面，避免RWD失效
    $('#tblInsuranceList').css('display', 'table');
    $('#tblInsuranceList').DataTable().responsive.recalc();
    $('#iOpenDivPayment').tooltip('toggle');
    //載入後計算所有餘額
    Caculate();
    RegFormDatetimeNoSetTimeOut();
    $.unblockUI()
}

//保單明細區塊- 結束時處理所有物件
function Finish() {
    var isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
    var eventName = isOnIOS ? "pagehide" : "beforeunload";
    window.removeEventListener(eventName, UnLockAS400);

    $('#btnSearchAs400').closest('div').fadeIn();
    $(".hrHotains").fadeOut(500);
    $('#divPrint').fadeIn(300);
    $('#iptAcc').prop("disabled", false);
    $('#selAccDept').prop("disabled", false);
    $('#iptAgent').prop("disabled", false);
    $('#iptPayDte').prop("disabled", false);
    $('#selDateInterval').prop("disabled", false);
    $('#selPrint01').prop("disabled", false);

    //隱藏_查詢區塊
    $('#divSearch').fadeOut();
    $('#divInsuranceList').fadeOut();
    //顯示-擬繳查詢區塊
    $('#divPaymentData').fadeIn();
    //隱藏_送出與取消按鈕
    $('#btnSubmit').closest('div').fadeOut(1000);
    $('#tblInsuranceList').DataTable().clear();
    $("#tblInsuranceList").DataTable().destroy();
    $.unblockUI();
}

//保單明細區塊- 找資料表欄位索引
function FindTableIndex(tblName, colName) {
    return $('#' + tblName + ' th:contains("' + colName + '")').index();
}

//保單明細區塊- 註冊_確認送出-動態產生按鈕，所以要重覆註冊事件
$("#btnSubmit,#btnCancleSearchAs400").click(function () {
    var Error = false;

    if ($(this).attr("id") == "btnCancleSearchAs400") {
        BlockUI('取消作業中，請稍後');
        setTimeout(function () {
            //暫時關閉
            UnLockAS400(true);

            if (!Error) {
                Finish();
            }
        })
    }
    else {
        BlockUI('送出資料至AS400，請稍後');
        setTimeout(function () {
            //var ErroMsg = '';
            //$.each($('#tblPaymentCheckList').DataTable().rows().data().filter(function (x) { return x.SEQNO != '99' && x.SEQNO != '98' && x.ZREASON != '' }), function (i, v) {
            //    var Cnt1 = $('#tblInsuranceList').DataTable().rows().data().filter(function (y) { return v.SEQNO == y.SEQNO})
            //    var Cnt2 = Cnt1.filter(function (y) { return y.CTYPE == 'Y' })
            //    if (Cnt1.length > 0 && Cnt2.length == 0) ErroMsg += '支票(' + v.SEQNO + ') $' + v.ORIGAMT + '<br>'
            //})
            //if (ErroMsg != '') { MsgBox('儲存失敗', ErroMsg + '支票有填寫客票原因<br>但無任何一張保單客票註記為是<br>請確認後再送出', 'red', ''); return; }

            var Payment = $('#tblPaymentCheckList').DataTable().rows().data().toArray();
            var Insrance = new Array();
            var CashJson;
            var Cash = RemoveComma($('#ipMoneyPay').val());
            if (Cash != "0") {
                var CashJson = {
                    ORIGAMT: Cash, PAYBANK: "", SEQNO: 98, SURNAME: "", ZCHEQNUM: 0, ZNOTEDUE: 99999999, ZNOTEEX: "", ZREASON: ""
                }
                Payment.push(CashJson);
            }

            var Allocation = RemoveComma($('#iptMtAll').val());
            if (Allocation != "0") {
                var AllocationJson = {
                    ORIGAMT: Allocation, PAYBANK: "", SEQNO: 99, SURNAME: "", ZCHEQNUM: 0, ZNOTEDUE: 99999999, ZNOTEEX: "", ZREASON: ""
                }
                Payment.push(AllocationJson);
            }

            var Remittance = RemoveComma($('#iptRemittance').val());
            if (Remittance != "0") {
                var RemittanceJson = {
                    ORIGAMT: Remittance, PAYBANK: "", SEQNO: 91, SURNAME: "", ZCHEQNUM: 0, ZNOTEDUE: 99999999, ZNOTEEX: "", ZREASON: ""
                }
                Payment.push(RemittanceJson);
            }

            var TemporaryCredit = RemoveComma($('#iptTemporaryCredit').val());
            if (TemporaryCredit != "0") {
                var TemporaryCreditJson = {
                    ORIGAMT: TemporaryCredit, PAYBANK: "", SEQNO: 92, SURNAME: "", ZCHEQNUM: 0, ZNOTEDUE: 99999999, ZNOTEEX: "", ZREASON: ""
                }
                Payment.push(TemporaryCreditJson);
            }

            var Payables = RemoveComma($('#iptPayables').val());
            if (Payables != "0") {
                var PayablesJson = {
                    ORIGAMT: Payables, PAYBANK: "", SEQNO: 93, SURNAME: "", ZCHEQNUM: 0, ZNOTEDUE: 99999999, ZNOTEEX: "", ZREASON: ""
                }
                Payment.push(PayablesJson);
            }

            $.each(Payment, function (i, v) {
                v.NUMCON = $('#selPrint01').val();
                v.AGNTNUM = $('#iptAcc').val().trim();
                v.ACCNUM = $('#iptAgent').val().trim();
                v.RSEQNUM = $('#sltRSeqNum').val();
                v.PAYDTE = $('#iptPayDte').val().replace(/\//g, '');
            });

            $.each($('#tblInsuranceList').DataTable().rows().data().toArray(), function (i, v) {
                if (v.SEQNO != '') {
                    v.SEQNO = parseInt(v.SEQNO);
                    if (v.TRANDATEX.indexOf('年') > 0) {
                        v.TRANDATEX = v.TRANDATEX.replace('年', '');
                        v.TRANDATEX = v.TRANDATEX.replace('月', '');
                        v.TRANTIMEEX = v.TRANDATEX.split('日')[1].replace('時', '');
                        v.TRANDATEX = v.TRANDATEX.split('日')[0];
                    }
                    Insrance.push(v);
                }
            })
            var Msg = '';
            $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
                if (this.data().SEQNO != '') {
                    var pay = "";
                    switch (this.data().SEQNO) {
                        case 98: pay = "現金"
                            break;
                        case 99: pay = "匯款"
                            break;
                        default: pay = "支票"
                            break;
                    }
                    Msg += "保單編號:" + this.data().POLNUM + " 繳費方式為:" + pay + "<br>"
                }
            });

            //送出資料
            $.ajax({
                type: "POST",
                url: "/Payment/Submit",
                datatype: "json",
                async: false,
                cache: false,
                data: {
                    UserAccount: $('#iptAcc').val().trim(),
                    PolicyAccount: $('#iptAgent').val().trim(),
                    PayDate: $('#iptPayDte').val().replace(/\//g, ''),
                    Insrance: JSON.stringify(Insrance),
                    Payment: JSON.stringify(Payment),
                    PrintSeq: +$('#selPrint01').val().trim(),
                    AccDept: $('#selAccDept').val()
                },
                success: function (data) {
                    //if (typeof (data) == 'string')
                    //    MsgBox('擬繳失敗', data, 'green', '');
                    //else {
                    var Result = JSON.parse(data);
                    if (Result.ProcessSuccess == true) {
                        MsgBox('擬繳成功', Msg, 'green', '');
                        var AccNum = $('#iptAcc').val();
                        var PayDte = $('#iptPayDte').val();
                        $('#iptAccPrint').val(AccNum);
                        $('#iptPayDtePrint').val(PayDte);
                        selPrintSeqSrc(document.getElementById('selPrint02'), AccNum, PayDte, false);
                    }
                    else {
                        MsgBox('擬繳失敗', '回傳AS400失敗，並未解鎖AS400完成<br>' + Result.ProcessMessage, 'red', '');
                        Error = true;
                    }
                    //}
                },
                error: AjaxError
            });


            if (!Error) {
                Finish()
            }
        }, 100)
    }

})

//保單明細區塊- 解鎖AS400
function UnLockAS400(bShowMsg) {
    //暫時關閉
    if ($('#iptAgent').val() == '' || $('#iptPayDte').val() == '') {
        MsgBox('檢核訊息', '請填寫出單經手人、擬繳日期欄位', 'red');
        return;
    }

    $.ajax({
        type: "POST",
        url: "/Payment/Cancel",
        datatype: "json",
        async: false,
        cache: false,
        timeout: 1000 * 10,
        data: {
            UserAccount: $('#iptAcc').val().trim(),
            PolicyAccount: $('#iptAgent').val().trim(),
            PayDate: $('#iptPayDte').val().replace(/\//g, ''),
            AccDept: $('#selAccDept').val()
        },
        success: function (data) {
            var Result = data;
            if (Result.ProcessSuccess == true && bShowMsg) {
                MsgBox('取消成功', '成功取消擬繳作業，並解鎖AS400完成', 'green', '');
                return false;
            }
            else if (bShowMsg) {
                switch (Result.ProcessMessage) {
                    case "無資料可解鎖": Result.ProcessMessage = "無資料可解鎖，或已於其它頁面解鎖";
                }
                MsgBox('取消失敗', Result.ProcessMessage, 'red', '');
                return true;
            }
        },
        error: AjaxError
    });
}

//保單明細區塊- 過濾YYYY年MM月DD日HH時變成YYYYMMDD
function GetDateNumber(Date) {
    Date = Date.replace('年', '');
    Date = Date.replace('月', '');
    Date = Date.replace('日', '');
    Date = Date.substring(0, 8);
    return Date;
}

//#endregion ==============================================保單明細區塊==============================================

//#region ==============================================批次上傳區塊==============================================

//批次帶入- 按鈕觸發事件
$('#btnBatch_Bring').click(function () {

    if (!DetectIE()) {
        MsgBox("批次帶入", "此功能限用IE瀏覽器操作", "red");
        return;
    }

    $('#btnBatch').click();
})


$('#btnBatch').change(function () {

    //return;
    var BringIn = {
        SeqNo: $('#sltSeqNo_BringIn').val(),
        ZFlag: $('#sltZFlag_BringIn').val(),
        TranDateX: $('#iptTranDateX_BringIn').val(),
        CTYPE: $('#sltCType_BringIn').val()
    };

    var obj = this;
    var fe = obj.value.substring(obj.value.length - 4, obj.value.length);
    if (fe != 'xlsx' && fe != undefined) {
        MsgBox("批次帶入", "檔案格式不正確，副檔名非Excel(.xlsx)，請確認", "red");
    }
    else if (BringIn.SeqNo == 0 && BringIn.ZFlag == '' && BringIn.TranDateX == '' && BringIn.CTYPE == '' && fe != undefined) {
        MsgBox('檢核訊息', '請至少填寫任一欄位', 'red');
        $.unblockUI();
    }
    else if (fe != undefined) {
        BlockUI("逐筆檢核中，請稍後");
        var Path = obj.value;
        setTimeout(function () {
            ReadExcel(Path, BringIn);
            $.unblockUI();
        }, 100)
    }

    //if (fe != undefined) {
    //    obj.value = "";
    //}
})

var wb;//讀取完成的數據
var rABS = false; //是否將文檔讀取為二進制字符串

var ExcelDat;
function ReadExcel(filePath, BringIn) {
    ExcelData = [];
    ExcelDataBackUp = [];
    tempStr = "";
    //得到文件路径的值
    //创建操作EXCEL应用程序的实例
    var oXL = new ActiveXObject("Excel.application");

    //打开指定路径的excel文件
    var oWB = oXL.Workbooks.open(filePath);

    //操作第一个sheet(从一开始，而非零)
    oWB.worksheets(1).select();
    var oSheet = oWB.ActiveSheet;

    //使用的行数
    Chk = /^.[A-Za-z0-9]+$/;
    var rows = oSheet.usedrange.rows.count;
    for (var i = 0; i < rows; i++) {
        var pno = oSheet.Cells(i + 1, 1).Text;
        pno = pno.toUpperCase()
        if (pno.length == 7) {
            pno = "0" + pno;
        }
        var sn = oSheet.Cells(i + 1, 2).Text;
        if (sn == '') {
            sn = '0';
        }
        var rSeqNum = oSheet.Cells(i + 1, 3).Text;
        if (Chk.test(pno) && !isNaN(sn)) {
            if (rSeqNum.length == 1) {
                rSeqNum = '0' + rSeqNum;
            }
            ExcelData.push({ PNO: pno, SN: sn, RSeqNum: rSeqNum });
            tempStr = '';
        }
    }
    var Msg = "";
    var ErroMsg = '';
    var Count = 0;
    var FailPolnum = "";
    ExcelDataBackUp = ExcelData.slice();

    $('#tblInsuranceList').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
        rowNode = this.node();
        var POLNUM = this.data().POLNUM;
        var TRANNO = this.data().TRANNO;
        var Key = { PNO: POLNUM, SN: TRANNO };
        //只帶入未繳費項目
        var idx = InArray(ExcelData, Key);
        if (idx > -1) {
            BringIn["RSeqNum"] = ExcelData[idx].RSeqNum;

            ErroMsg = Validate(this, BringIn, rowIdx, ErroMsg);

            Msg = InsureValidate(rowIdx);
            if (Msg != '') {
                $(rowNode).find('#sltSeqNo').val("");
                this.data().SEQNO = "";
                ErroMsg += Msg;
            }

            ExcelData.splice(idx, 1);

            RowColor(rowIdx);

            Count++;
        }
    });
    Caculate();
    $.unblockUI()

    $.each(ExcelData, function (index, value) {
        if ($.inArray(ExcelData[index], ExcelDataBackUp) > -1) {
            FailPolnum += "列" + ($.inArray(ExcelData[index], ExcelDataBackUp) + 1) + ": " + value.PNO + "-" + value.SN + " </br>";
        }
    });

    FailPolnum = FailPolnum != "" ? "Excel未成功帶入保單編號如下: </br>" + FailPolnum + '<br> <hr class="hrHotains">' : ""
    ErroMsg = ErroMsg != "" ? "成功帶入但檢核失敗明細</br>" + ErroMsg + "</br>" : ""

    var ResultMsg = "Excel筆數共:" + ExcelDataBackUp.length + "筆</br>" + FailPolnum +
        "成功帶入筆數:" + Count + "筆</br>" + ErroMsg

    MsgBox('檢核訊息', ResultMsg, 'red');

    setTimeout($.unblockUI(), 1000);

    //退出操作excel的实例对象
    oXL.Application.Quit();
    //手动调用垃圾收集器
    if (DetectIE()) {
        CollectGarbage();
    }
}
function InArray(array, keyObj) {
    var ii = -1;
    var arrayIndex = array.filter(function (item, index, array) {
        if (keyObj.PNO == item.PNO && keyObj.SN == item.SN) {
            ii = index;
        }
        return keyObj.PNO == item.PNO && keyObj.SN == item.SN;
    });
    return ii;
}
//#endregion ==============================================批次上傳區塊==============================================

/* 動態綁定DatetimePicker focus&blur事件 */
function InitDatetimePickerEvents() {
    //避免手機彈出KeyBoard
    $('#tblInsuranceList').on('focus', '.form_datetime', function () {
        if (DetectMoible()) {
            $(this).blur();
        } else {
            ShowMsgInElm(this, "請點選日曆或輸入年月日時共十碼", false);
            //$(this).select();
            //$(this).data("datetimepicker").update($(this).val()); //將值設定回日曆
        }
    });
    $('#tblInsuranceList').on('blur', '.form_datetime', function () {
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
}

/* 註冊_日曆功能 */
function RegFormDatetimeNoSetTimeOut(obj) {
    if (obj == undefined) {
        obj = ".form_datetime";
    }
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
    });
    $('.glyphicon-arrow-left').addClass("fa").addClass("fa-angle-double-left").attr("aria-hidden", true).removeClass('.glyphicon-arrow-left');
    $('.glyphicon-arrow-right').addClass("fa").addClass("fa-angle-double-right").attr("aria-hidden", true).removeClass('.glyphicon-arrow-right');

    //手动调用垃圾收集器
    if (DetectIE()) {
        CollectGarbage();
    }
}

$('#btnBatch_Bring_Sample').click(function () {
    $("#formMain").attr("action", "/Payment/BatchExcelSample");
    $("#formMain").submit();
    MsgBox('下載完成', "下載批次帶入範例.xlsx完成", 'green');
})

//下載最新農漁會上線金融機構代號對照表
$('#aDownloadSwiftCode').click(function () {
    var Date = $('span[name="SwiftCodeDate"]')[0].innerHTML;
    $('[name="FileName"]').val(Date);
    $("#formMain").attr("action", "/Payment/DownloadSwiftCode");
    $("#formMain").submit();
    MsgBox('下載完成', "下載農漁會上線金融機構代號對照表" + Date + "版.docx完成", 'green');
})

//function TestDate(startDate, msg) {
//    msg = msg == null ? '' : msg;
//    var ONE_MIN = 1000 * 60; // 1分鐘的毫秒數
//    var ONE_SEC = 1000;   // 1秒的毫秒數
//    var Date_A = startDate;
//    var Date_B = new Date();
//    var diff = Date_B - Date_A;
//    var leftMins = Math.floor(diff / ONE_MIN);
//    if (leftMins > 0) diff = diff - (leftMins * ONE_MIN);
//    var leftSecs = Math.floor(diff / ONE_SEC);
//    console.log(msg + "耗時為 %d分%d秒", leftMins, leftSecs);
//}




