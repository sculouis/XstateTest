using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Hotains.DAL
{
    public class Public_CityDAL
    {
        /// <summary>
        /// 查詢[地址]下拉選單內容
        /// </summary>
        /// <param name="sCityNo"></param>
        /// <param name="sAreaNo"></param>
        /// <returns>SerializeObject</returns>
        public DataTable GetDDL_Address(string sCityNo, string sAreaNo)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@CityNo", SqlDbType.VarChar, 2) { Value = sCityNo });
            paramL.Add(new SqlParameter("@AreaNo", SqlDbType.VarChar, 3) { Value = sAreaNo });
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getCITYCODE]", paramL);
            return dt;
        }
    }
}