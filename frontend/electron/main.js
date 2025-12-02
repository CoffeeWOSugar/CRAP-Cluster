const { app, BrowserWindow } = require('electron');
const path = require('path');

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
const { ipcMain } = require('electron');


ipcMain.on('close-window', () => {
  if (win){
   win.close();
   app.quit();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Ensure app quits on all platforms
  app.quit();
});




