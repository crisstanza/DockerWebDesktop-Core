using io.github.crisstanza.csharputils.server.response;

namespace server.response.api
{
	public class ApiRunResponse : ADefaultResponse
	{
		public int Status { get; set; }
		public string Output { get; set; }
	}
}
