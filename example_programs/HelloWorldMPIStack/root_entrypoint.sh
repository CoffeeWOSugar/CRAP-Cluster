#!/usr/bin/env bash
set -euo pipefail

: "${MPI_PROG:=/app/hello}"
: "${MPI_WORKER_SERVICE:=worker}"
: "${MPI_RANKS_PER_WORKER:=1}"
: "${MPI_WAIT_SECONDS:=20}"

echo "[master] Starting MPI master script..."
echo "[master] Using worker service: ${MPI_WORKER_SERVICE}"
echo "[master] Ranks per worker: ${MPI_RANKS_PER_WORKER}"

# SSH SETUP
mkdir -p /root/.ssh
chmod 700 /root/.ssh
chmod 600 ssh/id_ed25519 || true
cat ssh/id_ed25519.pub >>/root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

cat <<EOF >/root/.ssh/config
Host *
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
chmod 600 /root/.ssh/config

# Get Worker ips for hostfile creation
WORKER_IPS=()
while true; do
  echo "[master] Waiting for workers to start, sleeping ${MPI_WAIT_SECONDS}s..."
  sleep "${MPI_WAIT_SECONDS}"

  echo "[master] Discovering workers via tasks.${MPI_WORKER_SERVICE}..."
  mapfile -t WORKER_IPS < <(getent hosts "tasks.${MPI_WORKER_SERVICE}" 2>/dev/null | awk '{print $1}' | sort -u || true)

  if [ "${#WORKER_IPS[@]}" -gt 0 ]; then
    echo "[master] Found ${#WORKER_IPS[@]} worker(s): ${WORKER_IPS[*]}"
    break
  fi

  echo "[master] No workers found yet..."
done

HOSTFILE=/tmp/mpi_hosts
: >"${HOSTFILE}"
for ip in "${WORKER_IPS[@]}"; do
  echo "${ip} slots=${MPI_RANKS_PER_WORKER}" >>"${HOSTFILE}"
done

echo "[master] Generated hostfile:"
cat "${HOSTFILE}"

TOTAL_RANKS=$((${#WORKER_IPS[@]} * MPI_RANKS_PER_WORKER))
echo "[master] Total ranks: ${TOTAL_RANKS}"

if [ "${TOTAL_RANKS}" -le 0 ]; then
  echo "[master] ERROR: Total ranks <= 0, refusing to run mpirun."
  exit 1
fi

echo "[master] Launching mpirun..."
exec mpirun --allow-run-as-root \
  -np "${TOTAL_RANKS}" \
  --hostfile "${HOSTFILE}" \
  --oversubscribe \
  -x PATH \
  -mca plm_rsh_agent "ssh -i /app/ssh/id_ed25519 -o StrictHostKeyChecking=no" \
  "${MPI_PROG}"
