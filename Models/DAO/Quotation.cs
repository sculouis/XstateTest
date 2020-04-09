using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class DAO_Quotation
{
    #region 報價單
    #region [MQStrProfile]組成MQ的參數表
    /// <summary>
    /// 組成MQ的參數表
    /// </summary>
    public class MQStrProfile
    {
        [DisplayName("作業ID")]
        public string PROD_ID { get; set; }
        [DisplayName("欄位名稱")]
        public string COLUM_NAME { get; set; }
        [DisplayName("欄位說明")]
        public string COLUM_DESC { get; set; }
        [DisplayName("欄位長度")]
        public string COLUM_LEN { get; set; }
        [DisplayName("欄位預設內容")]
        public string COLUM_DEFAULT { get; set; }
        [DisplayName("補位位置(L:置左,R:置右)")]
        public string COLUM_REPPLACE { get; set; }
        [DisplayName("補位內容(0或空白)")]
        public string COLUM_REPDEF { get; set; }
        [DisplayName("欄位順序")]
        public string COLUM_ORDER { get; set; }
        [DisplayName("是否啟用")]
        public string IsValid { get; set; }

        [DisplayName("內容")]
        public string MQValue { get; set; }
    }
    #endregion

    #region [wsMOTInfo][取級數]參數
    /// <summary>
    /// [取級數]參數
    /// </summary>
    public class wsMOTInfo
    {
        [DisplayName("查詢種類")]
        public string modeCode { get; set; }

        [DisplayName("Client查詢序號")]
        public string ClientQueryNo { get; set; }

        [DisplayName("自然人別")]
        public string CustType { get; set; }

        [DisplayName("查詢類別")]
        public string QueryType { get; set; }

        [DisplayName("身分證號碼")]
        public string CustID { get; set; }

        [DisplayName("出生年")]
        public string BirthYear { get; set; }

        [DisplayName("出生月")]
        public string BirthMonth { get; set; }

        [DisplayName("出生日")]
        public string BirthDay { get; set; }

        [DisplayName("性別")]
        public string Sex { get; set; }

        [DisplayName("牌照")]
        public string LicenseNo { get; set; }

        [DisplayName("車種")]
        public string CarType { get; set; }

        [DisplayName("乘載數量")]
        public string Load { get; set; }

        [DisplayName("承載單位")]
        public string LoadType { get; set; }

        [DisplayName("保險起保年")]
        public string InsuredFromYear { get; set; }

        [DisplayName("保險起保月")]
        public string InsuredFromMonth { get; set; }

        [DisplayName("保險起保日")]
        public string InsuredFromDay { get; set; }

        [DisplayName("彙總類別")]
        public string Category { get; set; }

        [DisplayName("Client System ID")]
        public string ClientSystemID { get; set; }

        [DisplayName("Client Key Value")]
        public string ClientKeyValue { get; set; }

        [DisplayName("Client Request IP")]
        public string ClientRequestIP { get; set; }

        [DisplayName("Client Time")]
        public string ClientTime { get; set; }

        [DisplayName("程式代碼")]
        public string ProgCode { get; set; }
    }
    #endregion

    #region [reswsMOTInfo][取級數]回傳參數
    /// <summary>
    /// [取級數]回傳參數
    /// </summary>
    public class reswsMOTInfo
    {
        public string ContentEncoding { get; set; }
        public string ContentType { get; set; }
        public reswsMOTInfoData Data { get; set; }
        public string JsonRequestBehavior { get; set; }
        public string MaxJsonLength { get; set; }
        public string RecursionLimit { get; set; }
    }
    #endregion

    #region [reswsMOTInfoData][取級數]回傳參數Data
    /// <summary>
    /// [取級數]回傳參數Data
    /// </summary>
    public class reswsMOTInfoData
    {
        public string ForceInsurEDTo { get; set; }
        public string QuyTIITime { get; set; }
        public string SysMsg { get; set; }
        public string ForceMsgCode { get; set; }
        public string ForceMsg { get; set; }
        public string ForceSerialNo { get; set; }
        public string ForceLevel { get; set; }
        public string DrunkFreq { get; set; }
        public string AnyMsgCode { get; set; }
        public string AnyMsg { get; set; }
        public string AnySerialNo { get; set; }
        public string NewLevel { get; set; }
        public string OldLevel { get; set; }
        public string Alcohol { get; set; }
        public string DutyFactor { get; set; }
        public string BodyFactor { get; set; }
        public string TaxiDutyFactor { get; set; }
        public string ThirdInsd { get; set; }
        public string MCPInsured { get; set; }
        public string MCPClaims { get; set; }
        public string MVPInsured { get; set; }
        public string MVPClaims { get; set; }
    }
    #endregion

    #region [V_QUOTATIONViewModel]報價單資料表
    /// <summary>
    /// 報價單資料表
    /// </summary>
    public class V_QUOTATIONViewModel
    {
        [DisplayName("報價單號碼")]
        public string QUOTENO { get; set; }

        [DisplayName("簡易報價單編號")]
        public string CESSIONO { get; set; }

        [DisplayName("報價日期")]
        public string QUOTEDATE { get; set; }

        [DisplayName("經手人代號")]
        public string AGNTNUM { get; set; }

        [DisplayName("車種")]
        public string MVPZMTYPE { get; set; }

        [DisplayName("被保人出生年月日")]
        public string CLTDOB { get; set; }

        [DisplayName("被保人性別")]
        public string CLTSEX { get; set; }

        [DisplayName("乘載人數")]
        public string ZCARRY { get; set; }

        [DisplayName("被保險人")]
        public string ZCNAME { get; set; }

        [DisplayName("被保人身分證字號")]
        public string MEMBSEL { get; set; }

        [DisplayName("廠牌")]
        public string ZMAKE { get; set; }

        [DisplayName("CC數")]
        public string ZCC { get; set; }

        [DisplayName("出廠年")]
        public string YRMANF { get; set; }

        [DisplayName("發照日期")]
        public string GETDATE { get; set; }

        [DisplayName("折舊率")]
        public string ZDEPCODE { get; set; }

        [DisplayName("牌照")]
        public string ZREGNUM { get; set; }



    }
    #endregion

    #region [Quot]報價單資料表
    /// <summary>
    /// [Quot](報價單資料表)
    /// </summary>
    public class Quot
    {
        [DisplayName("報價單編號")]
        public string QuotNo { get; set; }

        [DisplayName("400報價單號碼")]
        public string QuotNo_400 { get; set; }

        [DisplayName("單位別")]
        public string BranchNo { get; set; }

        [DisplayName("報價單日期")]
        public string QuotDate { get; set; }

        [DisplayName("經手人代號")]
        public string AgentNo { get; set; }

        [DisplayName("經手人類別")]
        public string AgentType { get; set; }

        [DisplayName("經手人名稱")]
        public string AgentName { get; set; }

        [DisplayName("經手人業務員名稱")]
        public string AgentSalesName { get; set; }

        [DisplayName("編號(壽通)")]
        public string LifeNo { get; set; }

        [DisplayName("業務員登錄字號")]
        public string SalesmanRegNo { get; set; }

        [DisplayName("通路別1")]
        public string CHL1 { get; set; }

        [DisplayName("通路別2")]
        public string CHL2 { get; set; }

        [DisplayName("付款方式")]
        public string Payway { get; set; }

        [DisplayName("繳別")]
        public string Paytype { get; set; }

        [DisplayName("編號(大保單號碼/安麗直銷商)")]
        public string AmwayNo { get; set; }

        [DisplayName("編號(收費單列印方式)")]
        public string PrnWayNo { get; set; }

        [DisplayName("要保人ID")]
        public string ProposerID { get; set; }

        [DisplayName("要保人客戶代號")]
        public string APL_CLNTNUM { get; set; }

        [DisplayName("與被保險人關係")]
        public string ToInsuredRelation { get; set; }

        [DisplayName("被保險人ID")]
        public string InsuredID { get; set; }

        [DisplayName("被保險人客戶代號")]
        public string CTL_CLNTNUM { get; set; }

        [DisplayName("是否需電子保單")]
        public string NeedEPolicy { get; set; }

        [DisplayName("附加被保險人")]
        public string AddInsured { get; set; }

        [DisplayName("抵押權人")]
        public string Mortgage { get; set; }

        [DisplayName("廠型")]
        public string CarTypeNo { get; set; }

        [DisplayName("製造年")]
        public string MakeYear { get; set; }

        [DisplayName("重置價格")]
        public string CarPrice { get; set; }

        [DisplayName("牌照")]
        public string LicenseNo { get; set; }

        [DisplayName("乘載(人/噸)")]
        public string Load { get; set; }

        [DisplayName("排氣量")]
        public string Displacement { get; set; }

        [DisplayName("發照年月")]
        public string IssueYear { get; set; }

        [DisplayName("引擎號碼")]
        public string EngineNo { get; set; }

        [DisplayName("記錄")]
        public string Record { get; set; }

        [DisplayName("強制起保日")]
        public string ForceInsuredFrom { get; set; }

        [DisplayName("強制迄止日")]
        public string ForceInsuredTo { get; set; }

        [DisplayName("強制車種")]
        public string ForceCarType { get; set; }

        [DisplayName("強制等級")]
        public string ForceLevel { get; set; }

        [DisplayName("強制保費")]
        public string ForceInsurance { get; set; }

        [DisplayName("強制優惠")]
        public string ForceOffer { get; set; }

        [DisplayName("獎金代號")]
        public string ForceBonusCode { get; set; }

        [DisplayName("酒駕次數")]
        public string DrunkFreq { get; set; }

        [DisplayName("酒駕金額")]
        public string DrunkAmt { get; set; }

        [DisplayName("強制序號")]
        public string ForceSerialNo { get; set; }

        [DisplayName("任意起保日")]
        public string AnyInsuredFrom { get; set; }

        [DisplayName("任意迄止日")]
        public string AnyInsuredTo { get; set; }

        [DisplayName("任意車種")]
        public string AnyCarType { get; set; }

        [DisplayName("佣金")]
        public string AnyBonusCode { get; set; }

        [DisplayName("體係")]
        public string BodyFactor { get; set; }

        [DisplayName("責係")]
        public string DutyFactor { get; set; }

        [DisplayName("任意序號")]
        public string AnySerialNo { get; set; }

        [DisplayName("計算")]
        public string CalCode { get; set; }

        [DisplayName("車商代碼(經銷商)")]
        public string VendorNo { get; set; }

        [DisplayName("車商代碼(經銷商業務員編號)")]
        public string VendorSalesNo { get; set; }

        [DisplayName("保單別")]
        public string QuotType { get; set; }

        [DisplayName("活動代碼")]
        public string ProgramCode { get; set; }

        [DisplayName("折舊率")]
        public string DepRate { get; set; }

        [DisplayName("總保費")]
        public string TotalInsurance { get; set; }

        [DisplayName("年齡係數")]
        public string AgeFactor { get; set; }

        [DisplayName("是否確定報價")]
        public string IsConfirm { get; set; }

        [DisplayName("核保狀態")]
        public string VerifyStatus { get; set; }

        [DisplayName("查詢保發資料時間")]
        public string QuyTIITime { get; set; }

        [DisplayName("計程車責係")]
        public string TaxiDutyFactor { get; set; }

        [DisplayName("新等級")]
        public string NewLevel { get; set; }

        [DisplayName("原等級")]
        public string OldLevel { get; set; }

        [DisplayName("第三人有無承保")]
        public string ThirdInsd { get; set; }

        [DisplayName("酗酒加費係數")]
        public string IncFactor { get; set; }

        [DisplayName("保單號碼")]
        public string PolicyNo { get; set; }

        [DisplayName("舊保險證號")]
        public string ForceNo { get; set; }

        [DisplayName("強制險承保記錄")]
        public string MCPInsured { get; set; }

        [DisplayName("強制險理賠記錄")]
        public string MCPClaims { get; set; }

        [DisplayName("任意險承保記錄")]
        public string MVPInsured { get; set; }

        [DisplayName("任意險理賠記錄")]
        public string MVPClaims { get; set; }

        [DisplayName("是否刪除")]
        public string IsDel { get; set; }

        [DisplayName("是否有效")]
        public string IsValid { get; set; }

        [DisplayName("創建者")]
        public string Creator { get; set; }

        [DisplayName("創建日期")]
        public string CreateDate { get; set; }

        [DisplayName("創建程式")]
        public string CreatePro { get; set; }

        [DisplayName("異動者")]
        public string Shifter { get; set; }

        [DisplayName("異動日期")]
        public string ShiftDate { get; set; }

        [DisplayName("異動程式")]
        public string ShiftPro { get; set; }

        [DisplayName("電子式保險證")]
        public string IsEMail { get; set; }

        [DisplayName("服務代碼/業務代號")]
        public string SalesNo { get; set; }

        [DisplayName("服務人員")]
        public string GenareaNM { get; set; }

        [DisplayName("服務電話")]
        public string AgentTEL { get; set; }

        [DisplayName("服務傳真")]
        public string AgentFAX { get; set; }

        [DisplayName("服務EMail")]
        public string ServiceMail { get; set; }

        [DisplayName("收費員ID")]
        public string TollClterID { get; set; }

        [DisplayName("收費員代號")]
        public string TollClterNo { get; set; }

        [DisplayName("收費員名稱")]
        public string TollClterName { get; set; }

        [DisplayName("收費員登錄證號")]
        public string TollClterRegNo { get; set; }

        [DisplayName("專案代號")]
        public string ProjectNo { get; set; }
        [DisplayName("核保人員EMail")]
        public string ZautclsMail { get; set; }
        [DisplayName("登入者名稱/報價人員")]
        public string UserName { get; set; }
        [DisplayName("車體/竊盜保額")]
        public string DTCSUM { get; set; }
    }
    #endregion

    #region [QuotBenefitPeople]報價單受益人資料表
    /// <summary>
    /// [QuotBenefitPeople](報價單受益人資料表)
    /// </summary>
    public class QuotBenefitPeople
    {
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("險種")]
        public string InsureType { get; set; }
        [DisplayName("列名駕駛人ID")]
        public string ListDriverID { get; set; }
        [DisplayName("列名駕駛人姓名")]
        public string ListDriverName { get; set; }
        [DisplayName("列名駕駛人生日")]
        public string ListDriverBirth { get; set; }
        [DisplayName("列名駕駛人性別")]
        public string ListDriverSex { get; set; }
        [DisplayName("列名駕駛人電話")]
        public string ListDriverTel { get; set; }
        [DisplayName("列名駕駛人與要保人關係")]
        public string ToProposerRelation { get; set; }
        [DisplayName("受益人是否為法定")]
        public string BenfitIsLegal { get; set; }
        [DisplayName("受益人姓名")]
        public string BenfitName { get; set; }
        [DisplayName("受益人電話")]
        public string BenfitTel { get; set; }
        [DisplayName("受益人地址(縣市別)")]
        public string City { get; set; }
        [DisplayName("受益人地址(區別)")]
        public string Zipcode { get; set; }
        [DisplayName("受益人地址")]
        public string Addr { get; set; }
        [DisplayName("與列名駕駛人關係")]
        public string ToListRelation { get; set; }
        [DisplayName("是否刪除")]
        public string IsDel { get; set; }
        [DisplayName("是否有效")]
        public string IsValid { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
        [DisplayName("異動者")]
        public string Shifter { get; set; }
        [DisplayName("異動日期")]
        public string ShiftDate { get; set; }
        [DisplayName("異動程式")]
        public string ShiftPro { get; set; }

    }
    #endregion

    #region [QuotInsType]報價單險種資料表
    /// <summary>
    /// [QuotInsType]報價單險種資料表
    /// </summary>
    public class QuotInsType
    {
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("險種代號")]
        public string InsureType { get; set; }
        [DisplayName("險種名稱")]
        public string InsureTypeNM { get; set; }        
        [DisplayName("保額一")]
        public string InsureAmt1 { get; set; }
        [DisplayName("保額二")]
        public string InsureAmt2 { get; set; }
        [DisplayName("保額三")]
        public string InsureAmt3 { get; set; }
        [DisplayName("自負額")]
        public string DedItem { get; set; }
        [DisplayName("係數一")]
        public string Factor1 { get; set; }
        [DisplayName("係數二")]
        public string Factor2 { get; set; }
        [DisplayName("保費")]
        public string Insurance { get; set; }
        [DisplayName("是否刪除")]
        public string IsDel { get; set; }
        [DisplayName("是否有效")]
        public string IsValid { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
        [DisplayName("異動者")]
        public string Shifter { get; set; }
        [DisplayName("異動日期")]
        public string ShiftDate { get; set; }
        [DisplayName("異動程式")]
        public string ShiftPro { get; set; }
        [DisplayName("月繳年保費")]
        public string InsMonth { get; set; }
        [DisplayName("險種順序")]
        public string InsOrder { get; set; }
    }
    #endregion

    #region [V_QUOT_gvInsType]報價單險種資料檢視
    /// <summary>
    /// DataTable險種資料檢視
    /// </summary>
    public class V_QUOT_gvInsType
    {
        [DisplayName("險種代號")]
        public string ZCVRTYPE { get; set; }

        [DisplayName("險種代號說明")]
        public string ZCVRTYPENM { get; set; }

        [DisplayName("保額一")]
        public string SUMINA { get; set; }

        [DisplayName("保額二")]
        public string SUMINB { get; set; }

        [DisplayName("保額三")]
        public string SUMINC { get; set; }

        [DisplayName("係數一")]
        public string ZFACTORA { get; set; }

        [DisplayName("係數二")]
        public string ZFACTORB { get; set; }

        [DisplayName("自負額")]
        public string EXCESS { get; set; }

        [DisplayName("保險費")]
        public string MVPPREM { get; set; }

        [DisplayName("是否有受益人資料")]
        public string ISBEN { get; set; }

        [DisplayName("月繳保費")]
        public string InsMonth { get; set; }

        [DisplayName("險種順序")]
        public string InsOrder { get; set; }
    }
    #endregion

    #region [AgreeDriver]約定駕駛人表
    /// <summary>
    /// [AgreeDriver]約定駕駛人表
    /// </summary>
    public class AgreeDriver
    {
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("約定駕駛人1")]
        public string AgreeDriver1 { get; set; }
        [DisplayName("約定駕駛人2")]
        public string AgreeDriver2 { get; set; }
        [DisplayName("約定駕駛人3")]
        public string AgreeDriver3 { get; set; }
        [DisplayName("約定駕駛人4")]
        public string AgreeDriver4 { get; set; }
        [DisplayName("約定駕駛人5")]
        public string AgreeDriver5 { get; set; }
        [DisplayName("是否刪除")]
        public string IsDel { get; set; }
        [DisplayName("是否有效")]
        public string IsValid { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
        [DisplayName("異動者")]
        public string Shifter { get; set; }
        [DisplayName("異動日期")]
        public string ShiftDate { get; set; }
        [DisplayName("異動程式")]
        public string ShiftPro { get; set; }
    }
    #endregion

    #region [CustMaster]客戶資料表
    /// <summary>
    /// [CustMaster]客戶資料表
    /// </summary>
    public class CustMaster
    {
        [DisplayName("客戶ID")]
        public string CustID { get; set; }
        [DisplayName("客戶代號")]
        public string CLNTNUM { get; set; }
        [DisplayName("客戶類別")]
        public string CustType { get; set; }
        [DisplayName("國籍")]
        public string Nation { get; set; }
        [DisplayName("代表人")]
        public string Representative { get; set; }
        [DisplayName("生日")]
        public string Birthday { get; set; }
        [DisplayName("姓名")]
        public string Name { get; set; }
        [DisplayName("性別")]
        public string Sex { get; set; }
        [DisplayName("婚姻")]
        public string Marriage { get; set; }
        [DisplayName("縣市別")]
        public string City { get; set; }
        [DisplayName("區別")]
        public string Zipcode { get; set; }
        [DisplayName("地址")]
        public string Addr { get; set; }
        [DisplayName("e-mail")]
        public string Email { get; set; }
        [DisplayName("公司電話")]
        public string OfficeTel { get; set; }
        [DisplayName("家用電話")]
        public string HomeTel { get; set; }
        [DisplayName("手機號碼")]
        public string CellPhone { get; set; }
        [DisplayName("傳真號碼")]
        public string QuotNo { get; set; }
        [DisplayName("報價單編號")]
        public string AgentNo { get; set; }
        [DisplayName("經手人代號")]
        public string DataType { get; set; }
        [DisplayName("資料類別")]
        public string Fax { get; set; }
        [DisplayName("備註")]
        public string Memo { get; set; }
        [DisplayName("是否刪除")]
        public string IsDel { get; set; }
        [DisplayName("是否有效")]
        public string IsValid { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
        [DisplayName("異動者")]
        public string Shifter { get; set; }
        [DisplayName("異動日期")]
        public string ShiftDate { get; set; }
        [DisplayName("異動程式")]
        public string ShiftPro { get; set; }
    }
    #endregion

    #region [QuotOther]報價單其他係數
    /// <summary>
    /// [QuotOther]報價單其他係數
    /// </summary>
    public class QuotOther
    {
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("400報價單號碼")]
        public string QuotNo400 { get; set; }
        [DisplayName("傷險名冊另起新頁")]
        public string IsNewPage { get; set; }
        [DisplayName("是否要出單")]
        public string IsBilling { get; set; }
        [DisplayName("已簽名")]
        public string Signed { get; set; }
        [DisplayName("進件序號(影像歸檔產出)")]
        public string CaseNumber { get; set; }
        [DisplayName("繳費結果")]
        public string PayResult { get; set; }
        [DisplayName("KYC已填寫")]
        public string KYCFilled { get; set; }
        [DisplayName("合併簽名檔後檢視")]
        public string IsReviewed { get; set; }
        [DisplayName("合併簽名檔後檢視資料")]
        public string Reviewed { get; set; }

        [DisplayName("行動投保同意書")]
        public string AgreeMent { get; set; }
        [DisplayName("個資使用同意")]
        public string ConsentPersonData { get; set; }
        [DisplayName("行動投保完成狀態")]
        public string IsComplete { get; set; }
        [DisplayName("無賠款年度")]
        public string NonClaimYears { get; set; }
        [DisplayName("三年度賠款次數")]
        public string ThreeYearsClaimCount { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
        [DisplayName("異動者")]
        public string Shifter { get; set; }
        [DisplayName("異動日期")]
        public string ShiftDate { get; set; }
        [DisplayName("異動程式")]
        public string ShiftPro { get; set; }
    }
    #endregion

    #region [SDSParam]SDS參數資料
    /// <summary>
    /// SDS參數資料
    /// </summary>
    public class SDSParam
    {
        [DisplayName("經手人")]
        public string agentCodeList { get; set; }

        [DisplayName("經手人單位別")]
        public string branchCodeList { get; set; }

        [DisplayName("經手人ID")]
        public string agentIdList { get; set; }

    }
    #endregion
    #endregion
    #region 列印區專用

    /// <summary>
    /// 列印KYC類型
    /// </summary>
    public enum PrintKYC_Type { General /*一般列印*/, Merge /*合併簽名檔*/}

    /// <summary>
    /// KYC 線上問卷填寫 model
    /// </summary>
    public class QuoteKYC
    {
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("國別-要保人_自然人")]
        public string CntryCodeAP { get; set; }
        [DisplayName("國籍-要保人_自然人")]
        public string NationAP { get; set; }
        [DisplayName("職業- 要保自然人  1: 一般   2 註")]
        public string OcptnAP { get; set; }
        [DisplayName("國別-要保人_法人")]
        public string CntryCodeAC { get; set; }
        [DisplayName("國籍-要保人_法人")]
        public string NationAC { get; set; }
        [DisplayName("要保法人負責人性別  1男;  2:女")]
        public string GndrAC { get; set; }
        [DisplayName("註冊地國別-要保人_法人")]
        public string RgtrCodeAC { get; set; }
        [DisplayName("註冊地國籍-要保人_法人")]
        public string RgtNationAC { get; set; }
        [DisplayName("國別-被保人_自然人")]
        public string CntryCodeCP { get; set; }
        [DisplayName("國籍-被保人_自然人")]
        public string NationCP { get; set; }
        [DisplayName("職業 -被保_自然人   1: 一般   2:註")]
        public string OcptnCP { get; set; }
        [DisplayName("國別-被保人_法人")]
        public string CntryCodeCC { get; set; }
        [DisplayName("國籍-被保人_法人")]
        public string NationCC { get; set; }
        [DisplayName("被保_法人性別  1男;  2:女")]
        public string GndrCC { get; set; }
        [DisplayName("註冊國別-被保人-法人")]
        public string RgtrCodeCC { get; set; }
        [DisplayName("註冊地國籍-要保人_法人")]
        public string RgtNationCC { get; set; }
        [DisplayName("招攬經過")]
        public string Solicit { get; set; }
        [DisplayName("招攬經過其它")]
        public string SolicitOther { get; set; }
        [DisplayName("保費來源")]
        public string InsuranceSource { get; set; }
        [DisplayName("保費來源其它")]
        public string InsuranceSourceOther { get; set; }
        [DisplayName("客戶屬性")]
        public string CustAttribute { get; set; }
        [DisplayName("投保目的")]
        public string Propose { get; set; }
        [DisplayName("投保目的其它")]
        public string ProposeOther { get; set; }
        [DisplayName("業務報告")]
        public string SalesRpt { get; set; }
        [DisplayName("要保人負責人")]
        public string RepresentativeA { get; set; }
        [DisplayName("被保險人負責人")]
        public string RepresentativeC { get; set; }
    }

    /// <summary>
    /// 銷帳代號，序號 model
    /// </summary>
    public class PaynumModel
    {
        [DisplayName("銷帳代號")]
        public string PAYNO { get; set; }
        [DisplayName("序號")]
        public List<string> SEQNO { get; set; }
    }

    /// <summary>
    /// 列印Log model
    /// </summary>
    public class PrintItemModel
    {
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("400報價單號")]            //不得為空白
        public string CESSIONO { get; set; }
        [DisplayName("列印人員ID")]             //不得為空白
        public string USERID { get; set; }
        [DisplayName("報價單列印日期")]        //若有勾選列印報價單，則不得為空白
        public string QUOPRNDATE { get; set; }
        [DisplayName("預收保費證明列印日期")]  //若有勾選預收保費證明，則不得為空白
        public string ADPRNDATE { get; set; }
        [DisplayName("繳款單列印日期")]        //若有勾選列印繳款單，則不得為空白
        public string PAYPRNDATE { get; set; }
        [DisplayName("連續編號_強")]           //若有勾選預收保費證明且有承保強制險，則不得為空白
        public string SEQNO_1 { get; set; }
        [DisplayName("連續編號_任")]           //若有勾選預收保費證明且有承保任意險，則不得為空白
        public string SEQNO_2 { get; set; }
        [DisplayName("銷帳代號")]               //若有勾選列印繳款單，則不得為空白
        public string PAYNO { get; set; }
        [DisplayName("經手人代號")]
        public string AgentNo { get; set; }
        [DisplayName("承保起日")]
        public string InsSDATE { get; set; }
        [DisplayName("列印類別")]
        public string PAYPRNTYPE { get; set; }
        [DisplayName("請款憑證列印日期")]
        public string ReciptPrnDate { get; set; }
        [DisplayName("強制險列印日期")]
        public string ForcePrnDate { get; set; }
        [DisplayName("KYC列印日期")]
        public string KYCPrnDate { get; set; }
        [DisplayName("官網繳費列印日期")]
        public string OfficalPayDate { get; set; }
    }
    //簽名檔資料model
    public class SignDataModel
    {
        [DisplayName("Base64圖檔字串")]
        public string BASE64TEXT { get; set; }
        [DisplayName("")]
        public string PROMPT { get; set; }
        [DisplayName("存檔")]
        public string FileName { get; set; }
        [DisplayName("編號")]
        public string sn { get; set; }
        [DisplayName("報價單號")]
        public string QuotNo { get; set; }
    }

    /// <summary>
    /// 合併簽名檔資訊
    /// </summary>
    public class MergeFileInfoModel
    {
        [DisplayName("檔案網址路徑")]
        public string FileUrl { get; set; }
        [DisplayName("檔案標題名稱")]
        public string FileTitle { get; set; }
    }

    //郵寄列印文件資料model
    public class AttachPDFToMailModel
    {
        [DisplayName("被保險人EMail")]
        public string CustEmail { get; set; }
        [DisplayName("經手人EMail")]
        public string AgntEmail { get; set; }
        [DisplayName("EMAIL_主旨")]
        public string SUBJECT { get; set; }
        [DisplayName("EMAIL_內容")]
        public string BODY { get; set; }
        [DisplayName("要保人身分證與統一編號")]
        public string CustID { get; set; }
        [DisplayName("要保人姓名")]
        public string CustName { get; set; }
        [DisplayName("400報價單號")]
        public string QuotNo_400 { get; set; }
        [DisplayName("牌照")]
        public string LicenseNo { get; set; }
    }

    #endregion

    #region 官網繳費區

    public class OfficialPaymentTransModel
    {
        [DisplayName("系統名稱")]
        [Required]
        [StringLength(20)]
        public string SysName { get; set; }

        [DisplayName("訂單編號")]
        [Required]
        [StringLength(20)]
        public string ONO { get; set; }

        [DisplayName("身份證字號/統編")]
        [Required]
        [StringLength(10)]
        public string ID { get; set; }

        [DisplayName("查詢方式")]
        [Required]
        [StringLength(15)]
        public string Type { get; set; }

        [DisplayName("查詢值")]
        [Required]
        [StringLength(10)]
        public string Value { get; set; }

        [DisplayName("交易結果返回網址")]
        [Required]
        [StringLength(100)]
        public string ResultUrl { get; set; }

    }
    //交易結果返回網址時的資料model
    public class OfcPymTrnResultUrlModel
    {
        [DisplayName("交易序號")]
        public string TNO { get; set; }
        [DisplayName("交易結果")]
        public bool Result { get; set; }
        [DisplayName("訂單編號")]
        public string ONO { get; set; }
        [DisplayName("繳費方式")]
        public string PayType { get; set; }
        [DisplayName("補充資訊")]
        public ConcatenationResultOtherModel Other { get; set; }
    }

    public class OfficialPaymentAPIResult
    {
        //導向的URL，如空白由本系統顯示結果頁面
        public string ReturnUrl { get; set; }
        //true:成功 false:失敗
        public bool Result { get; set; }
        //成功:空白 失敗:回傳訊息
        public string Msg { get; set; }

    }

    public class ConcatenationResultOtherModel
    {
        public string CardType { get; set; }
        public string BankName { get; set; }
        public string CardNo { get; set; }
        public string ExpireDate { get; set; }
        public string PayerName { get; set; }
        public string PayerBirthday { get; set; }
        public string PayerCity { get; set; }
        public string PayerArea { get; set; }
        public string PayerAddress { get; set; }
        public string PayerPhoneNo { get; set; }
        public string PayerRelationCode { get; set; }
        public string PayerRelation { get; set; }
    }

    #endregion
}