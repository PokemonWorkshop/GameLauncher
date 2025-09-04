import { useEffect, useState } from 'react';

import { GameConfiguration } from '@src/types';

import { voidCleanup } from './voidCleanup';

export const useGameConfiguration = (flipFlap?: boolean) => {
  const [configuration, setConfiguration] = useState<GameConfiguration | undefined>(undefined);

  useEffect(() => {
    const promise = () => window.launcherApi.loadConfig().then((result) => setConfiguration(result));

    promise();
    return voidCleanup;
  }, [flipFlap]);

  return {
    isLoading: configuration === undefined,
    configuration,
  };
};
