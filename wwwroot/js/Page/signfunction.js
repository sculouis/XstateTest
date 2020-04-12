var _step = 0;
var _straight = true;
var _returnData = [];
var _syscode = "";

/*====[初始化]====*/
window.onload = function () {
    setTimeout(function () {    //因為目標元件尚未載入完成，故設定setTimeout，已確保[簽名版]載入完成
        InitSign();                 //初始化_元件
    }, 300);
};
//初始化_元件事件
function InitSign() {
    var canvas = document.getElementById("canvas");
    var signaturePad = new SignaturePad(canvas);
    _step = 0;              /*設定[步驟標記]*/
    resizeCanvas(canvas);   /*設定[簽名版]*/
    chkStraight();          /*檢查_直式還是橫式*/
    //視窗大小異動時_處理
    $(window).bind('resize', function () {
        resizeCanvas(canvas);     //設定_[簽名版]
        chkStraight();      //檢查_直式還是橫式
    });
    //按鈕_[橡皮擦]
    $('#btnClear').on("click", function (event) {
        signaturePad.clear();   //清空簽名區塊
        setWatermark(canvas);      //設定_浮水印
    });
    //按鈕_[下一步]
    $('#btnNextSign').on("click", function (event) {
        if (signaturePad.isEmpty()) {
            alert("您尚未簽名!!");
        } else {
            InitSign.signData[_step]["BASE64TEXT"] = signaturePad.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
            _step += 1;
            resizeCanvas(canvas);     //設定_[簽名版]
        };
    });
    //按鈕_[確定]
    $('#btnSavePNG').on("click", function (event) {
        if (signaturePad.isEmpty()) {
            alert("您尚未簽名!!");
        } else {
            InitSign.signData[_step]["BASE64TEXT"] = signaturePad.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
            resizeCanvas(canvas);     //設定_[簽名版]
            parent.postMessage(InitSign.inputData, '*');  //回覆父層
        };
    });
};
InitSign.syscode = "";      /*系統別*/
InitSign.inputData = [];    /*匯入資料*/
InitSign.signData = [];     /*簽名資料*/
//接收監聽事件
window.onmessage = function (e) {
    //還原預設值
    _step = 0;                  /*步驟標記*/
    InitSign.inputData = [];    /*匯入資料*/
    InitSign.signData = [];     /*簽名資料*/
    _straight = true;
    //資料解析
    if (e.data.length > 0) {
        var data = e.data[0];
        InitSign.inputData = [data];
        var syscode = getObjToVal(data["SysCode"]);         //使用[系統別]
        var canvas = document.getElementById("canvas");     //[簽名區]
        switch (syscode) {
            case "QuotationQuerySign":      //車險報價查詢
                setWatermarkStr(getObjToVal(data["WateMark1"]), getObjToVal(data["WateMark2"]));    //設定浮水印
                InitSign.signData = data["SignData"];   //設定_[簽名內容]
                setTimeout(function () {    //因為目標元件尚未載入完成，故設定setTimeout，已確保[簽名版]載入完成
                    resizeCanvas(canvas);           //設定_[簽名版]
                }, 300);
                break;
            default:
                break;
        };

    }
};

/******自訂函式_Start**********************************/
//設定_[簽名版](寬高)
function resizeCanvas(canvas) {
    //console.log("_signData" + _signData);
    var step = _step;
    var btnNextSign = $('#btnNextSign');
    var btnSavePNG = $('#btnSavePNG');
    var description = $('.description');
    if (InitSign.signData.length > 1 && step > -1 && step < InitSign.signData.length - 1) {
        btnNextSign.attr('style', 'display:');        //開啟[下一步]
        btnSavePNG.attr('style', 'display:none');     //關閉[確定]
        description.text(getObjToVal(InitSign.signData[step].PROMPT));
    } else if (InitSign.signData.length - 1 == step) {
        btnNextSign.attr('style', 'display:none');    //關閉[下一步]
        btnSavePNG.attr('style', 'display:');         //開啟[確定]
        description.text(getObjToVal(InitSign.signData[step].PROMPT));
    } else {
        description.text("請XXX於框線內簽名");
    }
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    setWatermark(canvas);      //設定_浮水印
};
//設定_浮水印
function setWatermark(canvas) {
    var ctx = canvas.getContext("2d");     // get 2D context of canvas
    ctx.textBaseline = "button";            // start with drawing text from top
    ctx.font = "16px Times New Roman";      // set a font and size
    ctx.fillStyle = "#C3C3C3";              // set a color for the text
    ctx.fillText(setWatermark.Mark1, 20, canvas.offsetHeight - 58);
    ctx.fillText(setWatermark.Mark2, 20, canvas.offsetHeight - 33);
    ctx.fillText("簽名時間:" + datetimenow(), 20, canvas.offsetHeight - 10);       // draw the text at some position (x, y)
};
setWatermark.Mark1 = "";   //浮水印1([系統名稱] ex:[和泰產險行動投保專用])
setWatermark.Mark2 = "";   //浮水印2([編號] ex:[訂單編號:W0000200])
//setWatermark.Mark3 = "";   //浮水印3([時間戳記] ex:[簽名時間:2019/5/17下午2:31:33])
//設定_浮水印內容
function setWatermarkStr(mark1, mark2, mark3) {
    mark1 = getObjToVal(mark1);
    mark2 = getObjToVal(mark2);
    //mark3 = getObjToVal(mark3);
    //mark3 = (mark3 === "") ? "簽名時間:" + datetimenow() : mark3;
    setWatermark.Mark1 = mark1;   //浮水印1([系統名稱] ex:[和泰產險行動投保專用])
    setWatermark.Mark2 = mark2;   //浮水印2([編號] ex:[訂單編號:W0000200])
    //setWatermark.Mark3 = mark3;   //浮水印3([時間戳記] ex:[簽名時間:2019/5/17下午2:31:33])
};
//簽名時間("2019/5/17下午2:31:33")
function datetimenow() {
    //modified by ericchen 20181028
    var d = new Date();
    //var month = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    //var date = d.getDate() + " " + month[d.getMonth()] + ", " +  d.getFullYear();
    var _mon = d.getMonth() + 1;
    var date = d.getFullYear() + "/" + _mon + "/" + d.getDate();
    var time = d.toLocaleTimeString().toLowerCase();
    return (date + " " + time);
};
//檢查_直式還是橫式
function chkStraight() {
    if (!DetectMoible()) { return; }        //是否為手機
    if (!$('#divSignaturePad').is(":visible")) { return; }  //是否[簽名版]已開啟
    var ori = window.orientation;
    console.log(ori);
    if (_straight === true) {
        if (ori === 0) { alert("請改用橫式!!"); }
    } else {
        if (ori === 90) { alert("請改用直式!!"); }
    }
};
//檢查_是否為手機
function DetectMoible() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
};
/*處理_讀取物件text,value值([Obj]:物件名稱,[type]:讀取型態)*/
function getObjToVal(Obj, type) {
    if (typeof (Obj) == "undefined" || Obj == null) {
        return "";
    } else {
        if (type == "text") {
            return Obj.text;
        } else if (type == "value") {
            return Obj.value;
        } else {
            return Obj;
        }
    }
};
/******自訂函式_End************************************/