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

# initialize swarm and registry
swarm-init() {
  setup_ssh
  $SCRIPT_FOLDER/swarm_setup.sh
  $SCRIPT_FOLDER/registry_setup.sh
}

registry-init() {
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

schedule() {
  # Add all cron variables to args
  args=()
  TIMEOUT=""
  MODE=""
  CRON_ARGS=()
  PROGRAM_PATH=$SCRIPT_FOLDER/schedule.sh
  PROGRAM_PATH=$(realpath "$PROGRAM_PATH")
  LOG_FILE=$(realpath "cron.log")
  echo "$PROGRAM_PATH"
  # shift

  if [[ "$1" == "help" || $# -lt 1 ]]; then
    echo "Usage: ./crap.sh schedule -path <job_path> [options]"
    echo
    echo "Options:"
    echo "    -timeout DURATION		  Terminate program after some time"
    echo "    -time [HH:MM] [day]           Schedule a one-time job"
    echo "    -repeat MIN HOUR DOM MON DOW  Schedule a repeating job (cron syntax)"
    echo
    echo "List all jobs using crontab -l and atq"
    echo "Remove jobs using crontab -r and atrm [job_id]"
    echo
    echo "Example:"
    echo "    ./crap.sh schedule example_programs/HelloWorldMPIStack/build_deploy.sh -timeout 1h -time 22:00 today"
    echo "    ./crap.sh schedule example_programs/HelloWorldMPIStack/build_deploy.sh -timeout 10m -repeat 0 22"
    echo
    echo "Note: -timeout must appear before -time and -repeat"
    exit 0
  fi

  while [ $# -gt 0 ]; do
    case "$1" in
    -timeout)
      shift
      TIMEOUT="$1"
      shift
      ;;

    -time)
      MODE="at"
      AT_TIME="$2 $3"
      shift 3
      ;;

    -repeat)
      MODE="cron"
      shift
      while [[ $# -gt 0 && $1 != -* || CRON_ARGS -lt 5 ]]; do
        CRON_ARGS+=("$1")
        shift
      done
      ;;
    -path)
      shift
      JOB_PATH="$(realpath "$1")"
      echo $JOB_PATH
      shift
      ;;
    *)
      break
      ;;
    esac
  done

  # build  Command
  if [[ -n "$TIMEOUT" ]]; then
    CMD="timeout $TIMEOUT $JOB_PATH $PROGRAM_PATH $* >> $LOG_FILE 2>&1"
  else
    CMD="$PROGRAM_PATH $JOB_PATH $* >> $LOG_FILE 2>&1"
  fi

  echo "Scheduling $CMD"
  # One-time job
  if [[ "$MODE" == "at" ]]; then
    echo "$CMD" | at "$AT_TIME"
    echo "All queued one-time jobs:"
    atq
    return 0
  fi

  # Repeating job
  if [[ "$MODE" == "cron" ]]; then

    cron_line="${CRON_ARGS[0]} ${CRON_ARGS[1]} ${CRON_ARGS[2]} ${CRON_ARGS[3]} ${CRON_ARGS[4]} $CMD"

    (
      crontab -l 2>/dev/null
      echo "$cron_line"
      while [[ ${#CRON_ARGS[@]} -lt 5 ]]; do
        CRON_ARGS+=("*")
      done
    ) | crontab -

    crontab -l
  fi
  # Run immediately
  if [[ -n "$MODE" ]]; then
    submit-job "$@"
  #JOB_PATH="$(realpath "$1")0
  fi
  #FIND JOBID????????

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
schedule-job)
  schedule "$@"
  ;;
*)
  echo "Command $COMMAND does not exist"
  crap
  usage
  exit
  ;;
esac
shift
