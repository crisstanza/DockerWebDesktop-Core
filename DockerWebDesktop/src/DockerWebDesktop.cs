using controller;
using io.github.crisstanza.commandliner;

public class DockerWebDesktop
{
	public static void Main(string[] args)
	{
		CommandLineArguments arguments = new CommandLiner(args).Fill(new CommandLineArguments());
		DockerWebDesktopController controller = new DockerWebDesktopController(arguments);
		controller.Start();
	}
}
