using io.github.crisstanza.csharputils;
using model;
using server.request.api;
using server.response.api;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;

namespace service
{
    public class DockerWebDesktopService : DockerWebDesktopServiceUtils
    {
        private const string DOCKERD_PID_FILE = "/var/run/docker.pid";
        private const string DOCKERD_SOCK_FILE = "/var/run/docker.sock";
        private const string ENVS_FILE = "envs";
        private const string NETWORK_FILE = "network";
        private const string PORTS_FILE = "ports";
        private const string VOLUMES_FILE = "volumes";
        private const string DOCKERFILE_FILE = "Dockerfile";
        private const string DOCKER_COMPOSE_FILE = "docker-compose.yml";

        public DockerWebDesktopService(CommandLineArguments args) : base(args)
        {
        }

        #region api status
        public ApiStatus ApiStatus()
        {
            bool dockerD;
            string dockerDPid = FindDockerdPid();
            if (base.stringUtils.IsBlank(dockerDPid))
            {
                dockerD = false;
            }
            else
            {
                string arguments = "-x dockerd";
                RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("pgrep", arguments);
                if (execResult.ExitCode == 0)
                {
                    dockerD = dockerDPid.Trim() == execResult.Output.Trim();
                }
                else
                {
                    dockerD = false;
                }
            }
            RunTimeUtils.ExecResult execResultSwarm = base.runTimeUtils.Exec("docker", "node ls");
            bool swarm = execResultSwarm.ExitCode == 0;
            IPAddress ip = this.networkingUtils.GetLocalAddress(IPAddress.Parse(args.SubnetMask));
            return new ApiStatus()
            {
                Status = new Status()
                {
                    Ip = ip?.ToString(),
                    DockerD = dockerD,
                    Swarm = swarm,
                    Version = DockerWebDesktop.Version()
                }
            };
        }
        private string FindDockerdPid()
        {
            if (base.fileSystemUtils.ExistsFile(DOCKERD_PID_FILE))
            {
                return base.fileSystemUtils.GetTextFromFile(DOCKERD_PID_FILE);
            }
            return null;
        }
        #endregion

        #region api docker
        public string ApiDockerInfo()
        {
            return base.runTimeUtils.Exec("docker", "info").Output;
        }
        public string ApiDockerVersion()
        {
            return base.runTimeUtils.Exec("docker", "version").Output;
        }
        #endregion

        #region api dockerd
        public RunTimeUtils.ExecResult ApiDockerD(string command)
        {
            if (command == "start")
            {
                int status = base.runTimeUtils.Run("dockerd", null);
                return new RunTimeUtils.ExecResult() { ExitCode = status };
            }
            else if (command == "stop")
            {
                string pidFile = DOCKERD_PID_FILE;
                string sockFile = DOCKERD_SOCK_FILE;
                string pid = base.fileSystemUtils.GetTextFromFile(pidFile, true);
                if (pid != null)
                {
                    RunTimeUtils.ExecResult execResultKillProcess = base.runTimeUtils.Exec("kill", "-9 " + pid);
                    if (execResultKillProcess.ExitCode != 0)
                    {
                        return new RunTimeUtils.ExecResult()
                        {
                            ExitCode = execResultKillProcess.ExitCode,
                            Output = execResultKillProcess.Output
                        };
                    }
                    RunTimeUtils.ExecResult execResultRemovePidFile = base.runTimeUtils.Exec("rm", pidFile + " " + sockFile);
                    return new RunTimeUtils.ExecResult()
                    {
                        ExitCode = execResultRemovePidFile.ExitCode,
                        Output = execResultRemovePidFile.Output
                    };
                }
                else
                {
                    return new RunTimeUtils.ExecResult() { ExitCode = 0 };
                }
            }
            else
            {
                throw new Exception("Invalid command: " + command);
            }
        }
        #endregion

        #region api swarm
        public RunTimeUtils.ExecResult Swarm(string command)
        {
            StringBuilder arguments = new StringBuilder();
            arguments.Append("swarm");
            if (command == "init")
            {
                arguments.Append(" init --advertise-addr 127.0.0.1");
            }
            else if (command == "leave")
            {
                arguments.Append(" leave --force");
            }
            else
            {
                throw new Exception("Invalid command: " + command);
            }
            return base.runTimeUtils.Exec("docker", arguments.ToString());
        }
        #endregion

