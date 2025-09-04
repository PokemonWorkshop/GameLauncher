import { useEffect, useState } from 'react';

import { GameConfiguration, Licence } from '@src/types';

import { voidCleanup } from './voidCleanup';

export const useCheckLicence = (isGameInstalled: boolean, configuration?: GameConfiguration) => {
  const [isValidLicence, setIsValidLicence] = useState<boolean>(false);
  const [doneLicenceChecking, setDoneLicenceChecking] = useState<boolean>(false);
  const [licence, setLicence] = useState<Licence | undefined>(undefined);
  const requestFile = window.launcherApi.requestFile;

  const resetState = () => {
    setIsValidLicence(false);
    setDoneLicenceChecking(false);
    setLicence(undefined);
  };

  useEffect(() => {
    if (!configuration || !isGameInstalled) return voidCleanup;

    if (configuration.licenseUrl === undefined) {
      setIsValidLicence(true);
      setDoneLicenceChecking(true);
      return voidCleanup;
    }

    if (!licence) {
      const promise = () => window.launcherApi.readLicence(configuration).then((result) => setLicence(result));
      promise();
    } else {
      if (!licence.key) {
        setDoneLicenceChecking(true);
        return voidCleanup;
      }

      requestFile.onRequestDone(async () => {
        const state = await requestFile.getRequestStateReport();
        if (state.success) {
          const data = await requestFile.getRequestData('utf-8');
          setIsValidLicence(data === 'OK!');
        }
        setDoneLicenceChecking(true);
      });

      requestFile.requestFile(new URL(`?key=${licence.key}&user=${licence.user}`, configuration.licenseUrl).href);
    }

    return requestFile.removeEventListeners;
  }, [configuration, isGameInstalled, licence]);

  return {
    isValidLicence,
    doneLicenceChecking,
    resetLicenceCheck: resetState,
  };
};
