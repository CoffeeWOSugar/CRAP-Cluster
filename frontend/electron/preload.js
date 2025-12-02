const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    connectSSH: (data) => ipcRenderer.invoke('connect-ssh', data),
    close: () => ipcRenderer.send('close-window')
});