using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

/// <summary>
///
/// </summary>
public class DAO_Quote
{

    /// <summary>
    /// 加總報價金額
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string sQuote_Sum(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = htCondition["SQL"] + @"SELECT Sum(Convert(int,MVPPREM)) FROM [ERP].[dbo].[sQuote_ReceiveDetail] WHERE 
                        OPERATION= @OPERATION AND NO=@NO AND CESSIONO=@CESSIONO";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@OPERATION", SqlDbType.VarChar, 8) { Value = htCondition["OPERATION"] });
        param.Add(new SqlParameter("@NO", SqlDbType.VarChar, 6) { Value = htCondition["NO"] });
        param.Add(new SqlParameter("@CESSIONO", SqlDbType.VarChar, 20) { Value = htCondition["CESSIONO"] });

        object objResult = DBHelper.GetSingle(strSqlScript, param);

        return objResult != null ? objResult.ToString() : "0";
    }

    /// <summary>
    /// 存入報價送出的主檔
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string sQuote_SendMaster(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"Insert Into [ERP].dbo.sQuote_SendMaster SELECT @OPERATION, @NO, @CESSIONO, @ZCHLCDE, @ZDRKIND, @ZCHLTYP, 
               @ZCAMPAN, @KIND, @ZCNAME, @MEMBSEL, @CLTTYPE, @CLTDOB, @CLTSEX, @CLTMARYD, @CTRYCODE, @USERID, @CNTBRANCH, 
               @AGNTNUM, @ZSBUCODE, @ZCOLLECT, @ALLOCSTAT, @TARGET, @ZAMWYCOD, @CAMPAN, @LIFEAGNT, @PAYPLAN, @ZAECARD, @ZEXPIRY, 
               @LICENSE, @NAMEEXTD, @PAYCTRYCOD, @MCPPOL, @MCPCCDATE, @MCPTERM, @MCPAGTO, @MCPDISAMT, @MCPPREM, @POLNUM, @MVPCCDATE, 
               @MVPTERM, @COMPFACT, @TPLFACT, @MVPDISAMT, @ZDISRAT, @MCPZMTYPE, @MVPZMTYPE, @YRMANF, @GETDATE, @ZREGNUM, @ZMAKE, @ZCC, @ZCARRY, 
               @ZCOMMD, @DTCSUM, @ZRPVALUE, @ZDEPCODE, @CARCNT,GETDATE();";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@OPERATION", SqlDbType.VarChar, 8) { Value = htCondition["OPERATION"] });
        param.Add(new SqlParameter("@NO", SqlDbType.VarChar, 6) { Value = htCondition["NO"] });
        param.Add(new SqlParameter("@CESSIONO", SqlDbType.VarChar, 20) { Value = htCondition["CESSIONO"] });
        param.Add(new SqlParameter("@ZCHLCDE", SqlDbType.VarChar, 4) { Value = htCondition["ZCHLCDE"] });
        param.Add(new SqlParameter("@ZDRKIND", SqlDbType.VarChar, 2) { Value = htCondition["ZDRKIND"] });
        param.Add(new SqlParameter("@ZCHLTYP", SqlDbType.VarChar, 1) { Value = htCondition["ZCHLTYP"] });
        param.Add(new SqlParameter("@ZCAMPAN", SqlDbType.VarChar, 8) { Value = htCondition["ZCAMPAN"] });
        param.Add(new SqlParameter("@KIND", SqlDbType.VarChar, 2) { Value = htCondition["KIND"] });
        param.Add(new SqlParameter("@ZCNAME", SqlDbType.VarChar, 60) { Value = htCondition["ZCNAME"] });
        param.Add(new SqlParameter("@MEMBSEL", SqlDbType.VarChar, 15) { Value = htCondition["MEMBSEL"] });
        param.Add(new SqlParameter("@CLTTYPE", SqlDbType.VarChar, 1) { Value = htCondition["CLTTYPE"] });
        param.Add(new SqlParameter("@CLTDOB", SqlDbType.VarChar, 8) { Value = htCondition["CLTDOB"] });
        param.Add(new SqlParameter("@CLTSEX", SqlDbType.VarChar, 1) { Value = htCondition["CLTSEX"] });
        param.Add(new SqlParameter("@CLTMARYD", SqlDbType.VarChar, 1) { Value = htCondition["CLTMARYD"] });
        param.Add(new SqlParameter("@CTRYCODE", SqlDbType.VarChar, 3) { Value = htCondition["CTRYCODE"] });
        param.Add(new SqlParameter("@USERID", SqlDbType.VarChar, 8) { Value = htCondition["USERID"] });
        param.Add(new SqlParameter("@CNTBRANCH", SqlDbType.VarChar, 2) { Value = htCondition["CNTBRANCH"] });
        param.Add(new SqlParameter("@AGNTNUM", SqlDbType.VarChar, 8) { Value = htCondition["AGNTNUM"] });
        param.Add(new SqlParameter("@ZSBUCODE", SqlDbType.VarChar, 3) { Value = htCondition["ZSBUCODE"] });
        param.Add(new SqlParameter("@ZCOLLECT", SqlDbType.VarChar, 2) { Value = htCondition["ZCOLLECT"] });
        param.Add(new SqlParameter("@ALLOCSTAT", SqlDbType.VarChar, 3) { Value = htCondition["ALLOCSTAT"] });
        param.Add(new SqlParameter("@TARGET", SqlDbType.VarChar, 3) { Value = htCondition["TARGET"] });
        param.Add(new SqlParameter("@ZAMWYCOD", SqlDbType.VarChar, 8) { Value = htCondition["ZAMWYCOD"] });
        param.Add(new SqlParameter("@CAMPAN", SqlDbType.VarChar, 8) { Value = htCondition["CAMPAN"] });
        param.Add(new SqlParameter("@LIFEAGNT", SqlDbType.VarChar, 8) { Value = htCondition["LIFEAGNT"] });
        param.Add(new SqlParameter("@PAYPLAN", SqlDbType.VarChar, 6) { Value = htCondition["PAYPLAN"] });
        param.Add(new SqlParameter("@ZAECARD", SqlDbType.VarChar, 16) { Value = htCondition["ZAECARD"] });
        param.Add(new SqlParameter("@ZEXPIRY", SqlDbType.VarChar, 6) { Value = htCondition["ZEXPIRY"] });
        param.Add(new SqlParameter("@LICENSE", SqlDbType.VarChar, 15) { Value = htCondition["LICENSE"] });
        param.Add(new SqlParameter("@NAMEEXTD", SqlDbType.VarChar, 60) { Value = htCondition["NAMEEXTD"] });
        param.Add(new SqlParameter("@PAYCTRYCOD", SqlDbType.VarChar, 3) { Value = htCondition["PAYCTRYCOD"] });
        param.Add(new SqlParameter("@MCPPOL", SqlDbType.VarChar, 8) { Value = htCondition["MCPPOL"] });
        param.Add(new SqlParameter("@MCPCCDATE", SqlDbType.VarChar, 8) { Value = htCondition["MCPCCDATE"] });
        param.Add(new SqlParameter("@MCPTERM", SqlDbType.VarChar, 2) { Value = htCondition["MCPTERM"] });
        param.Add(new SqlParameter("@MCPAGTO", SqlDbType.VarChar, 2) { Value = htCondition["MCPAGTO"] });
        param.Add(new SqlParameter("@MCPDISAMT", SqlDbType.VarChar, 9) { Value = htCondition["MCPDISAMT"] });
        param.Add(new SqlParameter("@MCPPREM", SqlDbType.VarChar, 9) { Value = htCondition["MCPPREM"] });
        param.Add(new SqlParameter("@POLNUM", SqlDbType.VarChar, 8) { Value = htCondition["POLNUM"] });
        param.Add(new SqlParameter("@MVPCCDATE", SqlDbType.VarChar, 8) { Value = htCondition["MVPCCDATE"] });
        param.Add(new SqlParameter("@MVPTERM", SqlDbType.VarChar, 2) { Value = htCondition["MVPTERM"] });
        param.Add(new SqlParameter("@COMPFACT", SqlDbType.VarChar, 5) { Value = htCondition["COMPFACT"] });
        param.Add(new SqlParameter("@TPLFACT", SqlDbType.VarChar, 5) { Value = htCondition["TPLFACT"] });
        param.Add(new SqlParameter("@MVPDISAMT", SqlDbType.VarChar, 9) { Value = htCondition["MVPDISAMT"] });
        param.Add(new SqlParameter("@ZDISRAT", SqlDbType.VarChar, 3) { Value = htCondition["ZDISRAT"] });
        param.Add(new SqlParameter("@MCPZMTYPE", SqlDbType.VarChar, 2) { Value = htCondition["MCPZMTYPE"] });
        param.Add(new SqlParameter("@MVPZMTYPE", SqlDbType.VarChar, 2) { Value = htCondition["MVPZMTYPE"] });
        param.Add(new SqlParameter("@YRMANF", SqlDbType.VarChar, 4) { Value = htCondition["YRMANF"] });
        param.Add(new SqlParameter("@GETDATE", SqlDbType.VarChar, 8) { Value = htCondition["GETDATE"] });
        param.Add(new SqlParameter("@ZREGNUM", SqlDbType.VarChar, 8) { Value = htCondition["ZREGNUM"] });
        param.Add(new SqlParameter("@ZMAKE", SqlDbType.VarChar, 8) { Value = htCondition["ZMAKE"] });
        param.Add(new SqlParameter("@ZCC", SqlDbType.VarChar, 5) { Value = htCondition["ZCC"] });
        param.Add(new SqlParameter("@ZCARRY", SqlDbType.VarChar, 4) { Value = htCondition["ZCARRY"] });
        param.Add(new SqlParameter("@ZCOMMD", SqlDbType.VarChar, 1) { Value = htCondition["ZCOMMD"] });
        param.Add(new SqlParameter("@DTCSUM", SqlDbType.VarChar, 9) { Value = htCondition["DTCSUM"] });
        param.Add(new SqlParameter("@ZRPVALUE", SqlDbType.VarChar, 9) { Value = htCondition["ZRPVALUE"] });
        param.Add(new SqlParameter("@ZDEPCODE", SqlDbType.VarChar, 1) { Value = htCondition["ZDEPCODE"] });
        param.Add(new SqlParameter("@CARCNT", SqlDbType.VarChar, 2) { Value = htCondition["CARCNT"] });

        return DBHelper.RecoverSQL(strSqlScript, param);
    }


    /// <summary>
    /// 存入報價送出的明細
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string sQuote_SendDetail(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"Insert Into [ERP].dbo.sQuote_SendDetail SELECT @OPERATION,@NO,@CESSIONO,@ZCVRTYPE,@SUMINA,@SUMINB,@SUMINC,@EXCESS,@ZDISCCD,@ZFACTORA,@ZFACTORB,@ZPREM;";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@OPERATION", SqlDbType.VarChar, 8) { Value = htCondition["OPERATION"] });
        param.Add(new SqlParameter("@NO", SqlDbType.VarChar, 6) { Value = htCondition["NO"] });
        param.Add(new SqlParameter("@CESSIONO", SqlDbType.VarChar, 20) { Value = htCondition["CESSIONO"] });
        param.Add(new SqlParameter("@ZCVRTYPE", SqlDbType.VarChar, 2) { Value = htCondition["ZCVRTYPE"] });
        param.Add(new SqlParameter("@SUMINA", SqlDbType.VarChar, 9) { Value = htCondition["SUMINA"] });
        param.Add(new SqlParameter("@SUMINB", SqlDbType.VarChar, 9) { Value = htCondition["SUMINB"] });
        param.Add(new SqlParameter("@SUMINC", SqlDbType.VarChar, 9) { Value = htCondition["SUMINC"] });
        param.Add(new SqlParameter("@EXCESS", SqlDbType.VarChar, 9) { Value = htCondition["EXCESS"] });
        param.Add(new SqlParameter("@ZDISCCD", SqlDbType.VarChar, 2) { Value = htCondition["ZDISCCD"] });
        param.Add(new SqlParameter("@ZFACTORA", SqlDbType.VarChar, 2) { Value = htCondition["ZFACTORA"] });
        param.Add(new SqlParameter("@ZFACTORB", SqlDbType.VarChar, 2) { Value = htCondition["ZFACTORB"] });
        param.Add(new SqlParameter("@ZPREM", SqlDbType.VarChar, 9) { Value = htCondition["ZPREM"] });

        return DBHelper.RecoverSQL(strSqlScript, param);
    }

    /// <summary>
    /// 存入報價收到的主檔
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string sQuote_ReceiveMaster(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"Insert Into [ERP].dbo.sQuote_ReceiveMaster SELECT @OPERATION, @NO, @CESSIONO, @ZCHLCDE, @ZCHLTYP, @ZDRKIND, 
                        @ZCAMPAN, @KIND, @MCPTYPE, @MCPAGE, @MCPTOT, @MCPPREM, @MVPTYPE, @MVPAGE, @DTCSUM, @ZRPVALUE, @ZAUTCLS,
                        @PRINTING,GETDATE();";

        List<SqlParameter> param = new List<SqlParameter>();
        param.Add(new SqlParameter("@OPERATION", SqlDbType.VarChar, 8) { Value = htCondition["OPERATION"] });
        param.Add(new SqlParameter("@NO", SqlDbType.VarChar, 6) { Value = htCondition["NO"] });
        param.Add(new SqlParameter("@CESSIONO", SqlDbType.VarChar, 20) { Value = htCondition["CESSIONO"] });
        param.Add(new SqlParameter("@ZCHLCDE", SqlDbType.VarChar, 4) { Value = htCondition["ZCHLCDE"] });
        param.Add(new SqlParameter("@ZCHLTYP", SqlDbType.VarChar, 1) { Value = htCondition["ZCHLTYP"] });
        param.Add(new SqlParameter("@ZDRKIND", SqlDbType.VarChar, 2) { Value = htCondition["ZDRKIND"] });
        param.Add(new SqlParameter("@ZCAMPAN", SqlDbType.VarChar, 8) { Value = htCondition["ZCAMPAN"] });
        param.Add(new SqlParameter("@KIND", SqlDbType.VarChar, 2) { Value = htCondition["KIND"] });
        param.Add(new SqlParameter("@MCPTYPE", SqlDbType.VarChar, 3) { Value = htCondition["MCPTYPE"] });
        param.Add(new SqlParameter("@MCPAGE", SqlDbType.VarChar, 2) { Value = htCondition["MCPAGE"] });
        param.Add(new SqlParameter("@MCPTOT", SqlDbType.VarChar, 9) { Value = htCondition["MCPTOT"] });
        param.Add(new SqlParameter("@MCPPREM", SqlDbType.VarChar, 9) { Value = htCondition["MCPPREM"] });
        param.Add(new SqlParameter("@MVPTYPE", SqlDbType.VarChar, 3) { Value = htCondition["MVPTYPE"] });
        param.Add(new SqlParameter("@MVPAGE", SqlDbType.VarChar, 2) { Value = htCondition["MVPAGE"] });
        param.Add(new SqlParameter("@DTCSUM", SqlDbType.VarChar, 9) { Value = htCondition["DTCSUM"] });
        param.Add(new SqlParameter("@ZRPVALUE", SqlDbType.VarChar, 9) { Value = htCondition["ZRPVALUE"] });
        param.Add(new SqlParameter("@ZAUTCLS", SqlDbType.VarChar, 1) { Value = htCondition["ZAUTCLS"] });
        param.Add(new SqlParameter("@PRINTING", SqlDbType.VarChar, 1) { Value = htCondition["PRINTING"] });

        return DBHelper.RecoverSQL(strSqlScript, param);
    }

    /// <summary>
    /// 存入報價收到的明細
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string sQuote_ReceiveDetail(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"Insert Into [ERP].dbo.sQuote_ReceiveDetail SELECT @OPERATION, @NO, @CESSIONO, @ZCVRTYPE, @MVPTOT, @MVPPREM;";

        List<SqlParameter> param = new List<SqlParameter>();
        param.Add(new SqlParameter("@OPERATION", SqlDbType.VarChar, 8) { Value = htCondition["OPERATION"] });
        param.Add(new SqlParameter("@NO", SqlDbType.VarChar, 6) { Value = htCondition["NO"] });
        param.Add(new SqlParameter("@CESSIONO", SqlDbType.VarChar, 20) { Value = htCondition["CESSIONO"] });
        param.Add(new SqlParameter("@ZCVRTYPE", SqlDbType.VarChar, 2) { Value = htCondition["ZCVRTYPE"] });
        param.Add(new SqlParameter("@MVPTOT", SqlDbType.VarChar, 9) { Value = htCondition["MVPTOT"] });
        param.Add(new SqlParameter("@MVPPREM", SqlDbType.VarChar, 9) { Value = htCondition["MVPPREM"] });

        return DBHelper.RecoverSQL(strSqlScript, param);
    }



    /// <summary>
    /// 確認ID
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string ChkAgent(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"SELECT ChannelCode +'-'+ ChannelType FROM [ERP].[dbo].[Host_Agent_Info] WHERE Agent_ID = @Agent_ID AND Agent_Code = @Agent_Code";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@Agent_ID", SqlDbType.VarChar, 20) { Value = htCondition["Agent_ID"] });

        param.Add(new SqlParameter("@Agent_Code", SqlDbType.VarChar, 10) { Value = htCondition["Agent_Code"] });

        object objResult = DBHelper.GetSingle(strSqlScript, param);

        return objResult != null ? objResult.ToString() : "Failed";
    }

    /// <summary>
    /// 取得廠牌清單
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public DataTable GetBrand(Hashtable htCondition)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"SELECT DISTINCT MakeCD , MakeDesc FROM [InsZurich_Trial].[dbo].[MotorMakeView] WHERE MakeDesc LIKE @KeyWord Order by MakeDesc,MakeCD";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@KeyWord", SqlDbType.NVarChar, 50) { Value = "%" + htCondition["KeyWord"] + "%"});

        return DBHelper.GetDataTable(strSqlScript, param);
    }

    /// <summary>
    /// 取得報價序號
    /// </summary>
    /// <param name="htCondition"></param>
    /// <returns></returns>
    public string QuoteNum()
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"SELECT NEXT VALUE FOR [ERP].dbo.sQuoteNum";

        List<SqlParameter> param = new List<SqlParameter>();

        object objResult = DBHelper.GetSingle(strSqlScript, param);

        return objResult != null ? objResult.ToString() : "";
    }

    public DataTable EasyQoutInsType(string sType, int ZCARRY)
    {
        string strSqlScript = string.Empty;

        strSqlScript = @"[ERP]..[usp_getEasyQoutInsType]";

        List<SqlParameter> param = new List<SqlParameter>();

        param.Add(new SqlParameter("@iSafeContentType", SqlDbType.VarChar, 2) { Value = sType });
        param.Add(new SqlParameter("@ZCARRY", SqlDbType.Int) { Value = ZCARRY });

        return DBHelper.SPGetDataTable(strSqlScript, param);

    }
}