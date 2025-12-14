import log from 'electron-log';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

import config from '@src/config.json';
import { GameConfiguration } from '@src/types';

const fixConfigPath = (config: GameConfiguration): GameConfiguration => {
  const gamePath = config.gamePath.replace('%appdata%', process.env.APPDATA || process.env.HOME || '/games').replaceAll('\\', '/');
  const installPath = config.installPath.replace('%appdata%', process.env.APPDATA || process.env.HOME || '/games').replaceAll('\\', '/');
  return {
    ...config,
    gamePath,
    installPath,
  };
};

const getLocalConfig = async (currentConfig: GameConfiguration): Promise<Pick<GameConfiguration, 'gameVersion'>> => {
  const configFilePath = path.join(currentConfig.gamePath, 'config.json');
  const configOldFilePath = path.join(currentConfig.gamePath.split('/').slice(0, -2).join('/'), 'config.json');

  try {
    if (fs.existsSync(configOldFilePath)) {
      const fileData = await fsPromise.readFile(configOldFilePath);
      await fsPromise.copyFile(configOldFilePath, configFilePath);
      fs.unlinkSync(configOldFilePath);
      const config = JSON.parse(fileData.toString());
      return {
        gameVersion: config.game_version || '0.0.0', //currentConfig.gameVersion,
      };
    } else if (fs.existsSync(configFilePath)) {
      const fileData = await fsPromise.readFile(configFilePath);
      const config = JSON.parse(fileData.toString());
      return {
        gameVersion: config.game_version || '0.0.0', //currentConfig.gameVersion,
      };
    }
  } catch (e) {
    log.error(`Failed to load config`, e);
  }

  return { gameVersion: currentConfig.gameVersion };
};

export const loadConfig = async (): Promise<GameConfiguration> => {
  const fixedConfig = fixConfigPath(config);
  const { gameVersion } = await getLocalConfig(fixedConfig);

  return {
    ...fixedConfig,
    gameVersion,
  };
};
