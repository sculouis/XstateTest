using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace Hotains.DAL
{
    public class QuotBatchDAL
    {
        /// <summary>
        /// 查詢[團體件]主檔
        /// </summary>
        /// <param name="sBatchNo">團體件序號</param>
        /// <param name="sAmwayNo">大保單號碼</param>
        /// <param name="sAgentNo">經手人代號</param>
        /// <param name="sBranchNo">單位別</param>
        /// <param name="sBatchStatus">狀態</param>
        /// <param name="sLoginID">登入者ID</param>
        /// <returns>DataTable</returns>
        public DataTable GetQuotBatchMaster(string sBatchNo, string sAmwayNo, string sAgentNo, string sBranchNo, string sBatchStatus, string sCreateDate_S, string sCreateDate_E,string sLoginID)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iBatchNo", SqlDbType.VarChar) { Value = sBatchNo });              //團體件序號
            paramL.Add(new SqlParameter("@iAmwayNo", SqlDbType.VarChar) { Value = sAmwayNo });              //大保單號碼
            paramL.Add(new SqlParameter("@iAgentNo", SqlDbType.VarChar) { Value = sAgentNo });              //經手人代號
            paramL.Add(new SqlParameter("@iBranchNo", SqlDbType.VarChar) { Value = sBranchNo });	        //單位別
            paramL.Add(new SqlParameter("@iUserID", SqlDbType.VarChar) { Value = sLoginID });               //使用者
            paramL.Add(new SqlParameter("@iBatchStatus", SqlDbType.VarChar) { Value = sBatchStatus });      //狀態
            paramL.Add(new SqlParameter("@iCreateDate_S", SqlDbType.VarChar) { Value = sCreateDate_S });    //上傳日期(起)
            paramL.Add(new SqlParameter("@iCreateDate_E", SqlDbType.VarChar) { Value = sCreateDate_E });    //上傳日期(迄)
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getQuotBatchMaster]", paramL);
        }

        /// <summary>
        /// 查詢[團體件出單作業]明細檔
        /// </summary>
        /// <param name="sBatchNo">團體件序號</param>
        /// <returns>DataTable</returns>
        public DataTable GetQuotBatchQueryData(string sBatchNo)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iBatchNo", SqlDbType.VarChar) { Value = sBatchNo });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getQuotBatchQueryData]", paramL);
        }

        /// <summary>
        /// 查詢[大保單報價單]
        /// </summary>
        /// <param name="sAmwayNo">大保單號碼</param>
        /// <param name="sQuotDate_S">保單起日</param>
        /// <param name="sQuotDate_E">保單迄日</param>
        /// <param name="sBatchNo">團體件序號</param>
        /// <returns>DataTable</returns>
        public DataSet GetPrintAmwayData(string sAmwayNo, string sQuotDate_S, string sQuotDate_E, string sBatchNo)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iAmwayNo", SqlDbType.VarChar) { Value = sAmwayNo });               //大保單號碼
            paramL.Add(new SqlParameter("@iQuotDate_S", SqlDbType.VarChar) { Value = sQuotDate_S });        //保單起日
            paramL.Add(new SqlParameter("@iQuotDate_E", SqlDbType.VarChar) { Value = sQuotDate_E });        //保單迄日
            paramL.Add(new SqlParameter("@iBatchNo", SqlDbType.VarChar) { Value = sBatchNo });              //團體件序號
            return DBHelper.SPGetDataSet("[ERP].dbo.[usp_getPrintAmwayData]", paramL);
        }
    }
}