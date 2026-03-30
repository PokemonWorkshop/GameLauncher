import fs from 'fs';
import { GameConfiguration, GameEnvironment } from '@src/types';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';

export const gameUninstall = async (event: IpcMainEvent, payload: { gamePath: GameConfiguration['gamePath']; environment: GameEnvironment }) => {
  log.info('game-uninstall', payload);

  const gamePathFixed = payload.gamePath.replace('<channel>', payload.environment);
  if (!fs.existsSync(gamePathFixed)) {
    log.error('game-uninstall/failure', `${gamePathFixed} not found`);
    event.sender.send('game-uninstall/failure', `An error occurred while uninstalling`);
  }

  try {
    const files = await fs.promises.readdir(gamePathFixed, { recursive: true });
    const totalFiles = files.length;
    let deletedCount = 0;
    log.info('game-uninstall', `${totalFiles} files to delete`);

    // Delete all files
    await files.reduce(async (lastPromise, file) => {
      await lastPromise;

      const filePath = path.join(gamePathFixed, file);
      const isDirectory = (await fs.promises.lstat(filePath)).isDirectory();
      if (!isDirectory) {
        await fs.promises.unlink(filePath);
        const progress = Number(((++deletedCount / totalFiles) * 100).toFixed(1));
        event.sender.send('game-uninstall/progress', progress);
      }
    }, Promise.resolve());

    // Delete all folders
    await fs.promises.rm(gamePathFixed, { recursive: true, force: true });
  } catch (error) {
    log.error('game-uninstall/failure', error);
    event.sender.send('game-uninstall/failure', `${error instanceof Error ? error.message : 'An error occurred while uninstalling'}`);
  }

  return event.sender.send('game-uninstall/done');
};
