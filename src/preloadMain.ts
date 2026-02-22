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
  ipcMain.on('start-game', (event, gamePath, environment) => startGame(gamePath, environment, event));
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
  ipcMain.handle('check-game-install', async (_, gamePath, environment) => {
    const checkResult = await checkGameInstall(gamePath, environment);
    return checkResult;
  });
  ipcMain.handle('init-game-install', async (_, gamePath, environment) => initGameInstall(gamePath, environment));
  ipcMain.handle('clean-game-install', async (_, gamePath, environment, removeGame) => cleanGameInstall(gamePath, environment, removeGame));
  ipcMain.on('extract-game', (event, gamePath, environment) => extractGame(event, gamePath, environment));
  ipcMain.on('request-game-file', (event, { gamePath, environment, installUrl, metadataUrl }) =>
    requestGameFile(event, { gamePath, environment, installUrl, metadataUrl }),
  );
  ipcMain.handle('check-need-to-update-binaries', async (_, gamePath, environment) => {
    const checkResult = await checkNeedToUpdateBinaries(gamePath, environment);
    return checkResult;
  });
  ipcMain.handle('init-binaries-update', async (_, gamePath, environment) => initBinariesUpdate(gamePath, environment));
  ipcMain.handle('clean-binaries-update', async (_, gamePath, environment, removeBinaries) =>
    cleanBinariesUpdate(gamePath, environment, removeBinaries),
  );
  ipcMain.on('request-binaries-file', (event, { gamePath, binariesUrl, environment }) =>
    requestBinariesFile(event, { gamePath, binariesUrl, environment }),
  );
  ipcMain.on('extract-binaries', (event, { gamePath, environment }) => extractBinaries(event, { gamePath, environment }));
  ipcMain.on('open-game-folder', (_, gamePath, environment) => openGameFolder(gamePath, environment));
  ipcMain.on('create-desktop-shortcut', () => createDesktopShortcut());
  ipcMain.on('game-uninstall', (event, { gamePath, environment }) => gameUninstall(event, { gamePath, environment }));
  ipcMain.once('game-launcher-check-update', () => app.isPackaged && autoUpdater.checkForUpdates());
};
