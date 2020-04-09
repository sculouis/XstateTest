using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace Hotains.DAL
{
    public class QuotDAL
    {
        /// <summary>
        /// 查詢[收費員]資料
        /// </summary>
        /// <param name="sTollClterNo">收費員代號</param>
        /// <param name="sTollClterID">收費員ID</param>
        /// <returns>DataTable</returns>
        public DataTable GetTollClterInfo(string sTollClterNo, string sTollClterID)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iTollClterNo", SqlDbType.VarChar) { Value = sTollClterNo });   //收費員代號
            paramL.Add(new SqlParameter("@iTollClterID", SqlDbType.VarChar) { Value = sTollClterID });	//收費員ID
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getT9982_01]", paramL);
        }

        /// <summary>
        /// 查詢[報價單簽名相關資料]
        /// </summary>
        /// <param name="sQuotNo">報價單編號</param>
        /// <returns>DataTable</returns>
        public DataTable GetQuotSignInfo(string sQuotNo)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iQuotNo", SqlDbType.VarChar) { Value = sQuotNo });            //報價單號碼            
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getQuotSignInfo]", paramL);
        }

        /// <summary>
        /// 取得KYC頁面的資料
        /// </summary>
        /// <param name="QuotNo">web 報價單號碼</param>
        /// <returns></returns>
        public DataTable GetKYCData(string sQuotNo)
        {
            var paramLi = new List<SqlParameter>();
            paramLi.Add(new SqlParameter() { ParameterName = "@iQuotNo", Value = sQuotNo });
            DataTable dtPrintKYC = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getPrintKYC]", paramLi);
            return dtPrintKYC;
        }

        /// <summary>
        /// 檢核_報價單修改前檢核
        /// </summary>
        /// <param name="sAgentNo">經手人代號</param>
        /// <param name="sInsSDATE">承保起始日</param>
        /// <param name="sQuotNo_400">AS400報價單編號</param>
        /// <returns>SerializeObject</returns>
        public DataTable ChkQuotEdit(string sAgentNo, string sInsSDATE, string sQuotNo_400)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iAgentNo", SqlDbType.VarChar) { Value = sAgentNo });	    //經手人代號
            paramL.Add(new SqlParameter("@iInsSDATE", SqlDbType.VarChar) { Value = sInsSDATE });	    //承保起始日
            paramL.Add(new SqlParameter("@iQuotNo_400", SqlDbType.VarChar) { Value = sQuotNo_400 });	    //AS400報價單編號
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_chkQuotEdit]", paramL);
        }

        /// <summary>
        /// 取得[列印要保書]資訊
        /// </summary>
        /// <param name="QuotNo">報價單號碼</param>
        /// <returns></returns>
        public DataTable GetQuotInfo(string QuotNo)
        {
            var paramLi = new List<SqlParameter>();
            paramLi.Add(new SqlParameter() { ParameterName = "@iQuotNo", Value = QuotNo });
            DataTable dtQuoteDataSource = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getPrintQuot]", paramLi);
            return dtQuoteDataSource;
        }

    }
}