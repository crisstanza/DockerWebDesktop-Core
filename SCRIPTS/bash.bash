#!/bin/bash
clear ; cd "$(dirname "${0}")"

PROJECTS=()
PROJECTS+=('DockerWebDesktop-Core') # this project
PROJECTS+=('CommandLiner-Core')
PROJECTS+=('CSharpUtils-Core')

MAX_LOG=4

git_log() {
	for PROJECT in ${PROJECTS[*]} ; do
		echo `cd ../../${PROJECT} && pwd` ; echo ; git -C ../../${PROJECT} log -n ${MAX_LOG} --oneline ; echo ; echo
	done
}

git_pull() {
	for PROJECT in ${PROJECTS[*]} ; do
		echo `cd ../../${PROJECT} && pwd` ; echo ; git -C ../../${PROJECT} pull ; echo ; echo
	done
}

git_status() {
	for PROJECT in ${PROJECTS[*]} ; do
		echo `cd ../../${PROJECT} && pwd` ; echo ; git -C ../../${PROJECT} status -sb ; echo ; echo
	done
}

git_clone_deps() {
	# starts at 1 to skip this project
	for (( i=1; i<${#PROJECTS[@]}; i++ )) ; do
		git -C ../.. clone git@github.com:crisstanza/${PROJECTS[${i}]}.git ; echo
	done
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
