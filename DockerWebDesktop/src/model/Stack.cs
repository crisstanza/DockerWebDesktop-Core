using System.Collections.Generic;

namespace model
{
	public class Stack
	{
		public string Name { get; set; }
		public int ServicesCount { get; set; }
		public List<StackService> Services { get; set; }
		public List<StackTask> Tasks { get; set; }
		public string Orchestrator { get; set; }
	}
}
