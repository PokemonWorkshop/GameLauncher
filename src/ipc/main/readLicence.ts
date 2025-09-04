import crypto from 'crypto';
import log from 'electron-log';
import fs from 'fs';
import fsPromise from 'fs/promises';
import os from 'os';
import path from 'path';

import { GameConfiguration, Licence } from '@src/types';

export const readLicence = async (currentConfig: GameConfiguration): Promise<Licence> => {
  const licenceFilePath = path.join(currentConfig.gamePath, 'licence.txt');

  try {
    if (fs.existsSync(licenceFilePath)) {
      const fileData = await fsPromise.readFile(licenceFilePath);
      const user = crypto.createHash('md5').update(os.userInfo().username).digest('hex').toLocaleUpperCase();
      return {
        key: fileData.toString(),
        user,
      };
    }
  } catch (e) {
    log.warn('Failed to load licence file', e);
  }
  return { key: '', user: '' };
};
