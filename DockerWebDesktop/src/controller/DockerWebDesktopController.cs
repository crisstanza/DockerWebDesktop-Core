using io.github.crisstanza.commandliner;
using io.github.crisstanza.csharputils;
using io.github.crisstanza.csharputils.constants;
using io.github.crisstanza.csharputils.server;
using io.github.crisstanza.csharputils.server.response;
using server.request.api;
using server.response.api;
using service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;

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
            Dictionary<string, string> extras = new Dictionary<string, string>();
            IPAddress localAddress = base.networkingUtils.GetLocalAddress(IPAddress.Parse(args.SubnetMask));
            extras.Add("Debug", this.args.Debug.ToString());
            if (localAddress != null)
            {
                extras.Add("Local address", localAddress.ToString());
            }
            extras.Add("Settings home", this.args.SettingsHome);
            Dictionary<string, string> dependencies = new Dictionary<string, string>()
                {
                    { "CommandLiner-Core", CommandLinerCore.Version() },
                    { "CSharpUtils-Core", CSharpUtilsCore.Version() }
                };
            base.server.Start(this, DockerWebDesktop.Version(), dependencies, extras);
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

        #region check for updates
        public void StartCheckForUpdates()
        {
            if (this.args.CheckForUpdatesInterval > 0)
            {
                Thread checkConnectionsThread = new Thread(CheckForUpdates);
                checkConnectionsThread.Start();
            }
        }
        private void CheckForUpdates()
        {
            // https://raw.githubusercontent.com/crisstanza/DockerWebDesktop-Core/main/DockerWebDesktop/DockerWebDesktop.csproj
			Console.WriteLine("checking... " + DateTime.Now.ToString());
            TimeSpan interval = TimeSpan.FromMinutes(this.args.CheckForUpdatesInterval);
            Thread.Sleep((int)interval.TotalMilliseconds);
            CheckForUpdates();
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

        #region docker
        public HttpListenerUtils.OutputBody ApiDockerInfo()
        {
            return base.httpListenerUtils.DefaultTextOutputBody(this.service.ApiDockerInfo());
        }
        public HttpListenerUtils.OutputBody ApiDockerVersion()
        {
            return base.httpListenerUtils.DefaultTextOutputBody(this.service.ApiDockerVersion());
        }
        #endregion

        #region api dockerd
        public HttpListenerUtils.OutputBody ApiDockerD(string command)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiDockerD(command);
            ADefaultResponse output = new ApiDockerDResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion

        #region api swarm
        public HttpListenerUtils.OutputBody ApiSwarm(string command)
        {
            RunTimeUtils.ExecResult execResult = this.service.Swarm(command);
            ADefaultResponse output = new ApiSwarmResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
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
            RunTimeUtils.ExecResult execResult = this.service.ApiImageRun(repository, tag, imageId);
            ADefaultResponse output = new ApiImageRunResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        public HttpListenerUtils.OutputBody ApiImageRemoveById(string imageId)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiImageRemoveById(imageId);
            ADefaultResponse output = new ApiImageRemoveResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        public HttpListenerUtils.OutputBody ApiImageRemove(string repository, string tag)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiImageRemove(repository, tag);
            ADefaultResponse output = new ApiImageRemoveResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
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
            return base.httpListenerUtils.DefaultTextOutputBody(output.Data);
        }
        public HttpListenerUtils.OutputBody ApiImagePrune()
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiImagePrune();
            ADefaultResponse output = new ApiImagePruneResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
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
            RunTimeUtils.ExecResult execResult = this.service.ApiSettingRun(name, version);
            ADefaultResponse output = new ApiRunResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion

        #region api docker file
        public HttpListenerUtils.OutputBody ApiBuildDockerfile(string name, string version)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiBuildDockerfile(name, version);
            ADefaultResponse output = new ApiBuildDockerFileResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion

        #region api docker compose yml
        public HttpListenerUtils.OutputBody ApiDeployDockerComposeYml(string name, string version)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiDeployDockerComposeYml(name, version);
            ADefaultResponse output = new ApiDeployDockerComposeYmlResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
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
            RunTimeUtils.ExecResult execResult = this.service.ApiInstanceStop(containerId);
            ADefaultResponse output = new ApiInstanceStopResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        public HttpListenerUtils.OutputBody ApiInstanceStart(string containerId)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiInstanceStart(containerId);
            ADefaultResponse output = new ApiInstanceStartResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        public HttpListenerUtils.OutputBody ApiInstanceRemove(string containerId)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiInstanceRemove(containerId);
            ADefaultResponse output = new ApiInstanceRemoveResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        public HttpListenerUtils.OutputBody ApiInstanceSee(string containerId)
        {
            DownloadFile fileToDownload = this.service.ApiInstanceSee(containerId);
            return base.httpListenerUtils.DefaultDownloadOutputBody(fileToDownload.Contents, fileToDownload.Name);
        }
        public HttpListenerUtils.OutputBody ApiInstanceInspect(string containerId)
        {
            return base.httpListenerUtils.DefaultJsonOutputBody(this.service.ApiInstanceInspect(containerId));
        }
        public HttpListenerUtils.OutputBody ApiInstanceStats(string containerId)
        {
            return base.httpListenerUtils.DefaultTextOutputBody(this.service.ApiInstanceStats(containerId));
        }
        public HttpListenerUtils.OutputBody ApiInstanceLogs(string containerId)
        {
            return base.httpListenerUtils.DefaultTextOutputBody(this.service.ApiInstanceLogs(containerId));
        }
        public HttpListenerUtils.OutputBody ApiInstanceStatsSee(string containerId)
        {
            DownloadFile fileToDownload = this.service.ApiInstanceStatsSee(containerId);
            return base.httpListenerUtils.DefaultDownloadOutputBody(fileToDownload.Contents, fileToDownload.Name);
        }
        public HttpListenerUtils.OutputBody ApiInstanceLogsSee(string containerId)
        {
            DownloadFile fileToDownload = this.service.ApiInstanceLogsSee(containerId);
            return base.httpListenerUtils.DefaultDownloadOutputBody(fileToDownload.Contents, fileToDownload.Name);
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
            RunTimeUtils.ExecResult execResult = this.service.ApiStackRemove(name);
            ADefaultResponse output = new ApiStackRemoveResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion

        #region api nodes
        public HttpListenerUtils.OutputBody ApiNodes()
        {
            ADefaultResponse output = new ApiNodesResponse()
            {
                Data = this.service.ApiNodes()
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        public HttpListenerUtils.OutputBody ApiNodeInspect(string id)
        {
            return base.httpListenerUtils.DefaultJsonOutputBody(this.service.ApiNodeInspect(id));
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
        public HttpListenerUtils.OutputBody ApiNetworkRemove(string networkId)
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiNetworkRemove(networkId);
            ADefaultResponse output = new ApiNetworkRemoveResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
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

        #region api builder
        public HttpListenerUtils.OutputBody ApiBuilderPrune()
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiBuilderPrune();
            ADefaultResponse output = new ApiBuilderPruneResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion

        #region api volumes
        public HttpListenerUtils.OutputBody ApiVolumePrune()
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiVolumePrune();
            ADefaultResponse output = new ApiVolumePruneResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion

        #region api container
        public HttpListenerUtils.OutputBody ApiContainerPrune()
        {
            RunTimeUtils.ExecResult execResult = this.service.ApiContainerPrune();
            ADefaultResponse output = new ApiContainerPruneResponse()
            {
                Status = execResult.ExitCode,
                Output = execResult.Output
            };
            return base.httpListenerUtils.DefaultJsonOutputBody(output);
        }
        #endregion
    }
}
