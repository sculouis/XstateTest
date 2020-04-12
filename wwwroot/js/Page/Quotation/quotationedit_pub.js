
/******下拉選單處理_Start******************************/
//設定下拉選單([objddl]:物件名稱,[isdef]:預設值,[sCodeNo]:代碼編號,[sCodeItem1]:代碼層級1,[sCodeItem2]:代碼層級2,[sCodeItem3]:代碼層級3)
function setDDL_SYSCODE(objddl, isdef, sCodeNo, sCodeItem1, sCodeItem2, sCodeItem3, isshowtext, dtsys) {
    var sisdel = '0';
    var sisvalid = '1';
    var sisshowvalid = 'Y';
    if (_strMode == "EDIT") {
        sisdel = '', sisvalid = '', sisshowvalid = '';
    };
    var url = "/Quotation/GetDDL_SYSCODE";
    var param = {
        sCodeNo: sCodeNo,
        sCodeItem1: sCodeItem1,
        sCodeItem2: sCodeItem2,
        sCodeItem3: sCodeItem3,
        sIsDel: sisdel,
        sIsValid: sisvalid,
        sIsShowValid: sisshowvalid
    };
    var dt = {};
    if (typeof (dtsys) != "undefined") {
        dt = $.grep(dtsys, function (x) { return x.CodeNo === sCodeNo; });
    }
    else {
        dt = getdata(url, param);
    };
    setDDL(objddl, dt, isdef, isshowtext);
}
//設定[地址]下拉選單([objddl]:物件名稱,[isdef]:預設值,[sDESCTABL]:參數1,[sLANGUAGE]:參數2)
function setDDL_ADD(objddl, isdef, sCityNo, sAreaNo) {
    var url = "/Quotation/GetDDL_Address";
    var param = {
        sCityNo: sCityNo,
        sAreaNo: sAreaNo
    };
    setDDL(objddl, getdata(url, param), isdef);
}
//設定[險種資料]相關參數下拉選單([objddl]:物件名稱,[sList]:[<VALUE>及<TEXT>的XML格式]的字串或是[有|符號]的字串,[dt]:險種暫存區資料)
function setDDL_INS(objddl, sList, dt) {
    $(objddl).empty();
    sList = getObjToVal(sList);
    if (sList == '') { return; }
    sList = sList.toString();
    var arr = [];
    if (sList.indexOf('{') > -1 && sList.indexOf('}') > -1) {
        //同主險種資料處理
        var szcvrtpe = sList.replace('{', '').replace('}', '');
        dt.rows().data().filter(function (x) {
            if (x.ZCVRTYPE == szcvrtpe) {
                if (objddl == "#selSUMINA") { setDDL_INS(objddl, x.SUMINA); }
                else if (objddl == "#selSUMINB") { setDDL_INS(objddl, x.SUMINB); }
                else if (objddl == "#selSUMINC") { setDDL_INS(objddl, x.SUMINC); }
                return;
            }
        });
    } else if (sList.indexOf('<LISTDESC>') > -1) {
        //XML格式處理
        xmlDoc = $.parseXML(sList);
        $xml = $(xmlDoc);
        $VALUE = $xml.find("VALUE");
        $TEXT = $xml.find("TEXT");
        for (let i = 0 ; i < $VALUE.length; i++) {
            arr.push({ VALUE: $VALUE[i].textContent, TEXT: $TEXT[i].textContent });
        }
        setDDL(objddl, arr);
    } else if (sList.indexOf('VALUE') > -1) {
        //XML格式處理
        sList = "<LIST>" + sList + "</LIST>";
        xmlDoc = $.parseXML(sList);
        $xml = $(xmlDoc);
        $VALUE = $xml.find("VALUE");
        $TEXT = $xml.find("TEXT");
        for (let i = 0 ; i < $VALUE.length; i++) {
            arr.push({ VALUE: $VALUE[i].textContent, TEXT: Comma($TEXT[i].textContent, true) });
        }
        setDDL(objddl, arr, ' ', true);
    }
    else {
        //"|"符號格式處理
        var alist = sList.split('|');
        for (let i = 0; i < alist.length; i++) {
            if (alist[i].trim() != "") {
                arr.push({ VALUE: alist[i], TEXT: Comma(alist[i], true) });
            }
        }
        setDDL(objddl, arr, ' ', true);
    }
    return arr;
};
//設定查詢式下拉選單內容
//function setSelPick(objddl, ddldata, defVal, isshowtext) {
//    if (objddl.indexOf('#') == -1) {
//        objddl = '#' + objddl;
//    };
//    $(objddl).empty();
//    if (ddldata != null) {
//        if (ddldata.length > 0) {
//            $.each(ddldata, function (i, item) {
//                if (isshowtext) {
//                    $(objddl).append($('<option></option>').val(item.VALUE).text(item.TEXT));
//                } else {
//                    $(objddl).append($('<option></option>').val(item.VALUE).text(item.VALUE + '-' + item.TEXT));
//                }
//            });
//            $(objddl).selectpicker('refresh');
//            if (typeof (defVal) != "undefined" && defVal != null) {
//                $(objddl).selectpicker('val', defVal.trim());
//            }
//        };
//    }
//};
//設定[責係/體係]下拉選單內容
////function setDDLBodyDuty(objddl, querytype) {
////    var url = "/Quotation/GetDDL_BodyDuty";
////    var param = { sQUERYTYPE: querytype };
////    var dt = getdata(url, param);
////    $.each(dt, function (i, item) {     //格式化至小數點第2位
////        item.VALUE = Number(item.VALUE).toFixed(2);
////        item.TEXT = Number(item.TEXT).toFixed(2);
////    });
////    setDDL(objddl, dt, ' ', true);
////};
//設定[活動方案/自訂方案]下拉選單內容
function setDDLZCAMPAN(dt) {
    if (dt.length >= 0) {
        if (dt.length === 1 && typeof (dt[0].MSG) != "undefined") { MsgBox('錯誤', dt[0].MSG, 'red'); return; };
        setDDL_INS('#selZCAMPAN', _divQ.data("ZCAMPANLIST"));                  //設定[活動方案]清單
        var sVal = '';
        var sText = '';
        var sHtml = '';
        sHtml += "<option value=''></option>";
        sHtml += "<option value='0'>--自訂方案-----------------------</option>";
        for (let i = 0; i < dt.length; i++) {
            sVal = getObjToVal(dt[i].VALUE);
            sText = getObjToVal(dt[i].TEXT);
            sHtml += "<option value='" + sVal + "'>" + sText + "</option>";
            $('#iptProgramName' + sVal).val(sText);
        };
        sHtml += "<option value='0'>-------------------------------------</option>";
        _div4.find('#selZCAMPAN').prepend(sHtml).val('');
    };
};
//設定下拉選單，如果為null則新增項目
function setDDLIsNullAdd(objddlName, sVal) {
    sVal = getObjToVal(sVal);                                               //格式化[內容]
    objddlName = (objddlName.indexOf('#') > -1 ? "" : "#") + objddlName;    //格式化[物件名稱]
    var ddl = $(objddlName);
    ddl.val(sVal);      //設定[內容]
    if (ddl.val() == null) {
        ddl.append('<option value="' + sVal + '">' + sVal + '</option>').val(sVal); //若為Null，則新增該項目
    };
};
/******下拉選單處理_End********************************/


