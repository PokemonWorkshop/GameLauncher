import { ipcRenderer } from 'electron';

import { CheckGameInstallReturnType, GameConfiguration, LauncherError } from '@src/types';

export const checkGameInstall = (installPath: string): Promise<CheckGameInstallReturnType> => ipcRenderer.invoke('check-game-install', installPath);
export const initGameInstall = (installPath: string): Promise<LauncherError> => ipcRenderer.invoke('init-game-install', installPath);
export const cleanGameInstall = (installPath: string, removeGame: boolean): Promise<LauncherError> =>
  ipcRenderer.invoke('clean-game-install', installPath, removeGame);
export const extractGame = (installPath: GameConfiguration['installPath']) => ipcRenderer.send('extract-game', installPath);
export const onExtractDone = (callback: () => void) => ipcRenderer.once('extract-game/done', () => callback());
export const onExtractProgress = (callback: (progress: number) => void) =>
  ipcRenderer.on('extract-game/progress', (_, progress) => callback(progress));
export const onExtractFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('extract-game/failure', (_, errorMessage) => callback(errorMessage));
export const requestGameFile = (payload: {
  installUrl: GameConfiguration['installUrl'];
  metadataUrl: GameConfiguration['metadataUrl'];
  installPath: GameConfiguration['installPath'];
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
