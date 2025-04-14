import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { PWALifecycle } from './components/PWALifecycle';

// Obter a chave pública do Clerk do ambiente
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Falta a chave pública do Clerk (VITE_CLERK_PUBLISHABLE_KEY)");
}

// Definir o objeto global para analytics (se disponível)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Carregar a aplicação com prioridade para conteúdo visível
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/login"
      signUpForceRedirectUrl="/register"
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
      <PWALifecycle />
    </ClerkProvider>
  </React.StrictMode>,
);
