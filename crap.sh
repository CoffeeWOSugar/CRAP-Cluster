#!/bin/bash

#
SCRIPT_FOLDER=aux_scripts
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
  echo "	schedule      Schedule jobs (see './crap.sh schedule help' for usage)"
  exit 1
}

setup-ssh() {
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

registry-init() {
  $SCRIPT_FOLDER/registry_setup.sh
}

# Power down cluster
cluster-down() {
  setup-ssh
  echo "Shutting down cluster and powering off machines"

  while IFS="" read -r node || [ -n "$node" ]; do
    arr=($node)
    name="${arr[0]}"
    pass="${arr[1]}"
    echo ">>> node $node shutting down..."
    sshpass -p "$pass" ssh -n -q -A "$name" "echo 'vincent' | sudo -S shutdown now"
  done <config/nodes.cnf

}

swarm-down() {
  setup-ssh
  echo "Leaving swarm"

  while IFS="" read -r node || [ -n "$node" ]; do
    arr=($node)
    name="${arr[0]}"
    pass="${arr[1]}"
    echo ">>> node $node leaving swarm..."
    sshpass -p "$pass" ssh -n -q -A "$name" "echo 'vincent' | sudo -S docker swarm leave --force"
  done <config/nodes.cnf

  echo ">> master node leaving swarm..."
  sudo docker swarm leave --force
}

schedule() {
  # Add all cron variables to args
  args=()
  PROGRAM_PATH="$1"
  shift

  if [ "$PROGRAM_PATH" == "help" ]; then
    echo "Usage: ./crap.sh schedule <program_path> [options]"
    echo
    echo "Options:"
    echo "    -time [HH:MM] [day]           Schedule a one-time job"
    echo "    -repeat MIN HOUR DOM MON DOW  Schedule a repeating job (cron syntax)"
    echo
    echo "List all jobs using crontab -l and atq"
    echo "Remove jobs using crontab -r and atrm [job_id]"
    echo
    echo "Example:"
    echo "    ./crap.sh schedule example_programs/HelloWorldMPIStack/build_deploy.sh -time 22:00 today"
    echo "    ./crap.sh schedule example_programs/HelloWorldMPIStack/build_deploy.sh -repeat 0 22"
    exit 0
  fi

  while [ $# -gt 0 ]; do
    case "$1" in
      -time)
        shift
        echo "$PROGRAM_PATH" | at "$1" "$2" 2> /tmp/at_error.log || {
          echo "Error: Follow syntax -time [HH:MM] [day]" >&2
          echo "Example: -time 22:00 today"
          exit 1
        }
	echo "All queued one-time jobs:"
	atq
        shift 2
        ;;

      -repeat)
        shift
        while [ $# -gt 0 ] && [[ $1 != -* ]]; do
          args+=("$1")
          shift
        done

        # Create cron job
        while [ "${#args[@]}" -lt 5 ]; do
          args+=("*")
        done

        cron_line="${args[0]} ${args[1]} ${args[2]} ${args[3]} ${args[4]} $PROGRAM_PATH"
        (crontab -l 2>/dev/null; echo "$cron_line") | crontab -
        echo "All cron jobs:"
        crontab -l
        ;;
      *)
        break
        ;;
    esac
  done
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
  registry-init)
    registry-init
    ;;
  elsas-run)
    ./example_programs/HelloWorldMPIStack/build_deploy.sh
    ;;
  schedule)
    shift
    schedule "$@"
    exit 0
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
