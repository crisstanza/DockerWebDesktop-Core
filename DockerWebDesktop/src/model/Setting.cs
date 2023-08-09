namespace model
{
	public class Setting
	{
		public int? Hash { get; set; }
		public string Name { get; set; }
		public string Version { get; set; }
		public string[] Ports { get; set; }
		public string[] Volumes { get; set; }
		public string[] Envs { get; set; }
		public string NetworkMode { get; set; }
		public bool Dockerfile { get; set; }
		public bool DockerComposeYml { get; set; }
		public bool Scripts { get; set; }
	}
}
