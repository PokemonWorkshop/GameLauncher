import { contextBridge, ipcRenderer } from 'electron';

import * as gameInstall from '@ipcRenderer/gameInstall';
import * as logRenderer from '@ipcRenderer/logRenderer';
import * as requestFile from '@ipcRenderer/requestFile';
import * as startGame from '@ipcRenderer/startGame';
import * as binariesUpdate from '@ipcRenderer/binariesUpdate';
import * as gameUninstall from '@ipcRenderer/gameUninstall';

import { ILauncherAPI } from './types';

const launcherApi: ILauncherAPI = {
  testMessage: (message) => ipcRenderer.send('test-message', message),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  estimateFileSize: (path) => ipcRenderer.invoke('estimate-file-size', path),
  checkFiles: (projectPath, filesToCheck, filesToTest) => ipcRenderer.invoke('check-files', projectPath, filesToCheck, filesToTest),
  externalWindow: (link) => ipcRenderer.send('external-window', link),
  saveFile: (path, data) => ipcRenderer.invoke('save-file', path, data),
  closeLauncher: () => ipcRenderer.send('window-close'),
  minimizeLauncher: () => ipcRenderer.send('window-minimize'),
  platform: () => process.platform,
  readLicence: (currentConfig) => ipcRenderer.invoke('read-licence', currentConfig),
  version: () => ipcRenderer.invoke('version'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  openGameFolder: (gamePath, environment) => ipcRenderer.send('open-game-folder', gamePath, environment),
  createDesktopShortcut: () => ipcRenderer.send('create-desktop-shortcut'),
  checkUpdate: () => ipcRenderer.send('game-launcher-check-update'),
  requestUpdateDownloaded: {
    on: (listener) => ipcRenderer.on('request-update-downloaded', listener),
    removeListener: (listener) => ipcRenderer.removeListener('request-update-downloaded', listener),
  },
  requestFile,
  startGame,
  gameInstall,
  binariesUpdate,
  gameUninstall,
  log: logRenderer,
};

contextBridge.exposeInMainWorld('launcherApi', launcherApi);

declare global {
  interface Window {
    launcherApi: ILauncherAPI;
  }
}

export {};
