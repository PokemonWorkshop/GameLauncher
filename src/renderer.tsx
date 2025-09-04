import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { theme } from '@src/theme';

import { Home } from '@pages/home';

import { LauncherContextProvider } from '@components/LauncherContext';
import './i18n';

// Note: Nested routes seem to not be supported with Memory Router so just declare the full path

const app = createRoot(document.getElementById('app') as HTMLElement);
app.render(
  <ThemeProvider theme={theme}>
    <LauncherContextProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </HashRouter>
    </LauncherContextProvider>
  </ThemeProvider>,
);
