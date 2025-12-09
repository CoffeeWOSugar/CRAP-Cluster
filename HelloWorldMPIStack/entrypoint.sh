#!/bin/bash

if [ "$ENTRYPOINT_TYPE" = "root" ]; then
    exec /usr/local/bin/root_entrypoint.sh "$@"
else
    exec /usr/local/bin/node_entrypoint.sh "$@"
fi
