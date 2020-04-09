/******控制項觸發事件_Start****************************/
// 註冊_[客戶資料]視窗彈出事件
$('#divCustInfo').on('shown.bs.modal', function (e) {
    $('#tblCustInfo').hide();
    BlockUI('作業中，請稍後');
    setTimeout(function () {
        $('#btnCustReturn').attr('disabled', true);         //按鈕預設不可使用
        var divCustInfo = $("#divCustInfo");
        var agntnum = divCustInfo.data("AgntNO");     //經手人
        var custid = divCustInfo.data("CustID");      //客戶ID
        var custname = divCustInfo.data("CustName");  //客戶名稱
        //agntnum = "F5410";
        //custid = "C220101692";
        //custname = "";
        var dt = getdata("/Quotation/GetWSCustInfo", { sAgntNO: agntnum, sCustID: custid, sCustName: custname });
        CreatCustDT(dt);
        $('#tblCustInfo').show();
        $.unblockUI();
    }, 1);
});
//註冊_[客戶資料]視窗 轉場特效結束，已完全隱藏時呼叫
$("#divCustInfo").on("hidden.bs.modal", function (e) {
    $('#tblCustInfo').DataTable().columns.adjust().responsive.recalc();
    $('#tblCustInfo').hide();
});
/******控制項觸發事件_End****************************/


