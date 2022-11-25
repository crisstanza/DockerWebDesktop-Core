using io.github.crisstanza.commandliner;
using io.github.crisstanza.csharputils;
using System.IO;

public class CommandLineArguments : ICommandLineArguments
{
	protected readonly JsonUtils jsonUtils;
	protected readonly FileSystemUtils fileSystemUtils;

	public CommandLineArguments()
	{
		this.jsonUtils = new JsonUtils();
		this.fileSystemUtils = new FileSystemUtils();
	}

	[CommandLineArgument(DefaultValue = false)]
	public bool Debug { get; set; }

	[CommandLineArgument(DefaultValue = "255.255.240.0")]
	public string SubnetMask { get; set; }

	[CommandLineArgument(DefaultValue = "localhost")]
	public string Host { get; set; }

	[CommandLineArgument(DefaultValue = 7777, EnvironmentVariable = "DWD_PORT")]
	public int Port { get; set; }

	[CommandLineArgument(DefaultValue = null)]
	public string SettingsHome { get; set; }

	public void Defaults()
	{
		if (SettingsHome == null)
		{
			SettingsHome = this.fileSystemUtils.CurrentPath() + "settings" + Path.DirectorySeparatorChar;
		}
	}

	override public string ToString()
	{
		return this.jsonUtils.Serialize(this);
	}
}
