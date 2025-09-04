import { GameConfiguration } from '@src/types';
import { shell } from 'electron';
import log from 'electron-log';
import fs from 'fs';

export const openLogsFolder = (gamePath: GameConfiguration['gamePath']) => {
  const path = gamePath.replaceAll('\\', '/');
  log.info('open-logs-folder', path);
  if (!fs.existsSync(path)) {
    log.warn(`Cannot open the game logs folder: ${path} not found`);
    return;
  }

  shell.openPath(`"${path}"`).catch((error) => log.error(error));
};
