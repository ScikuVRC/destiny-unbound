// The only desktop features the game page can reach: the Mods folder, updates, window and display settings,
// logs and feedback, save backups, and the Discord status (Rich Presence).
// SPDX-License-Identifier: GPL-3.0-or-later
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fatewheelDesktop', {
  version: process.argv.find(a => a.startsWith('--fw-version='))?.slice(13) || '',
  listMods: () => ipcRenderer.invoke('mods:list'),
  openModsFolder: () => ipcRenderer.invoke('mods:open'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdate: fn => {
    ipcRenderer.on('update:status', (e, s) => fn(s));
  },
  windowInfo: () => ipcRenderer.invoke('win:info'),
  setWindow: o => ipcRenderer.invoke('win:set', o),
  setZoom: z => ipcRenderer.invoke('win:zoom', z),
  setVsync: on => ipcRenderer.invoke('app:vsync', on),
  relaunch: () => ipcRenderer.invoke('app:relaunch'),
  quit: () => ipcRenderer.invoke('app:quit'),
  log: (level, msg) => ipcRenderer.invoke('log:write', level, String(msg).slice(0, 4000)),
  openLogs: () => ipcRenderer.invoke('log:open'),
  saveFeedback: o => ipcRenderer.invoke('feedback:save', o),
  writeBackup: (json, manual) => ipcRenderer.invoke('backup:write', json, manual),
  listBackups: () => ipcRenderer.invoke('backup:list'),
  readBackup: name => ipcRenderer.invoke('backup:read', name),
  openBackups: () => ipcRenderer.invoke('backup:open'),
  exportSave: (json, name) => ipcRenderer.invoke('save:export', json, name),
  importSave: () => ipcRenderer.invoke('save:import'),
  discordInfo: () => ipcRenderer.invoke('discord:info'),
  discordEnable: on => ipcRenderer.invoke('discord:enable', !!on),
  discordSet: activity => ipcRenderer.invoke('discord:set', activity),
});
