import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { ClerkProvider } from '@clerk/clerk-react';
import { clerkConfig } from './lib/clerk.config';

// Registrar o service worker para o PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Disparar um evento personalizado que será capturado pelo componente UpdateNotification
    window.dispatchEvent(new CustomEvent('pwa:update-available'));
  },
  onOfflineReady() {
    console.log('Aplicativo pronto para uso offline');
    window.dispatchEvent(new CustomEvent('pwa:offline-ready'));
  },
  immediate: true
});

// Expor a função de atualização do SW globalmente para uso no componente
window.UPDATE_SW = () => updateSW();

// Carregar a aplicação com prioridade para conteúdo visível
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider {...clerkConfig}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