/******共用函式_Start**********************************/
//檢核_起迄日期([objS]:起日物件,[objE]:迄日物件,[sobjSDesc]:起日物件名稱,[sobjEDesc]:迄日物件名稱)
function chkDateSE(objS, objE, sobjSDesc, sobjEDesc) {
    var isChkPass = true;
    var SDate = (Date.parse(objS.val())).valueOf();
    var EDate = (Date.parse(objE.val())).valueOf();
    if (isNaN(SDate) || isNaN(EDate)) { return false; };
    var SDateDesc = objS.prev('span').text().replace('＊', '');
    var EDateDesc = objE.prev('span').text().replace('＊', '');
    if (sobjSDesc != undefined && sobjSDesc != '') { SDateDesc = sobjSDesc; };
    if (sobjEDesc != undefined && sobjEDesc != '') { EDateDesc = sobjEDesc; };
    if (sobjEDesc == "sysdate") { EDate = Date.parse(Date()); EDateDesc = "系統日"; }
    else if (sobjEDesc == "sysmonth") { EDate = Date.parse(new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/01'); EDateDesc = "系統日期年月"; };
    if (SDate > EDate) {
        ShowMsgInElm(objS, '[' + SDateDesc + ']不可大於[' + EDateDesc + ']！', true);
        ShowMsgInElm(objE, '[' + SDateDesc + ']不可大於[' + EDateDesc + ']！', true);
        objS.focus();
        return false;
    }
    else if (SDate == EDate) {
        ShowMsgInElm(objS, '[' + SDateDesc + ']不可等於[' + EDateDesc + ']！', true);
        ShowMsgInElm(objE, '[' + SDateDesc + ']不可等於[' + EDateDesc + ']！', true);
        objS.focus();
        return false;
    }
    if (getObjToVal(objS.attr('class')).indexOf('form_selDate') > -1) {    //如果有套用日期選單，則顯示在[年]的下拉選單上
        removeMsgInElm("#" + objS.parent().find('select').attr('id'));
    };
    if (getObjToVal(objE.attr('class')).indexOf('form_selDate') > -1) {    //如果有套用日期選單，則顯示在[年]的下拉選單上
        removeMsgInElm("#" + objE.parent().find('select').attr('id'));
    };
    return isChkPass;
};
//檢核_物件清單
function chkObjList(ObjList, isFocus) {
    resultFlag = true;
    ObjList.each(function (i, e) {
        var Msg = '';
        if (!$(this).is(":hidden") && $(this)[0].attributes.required != undefined && ($(this).val() == '' || $(this).val() == null)) {
            Msg += ' 必填欄位';
        };
        if (!$(this).is(":hidden") && $(this)[0].attributes.min != undefined && (!isInt(RemoveComma($(this).val())) || RemoveComma($(this).val()) <= 0)) {
            Msg += ' 不可為零或空值';
        };
        if (Msg != '') {
            resultFlag = false;
            var id = '#' + this.id;
            setTimeout(function () { ShowMsgInElm(id, Msg); }, 1);      //需要做延遲才不會消失
            //ShowMsgInElm('#' + this.id, Msg);
        };
        if (Msg != '' && isFocus) {
            if ($(this).attr('disabled') === 'disabled') {
                $(this).attr('disabled', false).focus().attr('disabled', true);     //focus() 需要先解開，再處理
            } else {
                $(this).focus();
            };
            isFocus = false;
        };
    });
    return resultFlag;
};
//處理_div訊息移除
function removeMsgObjList(ObjList) {
    if (ObjList == "ALL") { ObjList = $("select[data-toggle='tooltip'],input[data-toggle='tooltip']"); };
    ObjList.each(function (i, e) {
        var thisObj = $(this);
        if (thisObj.attr("data-toggle") == "tooltip") {
            thisObj.removeAttr('data-toggle');
            thisObj.removeAttr('data-html');
            thisObj.removeAttr('title');
            thisObj.removeAttr('data-original-title');
            thisObj.tooltip('hide');
        };
    });
};
//處理_訊息移除
function removeMsgInElm(Elm) {
    if ($(Elm).attr("data-toggle") == "tooltip") {
        $(Elm).removeAttr('data-toggle');
        $(Elm).removeAttr('data-html');
        $(Elm).removeAttr('title');
        $(Elm).removeAttr('data-original-title');
        $(Elm).tooltip('hide');
    }
};
//讀取下拉選單的文字([selNM]:物件名稱,[value]:欲讀取內容值,[isSohwId]:是否顯示代碼)
function getSelText(selNM, value, isSohwId) {
    var sel = $(selNM).find('option[value="' + value + '"]')[0];  //使用select的內容來處理代碼轉說明
    if (typeof (sel) != "undefined" && sel != null) {
        if (isSohwId == 'Y') {
            return sel.text;
        }
        else {
            var selval = sel.text;
            selval = selval.substring(selval.indexOf('-') + 1, selval.length);
            return selval;
        }
    } else {
        if (value == null) { return ''; }
        else { return value; }
    };
};
//移動至div
function setFocusDiv(divname) {
    $('html, body').animate({
        scrollTop: $(divname).offset().top
    }, 200);//'slow'
};
//判斷ID身分證，用來設定性別([custtype]:客戶類別,[custnation]:國別,[IDVal]:ID值,[targetID]:性別控制項ID
function setSex(custtype, custnation, IDVal, targetID) {
    if (custtype == "P" && custnation == "TWN" && IDVal.length > 1) {
        $('#' + targetID).val(IDVal.substr(1, 1))
    } else if (custtype == "P" && custnation == "FOR" && IDVal.length == 10) {
        /*[10碼外國人辦別性別處理]第2碼為性別碼(男:A,C,E 女:B,D,F)*/
        if (('A|C|E').indexOf(IDVal.substr(1, 1)) > -1) {
            $('#' + targetID).val('1');
        } else if (('B|D|F').indexOf(IDVal.substr(1, 1)) > -1) {
            $('#' + targetID).val('2');
        };
    };
};
//設定_還原舊值
function setRevOldval(objNM) {
    if (objNM == '') { return; };
    objNM = (objNM.indexOf('#') > -1 ? "" : "#") + objNM;    //格式化[物件名稱]
    var obj = $(objNM);
    obj.val(obj.attr('oldval'));    //還原舊值
    if (getObjToVal(obj.attr('class')).indexOf('form_selDate') > -1) {
        obj.blur();     //如果有套用日期選單，則需再執行blur事件
    };
};
//讀取_系統參數設定值([dtsys]:資料來源,[sCodeNo]:代碼編號)
function getSysCode(dtsys, sCodeNo) {
    if (typeof (dtsys) != "undefined") {
        var dt = $.grep(dtsys, function (x) { return x.CodeNo === sCodeNo; });
        if (dt != null) {
            if (dt.length > 0) {
                return getObjToVal(dt[0].VALUE);
            };
        };
    };
    return "";
};
//讀取_系統參數設定值([dtsys]:資料來源,[sCodeNo]:代碼編號)
function getSysCodeVal(dtsys, sCodeNo, sValue) {
    if (typeof (dtsys) != "undefined") {
        var dt = $.grep(dtsys, function (x) { return x.CodeNo === sCodeNo && x.VALUE === sValue; });
        if (dt != null) {
            if (dt.length > 0) {
                return getObjToVal(dt[0].TEXT);
            };
        };
    };
    return "";
};
//讀取_檔案上傳[預覽圖] input 輸入 input[type=file] 的 this
function getPreView(oImg, oSize, input) {
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
    };
};
//格式化(@param:num要轉換的數字, @param:pos指定小數第幾位做四捨五入)
function format_float(num, pos) {
    var size = Math.pow(10, pos);
    return Math.round(num * size) / size;
};
//將輸入的元件全部加上字數byte限制檢查(obj: 需要加上檢查的元件(陣列))
function registerLimitCLength(objs) {
    objs = $(objs);
    objs.each(function () {
        $(this).bind('keyup', function () {
            limitCLength(this);
        });
    });
};
//將畫面上所有文字輸入元件全部加上字數限制檢查
function registerLimitCLength4AllText() {
    registerLimitCLength($(':text'));
};
//查詢現在時間
var listDate = new Date();
//顯示Log處理
function consLogDate(input_str, fun_start_time) {
    input_str = getObjToVal(input_str);
    var now = new Date();
    var diff = parseInt(now - listDate);
    var sec = Math.floor(diff / 1000);
    listDate = now;
    var slog = '';
    slog = now.getFullYear() + "/" + padLeft(parseInt(now.getMonth() + 1), 2) + "/" + padLeft(now.getDate(), 2) + " "
        + padLeft(now.getHours(), 2) + ':' + padLeft(now.getMinutes(), 2) + ':' + padLeft(now.getSeconds(), 2) + ':' + padLeft(now.getMilliseconds(), 3);
    slog += "(" + (sec > 0 ? (sec + ":") : "");      //有秒數則顯示秒數
    slog += padLeft((diff % 1000), 3) + ")";         //顯示毫秒
    slog += ' ' + input_str;
    if (typeof (fun_start_time) != "undefined") {
        diff = parseInt(now - fun_start_time);
        sec = Math.floor(diff / 1000);
        slog += " 共(" + (sec > 0 ? (sec + ":") : "");      //有秒數則顯示秒數
        slog += padLeft((diff % 1000), 3) + ")";         //顯示毫秒
    };
    console.log(slog);                   //顯示
};
/******共用函式_End************************************/