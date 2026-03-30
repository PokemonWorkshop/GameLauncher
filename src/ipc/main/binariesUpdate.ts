import {
  GameConfiguration,
  BinariesVersion,
  LauncherError,
  CheckNeedToUpdateBinariesReturnType,
  GameEnvironment,
  GameChannelConfiguration,
} from '@src/types';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import sevenBin from '7zip-bin';
import { extractFull } from 'node-7z';
import axios from 'axios';
import crypto from 'crypto';

const BINARIES_TEMP_PATH = '.temp_binaries/binaries.7z';
export const BINARIES_PATH = 'binaries';

/** Clean useless old binaries because the new binaries is in the gamePath **/
// TODO: Maybe is not working...
const cleanOldBinaries = async (gamePath: GameConfiguration['gamePath']) => {
  const oldBinariesPath = path.join(gamePath.replace('<channel>', ''), 'launcher_release');
  if (!fs.existsSync(oldBinariesPath)) return;

  await ['msvcrt-ruby300.dll', 'ruby.exe', 'rubyw.exe'].reduce(async (lastPromise, filename) => {
    await lastPromise;
    const filePath = path.join(oldBinariesPath, filename);
    if (fs.existsSync(filePath)) {
      await fsPromise.unlink(filePath);
    }
  }, Promise.resolve());

  await ['lib', 'ruby_builtin_dlls'].reduce(async (lastPromise, dirname) => {
    await lastPromise;
    const dirPath = path.join(oldBinariesPath, dirname);
    if (fs.existsSync(dirPath)) {
      await fsPromise.rm(dirPath, { recursive: true });
    }
  }, Promise.resolve());
};

const compareBinariesVersion = (gameLatestBinaries: BinariesVersion, binariesVersion: BinariesVersion) => {
  if (gameLatestBinaries.version !== binariesVersion.version) return false;

  if (process.platform === 'win32') {
    return gameLatestBinaries.windows.toLocaleLowerCase() === binariesVersion.windows.toLocaleLowerCase();
  } else if (process.platform === 'linux') {
    return gameLatestBinaries.linux.toLocaleLowerCase() === binariesVersion.linux.toLocaleLowerCase();
  } else {
    return gameLatestBinaries.macos.toLocaleLowerCase() === binariesVersion.macos.toLocaleLowerCase();
  }
};

const getBinariesFilename = () => {
  if (process.platform === 'win32') return 'Windows.7z';
  else if (process.platform === 'linux') return 'Linux.7z';
  else return 'macos.7z';
};

const getBinariesHash = (binariesVersion: BinariesVersion) => {
  if (process.platform === 'win32') return binariesVersion.windows;
  else if (process.platform === 'linux') return binariesVersion.linux;
  else return binariesVersion.macos;
};

const getPath7za = () => {
  // Optimisation: 7z binary files are not copied in development. The binaries are read directly from the dependencies.
  if (process.env.NODE_ENV === 'development') {
    const path7za = path.normalize(sevenBin.path7za).split(path.sep);
    const index = path7za.indexOf('build');
    return path.join('node_modules/7zip-bin', path7za.slice(index + 1).join(path.sep));
  }
  return sevenBin.path7za;
};

const checkBinariesFile = async (gamePath: GameConfiguration['gamePath'], hash: string) => {
  const filename = path.join(gamePath, BINARIES_TEMP_PATH);
  if (!fs.existsSync(filename)) return false;

  const data = await fsPromise.readFile(filename);
  const hashSum = crypto.createHash('sha1');
  hashSum.update(data);
  return hash.toUpperCase() === hashSum.digest('hex').toUpperCase();
};

export const checkNeedToUpdateBinaries = async (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
): Promise<CheckNeedToUpdateBinariesReturnType> => {
  log.info('check-need-to-update-binaries', { gamePath, environment });
  try {
    const gamePathFixed = gamePath.replace('<channel>', environment);
    const gameBinariesPath = path.join(gamePathFixed, 'binaries_version.json');
    const noError = {
      isError: false,
    };
    if (!fs.existsSync(gameBinariesPath)) {
      return {
        error: noError,
        needToUpdate: false,
      };
    }

    const binariesVersionPath = path.join(gamePathFixed, BINARIES_PATH, 'version.json');
    if (!fs.existsSync(binariesVersionPath)) {
      return {
        error: noError,
        needToUpdate: true,
      };
    }

    const gameBinariesData = (await fsPromise.readFile(gameBinariesPath)).toString('utf-8');
    const binariesVersionData = (await fsPromise.readFile(binariesVersionPath)).toString('utf-8');
    const gameBinaries = JSON.parse(gameBinariesData) as BinariesVersion;
    const binariesVersion = JSON.parse(binariesVersionData) as BinariesVersion;
    return {
      error: noError,
      needToUpdate: !compareBinariesVersion(gameBinaries, binariesVersion),
    };
  } catch (e) {
    log.error('Failed to check that new binaries are available', e);
    return {
      needToUpdate: false,
      error: {
        isError: true,
        message: e instanceof Error ? e.message : 'Failed to check that new binaries are available',
      },
    };
  }
};

