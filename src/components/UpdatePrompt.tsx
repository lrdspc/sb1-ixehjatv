import { useState, useEffect } from 'react';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Componente que exibe um prompt para atualizar o PWA quando uma nova versão estiver disponível
 */
export function UpdatePrompt() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) {
      // Se estiver offline, não verificar atualizações
      return;
    }

    if ('serviceWorker' in navigator) {
      const handleUpdate = (reg: ServiceWorkerRegistration) => {
        if (reg.waiting) {
          setNeedsUpdate(true);
          setRegistration(reg);
          setIsVisible(true);
          
          // Notificar o usuário com som (opcional)
          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Silenciar erro se o navegador bloquear a reprodução automática
            });
          } catch (e) {
            // Ignorar erros de áudio
          }
        }
      };

      // Verificar se há um service worker esperando para ser ativado
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setNeedsUpdate(true);
          setRegistration(reg);
          setIsVisible(true);
        }
      });

      // Ouvir mudanças no controlador do service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setIsUpdating(true);
        
        // Armazenar o estado atual da aplicação para restaurar após a atualização
        try {
          const scrollPosition = window.scrollY;
          const currentPath = window.location.pathname;
          sessionStorage.setItem('pwa-update-scroll', scrollPosition.toString());
          sessionStorage.setItem('pwa-update-path', currentPath);
        } catch (e) {
          console.error('Erro ao salvar estado:', e);
        }
        
        // Recarregar a página após um curto atraso
        setTimeout(() => window.location.reload(), 1000);
      });

      // Ouvir eventos personalizados do service worker
      window.addEventListener('sw-updated', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        handleUpdate(detail.registration);
      });
      
      // Verificar atualizações periodicamente (a cada 60 minutos)
      const checkInterval = setInterval(() => {
        if (isOnline) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) {
              reg.update().catch(err => {
                console.error('Erro ao verificar atualizações:', err);
              });
            }
          });
        }
      }, 60 * 60 * 1000);
      
      return () => {
        clearInterval(checkInterval);
      };
    }
  }, [isOnline]);

  // Restaurar o estado da aplicação após a atualização
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('pwa-update-scroll');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
      sessionStorage.removeItem('pwa-update-scroll');
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Enviar mensagem para o service worker ativar a nova versão
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Registrar evento de analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_update', {
          'event_category': 'engagement',
          'event_label': 'manual'
        });
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setNeedsUpdate(false), 300);
    
    // Armazenar a decisão do usuário para não mostrar novamente por um tempo
    localStorage.setItem('pwa-update-dismissed', new Date().toISOString());
  };

  // Verificar se o alerta foi recentemente descartado
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-update-dismissed');
    if (dismissedTime) {
      const dismissed = new Date(dismissedTime);
      const now = new Date();
      // Se foi descartado há menos de 4 horas, não mostrar
      if ((now.getTime() - dismissed.getTime()) < 4 * 60 * 60 * 1000) {
        setNeedsUpdate(false);
        setIsVisible(false);
      } else {
        // Limpar o registro após 4 horas
        localStorage.removeItem('pwa-update-dismissed');
      }
    }
  }, []);

  if (!needsUpdate || !isOnline) return null;

  return (
    <div className={`fixed top-4 left-0 right-0 mx-auto w-max z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
        {isUpdating ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            <span>Atualizando...</span>
          </>
        ) : (
          <>
            <AlertTriangle size={18} />
            <span>Nova versão disponível!</span>
            
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
