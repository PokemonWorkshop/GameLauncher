import { useEffect, useState } from 'react';
import { GameConfiguration, LauncherError } from '@src/types';
import { useTranslation } from 'react-i18next';
import { voidCleanup } from './voidCleanup';

export const useGameUpdateCheck = (
  isValidLicence: boolean,
  onDoneChecking: (needToUpdateGame: boolean) => void,
  configuration?: GameConfiguration,
) => {
  const [updateCheckProgress, setUpdateCheckProgress] = useState(0);
  const [filesToDownload, setFilesToDownload] = useState<string[]>([]);
  const [doneChecking, setDoneChecking] = useState<boolean>(false);
  const [hasGameUpdateCheckError, setHasGameUpdateCheckError] = useState<LauncherError>({ isError: false });
  const { t } = useTranslation();
  const requestFile = window.launcherApi.requestFile;

  const resetState = () => {
    setUpdateCheckProgress(0);
    setFilesToDownload([]);
    setDoneChecking(false);
    setHasGameUpdateCheckError({ isError: false });
  };

  useEffect(() => {
    if (!isValidLicence || !configuration) return voidCleanup;

    requestFile.onRequestDone(async () => {
      const state = await requestFile.getRequestStateReport();
      if (state.success) {
        const data = await requestFile.getRequestData('utf-8');
        const { hashes, files } = JSON.parse(data);
        const invalidFiles = await window.launcherApi.checkFiles(configuration.gamePath, hashes, files);
        // move config.json file to the end of the list
        const currentFilesToDownload = [...filesToDownload, ...invalidFiles];
        const index = currentFilesToDownload.findIndex((file) => file === 'config.json');
        if (index !== -1) {
          currentFilesToDownload.splice(index, 1);
          currentFilesToDownload.push('config.json');
        }
        setFilesToDownload(currentFilesToDownload);
        onDoneChecking(currentFilesToDownload.length !== 0);
      } else {
        // if there is no update available, the server returns 404, so it is not an error
        if (state.status.code === 0) {
          setHasGameUpdateCheckError({ isError: true, message: `(${t('no_internet')})` });
        } else if (state.status.code !== 404) {
          const message = state.status.message ? `(Code: ${state.status.code}: ${state.status.message})` : `(Code: ${state.status.code})`;
          setHasGameUpdateCheckError({ isError: true, message });
        }
        onDoneChecking(false);
      }
      setDoneChecking(true);
    });

    requestFile.onRequestProgress((progress) => setUpdateCheckProgress(progress > 1 ? 100 : progress * 100));

    requestFile.requestFile(new URL(`versions/${configuration.gameVersion}.json?v=${+new Date()}`, configuration.gameUrl).href);

    return requestFile.removeEventListeners;
  }, [isValidLicence]);

  return {
    updateCheckProgress,
    filesToDownload,
    doneChecking: doneChecking,
    hasGameUpdateCheckError,
    resetGameUpdateCheck: resetState,
  };
};
