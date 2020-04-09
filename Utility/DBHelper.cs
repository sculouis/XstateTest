using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

/// <summary>
/// DBService的摘要描述
/// </summary>
public static class DBHelper
{
    private static string SetConnName = ConfigurationManager.ConnectionStrings["WKPAY"].ConnectionString;
    /// <summary> 
    /// 查詢整個DataSet資料
    /// </summary> 
    /// <param name="SPName">查詢SQL語法</param> 
    /// <param name="cmdParms">查詢參數</param>
    /// <returns>DataSet</returns> 
    public static DataSet SPGetDataSet(string SPName, List<SqlParameter> cmdParms)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(SetConnName))
            {
                using (SqlCommand cmd = new SqlCommand(SPName, con))
                {
                    //將null值，轉為空字串
                    for (int j = 0; j < cmdParms.Count; j++)
                    {
                        if (cmdParms[j].Value == null)
                        {
                            cmdParms[j].Value = "";
                        }
                    }
                    PrepareCommand(cmd, con, null, "SP", SPName, cmdParms);
                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        DataSet ds = new DataSet();
                        da.SelectCommand.CommandTimeout = 120;
                        da.Fill(ds,"DT");
                        cmd.Parameters.Clear();
                        return ds;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "\r\n" + getSPSqlScript(SPName, cmdParms));
        }
    }

    /// <summary> 
    /// 查詢整個DataTable資料
    /// </summary> 
    /// <param name="SPName">查詢SQL語法</param> 
    /// <param name="cmdParms">查詢參數</param>
    /// <returns>DataTable</returns> 
    public static DataTable SPGetDataTable(string SPName, List<SqlParameter> cmdParms)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(SetConnName))
            {
                using (SqlCommand cmd = new SqlCommand(SPName, con))
                {
                    //將null值，轉為空字串
                    for (int j = 0; j < cmdParms.Count; j++)
                    {
                        if (cmdParms[j].Value == null)
                        {
                            cmdParms[j].Value = "";
                        }
                    }
                    PrepareCommand(cmd, con, null, "SP", SPName, cmdParms);
                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        da.SelectCommand.CommandTimeout = 120;
                        da.Fill(dt);
                        cmd.Parameters.Clear();
                        return dt;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "\r\n" + getSPSqlScript(SPName, cmdParms));
        }
    }

    /// <summary> 
    /// 查詢整個DataTable資料
    /// </summary> 
    /// <param name="SQLString">查詢SQL語法</param> 
    /// <param name="cmdParms">查詢參數</param>
    /// <returns>DataTable</returns> 
    public static DataTable GetDataTable(string strSQL, List<SqlParameter> cmdParms)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(SetConnName))
            {
                using (SqlCommand cmd = new SqlCommand(strSQL, con))
                {
                    PrepareCommand(cmd, con, null, "SQL", strSQL, cmdParms);

                    using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        DataSet ds = new DataSet();
                        da.SelectCommand.CommandTimeout = 120;
                        da.Fill(dt);
                        //da.Fill(ds, "ds");
                        //dt = ds.Tables[0];
                        cmd.Parameters.Clear();
                        return dt;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "\r\n" + RecoverSQL(strSQL, cmdParms));
        }
    }

    /// <summary> 
    /// 查詢單一欄位的值
    /// </summary> 
    /// <param name="SQLString">查詢SQL語法</param> 
    /// <param name="cmdParms">查詢參數</param>
    /// <returns>單一欄位值</returns> 
    public static object GetSingle(string strSQL, List<SqlParameter> cmdParms)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(SetConnName))
            {
                using (SqlCommand cmd = new SqlCommand())
                {
                    PrepareCommand(cmd, con, null, "SQL", strSQL, cmdParms);
                    object obj = cmd.ExecuteScalar();
                    cmd.Parameters.Clear();

                    if ((Object.Equals(obj, null)) || (Object.Equals(obj, System.DBNull.Value)))
                    {
                        return null;
                    }
                    else
                    {
                        return obj;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "\r\n" + RecoverSQL(strSQL, cmdParms));
        }
    }

    /// <summary>
    /// 設定SQL連線、語法、參數
    /// </summary>
    /// <param name="cmd">SQL Command</param>
    /// <param name="conn">連線字串</param>
    /// <param name="trans">SQL交易</param>
    /// <param name="cmdType">查詢方式(SQL or SP => Stored Procedure)</param>
    /// <param name="cmdText">查詢SQL語法</param>
    /// <param name="cmdParms">查詢參數</param>
    private static void PrepareCommand(SqlCommand cmd, SqlConnection conn, SqlTransaction trans, string cmdType, string cmdText, List<SqlParameter> cmdParms)
    {
        //如果是正式機，將_Trial移除
        string strDbMode = ConfigurationManager.AppSettings["DbMode"];
        if (strDbMode == "PD") cmdText = cmdText.Replace("_Trial", "");

        if (conn.State != ConnectionState.Open)
            conn.Open();

        cmd.Connection = conn;
        cmd.CommandTimeout = 1200;
        cmd.CommandText = cmdText;

        //執行一般SQL語法
        if (cmdType == "SQL")
            cmd.CommandType = CommandType.Text;
        //執行預存程序
        if (cmdType == "SP")
            cmd.CommandType = CommandType.StoredProcedure;

        if (trans != null)
            cmd.Transaction = trans;

        if (cmdParms != null)
        {
            foreach (SqlParameter parm in cmdParms)
                cmd.Parameters.Add(parm);
        }
    }

    /// <summary>
    /// 還原SQL語法內的參數，記錄至Error Log
    /// </summary>
    /// <param name="SQL">SQL語法</param>
    /// <param name="Parames">參數</param>
    /// <returns></returns>
    public static string RecoverSQL(string SQL, List<SqlParameter> Parames)
    {
        string Message = SQL;

        if (Parames != null)
        {
            foreach (SqlParameter Parame in Parames.ToArray())
            {
                Message = Message.Replace(Parame.ParameterName, Parame.Value == null ? "" : "'" + Parame.Value.ToString() + "'");
            }
        }
        return Message;
    }

    /// <summary>
    /// 查詢SQL語法內容
    /// </summary>
    /// <param name="sSPName">SP名稱</param>
    /// <param name="Parame">參數</param>
    /// <returns>輸入字串 或 空白</returns>
    public static string getSPSqlScript(string sSPName, List<SqlParameter> Parame)
    {
        string sParms = "";
        for (int j = 0; j < Parame.Count; j++)
        {
            sParms += Parame[j].ParameterName + "=" + (Parame[j].Value == null ? "''" : "'" + Parame[j].Value.ToString() + "'") + ",";
        }
        sParms = "EXEC " + sSPName + " " + sParms;
        return sParms;
    }

    /// <summary>
    /// Converts a DataTable to a dictionary. (NON PERFORMANT)
    /// </summary>
    /// <remarks>
    /// This method is usually used when running dynamic sql in databases that don't support
    /// stored procs. The columns returned are unknown so we create a dictionary which AutoMapper
    /// will use to match properties on the DTOs
    /// </remarks>
    /// <param name="dt">The dt.</param>
    /// <returns></returns>
    public static List<Dictionary<string, object>> DataTableToDictionary(this DataTable dt)
    {
        List<Dictionary<string, object>> dictionaries = new List<Dictionary<string, object>>();
        foreach (DataRow row in dt.Rows)
        {
            Dictionary<string, object> dictionary = Enumerable.Range(0, dt.Columns.Count)
                .ToDictionary(i => dt.Columns[i].ColumnName, i => row.ItemArray[i]);

            dictionaries.Add(dictionary);
        }
        return dictionaries;
    }
}