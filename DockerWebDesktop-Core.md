DockerWebDesktop-Core
=====================


Run as normal user on Linux:

https://docs.docker.com/engine/security/rootless/


sudo apt-get update
sudo apt-get install iptables

dockerd-rootless-setuptool.sh install --skip-iptables

`sudo usermod -aG docker localuser`


Run docker engine:

`dockerd`


Run docker swarn:

`docker swarm init`



Install .NET Core on Ubuntu:

wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb

sudo apt update
sudo apt install apt-transport-https
# sudo apt install dotnet-runtime-3.1
sudo apt install dotnet-sdk-3.1


Links:

	https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04
	https://docs.docker.com/compose/compose-file/compose-file-v2/#restart
