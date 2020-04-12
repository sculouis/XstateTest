using System;
using System.ComponentModel;

namespace Hotains.Models.DAO
{

    //操作(Login,Qry,New,Edit,Del,Submit)
    public enum UAction
    {
        Login, Qry, New, Edit, Del, Submit
    }
    public class UserLog
    {
        [DisplayName("資料序號")]
        public int SN { get; set; }
        [DisplayName("日期")]
        public DateTime LogDate { get; set; }
        [DisplayName("資料等級")]
        public string Level { get; set; }
        [DisplayName("使用者IP位置")]
        public string UserIP { get; set; }
        [DisplayName("使用者ID")]
        public string UserID { get; set; }
        [DisplayName("使用者名稱")]
        public string UserName { get; set; }
        [DisplayName("系統目錄")]
        public string SysPath { get; set; }
        [DisplayName("操作(Login,Qry,New,Edit,Del,Submit)")]
        public string Action { get; set; }
        [DisplayName("操作說明")]
        public string ActionDesc { get; set; }
        [DisplayName("傳送內容")]
        public string Content { get; set; }
        [DisplayName("資料處理筆數")]
        public int? DataCount { get; set; }
        [DisplayName("是否為行動裝置(Y/N)")]
        public string IsMobile { get; set; }
        [DisplayName("裝置")]
        public string Device { get; set; }
        [DisplayName("瀏覽器")]
        public string Browser { get; set; }

    }

}