﻿DockerWebDesktop-Core
=====================

C# REST service with HTML interface running on Linux to manage Docker containers (_serviço REST em C# com interface HTML rodando​ em Linux para gerenciar containers Docker_).

<br>

# Demo:

<img src="https://github.com/crisstanza/DockerWebDesktop-Core/raw/main/DOC/DockerWebDesktop-1.1.1.1.png">

# Dependencies:

 - https://github.com/crisstanza/CSharpUtils-Core
 - https://github.com/crisstanza/CommandLiner-Core

<br>

## Install .NET Core on Ubuntu:

	wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
	sudo dpkg -i packages-microsoft-prod.deb

	sudo apt update
	sudo apt install apt-transport-https
	# sudo apt install dotnet-runtime-3.1
	sudo apt install dotnet-sdk-3.1


## Usage example:

	export DWD_PORT=9876 ; sudo -E dotnet run


### Environment variables:

	- DWD_DEBUG - not used
	- DWD_SUBNET_MASK
	- DWD_HOST - do not use!
	- DWD_PORT
	- DWD_SETTINGS_HOME


### Links:

	https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04
	https://docs.docker.com/compose/compose-file/compose-file-v2/#restart
	https://stackoverflow.com/questions/39388877/adding-files-to-standard-images-using-docker-compose
	https://chmod-calculator.com/


#### Docker commands examples:

	docker cp 90c31a3d2a50b834fa5959aea8c08453030e04e687ee0df7122e5c63e34fd753:/usr/local/etc/php/php.ini-development .
