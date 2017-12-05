using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WwxDemo.Controllers
{
    public class AppController : Controller
    {
		[Route("")]
        public ActionResult Index()
        {
            return View();
        }
    }
}