using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Hosting;
using System.Web.Http;
using Wwx.Data.SqlClient;
using WwxDemo.Models;

namespace WwxDemo.Controllers
{
    public class LidarConfigController : ApiController
    {
		public IEnumerable<LidarConfig> Get()
		{
			var configFiles = this.GetFilePaths();
			List<LidarConfig> configs = new List<LidarConfig>();
			foreach(var file in configFiles)
			{
				string fileContent = File.ReadAllText(file);
				dynamic d = JObject.Parse(fileContent);
				LidarConfig config = new LidarConfig() {
					Name= d.name,
					Data= fileContent
				};
				configs.Add(config);
			}
			return configs;
		}
		
		public HttpResponseMessage Get(string name)
		{
			string result;
			try
			{
				result = File.ReadAllText(HostingEnvironment.MapPath("~/Configurations/" + name + ".json"));
			}
			catch(Exception)
			{
				result = "Error could not find config with the specified name.";
			}
			return new HttpResponseMessage() {
				Content = new StringContent(result, System.Text.Encoding.UTF8, "application/json") 
			};
		}

		public bool Post([FromBody]LidarConfig config)
		{
			File.WriteAllText(HostingEnvironment.MapPath("~/Configurations/" + config.Name + ".json"), config.Data);
			return true;
		}

		private string[] GetFilePaths()
		{
			return Directory.GetFiles(HostingEnvironment.MapPath("~/Configurations"),"*.json");
		}
    }
}
