#!/bin/bash

if [ "$ENTRYPOINT_TYPE" = "root" ]; then
  exec /opt/mpi/bin/root_entrypoint.sh "$@"
else
  exec /opt/mpi/bin/node_entrypoint.sh "$@"
fi
