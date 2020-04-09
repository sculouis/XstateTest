using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
public class DAO_QuotationBatch
{
    #region 團體件匯入
    #region [BatImpChk]團體件檢核參數
    /// <summary>
    /// [BatImpChk]團體件檢核參數
    /// </summary>
    public class BatImpChk
    {
        [DisplayName("作業ID")]
        public string PROD_ID { get; set; }
        [DisplayName("欄位名稱")]
        public string COLUM_NAME { get; set; }
        [DisplayName("欄位說明")]
        public string COLUM_DESC { get; set; }
        [DisplayName("欄位是否必填")]
        public string COLUM_ISNECESSARY { get; set; }
        [DisplayName("欄位順序")]
        public string COLUM_ORDER { get; set; }
        [DisplayName("欄位最小長度")]
        public string COLUM_MINLEN { get; set; }
        [DisplayName("欄位最大長度")]
        public string COLUM_MAXLEN { get; set; }
        [DisplayName("欄位預設內容")]
        public string COLUM_DEFAULT { get; set; }
        [DisplayName("欄位類型")]
        public string COLUM_TYPE { get; set; }
        [DisplayName("補位內容(0或空白)")]
        public string COLUM_REPDEF { get; set; }
        [DisplayName("是否啟用")]
        public string IsValid { get; set; }
    }
    #endregion

