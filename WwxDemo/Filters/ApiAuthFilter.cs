using System;
using System.Collections.Generic;
using System.IdentityModel.Services;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace WwxDemo.Filters
{
	public class ApiAuthFilter : AuthorizeAttribute
	{
		protected override void HandleUnauthorizedRequest(HttpActionContext context)
		{
			context.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
		}

		protected override bool IsAuthorized(HttpActionContext actionContext)
		{
			bool isValidUser = false;
			try
			{
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