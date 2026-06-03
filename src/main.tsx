import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './App.css';
import './styles/flow-theme.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML =
    '<p style="padding:2rem;font-family:sans-serif">Erreur : élément #root introuvable.</p>';
} else {
  rootEl.innerHTML =
    '<p style="padding:2rem;font-family:system-ui,sans-serif;color:#1a1a1a">Chargement de DataPipe…</p>';
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
