#!/bin/bash

#
SCRIPT_FOLDER=aux_scripts
CONF_FOLDER=config
crap() {
  echo
  echo " ██████╗██████╗  █████╗ ██████╗ ██╗"
  echo "██╔════╝██╔══██╗██╔══██╗██╔══██╗██║"
  echo "██║     ██████╔╝███████║██████╔╝██║"
  echo "██║     ██╔══██╗██╔══██║██╔═══╝ ╚═╝"
  echo "╚██████╗██║  ██║██║  ██║██║     ██╗"
  echo " ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝"
  echo
}

usage() {
  echo "This is the CRAP-CLUSTER setup tool"
  echo "Circular Resource-limited Application Platform"
  echo "Built by VEVE"
  echo "####################################"
  echo
  echo
  echo "Usage: $0 "
  echo
  echo "Options:"
  echo "	help          Display help message"
  echo "	cluster-up    setup-cluster"
  echo "	cluster-down  Shutdown cluster and power off machines"
  echo "	swarm-init    Initialize swarm"
  echo "	swarm-down    Shutdown and leave swarm"
  exit 1
}

setup_ssh() {
  if [ -n "$SSH_AGENT_PID" ] && ps -p "$SSH_AGENT_PID" >/dev/null 2>&1; then
    echo "ssh-agent is already running and has keys loaded."
  else
    echo "Starting a new ssh-agent..."
    eval "$(ssh-agent -s)"
    ssh-add
  fi
}

cluster-up() {
  setup_ssh
  $SCRIPT_FOLDER/cluster_setup.sh
}

swarm-init() {
  setup_ssh
  $SCRIPT_FOLDER/swarm_setup.sh
}

# Power down cluster
cluster-down() {
  setup-ssh
  echo "Shutting down cluster and powering off machines"

  while read -r user ip pass; do
    ssh="$user@$ip"
    echo ">>> node $ip shutting down..."
    sshpass -p "$pass" ssh -n -q -A "$ssh" "echo 'vincent' | sudo -S shutdown now"
  done < <(
    grep -vE '^\s*#|^\s*$' $CONF_FOLDER/nodes.cnf | tail -n +2
  )

}

swarm-down() {
  setup-ssh
  echo "Leaving swarm"

  while read -r user ip pass; do
    ssh="$user@$ip"
    echo ">>> node $ip leaving swarm..."
    sshpass -p "$pass" ssh -n -q -A "$ssh" "echo 'vincent' | sudo -S docker swarm leave --force"
  done < <(
    grep -vE '^\s*#|^\s*$' $CONF_FOLDER/nodes.cnf | tail -n +2
  )

  echo ">> master node leaving swarm..."
  sudo docker swarm leave --force
}

###################
while [ "$1" != "" ]; do
  PARAM=$(echo "$1" | awk -F= '{print $1}')
  VALUE=$(echo "$1" | awk -F= '{print $2}')

  case $PARAM in
  help)
    crap
    usage
    exit
    ;;
  cluster-up)
    cluster-up
    ;;
  swarm-init)
    swarm-init
    ;;
  swarm-down)
    swarm-down
    ;;
  cluster-down) #Should it be called shutdown?
    cluster-down
    ;;
  *)
    crap
    usage
    exit
    ;;
  esac
  shift
done
