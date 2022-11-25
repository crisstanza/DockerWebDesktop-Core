using io.github.crisstanza.csharputils;
using io.github.crisstanza.csharputils.constants;
using io.github.crisstanza.csharputils.server;
using io.github.crisstanza.csharputils.server.response;
using server.request.api;
using server.response.api;
using service;
using System;
using System.Net;

namespace controller
{
	public class DockerWebDesktopController : DockerWebDesktopControllerUtils, IDefaultController
	{
		public DockerWebDesktopController(CommandLineArguments args) : base(args)
		{
			this.service = new DockerWebDesktopService(args);
		}

		#region start stop end
		public void Start()
		{
			base.server.Start(this, args.SubnetMask);
		}
		public HttpListenerUtils.OutputBody Stop()
		{
			return new HttpListenerUtils.OutputBody()
			{
				Body = jsonUtils.SerializeToArray((object)new StopResponse()),
				ContentType = MediaTypeNamesConstants.APPLICATION_JSON,
				Status = HttpStatusCode.OK
			};
		}
		public void End()
		{
			base.server.Stop();
		}
		#endregion

		#region status
		public HttpListenerUtils.OutputBody ApiStatus()
		{
			return base.httpListenerUtils.DefaultJsonOutputBody(new ApiStatusResponse()
			{
				Data = this.service.ApiStatus()
			});
		}
		#endregion

		#region docker info
		public HttpListenerUtils.OutputBody ApiDockerInfo()
		{
			string data = this.service.ApiDockerInfo();
			return base.httpListenerUtils.DefaultTextOutputBody(data);
		}

		#endregion

		#region api dockerd
		public HttpListenerUtils.OutputBody ApiDockerD(string command)
		{
			ADefaultResponse output = new ApiDockerDResponse()
			{
				Status = this.service.ApiDockerD(command)
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		#endregion

		#region api images
		public HttpListenerUtils.OutputBody ApiImages()
		{
			ADefaultResponse output = new ApiImagesResponse()
			{
				Data = this.service.ApiImages()
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiImageRun(string repository, string tag, string imageId)
		{
			ADefaultResponse output = new ApiImageRunResponse()
			{
				Status = this.service.ApiImageRun(repository, tag, imageId).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiImageRemoveById(string imageId)
		{
			ADefaultResponse output = new ApiImageRemoveResponse()
			{
				Status = this.service.ApiImageRemoveById(imageId).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiImageRemove(string repository, string tag)
		{
			ADefaultResponse output = new ApiImageRemoveResponse()
			{
				Status = this.service.ApiImageRemove(repository, tag).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiImageInspect(string imageId)
		{
			ApiImageInspectResponse output = new ApiImageInspectResponse()
			{
				Data = this.service.ApiImageInspect(imageId)
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output.Data);
		}
		public HttpListenerUtils.OutputBody ApiImageHistory(string imageId)
		{
			ApiImageHistoryResponse output = new ApiImageHistoryResponse()
			{
				Data = this.service.ApiImageHistory(imageId)
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output.Data);
		}
		#endregion

		#region api settings
		public HttpListenerUtils.OutputBody ApiSettings(ApiSettingsRequest input)
		{
			ADefaultResponse output = new ApiSettingsResponse()
			{
				Data = this.service.ApiSettings(input)
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiSettingRun(string name, string version)
		{
			ADefaultResponse output = new ApiRunResponse()
			{
				Status = this.service.ApiSettingRun(name, version).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		#endregion

		#region api docker file
		public HttpListenerUtils.OutputBody ApiBuildDockerfile(string name, string version)
		{
			ADefaultResponse output = new ApiBuildDockerFileResponse()
			{
				Status = this.service.ApiBuildDockerfile(name, version).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		#endregion

		#region api docker compose yml
		public HttpListenerUtils.OutputBody ApiDeployDockerComposeYml(string name, string version)
		{
			ADefaultResponse output = new ApiDeployDockerComposeYmlResponse()
			{
				Status = this.service.ApiDeployDockerComposeYml(name, version).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		#endregion

		#region api instances
		public HttpListenerUtils.OutputBody ApiInstances(ApiInstancesRequest input)
		{
			ADefaultResponse output = new ApiInstancesResponse()
			{
				Data = this.service.ApiInstances(input)
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiInstanceStop(string containerId)
		{
			ADefaultResponse output = new ApiInstanceStopResponse()
			{
				Status = this.service.ApiInstanceStop(containerId).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiInstanceStart(string containerId)
		{
			ADefaultResponse output = new ApiInstanceStartResponse()
			{
				Status = this.service.ApiInstanceStart(containerId).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiInstanceRemove(string containerId)
		{
			ADefaultResponse output = new ApiInstanceRemoveResponse()
			{
				Status = this.service.ApiInstanceRemove(containerId).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiInstanceSee(string containerId)
		{
			ApiInstanceSeeResponse output = new ApiInstanceSeeResponse()
			{
				Data = this.service.ApiInstanceSee(containerId)
			};
			return base.httpListenerUtils.DefaultDownloadOutputBody(output.Data.Contents, output.Data.Name);
		}
		public HttpListenerUtils.OutputBody ApiInstanceInspect(string containerId)
		{
			string data = this.service.ApiInstanceInspect(containerId);
			return base.httpListenerUtils.DefaultJsonOutputBody(data);
		}
		public HttpListenerUtils.OutputBody ApiInstanceStats(string containerId)
		{
			string data = this.service.ApiInstanceStats(containerId);
			return base.httpListenerUtils.DefaultTextOutputBody(data);
		}
		public HttpListenerUtils.OutputBody ApiInstanceStatsSee(string containerId)
		{
			ApiInstanceStatsSeeResponse output = new ApiInstanceStatsSeeResponse()
			{
				Data = this.service.ApiInstanceStatsSee(containerId)
			};
			return base.httpListenerUtils.DefaultDownloadOutputBody(output.Data.Contents, output.Data.Name);
		}
		#endregion

		#region api stacks
		public HttpListenerUtils.OutputBody ApiStacks()
		{
			ADefaultResponse output = new ApiStacksResponse()
			{
				Data = this.service.ApiStacks()
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiStackRemove(string name)
		{
			ADefaultResponse output = new ApiStackRemoveResponse()
			{
				Status = this.service.ApiStackRemove(name).ExitCode
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		#endregion

		#region api networks
		public HttpListenerUtils.OutputBody ApiNetworks()
		{
			ADefaultResponse output = new ApiNetworksResponse()
			{
				Data = this.service.ApiNetworks()
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		public HttpListenerUtils.OutputBody ApiNetworkInspect(string networkId)
		{
			string data = this.service.ApiNetworkInspect(networkId);
			return base.httpListenerUtils.DefaultJsonOutputBody(data);
		}
		#endregion

		#region api disk usages
		public HttpListenerUtils.OutputBody ApiDiskUsages()
		{
			ADefaultResponse output = new ApiDiskUsagesResponse()
			{
				Data = this.service.ApiDiskUsages()
			};
			return base.httpListenerUtils.DefaultJsonOutputBody(output);
		}
		#endregion
	}
}
