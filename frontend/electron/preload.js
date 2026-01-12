const { contextBridge, ipcRenderer} = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
    connectSSH: (data) => ipcRenderer.invoke('connect-ssh', data),
    close: () => ipcRenderer.send('close-window'),
    execSSH: (command) => ipcRenderer.invoke('ssh-exec', command),

});