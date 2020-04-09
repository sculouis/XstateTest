using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace Hotains.Models.DAO
{
    public class Assist
    {
        /// <summary>
        /// 輔助平台欄位轉換對應 model
        /// </summary>
        public class DataModelToDataTable
        {
            [DisplayName("來源資料欄位名")]
            public string SourceColumnName { get; set; }
            [DisplayName("目的地資料欄位名")]
            public string DestinationColumnName { get; set; }
            [DisplayName("DataTable Name")]
            public string DataTableName { get; set; }
        }
        /// <summary>
        /// 輔助平台 layout model
        /// </summary>
        public class AssistModel
        {
            [DisplayName("交易序號")]
            public string txNo { get; set; }
            [DisplayName("Web 單號")]
            public string QuotNo { get; set; }
            [DisplayName("通路代收類別")]
            //1:「代收保費」通路
            //2:「未代收保費」保經 保代
            public string collectionType { get; set; }
            [DisplayName("是否投保強制險")]
            public string compInsOrNot { get; set; }
            [DisplayName("是否投保任意險")]
            public string arbtyInsOrNot { get; set; }
            [DisplayName("強制保險證號")]
            public string insuredCardNo { get; set; }
            [DisplayName("強制險保費查詢序號")]
            public string stsSelNo { get; set; }
            [DisplayName("客戶類別")]
            public string idType { get; set; }
            [DisplayName("客戶ID")]
            public string ownerId { get; set; }
            [DisplayName("姓名")]
            public string ownerName { get; set; }
            [DisplayName("法人負責人")]
            public string compRepName { get; set; }
            [DisplayName("性別")]
            public string gender { get; set; }
            [DisplayName("生日")]
            public string birthDate { get; set; }
            [DisplayName("區別")]
            public string zipCode { get; set; }
            [DisplayName("縣市別")]
            public string city { get; set; }
            [DisplayName("鄉鎮市區")]
            public string district { get; set; }
            [DisplayName("地址")]
            public string address { get; set; }
            [DisplayName("被保人行動電話")]
            public string mobile { get; set; }
            [DisplayName("被保人市內電話")]
            public string phone { get; set; }
            [DisplayName("電子郵件信箱")]
            public string email { get; set; }
            [DisplayName("公司別")]
            public string bizKind { get; set; }
            [DisplayName("出單總公司統編")]
            public string tradingCompUnitedNo { get; set; }
            [DisplayName("營業據點 使用者帳號")]
            public string EreUser { get; set; }
            [DisplayName("出單總公司名稱")]
            public string tradingCompName { get; set; }
            [DisplayName("通路代碼")]
            public string tradingCompCode { get; set; }
            [DisplayName("營業據點(實駐)編號")]
            public string siteNo { get; set; }
            [DisplayName("營業據點使用者帳號")]
            public string creUser { get; set; }
            [DisplayName("業務員姓名")]
            public string producerName { get; set; }
            [DisplayName("產險證登錄證號險")]
            public string producerRegNo { get; set; }
            [DisplayName("經手人姓名")]
            public string handledName { get; set; }
            [DisplayName("經手人代號")]
            public string handledID { get; set; }
            [DisplayName("保險生效日期")]
            public string compBeginDate { get; set; }
            [DisplayName("保險終止日期")]
            public string compEndDate { get; set; }
            [DisplayName("強制險保費")]
            public int? compPremium { get; set; }
            [DisplayName("原費率等級")]
            public int? orgGrade { get; set; }
            [DisplayName("違規次數")]
            public int? violateTimes { get; set; }
            [DisplayName("強制險保費查詢序號")]
            public string StsseIno { get; set; }
            [DisplayName("違規加費")]
            public int? violateExtraFee { get; set; }
            [DisplayName("係數等級(本期)")]
            public int? feeGrade { get; set; }
            [DisplayName("要保日期")]
            public string proposalDate { get; set; }
            [DisplayName("單位別(區域別)")]
            public string compTypeNo { get; set; }
            [DisplayName("加選紙本")]
            public string paperOrNot { get; set; }
            [DisplayName("車牌號碼")]
            public string plateNo { get; set; }
            [DisplayName("車輛種類")]
            public string insuredCarType { get; set; }
            [DisplayName("排氣量")]
            public decimal? cylinder { get; set; }
            [DisplayName("出廠年月")]
            public string makeYearMonth { get; set; }
            [DisplayName("原始發照日期")]
            public string orgIssueDate { get; set; }
            [DisplayName("引擎/車身號碼")]
            public string engineNo { get; set; }
            [DisplayName("廠牌型式")]
            public string brandModel { get; set; }
            [DisplayName("車種別")]
            public string carriageType { get; set; }
            [DisplayName("承載數量")]
            public decimal? capacityLimit { get; set; }
            [DisplayName("承載單位")]
            public string capacityUnit { get; set; }
        }

        /// <summary>
        /// 報價完成回覆信件內文 model
        /// </summary>
        public class ResultMailModel
        {
            [DisplayName("出單單位")]
            public string BranchNo { get; set; }
            [DisplayName("經手人代號")]
            public string AgentNo { get; set; }
            [DisplayName("報價單號碼")]
            public string QuotNo_400 { get; set; }
            [DisplayName("報價人員")]
            public string UserName { get; set; }
            [DisplayName("服務人員Email")]
            public string AgentEmail { get; set; }
        }

        /// <summary>
        /// 認證平台回覆保險公司格式
        /// </summary>
        public class OriginAssistData
        {
            [DisplayName("任意險導向資料")]
            public AssistModel proposalData { get; set; }
            [DisplayName("回覆代碼")]
            public string resultCode { get; set; }
            [DisplayName("回覆訊息")]
            public string resultMsg { get; set; }
        }

    }
}