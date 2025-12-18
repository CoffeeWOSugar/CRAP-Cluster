#!/usr/bin/env bash
set -euo pipefail

REG=192.168.10.1:5000
IMAGE=mpi-test
TAG=$(date +%Y%m%d-%H%M%S)
DIR=$(dirname ${BASH_SOURCE[0]})

docker build -t ${IMAGE}:${TAG} ${DIR}
docker tag ${IMAGE}:${TAG} ${REG}/${IMAGE}:${TAG}
docker tag ${IMAGE}:${TAG} ${REG}/${IMAGE}:latest

docker push ${REG}/${IMAGE}:${TAG}
docker push ${REG}/${IMAGE}:latest

docker stack deploy \
  --resolve-image always \
  -c ${DIR}/compose.yaml mpi
