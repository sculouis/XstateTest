using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNetCore.Mvc;

namespace VehicleQuote.Controllers
{
    public class QuotationController : Controller
    {
        #region 建立新報價單
        // GET: QuotationEdit
        public ActionResult QuotationEdit()
        {
            return View();
        }


        #endregion
    }
}