using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNetCore.Mvc;

namespace VehicleQuote.Controllers
{
    public class MenusController : Controller
    {
        // GET: Menus
        public ActionResult Index()
        {
            return PartialView();
        }
    }
}