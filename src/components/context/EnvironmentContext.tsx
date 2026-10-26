import config from '@src/config.json';
import { GameEnvironment } from '@src/types';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export const STORAGE_KEY = 'app_environment';

const channels = Object.keys(config.channels);
export const DEFAULT_ENVIRONMENT = channels[0];

if (DEFAULT_ENVIRONMENT === undefined) {
  throw new Error('At least one release channel must be configured.');
}

type EnvironmentContextType = {
  environment: GameEnvironment;
  setEnvironment: (env: GameEnvironment) => Promise<void>;
};

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState<GameEnvironment>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null && channels.includes(saved) ? saved : DEFAULT_ENVIRONMENT;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, environment);
  }, [environment]);

  const verifyBetaAccess = async () => {
    const token = localStorage.getItem('beta_token');
    await new Promise((r) => setTimeout(r, 300));
    return token === 'VALID_BETA_TOKEN';
  };

  const setEnvironment = async (env: GameEnvironment) => {
    /*if (value === 'beta') {
      const ok = await verifyBetaAccess();
      if (!ok) return;
    }*/
    setEnvironmentState(env);
    localStorage.setItem(STORAGE_KEY, env);
  };

  return <EnvironmentContext.Provider value={{ environment, setEnvironment }}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironment must be used inside EnvironmentProvider');
  return ctx;
}
