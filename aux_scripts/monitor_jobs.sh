#!/bin/bash
# Check current state of job
# ./status.sh jobid
for stack in $(docker stack ls --format '{{.Name}}'); do

  for service in $(docker service ls --filter label=com.docker.stack.namespace=$stack --format '{{.Name}}'); do
    service_name=${service%%_*}
    created=$(docker service inspect "$service" --format '{{.CreatedAt}}' | cut -d'.' -f1 | tr 'T' ' ')

    # Task statuses
    status=$(docker service ps "$service" --format '{{.CurrentState}}' | awk '{print $1}')

    echo "$service_name $created $status"
  done
done

