import { useEffect, useState } from 'react';

import { GameConfiguration, GameInstallProgress, LauncherError } from '@src/types';

type GameInstallStateObject =
  | { state: 'initializing' }
  | { state: 'downloading' }
  | { state: 'extracting' }
  | { state: 'cleaning'; isError: boolean }
  | { state: 'done' };

export const useGameInstall = (shouldInstall: boolean, onGameInstallDone: () => void, configuration?: GameConfiguration) => {
  const [state, setState] = useState<GameInstallStateObject>({ state: 'initializing' });
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });
  const [progress, setProgress] = useState<Omit<GameInstallProgress, 'state'>>({ progress: 0, rate: 0 });
  const gameInstall = window.launcherApi.gameInstall;

  useEffect(() => {
    if (!shouldInstall || !configuration) return;

    switch (state.state) {
      case 'initializing':
        setHasError({ isError: false });
        setProgress({ progress: 0, rate: 0 });
        gameInstall.initGameInstall(configuration.installPath).then((error) => {
          if (error.isError) {
            setHasError(error);
            setState({ state: 'cleaning', isError: true });
          }
          if (!error.isError) setState({ state: 'downloading' });
        });
        break;
      case 'downloading':
        gameInstall.requestGameFile({
          installUrl: configuration.installUrl,
          metadataUrl: configuration.metadataUrl,
          installPath: configuration.installPath,
        });
        gameInstall.onRequestGameFileDone(() => setState({ state: 'extracting' }));
        gameInstall.onRequestGameFileProgress((progress, rate) => setProgress({ progress, rate }));
        gameInstall.onRequestGameFileFailure((errorMessage) => {
          setHasError({ isError: true, message: errorMessage });
          setState({ state: 'cleaning', isError: true });
        });
        break;
      case 'extracting':
        gameInstall.extractGame(configuration.installPath);
        gameInstall.onExtractDone(() => setState({ state: 'cleaning', isError: false }));
        gameInstall.onExtractProgress((progress) => setProgress({ progress, rate: 0 }));
        gameInstall.onExtractFailure((errorMessage) => {
          setHasError({ isError: true, message: errorMessage });
          setState({ state: 'cleaning', isError: true });
        });
        break;
      case 'cleaning':
        gameInstall.cleanGameInstall(configuration.installPath, state.isError).then((error) => {
          if (error.isError) setHasError(error);
          setState({ state: 'done' });
        });
        break;
      case 'done':
        onGameInstallDone();
        setState({ state: 'initializing' });
        return gameInstall.removeEventListeners();
    }
  }, [configuration, shouldInstall, state]);

  return {
    hasGameInstallError: hasError,
    gameInstallProgress: { ...progress, state: state.state },
  };
};
