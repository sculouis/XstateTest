using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

/// <summary>
/// Class1 的摘要描述
/// </summary>
public class DAO_Payment
{
    /// <summary>
    /// 取得客票來源清單
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public DataTable GetZReasonSrc(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"SELECT DESCITEM , LONGDESC FROM POLDB_Trial..[DESC] 
                         JOIN POLDB_Trial..ITEMPF  ON ( [DESC].DESCTABL = ITEMPF.ITEMTABL AND [DESC].DESCITEM = ITEMPF.ITEMITEM AND ITEMPF.VALIDFLAG = '1' )
                         WHERE DESCTABL = 'T7794' AND LANGUAGE = 'C' AND DESCPFX = 'IT' ORDER BY DESCITEM";

        List<SqlParameter> param = new List<SqlParameter>();

        return DBHelper.GetDataTable(strSqlScript, param);
    }

    /// <summary>
    /// 確認票交所代號
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string ChkZnoTeex(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"SELECT DESCITEM , LONGDESC FROM POLDB_Trial..[DESC] WHERE DESCTABL = 'T9157' AND LANGUAGE = 'C' AND DESCITEM <> '' AND DESCITEM = @DESCITEM";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@DESCITEM", SqlDbType.VarChar, 2) { Value = htCondition["DESCITEM"] });

        object objResult = DBHelper.GetSingle(strSqlScript, param);

        return objResult != null ? objResult.ToString() : "N";
    }

    /// <summary>
    /// 確認付款行代號
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string ChkPayBank(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"SELECT BANKKEY , ZBUNME , ZBUNMEA FROM POLDB_Trial..[BABR] WHERE TODATE = 0 AND BANKKEY = @BANKKEY ORDER BY 2,3 ";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@BANKKEY", SqlDbType.VarChar, 7) { Value = htCondition["BANKKEY"] });

        object objResult = DBHelper.GetSingle(strSqlScript, param);

        return objResult != null ? objResult.ToString() : "N";
    }

    /// <summary>
    /// 發送郵件
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string SendMail(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript =  @"EXEC MSDB.DBO.SP_SEND_DBMAIL	
                        @PROFILE_NAME = '',	  --寄送郵件設定檔名
                        @SUBJECT = @C2,			          --主旨
                        @RECIPIENTS =@C3,			      --收件者
                        @BODY = @C4,			          --內文
                        @APPEND_QUERY_ERROR=1	          --有錯誤是否寄出";

        List<SqlParameter> param = new List<SqlParameter>();
        param.Add(new SqlParameter("@C2", SqlDbType.NVarChar, 30) { Value = htCondition["SUBJECT"] });
        param.Add(new SqlParameter("@C3", SqlDbType.NVarChar, 50) { Value = htCondition["RECIPIENTS"] });
        param.Add(new SqlParameter("@C4", SqlDbType.NVarChar, 2000) { Value = htCondition["BODY"] });

        object objResult = DBHelper.GetSingle(strSqlScript, param);

        return objResult != null ? objResult.ToString() : "";
    }

    public DataTable GetPaymentDatas(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"[ERP].dbo.[usp_getAnalogQry]";

        List<SqlParameter> param = new List<SqlParameter>();
        param.Add(new SqlParameter("@AGNTNUM", SqlDbType.VarChar, 8) { Value = htCondition["AGNTNUM"] });
        param.Add(new SqlParameter("@ACCNUM", SqlDbType.VarChar, 8) { Value = htCondition["ACCNUM"] });
        param.Add(new SqlParameter("@POLNUM", SqlDbType.VarChar, 8) { Value = htCondition["POLNUM"] });
        DataTable result = DBHelper.SPGetDataTable(strSqlScript, param);
        return result;
    }
}
public class ChkDrawerIdModel
{
    public string POLNUM { get; set; }
    public string TRANNO { get; set; }
    public string ID { get; set; }
    public string Result { get; set; }
    public int RowIndex { get; set; }
}