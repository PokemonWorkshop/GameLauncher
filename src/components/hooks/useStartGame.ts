import { useEffect, useState } from 'react';

import { GameConfiguration, LauncherError } from '@src/types';

import { voidCleanup } from './voidCleanup';

export const useStartGame = (shouldStart: boolean, onStartDone: () => void, configuration?: GameConfiguration) => {
  const [startProgress, setStartProgress] = useState(0);
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });
  const [gameIsLoading, setGameIsLoading] = useState(false);

  useEffect(() => {
    if (!shouldStart || !configuration) return voidCleanup;

    try {
      window.launcherApi.startGame.onProgress((progress) => {
        setStartProgress(progress * 100);
        if (progress >= 0.99 && gameIsLoading) {
          onStartDone();
          setStartProgress(0);
          setGameIsLoading(false);
        }
      });
      if (!gameIsLoading) {
        window.launcherApi.startGame.onResult((result) => {
          window.launcherApi.log.info('Call result is:', result);
          setGameIsLoading(result);
          setHasError({ isError: false });
          if (!result) {
            setHasError({ isError: true, message: `(Result: ${result})` });
            onStartDone();
          }
        });
        window.launcherApi.startGame.startGame(configuration.gamePath);
      }
    } catch (e) {
      if (e instanceof Error) {
        window.launcherApi.log.error(e);
        setHasError({ isError: true, message: `(${e.message})` });
      }
      setHasError({ isError: true });
    }
    return window.launcherApi.startGame.removeEventListeners;
  }, [shouldStart, gameIsLoading]);

  return {
    startProgress,
    hasStartError: hasError,
  };
};
