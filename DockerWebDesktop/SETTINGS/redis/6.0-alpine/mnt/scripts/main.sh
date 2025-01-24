#!/bin/sh
clear ; cd "$(dirname "${0}")"

#####################################################################

KEY_NAME=keyName

flushAll() { # remove all keys from all databases
	redis-cli flushall
}

getKeys() { # show all keys using 'keys'
	redis-cli keys "*"
}

scanKeys() { # show all keys using 'scan'
	redis-cli --scan --pattern "*"
}

setValue() {
	redis-cli set "${KEY_NAME}" 0
}

getValue() {
	redis-cli get "${KEY_NAME}"
}

incValue() {
	redis-cli incr "${KEY_NAME}"
}

delValue() {
	redis-cli del "${KEY_NAME}"
}

example() { # private function call example
	_privateFunction
}

function _privateFunction() { # pseudo-private
	echo "This is a function call example."
}

########################## HIC SUNT DRACONES ##########################

function _menu() { # pseudo-private
	while true ; do
		echo -e "Available commands:"
		cat `basename ${0}` | grep -v '^function _' | grep '()\s{' | \
			while read COMMAND ; do echo " - ${COMMAND%%()*}" ; done
		echo ; echo -n ': ' ; read OPTION
		echo ; for COMMAND in ${OPTION} ; do "${COMMAND}" ; echo ; done
	done
}

function _main() {
	if [ ${#} -eq 0 ] ; then
		echo -e "Usage: ${0} [COMMANDS]\n" ; _menu
	else
		for COMMAND in "${@}" ; do "${COMMAND}" ; echo ; done
	fi
}

clean() {
	clear
}

q() {
	exit 0;
}

_main "${@}"

########################## /HIC SUNT DRACONES ##########################
