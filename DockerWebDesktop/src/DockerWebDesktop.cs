using controller;
using io.github.crisstanza.commandliner;
using System.Reflection;

public class DockerWebDesktop
{
    public static void Main(string[] args)
    {
        CommandLineArguments arguments = new CommandLiner(args).Fill(new CommandLineArguments());
        DockerWebDesktopController controller = new DockerWebDesktopController(arguments);
        controller.Start();
        controller.StartCheckForUpdates();
    }

    public static string Version()
    {
        string version = Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
        int index = version.IndexOf('+');
        if (index >= 0)
        {
            version = version[..index];
        }
        return version;
    }
}
