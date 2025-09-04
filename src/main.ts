import { app, BrowserWindow, session } from 'electron';
import log, { FileTransport, PathVariables } from 'electron-log';
import electronIsDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';
import path from 'path';

import { preloadIpcMain } from './preloadMain';

// Setup the log renderer
log.initialize({ preload: true });

const resolvePathFn = (vars: PathVariables) => {
  return path.join(vars.libraryDefaultDir, `renderer.log`);
};
const rendererLog = log.create({ logId: 'renderer' });
const fileTransport: FileTransport = <FileTransport>rendererLog.transports.file;
fileTransport.resolvePathFn = resolvePathFn;

const createWindow = (): void => {
  const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../src/assets');
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  // Create static files protocol
  session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
    const fileUrl = request.url.replace('static://', '');
    const filePath = path.join(app.getAppPath(), electronIsDev ? 'src' : '.vite/renderer', fileUrl);
    callback({ path: filePath, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: process.platform === 'win32' ? 746 : 720, // 720 + 26
    width: 1280,
    title: 'Game Launcher',
    autoHideMenuBar: true,
    useContentSize: true,
    maximizable: false,
    resizable: false,
    fullscreenable: false,
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
    icon: getAssetPath('images/icon.png'),
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__dirname, 'preloadRenderer.js'),
    },
  });

  if (!app.isPackaged) mainWindow.webContents.openDevTools();

  // Updater
  if (app.isPackaged) {
    autoUpdater.logger = log;
    autoUpdater.on('update-downloaded', () => {
      mainWindow?.webContents.send('request-update-downloaded');
    });
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
preloadIpcMain();
