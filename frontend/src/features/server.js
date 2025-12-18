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
