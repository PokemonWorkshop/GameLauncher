import { GameEnvironment } from '@src/types';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export const STORAGE_KEY = 'app_environment';

type EnvironmentContextType = {
  environment: GameEnvironment;
  setEnvironment: (env: GameEnvironment) => Promise<void>;
};

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState<GameEnvironment>('stable');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as GameEnvironment | null;
    if (saved) setEnvironmentState(saved);
  }, []);

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
