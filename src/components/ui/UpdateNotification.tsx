import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Componente que exibe uma notificação quando uma nova versão do aplicativo está disponível
 */
export default function UpdateNotification() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Registra um evento para capturar atualizações do service worker
    const onSWUpdate = (event: Event) => {
      const { detail } = event as CustomEvent;
      if (detail?.waiting) {
        setWaitingWorker(detail.waiting);
        setShowUpdateNotification(true);
      }
    };

    // Adiciona o listener para o evento personalizado
    window.addEventListener('sw-updated', onSWUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('sw-updated', onSWUpdate);
    };
  }, []);

  // Função para atualizar o aplicativo
  const updateApp = () => {
    if (!waitingWorker) return;

    // Envia uma mensagem para o service worker atualizar
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Recarrega a página após um breve delay
    setTimeout(() => {
      setShowUpdateNotification(false);
      window.location.reload();
    }, 300);
  };

  if (!showUpdateNotification) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 mx-auto w-max z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span>Nova versão disponível!</span>
        <button
          onClick={updateApp}
          className="bg-white text-blue-600 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
        >
          <RefreshCw size={14} />
          <span>Atualizar agora</span>
        </button>
      </div>
    </div>
  );
}
