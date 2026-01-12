#!/bin/bash
# Check current state of job
# ./status.sh jobid

JOBID=$1
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
OUTDIR=$REPO_ROOT/output

usage() {
  echo "Wait for job to finish running and show its current status"
  echo "Usage:"
  echo "  job-wait job-id"
}

if [[ "$1" == "-h" ]]; then
  usage
  exit
fi

if docker stack ls --format '{{.Name}}' | grep -qx "$JOBID"; then
  echo "Job $JOBID exists"
else
  echo "$JOBID does not exist"
  exit
fi

# wait to complet0
while true; do
  state=$(docker stack ps $JOBID --format '{{.CurrentState}}' | head -n1)
  echo "$state"
  [[ "$state" == *"Complete"* ]] && break
  sleep 5
done

# redirect output
#docker service logs ${JOBID}_app >~/src/CRAP-Cluster.ebba/${jobname}.out 2>&1
for s in $(docker stack services $JOBID --format '{{.Name}}'); do
  docker service logs "$s" >"$OUTDIR/$s.out" 2>&1
  echo "Output written to: $OUTDIR/$s.out"
done

# cleanup
docker stack rm $JOBID >/dev/null
