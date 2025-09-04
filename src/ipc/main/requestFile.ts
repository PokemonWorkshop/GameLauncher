import { IpcMainEvent, net } from 'electron';
import log from 'electron-log';

import { RequestStateReport } from '@src/types';

type RequestState = {
  success: boolean;
  done: boolean;
  progress: number;
  size: number;
  data: Buffer;
  status: {
    code: number;
    message: string;
  };
};

const requestState: RequestState = {
  success: false,
  done: false,
  progress: 0,
  size: 0,
  data: Buffer.alloc(0),
  status: {
    code: 0,
    message: '',
  },
};

const resetRequestState = () => {
  requestState.success = false;
  requestState.done = false;
  requestState.progress = 0;
  requestState.size = 0;
  requestState.data = Buffer.alloc(0);
  requestState.status = {
    code: 0,
    message: '',
  };
};

export const requestFile = (url: URL, event: IpcMainEvent) => {
  resetRequestState();
  requestState.size = 1;

  const request = net.request(url.href);
  // Handle errors
  request.on('error', (error) => {
    log.info(error);
    requestState.done = true;
    requestState.success = false;
    event.sender.send('request-file/done');
  });
  // Handle response
  request.once('response', (response) => {
    requestState.status.code = response.statusCode;
    requestState.status.message = response.statusMessage;
    if (response.statusCode === 200) {
      requestState.success = true;
      requestState.size = Number(response.headers['content-length'] || '1');
      response.on('data', (chunk) => {
        requestState.data = Buffer.concat([requestState.data, chunk]);
        requestState.progress = requestState.data.byteLength / requestState.size;
        event.sender.send('request-file/progress', requestState.progress);
      });
      response.on('end', () => {
        requestState.done = true;
        event.sender.send('request-file/done');
      });
      response.on('aborted', () => {
        requestState.done = true;
        requestState.success = false;
        event.sender.send('request-file/done');
      });
      response.on('error', () => {
        log.error('Response error');
      });
    } else {
      requestState.size = 0;
      requestState.done = true;
      requestState.success = false;
      event.sender.send('request-file/done');
    }
  });
  request.setHeader('User-Agent', 'Ruby');
  request.end();
};

export const getRequestStateReport = (): RequestStateReport => {
  const { success, done, progress, size, status } = requestState;
  return { success, done, progress, size, status };
};

export const getRequestData = (encoding?: BufferEncoding) => requestState.data.toString(encoding || 'binary');
