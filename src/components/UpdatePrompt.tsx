import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Componente que exibe um prompt para atualizar o PWA quando uma nova versão estiver disponível
 */
export function UpdatePrompt() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verifica se o service worker está disponível
    if ('serviceWorker' in navigator) {
      // Escuta por atualizações do service worker
      const handleUpdate = (reg: ServiceWorkerRegistration) => {
        if (reg.waiting) {
          setNeedsUpdate(true);
          setRegistration(reg);
        }
      };

      // Verifica o registro atual
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setNeedsUpdate(true);
          setRegistration(reg);
        }
      });

      // Escuta por novos service workers
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Escuta por atualizações
      window.addEventListener('sw-updated', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        handleUpdate(detail.registration);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Envia mensagem para o service worker atualizar
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!needsUpdate) return null;

  return (
    <div className="fixed top-4 left-0 right-0 mx-auto w-max z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span>Nova versão disponível!</span>
        <button
          onClick={handleUpdate}
          className="bg-white text-blue-600 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
        >
          <RefreshCw size={14} />
          <span>Atualizar</span>
        </button>
      </div>
    </div>
  );
}