/******按鈕處理事件_Start******************************/
//[確定帶入]按鈕
$('#btnCustReturn').click(function (e) {
    BlockUI('作業中，請稍後');
    setTimeout(function () {
        var tblCustInfo = $('#tblCustInfo');
        //var dt = tblCustInfo.find('.selected');
        /**資料選取**/
        var targetID = $("#divCustInfo").data("targetID");  //來源物件ID
        var custid = tblCustInfo.data("RMEMBSEL");          //客戶ID
        var custname = tblCustInfo.data("RZCNAME");         //客戶名稱
        var birthday = tblCustInfo.data("RCLTDOB");         //生日
        var add = tblCustInfo.data("RCADDRES");             //地址
        var email = tblCustInfo.data("REMAIL");             //EMail
        var sex = tblCustInfo.data("CLTSEX");               //性別
        var custtype = tblCustInfo.data("CLTTYPE");         //客戶別
        var nation = tblCustInfo.data("RCTRYCODE");         //國別
        var rpthead = tblCustInfo.data("RPTHEAD");          //代表人
        var rphonea = tblCustInfo.data("RPHONEA");          //家用電話
        var rphoneb = tblCustInfo.data("RPHONEB");          //公司電話
        var rphonec = tblCustInfo.data("RPHONEC");          //行動電話
        var rzpcode = tblCustInfo.data("RZPCODE");          //郵遞區號
        var marriage = "";                                  //婚姻
        var fax = "";                                       //傳真
        var clntnum = tblCustInfo.data("RCLNTNUM");         //客戶代碼
        var Is70BNO = "";                                   //是否有70單位別
        var IsPEND = "";                                    //是否有未決賠案
        if (custid == "") { custid = $("#divCustInfo").data("CustID") };    //[客戶ID]處理
        if (custtype == "") { custtype = custid.length == 8 ? "C" : "P"; }; //[客戶別]處理
        if (nation == "") { nation = "TWN"; };              //[國別]處理
        ///-[郵遞區號]處理_S----------------------------------------------------------
        rzpcode = rzpcode.length > 3 ? rzpcode.substr(0, 3) : rzpcode;
        var add1 = "";        //縣市別代碼
        if (rzpcode != "") {
            var adddata = getdata("/Quotation/GetDDL_Address", { sCityNo: "", sAreaNo: rzpcode });
            if (adddata.length > 0) {
                add1 = getObjToVal(adddata[0].VALUE);
            };
        };
        //--[郵遞區號]處理_E-----------------------------------------------------------
        ///-[婚姻]&[傳真]處理_S-------------------------------------------------------
        if (clntnum != '') {
            var dt = getdata("/Quotation/GetCLTS", { sCLNTNUM: clntnum });
            if (dt.length > 0) {
                if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; }
                marriage = getObjToVal(dt[0].Marriage);     //婚姻
                fax = getObjToVal(dt[0].Fax);               //傳真
                Is70BNO = getObjToVal(dt[0].IS70BNO);       //是否有70單位別
                IsPEND = getObjToVal(dt[0].ISPEND);         //是否有未決賠案
            };
        };
        //--[婚姻]&[傳真]處理_E--------------------------------------------------------
        if (targetID == "btnAPLCustID" || targetID == "btnAPLCustNM") {
            removeMsgInElm('#iptAPLCustID');   //訊息移除
            _div2.find("#iptAPLCustID").data("Is70BNO", Is70BNO);       //是否有70單位別
            _div2.find("#iptAPLCustID").data("IsPEND", IsPEND);         //是否有未決賠案
            _div2.find("#iptAPLCustID").val(custid);
            _div2.find("#iptAPLName").val(custname);
            _div2.find("#iptAPLBirthday").val(birthday).blur();
            _div2.find("#iptAPLEmail").val(email);
            _div2.find("#rdoAPLCustType[value='" + custtype + "']").prop("checked", true).change();
            _div2.find('#selAPLSex').val(sex);                           //性別
            //_div2.find('#selAPLNation').val(nation);                     //國別
            setDDLIsNullAdd('#selAPLNation', nation);                    //國別
            _div2.find('#iptAPLRepresentative').val(rpthead);            //代表人
            _div2.find('#selAPLMarriage').val(marriage);                 //婚姻
            _div2.find('#iptAPLOfficeTel').val(rphoneb);                 //公司電話
            _div2.find('#iptAPLHomeTel').val(rphonea);                   //家用電話
            _div2.find('#iptAPLCellPhone').val(rphonec);                 //手機號碼
            _div2.find('#iptAPLFax').val(fax);                           //傳真
            _div2.find('#selAPLADD1').val(add1).change();                //縣市別
            _div2.find('#selAPLADD2').val(rzpcode).change();             //區別
            _div2.find("#iptAPLADDO").val(add);                          //地址
            _div2.find("#iptAPL_CLNTNUM").val(clntnum).parent().show();           //客戶代碼
            ctrlInputCust();                       //鎖住[ID,姓名,生日,性別]等欄位
            $('#btnUnAPLCustID').parent().show();
        } else if (targetID == "btnCTLCustID" || targetID == "btnCTLCustNM") {
            removeMsgInElm('#iptCTLCustID');   //訊息移除
            _div2.find("#iptCTLCustID").data("Is70BNO", Is70BNO);       //是否有70單位別
            _div2.find("#iptCTLCustID").data("IsPEND", IsPEND);         //是否有未決賠案
            _div2.find("#iptCTLCustID").val(custid);
            _div2.find("#iptCTLName").val(custname);
            _div2.find("#iptCTLBirthday").val(birthday).blur();
            _div2.find("#iptCTLEmail").val(email);
            _div2.find("#rdoCTLCustType[value='" + custtype + "']").prop("checked", true).change();
            _div2.find('#selCTLSex').val(sex);                           //性別
            //_div2.find('#selCTLNation').val(nation);                     //國別
            setDDLIsNullAdd('#selCTLNation', nation);                    //國別
            _div2.find('#iptCTLRepresentative').val(rpthead);            //代表人
            _div2.find('#selCTLMarriage').val(marriage);                 //婚姻
            _div2.find('#iptCTLOfficeTel').val(rphoneb);                 //公司電話
            _div2.find('#iptCTLHomeTel').val(rphonea);                   //家用電話
            _div2.find('#iptCTLCellPhone').val(rphonec);                 //手機號碼
            _div2.find('#iptCTLFax').val(fax);                           //傳真
            _div2.find('#selCTLADD1').val(add1).change();                //縣市別
            _div2.find('#selCTLADD2').val(rzpcode).change();             //區別
            _div2.find("#iptCTLADDO").val(add);                          //地址
            _div2.find("#iptCTL_CLNTNUM").val(clntnum).parent().show();           //客戶代碼
            ctrlInputCust();                       //鎖住[ID,姓名,生日,性別]等欄位
            $('#btnUnCTLCustID').parent().show();
        };
        $.unblockUI();
        $("#divCustInfo").modal('hide');
    }, 1);
});
//[解鎖]按鈕(被保險人)
$('#btnUnCTLCustID').click(function (e) {
    $('#btnUnCTLCustID').parent().hide();
    _div2.find("#iptCTL_CLNTNUM").val('').parent().hide();  //客戶代碼
    _div2.find("#iptCTLCustID").data("Is70BNO", "");        //是否有70單位別
    _div2.find("#iptCTLCustID").data("IsPEND", "");         //是否有未決賠案
    ctrlInputCust();    //解鎖[ID,姓名,生日,性別]等欄位
    if ($('#iptQUOTENO').data('isSysPass')) { return; };   //當[報價單編號]查詢帶入資料時/[清除]，不處理資料異動事件
    ///20190729 UPD BY MICHAEL 客代解鎖後，詢問是否要保留資料，不要清空。
    ConfirmBox('請確認', '您已經解鎖客戶資料，請確認是否保留內容?', 'orange'
        , function () { }   /*--[否]---*/
        , function () {     /*--[是]---*/
            //清空欄位
            $('#iptCTLCustID,#iptCTLName,#selCTLSex,#selCTLBirthdayY,#selCTLBirthdayM,#selCTLBirthdayD').val('');
            $('#iptCTLRepresentative,#selCTLMarriage,#iptCTLOfficeTel,#iptCTLHomeTel,#iptCTLCellPhone,#iptCTLFax,#iptCTLEmail,#selCTLADD1,#selCTLADD2,#iptCTLADDPot,#iptCTLADDO').val('');
            //預設值
            $('#selCTLNation').val('TWN');
            $("#rdoCTLCustType[value='P']").prop("checked", true).change();
        }
    );
});
//[解鎖]按鈕(要保人)
$('#btnUnAPLCustID').click(function (e) {
    $('#btnUnAPLCustID').parent().hide();
    _div2.find("#iptAPL_CLNTNUM").val('').parent().hide();  //客戶代碼
    _div2.find("#iptAPLCustID").data("Is70BNO", "");        //是否有70單位別
    _div2.find("#iptAPLCustID").data("IsPEND", "");         //是否有未決賠案
    ctrlInputCust();    //解鎖[ID,姓名,生日,性別]等欄位
    if ($('#iptQUOTENO').data('isSysPass')) { return; };   //當[報價單編號]查詢帶入資料時/[清除]，不處理資料異動事件
    ///20190729 UPD BY MICHAEL 客代解鎖後，詢問是否要保留資料，不要清空。
    ConfirmBox('請確認', '您已經解鎖客戶資料，請確認是否保留內容?', 'orange'
        , function () { }   /*--[否]---*/
        , function () { /*--[是]---*/
            //清空欄位
            $('#selAPLNation,#iptAPLCustID,#iptAPLName,#selAPLSex,#selAPLBirthdayY,#selAPLBirthdayM,#selAPLBirthdayD').val('');
            $('#iptAPLRepresentative,#selAPLMarriage,#iptAPLOfficeTel,#iptAPLHomeTel,#iptAPLCellPhone,#iptAPLFax,#iptAPLEmail,#selAPLADD1,#selAPLADD2,#iptAPLADDPot,#iptAPLADDO').val('');
            //預設值
            $('#selAPLNation').val('TWN');
            $("#rdoAPLCustType[value='P']").prop("checked", true).change();
        }
    );
});
/******按鈕處理事件_End********************************/


