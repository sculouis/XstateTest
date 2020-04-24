using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Hotains.Utility;
using Microsoft.AspNetCore.Mvc;

namespace VehicleQuote.Controllers
{
    public class QuotationController : Controller
    {
        string _DXPUrl = "https://ibm6-hot-app01.eisgroup.com/";

        #region 建立新報價單
        // GET: QuotationEdit
        public ActionResult QuotationEdit()
        {
            return View();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> LookupNameAttributes(string lookType)
        {
            var urlString = $"{_DXPUrl}/agent/v1/lookups/{lookType}/attributes";
            var apiHelper = new APIHelper();
            var items = await apiHelper.GetStringData(urlString);
            return Json(items);
        }


        #endregion
    }
}