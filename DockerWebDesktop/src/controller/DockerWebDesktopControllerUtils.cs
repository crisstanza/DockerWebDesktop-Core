using io.github.crisstanza.csharputils;
using io.github.crisstanza.csharputils.service;
using service;

namespace controller
{
	public class DockerWebDesktopControllerUtils
	{
		protected DockerWebDesktopService service;
		protected readonly CommandLineArguments args;
		protected readonly HttpListenerService server;
		protected readonly JsonUtils jsonUtils;
		protected readonly HttpListenerUtils httpListenerUtils;
		protected readonly NetworkingUtils networkingUtils;

		public DockerWebDesktopControllerUtils(CommandLineArguments args)
		{
			this.service = new DockerWebDesktopService(args);
			this.args = args;
			this.server = new HttpListenerService(args.Host, args.Port);
			this.jsonUtils = new JsonUtils();
			this.httpListenerUtils = new HttpListenerUtils();
			this.networkingUtils = new NetworkingUtils();
		}
	}
}
