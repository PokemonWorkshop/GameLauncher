import log from 'electron-log';
import { app, shell } from 'electron';
import path from 'path';

export const createDesktopShortcut = () => {
  log.info('create-desktop-shortcut');
  if (process.env.NODE_ENV === 'development') {
    log.warn('Cannot create a desktop shortcut in dev mode');
    return;
  }

  if (process.platform !== 'win32') {
    log.warn('This platform is not supported to create a desktop icon');
    return;
  }

  const desktopPath = app.getPath('desktop');
  if (!desktopPath) {
    log.error('Cannot find the desktop path');
    return;
  }

  const exePath = app.getPath('exe');
  const shortcutPath = `${path.join(desktopPath, path.basename(exePath, '.exe'))}.lnk`;
  const success = shell.writeShortcutLink(shortcutPath, 'create', { target: exePath });
  if (!success) log.error('Fail to create the desktop shortcut');
};
