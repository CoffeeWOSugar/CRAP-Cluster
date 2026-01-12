const privateKeyPath = import.meta.env.VITE_PRIVATE_KEY_PATH;

export const handleConnect = async (input) => {
  // Split input into username and host
  let username = 'villiam'; // fallback
  let host = input;

  if (input.includes('@')) {
    const parts = input.split('@');
    username = parts[0] || username;
    host = parts[1] || host;
  }

  try {
    const result = await window.electronAPI.connectSSH({
      host,
      username,
      privateKeyPath
    });
    return result; // return something so the caller knows it succeeded
  } catch (err) {
    console.error("SSH connection failed:", err);
    throw err; // rethrow to let the caller handle it
  }
};
// export default handleConnect;

export const handleAvailableIPs = async () => {
  try {
    const ips = await window.electronAPI.execSSH(
      'cd "$(find ~ -type d -path "*/CRAP-Cluster/config" | head -n 1)" && awk \'!/^[[:space:]]*#/ && NF { print (NF==1 ? $1 : $2) }\' nodes.cnf'
    );


    let connectedIps = await window.electronAPI.execSSH(
      `for NODE in $(docker node ls --format '{{.Hostname}}'); do
        echo "$(docker node inspect --format '{{.Status.Addr}}' "$NODE")"
      done`
    );

    connectedIps = connectedIps.split('\n').map(s => s.trim()).filter(Boolean);
    const host = connectedIps[0];

    return {
      ips: ips.split('\n').map(s => s.trim()).filter(Boolean),
      connectedIps: connectedIps,
      currentHost: host
    };
  } catch (err) {
    console.error("Failed to fetch IPs:", err);
    return {
      ips: [],
      connectedIps: [],
      currentHost: null
    }
  }
};

export const handleNewNode = async (username, host, pass) => {
  const line = `${username} ${host} ${pass}`;

  const cmd = `
  cd "$(find ~ -type d -path "*/CRAP-Cluster/config" | head -n 1)" || exit 1
  echo "${line}" >> nodes.cnf
  `;

  await window.electronAPI.execSSH(cmd);
  console.log("New node data:", name, pass);
}

export const handleRemoveNode = async (username, host) => {
  const line = `${username} ${host}`;
  try {

   const cmd = `
      # Find the line in nodes.cnf
      cd "$(find ~ -type d -path "*/CRAP-Cluster/config" | head -n 1)" || exit 1
      node_line=$(grep -E "^[[:space:]]*${username}[[:space:]]+${host}[[:space:]]+" nodes.cnf || true)

      if [ -z "$node_line" ]; then
        echo "Node not found in nodes.cnf"
        exit 1
      fi

      # Extract SSH user, host IP, and password
      read user host_ip pass <<< "$node_line"

      # SSH into worker and leave swarm
      sshpass -p "$pass" ssh -o StrictHostKeyChecking=no "$user@$host_ip" '
        echo "'"$pass"'" | sudo -S docker swarm leave
      '

      # Find the Swarm node name by IP and remove it from manager
      for node in $(docker node ls -q); do
        ip=$(docker node inspect "$node" --format '{{ .Status.Addr }}')
        if [ "$ip" = "$host_ip" ]; then
          echo "Removing Swarm node $node with IP $ip"
          docker node rm --force "$node" || true
          break
        fi
      done

      # Remove the node from nodes.cnf
      sed -i.bak "/^${username}[[:space:]]\\+${host}[[:space:]]/d" nodes.cnf
    `;

    await window.electronAPI.execSSH(cmd);
  }
  catch (err) {
    console.error("Node not in conf file:", err);
  }
}

export const handleConnectNodes = async () => {
  try {
  const cmd = `
      cd "$(find ~ -type d -path "*/CRAP-Cluster" | head -n 1)" || exit 1
      ./crap.sh swarm-init
  `
    await window.electronAPI.execSSH(cmd);
  } catch (err) {
    console.error("Failed to connect nodes:", err);
  }
}

