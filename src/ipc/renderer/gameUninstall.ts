import { GameConfiguration } from '@src/types';
import { ipcRenderer } from 'electron';

export const gameUninstall = (installPath: GameConfiguration['installPath']) => ipcRenderer.send('game-uninstall', installPath);
export const onGameUninstallDone = (callback: () => void) => ipcRenderer.once('game-uninstall/done', () => callback());
export const onGameUninstallProgress = (callback: (progress: number) => void) =>
  ipcRenderer.on('game-uninstall/progress', (_, progress) => callback(progress));
export const onGameUninstallFailure = (callback: (errorMessage: string) => void) =>
  ipcRenderer.once('game-uninstall/failure', (_, errorMessage) => callback(errorMessage));

export const removeEventListeners = () => {
  ipcRenderer.removeAllListeners('game-uninstall/done');
  ipcRenderer.removeAllListeners('game-uninstall/progress');
  ipcRenderer.removeAllListeners('game-uninstall/failure');
};
