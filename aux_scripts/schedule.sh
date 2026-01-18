#!/bin/bash
set -euo pipefail
# Schedule a job on the cluster

#----- Instructions
# ./schedule.sh FOLDER labels
# ./schedule.sh jobs/DocherStackDemo gpu=true mem=small

# ----- VARIABLES
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
#JOBID="job-$(cat $REPO_ROOT/config/job_id)"
#outdir=$(realpath $(dirname $0)) # CHANGE TO REPO_ROOT/output
REG=192.168.10.1:5000
TAG=$(date +%Y%m%d-%H%M%S)
PLACEMENT_BLOCK=""
COMPOSEFILE=$REPO_ROOT/config/compose.yaml.in # Template compose-file

# ---- FUNCTIONS

usage() {
  echo ""
  echo "--- SCHEDULE JOB ---"
  echo ""
  echo "Schedule a job on the cluster"
  echo "Job folder should contain following:"
  echo "  - Executable"
  echo "  - Dockerfile"
  echo "  - requirements.txt"
  echo "  - compose.yaml (optional)"
  echo ""
  echo "Usage: "
  echo "  schedule /path/to/job/folder options"
  echo ""
  echo "Options: "
  echo "  - gpu=true"
  echo "  - cpu=small/medium/large/xlarge"
  echo "  - mem=small/medium/large/xlarge"
  echo ""
  echo "Example:"
  echo "  schedule jobs/DockerStackDemo mem=small gpu=true"
  echo ""
}

# ----- SCRIPT

# help message
if [[ "$#" == 0 || "$1" == "-h" ]]; then
  usage
  exit 0
fi

# ----- ARGUMENTS
#JOB=$1
echo "ARGS: $@"
FOLDER="$1"
JOBID="$2"
IMAGE=$JOBID
echo "$FOLDER"
echo "JOBID: $JOBID"
shift 2

if [[ "$#" != 0 && "$1" == "mpi" ]]; then
  COMPOSEFILE=$REPO_ROOT/config/compose_mpi.yaml.in # Template compose-file
  shift
fi

# Increment JOBID
echo $((${JOBID#job-} + 1)) >$REPO_ROOT/config/job_id

# Validate labels
for arg in "$@"; do
  key=${arg%%=*}
  val=${arg#*=}

  docker node inspect $(docker node ls -q) \
    --format '{{ .Spec.Labels }}' | grep -q "$key:$val" || {
    echo "No nodes match $key=$val"
    exit 1
  }
done

# Add labels to compose-file
if [[ $# -gt 0 ]]; then
  PLACEMENT_BLOCK=$'      placement: \n        constraints: \n'
  for arg in "$@"; do
    key=${arg%%=*}
    val=${arg#*=}
    PLACEMENT_BLOCK+=$"          - node.labels.$key == $val"
    PLACEMENT_BLOCK+=$'\n'
  done
fi
export PLACEMENT_BLOCK

#PROFILE=$3
export IMAGE
export REG
export PROFILE
envsubst <$COMPOSEFILE >$FOLDER/compose.yaml

# Create image
cd $FOLDER

docker build -t ${IMAGE}:${TAG} .
docker tag ${IMAGE}:${TAG} ${REG}/${IMAGE}:${TAG}
docker tag ${IMAGE}:${TAG} ${REG}/${IMAGE}:latest

docker push ${REG}/${IMAGE}:${TAG}
docker push ${REG}/${IMAGE}:latest

# deploy stack
docker stack deploy --compose-file compose.yaml $JOBID

# check if running
docker stack services $JOBID
echo "JOBID: $JOBID"