        #region api images
        public ApiImages ApiImages()
        {
            return new ApiImages()
            {
                Images = LoadImages()
            };
        }
        private List<Image> LoadImages()
        {
            List<Image> images = new List<Image>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "image ls --no-trunc");
            if (execResult.ExitCode == 0)
            {
                StringReader reader = new StringReader(execResult.Output);
                string headers = reader.ReadLine();
                int repositoryIndex = headers.IndexOf("REPOSITORY");
                int tagIndex = headers.IndexOf("TAG");
                int imageIdIndex = headers.IndexOf("IMAGE ID");
                int createdIndex = headers.IndexOf("CREATED");
                int sizeIndex = headers.IndexOf("SIZE");
                while (reader.Peek() > -1)
                {
                    string line = reader.ReadLine();
                    Image image = new Image()
                    {
                        Repository = line.Substring(repositoryIndex, tagIndex - repositoryIndex).Trim(),
                        Tag = line.Substring(tagIndex, imageIdIndex - tagIndex).Trim(),
                        ImageId = line.Substring(imageIdIndex, createdIndex - imageIdIndex).Trim(),
                        Created = line.Substring(createdIndex, sizeIndex - createdIndex).Trim(),
                        Size = line.Substring(sizeIndex).Trim()
                    };
                    images.Add(image);
                }
            }
            return images;
        }
        public RunTimeUtils.ExecResult ApiImageRun(string repository, string tag, string imageId)
        {
            string name = repository.Replace(".local", "");
            string version = tag.Replace(".local", "");
            string[] ports = this.fileSystemUtils.GetLinesFromFile(PortsFile(name, version), true);
            String portsArguments = GetArguments("-p", ports);
            portsArguments = this.stringUtils.IsBlank(portsArguments) ? "" : portsArguments + " ";
            string[] volumes = this.fileSystemUtils.GetLinesFromFile(VolumesFile(name, version), true);
            String volumesArguments = this.GetArguments("-v", volumes);
            volumesArguments = this.stringUtils.IsBlank(volumesArguments) ? "" : volumesArguments + " ";
            string[] envs = this.fileSystemUtils.GetLinesFromFile(EnvsFile(name, version), true);
            String envsArguments = GetArguments("-e", envs);
            envsArguments = this.stringUtils.IsBlank(envsArguments) ? "" : envsArguments + " ";
            String network = this.fileSystemUtils.GetTextFromFile(NetworkFile(name, version), true);
            String networkArgument = this.GetArgument("--network", network);
            string arguments = "run -d -t " + envsArguments + portsArguments + volumesArguments + networkArgument + imageId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        public RunTimeUtils.ExecResult ApiImageRemoveById(string imageId)
        {
            string arguments = "image rm " + imageId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        public RunTimeUtils.ExecResult ApiImageRemove(string repository, string tag)
        {
            string arguments = "image rm " + repository + ":" + tag;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        public string ApiImageInspect(string imageId)
        {
            string arguments = "image inspect " + imageId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult.Output;
        }
        public string ApiImageHistory(string imageId)
        {
            string arguments = "image history " + imageId + " --no-trunc";
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult.Output;
        }
        public RunTimeUtils.ExecResult ApiImagePrune()
        {
            return base.runTimeUtils.Exec("docker", "image prune --force");
        }
        #endregion

        #region api builder
        public RunTimeUtils.ExecResult ApiBuilderPrune()
        {
            return base.runTimeUtils.Exec("docker", "builder prune --force");
        }
        #endregion

        #region api instances
        public ApiInstances ApiInstances(ApiInstancesRequest input)
        {
            List<Instance> allInstances = LoadAllInstances();
            List<Instance> runningInstances = LoadRunningInstances();
            foreach (Instance instance in allInstances)
            {
                instance.Running = ContainsByContainerId(runningInstances, instance);
                if (instance.Running)
                {
                    instance.NetworkSetting = LoadInstanceNetworkSetting(instance.ContainerId);
                }
            }
            return new ApiInstances()
            {
                Instances = allInstances
            };
        }
        private NetworkSetting LoadInstanceNetworkSetting(string containerId)
        {
            string inspect = ApiInstanceInspect(containerId);
            JsonElement json = base.jsonUtils.Deserialize<JsonElement>(inspect);
            if (json.GetArrayLength() > 0)
            {
                JsonElement first = json[0];
                List<int> ports = new List<int>();
                {
                    JsonElement hostConfigPortBindings = first.GetProperty("HostConfig").GetProperty("PortBindings");
                    JsonElement.ObjectEnumerator iPortBindings = hostConfigPortBindings.EnumerateObject();
                    while (iPortBindings.MoveNext())
                    {
                        ports.Add(this.ParsePortSlashProtocol(iPortBindings.Current.Name));
                    }
                }
                if (ports.Count == 0)
                {
                    JsonElement configExposedPorts = first.GetProperty("Config").GetProperty("ExposedPorts");
                    JsonElement.ObjectEnumerator iExposedPorts = configExposedPorts.EnumerateObject();
                    while (iExposedPorts.MoveNext())
                    {
                        ports.Add(this.ParsePortSlashProtocol(iExposedPorts.Current.Name));
                    }
                }
                string bridgeIp = null;
                if (first.GetProperty("NetworkSettings").GetProperty("Networks").TryGetProperty("bridge", out JsonElement bridge))
                {
                    bridgeIp = bridge.GetProperty("IPAddress").GetString();
                }
                return new NetworkSetting()
                {
                    BridgeIp = bridgeIp,
                    Ports = ports
                };
            }
            return null;
        }

        private bool ContainsByContainerId(List<Instance> runningInstances, Instance instance)
        {
            foreach (Instance runningInstance in runningInstances)
            {
                if (runningInstance.ContainerId == instance.ContainerId)
                {
                    return true;
                }
            }
            return false;
        }
        private List<Instance> LoadRunningInstances()
        {
            return LoadInstances(false);
        }
        private List<Instance> LoadAllInstances()
        {
            return LoadInstances(true);
        }
        private List<Instance> LoadInstances(bool all)
        {
            List<Instance> instances = new List<Instance>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "ps " + (all ? "-a" : "") + " --no-trunc");
            if (execResult.ExitCode == 0)
            {
                StringReader reader = new StringReader(execResult.Output);
                string headers = reader.ReadLine();
                int containerIdIndex = headers.IndexOf("CONTAINER ID");
                int imageIndex = headers.IndexOf("IMAGE");
                int commandIndex = headers.IndexOf("COMMAND");
                int createdIndex = headers.IndexOf("CREATED");
                int statusIndex = headers.IndexOf("STATUS");
                int portsIndex = headers.IndexOf("PORTS");
                int namesIndex = headers.IndexOf("NAMES");
                while (reader.Peek() > -1)
                {
                    string line = reader.ReadLine();
                    Instance instance = new Instance()
                    {
                        ContainerId = line.Substring(containerIdIndex, imageIndex - containerIdIndex).Trim(),
                        Image = line.Substring(imageIndex, commandIndex - imageIndex).Trim(),
                        Command = line.Substring(commandIndex, createdIndex - commandIndex).Trim(),
                        Created = line.Substring(createdIndex, statusIndex - createdIndex).Trim(),
                        Status = line.Substring(statusIndex, portsIndex - statusIndex).Trim(),
                        Ports = line.Substring(portsIndex, namesIndex - portsIndex).Trim(),
                        Names = line.Substring(namesIndex).Trim()
                    };
                    instances.Add(instance);
                }
            }
            return instances;
        }
        public RunTimeUtils.ExecResult ApiInstanceStart(string containerId)
        {
            string arguments = "start " + containerId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        public RunTimeUtils.ExecResult ApiInstanceStop(string containerId)
        {
            string arguments = "stop " + containerId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        public RunTimeUtils.ExecResult ApiInstanceRemove(string containerId)
        {
            string arguments = "rm " + containerId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        public DownloadFile ApiInstanceSee(string containerId)
        {
            string dockerExecIt = "docker exec -it " + containerId + " /bin/bash";
            string script = ":; " + dockerExecIt + " ; exit 0";
            script += "\n";
            script += "start ubuntu.exe run " + dockerExecIt;
            script += "\n";
            return new DownloadFile()
            {
                Contents = script,
                Name = containerId + ".cmd"
            };
        }
        public DownloadFile ApiInstanceStatsSee(string containerId)
        {
            string dockerStats = "docker stats " + containerId;
            string script = ":; " + dockerStats + " ; exit 0";
            script += "\n";
            script += "start ubuntu.exe run " + dockerStats;
            script += "\n";
            return new DownloadFile()
            {
                Contents = script,
                Name = containerId + "-stats.cmd"
            };
        }
        public string ApiInstanceInspect(string containerId)
        {
            return base.runTimeUtils.Exec("docker", "inspect " + containerId).Output;
        }
        public string ApiInstanceStats(string containerId)
        {
            return base.runTimeUtils.Exec("docker", "stats " + containerId + " --no-stream").Output;
        }
        public string ApiInstanceLogs(string containerId)
        {
            return base.runTimeUtils.Exec("docker", "logs -t " + containerId + " --details").Output;
        }
        public DownloadFile ApiInstanceLogsSee(string containerId)
        {
            string dockerLogs = "docker logs -t " + containerId + " --details --follow";
            string script = ":; " + dockerLogs + " ; exit 0";
            script += "\n";
            script += "start ubuntu.exe run " + dockerLogs;
            script += "\n";
            return new DownloadFile()
            {
                Contents = script,
                Name = containerId + "-logs.cmd"
            };
        }
        #endregion

        #region api settings
        public ApiSettings ApiSettings(ApiSettingsRequest input)
        {
            return new ApiSettings()
            {
                Settings = LoadSettings(this.fileSystemUtils.ListFolders(this.args.SettingsHome))
            };
        }
        private List<Setting> LoadSettings(string[] folders)
        {
            List<Setting> settings = new List<Setting>();
            foreach (String folder in folders)
            {
                string[] versions = this.fileSystemUtils.ListFolders(folder);
                foreach (String version in versions)
                {
                    Setting image = new Setting()
                    {
                        Name = this.fileSystemUtils.FolderName(folder),
                        Version = this.fileSystemUtils.FolderName(version),
                        Ports = this.stringUtils.defaultArray(this.fileSystemUtils.GetLinesFromFile(PortsFile(version), true)),
                        Volumes = this.stringUtils.defaultArray(this.fileSystemUtils.GetLinesFromFile(VolumesFile(version), true)),
                        Envs = this.fileSystemUtils.GetLinesFromFile(EnvsFile(version), true),
                        NetworkMode = this.stringUtils.defaultString(this.fileSystemUtils.GetTextFromFile(NetworkFile(version), true)),
                        Dockerfile = this.fileSystemUtils.ExistsFile(DockerfileFile(version)),
                        DockerComposeYml = this.fileSystemUtils.ExistsFile(DockerComposeYmlFile(version))
                    };
                    settings.Add(image);
                }
            }
            return settings;
        }
        public RunTimeUtils.ExecResult ApiSettingRun(string name, string version)
        {
            string[] ports = this.fileSystemUtils.GetLinesFromFile(PortsFile(name, version), true);
            String portsArguments = this.GetArguments("-p", ports);
            portsArguments = this.stringUtils.IsBlank(portsArguments) ? "" : portsArguments + " ";
            string[] volumes = this.fileSystemUtils.GetLinesFromFile(VolumesFile(name, version), true);
            String volumesArguments = this.GetArguments("-v", volumes);
            volumesArguments = this.stringUtils.IsBlank(volumesArguments) ? "" : volumesArguments + " ";
            string[] envs = this.fileSystemUtils.GetLinesFromFile(EnvsFile(name, version), true);
            String envsArguments = this.GetArguments("-e", envs);
            envsArguments = this.stringUtils.IsBlank(envsArguments) ? "" : envsArguments + " ";
            String network = this.fileSystemUtils.GetTextFromFile(NetworkFile(name, version), true);
            String networkArgument = this.GetArgument("--network", network);
            string arguments = "run -d -t " + envsArguments + portsArguments + volumesArguments + networkArgument + name + ":" + version;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        #endregion

        #region api build dockerfile
        public RunTimeUtils.ExecResult ApiBuildDockerfile(string name, string version)
        {
            string dockerfileFile = DOCKERFILE_FILE; //  DockerfileFile(name, version);
            string arguments = "build -t " + name + ".local:" + version + ".local -f " + dockerfileFile + " .";
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments, HomePath(name, version));
            return execResult;
        }
        #endregion

        #region api deploy docker compose yml
        public RunTimeUtils.ExecResult ApiDeployDockerComposeYml(string name, string version)
        {
            string dockerComposeYmlFile = DOCKER_COMPOSE_FILE; // DockerComposeYmlFile(name, version);
            string arguments = "stack deploy -c " + dockerComposeYmlFile + " " + StackName(name, version);
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments, HomePath(name, version));
            return execResult;
        }
        #endregion

        #region api stacks
        public ApiStacks ApiStacks()
        {
            return new ApiStacks()
            {
                Stacks = LoadStacks()
            };
        }
        private List<Stack> LoadStacks()
        {
            List<Stack> stacks = new List<Stack>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "stack ls");
            if (execResult.ExitCode == 0)
            {
                StringReader reader = new StringReader(execResult.Output);
                string headers = reader.ReadLine();
                int nameIndex = headers.IndexOf("NAME");
                int servicesIndex = headers.IndexOf("SERVICES");
                int orchestratorIndex = headers.IndexOf("ORCHESTRATOR");
                while (reader.Peek() > -1)
                {
                    string line = reader.ReadLine();
                    Stack stack = new Stack()
                    {
                        Name = line.Substring(nameIndex, servicesIndex - nameIndex).Trim(),
                        ServicesCount = Int32.Parse(line.Substring(servicesIndex, orchestratorIndex - servicesIndex).Trim()),
                        Orchestrator = line.Substring(orchestratorIndex).Trim(),
                    };
                    stack.Tasks = LoadStackTasks(stack.Name);
                    stack.Services = LoadStackServices(stack.Name);
                    stacks.Add(stack);
                }
            }
            return stacks;
        }
        private List<StackTask> LoadStackTasks(string stack)
        {
            List<StackTask> tasks = new List<StackTask>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "stack ps " + stack + " --no-trunc");
            if (execResult.ExitCode == 0)
            {
                FixedWidthColumnReader reader = new FixedWidthColumnReader(execResult.Output);
                reader.Headers("ID", "NAME", "IMAGE", "NODE", "DESIRED STATE", "CURRENT STATE", "ERROR", "PORTS");
                while (reader.HasLines())
                {
                    FixedWidthColumnReader.Line line = reader.NextLine();
                    StackTask task = new StackTask()
                    {
                        Id = line.NextValue(),
                        Name = line.NextValue(),
                        Image = line.NextValue(),
                        Node = line.NextValue(),
                        DesiredState = line.NextValue(),
                        CurrentState = line.NextValue(),
                        Error = line.NextValue(),
                        Ports = line.NextValue()
                    };
                    tasks.Add(task);
                }
            }
            return tasks;
        }
        private List<StackService> LoadStackServices(string stack)
        {
            List<StackService> services = new List<StackService>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "stack services " + stack);
            if (execResult.ExitCode == 0)
            {
                FixedWidthColumnReader reader = new FixedWidthColumnReader(execResult.Output);
                reader.Headers("ID", "NAME", "MODE", "REPLICAS", "IMAGE", "PORTS");
                while (reader.HasLines())
                {
                    FixedWidthColumnReader.Line line = reader.NextLine();
                    StackService service = new StackService()
                    {
                        Id = line.NextValue(),
                        Name = line.NextValue(),
                        Mode = line.NextValue(),
                        Replicas = line.NextValue(),
                        Image = line.NextValue(),
                        Ports = line.NextValue()
                    };
                    services.Add(service);
                }
            }
            return services;
        }
        public RunTimeUtils.ExecResult ApiStackRemove(string name)
        {
            string arguments = "stack rm " + name;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult;
        }
        #endregion

        #region api nodes
        public ApiNodes ApiNodes()
        {
            return new ApiNodes()
            {
                Nodes = LoadNodes()
            };
        }
        private List<Node> LoadNodes()
        {
            List<Node> nodes = new List<Node>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "node ls");
            if (execResult.ExitCode == 0)
            {
                FixedWidthColumnReader reader = new FixedWidthColumnReader(execResult.Output);
                reader.Headers("ID", "HOSTNAME", "STATUS", "AVAILABILITY", "MANAGER STATUS", "ENGINE VERSION");
                while (reader.HasLines())
                {
                    FixedWidthColumnReader.Line line = reader.NextLine();
                    Node node = new Node()
                    {
                        Id = line.NextValue(),
                        HostName = line.NextValue(),
                        Status = line.NextValue(),
                        Availability = line.NextValue(),
                        ManagerStatus = line.NextValue(),
                        EngineVersion = line.NextValue()
                    };
                    nodes.Add(node);
                }
            }
            return nodes;
        }
        public string ApiNodeInspect(string id)
        {
            return base.runTimeUtils.Exec("docker", "node inspect " + id).Output;
        }
        #endregion

