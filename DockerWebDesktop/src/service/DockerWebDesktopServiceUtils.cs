using io.github.crisstanza.csharputils;

namespace service
{
	public class DockerWebDesktopServiceUtils
	{
		protected CommandLineArguments args;
		protected FileSystemUtils fileSystemUtils;
		protected RunTimeUtils runTimeUtils;
		protected StringUtils stringUtils;
		protected NetworkingUtils networkingUtils;
		protected JsonUtils jsonUtils;
		protected HttpClientUtils latestVersionChecker;

		public DockerWebDesktopServiceUtils(CommandLineArguments args)
		{
			this.args = args;
			this.fileSystemUtils = new FileSystemUtils();
			this.runTimeUtils = new RunTimeUtils(args.Debug);
			this.stringUtils = new StringUtils();
			this.networkingUtils = new NetworkingUtils();
			this.jsonUtils = new JsonUtils();
			this.latestVersionChecker = new HttpClientUtils("https://raw.githubusercontent.com/crisstanza/DockerWebDesktop-Core/main/DockerWebDesktop/DockerWebDesktop.csproj");
		}
	}
}