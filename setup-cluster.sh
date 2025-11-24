#!/bin/bash

#Loopa igenom ip-addresser i config fil.
    # För varje ip-address:
        # anslut via ssh.
        # Kolla om CRAP-cluster-Node finns
            #gör inget om den finns
            #clona om den inte finns
        # gå in i CRAP-cluster-Node mappen
        # chmod +x build.sh
        # kör build.sh


repo='CRAP-Cluster-node'
gitCommand="
GIT_SSH_COMMAND='ssh -p 22222 -o HostName=localhost -o User=git' && git clone git@localhost:CoffeeWOSugar/\"$repo\".git"



usage(){
	echo "Usage: $0 "
	echo
	echo "Options:"
	echo "	-h	Display help message"
	echo "	-v	Verbose output"
	exit 1
}

helptext(){
	echo "This script installs all neccesary dependencies on specified nodes"
	echo "The IP addresses to the nodes should be specified in the file"
	echo "nodes.cnf on the following format:"
	echo "	IP sudopassword"
	echo "-------------------------------------------------------------------"
	echo
}

while getopts ":hv" o; do
    case "${o}" in
        h)
	    helptext
	    usage
            ;;
        v)
            verbose="-v"}
            ;;
        *)
            usage
            ;;
    esac
done


fetchBuilds="if [ ! -d \"$repo\" ]; then $gitCommand && chmod +x \"$repo\"/*.sh ; fi && cd \"$repo\" && git pull"
buildBuilds="cd \"$repo\" && echo "vincent" | sudo -S ./build.sh "${verbose}""


while IFS="" read -r node || [ -n "$node" ]
do
  arr=($node)
  name="${arr[0]}"
  pass="${arr[1]}"

  echo ">>> connecting to $node"
  sshpass -p $pass ssh -n -q -A -R 22222:github.com:22 $name $fetchBuilds

  if [ $? -ne 0 ]; then
	  echo "FAILED to fetch dependencies at $node"
	  break
  else
	  echo "SUCCESS, dependencies fetched at $node"
  fi
  sshpass -p $pass ssh -n -q -A -R 22222:github.com:22 $name $buildBuilds

  if [ $? -ne 0 ]; then
	  echo "FAILED to install build at $node"
	  break
  else
	  echo "SUCESS! Build installed at $node"
  fi
done < nodes.cnf

