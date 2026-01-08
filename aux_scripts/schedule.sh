#!/bin/bash

# Schedule a job on the cluster

# vars
registry=127.0.0.1:5000
outdir=$(realpath $(dirname $0))

# args
jobname=$1
folder=$2
# Create image
cd $folder
docker build -t $registry/$jobname .
docker push $registry/$jobname

# deploy stack
docker stack deploy --compose-file test.yaml $jobname

# check if running
docker stack services $jobname

# wait to complete
while true; do
  state=$(docker stack ps $jobname --format '{{.CurrentState}}' | head -n1)
  echo "$state"
  [[ "$state" == *"Complete"* ]] && break
  sleep 5
done

# redirect output
#docker service logs ${jobname}_app >~/src/CRAP-Cluster.ebba/${jobname}.out 2>&1
for s in $(docker stack services $jobname --format '{{.Name}}'); do
  docker service logs "$s" >"$outdir/$s.out" 2>&1
done

# cleanup
docker stack rm $jobname
