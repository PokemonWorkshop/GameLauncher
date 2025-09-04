import fs from 'fs';
import { GameConfiguration } from '@src/types';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';

export const gameUninstall = async (event: IpcMainEvent, installPath: GameConfiguration['installPath']) => {
  log.info('game-uninstall', { installPath });

  if (!fs.existsSync(installPath)) {
    log.error('game-uninstall/failure', `${installPath} not found`);
    event.sender.send('game-uninstall/failure', `An error occurred while uninstalling`);
  }

  try {
    const files = await fs.promises.readdir(installPath, { recursive: true });
    const totalFiles = files.length;
    let deletedCount = 0;
    log.info('game-uninstall', `${totalFiles} files to delete`);

    // Delete all files
    await files.reduce(async (lastPromise, file) => {
      await lastPromise;

      const filePath = path.join(installPath, file);
      const isDirectory = (await fs.promises.lstat(filePath)).isDirectory();
      if (!isDirectory) {
        await fs.promises.unlink(filePath);
        const progress = Number(((++deletedCount / totalFiles) * 100).toFixed(1));
        event.sender.send('game-uninstall/progress', progress);
      }
    }, Promise.resolve());

    // Delete all folders
    await fs.promises.rm(installPath, { recursive: true, force: true });
  } catch (error) {
    log.error('game-uninstall/failure', error);
    event.sender.send('game-uninstall/failure', `${error instanceof Error ? error.message : 'An error occurred while uninstalling'}`);
  }

  return event.sender.send('game-uninstall/done');
};
