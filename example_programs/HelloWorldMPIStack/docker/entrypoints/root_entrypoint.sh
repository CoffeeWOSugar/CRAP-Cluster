#!/usr/bin/env bash
set -euo pipefail

: "${MPI_PROG:=/app/hello}"
: "${MPI_WORKER_SERVICE:=worker}"
: "${MPI_RANKS_PER_WORKER:=1}"
: "${MPI_WAIT_SECONDS:=20}"

echo "[master] service=${MPI_WORKER_SERVICE} ranks_per_worker=${MPI_RANKS_PER_WORKER}"

install -d -m 700 /root/.ssh
chmod 600 /app/ssh/id_ed25519 2>/dev/null || true

touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
if ! grep -qxF "$(cat /app/ssh/id_ed25519.pub)" /root/.ssh/authorized_keys; then
  cat /app/ssh/id_ed25519.pub >>/root/.ssh/authorized_keys
fi

# Create SSH config for root
# Disable host key checking and ignore known_hosts entries
cat >/root/.ssh/config <<'EOF'
Host *
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
chmod 600 /root/.ssh/config

while :; do
  mapfile -t WORKER_IPS < <(getent hosts "tasks.${MPI_WORKER_SERVICE}" 2>/dev/null | awk '{print $1}' | sort -u || true)
  ((${#WORKER_IPS[@]})) && break
  echo "[master] waiting_for_workers sleep=${MPI_WAIT_SECONDS}s"
  sleep "${MPI_WAIT_SECONDS}"
done

HOSTFILE="$(mktemp /tmp/mpi_hosts.XXXXXX)"
for ip in "${WORKER_IPS[@]}"; do
  printf '%s slots=%s\n' "$ip" "$MPI_RANKS_PER_WORKER" >>"$HOSTFILE"
done
mv -f "$HOSTFILE" /tmp/mpi_hosts
HOSTFILE=/tmp/mpi_hosts

TOTAL_RANKS=$((${#WORKER_IPS[@]} * MPI_RANKS_PER_WORKER))
echo "[master] workers=${#WORKER_IPS[@]} total_ranks=${TOTAL_RANKS}"
cat "$HOSTFILE"

exec mpirun --allow-run-as-root \
  --tag-output \
  -np "${TOTAL_RANKS}" \
  --hostfile "${HOSTFILE}" \
  --oversubscribe \
  -x PATH \
  -mca plm_rsh_agent "ssh -i /app/ssh/id_ed25519 -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  "${MPI_PROG}"
