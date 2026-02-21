import axios from 'axios';
import crypto from 'crypto';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import extract from 'extract-zip';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import { ZipFile } from 'yauzl';

import {
  CheckGameInstallReturnType,
  GameChannelConfiguration,
  GameConfiguration,
  GameEnvironment,
  GameInstallMetadata,
  LauncherError,
} from '@src/types';

const GAME_PROJECT_PATH = '.temp/game.zip';

export const checkGameInstall = async (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
): Promise<CheckGameInstallReturnType> => {
  log.info('check-game-install');
  const pathInstall = gamePath.replace('<channel>', environment);
  try {
    // if the folder .temp exists, we can supposed that the install have been a problem or interrupted, so the install folder is deleted
    const result = fs.existsSync(pathInstall) && !fs.existsSync(path.join(pathInstall, '.temp'));
    if (!result && fs.existsSync(path.join(pathInstall, '.temp'))) fs.rmSync(pathInstall, { recursive: true });
    return {
      result,
      error: {
        isError: false,
      },
    };
  } catch (e) {
    log.error('Failed to check the game install folder', e);
    return {
      result: false,
      error: {
        isError: true,
        message: e instanceof Error ? e.message : 'Failed to check the game install folder',
      },
    };
  }
};

export const initGameInstall = async (gamePath: GameConfiguration['gamePath'], environment: GameEnvironment): Promise<LauncherError> => {
  log.info('init-game-install');
  const pathInstall = gamePath.replace('<channel>', environment);
  try {
    fs.mkdirSync(path.join(pathInstall, '.temp'), { recursive: true });
    return {
      isError: false,
    };
  } catch (e) {
    log.error('Failed to initialize the game install', e);
    return {
      isError: true,
      message: e instanceof Error ? e.message : 'Failed to initialize the game install',
    };
  }
};

export const cleanGameInstall = async (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
  removeGame: boolean,
): Promise<LauncherError> => {
  log.info('clean-game-install');
  const pathInstall = gamePath.replace('<channel>', environment);
  try {
    const tempPath = path.join(pathInstall, '.temp');
    if (fs.existsSync(tempPath) && !removeGame) fs.rmSync(tempPath, { recursive: true });
    if (fs.existsSync(pathInstall) && removeGame) fs.rmSync(pathInstall, { recursive: true });
    return {
      isError: false,
    };
  } catch (e) {
    log.error('Failed to clean the game install', e);
    return {
      isError: true,
      message: e instanceof Error ? e.message : 'Failed to clean the game install',
    };
  }
};

export const extractGame = async (event: IpcMainEvent, gamePath: GameConfiguration['gamePath'], environment: GameEnvironment) => {
  log.info('extract-game');
  const installPath = gamePath.replace('<channel>', environment);
  const countEntry = { value: 1 };

  try {
    await extract(path.join(installPath, GAME_PROJECT_PATH), {
      dir: installPath,
      onEntry: (_, zipFile: ZipFile) => {
        const progress = Number(((countEntry.value / zipFile.entryCount) * 100).toFixed(1));
        event.sender.send('extract-game/progress', progress);
        countEntry.value++;
      },
    });
    return event.sender.send('extract-game/done');
  } catch (error) {
    log.error('extract-game/failure', error);
    event.sender.send('extract-game/failure', `${error instanceof Error ? error.message : 'An error occurred while extracting'}`);
  }
};

const checkGameFile = async (installPath: GameConfiguration['gamePath'], environment: GameEnvironment, hash: string) => {
  const pathInstall = installPath.replace('<channel>', environment);
  const filename = path.join(pathInstall, '.temp/game.zip');
  if (!fs.existsSync(filename)) return false;

  const data = await fsPromise.readFile(filename);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);

  return hash.toUpperCase() === hashSum.digest('hex').toUpperCase();
};

export const requestGameFile = (
  event: IpcMainEvent,
  payload: {
    gamePath: GameConfiguration['gamePath'];
    environment: GameEnvironment;
    installUrl: GameChannelConfiguration['installUrl'];
    metadataUrl: GameChannelConfiguration['metadataUrl'];
  },
) => {
  log.info('request-game-file');

  try {
    // Récupère les métadonnées depuis l'URL fournie
    axios.get(payload.metadataUrl).then((response) => {
      const metadata: GameInstallMetadata = response.data;

      // Télécharge le fichier en stream
      axios
        .get(payload.installUrl, {
          responseType: 'stream',
          onDownloadProgress({ rate, loaded }) {
            const progress = loaded / metadata.length;
            event.sender.send('request-game-file/progress', {
              progress: progress * 100,
              rate: rate || 0,
            });
          },
        })
        .then((response) => {
          const pathInstallResolved = payload.gamePath.replace('<channel>', payload.environment);
          const writer = fs.createWriteStream(path.join(pathInstallResolved, GAME_PROJECT_PATH));

          writer.on('finish', async () => {
            event.sender.send('request-game-file/progress', { progress: 100, rate: 0 });
            const result = await checkGameFile(pathInstallResolved, payload.environment, metadata.hash);
            if (result) event.sender.send('request-game-file/done');
            else event.sender.send('request-game-file/failure', 'Bad signature');
          });

          response.data.pipe(writer);
        });
    });
  } catch (error) {
    log.error('request-game-file/failure', error);
    event.sender.send('request-game-file/failure', `${error instanceof Error ? error.message : 'An error occurred while downloading'}`);
  }
};
