//全域變數宣告
var _divBen = $('#divBenData');     //{受益人資料}

/******控制項觸發事件_Start****************************/
//[同被保險人]選取事件
$('#chkIdenMEM').change(function () {
    if (this.checked) {
        if ($('#rdoCTLCustType:checked').val() == "C") {
            ctrlMsg('MF', '此報價單被保險人為法人，傷害險被保險人須為自然人，請重新選取！', '#chkIdenMEM');
            $("#chkIdenMEM").prop("checked", false);
        }
        else {
            $('#iptDriZCNAME').val($('#iptCTLName').val());         //姓名
            $('#selDriRELA').val($('#selRELA').val());              //與要保人關係
            $('#iptDriMEMBSEL').val($('#iptCTLCustID').val());      //ID
            $('#iptDriCLTDOB').val($('#iptCTLBirthday').val()).blur();     //生日
            $('#selDriCLTSEX').val($('#selCTLSex').val());          //性別
            var telno = "";
            if ($('#iptCTLOfficeTel').val() != "") { telno = $('#iptCTLOfficeTel').val(); }
            else if ($('#iptCTLHomeTel').val() != "") { telno = $('#iptCTLHomeTel').val(); }
            else if ($('#iptCTLCellPhone').val() != "") { telno = $('#iptCTLCellPhone').val(); };
            $('#iptDriTEL').val(telno);          //聯絡電話
        }
    }
    else {
        $('#iptDriZCNAME,#iptDriMEMBSEL,#iptDriCLTDOB,#selDriRELA,#selDriCLTSEX,#iptDriTEL').val('');
        $('#iptDriCLTDOB').blur();
    };
});
//[ID]焦點離開事件
$('#iptDriMEMBSEL').blur(function (e) {
    var sID = this.value.toUpperCase();//轉大寫
    var custtype = "P";         //[客戶類別]固定為"個人"
    var custnation = "TWN";     //[國別]預設為"TWN"
    custnation = (/^[A-Z]$/.test(sID.substr(1, 1))) ? "FOR" : "TWN";    //若第2碼為英文，則帶"FOR"
    chkID('#iptDriMEMBSEL', custtype, custnation);
    e.preventDefault();
    e.stopImmediatePropagation();
    setSex(custtype, custnation, sID, "selDriCLTSEX"); //自動帶入性別
    //if (checkID(this.value)) {
    //    setSex("P", "TWN", this.value, "selDriCLTSEX")
    //} else {
    //    ShowMsgInElm('#iptDriMEMBSEL', '[身份證字號]有誤！');
    //}
});
//[地址1]
$('#selBenADD1').change(function () {
    var key = $(this).val();
    var add2 = $('#selBenADD2');
    var addo = $('#iptBenADDO');
    //設定區域
    if (key == "") { add2.empty(); }
    else { setDDL_ADD('#selBenADD2', ' ', key); };
    addo.val(addo.val().replace($(this).data("oldtext"), ''));      //清除舊資料
    addo.val(addo.val().replace(add2.data("oldtext"), ''));      //清除舊資料
    var add1text = getSelText('#' + $(this).context.id, key).replace(/[ ]/g, '');       //讀取[縣市別]文字
    addo.val(add1text + addo.val().replace(/[ ]/g, ''));    //加上新資料
    $(this).data("oldtext", add1text);  //設定新資料至[oldtext]
});
//[地址2]
$('#selBenADD2').change(function () {
    var key = $(this).val();
    var add1 = $('#selBenADD1');
    var addo = $('#iptBenADDO');
    var add1text = getSelText('#selBenADD1', add1.val()).replace(/[ ]/g, '');       //讀取[縣市別]文字
    addo.val(addo.val().replace(add1.data("oldtext"), ''));      //清除舊資料
    addo.val(addo.val().replace($(this).data("oldtext"), ''));      //清除舊資料
    var add2text = getSelText('#' + $(this).context.id, key).replace(/[ ]/g, '');       //讀取[區域別]文字
    add2text = add1text == add2text ? "" : add2text;
    addo.val(add1text + add2text + addo.val().replace(/[ ]/g, ''));    //加上新資料
    $(this).data("oldtext", add2text);              //設定新資料至[oldtext]
});
//[法定]
$('#selBenLEGAL').change(function () {
    var val = $(this).val();
    if (val == "Y") {
        _divBen.find('#iptBenNAME,#selBenRELA,#iptBenTEL,#selBenADD1,#selBenADD2,#iptBenADDO').val('')//.removeAttr('required')
            .attr('style', 'display:none').prev().attr('style', 'display:none');
        _divBen.find('#iptBenNAME,#selBenRELA').removeAttr('required');
    } else {
        _divBen.find('#iptBenNAME,#selBenRELA,#iptBenTEL,#selBenADD1,#selBenADD2,#iptBenADDO')//.attr('required', 'required')
            .attr('style', 'display:').prev().attr('style', 'display:');
        _divBen.find('#iptBenNAME,#selBenRELA').attr('required', 'required');
    };
});
//[Gird全選]選取事件
$('#chkBanGridAll').change(function () {
    var isAll = this.checked; var itemcou = 0;
    $('#tblBeneList tbody > tr input[type=checkbox]').each(function (i, item) { item.checked = isAll; itemcou += 1; });
    if (isAll && itemcou > 0) { $('#btnBenDel').removeAttr('disabled'); } else { $('#btnBenDel').attr('disabled', 'true'); }
});
/******控制項觸發事件_End****************************/


