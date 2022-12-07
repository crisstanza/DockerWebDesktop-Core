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

	[CommandLineArgument(DefaultValue = false, EnvironmentVariable = "DWD_DEBUG")]
	public bool Debug { get; set; }

	[CommandLineArgument(DefaultValue = "255.255.240.0", EnvironmentVariable = "DWD_SUBNET_MASK")]
	public string SubnetMask { get; set; }

	[CommandLineArgument(DefaultValue = "localhost", EnvironmentVariable = "DWD_HOST")]
	public string Host { get; set; }

	[CommandLineArgument(DefaultValue = 7777, EnvironmentVariable = "DWD_PORT")]
	public int Port { get; set; }

	[CommandLineArgument(DefaultValue = null, EnvironmentVariable = "DWD_SETTINGS_HOME")]
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
