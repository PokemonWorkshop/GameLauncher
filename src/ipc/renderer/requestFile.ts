import { ipcRenderer } from 'electron';

import { RequestStateReport } from '@src/types';

export const getRequestStateReport = (): Promise<RequestStateReport> => ipcRenderer.invoke('request-file/state-report');
export const getRequestData = (encoding?: BufferEncoding): Promise<string> => ipcRenderer.invoke('request-file/data', encoding);
export const requestFile = async (url: string): Promise<boolean> => {
  const report = await getRequestStateReport();
  if (report.done || report.size === 0) {
    ipcRenderer.send('request-file', url);
    return true;
  }

  return false;
};
export const onRequestProgress = (callback: (progress: number) => void) =>
  ipcRenderer.on('request-file/progress', (_, progress) => callback(Number(progress)));
export const onRequestDone = (callback: () => void) => ipcRenderer.once('request-file/done', callback);
export const removeEventListeners = () => {
  ipcRenderer.removeAllListeners('request-file/progress');
  ipcRenderer.removeAllListeners('request-file/done');
};