/******按鈕處理事件_Start******************************/
//[新增受益人]按鈕
$("#btnBenNew").on("click", function () {
    if (_divBen.find('#divBenInputData').is(":hidden")) {
        _divBen.find('#divBenInputData').show(200);            //開啟[受益人資訊]
        _divBen.find('#btnBenAdd').show();                     //顯示[確定新增]按鈕
        _divBen.find('#btnBenAlt').hide();                     //隱藏[確定儲存]按鈕
    } else {
        _divBen.find('#divBenInputData').hide(200);
    };
});
//[確定新增]按鈕
$('#btnBenAdd').click(function (e) {
    var benlegal = _divBen.find('#selBenLEGAL').val();          //[法定]處理
    if (benlegal == "Y") { _divBen.find('#iptBenNAME,#selBenRELA,#iptBenTEL,#selBenADD1,#selBenADD2,#iptBenADDO').val(""); };
    removeMsgObjList($('#divBenData').find('input,select'));    //清空警告訊息
    if (!ValidateDiv('divBenData')) { return; }                 //{受益人資料}檢核
    var sDriMEMBSEL = $('#iptDriMEMBSEL').val();                //列名駕駛人ID
    var sAPLCustID = $('#iptAPLCustID').val();                  //要保人ID
    var sDriRELA = $('#selDriRELA').val();                      //與要保人關係
    var custnation = (/^[A-Z]$/.test(sDriMEMBSEL.substr(1, 1))) ? "FOR" : "TWN";    //[國別]預設為"TWN"，若第2碼為英文，則帶"FOR"
    if (!chkID('#iptDriMEMBSEL', "P", custnation)) { return; };  //ID檢核
    //if (!checkID(sDriMEMBSEL)) { ShowMsgInElm('#iptDriMEMBSEL', '輸入錯誤!'); return; }   //[ID]
    if (sDriRELA == "01" && sDriMEMBSEL != sAPLCustID) { MsgBox('錯誤', '[列名駕駛人ID]與[要保人ID]不同，[與要保人關係]錯誤！', 'red'); return; };
    BlockUI('作業中，請稍後');
    setTimeout(function () {
        var IdenMEM = (_divBen.find('#chkIdenMEM').prop('checked')) ? "Y" : "";     /*[同被保險人]*/
        var sSEX = getObjToVal(_divBen.find('#selDriCLTSEX').val());                /*[性別]*/
        var sBenRELA = getObjToVal(_divBen.find('#selBenRELA').val());              /*[關係]*/
        $('#tblBeneList').DataTable().row.add({
            ZCVRTYPE: getObjToVal($('#selBenZCVRTYPE').val())                       //險種代號            
            , ZCNAME: $('#iptDriZCNAME').val()                                      //姓名
            , RELA: sDriRELA                                                        //與要保人關係
            , RELADesc: getSysCodeVal(_arrLoadSysData, 'T006', sDriRELA)            //與要保人關係說明
            , MEMBSEL: sDriMEMBSEL                                                  //ID
            , CLTDOB: $('#iptDriCLTDOB').val()                                      //生日
            , CLTSEX: $('#selDriCLTSEX').val()                                      //性別
            , CLTSEXDesc: getSysCodeVal(_arrLoadSysData, 'T004', sSEX)              //性別說明
            , TEL: $('#iptDriTEL').val()                                            //聯絡電話
            , LEGAL: $('#selBenLEGAL').val()                                        //法定
            , BenNAME: $('#iptBenNAME').val()                                       //受益人
            , BenRELA: sBenRELA                                                     //關係
            , BenRELADesc: getSysCodeVal(_arrLoadSysData, 'T010', sBenRELA)         //關係說明
            , BenTEL: $('#iptBenTEL').val()                                         //受益人電話
            , ADD1: $('#selBenADD1').val()                                          //地址1
            , ADD2: $('#selBenADD2').val()                                          //地址2
            , ADDO: $('#iptBenADDO').val()                                          //地址
        }).draw();
        clrInputObj();                                                              //清空輸入框
        _divBen.find('#divBenInputData').hide();                                    //關閉[受益人資訊]
        _divBen.find("#btnBenAdd").focus();                                         //焦點移至[新增受益人]按鈕
        MsgBox('新增成功', '新增資料成功！', 'green');
        $.unblockUI();
    }, 1);
});
//[確定儲存]按鈕
$('#btnBenAlt').click(function (e) {
    var benlegal = _divBen.find('#selBenLEGAL').val();                      //[法定]處理
    if (benlegal == "Y") { _divBen.find('#iptBenNAME,#selBenRELA,#iptBenTEL,#selBenADD1,#selBenADD2,#iptBenADDO').val(""); };
    removeMsgObjList(_divBen.find('#divBenData').find('input,select'));     //清空警告訊息    
    if (!ValidateDiv('divBenData')) { return; }                             //{受益人資料}檢核
    var sDriMEMBSEL = $('#iptDriMEMBSEL').val();                //列名駕駛人ID
    var sAPLCustID = $('#iptAPLCustID').val();                  //要保人ID
    var sDriRELA = $('#selDriRELA').val();                      //與要保人關係
    if (!checkID(sDriMEMBSEL)) { ShowMsgInElm('#iptDriMEMBSEL', '輸入錯誤!'); return; }   //[ID]
    if (sDriRELA == "01" && sDriMEMBSEL != sAPLCustID) { MsgBox('錯誤', '[列名駕駛人ID]與[要保人ID]不同，[與要保人關係]錯誤！', 'red'); return; };
    BlockUI('作業中，請稍後');
    setTimeout(function () {
        var dt = $('#tblBeneList').DataTable();
        var trRow = dt.row('.selected').data();
        if (typeof (trRow) != "undefined") {
            var IdenMEM = (_divBen.find('#chkIdenMEM').prop('checked')) ? "Y" : "";     /*[同被保險人]*/
            var sSEX = getObjToVal(_divBen.find('#selDriCLTSEX').val());                /*[性別]*/
            var sBenRELA = getObjToVal(_divBen.find('#selBenRELA').val());              /*[關係]*/
            //資料寫入td處理
            trRow.ZCVRTYPE = getObjToVal($('#selBenZCVRTYPE').val());                   //險種代號
            trRow.IdenMEM = IdenMEM;                                                    //同被保險人
            trRow.ZCNAME = _divBen.find('#iptDriZCNAME').val();                         //姓名
            trRow.RELA = sDriRELA;                                                      //與要保人關係代碼
            trRow.RELADesc = getSysCodeVal(_arrLoadSysData, 'T006', sDriRELA);          //與要保人關係說明
            trRow.MEMBSEL = _divBen.find('#iptDriMEMBSEL').val();                       //ID
            trRow.CLTDOB = _divBen.find('#iptDriCLTDOB').val();                         //生日
            trRow.CLTSEX = sSEX;                                                        //性別
            trRow.CLTSEXDesc = getSysCodeVal(_arrLoadSysData, 'T004', sSEX);            //性別說明
            trRow.TEL = _divBen.find('#iptDriTEL').val();                               //聯絡電話
            trRow.LEGAL = _divBen.find('#selBenLEGAL').val();                           //法定
            trRow.BenNAME = _divBen.find('#iptBenNAME').val();                          //受益人
            trRow.BenRELA = sBenRELA;                                                   //關係
            trRow.BenRELADesc = getSysCodeVal(_arrLoadSysData, 'T010', sBenRELA);       //關係說明
            trRow.BenTEL = _divBen.find('#iptBenTEL').val();                            //受益人電話
            trRow.ADD1 = _divBen.find('#selBenADD1').val();                             //地址1
            trRow.ADD2 = _divBen.find('#selBenADD2').val();                             //地址2
            trRow.ADDO = _divBen.find('#iptBenADDO').val();                             //地址O
            dt.row('.selected').data(trRow).draw();
            clrInputObj();                                                              //清空輸入框
            _divBen.find('#divBenInputData').hide();                                    //關閉[受益人資訊]
            _divBen.find("#btnBenAdd").focus();                                         //焦點移至[新增受益人]按鈕
            MsgBox('修改成功', '修改資料成功！', 'green');
        } else {
            $.unblockUI();
        };
    }, 1);
});
/******按鈕處理事件_End********************************/


