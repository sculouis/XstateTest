/******全域變數區_Start****************************/
var _g = {
    tbselectList: []
}
// Array holding selected row IDs
var rows_selected = [];
/******全域變數區_End******************************/

/******系統觸發事件_Start**************************/
//[初始化]
window.onload = function () {            //初始化_簽名版元件
    BlockUI('資料載入中，請稍後...');
    setTimeout(function () {
        /*--元件初始化---------------------------------------------*/
        creatDTM();             //註冊團體件GRID元件
        creatDTD();             //註冊報價單GRID元件
        RegSelectDate();        //註冊下拉日曆
        InitEventBinding();     //初始化_元件事件
        InitSearch();           //初始化_查詢設定
        /*--預設值設定---------------------------------------------*/
        //$('#iptQuotDate_S').val(GetDay('-1m')).blur();     //報價日期從，預帶前一個月
        //$('#iptQuotDate_E').val(GetDay('')).blur();        //報價日期至，預帶今日
        /*--元件啟用設定-------------------------------------------*/
        //$('#divGrid').hide();//查詢區(關閉)
        //$('#iGrid').find('i').removeClass().addClass('fa fa-angle-double-up');
        //[畫面調整]
        $(window).bind('resize', function () {
            setTimeout(function () {
                $('#tblDataTableM, #tblDataTableD').DataTable().columns.adjust().responsive.recalc();
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
};
//事件初始化
function InitEventBinding() {
    /******控制項觸發事件_Start**************************/
    //{郵寄報價文件}[收件者][副本]焦點離開事件
    //$('#ipCustEmail,#ipAgntEmail').on("blur", function (e) {
    //    removeMsgInElm('#' + e.target.id);   //訊息移除
    //    if (this.value == '') { return; };
    //    if (!checkMail(this.value)) { ShowMsgInElm('#' + this.id, '輸入錯誤!'); };
    //    e.preventDefault();
    //    e.stopImmediatePropagation();
    //});
    /******控制項觸發事件_End****************************/

    /******按鈕處理事件_Start****************************/
    //{條件區}[確認]按鈕
    $('#btnConfirm').click(function (e) {
        ctrlDiv.hide('#divQuery,#divGridD');
        ctrlDiv.show('#divGridM');
        BlockUI('資料查詢中，請稍後...');
        setTimeout(function () {
            var param = {
                sBatchNo: $('#iptBatchNo').val()                /*團體件序號*/
                , sAmwayNo: $('#iptAmwayNo').val()              /*大保單號碼*/
                , sAgentNo: $('#iptAgentNo').val()
                , sBranchNo: $('#iptBranchNo').val()
                , sCreateDate_S: $('#iptCreateDate_S').val()
                , sCreateDate_E: $('#iptCreateDate_E').val()
            };
            creatDTM(getdata("/QuotationBatch/GetQuotBatchMaster", param).Data);
            $(window).resize();
            setTimeout(function () {
                $('#tblDataTableM').DataTable().columns.adjust().responsive.recalc();
            }, 100);
            $.unblockUI();
        }, 60);
    });
    //{查詢區}[轉出單]按鈕
    $('#btnBilling').click(function (e) {
        BlockUI('資料處理中，請稍後...');
        setTimeout(function () {
            console.log(rows_selected);

            let table = $('#tblDataTableD').DataTable();
            let arr = [];
            let checkedvalues = table.$('input:checked').not(':disabled').each(function () {
                arr.push($(this).val())
            });

            var postData = { 'sQuotNo':arr };
            $.ajax({
                type: "POST",
                url: "/QuotationBatch/ProcessBilling",
                data: JSON.stringify(postData),
                dataType: "json",
                contentType: 'application/json',
                async: false,
                success: function (result) {
                    if (result.Success) {
                        MsgBoxCloseFn('', result.Msg, 'green', function () { $('#btnConfirm').click(); });                       
                    }
                    else {
                        MsgBox('錯誤', result.Msg, 'red');
                    }
                },
                error: AjaxError
            });

            $.unblockUI();
        }, 60);

    });
    /******按鈕處理事件_End******************************/

    /******DataTable處理事件_Start***********************/
    //報價單資料_點選觸發事件
    $(document).on("click", "#tblDataTableM tbody tr", function () {
        var dt = $('#tblDataTableM');
        var index = $(this).context._DT_RowIndex; //行?
        var thisDT = $(this).parent().parent().dataTable();
        if (typeof (index) != "undefined") {
            dt.find('.selected').css('color', '').css('font-weight', '').removeClass('selected');
            $(this).toggleClass('selected');
            dt.find('.selected').css('color', 'red').css('font-weight', 'bold');
        };
    });
    /******DataTable處理事件_End*************************/

};
/******系統觸發事件_End******************************/

/******DataTable處理事件_Start***********************/
//建立團體件查詢 DataTables
function creatDTM(dtSource) {
    $('#tblDataTableM').DataTable({
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
            { className: "text-center", targets: [0, 1, 2, 3, 4, 5, 6, 7] }
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
            { width: "80px", data: "ShiftDate" }	    //7上傳日期
        ]
    })
};
//建立DataTables
function creatDTD(dtSource) {
    $('#tblDataTableD').DataTable({
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
        order: [1, 'desc'],    //預設排序為位置0
        columnDefs: [
            { className: "text-center", targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12] },
            { className: "text-right", targets: [9] }
        ],
        columns: [
            {
                width: "4%",
                'searchable': false,
                'orderable': false,
                'render': function (data, type, full, meta) {
                    return '<input type="checkbox" name="" value="' + full.QuotNo + '" ' + (full.IsBilling == "Y" ? 'checked' : '') + ' ' + (full.IsBillingLock == "Y" ? 'disabled' : '') + ' class="chkItem">';
                }
            },
            { data: "QuotNo" },         //1報價單號碼
            { data: "QuotNo_400" },	    //2AS400報價單號碼
            { data: "AmwayNo" },        //3大保單號碼
            { data: "AgentNo" },	    //4經手人
            { data: "BranchNo" },	    //5單位
            { data: "LicenseNo" },	    //6牌照號碼
            { data: "EddeDate" },	    //7生效日期
            { data: "Name" },	        //8被保險人
            { data: "TotalInsurance", render: $.fn.dataTable.render.number(',', '.', 0, '$') },	//9保費
            { data: "QuotDate" },	    //10報價日期
            { data: "PayNo" },          //11銷帳代號
            {
                //目前狀態
                render: function (meta, type, data, row) {
                    return data.ReviewStatusDesc.replace("|", "<br/>");
                }
            }
        ]
    })
};
/******DataTable處理事件_End*************************/


/******自訂函式_Start********************************/
///*==[控制類]_Start===========================*/

//初始化_查詢設定
function InitSearch() {
    creatDTM([]);             //註冊團體件GRID元件
    creatDTD([]);             //註冊報價單GRID元件
    $('#divQuery').find('input[type=text]').each(function () { $(this).val('') });    //清除特定div底下所有輸入項目的值
    $('#iptQuotDate_S').val(GetDay('-1m')).blur();     //報價日期從，預帶前一個月
    $('#iptQuotDate_E').val(GetDay('')).blur();        //報價日期至，預帶今日
    ctrlDiv.show('#divQuery');              //條件區(開啟)
    ctrlDiv.hide('#divGridM,#divGridD');    //查詢區(關閉)
}
//div控制
var ctrlDiv = {
    //div控制:開啟([sDivName]:div名稱)
    show: (function (sDivName) { $(sDivName).show(200).prev().find('i').removeClass().addClass('fa fa-angle-double-down'); }),
    //div控制:關閉([sDivName]:div名稱)
    hide: (function (sDivName) { $(sDivName).hide(200).prev().find('i').removeClass().addClass('fa fa-angle-double-up'); })
}
//[團體件序號]明細查詢([batchno]:團體件序號)
function selectBatchRow(batchno) {
    BlockUI('資料查詢中，請稍後...');
    setTimeout(function () {
        ctrlDiv.hide('#divQuery,#divGridM');    //條件區(開啟)
        ctrlDiv.show('#divGridD');              //查詢區(關閉)
        var param = { sBatchNo: batchno     /*團體件序號*/ };
        var dt = getdata("/QuotationBatch/GetQuotBatchQueryData", param);
        creatDTD(dt.Data);
        $(window).resize();
        $.unblockUI();
    }, 60);
}

$(document).ready(function () {
    var table = $('#tblDataTableD').DataTable({
        rowCallback: function (row, data, dataIndex) {
            // Get row ID
            var rowId = data[0];
            // If row ID is in the list of selected row IDs
            if ($.inArray(rowId, rows_selected) !== -1) {
                $(row).find('input[type="checkbox"]').prop('checked', true);
            }
        }
    });
    // Handle click on checkbox
    $('#tblDataTableD tbody').on('click', 'input[type="checkbox"]', function (e) {
        var $row = $(this).closest('tr');
        // Get row data
        var data = table.row($row);
        // Get row ID
        var rowId = data[0];
        // Determine whether row ID is in the list of selected row IDs 
        var index = $.inArray(rowId, rows_selected);
        // If checkbox is checked and row ID is not in list of selected row IDs
        if (this.checked && index === -1) {
            rows_selected.push(rowId);
            // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
        } else if (!this.checked && index !== -1) {
            rows_selected.splice(index, 1);
        }
        // Update state of "Select all" control
        updateDataTableSelectAllCtrl(table);
        // Prevent click event from propagating to parent
        e.stopPropagation();
    });
    // Handle click on table cells with checkboxes
    $('#tblDataTableD').on('click', 'tbody td, thead th:first-child', function (e) {
        $(this).parent().find('input[type="checkbox"]').trigger('click');
    });
    // Handle click on "Select all" control
    $('thead input[name="select_all"]', table.table().container()).on('click', function (e) {
        $('#tblDataTableD tbody input[type="checkbox"]').prop('checked', this.checked)
        // Prevent click event from propagating to parent
        e.stopPropagation();
    });
    // Handle table draw event
    table.on('draw', function () {
        // Update state of "Select all" control
        updateDataTableSelectAllCtrl(table);
    });
    //選取全部分頁中項目 event 
    $('#chkSelectAll').change(function () {
        chkSelectAll = $(this);
        let table = $('#tblDataTableD').DataTable();
        table.$('input.chkItem').not(':disabled').each(function (index, element) {
            $(element).prop('checked', chkSelectAll.prop('checked'))
        });
    });
});

function updateDataTableSelectAllCtrl(table) {
    var $table = table.table().node();
    var $chkbox_all = $('tbody input[type="checkbox"]', $table);
    var $chkbox_checked = $('tbody input[type="checkbox"]:checked', $table);
    var chkbox_select_all = $('thead input[name="select_all"]', $table).get(0);
    // If none of the checkboxes are checked
    if ($chkbox_checked.length === 0) {
        chkbox_select_all.checked = false;
        if ('indeterminate' in chkbox_select_all) {
            chkbox_select_all.indeterminate = false;
        }
        // If all of the checkboxes are checked
    } else if ($chkbox_checked.length === $chkbox_all.length) {
        chkbox_select_all.checked = true;
        if ('indeterminate' in chkbox_select_all) {
            chkbox_select_all.indeterminate = false;
        }
        // If some of the checkboxes are checked
    } else {
        chkbox_select_all.checked = true;
        if ('indeterminate' in chkbox_select_all) {
            chkbox_select_all.indeterminate = true;
        }
    }
}

/*====[控制類]_End=============================*/
/******自訂函式_End**********************************/