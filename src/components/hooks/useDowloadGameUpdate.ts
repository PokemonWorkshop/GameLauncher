import { useEffect, useState } from 'react';

import { GameConfiguration, GameRelease, GameUpdateProgress, LauncherError } from '@src/types';

import { voidCleanup } from './voidCleanup';
import { useEnvironment } from '@components/context/EnvironmentContext';

export const useDownloadGameUpdate = (
  shouldDownload: boolean,
  filesToDownload: string[],
  onDownloadDone: (success: boolean) => void,
  configuration?: GameConfiguration,
  release?: GameRelease,
) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });
  const { environment } = useEnvironment();

  const resetState = () => {
    setDownloadProgress(0);
    setOverallProgress(0);
    setHasError({ isError: false });
  };

  useEffect(() => {
    if (!shouldDownload || !configuration || !release) return voidCleanup;
    const gameUpdate = window.launcherApi.gameUpdate;
    gameUpdate.onProgress((progress: GameUpdateProgress) => {
      setDownloadProgress(progress.progress);
      if (progress.state === 'done') setOverallProgress(1);
    });
    gameUpdate.onDone(() => onDownloadDone(true));
    gameUpdate.onFailure((message) => {
      setHasError({ isError: true, message: `(${message})` });
      onDownloadDone(false);
    });
    gameUpdate.requestGameUpdate({
      gamePath: configuration.gamePath,
      environment,
      channel: configuration.channels[environment],
      release,
      protectedPaths: configuration.protectedPaths,
    });
    return gameUpdate.removeEventListeners;
  }, [shouldDownload, configuration, release]);

  return {
    downloadDone: overallProgress === filesToDownload.length || hasError.isError,
    overallProgress: overallProgress + 1,
    downloadProgress,
    hasError,
    resetDownloadGameUpdate: resetState,
  };
};
