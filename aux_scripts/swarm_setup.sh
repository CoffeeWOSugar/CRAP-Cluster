#!/usr/bin/env bash

# VARS
CONF_DIR=config
MANAGER_IP=$(awk '/# Manager node/{getline; print}' $CONF_DIR/hosts)
DEBUG=0

#parse debug option
[[ "$1" == "-d" || "$1" == "--debug" ]] && DEBUG=1

# Check if docker is installed
if [[ "$(which docker | wc -l)" -eq "0" ]]; then
  echo "Docker installation is missing."
  exit 0
fi

# Docker swarm init on manager
sudo docker swarm leave --force
swarm_init_output=$(sudo docker swarm init --advertise-addr "$MANAGER_IP")
echo "$swarm_init_output"
join_command=$(printf "%s\n" "$swarm_init_output" | grep "docker swarm join")

#join_command=$(printf "%s\n" "$swarm_init_output" | awk '/To add a worker/{flag=1; next} flag && NF{printf "%s ", $0} NF==0 && flag{exit}')
echo "$join_command"
# Perform Join command on each node:
while read -r user ip pass; do
  ssh="$user@$ip"
  echo "$user"
  echo "$ip"
  echo "$pass"

  echo ">>> connecting $node to swarm..."
  sshpass -p "$pass" ssh -n -q -A "$ssh" "echo 'vincent' | sudo -S docker swarm leave --force"
  sshpass -p "$pass" ssh -n -q -A "$ssh" "echo 'vincent' | sudo -S bash -c '$join_command'"

done < <(
  grep -vE '^\s*#|^\s*$' $CONF_DIR/nodes.cnf | tail -n +2
)
sudo docker node ls
