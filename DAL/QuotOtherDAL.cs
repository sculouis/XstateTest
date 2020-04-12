using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System;

namespace Hotains.DAL
{
    public class QuotOtherDAL
    {
        /// <summary>
        /// 新增修改報價單其他係數
        /// </summary>
        /// <param name="Other_Data">報價單其他係數</param>
        /// <param name="sProgCode">創建程式</param>
        /// <param name="sProgCode">sLoginID</param>
        /// <returns>SerializeObject</returns>
        public DataTable InsAltQuotOther(DAO_Quotation.QuotOther Other_Data, string sProgCode, string sLoginID)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iQuotNo", SqlDbType.VarChar) { Value = Other_Data.QuotNo });             //報價單號碼
            paramL.Add(new SqlParameter("@iQuotNo_400", SqlDbType.VarChar) { Value = Other_Data.QuotNo400 });      //400報價單號碼
            paramL.Add(new SqlParameter("@iIsNewPage", SqlDbType.VarChar) { Value = Other_Data.IsNewPage });       //傷險名冊另起新頁(空白:不另起新頁;1:要另起新頁)
            paramL.Add(new SqlParameter("@iIsBilling", SqlDbType.VarChar) { Value = Other_Data.IsBilling });       //是否要出單(0:不出單; 1:要出單; 由業務人員勾選)
            paramL.Add(new SqlParameter("@iSigned", SqlDbType.VarChar) { Value = Other_Data.Signed });             //已簽名(0:未簽名; 1:已簽名; 由系統判斷)
            paramL.Add(new SqlParameter("@iCaseNumber", SqlDbType.VarChar) { Value = Other_Data.CaseNumber });     //進件序號(影像歸檔產出)
            paramL.Add(new SqlParameter("@iPayResult", SqlDbType.VarChar) { Value = Other_Data.PayResult });	    //繳費結果(0:未繳費;1:已繳費)
            paramL.Add(new SqlParameter("@iKYCFilled", SqlDbType.VarChar) { Value = Other_Data.KYCFilled });       //KYC已填寫
            paramL.Add(new SqlParameter("@iIsReviewed", SqlDbType.VarChar) { Value = Other_Data.IsReviewed });	    //合併簽名檔後檢視
            paramL.Add(new SqlParameter("@iReviewed", SqlDbType.VarChar) { Value = Other_Data.Reviewed });	        //合併簽名檔後檢視資料
            paramL.Add(new SqlParameter("@iAgreeMent", SqlDbType.VarChar) { Value = Other_Data.AgreeMent });	    //行動投保同意書
            paramL.Add(new SqlParameter("@iConsentPersonData", SqlDbType.VarChar) { Value = Other_Data.ConsentPersonData });	//繳費結果
            paramL.Add(new SqlParameter("@iIsComplete", SqlDbType.VarChar) { Value = Other_Data.IsComplete });	    //行動投保完成狀態
            paramL.Add(new SqlParameter("@iUserID", SqlDbType.VarChar) { Value = sLoginID });  //創建者
            paramL.Add(new SqlParameter("@iProgCode", SqlDbType.VarChar) { Value = sProgCode });  //創建程式
            var dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_ins-altQuotOther]", paramL);
            return dt;
        }

        /// <summary>
        /// 檢核行動投保處理階段
        /// </summary>
        /// <param name="QuotNo">web 報價單號碼</param>
        /// <returns>SerializeObject</returns>
        public DataTable GetMobileInsureStep(string QuotNo)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            //paramL.Add(new SqlParameter("@iQuotNo", SqlDbType.VarChar) { Value = Public.toNotNullStr(QuotNo) });
            var dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getMobileInsureStep]", paramL);
            return dt;
        }

        /// <summary>
        /// 取得 QuotOther 資料
        /// </summary>
        /// <param name="sQuotNo">web 報價單號碼</param>
        /// <returns></returns>
        public DataTable GetQuotOther(string sQuotNo)
        {
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getQuotOther]", new List<SqlParameter>() { new SqlParameter("@iQuotNo", sQuotNo) });
        }

        /// <summary>
        /// 取得預覽要保書相關資料
        /// </summary>
        /// <param name="sQuotNo">web 報價單號碼</param>
        /// <returns></returns>
        public DataTable GetReviewed(string sQuotNo)
        {
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getReviewed]", new List<SqlParameter>() { new SqlParameter("@iQuotNo", sQuotNo) });
        }
    }
}