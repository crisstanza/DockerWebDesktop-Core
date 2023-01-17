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
	export local DWD_PORT=$([ -z ${DWD_PORT} ] && echo 9999 || echo "${DWD_PORT}")
	export local DWD_DEBUG=$([ -z ${DWD_DEBUG} ] && echo 'false' || echo "${DWD_DEBUG}")
	export local DWD_SUBNET_MASK=$([ -z ${DWD_SUBNET_MASK} ] && echo '255.255.255.0' || echo "${DWD_SUBNET_MASK}")
	export local DWD_CHECK_FOR_UPDATES_INTERVAL=$([ -z ${DWD_CHECK_FOR_UPDATES_INTERVAL} ] && echo 360 || echo "${DWD_CHECK_FOR_UPDATES_INTERVAL}")
	dotnet run --project ../DockerWebDesktop
}

if [ ${#} -eq 0 ] ; then
	echo -e "Usage: ${0} [COMMANDS]\nAvailable commands:"
	cat `basename ${0}` | grep '()\s{' | while read COMMAND ; do echo " - ${COMMAND::-4}" ; done
else
	for COMMAND in "${@}" ; do "${COMMAND}" ; done
fi
