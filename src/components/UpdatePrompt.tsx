import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Componente que exibe um prompt para atualizar o PWA quando uma nova versão estiver disponível
 */
export function UpdatePrompt() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleUpdate = (reg: ServiceWorkerRegistration) => {
        if (reg.waiting) {
          setNeedsUpdate(true);
          setRegistration(reg);
          setIsVisible(true);
        }
      };

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setNeedsUpdate(true);
          setRegistration(reg);
          setIsVisible(true);
        }
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setIsUpdating(true);
        setTimeout(() => window.location.reload(), 1000);
      });

      window.addEventListener('sw-updated', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        handleUpdate(detail.registration);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setNeedsUpdate(false), 300);
  };

  if (!needsUpdate) return null;

  return (
    <div className={`fixed top-4 left-0 right-0 mx-auto w-max z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
        <span>{isUpdating ? 'Atualizando...' : 'Nova versão disponível!'}</span>
        
        {!isUpdating && (
          <>
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-600 px-3 py-1 rounded-md flex items-center gap-1 text-sm hover:bg-blue-50 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Atualizar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-blue-200 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