/******DataTable處理事件_Start*************************/
//受益人資料_點選觸發事件
$(document).on("click", "#tblBeneList tbody tr", function (e) {
    if (e.target.tagName == "BUTTON") {
        var index = $(this).context._DT_RowIndex; //行?
        if (typeof (index) != "undefined") {
            $('#tblBeneList').find('.selected').removeClass('selected');   //清除所有指定的css(指定selected)
            $(this).toggleClass('selected');                //選取設定css
        };
    };
});
//受益人資料_建立DataTables
function CreatBenDT(dtSource) {
    consLogDate("CreatBenDT_(" + dtSource.length + ")");
    var dtObjid = "tblBeneList";
    $('#' + dtObjid).DataTable({
        destroy: true,
        dom: '<"top">rt<"bottom">pli<"clear">',
        language: DataTablsChineseLanguage,
        searching: false,
        autoWidth: true,
        info: false,
        processing: false,
        data: dtSource,
        fixedHeader: { header: true, headerOffset: 45 },
        //pagingType: "full_numbers",
        lengthChange: false,
        paging: false,
        orderCellsTop: false,
        order: [],    //預設排序為位置[空值]，表示不預設排序
        columnDefs: [
        {
            visible: false, targets: [
                14      /*ADD1*/
                , 15    /*ADD2*/
                , 16    /*與要保人關係code*/
                , 17    /*性別code*/
                , 18    /*關係code*/
            ]
        },
        {
            className: "text-center",
            targets: [
                0       /*刪除*/
                , 1     /*編輯*/
                , 2     /*險種*/
                , 3     /*姓名*/
                , 4     /*與要保人關係*/
                , 5     /*ID*/
                , 6     /*生日*/
                , 7     /*性別*/
                , 9     /*法定*/
                , 10    /*受益人*/
                , 11    /*關係*/
                , 12    /*受益人*/ //FindTableIndex(dtObjid, '受益人')
            ]
        },
        {
            className: "text-left",
            targets: [
                8       /*聯絡電話*/
                , 13    /*地址*/
            ]
        }
        ],
        columns: [
            {   //[刪除]按鈕
                data: function (source, type, val) {
                    return '<button style="min-width:10px!important" type="button" class="btn btn-info" id="btnBenDel" onclick="return benDel(\'' + source.ZCVRTYPE.trim() + '\',\'' + source.ZCNAME.trim() + '\',\'' + source.BenNAME.trim() + '\')"><i class="fa fa-times"></i> 刪除</button>'
                }, orderable: false /*不排序(可以減少寬度)*/
            }
            , { //[編輯]按鈕
                data: function (source, type, val) {
                    return '<button style="min-width:10px!important" type="button" class="btn btn-info" id="btnBenLoad" onclick="return benLoad(\'' + source.ZCVRTYPE.trim() + '\',\'' + source.ZCNAME.trim() + '\',\'' + source.BenNAME.trim() + '\')"><i class="fa fa-share"></i> 編輯</button>'
                }, orderable: false /*不排序(可以減少寬度)*/
            }
            , { data: "ZCVRTYPE" }      //險種代碼
            , { data: "ZCNAME" }        //姓名
            , { data: "RELADesc" }      //與要保人關係
            , { data: "MEMBSEL" }       //ID
            , { data: "CLTDOB" }        //生日
            , { data: "CLTSEXDesc" }    //性別
            , { data: "TEL" }           //聯絡電話
            , { data: "LEGAL" }         //法定
            , { data: "BenNAME" }       //受益人
            , { data: "BenRELADesc" }   //關係
            , { data: "BenTEL" }        //受益人電話
            , { data: "ADDO" }          //地址
            , { data: "ADD1" }          //地址1(縣市別)(隱藏)
            , { data: "ADD2" }          //地址2(郵遞區號)(隱藏)
            , { data: "RELA" }          //與要保人關係code(隱藏)
            , { data: "CLTSEX" }        //性別code(隱藏)
            , { data: "BenRELA" }       //關係code(隱藏)
        ]
        //columns: [
        //    {   //[刪除]按鈕
        //        width: "2%"/*"50px"*/,
        //        style: "",
        //        data: function (source, type, val) {
        //            return '<button type="button" class="btn btn-info" id="btnBenDel" onclick="return benDel(\'' + source.ZCVRTYPE.trim() + '\',\'' + source.ZCNAME.trim() + '\',\'' + source.BenNAME.trim() + '\')"><i class="fa fa-times"></i> 刪除</button>'
        //        }
        //    }
        //    , { //[編輯]按鈕
        //        width: "2%"/*"50px"*/,
        //        data: function (source, type, val) {
        //            return '<button type="button" class="btn btn-info" id="btnBenLoad" onclick="return benLoad(\'' + source.ZCVRTYPE.trim() + '\',\'' + source.ZCNAME.trim() + '\',\'' + source.BenNAME.trim() + '\')"><i class="fa fa-share"></i> 編輯</button>'
        //        }
        //    }
        //    , { width: "2%"/*"20px"*/, data: "ZCVRTYPE", orderable: false /*不排序(可以減少寬度)*/ }   //險種代碼
        //    , { width: "10%"/*"50px"*/, data: "ZCNAME" }        //姓名
        //    , { width: "10%"/*"70px"*/, data: "RELADesc" }      //與要保人關係
        //    , { width: "5%"/*"20px"*/, data: "MEMBSEL" }        //ID
        //    , { width: "5%"/*"20px"*/, data: "CLTDOB" }         //生日
        //    , { width: "2%"/*"20px"*/, data: "CLTSEXDesc", orderable: false /*不排序(可以減少寬度)*/ }     //性別
        //    , { width: "5%"/*"20px"*/, data: "TEL" }            //聯絡電話
        //    , { width: "2%"/*"20px"*/, data: "LEGAL", orderable: false /*不排序(可以減少寬度)*/ }      //法定
        //    , { width: "10%"/*"30px"*/, data: "BenNAME" }       //受益人
        //    , { width: "10%"/*"20px"*/, data: "BenRELADesc" }   //關係
        //    , { width: "10%"/*"20px"*/, data: "BenTEL" }        //受益人電話
        //    , { width: "10%"/*"50px"*/, data: "ADDO" }          //地址
        //    , { width: "0%", data: "ADD1" }                     //地址1(縣市別)(隱藏)
        //    , { width: "0%", data: "ADD2" }                     //地址2(郵遞區號)(隱藏)
        //    , { width: "0%", data: "RELA" }                     //與要保人關係code(隱藏)
        //    , { width: "0%", data: "CLTSEX" }                   //性別code(隱藏)
        //    , { width: "0%", data: "BenRELA" }                  //關係code(隱藏)
        //]
    })
    consLogDate("CreatBenDT_(E)");
};
/******DataTable處理事件_End***************************/

