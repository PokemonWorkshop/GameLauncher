import axios from 'axios';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import extract from 'extract-zip';
import fs from 'fs';
import path from 'path';
import { ZipFile } from 'yauzl';

import {
  CheckGameInstallReturnType,
  GameChannelConfiguration,
  GameConfiguration,
  GameEnvironment,
  LauncherError,
} from '@src/types';

const GAME_PROJECT_PATH = '.temp/game.zip';
const MANIFEST_PATH = '.launcher/installed-files.json';

const getInstalledFiles = (directory: string, relativePath = ''): string[] => {
  const files: string[] = [];
  for (const entry of fs.readdirSync(path.join(directory, relativePath), { withFileTypes: true })) {
    const entryPath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...getInstalledFiles(directory, entryPath));
    else if (entry.isFile()) files.push(entryPath.replaceAll('\\', '/'));
  }
  return files;
};

const writeInstallManifest = async (installPath: string, channel: GameChannelConfiguration) => {
  const files = getInstalledFiles(installPath).filter((file) => !file.startsWith('.temp/') && !file.startsWith('.launcher/'));
  fs.mkdirSync(path.join(installPath, '.launcher'), { recursive: true });
  fs.writeFileSync(path.join(installPath, MANIFEST_PATH), JSON.stringify({ version: channel.installVersion || '', files }, null, 2));
};

export const checkGameInstall = async (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
): Promise<CheckGameInstallReturnType> => {
  log.info('check-game-install', { gamePath, environment });
  const pathInstall = gamePath.replace('<channel>', environment);
  try {
    // if the folder .temp exists, we can suppose that the install have encountered a problem or been interrupted, so the install folder is deleted
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
  log.info('init-game-install', { gamePath, environment });
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
  log.info('clean-game-install', { gamePath, environment, removeGame });
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

export const extractGame = async (
  event: IpcMainEvent,
  payload: { gamePath: GameConfiguration['gamePath']; environment: GameEnvironment; channel: GameChannelConfiguration },
) => {
  log.info('extract-game', { gamePath: payload.gamePath, environment: payload.environment });
  const installPath = payload.gamePath.replace('<channel>', payload.environment);
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
    await writeInstallManifest(installPath, payload.channel);
    return event.sender.send('extract-game/done');
  } catch (error) {
    log.error('extract-game/failure', error);
    event.sender.send('extract-game/failure', `${error instanceof Error ? error.message : 'An error occurred while extracting'}`);
  }
};

export const requestGameFile = (
  event: IpcMainEvent,
  payload: {
    gamePath: GameConfiguration['gamePath'];
    environment: GameEnvironment;
    installUrl: GameChannelConfiguration['installUrl'];
  },
) => {
  log.info('request-game-file');

  axios
    .get(payload.installUrl, {
      responseType: 'stream',
      onDownloadProgress({ rate, loaded, total }) {
        event.sender.send('request-game-file/progress', {
          progress: total ? (loaded / total) * 100 : 0,
          rate: rate || 0,
        });
      },
    })
    .then((response) => {
      const pathInstallResolved = payload.gamePath.replace('<channel>', payload.environment);
      const writer = fs.createWriteStream(path.join(pathInstallResolved, GAME_PROJECT_PATH));

      writer.on('finish', () => {
        event.sender.send('request-game-file/progress', { progress: 100, rate: 0 });
        event.sender.send('request-game-file/done');
      });
      writer.on('error', (error) => {
        log.error('request-game-file/failure', error);
        event.sender.send('request-game-file/failure', error.message);
      });

      response.data.on('error', (error: Error) => {
        log.error('request-game-file/failure', error);
        event.sender.send('request-game-file/failure', error.message);
      });
      response.data.pipe(writer);
    })
    .catch((error: unknown) => {
      log.error('request-game-file/failure', error);
      event.sender.send('request-game-file/failure', `${error instanceof Error ? error.message : 'An error occurred while downloading'}`);
    });
};
