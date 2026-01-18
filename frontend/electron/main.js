// import { exec } from "child_process"; 
const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const { Client } = require('ssh2');
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();


const isDev = !app.isPackaged;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../index.html"));
  }
}


ipcMain.on('close-window', () => {
  if (win){
   win.close();
   app.quit();
  }
});

// connect and save client connection.
let sshClient = null;
let currentSSHHost = null;
let currentSSHName = null;

ipcMain.handle('connect-ssh', async (event, { host, privateKeyPath, username }) => {
  return new Promise((resolve, reject) => {
    if (sshClient) {
      resolve('Already connected');
      return;
    }

    sshClient = new Client();
    sshClient
      .on('ready', () => {
        console.log(`SSH Connected to ${host}`);
        resolve(`Connected to ${host}`);
      })
      .on('error', (err) => {
        sshClient = null;
        reject(err.message);
      })
      .connect({
        host,
        port: 22,
        username,
        privateKey: fs.readFileSync(privateKeyPath)
      });
    currentSSHHost = host;
    currentSSHName = username;
  });
});

//open file dialog
ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "multiSelections"], // or openDirectory
  });

  return result;
});

//execute command on ssh-client
ipcMain.handle('ssh-exec', async (event, command) => {
  return new Promise((resolve, reject) => {
    if (!sshClient) {
      reject('SSH not connected');
      return;
    }

    let output = '';

    sshClient.exec(command, (err, stream) => {
      if (err) return reject(err.message);

      stream.on('data', data => {
        const text = data.toString();
        console.log('[SSH STDOUT]', text);
        output += text;
      });

      stream.stderr.on('data', data => {
        console.error('[SSH STDERR]', data.toString());
      });

      stream.on('close', () => {
        resolve(output);
      });
    });
  });
});

//
ipcMain.handle('disconnect-ssh', () => {
  if (sshClient) {
    sshClient.end();
    sshClient = null;
  }
  return 'Disconnected';
});

async function uploadFolder(localFolder, remoteFolder) {
  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host: currentSSHHost,           // your server
      username: currentSSHName,              // your SSH user
      privateKey: fs.readFileSync(process.env.VITE_PRIVATE_KEY_PATH), // use your SSH private key
      // password: "your_password",  // alternative (less secure)
    });
      const folderName = path.basename(localFolder); 
      const remotePath = path.posix.join(remoteFolder, folderName);
    // Upload local folder to remote
    await sftp.uploadDir(localFolder, remotePath);
    console.log("Upload successful!");
    return "success";
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  } finally {
    sftp.end();
  }
}

ipcMain.handle("upload-folder", async (_, localFolder, remoteFolder) => {
  return uploadFolder(localFolder, remoteFolder);
});

async function downloadFile(remoteFilePath, localDownloadDir) {
  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host: currentSSHHost,
      username: currentSSHName,
      privateKey: fs.readFileSync(process.env.VITE_PRIVATE_KEY_PATH),
    });

    const fileName = path.posix.basename(remoteFilePath);
    const localFilePath = path.join(localDownloadDir, fileName);

    // Ensure local download directory exists
    fs.mkdirSync(localDownloadDir, { recursive: true });

    // Download file
    await sftp.fastGet(remoteFilePath, localFilePath);

    console.log("File downloaded successfully!");
    return "success";
  } catch (err) {
    console.error("Download failed:", err);
    throw err;
  } finally {
    sftp.end();
  }
}

ipcMain.handle("download-file", async (_, remoteFilePath, localDownloadDir) => {
  return downloadFile(remoteFilePath, localDownloadDir);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Ensure app quits on all platforms
  app.quit();
});




