using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using static DAO_Quotation;

namespace Hotains.DAL
{
    public class QuoteKYCDAL
    {
        public DataTable Ins_AltQuoteKYC(QuoteKYC quoteKYCData)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            foreach (var pt in typeof(DAO_Quotation.QuoteKYC).GetProperties())
            {
                var tmpVal = pt.GetValue(quoteKYCData);
                paramL.Add(new SqlParameter("@i" + pt.Name, tmpVal == null ? DBNull.Value : tmpVal));
            }
            var dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_ins-altQuoteKYC]", paramL);
            return dt;
        }


        /// <summary>
        /// 刪除 QuoteKYC 資料
        /// </summary>
        /// <param name="sQuotNo">web 報價單號碼</param>
        /// <returns></returns>
        public DataTable DeleteQuoteKYC(string sQuotNo)
        {
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_delQuoteKYC]", new List<SqlParameter>() { new SqlParameter("@iQuotNo", sQuotNo) });
        }
    }
}