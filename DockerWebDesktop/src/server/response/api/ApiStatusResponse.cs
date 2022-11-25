using io.github.crisstanza.csharputils.server.response;

namespace server.response.api
{
	public class ApiStatusResponse : ADefaultResponse
	{
		public ApiStatus Data { get; set; }
	}
}
