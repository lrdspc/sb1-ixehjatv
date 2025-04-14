import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PWALifecycle } from './components/PWALifecycle';
import { AuthProvider } from './lib/firebase-auth-context';
import { enableOfflineSupport } from './lib/offline.service';
import { requestNotificationPermission } from './lib/push-notification.service';

// Definir o objeto global para analytics (se disponível)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Inicializar recursos do Firebase
async function initializeFirebaseFeatures() {
  // Habilitar suporte offline
  await enableOfflineSupport();
  
  // Solicitar permissão para notificações apenas em produção
  if (import.meta.env.PROD) {
    await requestNotificationPermission();
  }
}

// Inicializar recursos e carregar a aplicação
initializeFirebaseFeatures().catch(console.error);

// Carregar a aplicação com prioridade para conteúdo visível
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <PWALifecycle />
    </AuthProvider>
  </React.StrictMode>,
);
