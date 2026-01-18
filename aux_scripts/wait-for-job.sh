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

# wait to complet
while true; do
  state=$(docker stack ps $JOBID --format '{{.CurrentState}}' | head -n1)
  echo "$state"
  [[ "$state" == *"Complete"* ]] && break
  [[ "$state" == *"Rejected"* ]] && break
  sleep 5
done

# redirect output
#docker service logs ${JOBID}_app >~/src/CRAP-Cluster.ebba/${jobname}.out 2>&1
OUTFILE="$OUTDIR/$JOBID.out"
for s in $(docker stack services $JOBID --format '{{.Name}}'); do
  docker service logs "$s" >>"$OUTFILE" 2>&1
done
echo "Output written to: $OUTFILE"

# cleanup
docker stack rm $JOBID >/dev/null