/******DataTable處理事件_Start*************************/
//客戶資料_點選觸發事件
$(document).on("click", "#tblCustInfo tbody tr", function (e) {
    var index = $(this).context._DT_RowIndex; //行數
    if (typeof (index) != "undefined") {
        BlockUI('作業中，請稍後');
        var tbNM = "tblCustInfo";
        var tblCustInfo = $('#' + tbNM);
        /**資料選取**/
        tblCustInfo.find('.selected').removeClass('selected');   //清除css(指定selected)
        $(this).toggleClass('selected');
        /**資料載入**/
        var thisDT = tblCustInfo.dataTable();
        tblCustInfo.data("RZCNAME", thisDT.fnGetData(this, FindTableIndex(tbNM, '客戶名稱')));
        tblCustInfo.data("RCLTDOB", thisDT.fnGetData(this, FindTableIndex(tbNM, '出生年月日')));
        tblCustInfo.data("RMEMBSEL", thisDT.fnGetData(this, FindTableIndex(tbNM, '身分證字號')));
        tblCustInfo.data("RPHONEA", thisDT.fnGetData(this, FindTableIndex(tbNM, '聯絡電話')));
        tblCustInfo.data("RCADDRES", thisDT.fnGetData(this, FindTableIndex(tbNM, '聯絡地址')));
        tblCustInfo.data("REMAIL", thisDT.fnGetData(this, FindTableIndex(tbNM, '電子信箱')));
        tblCustInfo.data("CLTTYPE", thisDT.fnGetData(this, 8));       //客戶別
        tblCustInfo.data("CLTSEX", thisDT.fnGetData(this, 9));       //性別
        tblCustInfo.data("RCTRYCODE", thisDT.fnGetData(this, 10));    //國家
        tblCustInfo.data("RPHONEB", thisDT.fnGetData(this, 11));      //公司電話
        tblCustInfo.data("RPHONEC", thisDT.fnGetData(this, 12));      //行動電話
        tblCustInfo.data("RPTHEAD", thisDT.fnGetData(this, 13));      //代表人
        tblCustInfo.data("RZPCODE", thisDT.fnGetData(this, 14));      //郵遞區號
        tblCustInfo.data("RCLNTNUM", thisDT.fnGetData(this, 15));     //AS400客代
        $('#btnCustReturn').removeAttr('disabled');         //按鈕開放
        $.unblockUI();
    };
});
//客戶資料_建立DataTables
function CreatCustDT(dtSource) {
    $('#tblCustInfo').DataTable({
        destroy: true,
        dom: '<"top">rt<"bottom">pli<"clear">',
        language: DataTablsChineseLanguage,
        //language: {
        //    "processing": "處理中...",
        //    "loadingRecords": "載入中...",
        //    "lengthMenu": "顯示 _MENU_ 項結果",
        //    "zeroRecords": "客戶不存在",
        //    "info": "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
        //    "infoEmpty": "顯示第 0 至 0 項結果，共 0 項",
        //    "infoFiltered": "(從 _MAX_ 項結果中過濾)",
        //    "infoPostFix": "",
        //    "search": "搜尋:",
        //    "paginate": {
        //        "first": "第一頁",
        //        "previous": "上一頁",
        //        "next": "下一頁",
        //        "last": "最後一頁"
        //    },
        //    "aria": {
        //        "sortAscending": ": 升冪排列",
        //        "sortDescending": ": 降冪排列"
        //    }
        //},
        searching: false,
        autoWidth: false,
        info: false,
        processing: true,//false,
        data: dtSource,
        fixedHeader: { header: true, headerOffset: 45 },
        lengthChange: false,
        paging: false,
        orderCellsTop: false,
        order: [],    //預設排序為位置空值，表示不預設排序
        columnDefs: [
            {
                visible: false, targets: [8, 9, 10, 11, 12, 13, 14, 15]
            }
        ],
        columns: [
            {   //選取
                width: "20px",
                data: function (source, type, val) {
                    return '<input id="chkCutsGrid" name="chkCutsGrid" type="radio" class="label_cbx">';
                },
                className: "text-center custom-middle-align",
                orderable: false   //不排序
            }
            , { width: "50px", data: "RZCNAME", className: "text-center" }	//客戶名稱
            , { width: "50px", data: "RCLTDOB", className: "text-center" }	//出生年月日
            , { width: "50px", data: "RMEMBSEL", className: "text-center" }	//身分證或統一編號
            , { width: "50px", data: "RPHONEA", className: "text-left" }	//住宅電話
            , { width: "50px", data: "RCADDRES", className: "text-left break_column" }	//中文地址
            , { width: "50px", data: "REMAIL", className: "text-left break_column" }	    //電子信箱
            , { //身分別
                width: "30px", data: "CLTTYPE", className: "text-center",
                data: function (source, type, val) {
                    return source.CLTTYPE == "P" ? "自然人" : "法人";
                }
            }
            , { data: "CLTTYPE" }       // 8.客戶別
            , { data: "CLTSEX" }        // 9.性別
            , { data: "RCTRYCODE" }     //10.國家
            , { data: "RPHONEB" }       //11.公司電話
            , { data: "RPHONEC" }       //12.行動電話
            , { data: "RPTHEAD" }       //13.代表人
            , { data: "RZPCODE" }       //14.郵遞區號
            , { data: "RCLNTNUM" }      //15.AS400客代
        ]
    })
};
/******DataTable處理事件_End***************************/

/******自訂函式_Start********************************/
/******自訂函式_End**********************************/

