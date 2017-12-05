using System;
using System.Collections.Generic;
using System.IdentityModel.Services;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using AuthorizationContext = System.Web.Mvc.AuthorizationContext;

namespace WwxDemo.Filters
{
	public class AuthFilter : AuthorizeAttribute
	{
		public class AuthenticationResult
		{
			public bool Success { get; set; }
			public bool TicketExpired { get; set; }
		}

		protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
		{
			string[] configs = filterContext.HttpContext.Request.QueryString.GetValues("config");
			string[] views = filterContext.HttpContext.Request.QueryString.GetValues("view");
			string configName = null;
			string view = null;
			if(configs != null)
			{
				configName = configs[0];
			}
			if(views != null)
			{
				view = views[0];
			}

			string returnUrl = "/";
			if (!string.IsNullOrEmpty(configName) || !string.IsNullOrEmpty(view))
			{
				returnUrl += "?";
				if(!string.IsNullOrEmpty(configName))
				{
					returnUrl += "config=" + configName;
				}
				if(!string.IsNullOrEmpty(view))
				{
					if (!string.IsNullOrEmpty(configName))
					{
						returnUrl += "&";
					}
					returnUrl += "view=" + view;
				}
			}

			filterContext.Result = new RedirectResult("/AuthServices/SignIn?ReturnUrl=" + HttpUtility.UrlEncode(returnUrl));
		}

		protected override bool AuthorizeCore(HttpContextBase httpContext)
		{
			bool isValidUser = false;
			try
			{
				var identity = System.Web.HttpContext.Current.User.Identity as ClaimsIdentity;
				SessionSecurityToken token;
				if (FederatedAuthentication.SessionAuthenticationModule.TryReadSessionTokenFromCookie(out token))
				{
					if (token.ValidTo > DateTime.UtcNow)
					{
						isValidUser = true;
					}
				}
			}
			catch(Exception)
			{
				isValidUser = false;
			}
			return isValidUser;
		}
	}
}