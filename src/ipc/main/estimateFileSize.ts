import fs from 'fs';

export const estimateFileSize = (path: string) => {
  try {
    const stat = fs.statSync(path);
    return stat.size;
  } catch {
    return 1024 * 1024 * 10;
  }
};
