import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/globals.css';
import { initAnalytics } from './src/utils/analytics';
import App from './src/App';
import { StackAuthProvider } from './src/auth/StackAuthProvider';

// Initialize analytics
initAnalytics();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <StackAuthProvider>
        <App />
      </StackAuthProvider>
    </React.StrictMode>
  );
}