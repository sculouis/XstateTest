var defaultCheckbox = new Array();           //預設勾選欄位

window.onload = function () {            //初始化_簽名版元件
    BlockUI('資料載入中，請稍後...');
    setTimeout(function () {
        /*--元件初始化---------------------------------------------*/
        //creatDT();              //註冊報價單GRID元件

        RegSelectDate();        //註冊下拉日曆
        //InitEventBinding();     //初始化_元件事件
        /*--預設值設定---------------------------------------------*/
        //$('#iptQuotDate_S').val(GetDay('-1m')).blur();     //報價日期從，預帶前一個月
        //$('#iptQuotDate_E').val(GetDay('')).blur();        //報價日期至，預帶今日
        $('#iptQuotDate_S').blur();
        $('#iptQuotDate_E').blur();
        $('#iptEddeDate_S').blur();
        $('#iptEddeDate_E').blur();
        /*--預設值設定---------------------------------------------*/
        $('#iptCreateDate_S').val(GetDay('-1m')).blur();     //上傳日期從，預帶前一個月
        $('#iptCreateDate_E').val(GetDay('')).blur();        //上傳日期至，預帶今日
        /*--元件啟用設定-------------------------------------------*/
        $('#divGrid').hide();//查詢區(關閉)
        $('#iGrid').find('i').removeClass().addClass('fa fa-angle-double-up');
        //執行查詢
        QryPrintQuote();
        //[畫面調整]
        $(window).bind('resize', function () {
            setTimeout(function () {
                $('#tblDataTable').DataTable().columns.adjust().responsive.recalc();
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

    //查詢列印報價單
    function QryPrintQuote()
    {
        var sAgentNo = $('#iptAgentNo').val();
        if (sAgentNo == "") { sAgentNo = $('#hidagntnum').val(); }
        else {
            //判斷輸入的經手人是否為，該用戶ID所可使用的經手人
            if ($('#hidagntnum').val().indexOf(sAgentNo) == -1) {
                ShowMsgInElm('#iptAgentNo', '[經手人]錯誤！'); $('#iptAgentNo').focus(); return;
            }
        }
        $('#divQuery').hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up');
        $('#divGrid').show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down');
        BlockUI('資料查詢中，請稍後...');
        setTimeout(function () {
            var param = {
                //sQuotNo: $('#iptQuotNo').val()                  //報價單編號
                //, sQuotNo_400: $('#iptQuotNo_400').val()        //AS400報價單編號
                //, 
                    sQuotDate_S: $('#iptQuotDate_S').val()        //報價日期(起)
                , sQuotDate_E: $('#iptQuotDate_E').val()        //報價日期(迄)
                , sAgentNo: sAgentNo                            //經手人
                , sCustID: $('#iptCustID').val()                //客戶ID
                , sCustName: $('#iptCustName').val()            //客戶姓名
                , sLicenseNo: $('#iptLicenseNo').val()          //牌照號碼
                , sEddeDate_S: $('#iptEddeDate_S').val()        //生效日期(起)
                , sEddeDate_E: $('#iptEddeDate_E').val()        //生效日期(迄)
                //, sIsConfirm: $('#rdoIsConfirm:checked').val()  //暫存類別(是否確定出單)
                //, sPayNo: $('#iptPayNo').val()                  //銷帳代號
                , sAmwayNo: $('#iptAmwayNo').val()              //大保單號碼
            }
            creatDT(getdata("/Quotation/GetQuotationQueryData", param));
          
            $(window).resize();
            $.unblockUI();
        }, 60);


    }


    /******DataTable處理事件_Start************************/
    //建立DataTables
    function creatDT(dtSource) {
        if (dtSource != null && dtSource != undefined)
        {
            dtSource = dtSource.filter(function (elm) { return elm['ExeList'].includes('|3') });
        }
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
            order: [1, 'desc'],    //預設排序為位置1
            columnDefs: [
                { className: "text-center", targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
            ],
            columns: [
                { //選取  
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" class="label_cbx" value="' + data.QuotNo + '" onclick="PrecheckPrint(this)"/>';

                        return sHtml;
                    }
                },
                { //報價單號碼
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = data.QuotNo;
    
                        return sHtml;
                    }
                },
                { //400單號
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = data.QuotNo_400;

                        return sHtml;
                    }
                },
                { //車主姓名
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = data.Name;

                        return sHtml;
                    }
                },
                { //牌照號碼
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = data.LicenseNo;

                        return sHtml;
                    }
                },
                { //任意險要保書/報價單
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" value="0" disabled>';

                        return sHtml;
                    }
                },
                { //強制險要保書
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" value="5" disabled>';

                        return sHtml;
                    }
                },
                { //KYC
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" value="4" disabled>';

                        return sHtml;
                    }
                },
                { //繳款單
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" value="2" disabled>';

                        return sHtml;
                    }
                },
                { //預收保費證明
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" value="1" disabled>';

                        return sHtml;
                    }
                },
                { //請款憑證
                    "orderable": false, // 禁用排序
                    "defaultContent": "",
                    render: function (meta, type, data, row) {
                        var sHtml = '<input type="checkbox" name="cbQuote" value="3" disabled>';

                        return sHtml;
                    }
                }
                
            ]
        })
    }

    /******DataTable處理事件_End************************/

    //確定按鈕
    $('#btnConfirm').click(function () {

        QryPrintQuote();
    });

    //清除按鈕
    $('#btnClear').click(function () {
        $('#divQuery').find('input[type=text]').each(function () { $(this).val('') });    //清除特定div底下所有輸入項目的值
        $('#iptQuotDate_S').val(GetDay('-1m')).blur();     //報價日期從，預帶前一個月
        $('#iptQuotDate_E').val(GetDay('')).blur();        //報價日期至，預帶今日
        $('#iptEddeDate_S').val('').blur();
        $('#iptEddeDate_E').val('').blur();
        $('#iptPayNo').blur();
        $('#iptCreateDate_S').val(GetDay('-1m')).blur();     //上傳日期從，預帶前一個月
        $('#iptCreateDate_E').val(GetDay('')).blur();        //上傳日期至，預帶今日
    });

    //返回查詢鈕
    $('#btnBack, #btnBack2').click(function () {
        window.location.href = "/Quotation/QuotationQuery";
    });

    //開始列印
    $('#btnPrint, #btnPrint2').click(function () {
        var Msg = '處理中，請稍後';
        BlockUI(Msg);
        setTimeout(function () {
            var tmpData;
            var processData = [];
            var errorItems = [];
            //蒐集列印列印項目
            $('#tblDataTable').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {
                rowNode = this.node();
                tmpData = this.data();
                var item = $(rowNode).find('input[name="cbQuote"]');
                var printItems = [];
                item.not(":eq(0)").each(function () {
                    var currentItem = $(this);
                    if (currentItem.is(':checked'))
                        printItems.push(currentItem.val());
                });
                if (item.eq(0).is(":checked")) {
                    if (printItems.length > 0) {
                        processData.push({
                            printItemModel: printItemModelInit(tmpData)
                            , QuoteNo: tmpData.QuotNo
                            , PrintItems: printItems
                        });
                    }
                    else {
                        errorItems.push(tmpData.QuotNo)
                    }

                }

            });

            if (processData.length == 0) {
                MsgBox('錯誤', "未選取列印項目", 'red');
                return false;
            }

            //檢查是否有未勾選
            if (errorItems.length > 0) {
                MsgBox('錯誤', "下列報價單未勾選列印項目:<br/>" + errorItems.join('<br/>'), 'red');
                return false;
            }

            var printForm = $('#printForm');
            printForm.find('input').remove();
            $.each(processData, function (i, element) {
                var input = $("<input>").attr({ "type": "hidden", "name": "batchQuote[" + i + "].QuoteNo" }).val(element.QuoteNo);
                printForm.append(input);
                for (key in element["printItemModel"])
                {
                    input = $("<input>").attr({ "type": "hidden", "name": "batchQuote[" + i + "].printItemModel." + key }).val(element["printItemModel"][key]);
                    printForm.append(input);
                }

                for (var idx = 0; idx < element['PrintItems'].length; idx++)
                {
                    input = $("<input>").attr({ "type": "hidden", "name": "batchQuote[" + i + "].PrintItems[" + idx + "]" }).val(element['PrintItems'][idx]);
                    printForm.append(input);
                }

            });


            printForm.prop('action', "/PrintQuote/PrintBatchQuote");
            printForm.submit();
         
            $.unblockUI()
        }, 200)

    });

    //預設列印選項事件綁定
    $('input[name="cbDefault"]').click(function () {
        defaultCheckbox = new Array();
        if (this.id == "cb4" && $('#cb4').is(':checked')) {
            $('#cb5').prop('checked', false);
        }
        else if (this.id == "cb5" && $('#cb5').is(':checked')) {
            $('#cb4').prop('checked', false);
        }
        $('input[name="cbDefault"]').each(function (i) {
            if ($(this).is(':checked'))
                defaultCheckbox.push(this.value);
        });


    });

    //設定繳款單與預收保費證明為互斥
    $('#tblDataTable').on('click', 'input[type="checkbox"]', function () {
        if (this.value == "2" && $(this).is(':checked')) {
            $(this).parent().parent().find('input[name="cbQuote"][value="1"]').prop('checked', false);
        }
        else if (this.value == "1" && $(this).is(':checked')) {
            $(this).parent().parent().find('input[name="cbQuote"][value="2"]').prop('checked', false);
        }
    });
}


