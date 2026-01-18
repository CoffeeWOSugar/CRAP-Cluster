
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


export const handleSCPJob = async (localPath) => {
  console.log("Submitting job...");
  let remotePath = "";
  const remotePathCmd = `
    echo "$(find ~ -type d -path "*/CRAP-Cluster/jobs" | head -n 1)"
  `;
  try {
    remotePath = await window.electronAPI.execSSH(remotePathCmd);
    remotePath = remotePath.replace(/\$/g, "").replace(/\r?\n/g, "").replace(/'/g, "").trim();
    const result = await window.electronAPI.uploadFolder(localPath, remotePath);
    console.log("Job submission result:", result);
  } catch (err) {
    console.error("Job submission failed:", err);
  }
  console.log("Job submitted.");
  return remotePath;

};

export const handleJobSubmission = async (remotePath, flags) => {
  console.log(flags);


  let cmd = './crap.sh schedule -timeout ' + flags.timeout;
  if (!flags.cron) {
    cmd += ' -time ' + flags.time + ' ' + flags.day;
  }
  if (flags.cron) {
    cmd += ' -repeat ' + flags.cron;
  }
  if (flags.gpu) {
    cmd += ' gpu=' + flags.gpu;
  }
  if (flags.cpuPower) {
    cmd += ' cpu=' + flags.cpuPower;
  }
  if (flags.memory) {
    cmd += ' mem=' + flags.memory;
  }
  cmd += ' -path ' + remotePath;
  console.log("Submitting job with flags:", cmd);

  const fullCmd = `
      cd "$(find ~ -type d -path "*/CRAP-Cluster" | head -n 1)" || exit 1
      ${cmd}
  `

  try {
    const result = await window.electronAPI.execSSH(fullCmd);
    // return result;
    console.log("Job scheduling result:", result);
  } catch (err) {
    console.error("Job scheduling failed.");
  }
}

export const handleAvailableJobs = async () => {
  const cmd = `
      cd "$(find ~ -type d -path "*/CRAP-Cluster/aux_scripts" | head -n 1)" || exit 1
      ./monitor_jobs.sh
    `
  try {
    const jobsOutput = await window.electronAPI.execSSH(cmd);
    const jobs = jobsOutput
      .split('\n')                // split into lines
      .map(s => s.trim())         // remove extra spaces
      .filter(Boolean)            // remove empty lines
      .map(line => {
        const [jobid, date, time, status] = line.split(' ');
        return { jobid, date, time, status };
      });

    return jobs;
  } catch (err) {
    console.error("Failed to fetch jobs:", err);
    return {};
  }
}

export const handleJobResult = async (jobId) => {
    
  const jobPathCMD= `
    echo "$(find ~ -type d -path "*/CRAP-Cluster/output" | head -n 1)"
  ` 
  const finishJobCMD = `
      cd "$(find ~ -type d -path "*/CRAP-Cluster" | head -n 1)" || exit 1
       ./crap.sh job-wait ${jobId}
    `
  let jobPath = '';
  try{
    await window.electronAPI.execSSH(finishJobCMD);
    jobPath = await window.electronAPI.execSSH(jobPathCMD);
    jobPath = jobPath.replace(/\$/g, "").replace(/\r?\n/g, "").replace(/'/g, "").trim();
    jobPath += `/${jobId}.out`;
    
  } catch (err) {
    console.error("Failed to fetch job result:", err);
  }

  try{
    await window.electronAPI.downloadFile(jobPath, 'downloads');
    
  } catch (err) {
    console.error("Failed to download job result")
  }
}
