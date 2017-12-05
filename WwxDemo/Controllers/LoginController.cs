using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WwxDemo.Controllers
{
	[AllowAnonymous]
    public class LoginController : Controller
    {
		[Route("Login")]
		[HttpGet]
        public ActionResult Index()
        {
            return View();
        }
    }
}