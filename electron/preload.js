// The only desktop features the game page can reach: the Mods folder and updates.
// SPDX-License-Identifier: GPL-3.0-or-later
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fatewheelDesktop', {
  version: process.argv.find(a => a.startsWith('--fw-version='))?.slice(13) || '',
  listMods: () => ipcRenderer.invoke('mods:list'),
  openModsFolder: () => ipcRenderer.invoke('mods:open'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdate: fn => { ipcRenderer.on('update:status', (e, s) => fn(s)); }
});
