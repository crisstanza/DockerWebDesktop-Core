﻿using io.github.crisstanza.csharputils;

namespace service
{
	public class DockerWebDesktopServiceUtils
	{
		protected CommandLineArguments args;
		protected FileSystemUtils fileSystemUtils;
		protected RunTimeUtils runTimeUtils;
		protected StringUtils stringUtils;
		protected NetworkingUtils networkingUtils;

		public DockerWebDesktopServiceUtils(CommandLineArguments args)
		{
			this.args = args;
			this.fileSystemUtils = new FileSystemUtils();
			this.runTimeUtils = new RunTimeUtils();
			this.stringUtils = new StringUtils();
			this.networkingUtils = new NetworkingUtils();
		}
	}
}