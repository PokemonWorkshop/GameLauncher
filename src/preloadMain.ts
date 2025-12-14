import { app, BrowserWindow, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { checkFiles } from '@ipcMain/checkFiles';
import { estimateFileSize } from '@ipcMain/estimateFileSize';
import { checkGameInstall, cleanGameInstall, extractGame, initGameInstall, requestGameFile } from '@ipcMain/gameInstall';
import { loadConfig } from '@ipcMain/loadConfig';
import { readLicence } from '@ipcMain/readLicence';
import { requestFile, getRequestStateReport, getRequestData } from '@ipcMain/requestFile';
import { saveFile } from '@ipcMain/saveFile';
import { startGame } from '@ipcMain/startGame';
import { checkNeedToUpdateBinaries, cleanBinariesUpdate, extractBinaries, initBinariesUpdate, requestBinariesFile } from '@ipcMain/binariesUpdate';
import { openGameFolder } from '@ipcMain/openGameFolder';
import { createDesktopShortcut } from '@ipcMain/createDesktopShortcut';
import { gameUninstall } from '@ipcMain/gameUninstall';

export const preloadIpcMain = () => {
  ipcMain.on('test-message', (_, message) => log.info(message));
  ipcMain.handle('load-config', async () => {
    const config = await loadConfig();
    return config;
  });
  ipcMain.on('request-file', (event, url) => requestFile(new URL(url), event));
  ipcMain.handle('request-file/state-report', () => getRequestStateReport());
  ipcMain.handle('request-file/data', (_, encoding) => getRequestData(encoding));
  ipcMain.handle('check-files', (event, projectPath, filesToCheck, filesToTest) => checkFiles(projectPath, filesToCheck, filesToTest, event));
  ipcMain.on('start-game', (event, gamePath) => startGame(gamePath, event));
  ipcMain.on('external-window', (_, arg) => shell.openExternal(arg));
  ipcMain.handle('save-file', (_, path, data) => saveFile(path, data));
  ipcMain.handle('estimate-file-size', (_, path) => estimateFileSize(path));
  ipcMain.on('window-minimize', (event) => BrowserWindow.fromWebContents(event.sender)?.minimize());
  ipcMain.on('window-close', (event) => BrowserWindow.fromWebContents(event.sender)?.close());
  ipcMain.handle('read-licence', async (_, currentConfig) => {
    const licence = await readLicence(currentConfig);
    return licence;
  });
  ipcMain.handle('version', () => app.getVersion());
  ipcMain.handle('quit-and-install', () => autoUpdater.quitAndInstall());
  ipcMain.handle('check-game-install', async (_, installPath) => {
    const checkResult = await checkGameInstall(installPath);
    return checkResult;
  });
  ipcMain.handle('init-game-install', async (_, installPath) => initGameInstall(installPath));
  ipcMain.handle('clean-game-install', async (_, installPath, removeGame) => cleanGameInstall(installPath, removeGame));
  ipcMain.on('extract-game', (event, installPath) => extractGame(event, installPath));
  ipcMain.on('request-game-file', (event, { installPath, channel, installUrl, metadataUrl }) =>
    requestGameFile(event, { installPath, channel, installUrl, metadataUrl }),
  );
  ipcMain.handle('check-need-to-update-binaries', async (_, gamePath) => {
    const checkResult = await checkNeedToUpdateBinaries(gamePath);
    return checkResult;
  });
  ipcMain.handle('init-binaries-update', async (_, installPath, gamePath) => initBinariesUpdate(installPath, gamePath));
  ipcMain.handle('clean-binaries-update', async (_, installPath, gamePath, removeBinaries) =>
    cleanBinariesUpdate(installPath, gamePath, removeBinaries),
  );
  ipcMain.on('request-binaries-file', (event, { binariesUrl, installPath, gamePath }) =>
    requestBinariesFile(event, { binariesUrl, installPath, gamePath }),
  );
  ipcMain.on('extract-binaries', (event, installPath, gamePath) => extractBinaries(event, installPath, gamePath));
  ipcMain.on('open-game-folder', (_, gamePath) => openGameFolder(gamePath));
  ipcMain.on('create-desktop-shortcut', () => createDesktopShortcut());
  ipcMain.on('game-uninstall', (event, installPath) => gameUninstall(event, installPath));
  ipcMain.once('game-launcher-check-update', () => app.isPackaged && autoUpdater.checkForUpdates());
};
