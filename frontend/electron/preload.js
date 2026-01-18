const { contextBridge, ipcRenderer} = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
    connectSSH: (data) => ipcRenderer.invoke('connect-ssh', data),
    close: () => ipcRenderer.send('close-window'),
    execSSH: (command) => ipcRenderer.invoke('ssh-exec', command),
    openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
    uploadFolder: (localFolder, remoteFolder) => ipcRenderer.invoke("upload-folder", localFolder, remoteFolder),
    downloadFile: (remoteFile, localDownloadDir) => ipcRenderer.invoke("download-file", remoteFile, localDownloadDir)
});