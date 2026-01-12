#!/bin/bash

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
CONF_DIR=$REPO_ROOT/config

usage() {
  echo "--- AUTO LABEL ---"
  echo "Label nodes based on hardware"
  echo "Labels: "
  echo "  gpu: true/false"
  echo "  cpu: small/medium/large/xlarge"
  echo "  mem: small/medium/large/xlarge"
  echo ""
  echo "options:"
  echo "  -h  show this help message"
  echo ""
}

cpu_class() {
  local n=$1
  if ((n < 16)); then
    echo small
  elif ((n < 32)); then
    echo medium
  elif ((n < 64)); then
    echo large
  else
    echo xlarge
  fi
}

mem_class() {
  local gb=$1
  if ((gb < 32)); then
    echo small
  elif ((gb < 64)); then
    echo medium
  elif ((gb < 128)); then
    echo large
  else
    echo xlarge
  fi
}

if [[ "$#" != 0 ]]; then
  usage
  exit 0
fi

while read -r user ip pass; do
  ssh_target="$user@$ip"

  # get Swarm node name from remote host
  node=$(sshpass -p "$pass" ssh -n -o StrictHostKeyChecking=no "$ssh_target" hostname)
  echo "Checking node: $node"

  # detect GPU remotely
  if sshpass -p "$pass" ssh -n -o StrictHostKeyChecking=no "$ssh_target" \
    "command -v nvidia-smi >/dev/null 2>&1"; then
    echo "  GPU detected"
    gpu=true
  else
    echo "  No GPU"
    gpu=false
  fi

  # ---- CPU detection
  cpus=$(sshpass -p "$pass" ssh -n "$ssh_target" nproc)
  cpu_label=$(cpu_class "$cpus")
  echo "  CPU class $cpu_label"

  # ---- MEM detection
  mem_gb=$(sshpass -p "$pass" ssh -n "$ssh_target" \
    "free -g | awk '/^Mem:/ {print \$2}'")
  echo "  Mem $mem_gb gb"
  mem_label=$(mem_class "$mem_gb")

  docker node update \
    --label-add gpu="$gpu" \
    --label-add cpu="$cpu_label" \
    --label-add mem="$mem_label" \
    "$node"

done < <(
  grep -vE '^\s*#|^\s*$' "$CONF_DIR/nodes.cnf" | tail -n +2
)

# ---- label manager itself ----
echo "Checking manager node: $(hostname)"
node=$(hostname)
cpus=$(nproc)
cpu_label=$(cpu_class "$cpus")
echo "  CPU class $cpu_label"

mem_gb=$(free -g | awk '/^Mem:/ {print $2}')
mem_label=$(mem_class "$mem_gb")
echo "  Mem $mem_gb gb"

if command -v nvidia-smi >/dev/null 2>&1; then
  echo "  GPU detected"
  gpu=true
else
  echo "  no GPU"
  gpu=false
fi

docker node update \
  --label-add gpu="$gpu" \
  --label-add cpu="$cpu_label" \
  --label-add mem="$mem_label" \
  "$node"
