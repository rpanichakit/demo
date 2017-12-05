using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace WwxDemo.App_Start
{
	public class BundleConfig
	{
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.Add(new ScriptBundle("~/bundles/scripts/app")
				.Include(
					"~/app/app.js",
					"~/app/toolbar/toolbar.model.js",
					"~/app/live-positions/live-positions.service.js",
					"~/app/live-positions/live-positions.component.js"
				)
			);

			bundles.Add(new StyleBundle("~/bundles/styles/app")
				.Include(
				"~/app/styles/app.css"
				)
			);

			bundles.Add(new StyleBundle("~/LoginCss")
				.Include("~/Styles/Login.css")
			);

			bundles.Add(new ScriptBundle("~/bundles/scripts/main")
				.Include(
					"~/app/app.js",
					"~/app/toolbar/toolbar.model.js",
					"~/app/toolbar/toolbar-item.component.js",
					"~/app/toolbar/toolbar.component.js",
					"~/app/powered-by/powered-by.component.js",
					"~/app/main/main.component.js"
				)
			);

			bundles.Add(new StyleBundle("~/bundles/styles/main")
				.Include(
				"~/app/main/main.component.css",
				"~/app/toolbar/toolbar.component.css",
				"~/app/powered-by/powered-by.component.css"
				)
			);
		}
	}
}