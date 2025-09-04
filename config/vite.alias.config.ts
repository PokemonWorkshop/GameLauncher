import { resolve } from 'path';

export const alias = {
  '@pages': resolve(__dirname, '../src/pages'),
  '@assets': resolve(__dirname, '../src/assets'),
  '@ipcMain': resolve(__dirname, '../src/ipc/main'),
  '@ipcRenderer': resolve(__dirname, '../src/ipc/renderer'),
  '@components': resolve(__dirname, '../src/components'),
  '@hooks': resolve(__dirname, '../src/components/hooks'),
  '@utils': resolve(__dirname, '../src/utils'),
  '@src': resolve(__dirname, '../src'),
};
