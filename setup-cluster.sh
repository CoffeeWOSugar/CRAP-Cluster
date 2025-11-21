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


nodeCommand="if [ ! -d \"$repo\" ]; then $gitCommand ; fi && cd \"$repo\" && git pull"

while IFS="" read -r node || [ -n "$node" ]
do
  arr=($node)
  name="${arr[0]}"
  pass="${arr[1]}"

  echo ">>> connecting to $node"
  sshpass -p $pass ssh -n -q -A -R 22222:github.com:22 $name $nodeCommand

  if [ $? -ne 0 ]; then
	  echo "SSH to $node FAILED"
  else
	  echo "SSH to $node SUCCEEDED"
  fi
done < nodes.cnf

