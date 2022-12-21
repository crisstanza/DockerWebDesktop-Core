using io.github.crisstanza.csharputils.server.response;

namespace server.response.api
{
	public class ApiImageRunResponse : ADefaultResponse
	{
		public int Status { get; set; }
		public string Output { get; set; }
	}
}
