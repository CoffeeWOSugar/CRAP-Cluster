#!/usr/bin/env bash
set -e

# Start SSH server and ensure we have a key for root

# Ensure ssh host keys directory exists
mkdir -p /var/run/sshd

# Add public key to node's authorized_keys
mkdir -p /root/.ssh
chmod 700 /root/.ssh
cat ssh/id_ed25519.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Create SSH config for root
# Disable host key checking and ignore known_hosts entries
cat <<EOF > /root/.ssh/config
Host *
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
chmod 600 /root/.ssh/config

# Relax a couple of defaults for containers
if grep -q "^#PermitRootLogin" /etc/ssh/sshd_config; then
    sed -i 's/^#PermitRootLogin .*/PermitRootLogin yes/' /etc/ssh/sshd_config
else
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
fi

# Avoid pam_loginuid issues in containers
if grep -q "session\s\+required\s\+pam_loginuid.so" /etc/pam.d/sshd; then
    sed -i 's/session\s\+required\s\+pam_loginuid.so/session optional pam_loginuid.so/' /etc/pam.d/sshd
fi

echo "[entrypoint] Starting sshd..."
/usr/sbin/sshd

# Hand off to the container's main command (e.g. start_master.sh or sleep)
echo "[entrypoint] Executing: $*"
exec "$@"