        #region api networks
        public ApiNetworks ApiNetworks()
        {
            return new ApiNetworks()
            {
                Networks = LoadNetworks()
            };
        }
        public string ApiNetworkInspect(string networkId)
        {
            string arguments = "network inspect " + networkId;
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", arguments);
            return execResult.Output;
        }
        private List<Network> LoadNetworks()
        {
            List<Network> networks = new List<Network>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "network ls --no-trunc");
            if (execResult.ExitCode == 0)
            {
                FixedWidthColumnReader reader = new FixedWidthColumnReader(execResult.Output);
                reader.Headers("NETWORK ID", "NAME", "DRIVER", "SCOPE");
                while (reader.HasLines())
                {
                    FixedWidthColumnReader.Line line = reader.NextLine();
                    Network network = new Network()
                    {
                        NetworkId = line.NextValue(),
                        Name = line.NextValue(),
                        Driver = line.NextValue(),
                        Scope = line.NextValue()
                    };
                    networks.Add(network);
                }
            }
            return networks;
        }
        public RunTimeUtils.ExecResult ApiNetworkRemove(string networkId)
        {
            return base.runTimeUtils.Exec("docker", "network rm " + networkId, null, "y");
        }
        #endregion

        #region api disk usages
        public ApiDiskUsages ApiDiskUsages()
        {
            return new ApiDiskUsages()
            {
                DiskUsages = LoadDiskUsages()
            };
        }
        private List<DiskUsage> LoadDiskUsages()
        {
            List<DiskUsage> diskUsages = new List<DiskUsage>();
            RunTimeUtils.ExecResult execResult = base.runTimeUtils.Exec("docker", "system df");
            if (execResult.ExitCode == 0)
            {
                FixedWidthColumnReader reader = new FixedWidthColumnReader(execResult.Output);
                reader.Headers("TYPE", "TOTAL", "ACTIVE", "SIZE", "RECLAIMABLE");
                while (reader.HasLines())
                {
                    FixedWidthColumnReader.Line line = reader.NextLine();
                    DiskUsage diskUsage = new DiskUsage()
                    {
                        Type = line.NextValue(),
                        Total = line.NextValueAsInt(),
                        Active = line.NextValueAsInt(),
                        Size = line.NextValue(),
                        Reclaimable = line.NextValue()
                    };
                    diskUsages.Add(diskUsage);
                }
            }
            return diskUsages;
        }
        #endregion

        #region files
        private string HomePath(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar;
        }
        private string PortsFile(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar + PORTS_FILE;
        }
        private string VolumesFile(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar + VOLUMES_FILE;
        }
        private string PortsFile(string version)
        {
            return version + Path.DirectorySeparatorChar + PORTS_FILE;
        }
        private string VolumesFile(string version)
        {
            return version + Path.DirectorySeparatorChar + VOLUMES_FILE;
        }
        private string EnvsFile(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar + ENVS_FILE;
        }
        private string NetworkFile(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar + NETWORK_FILE;
        }
        private string NetworkFile(string version)
        {
            return version + Path.DirectorySeparatorChar + NETWORK_FILE;
        }
        private string EnvsFile(string version)
        {
            return version + Path.DirectorySeparatorChar + ENVS_FILE;
        }
        private string DockerfileFile(string version)
        {
            return version + Path.DirectorySeparatorChar + DOCKERFILE_FILE;
        }
        private string DockerfileFile(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar + DOCKERFILE_FILE;
        }

        private string DockerComposeYmlFile(string version)
        {
            return version + Path.DirectorySeparatorChar + "docker-compose.yml";
        }
        private string DockerComposeYmlFile(string name, string version)
        {
            return this.args.SettingsHome + name + Path.DirectorySeparatorChar + version + Path.DirectorySeparatorChar + DOCKER_COMPOSE_FILE;
        }
        #endregion

        #region names
        private string StackName(string name, string version)
        {
            return (name + "_" + version).Replace('.', '-');
        }
        private int ParsePortSlashProtocol(string name)
        {
            string port = name.Substring(0, name.IndexOf("/"));
            return Int32.Parse(port);
        }
        #endregion

        #region arguments
        private string GetArguments(string name, string[] values)
        {
            StringBuilder arguments = new StringBuilder();
            if (values != null)
            {
                foreach (string value in values)
                {
                    arguments.Append(name).Append(" ").Append(value).Append(" ");
                }
            }
            return arguments.ToString().Trim();
        }
        private string GetArgument(string name, string value)
        {
            if (this.stringUtils.IsBlank(value))
            {
                return "";
            }
            else
            {
                return " --network " + value + " ";
            }
        }
        #endregion

        #region volumes
        public RunTimeUtils.ExecResult ApiVolumePrune()
        {
            return base.runTimeUtils.Exec("docker", "volume prune --force");
        }
        #endregion

        #region container
        public RunTimeUtils.ExecResult ApiContainerPrune()
        {
            return base.runTimeUtils.Exec("docker", "container prune --force");
        }
        #endregion
    }
}
