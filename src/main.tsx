import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PWALifecycle } from './components/PWALifecycle';
import { AuthProvider } from './lib/auth-context';

// Definir o objeto global para analytics (se disponível)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Carregar a aplicação com prioridade para conteúdo visível
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <PWALifecycle />
    </AuthProvider>
  </React.StrictMode>,
);
