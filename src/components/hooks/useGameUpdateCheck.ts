import { useEffect, useState } from 'react';
import type { GameConfiguration, GameEnvironment, GameRelease, LauncherError } from '@src/types';
import { voidCleanup } from './voidCleanup';
import { useEnvironment } from '@components/context/EnvironmentContext';

export const useGameUpdateCheck = (
  isValidLicence: boolean,
  onDoneChecking: (needToUpdateGame: boolean) => void,
  configuration?: GameConfiguration,
) => {
  const [updateCheckProgress, setUpdateCheckProgress] = useState(0);
  const [release, setRelease] = useState<GameRelease>();
  const [installedVersion, setInstalledVersion] = useState<string>();
  const [doneChecking, setDoneChecking] = useState<boolean>(false);
  const [hasGameUpdateCheckError, setHasGameUpdateCheckError] = useState<LauncherError>({ isError: false });
  const { environment } = useEnvironment();

  const resetState = () => {
    setUpdateCheckProgress(0);
    setRelease(undefined);
    setInstalledVersion(undefined);
    setDoneChecking(false);
    setHasGameUpdateCheckError({ isError: false });
  };

  const markUpdateInstalled = (version: string) => {
    setInstalledVersion(version);
    setRelease(undefined);
  };

  useEffect(() => {
    if (!isValidLicence || !configuration) return voidCleanup;

    const checkUpdate = async () => {
      setUpdateCheckProgress(25);
      const result = await window.launcherApi.gameUpdate.checkGameUpdate({
        gamePath: configuration.gamePath,
        environment: environment as GameEnvironment,
        channel: configuration.channels[environment as GameEnvironment],
      });
      setUpdateCheckProgress(100);
      if (result.error.isError) setHasGameUpdateCheckError(result.error);
      setRelease(result.needsUpdate ? result.release : undefined);
      setInstalledVersion(result.installedVersion);
      onDoneChecking(result.needsUpdate);
      setDoneChecking(true);
    };
    checkUpdate();
  }, [isValidLicence]);

  return {
    updateCheckProgress,
    filesToDownload: release ? ['archive'] : [],
    release,
    installedVersion,
    doneChecking: doneChecking,
    hasGameUpdateCheckError,
    resetGameUpdateCheck: resetState,
    markUpdateInstalled,
  };
};
