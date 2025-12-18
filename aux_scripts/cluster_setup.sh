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

CONF_DIR=config
repo='CRAP-Cluster-node'
gitCommand="
GIT_SSH_COMMAND='ssh -p 22222 -o HostName=localhost -o User=git' && git clone git@localhost:CoffeeWOSugar/\"$repo\".git"

usage() {
  echo "Usage: $0 "
  echo
  echo "Options:"
  echo "	-h	Display help message"
  echo "	-v	Verbose output"
  exit 1
}

helptext() {
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

while read -r user ip pass; do
  ssh="$user@$ip"
  echo $user
  echo $ip
  echo $pass

  echo ">>> connecting to $ssh"
  sshpass -p $pass ssh -n -q -A -R 22222:github.com:22 $ssh $fetchBuilds

  if [ $? -ne 0 ]; then
    echo "FAILED to fetch dependencies at $ip"
    break
  else
    echo "SUCCESS, dependencies fetched at $ip"
  fi
  sshpass -p $pass ssh -n -q -A -R 22222:github.com:22 $ssh $buildBuilds

  if [ $? -ne 0 ]; then
    echo "FAILED to install build at $ip"
    break
  else
    echo "SUCESS! Build installed at $ip"
  fi
done < <(
  grep -vE '^\s*#|^\s*$' $CONF_DIR/nodes.cnf | tail -n +2
)
