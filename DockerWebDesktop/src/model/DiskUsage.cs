namespace model
{
	public class DiskUsage
	{
		public string Type { get; set; }
		public int Total { get; set; }
		public int Active { get; set; }
		public string Size { get; set; }
		public string Reclaimable { get; set; }
	}
}
