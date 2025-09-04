import { useEffect, useState } from 'react';

import { GameConfiguration, BinariesUpdateProgress, LauncherError } from '@src/types';

type BinariesUpdateStateObject =
  | { state: 'checking' }
  | { state: 'initializing' }
  | { state: 'downloading' }
  | { state: 'extracting' }
  | { state: 'cleaning'; isError: boolean }
  | { state: 'done' };

export const useBinariesUpdate = (shouldUpdateBinaries: boolean, onBinariesUpdateDone: () => void, configuration?: GameConfiguration) => {
  const [state, setState] = useState<BinariesUpdateStateObject>({ state: 'checking' });
  const [hasError, setHasError] = useState<LauncherError>({ isError: false });
  const [progress, setProgress] = useState<Omit<BinariesUpdateProgress, 'state'>>({ progress: 0, rate: 0 });
  const binariesUpdate = window.launcherApi.binariesUpdate;

  useEffect(() => {
    if (!shouldUpdateBinaries || !configuration) return;

    switch (state.state) {
      case 'checking':
        setHasError({ isError: false });
        // fake progress
        setProgress({ progress: 10 + Math.floor(Math.random() * 15), rate: 0 });
        binariesUpdate.checkNeedToUpdateBinaries(configuration.gamePath).then((checkResult) => {
          if (checkResult.error.isError) {
            setHasError(checkResult.error);
            setState({ state: 'cleaning', isError: true });
            return;
          }
          if (!checkResult.needToUpdate) return setState({ state: 'done' });

          setState({ state: 'initializing' });
        });
        break;
      case 'initializing':
        setProgress({ progress: 0, rate: 0 });
        binariesUpdate.initBinariesUpdate(configuration.installPath, configuration.gamePath).then((error) => {
          if (error.isError) {
            setHasError(error);
            setState({ state: 'cleaning', isError: true });
            return;
          }
          setState({ state: 'downloading' });
        });
        break;
      case 'downloading':
        binariesUpdate.requestBinariesFile({
          binariesUrl: configuration.binariesUrl,
          installPath: configuration.installPath,
          gamePath: configuration.gamePath,
        });
        binariesUpdate.onRequestBinariesFileDone(() => setState({ state: 'extracting' }));
        binariesUpdate.onRequestBinariesFileProgress((progress, rate) => setProgress({ progress, rate }));
        binariesUpdate.onRequestBinariesFileFailure((errorMessage) => {
          setHasError({ isError: true, message: errorMessage });
          setState({ state: 'cleaning', isError: true });
        });
        break;
      case 'extracting':
        binariesUpdate.extractBinaries(configuration.installPath, configuration.gamePath);
        binariesUpdate.onExtractBinariesDone(() => setState({ state: 'cleaning', isError: false }));
        binariesUpdate.onExtractBinariesProgress((progress) => setProgress({ progress, rate: 0 }));
        binariesUpdate.onExtractBinariesFailure((errorMessage) => {
          setHasError({ isError: true, message: errorMessage });
          setState({ state: 'cleaning', isError: true });
        });
        break;
      case 'cleaning':
        binariesUpdate.cleanBinariesUpdate(configuration.installPath, configuration.gamePath, state.isError).then((error) => {
          if (error.isError) setHasError(error);
          setState({ state: 'done' });
        });
        break;
      case 'done':
        onBinariesUpdateDone();
        setState({ state: 'checking' });
        return binariesUpdate.removeEventListeners();
    }
  }, [configuration, shouldUpdateBinaries, state]);

  return {
    hasBinariesUpdateError: hasError,
    binariesUpdateProgress: { ...progress, state: state.state },
  };
};
