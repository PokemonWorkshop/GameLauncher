import { ipcRenderer } from 'electron';

import { GameConfiguration, GameEnvironment } from '@src/types';

export const startGame = (gamePath: GameConfiguration['gamePath'], environment: GameEnvironment) =>
  ipcRenderer.send('start-game', gamePath, environment);
export const onResult = (callback: (result: boolean) => void) => ipcRenderer.once('start-game/result', (_, result) => callback(result));
export const onProgress = (callback: (progress: number) => void) => ipcRenderer.on('start-game/progress', (_, progress) => callback(progress));
export const onExit = (callback: (exitCode: number) => void) => ipcRenderer.once('start-game/exitCode', (_, exitCode) => callback(exitCode));
export const removeEventListeners = () => {
  ipcRenderer.removeAllListeners('start-game/result');
  ipcRenderer.removeAllListeners('start-game/progress');
  ipcRenderer.removeAllListeners('start-game/exitCode');
};