    #region [QuotBatchMaster]團體件主檔
    /// <summary>
    /// [QuotBatchMaster]團體件主檔
    /// </summary>
    public class QuotBatchMaster
    {
        [DisplayName("作業型態(INS:新增,ALT:修改)")]
        public string WorkType { get; set; }
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("團體件作業Mail")]
        public string BatchMail { get; set; }
        [DisplayName("團體件檔案名稱")]
        public string BatchFileName { get; set; }
        [DisplayName("經手人代號")]
        public string AgentNo { get; set; }
        [DisplayName("經手人名稱")]
        public string AgentName { get; set; }
        [DisplayName("經手人類別")]
        public string AgentType { get; set; }
        [DisplayName("經手人業務員名稱")]
        public string AgentSalesName { get; set; }
        [DisplayName("單位別")]
        public string BranchNo { get; set; }
        [DisplayName("業務人員編號")]
        public string LifeNo { get; set; }
        [DisplayName("業務員登錄字號")]
        public string SalesmanRegNo { get; set; }
        [DisplayName("通路別1")]
        public string CHL1 { get; set; }
        [DisplayName("通路別2")]
        public string CHL2 { get; set; }
        [DisplayName("服務人員代號")]
        public string ServiceNo { get; set; }
        [DisplayName("服務人員名稱")]
        public string ServiceName { get; set; }
        [DisplayName("服務電話")]
        public string ServiceTel { get; set; }
        [DisplayName("服務傳真")]
        public string ServiceFax { get; set; }
        [DisplayName("服務Email")]
        public string ServiceMail { get; set; }
        [DisplayName("編號(大保單號碼/安麗直銷商)")]
        public string AmwayNo { get; set; }
        [DisplayName("編號(收費單列印方式)")]
        public string PrnWayNo { get; set; }
        [DisplayName("車商代碼(經銷商)")]
        public string VendorNo { get; set; }
        [DisplayName("車商代碼(經銷商業務員編號)")]
        public string VendorSalesNo { get; set; }
        [DisplayName("收費員ID")]
        public string TollClterID { get; set; }
        [DisplayName("收費員代號")]
        public string TollClterNo { get; set; }
        [DisplayName("收費員名稱")]
        public string TollClterName { get; set; }
        [DisplayName("收費員登錄證號")]
        public string TollClterRegNo { get; set; }
        [DisplayName("狀態")]
        public string BatchStatus { get; set; }
        [DisplayName("狀態說明")]
        public string BatchStatusMsg { get; set; }
        [DisplayName("是否重新匯入")]
        public string IsInPut { get; set; }
        [DisplayName("是否已寄送Mail")]
        public string IsSendMail { get; set; }
        [DisplayName("匯入筆數")]
        public string InputCount { get; set; }
        [DisplayName("取級數成功筆數")]
        public string LevelCount { get; set; }
        [DisplayName("保費試算成功筆數")]
        public string CalPreCount { get; set; }
        [DisplayName("送400成功筆數")]
        public string Send400Count { get; set; }
        [DisplayName("送FTP成功筆數")]
        public string SendFTPCount { get; set; }
        [DisplayName("使用者名稱")]
        public string UserName { get; set; }
        [DisplayName("使用者")]
        public string UserID { get; set; }
        [DisplayName("程式代碼")]
        public string ProgCode { get; set; }
        [DisplayName("EMAIL_主旨")]
        public string sSUBJECT { get; set; }
        [DisplayName("EMAIL_內容")]
        public string sBODY { get; set; }
    }
    #endregion

    #region [QuotBatchDetail]團體件明細檔
    public class QuotBatchDetail
    {
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("400報價單號碼")]
        public string QuotNo_400 { get; set; }
        [DisplayName("是否出單")]
        public string IsBilling { get; set; }
        [DisplayName("是否暫不處理")]
        public string IsPass { get; set; }
        [DisplayName("資料序號")]
        public string SN { get; set; }
        [DisplayName("牌照")]
        public string LicenseNo { get; set; }
        [DisplayName("要保人ID/公司統編")]
        public string ProposerID { get; set; }
        [DisplayName("要保人客戶代碼")]
        public string APLClntNum { get; set; }
        [DisplayName("要保人客戶類別")]
        public string APLCustType { get; set; }
        [DisplayName("要保人國籍")]
        public string APLNation { get; set; }
        [DisplayName("要保人代表人")]
        public string APLRepresentative { get; set; }
        [DisplayName("要保人生日")]
        public string APLBirthday { get; set; }
        [DisplayName("要保人姓名/公司名稱")]
        public string APLName { get; set; }
        [DisplayName("要保人性別")]
        public string APLSex { get; set; }
        [DisplayName("要保人縣市別")]
        public string APLCity { get; set; }
        [DisplayName("要保人區別")]
        public string APLZipcode { get; set; }
        [DisplayName("要保人縣市別")]
        public string APLCityDesc { get; set; }
        [DisplayName("要保人區別說明")]
        public string APLZipcodeDesc { get; set; }
        [DisplayName("要保人地址說明")]
        public string APLAddr { get; set; }
        [DisplayName("要保人e-mail")]
        public string APLEmail { get; set; }
        [DisplayName("要保人聯絡電話")]
        public string APLCellPhone { get; set; }
        [DisplayName("要保人傳真號碼")]
        public string APLFax { get; set; }
        [DisplayName("與被保險人關係")]
        public string ToInsuredRelation { get; set; }
        [DisplayName("被保險人ID")]
        public string InsuredID { get; set; }
        [DisplayName("被保險人客戶代碼")]
        public string CTLClntNum { get; set; }
        [DisplayName("被保險人客戶類別")]
        public string CTLCustType { get; set; }
        [DisplayName("被保險人國籍")]
        public string CTLNation { get; set; }
        [DisplayName("被保險人代表人")]
        public string CTLRepresentative { get; set; }
        [DisplayName("被保險人生日")]
        public string CTLBirthday { get; set; }
        [DisplayName("被保險人姓名")]
        public string CTLName { get; set; }
        [DisplayName("被保險人性別")]
        public string CTLSex { get; set; }
        [DisplayName("被保險人縣市別")]
        public string CTLCity { get; set; }
        [DisplayName("被保險人區別")]
        public string CTLZipcode { get; set; }
        [DisplayName("被保險人縣市別")]
        public string CTLCityDesc { get; set; }
        [DisplayName("被保險人區別說明")]
        public string CTLZipcodeDesc { get; set; }
        [DisplayName("被保險人地址說明")]
        public string CTLAddr { get; set; }
        [DisplayName("被保險人e-mail")]
        public string CTLEmail { get; set; }
        [DisplayName("被保險人聯絡電話")]
        public string CTLCellPhone { get; set; }
        [DisplayName("被保險人傳真號碼")]
        public string CTLFax { get; set; }
        [DisplayName("廠型")]
        public string CarTypeNo { get; set; }
        [DisplayName("強制車種")]
        public string ForceCarType { get; set; }
        [DisplayName("任意車種")]
        public string AnyCarType { get; set; }
        [DisplayName("製造年")]
        public string MakeYear { get; set; }
        [DisplayName("重置價格")]
        public string CarPrice { get; set; }
        [DisplayName("發照年月")]
        public string IssueYear { get; set; }
        [DisplayName("排氣量")]
        public string Displacement { get; set; }
        [DisplayName("乘載(人/噸)")]
        public string Load { get; set; }
        [DisplayName("承載單位")]
        public string LoadType { get; set; }
        [DisplayName("彙總類別")]
        public string Category { get; set; }
        [DisplayName("引擎/車身號碼")]
        public string EngineNo { get; set; }
        [DisplayName("強制起保日")]
        public string ForceInsuredFrom { get; set; }
        [DisplayName("強制迄止日")]
        public string ForceInsuredTo { get; set; }
        [DisplayName("強制優惠")]
        public string ForceOffer { get; set; }
        [DisplayName("是否需要電子保單")]
        public string IsEMail { get; set; }
        [DisplayName("任意起保日")]
        public string AnyInsuredFrom { get; set; }
        [DisplayName("任意迄止日")]
        public string AnyInsuredTo { get; set; }
        [DisplayName("折舊率")]
        public string DepRate { get; set; }
        [DisplayName("計算")]
        public string CalCode { get; set; }
        [DisplayName("付款方式")]
        public string Payway { get; set; }
        [DisplayName("車損險")]
        public string ZCAMPAN1 { get; set; }
        [DisplayName("車責險")]
        public string ZCAMPAN2 { get; set; }
        [DisplayName("附加被保險人")]
        public string AddInsured { get; set; }
        [DisplayName("抵押權人")]
        public string Mortgage { get; set; }
        [DisplayName("記錄")]
        public string Record { get; set; }
        [DisplayName("傷險名冊另起新頁")]
        public string IsNewPage { get; set; }
        [DisplayName("傷險被保人-1")]
        public string BenefitInfo_1 { get; set; }
        [DisplayName("傷險被保人-2")]
        public string BenefitInfo_2 { get; set; }
        [DisplayName("傷險被保人-3")]
        public string BenefitInfo_3 { get; set; }
        [DisplayName("取級數是否成功")]
        public string IsLevel { get; set; }
        [DisplayName("保費試算是否成功")]
        public string IsCalPre { get; set; }
        [DisplayName("送400是否成功")]
        public string IsSend400 { get; set; }
        [DisplayName("狀態訊息")]
        public string StatusMsg { get; set; }
        [DisplayName("是否列印")]
        public string IsPrintQuot { get; set; }
        //[DisplayName("創建者")]
        //public string Creator { get; set; }
        //[DisplayName("創建日期")]
        //public string CreateDate { get; set; }
        //[DisplayName("創建程式")]
        //public string CreatePro { get; set; }
        //[DisplayName("異動者")]
        //public string Shifter { get; set; }
        //[DisplayName("異動日期")]
        //public string ShiftDate { get; set; }
        //[DisplayName("異動程式")]
        //public string ShiftPro { get; set; }
    }
    #endregion

    #region [QuotBatchBenefitPeople]團體件傷險被保人資料
    public class QuotBatchBenefitPeople
    {
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("資料序號")]
        public string SN { get; set; }
        [DisplayName("被保人1_險種")]
        public string P1_InsureType { get; set; }
        [DisplayName("被保人1_姓名")]
        public string P1_ListDriverName { get; set; }
        [DisplayName("被保人1_與要保人關係代碼")]
        public string P1_ToProposerRelation { get; set; }
        [DisplayName("被保人1_ID")]
        public string P1_ListDriverID { get; set; }
        [DisplayName("被保人1_生日(西元年8碼)")]
        public string P1_ListDriverBirth { get; set; }
        [DisplayName("被保人1_性別代碼:男,2:女)")]
        public string P1_ListDriverSex { get; set; }
        [DisplayName("被保人1_連絡電話")]
        public string P1_ListDriverTel { get; set; }
        [DisplayName("被保人1_法定(Y/N)")]
        public string P1_BenfitIsLegal { get; set; }
        [DisplayName("被保人1_受益人姓名")]
        public string P1_BenfitName { get; set; }
        [DisplayName("被保人1_受益人電話")]
        public string P1_BenfitTel { get; set; }
        [DisplayName("被保人1_受益人地址")]
        public string P1_Addr { get; set; }
        [DisplayName("被保人1_與列名駕駛人的關係代碼")]
        public string P1_ToListRelation { get; set; }
        [DisplayName("被保人2_險種")]
        public string P2_InsureType { get; set; }
        [DisplayName("被保人2_姓名")]
        public string P2_ListDriverName { get; set; }
        [DisplayName("被保人2_與要保人關係代碼")]
        public string P2_ToProposerRelation { get; set; }
        [DisplayName("被保人2_ID")]
        public string P2_ListDriverID { get; set; }
        [DisplayName("被保人2_生日(西元年8碼)")]
        public string P2_ListDriverBirth { get; set; }
        [DisplayName("被保人2_性別代碼:男,2:女)")]
        public string P2_ListDriverSex { get; set; }
        [DisplayName("被保人2_連絡電話")]
        public string P2_ListDriverTel { get; set; }
        [DisplayName("被保人2_法定(Y/N)")]
        public string P2_BenfitIsLegal { get; set; }
        [DisplayName("被保人2_受益人姓名")]
        public string P2_BenfitName { get; set; }
        [DisplayName("被保人2_受益人電話")]
        public string P2_BenfitTel { get; set; }
        [DisplayName("被保人2_受益人地址")]
        public string P2_Addr { get; set; }
        [DisplayName("被保人2_與列名駕駛人的關係代碼")]
        public string P2_ToListRelation { get; set; }

    }
    #endregion

    #region [BatImpInfo]團體件匯入資訊表
    /// <summary>
    /// [BatImpInfo]團體件匯入資訊表
    /// </summary>
    public class BatImpInfo
    {
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("大保單號碼")]
        public string AmwayNo { get; set; }
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("400報價單號碼")]
        public string QuotNo_400 { get; set; }
        [DisplayName("是否出單")]
        public string IsBilling { get; set; }
        [DisplayName("是否暫不處理")]
        public string IsPass { get; set; }
        [DisplayName("資料序號")]
        public string SN { get; set; }
        [DisplayName("經手人代號")]
        public string AgentNo { get; set; }
        [DisplayName("單位別")]
        public string BranchNo { get; set; }
        [DisplayName("牌照")]
        public string LicenseNo { get; set; }
        [DisplayName("要保人ID/公司統編")]
        public string ProposerID { get; set; }
        [DisplayName("要保人客戶代碼")]
        public string APLClntNum { get; set; }
        [DisplayName("要保人客戶類別")]
        public string APLCustType { get; set; }
        [DisplayName("要保人國籍")]
        public string APLNation { get; set; }
        [DisplayName("要保人代表人")]
        public string APLRepresentative { get; set; }
        [DisplayName("要保人生日")]
        public string APLBirthday { get; set; }
        [DisplayName("要保人姓名/公司名稱")]
        public string APLName { get; set; }
        [DisplayName("要保人性別")]
        public string APLSex { get; set; }
        [DisplayName("要保人縣市別")]
        public string APLCity { get; set; }
        [DisplayName("要保人區別")]
        public string APLZipcode { get; set; }
        [DisplayName("要保人地址")]
        public string APLAddr { get; set; }
        [DisplayName("要保人e-mail")]
        public string APLEmail { get; set; }
        [DisplayName("要保人聯絡電話")]
        public string APLCellPhone { get; set; }
        [DisplayName("要保人傳真號碼")]
        public string APLFax { get; set; }
        [DisplayName("與被保險人關係")]
        public string ToInsuredRelation { get; set; }
        [DisplayName("被保險人ID")]
        public string InsuredID { get; set; }
        [DisplayName("被保險人客戶代碼")]
        public string CTLClntNum { get; set; }
        [DisplayName("被保險人客戶類別")]
        public string CTLCustType { get; set; }
        [DisplayName("被保險人國籍")]
        public string CTLNation { get; set; }
        [DisplayName("被保險人代表人")]
        public string CTLRepresentative { get; set; }
        [DisplayName("被保險人生日")]
        public string CTLBirthday { get; set; }
        [DisplayName("被保險人姓名")]
        public string CTLName { get; set; }
        [DisplayName("被保險人性別")]
        public string CTLSex { get; set; }
        [DisplayName("被保險人縣市別")]
        public string CTLCity { get; set; }
        [DisplayName("被保險人區別")]
        public string CTLZipcode { get; set; }
        [DisplayName("被保險人地址")]
        public string CTLAddr { get; set; }
        [DisplayName("被保險人e-mail")]
        public string CTLEmail { get; set; }
        [DisplayName("被保險人聯絡電話")]
        public string CTLCellPhone { get; set; }
        [DisplayName("被保險人傳真號碼")]
        public string CTLFax { get; set; }
        [DisplayName("廠型")]
        public string CarTypeNo { get; set; }
        [DisplayName("強制車種")]
        public string ForceCarType { get; set; }
        [DisplayName("製造年")]
        public string MakeYear { get; set; }
        [DisplayName("重置價格")]
        public string CarPrice { get; set; }
        [DisplayName("發照年月")]
        public string IssueYear { get; set; }
        [DisplayName("排氣量")]
        public string Displacement { get; set; }
        [DisplayName("乘載(人/噸)")]
        public string Load { get; set; }
        [DisplayName("引擎/車身號碼")]
        public string EngineNo { get; set; }
        [DisplayName("強制起保日")]
        public string ForceInsuredFrom { get; set; }
        [DisplayName("強制迄止日")]
        public string ForceInsuredTo { get; set; }
        [DisplayName("強制優惠")]
        public string ForceOffer { get; set; }
        [DisplayName("是否需要電子保單")]
        public string IsEMail { get; set; }
        [DisplayName("任意車種")]
        public string AnyCarType { get; set; }
        [DisplayName("任意起保日")]
        public string AnyInsuredFrom { get; set; }
        [DisplayName("任意迄止日")]
        public string AnyInsuredTo { get; set; }
        [DisplayName("折舊率")]
        public string DepRate { get; set; }
        [DisplayName("計算")]
        public string CalCode { get; set; }
        [DisplayName("付款方式")]
        public string Payway { get; set; }
        [DisplayName("車損險")]
        public string ZCAMPAN1 { get; set; }
        [DisplayName("車責險")]
        public string ZCAMPAN2 { get; set; }
        [DisplayName("附加被保險人")]
        public string AddInsured { get; set; }
        [DisplayName("抵押權人")]
        public string Mortgage { get; set; }
        [DisplayName("記錄")]
        public string Record { get; set; }
        [DisplayName("傷險名冊另起新頁")]
        public string IsNewPage { get; set; }
        [DisplayName("傷險被保人-1")]
        public string BenefitInfo_1 { get; set; }
        [DisplayName("傷險被保人-2")]
        public string BenefitInfo_2 { get; set; }
        [DisplayName("傷險被保人-3")]
        public string BenefitInfo_3 { get; set; }
    }
    #endregion

    #region [QuotBatchMsg]團體件作業訊息檔

    /// <summary>
    /// [QuotBatchMsg]團體件作業訊息檔
    /// </summary>
    public class QuotBatchMsg
    {
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("資料序號")]
        public string SN { get; set; }
        [DisplayName("訊息內容")]
        public string MSG { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
    }
    #endregion

    #region [QuotBatchLog]團體件作業Log檔

    /// <summary>
    /// [QuotBatchLog]團體件作業Log檔
    /// </summary>
    public class QuotBatchLog
    {
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("報價單號碼")]
        public string QuotNo { get; set; }
        [DisplayName("訊息內容")]
        public string MSG { get; set; }
        [DisplayName("創建者")]
        public string Creator { get; set; }
        [DisplayName("創建日期")]
        public string CreateDate { get; set; }
        [DisplayName("創建程式")]
        public string CreatePro { get; set; }
    }
    #endregion

    #region [QuotLevel]取級數相關參數
    /// <summary>
    /// [QuotLevel]取級數相關參數
    /// </summary>
    public class QuotLevel
    {
        [DisplayName("團體件序號")]
        public string BatchNo { get; set; }
        [DisplayName("報價單編號")]
        public string QuotNo { get; set; }
        [DisplayName("強制起保日")]
        public string ForceInsuredFrom { get; set; }
        [DisplayName("任意起保日")]
        public string AnyInsuredFrom { get; set; }
        [DisplayName("強制等級")]
        public string ForceLevel { get; set; }
        [DisplayName("酒駕次數")]
        public string DrunkFreq { get; set; }
        [DisplayName("強制序號")]
        public string ForceSerialNo { get; set; }
        [DisplayName("強制")]
        public string ForceMsg { get; set; }
        [DisplayName("體係")]
        public string BodyFactor { get; set; }
        [DisplayName("責係")]
        public string DutyFactor { get; set; }
        [DisplayName("任意序號")]
        public string AnySerialNo { get; set; }
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
        [DisplayName("保單號碼/上年度保單號碼")]
        public string PolicyNo { get; set; }
        [DisplayName("舊保險證號/上年度強制證號")]
        public string ForceNo { get; set; }
        [DisplayName("強制險承保記錄")]
        public string MCPInsured { get; set; }
        [DisplayName("強制險理賠記錄")]
        public string MCPClaims { get; set; }
        [DisplayName("任意險承保記錄")]
        public string MVPInsured { get; set; }
        [DisplayName("任意險理賠記錄")]
        public string MVPClaims { get; set; }
        [DisplayName("使用者")]
        public string UserID { get; set; }
        [DisplayName("程式代碼")]
        public string ProgCode { get; set; }
        [DisplayName("查詢結果代碼")]
        public string SysMsgCode { get; set; }
        [DisplayName("查詢結果")]
        public string SysMsg { get; set; }
    }
    #endregion
    #endregion
}
