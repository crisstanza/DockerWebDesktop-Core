DockerWebDesktop-Core
=====================

C# REST service with HTML interface running on Linux to manage Docker containers (_serviço REST em C# com interface HTML rodando​ em Linux para gerenciar containers Docker_).

<br>

# Demo:

<img src="https://github.com/crisstanza/DockerWebDesktop-Core/raw/main/DOC/DockerWebDesktop-1.1.1.1.png"><br><br>

# Dependencies:

 - https://github.com/crisstanza/CSharpUtils-Core
 - https://github.com/crisstanza/CommandLiner-Core

<br>

| DockerWebDesktop-Core | CommandLiner-Core | CSharpUtils-Core |
| :-------------------: | :---------------: | :--------------: |
| <b>1.1.5.0</b>        | 0.3.0.0           | 0.3.0.0          |
| <b>1.1.5.1</b>        | 0.3.0.0           | 0.3.0.1          |
| <b>1.7.0.0</b>        | 0.7.0.0           | 0.7.0.0          |

<br>


## Install Ubunto on Windows:

Open "Command Prompt" as Administrador and run:

	wsl --install

Restart your machine.

Check your version:

	show ubuntu version


## Install .NET Core on Ubuntu:

Ubuntu 20.04:

	wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
	sudo dpkg -i packages-microsoft-prod.deb
	rm packages-microsoft-prod.deb

	sudo apt update
	sudo apt install apt-transport-https
	# sudo apt install dotnet-runtime-3.1
	sudo apt install dotnet-sdk-3.1

Ubuntu 22.04:

	wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
	sudo dpkg -i packages-microsoft-prod.deb
	rm packages-microsoft-prod.deb

	sudo apt update
	# sudo apt install apt-transport-https
	# sudo apt install dotnet-runtime-7.0
	sudo apt install dotnet-sdk-7.0


## Install Docker on Ubuntu:

	sudo snap install docker     # version 20.10.17, or
	sudo apt install docker.io  # version 20.10.12-0ubuntu2~20.04.1


## Usage example:

	export DWD_PORT=9876 ; sudo -E dotnet run
or
	
	sudo ./SCRIPTS/bash.bash run

Another example:

	export DWD_DEBUG=true ; sudo -E ./SCRIPTS/bash.bash run


### Environment variables:

	- DWD_DEBUG - true|false - show docker commands on the console
	- DWD_SUBNET_MASK - your network subnet mask
	- DWD_HOST - do not use!
	- DWD_PORT number - port where to listen to
	- DWD_CHECK_FOR_UPDATES_INTERVAL - check for latest version interval in minutes
	- DWD_SETTINGS_HOME - directory path, ending with /


### VSCode Extensions:

	- C# - v1.25.2 - Microsoft - C# for Visual Studio Code (powered by OmniSharp)
	- dotnet --list-sdks
	- for Ubuntu: sudo ./dotnet-install.sh -c 6.0 --install-dir /usr/share/dotnet


### Git:

	git config user.email "crisstanza@work"
	git config user.name "crisstanza"


### Links:

	https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04
	https://docs.docker.com/compose/compose-file/compose-file-v2/#restart
	https://stackoverflow.com/questions/39388877/adding-files-to-standard-images-using-docker-compose
	https://chmod-calculator.com/
