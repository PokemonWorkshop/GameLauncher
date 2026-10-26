import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export const fetchResponse = async (url: string, options?: RequestInit): Promise<Response> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
  }
  return response;
};

export const downloadFile = async (
  url: string,
  filename: string,
  onProgress: (progress: { progress: number; rate: number }) => void,
): Promise<void> => {
  const response = await fetchResponse(url);
  if (!response.body) throw new Error('The download response has no body');

  // Fetch decompresses bodies, so encoded Content-Length values cannot measure download progress.
  const encoding = response.headers.get('content-encoding');
  const total = !encoding || encoding === 'identity' ? Number(response.headers.get('content-length')) : 0;
  const reader = response.body.getReader();
  const started = performance.now();
  let lastReported = started;
  let loaded = 0;

  await pipeline(async function* () {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.byteLength;
        const now = performance.now();
        if (now - lastReported >= 250) {
          onProgress({
            progress: total > 0 ? Math.min((loaded / total) * 100, 100) : 0,
            rate: loaded / ((now - started) / 1000),
          });
          lastReported = now;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
      reader.releaseLock();
    }
  }, createWriteStream(filename));
  onProgress({ progress: 100, rate: 0 });
};
