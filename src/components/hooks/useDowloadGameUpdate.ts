import { useEffect, useState } from 'react';

import { GameConfiguration, LauncherError } from '@src/types';

import { voidCleanup } from './voidCleanup';

export const useDownloadGameUpdate = (
  shouldDownload: boolean,
  filesToDownload: string[],
  onDownloadDone: () => void,
  configuration?: GameConfiguration,
) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });
  const requestFile = window.launcherApi.requestFile;

  const resetState = () => {
    setDownloadProgress(0);
    setOverallProgress(0);
    setHasError({ isError: false });
  };

  useEffect(() => {
    if (!shouldDownload || !configuration) return voidCleanup;
    if (overallProgress === filesToDownload.length) return voidCleanup;

    const fileToDownload = filesToDownload[overallProgress];

    const asyncHandler = async () => {
      const realFilename = `${configuration.gamePath}${fileToDownload.startsWith('/') ? fileToDownload : `/${fileToDownload}`}`;
      const estimatedFileSize = await window.launcherApi.estimateFileSize(realFilename);
      window.launcherApi.log.info(realFilename, estimatedFileSize);

      requestFile.onRequestDone(async () => {
        const state = await requestFile.getRequestStateReport();
        if (state.success) {
          const data = await requestFile.getRequestData('binary');
          try {
            await window.launcherApi.saveFile(realFilename, data);

            setOverallProgress(overallProgress + 1);
            setDownloadProgress(0);

            if (overallProgress === filesToDownload.length - 1) onDownloadDone();
          } catch (e) {
            if (e instanceof Error) {
              window.launcherApi.log.error(e);
              setHasError({ isError: true, message: `(${e.message})` });
            }
            setHasError({ isError: true });
          }
        } else {
          const message = state.status.message ? `(Code: ${state.status.code}: ${state.status.message})` : `(Code: ${state.status.code})`;
          setHasError({ isError: true, message });
        }
      });

      requestFile.onRequestProgress((progress) => {
        if (progress > 1) {
          const progressWithEstimatedFileSize = (progress / estimatedFileSize) * 100;
          setDownloadProgress(progressWithEstimatedFileSize > 100 ? 100 : progressWithEstimatedFileSize);
        } else {
          setDownloadProgress(progress * 100);
        }
      });

      requestFile.requestFile(new URL(`game/${fileToDownload}?v=${configuration.gameVersion}`, configuration.gameUrl).href);
    };

    asyncHandler();

    return requestFile.removeEventListeners;
  }, [shouldDownload, filesToDownload, overallProgress]);

  return {
    downloadDone: overallProgress === filesToDownload.length || hasError.isError,
    overallProgress: overallProgress + 1,
    downloadProgress,
    hasError,
    resetDownloadGameUpdate: resetState,
  };
};
