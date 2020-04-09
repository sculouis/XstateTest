using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Hotains.DAL
{
    public class Sys_CodeDAL
    {
        /// <summary>
        /// 查詢[系統代碼表]選單內容
        /// </summary>
        /// <param name="sCodeNo">代碼編號</param>
        /// <param name="sCodeItem1">代碼層級1</param>
        /// <param name="sCodeItem2">代碼層級2</param>
        /// <param name="sCodeItem3">代碼層級3</param>
        /// <param name="sIsDel">是否刪除(0:未刪除,1:已刪除)</param>
        /// <param name="sIsValid">是否有效(1:有效,2:無效)</param>
        /// <param name="sIsShowValid">是否只顯示有效日期區間內的資料(Y:是,N:否)</param>
        /// <returns>SerializeObject</returns>
        public DataTable GetSYSCODEtb(string sCodeNo, string sCodeItem1, string sCodeItem2, string sCodeItem3
          , string sIsDel = "0", string sIsValid = "1", string sIsShowValid = "Y")
        {
            if (sCodeNo == null || sCodeNo == string.Empty)
                return new DataTable();

            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iCodeNo", SqlDbType.VarChar) { Value = sCodeNo });
            paramL.Add(new SqlParameter("@iCodeItem1", SqlDbType.VarChar) { Value = sCodeItem1 });
            paramL.Add(new SqlParameter("@iCodeItem2", SqlDbType.VarChar) { Value = sCodeItem2 });
            paramL.Add(new SqlParameter("@iCodeItem3", SqlDbType.VarChar) { Value = sCodeItem3 });
            paramL.Add(new SqlParameter("@iIsDel", SqlDbType.VarChar) { Value = sIsDel });
            paramL.Add(new SqlParameter("@iIsValid", SqlDbType.VarChar) { Value = sIsValid });
            paramL.Add(new SqlParameter("@iIsShowValid", SqlDbType.VarChar) { Value = sIsShowValid });

            string sParms = "";
            foreach (SqlParameter Parame in paramL.ToArray())
            {
                sParms += Parame.ParameterName + "=" + (Parame.Value == null ? "''" : "'" + Parame.Value.ToString() + "'") + ",";
            }
            sParms = "EXEC [usp_getSYSCODE] " + sParms;
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getSYSCODE]", paramL);
            return dt;
        }
    }
}