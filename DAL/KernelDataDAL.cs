using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;

namespace Hotains.DAL
{
    public class KernelDataDAL
    {
        /// <summary>
        /// 查詢[經手人]E-Mail資料
        /// </summary>
        /// <param name="sAGNTNUM">經手人代碼</param>
        /// <returns>SerializeObject</returns>
        public DataTable GetAgntEMail(string sAGNTNUM)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iAGNTNUM", SqlDbType.VarChar) { Value = sAGNTNUM });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getT8250_01]", paramL);
        }

        /// <summary>
        /// 查詢[活動方案]相關資訊
        /// </summary>
        /// <param name="sZCAMPAN">活動方案代碼</param>
        /// <param name="sMVPZMTYPE">車種</param>
        /// <param name="sCarAge">車齡</param>
        /// <param name="sZCARRY">乘載</param>
        /// <returns>SerializeObject</returns>
        public DataTable GetZCAMPAN(string sZCAMPAN, string sMVPZMTYPE, string sCarAge, string sZCARRY)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iZCAMPAN", SqlDbType.VarChar) { Value = sZCAMPAN });
            paramL.Add(new SqlParameter("@iMVPZMTYPE", SqlDbType.VarChar) { Value = sMVPZMTYPE });
            paramL.Add(new SqlParameter("@iCarAge", SqlDbType.VarChar) { Value = sCarAge });
            paramL.Add(new SqlParameter("@iZCARRY", SqlDbType.VarChar) { Value = sZCARRY });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getT8314_02]", paramL);
        }

        /// <summary>
        /// 取得FormID
        /// </summary>
        /// <param name="ITEMITEM">表單類型</param>
        /// <returns></returns>
        public DataTable GetFormID(string sITEMITEM)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("iITEMITEM", SqlDbType.VarChar) { Value = sITEMITEM });
            DataTable dt = DBHelper.SPGetDataTable("[ERP].dbo.[usp_getT7790_01]", paramL);
            return dt;
        }

        /// <summary>
        /// 查詢[主險種]清單
        /// </summary>
        /// <param name="sZCVRTYPE">險種代碼</param>        
        /// <returns>DataTable</returns>
        public DataTable GetMainInsureTypeList(string sZCVRTYPE)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iZCVRTYPE", SqlDbType.VarChar) { Value = sZCVRTYPE });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getT7689_02]", paramL);
        }

        /// <summary>
        /// 取得廠代限縮後的廠代
        /// </summary>
        /// <param name="MakeCD">廠牌代碼</param>
        /// <param name="CarType">車種</param>
        /// <returns>DataTable</returns>
        public DataTable GetAssistZMAKEList(string makeCD, string carType)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iMakeCD", SqlDbType.VarChar) { Value = makeCD });
            paramL.Add(new SqlParameter("@iCarType", SqlDbType.VarChar) { Value = string.IsNullOrWhiteSpace(carType) ? "" : carType });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getZMAKEList_Assist]", paramL);
        }

        /// <summary>
        /// 取得選單權限
        /// </summary>
        /// <param name="sLoginID">登入者ID</param>
        /// <returns></returns>
        public DataTable GetMenusAuthority(string sLoginID)
        {
            List<SqlParameter> paramL = new List<SqlParameter>();
            paramL.Add(new SqlParameter("@iLoginID", SqlDbType.VarChar) { Value = sLoginID });
            return DBHelper.SPGetDataTable("[ERP].dbo.[usp_getMenusAuthority]", paramL);            
        }
    }
}