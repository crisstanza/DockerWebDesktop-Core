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

	[CommandLineArgument(DefaultValue = "255.255.255.0", EnvironmentVariable = "DWD_SUBNET_MASK")]
	public string SubnetMask { get; set; }

	[CommandLineArgument(DefaultValue = "localhost", EnvironmentVariable = "DWD_HOST")]
	public string Host { get; set; }

	[CommandLineArgument(DefaultValue = 9999, EnvironmentVariable = "DWD_PORT")]
	public int Port { get; set; }

	[CommandLineArgument(DefaultValue = 360, EnvironmentVariable = "DWD_CHECK_FOR_UPDATES_INTERVAL")]
	public int CheckForUpdatesInterval { get; set; }

	[CommandLineArgument(DefaultValue = null, EnvironmentVariable = "DWD_SETTINGS_HOME")]
	public string SettingsHome { get; set; }

	public void Defaults()
	{
		if (SettingsHome == null || SettingsHome == "")
		{
			SettingsHome = this.fileSystemUtils.CurrentPath() + "SETTINGS" + Path.DirectorySeparatorChar;
		}
	}

	override public string ToString()
	{
		return this.jsonUtils.Serialize(this);
	}
}
