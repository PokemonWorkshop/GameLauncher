import { GameConfiguration, ValidChannels } from '@src/types';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const STORAGE_KEY = 'app_environment';

type EnvironmentContextType = {
  environment: ValidChannels<GameConfiguration>;
  setEnvironment: (e: ValidChannels<GameConfiguration>) => Promise<void>;
};

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState<ValidChannels<GameConfiguration>>('stable');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ValidChannels<GameConfiguration> | null;
    if (saved) setEnvironmentState(saved);
  }, []);

  const verifyBetaAccess = async () => {
    const token = localStorage.getItem('beta_token');
    await new Promise((r) => setTimeout(r, 300));
    return token === 'VALID_BETA_TOKEN';
  };

  const setEnvironment = async (value: ValidChannels<GameConfiguration>) => {
    if (value === 'beta') {
      const ok = await verifyBetaAccess();
      if (!ok) return;
    }
    setEnvironmentState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return <EnvironmentContext.Provider value={{ environment, setEnvironment }}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironment must be used inside EnvironmentProvider');
  return ctx;
}
