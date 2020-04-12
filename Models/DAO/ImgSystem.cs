using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Hotains.Models.DAO.ImgSystem
{

    public class ArchiveModel
    {
        public string CreateFlowCode { get; set; }  //啟動流程的代碼
        public int? CaseLimit { get; set; }  //案件時效
        public string PrintUnitCode { get; set; }   //出單單位代碼
        public string AgentId { get; set; } //經手人代號
        public string ProductId { get; set; }  //產品別代碼
        public string OriginalCaseNumber { get; set; }  //原始進件序號
        public string ScanUnitCode { get; set; }    //進件單位代碼
        public string ProcessType { get; set; }     //作業類別代碼
        public bool NeedFirstReview { get; set; }   //是否需要初核
        public string ScanUser { get; set; }    //上傳人員帳號
        public string ScanUserId { get; set; }  //上傳人員身份證字號
        public string ScanUserName { get; set; }    //上傳人員(名稱)
        public string FaeChannelId { get; set; }    //FAE 通路代碼
        public string ChannelNumber { get; set; }   //通路進件序號
        public string FilType { get; set; }     //收據類別
        public string FilNumber { get; set; }   //收據號碼
        public string FilNumberT { get; set; }  //預收保費証明
        public string SDSNumber { get; set; }   //SDS進件序號
        public string PosNumber { get; set; }   //要保書序號
        public string PolicyId { get; set; }    //保單號碼
        public string PolicyTransNo { get; set; }   //保單交易號碼

    }


    public class ResultModel
    {
        public bool Success { get; set; }
        public string ReMsg { get; set; }   //回傳參數代碼
    }

    public class ImageArchiveModel
    {
        public string UserID { get; set; }
        public ArchiveModel ArchiveModel { get; set; }

    }

}