import { useEffect, useState } from 'react';

import { GameConfiguration, LauncherError } from '@src/types';

import { voidCleanup } from './voidCleanup';

export const usePlayGame = (isPlaying: boolean, onPlayDone: () => void, configuration?: GameConfiguration) => {
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });

  useEffect(() => {
    if (!isPlaying || !configuration) return voidCleanup;

    try {
      window.launcherApi.startGame.onExit((code) => {
        window.launcherApi.log.info('Exited with code:', code);
        setHasError({ isError: false });
        if (code === 1) {
          setHasError({ isError: true, message: `(Code: ${code})` });
        }
        onPlayDone();
      });
    } catch (e) {
      if (e instanceof Error) {
        window.launcherApi.log.error(e);
        setHasError({ isError: true, message: `(${e.message})` });
      }
      setHasError({ isError: true });
    }
    return window.launcherApi.startGame.removeEventListeners;
  }, [isPlaying]);

  return {
    hasPlayError: hasError,
  };
};
