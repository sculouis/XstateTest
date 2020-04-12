window.onload = function () {
    Init();
};
var confirm;
var flag = true;
var agentObjArray = [];
function Init() {
    BlockUI("載入中...");
    //隱藏
    $(".divIPA").hide();
    $(".divPHS").hide();

    //註冊日曆功能
    RegFormDate();

    //建立經手人物件
    CreateObjArray();
    //選擇經手人 代入出單(入帳)單位
    $("#selAgntNum").SetKeyinFunction({
        waitTime: 500,
        loadingText: '搜尋中...',
        func: function (e, select, title) {
            $(select).append(CreateSelectAgntOptions(e.val().toUpperCase()));
            $(select).selectpicker('refresh');
            title.html("請輸入關鍵字");
        }
    });
    //經手人改變查詢經手人
    $("#selAgntNum").on("change", function () {
        if (NotNullAndEmpty($(this).val())) {
            var unitSelect = $("#selIssuingUnit");
            unitSelect.empty().append($('<option value="">請選擇</option>'));
            unitSelect.selectpicker('refresh');
            BlockUI("查詢單位中...");
            //取得經手人單位
            $.ajax({
                type: 'post',
                url: '/PaAdvPay/GetIssuingUnit',
                data: {
                    'agntNum': $(this).val()
                },
                dataType:'json',
                success: function (data) {
                    console.log(data);
                    if (data.IsSuccess) {
                        // 建立出單單位option
                        var html = '';
                        $.each(data.Unit, function (idx,unit) {
                            html = html + '<option value="' + unit + '">' + unit + '</option>';
                        });
                        unitSelect.append(html);
                        unitSelect.selectpicker('refresh');
                        var selectedIndex = data.Unit.length>1?0:1;
                        var selectedOption = unitSelect.find("option")[selectedIndex];
                        unitSelect.val($(selectedOption).val());
                        unitSelect.selectpicker('render');
                    } else {
                        MsgBox("提示", "請洽核保建立PA Table經手人出單單位。", "red");
                    }
                },
                error: AjaxError,
                complete: function () {
                    setTimeout(function () {
                        $.unblockUI();
                    }, 1000);
                }
            });
        }
    });

    //選擇險別 只有IPA才會顯示職業類別
    $("#selStcc").on("change", function () {
        $("#selPolicyType,#selOccupationalCategory").val('');
        $("#selPolicyType,#selOccupationalCategory").selectpicker('render');
        switch ($(this).val()) {
            case 'IPA':
                $(".divIPA").show();
                $(".divPHS").hide();
                SetAgeAndGetProjectName($("#iptZcBirthday").val());
                break;
            case 'PHS':
                $(".divPHS").show();
                $(".divIPA").hide();
                $("#iptInsuredAmount").val("");
                SetAgeAndGetProjectName($("#iptZcBirthday").val());
                break;
            default:
                $(".divPHS").hide();
                $(".divIPA").hide();
                break;
        }
        ChangeProjectNameOptions();
    });

    //被保險人身份證字號輸入完成 查詢專案
    $("#iptZcID_Add").on("change", function () {
        ChangeProjectNameOptions();
    });

    //選擇保險生效日 計算保險中止日
    $("#iptEffectiveDate").on("change", function () {
        var strDate = FormatDateString($(this).val());
        $("#iptTerminationDate").val(AddYears(strDate, 1));
    });

    //選取生日後計算保險年齡
    $("#iptZcBirthday").on("change", function (e) {
        SetAgeAndGetProjectName($(this).val());
        $(this).data("original", $(this).val());
    });
    //輸入生日後計算保險年齡
    $("#iptZcBirthday").on("blur", function () {
        if ($(this).data("original") != $(this).val()) {
            SetAgeAndGetProjectName($(this).val());
        }
    });

    //避免輸入非數字
    $("#iptInsuredAmount").on("keyup", function (e) {
        console.log("keyup");
        var keyCode = e.keyCode;
        if ((keyCode < 48 || (keyCode > 57 && keyCode < 96) || keyCode > 105)) {
            $(this).val($(this).val().replace(e.key, "").replace(e.key.toUpperCase(), ""));
        } else {
            //保額改變時，重新取得適用專案
            if (flag) {
                flag = false;
                setTimeout(function () {
                    console.log("setTimeout");
                    ChangeProjectNameOptions();
                    flag = true;
                }, 500);
            }
        }
    });

    //經手人、職業類別改變時，重新取得適用專案
    $("#selAgntNum,#selOccupationalCategory,#selPolicyType").on("change", function () {
        ChangeProjectNameOptions();
    });

    //選擇專案 帶入保費
    $("#selProjectName").on("change", function () {
        console.log($(this).data("premium"));
        $("#iptInsurancePremiumt").val($(this).find("option:selected").data("premium"));
    });

    //新增按鍵
    $("#btnAddPA").on("click", function (e) {
        //檢核
        if (IsValide()) {
            if (NotNullAndEmpty($("#iptNo_Add").val())) {
                MsgBox("提示", "請先清除資料，再新增下一筆!", "red");
                return;
            }
            BlockUI("產生檔案中...");
            //取得連續編號
            $.ajax({
                type: 'get',
                url: '/PaAdvPay/GetNumber',
                success: function (data) {
                    $("#iptNo_Add").val(data);
                    $("#hiddenProjectName").val($("#selProjectName").find("option:selected").text());
                    $("#downloadIframe").attr("src", "/PaAdvPay/DownloadFile");
                    $("#formMain").submit();
                    confirm = MsgBox("下載訊息", "檔案下載中...", "green");
                    DisabledAllSelectAndInput(true);
                },
                error: AjaxError,
                complete: function () {
                    setTimeout(function () {
                        $.unblockUI();
                    }, 1000);
                }
            });
        }
    });

    //清除按鍵
    $("#btnResetPA").on("click", function () {
        DisabledAllSelectAndInput(false);
        $(".selectpicker").val("");
        $(".selectpicker").selectpicker('render');
        $("#selAgntNum,#selProjectName,#selIssuingUnit").empty().append($('<option value="">請選擇</option>'));
        $("#selAgntNum,#selProjectName,#selIssuingUnit").selectpicker('refresh');
        $(".divIPA").hide();
        $(".divPHS").hide();
        $("#iptZcBirthday").data("original", "");
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

    //刪除作業 搜尋
    $("#btnSearchPA").on("click", function () {
        var id = $("#iptZcID_Del").val();
        //檢核ID輸入規則
        if (checkID(id)) {
            BlockUI("資料查詢中...");
            $(".newItem").remove();
            //搜尋資料
            $.ajax({
                type: 'post',
                url: '/PaAdvPay/QueryPA',
                data: { "id": $("#iptZcID_Del").val() },
                dataType: 'json',
                success: function (datas) {
                    if (datas.length > 0) {
                        var template = $("#panel-template");
                        $.each(datas, function (idx, data) {
                            var newItem = template.clone();
                            newItem.removeAttr("id").addClass("newItem");
                            newItem.find(".iptNo_Del").val(data.Number);
                            newItem.find(".iptZcName_Del").val(data.ZcName);
                            newItem.find(".iptPACreateDate").val(data.PTRNEFF);
                            newItem.find(".btnDeletePA").attr("data-no", data.Number).prop("disabled", !data.STATFLAG);
                            $("#divDelete").append(newItem);
                        });
                        $("#div-nodata").hide();
                    } else {
                        $("#div-nodata").show();
                    }
                },
                error: AjaxError,
                complete: function () {
                    setTimeout(function () {
                        $.unblockUI();
                    }, 1000);
                }
            });
        } else {
            ShowMsgInElm("#iptZcID_Del", '輸入規則有誤');
        }
    });

    //刪除作業 作廢
    $("#divDelete").on("click", ".btnDeletePA", function () {
        var element = $(this);
        var number = element.data("no");
        // 確認作廢
        ConfirmBox('確認作廢?', '是否作廢預收保費證明(' + number + ')?', 'orange', function () {
            BlockUI("作廢中...");
            //搜尋資料
            $.ajax({
                type: 'post',
                url: '/PaAdvPay/DeletePA',
                data: { "number": number },
                dataType: 'json',
                success: function (data) {
                    element.prop("disabled", true);
                },
                error: AjaxError,
                complete: function () {
                    setTimeout(function () {
                        $.unblockUI();
                    }, 1000);
                }
            });
        });
    });

    //轉大寫
    $(".upperCase").change(function () {
        $(this).val($(this).val().toUpperCase());
    });

    //開啟下拉隱藏Tooltip
    $(".selectpicker").on("show.bs.select", function () {
        $(this).tooltip('hide');
    });

    $.unblockUI();
}

//組裝物件
function CreateObjArray() {
    agentObjArray = $("#hiddenAgentCode").val().split(',');
}

//建立經手人代號選單
function CreateSelectAgntOptions(value) {
    var options = '';
    if (NotNullAndEmpty(value)) {
        var agentCodeList = agentObjArray.filter(function (item, index, array) {
            return item.indexOf(value) > -1;
        });

        $.each(agentCodeList, function (idx, agent) {
            options += "<option value=" + agent + ">" + agent + "</option>";
        });
    }
    return options;
}

//變更專案選單
function ChangeProjectNameOptions() {
    //清空選單
    $("#selProjectName").empty().append($('<option value="">請選擇</option>'));
    $("#selProjectName").selectpicker('refresh');
    //清空保費
    $("#iptInsurancePremiumt").val('');
    switch ($("#selStcc").val()) {
        case "IPA":
            CreateIPAProjectNameOptions();
            break;
        case "PHS":
            CreatePHSProjectNameOptions();
            break;
    }
}
//建立IPA選單
function CreateIPAProjectNameOptions() {
    var stccValue = $("#selStcc").val();
    var agntNumValue = $("#selAgntNum").val();
    var jobLevelValue = $("#selOccupationalCategory").val();
    var ageValue = $("#iptZcAge").val();
    var amountValue = $("#iptInsuredAmount").val();
    //皆有值才取得專案
    if (NotNullAndEmpty(stccValue) && NotNullAndEmpty(agntNumValue) && NotNullAndEmpty(jobLevelValue) && NotNullAndEmpty(ageValue) && NotNullAndEmpty(amountValue)) {
        //避免被保險人生日不合法
        if (new Date() < new Date($("#iptZcBirthday").val())) {
            ShowMsgInElm("#iptZcBirthday", '被保險人生日不可大於今天');
            $("#iptZcAge").val('');
            return;
        }
        CreateSelectProjectNameOptions(stccValue, agntNumValue, jobLevelValue, ageValue, amountValue, "","");
    }
}
//建立PHS選單
function CreatePHSProjectNameOptions() {
    var stccValue = $("#selStcc").val();
    var agntNumValue = $("#selAgntNum").val();
    var ageValue = $("#iptZcAge").val();
    var policyTypeValue = $("#selPolicyType").val();
    var sexValue = GetSex();
    //皆有值才取得專案
    if (NotNullAndEmpty(stccValue) && NotNullAndEmpty(agntNumValue) && NotNullAndEmpty(ageValue) && NotNullAndEmpty(sexValue) && NotNullAndEmpty(policyTypeValue)) {
        //避免被保險人生日不合法
        if (new Date() < new Date($("#iptZcBirthday").val())) {
            ShowMsgInElm("#iptZcBirthday", '被保險人生日不可大於今天');
            $("#iptZcAge").val('');
            return;
        }
        CreateSelectProjectNameOptions(stccValue, agntNumValue, "", ageValue, "", sexValue, policyTypeValue);
    }
}
//建立專案選單
function CreateSelectProjectNameOptions(stccValue, agntNumValue, jobLevelValue, ageValue, amountValue, sexValue, policyTypeValue) {
    BlockUI("取得專案中...");
    $.ajax({
        type: 'post',
        url: '/PaAdvPay/GetProjectNames',
        data: {
            'Stcc': stccValue,
            'AgentNumber': agntNumValue,
            'JobLevel': jobLevelValue,
            'Age': ageValue,
            'Amount': amountValue,
            'Sex': sexValue,
            'PolicyType': policyTypeValue
        },
        dataType: 'json',
        success: function (datas) {
            var options = '';
            $.each(datas, function (idx, data) {
                options += "<option value=" + data.code + " data-premium=" + Comma(data.Premium, true) + ">" + data.code + ' - ' + data.PackageName + "</option>";
            });
            $("#selProjectName").append($(options));
            $("#selProjectName").selectpicker('refresh');
            if (datas == null || datas.length == 0) {
                MsgBox('專案訊息', '查無符合專案，請更改條件。', 'red');
            }
        },
        error: AjaxError,
        complete: function () {
            setTimeout(function () {
                $.unblockUI();
            }, 1000);
        }
    });
}

//更改生日計算年齡並取得專案
function SetAgeAndGetProjectName(value) {
    var strDate = FormatDateString(value);
    var age = GetIssueAge(strDate);
    $("#iptZcAge").val(age);
    ChangeProjectNameOptions();
}

//計算年齡
function GetIssueAge(birthday) {
    var yearOld = '';
    if (birthday.indexOf("/") != -1) {
        var now = new Date();
        var date = new Date(birthday);
        //IPA: 剛出生0歲，之後生日即加1歲
        //IPA計算規則，新增80歲以上才適用的規則。
        //如年齡計算為80歲又1天，自動加一歲為81歲
        //如年齡計算為81歲又1天，自動加一歲為82歲
        //PHS: 剛出生0歲，超過六個月即加1歲
        switch ($("#selStcc").val()) {
            case "IPA":
                var year = now.getFullYear() - date.getFullYear();
                var month = now.getMonth() - date.getMonth();
                var day = now.getDate() - date.getDate();

                month = day < 0 ? month - 1 : month;
                year = month < 0 ? year - 1 : year;

                yearOld = (year >= 80) && day > 0 ? year + 1 : year;

                //var addYear = (now.getFullYear() > date.getFullYear())
                //    && ((now.getMonth() > date.getMonth()) || ((now.getMonth() == date.getMonth()) && (now.getDate() >= date.getDate()))) ? 1 : 0;
                //yearOld = now.getFullYear() - date.getFullYear() + addYear - 1;
                break;
            case "PHS":
                var month = (now.getMonth() + 1) - (date.getMonth() + 1) - (now.getDate() < date.getDate() ? 1 : 0);
                var newMonth = month < 1 ? month + 12 : month;
                yearOld = now.getFullYear() - date.getFullYear() - (month < 1 ? 1 : 0) + (newMonth > 5 ? 1 : 0);
                break;
        }
    }
    return (yearOld<0)? 0 : yearOld;
}

//判斷非空值與NULL
function NotNullAndEmpty(value) {
    return value != null && value != '';
}

//格式化日期 民國年月日(7碼)&西元年月日(8碼) 轉 yyyy/MM/dd
function FormatDateString(strDate) {
    if (strDate.indexOf("/") == -1) {
        if (strDate.length == 7) {
            strDate = parseInt(strDate.substring(0, 3)) + 1911 + "/" + strDate.substring(3, 5) + "/" + strDate.substring(5, 7);
        }
        else if (strDate.length == 8) {
            strDate = strDate.substring(0, 4) + "/" + strDate.substring(4, 6) + "/" + strDate.substring(6, 8);
        }
    }
    return strDate;
}

//檢核
function IsValide() {
    var result = true;
    //檢核必填
    result = ValidateDiv("formMain");
    //檢核ID
    var id = $("#iptZcID_Add").val();
    if (!checkID(id)) {
        result = false;
        ShowMsgInElm("#iptZcID_Add", '輸入規則有誤');
    }
    //檢核生效日
    if (GetToday() > new Date($("#iptEffectiveDate").val())) {
        result = false;
        ShowMsgInElm("#iptEffectiveDate", '生效日需大於、等於今天');
    }
    //檢核被保人生日
    if (GetToday() < new Date($("#iptZcBirthday").val())) {
        result = false;
        ShowMsgInElm("#iptZcBirthday", '被保險人生日不可大於今天');
        $("#iptZcAge").val('');
    }
    switch ($("#selStcc").val()) {
        case "IPA":
            var amount = $("#iptInsuredAmount").val();
            if (!NotNullAndEmpty(amount)||amount<0){
                result = false;
                ShowMsgInElm("#iptInsuredAmount", '必填欄位');
            }
            break;
        case "PHS":
            break;
    }
    return result;
}
//取得被保人性別 1:男 2女
function GetSex() {
    var id = $("#iptZcID_Add").val();
    var result = id.length === 10 ? id[1] : null;
    return result;
}
//控制是否可輸入
function DisabledAllSelectAndInput(bool) {
    $(".selectpicker").prop("disabled", bool);
    $(".iptDisabled").prop("disabled", bool);
}

//取得今天(不含時間)
function GetToday() {
    var today = new Date();
    var todayString = [today.getFullYear(),
                        padLeft(today.getMonth() + 1, 2),
                        padLeft(today.getDate(), 2)].join('/');
    return new Date(todayString);
}
