const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true,
  appVersion: '2.0.0',
  closeApp: () => ipcRenderer.send('app:close'),
  minimizeApp: () => ipcRenderer.send('app:minimize'),
  maximizeApp: () => ipcRenderer.send('app:maximize'),
  isMaximized: () => ipcRenderer.invoke('app:is-maximized'),
});
