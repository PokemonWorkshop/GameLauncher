import { GameConfiguration, GameUninstallProgress, LauncherError } from '@src/types';
import { useEffect, useState } from 'react';

type GameUninstallStateObject = { state: 'initializing' } | { state: 'uninstalling' } | { state: 'done' };

export const useGameUninstall = (shouldUninstall: boolean, onGameUninstallDone: () => void, configuration?: GameConfiguration) => {
  const [state, setState] = useState<GameUninstallStateObject>({ state: 'initializing' });
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });
  const [progress, setProgress] = useState<Omit<GameUninstallProgress, 'state'>>({ progress: 0 });
  const gameUninstall = window.launcherApi.gameUninstall;

  useEffect(() => {
    if (!shouldUninstall || !configuration) return;

    switch (state.state) {
      case 'initializing':
        setHasError({ isError: false });
        setProgress({ progress: 0 });
        setState({ state: 'uninstalling' });
        break;
      case 'uninstalling':
        gameUninstall.gameUninstall(configuration.installPath);
        gameUninstall.onGameUninstallDone(() => setState({ state: 'done' }));
        gameUninstall.onGameUninstallProgress((progress) => setProgress({ progress }));
        gameUninstall.onGameUninstallFailure((errorMessage) => {
          setHasError({ isError: true, message: errorMessage });
          setState({ state: 'done' });
        });
        break;
      case 'done':
        onGameUninstallDone();
        setState({ state: 'initializing' });
        return gameUninstall.removeEventListeners();
    }
  }, [configuration, shouldUninstall, state]);

  return {
    hasGameUninstallError: hasError,
    gameUninstallProgress: { ...progress, state: state.state },
  };
};
