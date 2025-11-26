#!/bin/bash
set -e

# Find other service replicas via DNS A-record lookup or switch out for other means of finding the hosts
HOSTS=$(getent hosts mpi-test_mpi | awk '{print $1}')

# Create hostfile
echo "Creating hostfile..."
rm -f /app/hosts
for h in $HOSTS; do
    echo "$h slots=1" >> /app/hosts
done
cat /app/hosts

# Container #1 launches the MPI job
if [ "$(hostname)" == "mpi-test_mpi.1" ]; then
    echo "Starting MPI job from $(hostname)..."
    mpirun --allow-run-as-root -np $(wc -l < /app/hosts) \
        --hostfile /app/hosts \
        /app/hello
else
    # Workers idle until launched by mpirun
    sleep infinity
fi
