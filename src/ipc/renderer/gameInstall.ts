import { ipcRenderer } from 'electron';

import { CheckGameInstallReturnType, GameChannelConfiguration, GameConfiguration, GameEnvironment, LauncherError } from '@src/types';

export const checkGameInstall = (gamePath: GameConfiguration['gamePath'], env: GameEnvironment): Promise<CheckGameInstallReturnType> =>
  ipcRenderer.invoke('check-game-install', gamePath, env);
export const initGameInstall = (gamePath: GameConfiguration['gamePath'], env: GameEnvironment): Promise<LauncherError> =>
  ipcRenderer.invoke('init-game-install', gamePath, env);
export const cleanGameInstall = (gamePath: GameConfiguration['gamePath'], env: GameEnvironment, removeGame: boolean): Promise<LauncherError> =>
  ipcRenderer.invoke('clean-game-install', gamePath, env, removeGame);
export const extractGame = (gamePath: GameConfiguration['gamePath'], env: GameEnvironment) => ipcRenderer.send('extract-game', gamePath, env);
export const onExtractDone = (callback: () => void) => ipcRenderer.once('extract-game/done', () => callback());
export const onExtractProgress = (callback: (progress: number) => void) =>
  ipcRenderer.on('extract-game/progress', (_, progress) => callback(progress));
export const onExtractFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('extract-game/failure', (_, errorMessage) => callback(errorMessage));
export const requestGameFile = (payload: {
  environment: GameEnvironment;
  installUrl: GameChannelConfiguration['installUrl'];
  metadataUrl: GameChannelConfiguration['metadataUrl'];
  gamePath: GameConfiguration['gamePath'];
}) => ipcRenderer.send('request-game-file', payload);
export const onRequestGameFileDone = (callback: () => void) => ipcRenderer.once('request-game-file/done', () => callback());
export const onRequestGameFileProgress = (callback: (progress: number, rate: number) => void) =>
  ipcRenderer.on('request-game-file/progress', (_, { progress, rate }) => callback(progress, rate));
export const onRequestGameFileFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('request-game-file/failure', (_, errorMessage) => callback(errorMessage));
export const removeEventListeners = () => {
  ipcRenderer.removeAllListeners('extract-game/done');
  ipcRenderer.removeAllListeners('extract-game/progress');
  ipcRenderer.removeAllListeners('extract-game/failure');
  ipcRenderer.removeAllListeners('request-game-file/done');
  ipcRenderer.removeAllListeners('request-game-file/progress');
  ipcRenderer.removeAllListeners('request-game-file/failure');
};
