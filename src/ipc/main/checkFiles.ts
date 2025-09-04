import crypto from 'crypto';
import { IpcMainInvokeEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

import { FileHashes } from '@src/types';

const checkFile = async (filename: string, hash: string, event: IpcMainInvokeEvent) => {
  try {
    if (!fs.existsSync(filename)) {
      return false;
    }
    const data = await fsPromise.readFile(filename);
    const hashSum = crypto.createHash('sha1');
    hashSum.update(data);

    return hash === hashSum.digest('hex');
  } catch (error) {
    log.error(error);
    return false;
  } finally {
    event.sender.send('check-files/ping');
  }
};

// Returns list of file to download because hash did not match
export const checkFiles = async (projectPath: string, filesToCheck: FileHashes, filesToTest: string[], event: IpcMainInvokeEvent) => {
  const entries = Object.entries(filesToCheck);
  const results = await Promise.all(entries.map(([filename, hash]) => checkFile(path.join(projectPath, filename), hash, event)));
  const filesThatDoesNotExist = filesToTest.filter((filename) => !fs.existsSync(path.join(projectPath, filename)));

  return entries
    .map(([filename]) => filename)
    .filter((_, index) => !results[index])
    .concat(filesThatDoesNotExist);
};
