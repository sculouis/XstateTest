using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using static Hotains.Models.DAO.Assist;

namespace Hotains.DAL
{
    public class OriginAssistDataDAL
    {
        /// <summary>
        /// 儲存SDS取回輔助平台來源資料
        /// </summary>
        /// <param name="originAssistData">輔助平台來源資料</param>
        /// <returns></returns>
        public DataTable SaveOriginAssistData(OriginAssistData originAssistData, string sLoginID)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iProposalData", SqlDbType.VarChar) { Value = JsonConvert.SerializeObject(originAssistData.proposalData) });    //輔助平台原始資料
            paramL.Add(new SqlParameter("@iResultCode", SqlDbType.VarChar) { Value = originAssistData.resultCode });	    //回覆代碼
            paramL.Add(new SqlParameter("@iResultMsg", SqlDbType.VarChar) { Value = originAssistData.resultMsg });	        //回覆訊息
            paramL.Add(new SqlParameter("@iUserID", SqlDbType.VarChar) { Value = sLoginID });	                            //創建者
            paramL.Add(new SqlParameter("@iProgCode", SqlDbType.VarChar) { Value = "SavOriAss" });	                        //創建程式
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_insOriginAssistData]", paramL);

        }

        /// <summary>
        /// 取得輔助平台原始資料
        /// </summary>
        /// <param name="OriginNo">輔助平台原始資料序號</param>
        /// <returns></returns>
        public DataTable GetOriginAssistData(Guid OriginNo)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iOriginNo", SqlDbType.UniqueIdentifier) { Value = OriginNo });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getOriginAssistData]", paramL);
        }
    }
}