using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Hotains.DAL
{
    public class QuotInsTypeDAL
    {
        /// <summary>
        /// 查詢[報價單險種]資料
        /// </summary>
        /// <param name="sQuotNo">報價單編號</param>
        /// <param name="sIsDel">是否刪除(0:未刪除,1:已刪除)</param>
        /// <param name="sIsValid">是否有效(1:有效,2:無效)</param>
        /// <returns>SerializeObject</returns>
        public DataTable GetQuotIns(string sQuotNo, string sIsDel = "0", string sIsValid = "1")
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iQuotNo", SqlDbType.VarChar, 11) { Value = sQuotNo });
            paramL.Add(new SqlParameter("@iIsDel", SqlDbType.VarChar, 1) { Value = sIsDel });
            paramL.Add(new SqlParameter("@iIsValid", SqlDbType.VarChar, 1) { Value = sIsValid });
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getQuotInsType]", paramL);
            return dt;
        }
    }
}