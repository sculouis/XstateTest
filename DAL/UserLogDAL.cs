using Hotains.Models.DAO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Hotains.DAL
{
    public class UserLogDAL
    {
        public DataTable InsertLog(UserLog data)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            foreach (var pt in typeof(UserLog).GetProperties())
            {
                if(pt.Name != "SN" && pt.Name != "LogDate")
                {
                    var tmpVal = pt.GetValue(data);
                    paramL.Add(new SqlParameter("@i" + pt.Name, tmpVal == null ? DBNull.Value : tmpVal));
                }
            }
            var dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_insUserLog]", paramL);
            return dt;
        }
    }
}