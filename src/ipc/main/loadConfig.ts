import config from '@src/config.json';
import { GameConfiguration, GameEnvironment } from '@src/types';

const fixConfigPath = (config: GameConfiguration): GameConfiguration => {
  const gamePath = config.gamePath.replace('%appdata%', process.env.APPDATA || process.env.HOME || '/games').replaceAll('\\', '/');
  return {
    ...config,
    gamePath,
  };
};

export const loadConfig = async (environment: GameEnvironment): Promise<GameConfiguration> => {
  environment;
  return fixConfigPath(config as GameConfiguration);
};
