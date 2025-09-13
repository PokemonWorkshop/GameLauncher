import { GameConfiguration } from '@src/types';
import { shell } from 'electron';
import log from 'electron-log';
import fs from 'fs';

export const openGameFolder = async (gamePath: GameConfiguration['gamePath']) => {
  const path = gamePath.replaceAll('\\', '/');
  log.info('open-game-folder', path);
  if (!fs.existsSync(path)) {
    log.warn(`Cannot open the game folder: ${path} not found`);
    return;
  }

  await shell.openPath(`"${path}"`).catch((error) => log.error(error));
};
