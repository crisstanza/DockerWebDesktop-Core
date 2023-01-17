namespace model
{
    public sealed class Status
    {
        public string Ip { get; set; }
        public bool DockerD { get; set; }
        public bool Swarm { get; set; }
        public string Version { get; set; }
        public bool? Update { get; set; }
        public string NewVersion { get; set; }
    }
}
