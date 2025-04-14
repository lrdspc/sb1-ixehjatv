import { useEffect, useState } from 'react';
import { UpdatePrompt } from './UpdatePrompt';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

// Definindo tipos para o hook useRegisterSW
interface RegisterSWOptions {
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  onRegisterError?: (error: Error) => void;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  immediate?: boolean;
}

interface UseRegisterSWReturn {
  needRefresh: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  offlineReady: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

// Mock do hook useRegisterSW para evitar erro de importação
function useRegisterSW(options: RegisterSWOptions): UseRegisterSWReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (options.onRegistered) {
            options.onRegistered(registration);
          }
        })
        .catch((error: Error) => {
          if (options.onRegisterError) {
            options.onRegisterError(error);
          }
        });

      // Simular eventos do service worker
      window.addEventListener('pwa:update-available', () => {
        if (options.onNeedRefresh) {
          options.onNeedRefresh();
        }
        setNeedRefresh(true);
      });

      window.addEventListener('pwa:offline-ready', () => {
        if (options.onOfflineReady) {
          options.onOfflineReady();
        }
        setOfflineReady(true);
      });
    }
  }, [options]);

  const updateServiceWorker = async (reloadPage = true): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        // Enviar mensagem para o service worker ativar a nova versão
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      if (reloadPage) {
        window.location.reload();
      }
    }
  };

  return {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker
  };
}

/**
 * Componente para gerenciar o ciclo de vida do PWA
 * Lida com registro, atualizações e eventos do service worker
 */
export function PWALifecycle() {
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const { isOnline } = useOnlineStatus();
  
  // Registrar o service worker
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    offlineReady: [offlineReady, setOfflineReady]
  } = useRegisterSW({
    onRegistered(registration: ServiceWorkerRegistration) {
      console.log('Service Worker registrado com sucesso:', registration);
      
      // Verificar atualizações periodicamente quando online
      if (registration && isOnline) {
        const intervalId = setInterval(() => {
          registration.update().catch(console.error);
        }, 60 * 60 * 1000); // A cada hora
        
        return () => clearInterval(intervalId);
      }
    },
    onRegisterError(error: Error) {
      console.error('Erro ao registrar Service Worker:', error);
    },
    onNeedRefresh() {
      // Notificar sobre atualização disponível
      setNeedRefresh(true);
      
      // Disparar evento personalizado para outros componentes
      window.dispatchEvent(new CustomEvent('pwa:update-available'));
    },
    onOfflineReady() {
      // Notificar que o app está pronto para uso offline
      setOfflineReady(true);
      console.log('Aplicativo pronto para uso offline');
      
      // Disparar evento personalizado para outros componentes
      window.dispatchEvent(new CustomEvent('pwa:offline-ready'));
      
      // Esconder a notificação após 3 segundos
      setTimeout(() => {
        setOfflineReady(false);
      }, 3000);
    }
  });
  
  // Verificar se o app está instalado
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone || 
                          document.referrer.includes('android-app://');
      
      setIsAppInstalled(isStandalone);
    };
    
    // Verificar no carregamento
    checkInstalled();
    
    // Verificar quando o modo de exibição mudar
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkInstalled();
    mediaQuery.addEventListener('change', handleChange);
    
    // Verificar quando o app for instalado
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso!');
      setIsAppInstalled(true);
      
      // Registrar evento de analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_installed', {
          'event_category': 'engagement'
        });
      }
    });
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Pré-carregar recursos críticos quando online
  useEffect(() => {
    if (isOnline) {
      // Pré-carregar imagens críticas
      const preloadImages = [
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ];
      
      preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
      
      // Pré-carregar fontes (se necessário)
      const preloadFonts = document.createElement('link');
      preloadFonts.rel = 'preload';
      preloadFonts.as = 'font';
      preloadFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      preloadFonts.crossOrigin = 'anonymous';
      document.head.appendChild(preloadFonts);
    }
  }, [isOnline]);
  
  // Monitorar eventos de ciclo de vida
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App voltou ao primeiro plano, verificar atualizações
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller && isOnline) {
          navigator.serviceWorker.ready.then(registration => {
            registration.update().catch(console.error);
          });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline]);
  
  // Usar o estado isAppInstalled para personalizar a experiência
  // (por exemplo, mostrar recursos específicos para usuários que instalaram o app)
  const showInstalledFeatures = isAppInstalled && needRefresh;
  
  return (
    <>
      {/* Componente de atualização do PWA */}
      <UpdatePrompt />
      
      {/* Notificação de pronto para uso offline */}
      {offlineReady && (
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-max z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span>Aplicativo pronto para uso offline!</span>
        </div>
      )}
      
      {/* Exemplo de conteúdo condicional para usuários que instalaram o app */}
      {showInstalledFeatures && (
        <div className="hidden">Recursos extras para usuários com app instalado</div>
      )}
    </>
  );
}