/******自訂函式_Start********************************/
//[刪除]處理
function benDel(zcvrtype, zcname, benname) {
    ConfirmBox('確認刪除?', '是否確認刪除?', 'orange', function () {
        var dt = $('#tblBeneList').DataTable();
        $.each(dt.rows().data(), function (i, item) {
            if (item.ZCVRTYPE == zcvrtype && item.ZCNAME == zcname && item.BenNAME == benname) {
                dt.row('.selected').remove().draw();
            }
        });
        CreatBenDT(dt.data());
        clrInputObj();
    });
}
//[編輯帶入]處理
function benLoad(zcvrtype, zcname, benname) {
    BlockUI('作業中，請稍後');
    setTimeout(function () {
        _divBen.find('#divBenInputData').show(200);            //開啟[受益人資訊]
        _divBen.find('#btnBenAdd').hide();                     //隱藏[確定新增]按鈕
        _divBen.find('#btnBenAlt').show();                     //顯示[確定儲存]按鈕
        var dt = $('#tblBeneList').DataTable();
        var thisDT = $.grep(dt.rows().data(), function (item) { return item.ZCVRTYPE === zcvrtype && item.ZCNAME === zcname && item.BenNAME === benname; });
        if (thisDT.length > 0) {
            _divBen.find('#selBenZCVRTYPE').val(thisDT[0].ZCVRTYPE);
            _divBen.find('#chkIdenMEM').prop('checked', (thisDT[0].MEMBSEL == $('#iptCTLCustID').val()));
            _divBen.find('#iptDriZCNAME').val(thisDT[0].ZCNAME);
            _divBen.find('#selDriRELA').val(thisDT[0].RELA);
            _divBen.find('#iptDriMEMBSEL').val(thisDT[0].MEMBSEL);
            _divBen.find('#iptDriCLTDOB').val(thisDT[0].CLTDOB).blur();
            _divBen.find('#selDriCLTSEX').val(thisDT[0].CLTSEX);
            _divBen.find('#iptDriTEL').val(thisDT[0].TEL);
            _divBen.find('#selBenLEGAL').val(thisDT[0].LEGAL).change();
            _divBen.find('#iptBenNAME').val(thisDT[0].BenNAME);
            _divBen.find('#selBenRELA').val(thisDT[0].BenRELA);     //關係(因為與[與要保人關係]相似，會找到[與要保人關係]的位置，故直接指定)
            _divBen.find('#iptBenTEL').val(thisDT[0].BenTEL);
            _divBen.find('#selBenADD1').val(thisDT[0].ADD1).change();
            _divBen.find('#selBenADD2').val(thisDT[0].ADD2);
            _divBen.find('#iptBenADDO').val(thisDT[0].ADDO);
            //_divBen.find('#btnBenAlt').removeAttr('disabled');
        };
        $.unblockUI();
    }, 1);
};
//Grid代碼轉中文(讀取[下拉選單]將文字帶入Grid中)
function setDtCell(dt, selNM, rowIdx, cellIdx) {
    var cell = dt.cell(rowIdx, cellIdx).nodes().to$();
    cell.text(getSelText(selNM, cell.text()));
}
//清空輸入框
function clrInputObj() {
    removeMsgObjList(_divBen.find('input,select'));   //清空警告訊息    
    _divBen.find('input,select').each(function () { $(this).val('') });    //清除特定div底下所有輸入項目的值    
    _divBen.find('#chkIdenMEM').prop('checked', false);       //[同其他傷害險][同被保險人]初始化
    //20190729 UPD BY MICHAEL 傷害險被保險人名冊，若投保傷害險(47.48.58險種)只有一種時，則在新增傷險名冊時，選取險種可以改為由系統自動帶出，無需再由下拉選項每次點選。
    //_divBen.find('#selBenZCVRTYPE').val('');  //[險種]初始化
    if ($("#selBenZCVRTYPE option[value!='']").length == 1) {    //若選項只有一個，則預設第一筆
        $("#selBenZCVRTYPE")[0].selectedIndex = 0;
    }
    _divBen.find('#selBenLEGAL').val('Y').change();
    _divBen.find('#selBenADD1').val('').change();
    //_divBen.find('#btnBenAlt').attr('disabled', true);     //無資料時[修改]按鈕預設不可使用
    $('#tblBeneList').find('.selected').removeClass('selected');
}
/******自訂函式_End**********************************/

