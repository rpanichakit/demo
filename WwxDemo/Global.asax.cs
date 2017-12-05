using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using Wwx.Data.SqlClient;
using WwxDemo.App_Start;
using WwxDemo.DataSources;
using WwxDemo.Filters;

namespace WwxDemo
{
	public class Global : System.Web.HttpApplication
	{
		private static SqlDBCredentials Credentials
		{
			get
			{
				return new SqlDBCredentials("MySQL Native Driver", "webdev1dbl01", "sitewerx", "webconsole", "passw0rd");
			}
		}

		private static DotsDataSource _DotsDataSource;
		public static DotsDataSource DotsDataSource
		{
			get
			{
				if(_DotsDataSource == null)
				{
					_DotsDataSource = new DotsDataSource(Credentials);
				}
				return _DotsDataSource;
			}
		}

		private static void RegisterGlobalFilters(GlobalFilterCollection filters)
		{
			filters.Add(new AuthFilter());
		}

		protected void Application_Start(object sender, EventArgs e)
		{
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			BundleConfig.RegisterBundles(BundleTable.Bundles);
			Kentor.AuthServices.Configuration.Options.GlobalEnableSha256XmlSignatures();
			GlobalConfiguration.Configure(WebApiConfig.Register);
			//RegisterGlobalFilters(GlobalFilters.Filters);
			ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;
		}

		protected void Session_Start(object sender, EventArgs e)
		{

		}

		protected void Application_BeginRequest(object sender, EventArgs e)
		{

		}

		protected void Application_AuthenticateRequest(object sender, EventArgs e)
		{

		}

		protected void Application_Error(object sender, EventArgs e)
		{

		}

		protected void Session_End(object sender, EventArgs e)
		{

		}

		protected void Application_End(object sender, EventArgs e)
		{

		}
	}
}