using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Wwx.Data.SqlClient;
using WwxDemo.Models;

namespace WwxDemo.DataSources
{
	public class DotsDataSource
	{
		ISqlDataSource DB = null;
		public DotsDataSource(SqlDBCredentials credentials)
		{
			DB = SqlConnectionPool.Instance(credentials).GetDataSource();
		}

		public List<LidarConfig> GetLidarConfigs()
		{
			return DB.QueryList<LidarConfig>(@"SELECT * FROM sitewerx.lidar_configs");
		}

		public DBResult InsertLidarConfig(LidarConfig config)
		{
			ISqlizable sql = DB.Format(@"
				INSERT INTO 
					sitewerx.lidar_configs (CONFIG_NAM, CONFIG_DATA)
				VALUES
					('{0}','{1}');
				", config.Name, config.Data);
			return DB.Insert(sql);
		}

		public DBResult UpdateLidarConfig(LidarConfig config)
		{
			ISqlizable sql = DB.Format(@"
				UPDATE
					sitewerx.lidar_configs
				SET 
					CONFIG_DATA = '{1}'
				WHERE
					CONFIG_ID = {0};
			", config.Id, config.Data);
			return DB.Update(sql);
		}
	}
}