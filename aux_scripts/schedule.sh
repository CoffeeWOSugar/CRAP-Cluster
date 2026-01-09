#!/bin/bash
set -euo pipefail
# Schedule a job on the cluster

# args
JOBID="job-$(cat ../config/job_id)"
echo $((${JOBID#job-} + 1)) >../config/job_id
folder=$1
shift
# vars
outdir=$(realpath $(dirname $0))
REG=192.168.10.1:5000
TAG=$(date +%Y%m%d-%H%M%S)
IMAGE=$JOBID
PLACEMENT_BLOCK=""
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
envsubst <compose.yaml.in >$folder/compose.yaml

# Create image
cd $folder

docker build -t ${IMAGE}:${TAG} .
docker tag ${IMAGE}:${TAG} ${REG}/${IMAGE}:${TAG}
docker tag ${IMAGE}:${TAG} ${REG}/${IMAGE}:latest

docker push ${REG}/${IMAGE}:${TAG}
docker push ${REG}/${IMAGE}:latest

# deploy stack
docker stack deploy --compose-file compose.yaml $JOBID

# check if running
docker stack services $JOBID

# wait to complete
while true; do
  state=$(docker stack ps $JOBID --format '{{.CurrentState}}' | head -n1)
  echo "$state"
  [[ "$state" == *"Complete"* ]] && break
  sleep 5
done

# redirect output
#docker service logs ${JOBID}_app >~/src/CRAP-Cluster.ebba/${jobname}.out 2>&1
for s in $(docker stack services $JOBID --format '{{.Name}}'); do
  docker service logs "$s" >"$outdir/$s.out" 2>&1
done

# cleanup
docker stack rm $JOBID
