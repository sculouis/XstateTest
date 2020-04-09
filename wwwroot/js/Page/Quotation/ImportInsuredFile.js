
$(document).ready(function () {
    $('#FakeBrowseFile1, #FakeFile1').on('click', function () {
        $('#File1').trigger("click");
    });

    $('#File1').change(function () {
        var file_name = this.value.replace(/\\/g, '/').replace(/.*\//, '');
        $('#FakeFile1').val(file_name);
    });

    $('#download').click(function (e) {
        e.preventDefault();  //stop the browser from following
        window.location.href = '/FormTemplate/傷害險被保險人名冊.xlsx';
    });
});

$("body").on("click", "#upload", function () {
    //Reference the FileUpload element.
    var fileUpload = $("#File1")[0];

    //Validate whether File is valid Excel file.(中文,英文,數字)
    var sFileName = fileUpload.value.toLowerCase();
    if (sFileName.slice((sFileName.lastIndexOf(".") - 1 >>> 0) + 2) == "xlsx") {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();

            //For other Browsers.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    var bolchkResult = CheckExcel(e.target.result);
                    if (bolchkResult) {
                        ProcessExcel(e.target.result);
                    } else {
                        //clear choose file
                        $('#FakeFile1').val('');
                        $('#File1').val('');
                    }
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    var bolchkResult = CheckExcel(data);
                    if (bolchkResult) {
                        ProcessExcel(data);
                    } else {
                        //clear choose file
                        $('#FakeFile1').val('');
                        $('#File1').val('');
                    }
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        MsgBox('警告', '檔案格式錯誤, 請上傳正確的Excel檔案!', 'red');
        return false;
    }
});

function ProcessExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    //Add the data rows from Excel file.
    for (var i = 1; i < excelRows.length; i++) {
        var sZCVRTYPE = getObjToVal(excelRows[i]['＊險種']);
        var sZCNAME = halfToFull(getObjToVal(excelRows[i]['＊姓名']));
        var sDriRELA = getObjToVal(excelRows[i]['＊與要保人關係']);
        var sSEX = getObjToVal(excelRows[i]['＊性別']);
        var sBirth = getObjToVal(excelRows[i]['＊生日']).split("-").join("/");
        var sBenRELA = getObjToVal(excelRows[i]['＊與列名駕駛人的關係']);
        var sLegal = getObjToVal(excelRows[i]['＊法定']);
        var sID = getObjToVal(excelRows[i]['＊ID']);
        var sBenNAME = getObjToVal(excelRows[i]['＊受益人姓名']);
        var sBenTel = '';
        var sAddr = '';
        var sTel = '';
        var bolSame = true
        if ((sZCVRTYPE + sZCNAME + sDriRELA + sSEX + sBirth + sBenRELA + sLegal + sID) == '') {
            i = excelRows.length;
        } else {
            if (getObjToVal(excelRows[i].受益人電話) != '') { sBenTel = excelRows[i].受益人電話; }
            if (getObjToVal(excelRows[i].縣市別) != '' && getObjToVal(excelRows[i].區別) != '') { sAddr = excelRows[i].縣市別 + excelRows[i].區別 + excelRows[i].地址; }
            if (getObjToVal(excelRows[i].聯絡電話) != '') { sTel = excelRows[i].聯絡電話; }

            //被保險人名冊與Excel資料比對
            var dt = $('#tblBeneList').DataTable();
            $.each(dt.data(), function (i, item) {
                if (sLegal == 'Y') {
                    if (item.ZCVRTYPE == sZCVRTYPE && item.ZCNAME == sZCNAME && item.RELA == sDriRELA && item.MEMBSEL == sID) { bolSame = false }
                } else {
                    if (item.ZCVRTYPE == sZCVRTYPE && item.ZCNAME == sZCNAME && item.RELA == sDriRELA && item.MEMBSEL == sID && item.BenNAME == sBenNAME) { bolSame = false }
                }
            });

            if (bolSame) {
                if (sLegal == 'Y') {
                    $('#tblBeneList').DataTable().row.add({
                        ZCVRTYPE: sZCVRTYPE                                                     //險種代號            
                        , ZCNAME: sZCNAME                                                       //姓名
                        , RELA: sDriRELA                                                        //與要保人關係
                        , RELADesc: getSysCodeVal(_arrLoadSysData, 'T006', sDriRELA)            //與要保人關係說明
                        , MEMBSEL: sID                                                          //ID
                        , CLTDOB: sBirth                                                        //生日
                        , CLTSEX: sSEX                                                          //性別
                        , CLTSEXDesc: getSysCodeVal(_arrLoadSysData, 'T004', sSEX)              //性別說明
                        , TEL: sTel                                                             //聯絡電話
                        , LEGAL: sLegal                                                         //法定
                        , BenNAME: ''                                                           //受益人姓名
                        , BenRELA: ''                                                           //與列名駕駛人的關係
                        , BenRELADesc: ''                                                       //關係說明
                        , BenTEL: ''                                                            //受益人電話
                        , ADD1: ''                                                              //縣市別(要保人縣市碼)
                        , ADD2: ''                                                              //區別(要保人區碼)
                        , ADDO: ''                                                              //地址
                    }).draw();
                } else {
                    $('#tblBeneList').DataTable().row.add({
                        ZCVRTYPE: sZCVRTYPE                                                     //險種代號            
                        , ZCNAME: sZCNAME                                                       //姓名
                        , RELA: sDriRELA                                                        //與要保人關係
                        , RELADesc: getSysCodeVal(_arrLoadSysData, 'T006', sDriRELA)            //與要保人關係說明
                        , MEMBSEL: sID                                                          //ID
                        , CLTDOB: sBirth                                                        //生日
                        , CLTSEX: sSEX                                                          //性別
                        , CLTSEXDesc: getSysCodeVal(_arrLoadSysData, 'T004', sSEX)              //性別說明
                        , TEL: sTel                                                             //聯絡電話
                        , LEGAL: sLegal                                                         //法定
                        , BenNAME: halfToFull(sBenNAME)                                         //受益人姓名
                        , BenRELA: sBenRELA                                                     //與列名駕駛人的關係
                        , BenRELADesc: getSysCodeVal(_arrLoadSysData, 'T010', sBenRELA)         //關係說明
                        , BenTEL: sBenTel                                                       //受益人電話
                        , ADD1: excelRows[i].要保人縣市碼                                        //縣市別(要保人縣市碼)
                        , ADD2: excelRows[i].要保人區碼                                          //區別(要保人區碼)
                        , ADDO: halfToFull(sAddr)                                               //地址
                    }).draw();
                }
            }
        }
    }

    if (bolSame) {
        MsgBox('新增成功', '新增資料成功！', 'green');
    } else {
        MsgBox('資料重複', '被保險人名單已經上傳！', 'green');
    }

    //clear choose file
    $('#FakeFile1').val('');
    $('#File1').val('');
};

function CheckExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    var errMsgList = '';
    var iErrCol = 0;
    //Check the data rows from Excel file.
    for (var i = 1; i < excelRows.length; i++) {
        var requiredMsg = '';
        var errMsg = '';
        var errMsgDiff = '';
        var errMsg2 = '';
        iErrCol = 0;

        var sLegal = excelRows[i]['＊法定']
        var sCustID = $('#iptCTLCustID').val();

        if (getObjToVal(excelRows[i]['＊險種']) == '') {
            requiredMsg += '[險種]';
            iErrCol++;
        } else {
            var sZCVRTYPE = getObjToVal($('#selBenZCVRTYPE').val());
            if (excelRows[i]['＊險種'] != sZCVRTYPE) {
                errMsg += '[險種]';
            }
        }
        if (getObjToVal(excelRows[i]['＊姓名']) == '') {
            requiredMsg += '[姓名]';
            iErrCol++;
        }
        if (getObjToVal(excelRows[i]['＊ID']) == '') {
            requiredMsg += '[ID]';
            iErrCol++;
        } else {
            if (!checkID(excelRows[i]['＊ID'])) {
                errMsg += '[ID]';
            }
        }
        if (getObjToVal(excelRows[i]['＊生日']) == '') {
            requiredMsg += '[生日]';
            iErrCol++;
        } else {
            if (!checkBirthDay(excelRows[i]['＊生日'])) {
                errMsg += '[生日]';
            }
        }
        if (getObjToVal(excelRows[i]['＊與要保人關係']) == '') {
            requiredMsg += '[與要保人關係]';
            iErrCol++;
        } else {
            if (excelRows[i]['＊與要保人關係'] == '01') {
                if (sCustID != excelRows[i]['＊ID']) {
                    errMsgDiff = '[ID]欄位資料與[要保人ID]不同!';
                }
            }
        }
        if (getObjToVal(excelRows[i]['＊性別']) == '') {
            requiredMsg += '[性別]';
            iErrCol++;
        }
        if (getObjToVal(sLegal) == '') {
            requiredMsg += '[法定]'
            iErrCol++;
        } else {
            if (sLegal == 'N') {
                if (getObjToVal(excelRows[i]['＊受益人姓名']) == '') {
                    requiredMsg += '[受益人姓名]';
                }
                if (getObjToVal(excelRows[i]['＊與列名駕駛人的關係']) == '') {
                    requiredMsg += '[與列名駕駛人的關係]';
                }
            }
        }
        if (getObjToVal(excelRows[i]['＊ID']) != '' && getObjToVal(excelRows[i]['＊性別']) != '') {
            var selSex = excelRows[i]['＊性別']; //性別
            var idSex = excelRows[i]['＊ID'].substr(1, 1); //ID
            if ((idSex == "1" && selSex != "1") || (idSex == "2" && selSex != "2")) {
                errMsg2 = 'ID與性別不符！';
            }
        }
        if (iErrCol == 7) {
            //當所有欄位都是空的，則直接跳離檢核
            i = excelRows.length;
        }
        else {
            if (requiredMsg != "") { requiredMsg += '欄位必須輸入資料!'; }
            if (errMsg != "") { errMsg += '欄位資料有誤!'; }
            if (requiredMsg != "" || errMsg != "" || errMsgDiff != "" || errMsg2 != "") { errMsgList += '第' + i + '筆資料, ' + requiredMsg + errMsg + errMsgDiff + errMsg2 + '\r\n'; }
        }
    }
    if (errMsgList != "") {
        MsgBox('警告', 'Excel上傳失敗, 請核對錯誤訊息文字檔!', 'red');
        writeTxtFile(errMsgList);
        return false;
    }
    return true;
};

function checkBirthDay(input) {
    var validformat = /^\d{4}\-\d{2}\-\d{2}$/ //Basic check for format validity
    var bolchkday = true;
    if (!validformat.test(input)) {
        bolchkday = false;
    }

    return bolchkday;
}

//將檢核結果寫入txt檔
function writeTxtFile(data) {
    var textToBLOB = new Blob([data], { type: 'text/plain' });
    var file_name = 'Excel上傳傷害險被保險人名冊錯誤.txt';

    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
        window.navigator.msSaveOrOpenBlob(textToBLOB, file_name);
    } else { // for Non-IE (chrome, firefox etc.)
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var txtUrl = URL.createObjectURL(textToBLOB);
        a.href = txtUrl;
        a.download = file_name;
        a.click();
        URL.revokeObjectURL(a.href)
        a.remove();
    }
}
