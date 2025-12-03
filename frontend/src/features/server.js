const privateKeyPath = import.meta.env.VITE_PRIVATE_KEY_PATH;
const handleConnect = async () => {
  const input = document.getElementById('textHost').value; // e.g., "user@host.com"

  // Split input into username and host
  let username = 'villiam'; // fallback if user is missing
  let host = input;

  if (input.includes('@')) {
    const parts = input.split('@');
    username = parts[0];
    host = parts[1];
  }

  // try {
    const result = await window.electronAPI.connectSSH({
      host,
      username,
      privateKeyPath // path to your private key
    });
  //   alert(result);
  // } catch (err) {
  //   alert('Connection failed: ' + err);
  // }
};

export default handleConnect;