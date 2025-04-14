import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  UNSAFE_enhanceManualRouteObjects,
  UNSAFE_DataRouterContext,
  UNSAFE_NavigationContext,
  UNSAFE_RouteContext
} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Habilitar flags futuras do React Router v7
UNSAFE_enhanceManualRouteObjects.v7_relativeSplatPath = true;
UNSAFE_enhanceManualRouteObjects.v7_startTransition = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
