#!/bin/bash
# To simplify adding a label to a node
# TODO more labels

NODE=$1
LABEL=$2

docker node update \
  --label-add $LABEL \
  $NODE
