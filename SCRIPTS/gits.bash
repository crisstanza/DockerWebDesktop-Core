#!/bin/bash
clear ; cd "$(dirname "$0")"

pull_all() {
	git -C ../../DockerWebDesktop-Core pull
	git -C ../../CommandLiner-Core pull
	git -C ../../CSharpUtils-Core pull
}

status_all() {
	git -C ../../DockerWebDesktop-Core status
	git -C ../../CommandLiner-Core status
	git -C ../../CSharpUtils-Core status
}

clone_deps() {
	git -C ../.. clone git@github.com:crisstanza/CSharpUtils-Core.git
	git -C ../.. clone git@github.com:crisstanza/CommandLiner-Core.git
}

run() {
	export local DWD_PORT=9999
	export local DWD_DEBUG=true
	export local DWD_SUBNET_MASK=255.255.255.0
	dotnet run -p ../DockerWebDesktop
}

# pull_all
# status_all
# clone_deps

run
