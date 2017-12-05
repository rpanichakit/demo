using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using WwxDemo.Filters;

namespace WwxDemo.App_Start
{
	public class WebApiConfig
	{
		public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

			config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
			config.Formatters.JsonFormatter.UseDataContractJsonSerializer = false;
			//var cors = new EnableCorsAttribute("http://localhost:4200", "*", "*");
			//config.EnableCors(cors);

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

			// config.Filters.Add(new ApiAuthFilter());
        }
	}
}