export const initBinariesUpdate = async (gamePath: GameConfiguration['gamePath'], environment: GameEnvironment): Promise<LauncherError> => {
  log.info('init-binaries-update', { gamePath, environment });
  try {
    cleanOldBinaries(gamePath);
    const gamePathFixed = gamePath.replace('<channel>', environment);
    await fsPromise.mkdir(path.join(gamePathFixed, '.temp_binaries'), { recursive: true });
    const binariesPath = path.join(gamePathFixed, BINARIES_PATH);
    if (fs.existsSync(binariesPath)) {
      await fsPromise.rm(binariesPath, { recursive: true });
    }
    return {
      isError: false,
    };
  } catch (e) {
    log.error('Failed to initialize the binaries update', e);
    return {
      isError: true,
      message: e instanceof Error ? e.message : 'Failed to initialize the binaries update',
    };
  }
};

export const requestBinariesFile = (
  event: IpcMainEvent,
  payload: {
    gamePath: GameConfiguration['gamePath'];
    binariesUrl: GameChannelConfiguration['binariesUrl'];
    environment: GameEnvironment;
  },
) => {
  log.info('request-binaries-file', payload);
  try {
    const gamePathFixed = payload.gamePath.replace('<channel>', payload.environment);
    const gameBinariesData = fs.readFileSync(path.join(gamePathFixed, 'binaries_version.json')).toString('utf-8');
    const gameBinaries = JSON.parse(gameBinariesData) as BinariesVersion;

    axios
      .get<BinariesVersion>(`${payload.binariesUrl}${gameBinaries.version}/version.json`)
      .then((response) => {
        const latest = response.data;
        if (!compareBinariesVersion(gameBinaries, latest)) throw Error('The binaries found are not the expected binaries');

        axios
          .get(`${payload.binariesUrl}${gameBinaries.version}/${getBinariesFilename()}`, {
            responseType: 'stream',
            onDownloadProgress({ rate, progress }) {
              event.sender.send('request-binaries-file/progress', { progress: (progress ?? 0) * 100, rate: rate || 0 });
            },
          })
          .then((response) => {
            const writer = fs.createWriteStream(path.join(gamePathFixed, BINARIES_TEMP_PATH));
            writer.on('finish', async () => {
              event.sender.send('request-binaries-file/progress', { progress: 100, rate: 0 });
              const result = await checkBinariesFile(gamePathFixed, getBinariesHash(latest));
              if (result) event.sender.send('request-binaries-file/done');
              else event.sender.send('request-binaries-file/failure', 'Bad signature');
            });
            response.data.pipe(writer);
          })
          .catch((error) => {
            log.error('request-binaries-file/failure', error);
            event.sender.send('request-binaries-file/failure', `${error instanceof Error ? error.message : 'An error occurred while downloading'}`);
          });
      })
      .catch((error) => {
        log.error('request-binaries-file/failure', error);
        event.sender.send('request-binaries-file/failure', `${error instanceof Error ? error.message : 'An error occurred while downloading'}`);
      });
  } catch (error) {
    log.error('request-binaries-file/failure', error);
    event.sender.send('request-binaries-file/failure', `${error instanceof Error ? error.message : 'An error occurred while downloading'}`);
  }
};

export const extractBinaries = (event: IpcMainEvent, payload: { gamePath: GameConfiguration['gamePath']; environment: GameEnvironment }) => {
  log.info('extract-binaries', payload);
  try {
    const gamePathFixed = payload.gamePath.replace('<channel>', payload.environment);
    const zipStream = extractFull(path.join(gamePathFixed, BINARIES_TEMP_PATH), path.join(gamePathFixed, BINARIES_PATH), {
      $progress: true,
      $bin: getPath7za(),
    });
    zipStream.on('progress', (progress) => event.sender.send('extract-binaries/progress', progress.percent));
    zipStream.on('end', () => {
      log.info('extract-binaries/done');
      event.sender.send('extract-binaries/done');
    });
    zipStream.on('error', (error) => {
      log.error('extract-binaries/failure', error);
      event.sender.send('extract-binaries/failure', `${error instanceof Error ? error.message : 'An error occurred while extracting'}`);
    });
  } catch (error) {
    log.error('extract-binaries/failure', error);
    event.sender.send('extract-binaries/failure', `${error instanceof Error ? error.message : 'An error occurred while extracting'}`);
  }
};

export const cleanBinariesUpdate = async (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
  removeBinaries: boolean,
): Promise<LauncherError> => {
  log.info('clean-binaries-update', { gamePath, environment, removeBinaries });
  try {
    const gamePathFixed = gamePath.replace('<channel>', environment);
    const tempPath = path.join(gamePathFixed, '.temp_binaries');
    const binariesPath = path.join(gamePathFixed, BINARIES_PATH);
    if (fs.existsSync(tempPath)) await fsPromise.rm(tempPath, { recursive: true });
    if (fs.existsSync(binariesPath) && removeBinaries) await fsPromise.rm(binariesPath, { recursive: true });
    if (!removeBinaries) await fsPromise.copyFile(path.join(gamePathFixed, 'binaries_version.json'), path.join(binariesPath, 'version.json'));
    // remove site_ruby folder from binaries because the game doesn't start if it exists
    const siteRubyPath = path.join(binariesPath, 'lib/ruby/site_ruby');
    if (fs.existsSync(siteRubyPath)) await fsPromise.rm(siteRubyPath, { recursive: true });
    return {
      isError: false,
    };
  } catch (e) {
    log.error('Failed to clean the binaries update', e);
    return {
      isError: true,
      message: e instanceof Error ? e.message : 'Failed to clean the binaries update',
    };
  }
};
