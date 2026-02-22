import log from 'electron-log';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

import config from '@src/config.json';
import { GameChannelConfiguration, GameConfiguration, GameEnvironment } from '@src/types';

const fixConfigPath = (config: GameConfiguration): GameConfiguration => {
  const gamePath = config.gamePath.replace('%appdata%', process.env.APPDATA || process.env.HOME || '/games').replaceAll('\\', '/');
  return {
    ...config,
    gamePath,
  };
};

const getLocalConfig = async (
  currentConfig: GameConfiguration,
  environment: GameEnvironment,
): Promise<Pick<GameChannelConfiguration, 'gameVersion'>> => {
  const gamePathFixed = currentConfig.gamePath.replace('<channel>', environment);
  const configFilePath = path.join(gamePathFixed, 'config.json');
  const configOldFilePath = path.join(gamePathFixed.split('/').slice(0, -2).join('/'), 'config.json');

  try {
    if (fs.existsSync(configOldFilePath)) {
      const fileData = await fsPromise.readFile(configOldFilePath);
      await fsPromise.copyFile(configOldFilePath, configFilePath);
      fs.unlinkSync(configOldFilePath);
      const config = JSON.parse(fileData.toString());
      return {
        gameVersion: config.game_version || currentConfig.channels[environment].gameVersion,
      };
    } else if (fs.existsSync(configFilePath)) {
      const fileData = await fsPromise.readFile(configFilePath);
      const config = JSON.parse(fileData.toString());
      return {
        gameVersion: config.game_version || currentConfig.channels[environment].gameVersion,
      };
    }
  } catch (e) {
    log.error(`Failed to load config`, e);
  }

  return { gameVersion: currentConfig.channels[environment].gameVersion };
};

export const loadConfig = async (environment: GameEnvironment): Promise<GameConfiguration> => {
  const fixedConfig = fixConfigPath(config);
  const { gameVersion } = await getLocalConfig(fixedConfig, environment);

  fixedConfig.channels[environment] = {
    ...fixedConfig.channels[environment],
    gameVersion,
  };

  return {
    ...fixedConfig,
  };
};
