import { useEffect, useState } from 'react';

import { GameConfiguration } from '@src/types';

import { voidCleanup } from './voidCleanup';
import { useEnvironment } from '@components/context/EnvironmentContext';

export const useGameConfiguration = (flipFlap?: boolean) => {
  const [configuration, setConfiguration] = useState<GameConfiguration | undefined>(undefined);
  const { environment } = useEnvironment();

  useEffect(() => {
    const promise = () => window.launcherApi.loadConfig(environment).then((result) => setConfiguration(result));

    promise();
    return voidCleanup;
  }, [flipFlap]);

  return {
    isLoading: configuration === undefined,
    configuration,
  };
};
