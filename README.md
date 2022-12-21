DockerWebDesktop-Core
=====================

<br>

# Dependencies:

 - https://github.com/crisstanza/CSharpUtils-Core
 - https://github.com/crisstanza/CommandLiner-Core

<br>

## Run as normal user on Linux:

	https://docs.docker.com/engine/security/rootless/
	sudo apt-get update
	sudo apt-get install iptables
	dockerd-rootless-setuptool.sh install --skip-iptables
	sudo usermod -aG docker localuser


## Run docker engine:

	dockerd


## Run docker swarn:

	docker swarm init



## Install .NET Core on Ubuntu:

	wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
	sudo dpkg -i packages-microsoft-prod.deb

	sudo apt update
	sudo apt install apt-transport-https
	# sudo apt install dotnet-runtime-3.1
	sudo apt install dotnet-sdk-3.1


### Links:

	https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04
	https://docs.docker.com/compose/compose-file/compose-file-v2/#restart
	https://stackoverflow.com/questions/39388877/adding-files-to-standard-images-using-docker-compose
	https://chmod-calculator.com/


#### Docker commands examples:

	docker cp 90c31a3d2a50b834fa5959aea8c08453030e04e687ee0df7122e5c63e34fd753:/usr/local/etc/php/php.ini-development .
