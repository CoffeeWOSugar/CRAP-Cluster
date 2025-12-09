#!/usr/bin/env bash
set -euo pipefail

# Configuration via env vars (with sane defaults)
: "${MPI_PROG:=/app/hello}"          # MPI binary to run
: "${MPI_WORKER_SERVICE:=worker}"    # Swarm service name for workers
: "${MPI_RANKS_PER_WORKER:=1}"       # how many ranks per worker container
: "${MPI_WAIT_SECONDS:=2}"           # polling interval while waiting for workers

echo "[master] Starting MPI master script..."
echo "[master] Using worker service: ${MPI_WORKER_SERVICE}"
echo "[master] Ranks per worker: ${MPI_RANKS_PER_WORKER}"

# Wait for worker tasks to be resolvable via Swarm DNS (tasks.<service>)
WORKER_IPS=()
while true; do
    echo "[master] Discovering workers via tasks.${MPI_WORKER_SERVICE}..."

    # getent will list all A records for tasks.worker
    mapfile -t WORKER_IPS < <(getent hosts "tasks.${MPI_WORKER_SERVICE}" 2>/dev/null | awk '{print $1}' | sort -u || true)

    if [ "${#WORKER_IPS[@]}" -gt 0 ]; then
        echo "[master] Found ${#WORKER_IPS[@]} worker(s): ${WORKER_IPS[*]}"
        break
    fi

    echo "[master] No workers found yet, sleeping ${MPI_WAIT_SECONDS}s..."
    sleep "${MPI_WAIT_SECONDS}"
done

# Build hostfile
HOSTFILE=/tmp/mpi_hosts
: > "${HOSTFILE}"

for ip in "${WORKER_IPS[@]}"; do
    echo "${ip} slots=${MPI_RANKS_PER_WORKER}" >> "${HOSTFILE}"
done

echo "[master] Generated hostfile:"
cat "${HOSTFILE}"

TOTAL_RANKS=$(( ${#WORKER_IPS[@]} * MPI_RANKS_PER_WORKER ))
echo "[master] Total ranks: ${TOTAL_RANKS}"

if [ "${TOTAL_RANKS}" -le 0 ]; then
    echo "[master] ERROR: Total ranks <= 0, refusing to run mpirun."
    exit 1
fi

echo "[master] Launching mpirun..."
exec mpirun --allow-run-as-root -np "${TOTAL_RANKS}" --hostfile "${HOSTFILE}" "${MPI_PROG}"

