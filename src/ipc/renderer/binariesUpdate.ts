import { ipcRenderer } from 'electron';

import { CheckNeedToUpdateBinariesReturnType, GameConfiguration, LauncherError } from '@src/types';

export const checkNeedToUpdateBinaries = (gamePath: GameConfiguration['gamePath']): Promise<CheckNeedToUpdateBinariesReturnType> =>
  ipcRenderer.invoke('check-need-to-update-binaries', gamePath);
export const initBinariesUpdate = (installPath: GameConfiguration['installPath'], gamePath: GameConfiguration['gamePath']): Promise<LauncherError> =>
  ipcRenderer.invoke('init-binaries-update', installPath, gamePath);
export const cleanBinariesUpdate = (
  installPath: GameConfiguration['installPath'],
  gamePath: GameConfiguration['gamePath'],
  removeBinaries: boolean,
): Promise<LauncherError> => ipcRenderer.invoke('clean-binaries-update', installPath, gamePath, removeBinaries);
export const requestBinariesFile = (payload: {
  binariesUrl: GameConfiguration['binariesUrl'];
  installPath: GameConfiguration['installPath'];
  gamePath: GameConfiguration['gamePath'];
}) => ipcRenderer.send('request-binaries-file', payload);
export const onRequestBinariesFileDone = (callback: () => void) => ipcRenderer.once('request-binaries-file/done', () => callback());
export const onRequestBinariesFileProgress = (callback: (progress: number, rate: number) => void) =>
  ipcRenderer.on('request-binaries-file/progress', (_, { progress, rate }) => callback(progress, rate));
export const onRequestBinariesFileFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('request-binaries-file/failure', (_, errorMessage) => callback(errorMessage));
export const extractBinaries = (installPath: GameConfiguration['installPath'], gamePath: GameConfiguration['gamePath']) =>
  ipcRenderer.send('extract-binaries', installPath, gamePath);
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
