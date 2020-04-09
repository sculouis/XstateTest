using Hotains.Models.DAO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using static Hotains.Models.DAO.Assist;

namespace Hotains.DAL
{
    public class QuoteAssistDAL
    {
        /// <summary>
        /// 儲存輔助平台其餘資料
        /// </summary>
        /// <param name="assistData">輔助資料 model</param>
        /// <param name="sProgCode">創建程式</param>
        /// <param name="sProgCode">sLoginID</param>
        /// <returns></returns>
        public DataTable SaveQuoteAssist(AssistModel assistData, string sProgCode, string sLoginID)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iTxNo", SqlDbType.VarChar) { Value = assistData.txNo });
            paramL.Add(new SqlParameter("@iQuotNo", SqlDbType.VarChar) { Value = assistData.QuotNo });
            paramL.Add(new SqlParameter("@iCollectionType", SqlDbType.VarChar) { Value = assistData.collectionType });
            paramL.Add(new SqlParameter("@iViolateExtraFee", SqlDbType.VarChar) { Value = assistData.violateExtraFee });
            paramL.Add(new SqlParameter("@iViolateTimes", SqlDbType.VarChar) { Value = assistData.violateTimes });
            paramL.Add(new SqlParameter("@iStsseIno", SqlDbType.VarChar) { Value = assistData.StsseIno });
            paramL.Add(new SqlParameter("@iBizKind", SqlDbType.VarChar) { Value = assistData.bizKind });
            paramL.Add(new SqlParameter("@iTradingCompCode", SqlDbType.VarChar) { Value = assistData.tradingCompCode });
            paramL.Add(new SqlParameter("@iTradingCompUnitedNo", SqlDbType.VarChar) { Value = assistData.tradingCompUnitedNo });
            paramL.Add(new SqlParameter("@iTradingCompName", SqlDbType.VarChar) { Value = assistData.tradingCompName });
            paramL.Add(new SqlParameter("@iSiteNo", SqlDbType.VarChar) { Value = assistData.siteNo });
            paramL.Add(new SqlParameter("@iEreUser", SqlDbType.VarChar) { Value = assistData.EreUser });
            paramL.Add(new SqlParameter("@iCompTypeNo", SqlDbType.VarChar) { Value = assistData.compTypeNo });
            paramL.Add(new SqlParameter("@iOrgGrade", SqlDbType.VarChar) { Value = assistData.orgGrade });
            paramL.Add(new SqlParameter("@iProposalDate", SqlDbType.VarChar) { Value = assistData.proposalDate });
            paramL.Add(new SqlParameter("@iPaperOrNot", SqlDbType.VarChar) { Value = assistData.paperOrNot });
            paramL.Add(new SqlParameter("@iUserID", SqlDbType.VarChar) { Value = sLoginID });  //創建者
            paramL.Add(new SqlParameter("@iProgCode", SqlDbType.VarChar) { Value = sProgCode });  //創建程式
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_ins-altQuoteAssist]", paramL);
            return dt;
        }

        /// <summary>
        /// 查詢[輔助平台其他資料]資料表
        /// </summary>
        /// <param name="assistData">輔助資料 model</param>
        /// <returns></returns>
        public DataTable GetQuoteAssist(AssistModel assistData)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iTxNo", SqlDbType.VarChar) { Value = assistData.txNo });
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getQuoteAssist]", paramL);
            return dt;
        }

        /// <summary>
        /// 檢查是否投相關險種
        /// </summary>
        /// <param name="model">輔助資料 model</param>
        /// <returns></returns>
        public DataTable GetAssistInsureContent(AssistModel model)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iTxNo", SqlDbType.VarChar) { Value = model.txNo });
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getAssistInsureContent]", paramL);
            return dt;
        }
    }
}