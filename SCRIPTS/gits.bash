#!/bin/bash
clear ; cd "$(dirname "$0")"

git_pull() {
	pwd ; git pull ; echo
}

git_status() {
	pwd ; git status ; echo
}

update_all() {
	cd ../DockerWebDesktop-Core ; git_pull
	cd ../CommandLiner-Core ; git_pull
	cd ../CSharpUtils-Core ; git_pull
}

status_all() {
	cd ../DockerWebDesktop-Core ; git_status
	cd ../CommandLiner-Core ; git_status
	cd ../CSharpUtils-Core ; git_status
}

cd ..
update_all
status_all
