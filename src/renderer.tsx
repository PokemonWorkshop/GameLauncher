import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { theme } from '@src/theme';

import { Home } from '@pages/home';

import { LauncherContextProvider } from '@components/LauncherContext';
import { EnvironmentProvider, useEnvironment } from '@components/context/EnvironmentContext';
import './i18n'; //

function EnvironmentSelector() {
  const { environment, setEnvironment } = useEnvironment();
  return (
    <div>
      <h3>Current Environment: {environment}</h3>
      <button onClick={() => setEnvironment('beta')}>Beta</button>
      <button onClick={() => setEnvironment('stable')}>Stable</button>

      <button onClick={() => setEnvironment('canary')}>Canary</button>
      <button onClick={() => setEnvironment('dev')}>Dev</button>
    </div>
  );
}

function DebugPanel() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '10px',
        zIndex: 1000,
      }}
    >
      <div>
        <h4>Debug Panel</h4>
        <EnvironmentSelector />
      </div>
    </div>
  );
}

// Note: Nested routes seem to not be supported with Memory Router so just declare the full path

const app = createRoot(document.getElementById('app') as HTMLElement);
app.render(
  <ThemeProvider theme={theme}>
    <EnvironmentProvider>
      <LauncherContextProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<DebugPanel />} />
          </Routes>
        </HashRouter>
      </LauncherContextProvider>
    </EnvironmentProvider>
  </ThemeProvider>,
);
