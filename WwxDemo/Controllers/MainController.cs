using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WwxDemo.Controllers
{
    public class MainController : Controller
    {
        [Route("Main")]
        public ActionResult Index()
        {
            return View();
        }
    }
}