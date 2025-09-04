import log from 'electron-log';
import fsPromise from 'fs/promises';

export const saveFile = async (path: string, data: string) => {
  log.info(`Saving ${path}...`);
  await fsPromise.writeFile(path, data, { encoding: 'binary' });
  log.info('Done!');
  return true;
};
