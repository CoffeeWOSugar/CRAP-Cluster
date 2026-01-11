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
  echo "	label-nodes   Label nodes in cluster automaticcaly"
  echo "	show-labels   Show labels for all nodes in cluster"
  echo "	submit-job    Submit-job to cluster, -h for more info"
  echo "	job-wait      Wait for job to finish and cleanup, -h for more info"
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

# initialize swarm and registry
swarm-init() {
  setup_ssh
  $SCRIPT_FOLDER/swarm_setup.sh
  $SCRIPT_FOLDER/registry_setup.sh
}

# Power down cluster
cluster-down() {
  setup_ssh
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
  setup_ssh
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

# ---- label-nodes automaticcaly
# Labels:
# gpu: true/false
# cpu: small/medium/large/xlarge
# mem: small/medium/large/xlarge
label-nodes() {
  setup_ssh
  echo "Labeling nodes"
  $SCRIPT_FOLDER/auto_label.sh
}

show-labels() {
  setup_ssh >/dev/null 2>&1
  echo "Node labels"
  $SCRIPT_FOLDER/list_labels.sh
}

submit-job() {
  setup_ssh >/dev/null 2<&1
  $SCRIPT_FOLDER/schedule.sh "$@"
}

job-wait() {
  setup_ssh >/dev/null 2<&1
  $SCRIPT_FOLDER/wait-for-job.sh "$@"
}

###################
if [[ $# -eq 0 ]]; then
  crap
  usage
  exit 1
fi

COMMAND=${1:-help}
shift || true

case $COMMAND in
help | -h | --help)
  crap
  usage
  exit 0
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
  cluster-dowg
  ;;
label-nodes)
  label-nodes
  ;;
show-labels)
  show-labels
  ;;
submit-job)
  submit-job "$@" #pass remaining arguments
  ;;
job-wait)       #wait for job to finish and cleanup
  job-wait "$@" #pass remaining arguments
  ;;
*)
  crap
  usage
  exit
  ;;
esac
shift

#
#while [ "$1" != "" ]; do
#  PARAM=$(echo "$1" | awk -F= '{print $1}')
#  VALUE=$(echo "$1" | awk -F= '{print $2}')
#
#  case $PARAM in
#  help)
#    crap
#    usage
#    exit
#    ;;
#  cluster-up)
#    cluster-up
#    ;;
#  swarm-init)
#    swarm-init
#    ;;
#  swarm-down)
#    swarm-down
#    ;;
#  cluster-down) #Should it be called shutdown?
#    cluster-dowg
#    ;;
#  label-nodes)
#    label-nodes
#    ;;
#  show-labels)
#    show-labels
#    ;;
#  *)
#    crap
#    usage
#    exit
#    ;;
#  esac
#  shift
#done
