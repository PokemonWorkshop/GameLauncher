import { ipcRenderer } from 'electron';

import { CheckNeedToUpdateBinariesReturnType, GameChannelConfiguration, GameConfiguration, GameEnvironment, LauncherError } from '@src/types';

export const checkNeedToUpdateBinaries = (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
): Promise<CheckNeedToUpdateBinariesReturnType> => ipcRenderer.invoke('check-need-to-update-binaries', gamePath, environment);
export const initBinariesUpdate = (gamePath: GameConfiguration['gamePath'], environment: GameEnvironment): Promise<LauncherError> =>
  ipcRenderer.invoke('init-binaries-update', gamePath, environment);
export const cleanBinariesUpdate = (
  gamePath: GameConfiguration['gamePath'],
  environment: GameEnvironment,
  removeBinaries: boolean,
): Promise<LauncherError> => ipcRenderer.invoke('clean-binaries-update', gamePath, environment, removeBinaries);
export const requestBinariesFile = (payload: {
  gamePath: GameConfiguration['gamePath'];
  binariesUrl: GameChannelConfiguration['binariesUrl'];
  environment: GameEnvironment;
}) => ipcRenderer.send('request-binaries-file', payload);
export const onRequestBinariesFileDone = (callback: () => void) => ipcRenderer.once('request-binaries-file/done', () => callback());
export const onRequestBinariesFileProgress = (callback: (progress: number, rate: number) => void) =>
  ipcRenderer.on('request-binaries-file/progress', (_, { progress, rate }) => callback(progress, rate));
export const onRequestBinariesFileFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('request-binaries-file/failure', (_, errorMessage) => callback(errorMessage));
export const extractBinaries = (payload: { gamePath: GameConfiguration['gamePath']; environment: GameEnvironment }) =>
  ipcRenderer.send('extract-binaries', payload);
export const onExtractBinariesDone = (callback: () => void) => ipcRenderer.once('extract-binaries/done', () => callback());
export const onExtractBinariesProgress = (callback: (progress: number) => void) =>
  ipcRenderer.on('extract-binaries/progress', (_, progress) => callback(progress));
export const onExtractBinariesFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('extract-binaries/failure', (_, errorMessage) => callback(errorMessage));
export const removeEventListeners = () => {
  ipcRenderer.removeAllListeners('request-binaries-file/done');
  ipcRenderer.removeAllListeners('request-binaries-file/progress');
  ipcRenderer.removeAllListeners('request-binaries-file/failure');
  ipcRenderer.removeAllListeners('extract-binaries/done');
  ipcRenderer.removeAllListeners('extract-binaries/progress');
  ipcRenderer.removeAllListeners('extract-binaries/failure');
};
