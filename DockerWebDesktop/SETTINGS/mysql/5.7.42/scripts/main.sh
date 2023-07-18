#!/bin/sh
clear ; cd "$(dirname "${0}")"

#####################################################################

quit() {
	exit 0;
}

clean() {
    clear
}

test() {
    mysql -u root < test.sql
}

example() {
    _privateFunction
}

function _privateFunction() { # pseudo-private
    echo 'This is a function call example.'
}

########################## HIC SUNT DRACONES ##########################

function _menu() { # pseudo-private
	echo -e "Available commands:"
    cat `basename ${0}` | grep -v '^function _' | grep '()\s{' | \
        while read COMMAND ; do echo " - ${COMMAND::-4}" ; done
    echo ; echo -n ': ' ; read OPTION
    echo ; for COMMAND in ${OPTION} ; do "${COMMAND}" ; echo ; done
    _menu
}

function _main() {
    if [ ${#} -eq 0 ] ; then
        echo -e "Usage: ${0} [COMMANDS]\n" ; _menu
    else
        for COMMAND in "${@}" ; do "${COMMAND}" ; echo ; done
    fi
}

_main

########################## /HIC SUNT DRACONES ##########################
