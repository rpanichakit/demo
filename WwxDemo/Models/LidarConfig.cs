using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Wwx.Data.SqlClient;

namespace WwxDemo.Models
{
	public class LidarConfig : ILoadable
	{
		public uint Id { get;set;}
		public string Name { get;set;}
		public string Data { get;set;}
		public void LoadFrom(IDatabaseDataReader reader)
		{
			Id = reader.GetValue<uint>("CONFIG_ID");
			Name = reader.GetValue<string>("CONFIG_NAM");
			Data = reader.GetValue<string>("CONFIG_DATA");
		}
	}
}