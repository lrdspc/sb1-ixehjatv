import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { registerSW } from 'virtual:pwa-register';

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

// Obter a chave pública do Clerk do ambiente
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Falta a chave pública do Clerk (VITE_CLERK_PUBLISHABLE_KEY)");
}

// Carregar a aplicação com prioridade para conteúdo visível
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/login"
      signUpUrl="/register"
      appearance={{
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#f9fafb',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-md rounded-lg',
          formField: 'rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
