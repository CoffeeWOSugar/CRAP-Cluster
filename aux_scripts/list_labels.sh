#!/bin/bash

for node in $(docker node ls -q); do
  docker node inspect "$node" \
    --format '{{ .Description.Hostname }}: {{ .Spec.Labels }}'
done
