import { ipcRenderer } from 'electron';

import { CheckGameUpdateReturnType, GameChannelConfiguration, GameConfiguration, GameEnvironment, GameRelease, GameUpdateProgress } from '@src/types';

export const checkGameUpdate = (payload: {
  gamePath: GameConfiguration['gamePath'];
  environment: GameEnvironment;
  channel: GameChannelConfiguration;
}): Promise<CheckGameUpdateReturnType> => ipcRenderer.invoke('check-game-update', payload);

export const requestGameUpdate = (payload: {
  gamePath: GameConfiguration['gamePath'];
  environment: GameEnvironment;
  channel: GameChannelConfiguration;
  release: GameRelease;
  protectedPaths: string[];
}) => ipcRenderer.send('request-game-update', payload);
export const onProgress = (callback: (progress: GameUpdateProgress) => void) =>
  ipcRenderer.on('game-update/progress', (_, progress) => callback(progress));
export const onDone = (callback: () => void) => ipcRenderer.once('game-update/done', () => callback());
export const onFailure = (callback: (message: string) => void) =>
  ipcRenderer.once('game-update/failure', (_, message) => callback(message));
export const removeEventListeners = () => {
  ipcRenderer.removeAllListeners('game-update/progress');
  ipcRenderer.removeAllListeners('game-update/done');
  ipcRenderer.removeAllListeners('game-update/failure');
};