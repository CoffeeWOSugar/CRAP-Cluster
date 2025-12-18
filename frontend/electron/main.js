const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const { Client } = require('ssh2');
const fs = require('fs');

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
    // win.webContents.openDevTools();
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
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Ensure app quits on all platforms
  app.quit();
});




