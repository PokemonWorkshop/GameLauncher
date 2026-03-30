import { useEnvironment } from './context/EnvironmentContext';
import React from 'react';

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

export function DebugPanel() {
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
