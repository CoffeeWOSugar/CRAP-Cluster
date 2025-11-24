#!/usr/bin/env bash

# Check if docker is installed
if [[ "$(which docker | wc -l)" -eq "0" ]]; then
    echo "Docker installation is missing."
    exit 0
fi

# Docker swarm init on manager
swarm_init_ouput="$(docker swarm init --advertise-addr 192.168.10.3)"
join_command=$(printf "%s\n" "$swarm_init_output" \
  | awk '/To add a worker/{flag=1; next} flag && NF{printf "%s ", $0} NF==0 && flag{exit}')

# Perform Join command on each node:
while IFS="" read -r node || [ -n "$node" ]
do
  arr=($node)
  name="${arr[0]}"
  pass="${arr[1]}"

  echo ">>> connecting $node to swarm..."
  sshpass -p $pass ssh -n -q -A -R 22222:github.com:22 $name $join_command

done < nodes.cnf
docker node ls