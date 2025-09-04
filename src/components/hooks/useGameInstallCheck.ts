import { useEffect, useState } from 'react';

import { CheckGameInstallReturnType, GameConfiguration, LauncherError } from '@src/types';

import { voidCleanup } from './voidCleanup';

const defaultCheckResult: CheckGameInstallReturnType = {
  result: false,
  error: {
    isError: false,
  },
};

export const useGameInstallCheck = (shouldCheckInstall: boolean, onInstallCheckDone: () => void, configuration?: GameConfiguration) => {
  const [checkResult, setCheckResult] = useState<CheckGameInstallReturnType>(defaultCheckResult);
  const [doneChecking, setDoneChecking] = useState<boolean>(false);
  const [hasGameInstallCheckError, setHasGameInstallCheckError] = useState<LauncherError>({ isError: false });

  useEffect(() => {
    if (!configuration) return voidCleanup;
    if (!shouldCheckInstall) return voidCleanup;

    const promise = () => {
      setDoneChecking(false);
      window.launcherApi.gameInstall.checkGameInstall(configuration['installPath']).then((checkResult) => {
        setCheckResult(checkResult);
        if (checkResult.error) setHasGameInstallCheckError(checkResult.error);
        setDoneChecking(true);
        onInstallCheckDone();
      });
    };

    promise();
    return voidCleanup;
  }, [configuration, shouldCheckInstall]);

  return {
    doneInstallChecking: doneChecking,
    isGameInstalled: checkResult.result,
    hasGameInstallCheckError,
  };
};
