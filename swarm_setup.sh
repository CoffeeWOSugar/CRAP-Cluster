#!/usr/bin/env bash

# Check if docker is installed
if [[ "$(which docker | wc -l)" -eq "0" ]]; then
    echo "Docker installation is missing."
    exit 0
fi

# Docker swarm init on manager
sudo docker swarm leave --force 
swarm_init_output=$(sudo docker swarm init --advertise-addr 192.168.10.3)
echo "$swarm_init_output"
join_command=$(printf "%s\n" "$swarm_init_output" | grep "docker swarm join")

#join_command=$(printf "%s\n" "$swarm_init_output" | awk '/To add a worker/{flag=1; next} flag && NF{printf "%s ", $0} NF==0 && flag{exit}')
echo "$join_command"
# Perform Join command on each node:
while IFS="" read -r node || [ -n "$node" ]
do
 
  arr=($node)
  name="${arr[0]}"
  pass="${arr[1]}"
  echo "$name"
  echo "$pass"

  echo ">>> connecting $node to swarm..."
  sshpass -p "$pass" ssh -n -q -A "$name" "echo 'vincent' | sudo -S docker swarm leave --force" 
  sshpass -p "$pass" ssh -n -q -A "$name" "echo 'vincent' | sudo -S bash -c '$join_command'"

done < nodes.cnf
sudo docker node ls