//初始化列印資訊
function printItemModelInit(rowData) {
    //let quotno = $('#hidQUOTENO').val();
    let userid = $('#hiduserid').val();
    //let QuotNo_400 = $('#hidQuotNo_400').val();
    //let AgentNo = $("#divQuery").data("AgentNo");
    //let InsSDATE = $("#divQuery").data("InsSDATE");
    let printItemModel = {};
    printItemModel["QuotNo"] = rowData.QuotNo;
    printItemModel["CESSIONO"] = rowData.QuotNo_400;
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
    printItemModel["AgentNo"] = rowData.AgentNo;
    printItemModel["InsSDATE"] = rowData.EddeDate;
    return printItemModel;
}

//檢核_[列印]
function PrecheckPrint(chkItem) {
    let tblDataTable = $('#tblDataTable').DataTable().data().toArray();
    let currentDt = tblDataTable.filter(function (item, index, array) {
        return (item.QuotNo == chkItem.value);
    });
    let checkresult = "";
    let printItems = $(chkItem).parent().parent().find('input[name="cbQuote"]');

    if ($(chkItem).is(':checked') && currentDt != null && currentDt.length > 0) {

        $.ajax({
            url: "/Quotation/PrecheckPrint",
            type: "POST",
            dataType: "text",
            async: false,
            data: {
                QuotNo_400: currentDt[0]['QuotNo_400']
                , PayNo: "" //列表中取得
                , AgentNo: currentDt[0]['AgentNo']
                , InsSDATE: currentDt[0]['EddeDate'].replace(/\//g, "")
                , PrintType: ""
                , ActionType: "PNT"
            },
            success: function (data) {
                checkresult = data;

            },
            error: AjaxError
        });
        if (checkresult != "") {
            printItems.each(function (index) {
                $(this).prop('checked', false);
                if (index != 0) {
                    $(this).prop('disabled', true);
                }
            });
            MsgBox('列印發生錯誤!', checkresult.replace("|", "<br/>"), 'red');
        }
        else {
            printItems.each(function (index) {
                if (index != 0) {
                    $(this).prop('checked', false);
                    $(this).prop('disabled', false);
                    if (defaultCheckbox.indexOf(this.value) >= 0) {
                        $(this).prop('checked', true);
                    }
                }
            });
            if (currentDt[0].ForceInsuredFrom != "" && currentDt[0].AnyInsuredFrom == "") {               //單強時不可列印要保書
                printItems.each(function () {
                    if ($(this).val() == "0") {
                        $(this).prop('checked', false);
                        $(this).prop('disabled', true);
                    }
                });
            } else if (currentDt[0].ForceInsuredFrom == "" && currentDt[0].AnyInsuredFrom != "") {        //單任時不可列印強制險要保書
                printItems.each(function () {
                    if ($(this).val() == "5") {
                        $(this).prop('checked', false);
                        $(this).prop('disabled', true);
                    }
                });
            } else if (currentDt[0].ForceInsuredFrom == "" && currentDt[0].AnyInsuredFrom == "") {        //強加任時提供
                printItems.each(function () {
                    if ($(this).val() == "0" || $(this).val() == "5") {
                        $(this).prop('checked', false);
                        $(this).prop('disabled', true);
                    }
                });
            }
            //完美專案判別單任時不可列印繳費單、預收保費證明、請款憑證
            if (currentDt[0].ProgramCode != '' && currentDt[0].ForceInsuredFrom == "" && currentDt[0].AnyInsuredFrom != "") {
                printItems.each(function () {
                    //value=2 繳款單 value=1 預收保費證明 value=3 請款憑證
                    if ($(this).val() == "2" || $(this).val() == "1" || $(this).val() == "3") {
                        $(this).prop('checked', false);
                        $(this).prop('disabled', true);
                    }
                });
            }

            if (currentDt[0].PBARExists != "Y") {
                printItems.each(function () {
                    //value=2 繳款單 value=1 預收保費證明 value=3 請款憑證
                    if ($(this).val() == "2" || $(this).val() == "1") {
                        $(this).prop('checked', false);
                        $(this).prop('disabled', true);
                    }
                });
            }

        }

    }
    else {
        printItems.each(function (index) {
            $(this).prop('checked', false);
            if (index != 0) {
                $(this).prop('disabled', true);
            }
        });
    }


    return checkresult == "";
}
