#!/bin/bash
clear ; cd "$(dirname "${0}")"

git_log() {
	echo `cd ../../DockerWebDesktop-Core && pwd` ; echo ; git -C ../../DockerWebDesktop-Core log -n 5 --oneline ; echo ; echo
	echo `cd ../../DockerWebDesktop-Core && pwd` ; echo ; git -C ../../CommandLiner-Core log -n 5 --oneline ; echo ; echo
	echo `cd ../../DockerWebDesktop-Core && pwd` ; echo ; git -C ../../CSharpUtils-Core log -n 5 --oneline ; echo ; echo
}

git_pull() {
	git -C ../../DockerWebDesktop-Core pull
	git -C ../../CommandLiner-Core pull
	git -C ../../CSharpUtils-Core pull
}

git_status() {
	echo `cd ../../DockerWebDesktop-Core && pwd` ; echo ; git -C ../../DockerWebDesktop-Core status -sb ; echo ; echo
	echo `cd ../../CommandLiner-Core && pwd` ; echo ; git -C ../../CommandLiner-Core status -sb ; echo ; echo
	echo `cd ../../CSharpUtils-Core && pwd` ; echo ; git -C ../../CSharpUtils-Core status -sb ; echo ; echo
}

git_clone_deps() {
	git -C ../.. clone git@github.com:crisstanza/CSharpUtils-Core.git
	git -C ../.. clone git@github.com:crisstanza/CommandLiner-Core.git
}

run() {
	export local DWD_PORT=9999
	export local DWD_DEBUG=false
	export local DWD_SUBNET_MASK=255.255.255.0
	dotnet run -p ../DockerWebDesktop
}

if [ ${#} -eq 0 ] ; then
	echo -e "Usage: ${0} [COMMANDS]\nAvailable commands:"
	cat `basename ${0}` | grep '()\s{' | while read COMMAND ; do echo " - ${COMMAND::-4}" ; done
else
	for COMMAND in "${@}" ; do "${COMMAND}" ; done
fi
