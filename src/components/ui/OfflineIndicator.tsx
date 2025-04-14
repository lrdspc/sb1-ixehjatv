import { useEffect, useState, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, Database } from 'lucide-react';

interface ConnectivityState {
  isOffline: boolean;
  backendReachable: boolean;
  showReconnected: boolean;
  syncPending: boolean;
}

export default function OfflineIndicator() {
  const [state, setState] = useState<ConnectivityState>({
    isOffline: !navigator.onLine,
    backendReachable: true,
    showReconnected: false,
    syncPending: false
  });

  // Verificar a conectividade com o backend
  const checkBackendConnectivity = useCallback(async () => {
    try {
      // Tentar primeiro o endpoint de saúde
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Timeout curto para não bloquear por muito tempo
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (e) {
      // Se o endpoint de saúde falhar, tentar o Supabase
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        if (supabaseUrl) {
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'HEAD',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: AbortSignal.timeout(3000)
          });
          return response.ok;
        }
      } catch {
        // Ignorar erro do segundo teste
      }
      return false;
    }
  }, []);

  // Verificar se há dados pendentes para sincronização
  const checkPendingSync = useCallback(async () => {
    try {
      // Verificar se há dados no IndexedDB para sincronizar
      const dbName = 'sync-queue';
      const request = indexedDB.open(dbName);
      
      return new Promise<boolean>((resolve) => {
        request.onerror = () => resolve(false);
        
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('items')) {
            resolve(false);
            return;
          }
          
          try {
            const transaction = db.transaction('items', 'readonly');
            const store = transaction.objectStore('items');
            const countRequest = store.count();
            
            countRequest.onsuccess = () => {
              resolve(countRequest.result > 0);
            };
            
            countRequest.onerror = () => {
              resolve(false);
            };
          } catch (e) {
            resolve(false);
          }
        };
      });
    } catch (e) {
      return false;
    }
  }, []);

  // Efeito para monitorar mudanças de conectividade
  useEffect(() => {
    const handleOnline = async () => {
      // Verificar se há dados pendentes para sincronização
      const syncPending = await checkPendingSync();
      
      // Verificar se o backend está acessível
      const backendReachable = await checkBackendConnectivity();
      
      setState({
        isOffline: false,
        backendReachable,
        showReconnected: true,
        syncPending
      });
      
      // Registrar evento de analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'connectivity_change', {
          'event_category': 'network',
          'event_label': 'online',
          'value': backendReachable ? 1 : 0
        });
      }
      
      // Iniciar sincronização se o service worker estiver disponível
      if (syncPending && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          // @ts-ignore - A API Background Sync pode não estar definida em todos os navegadores
          if ('sync' in registration) {
            // Usando uma interface para tipar corretamente
            interface SyncManager {
              register(tag: string): Promise<void>;
            }
            
            interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
              sync: SyncManager;
            }
            
            // Casting para o tipo estendido
            const extendedReg = registration as ExtendedServiceWorkerRegistration;
            extendedReg.sync.register('sync-all').catch((error: Error) => {
              console.error('Erro ao registrar sincronização:', error);
            });
          } else {
            // Fallback para navegadores que não suportam Background Sync
            console.log('Background Sync não suportado, enviando mensagem direta');
            navigator.serviceWorker.controller?.postMessage({
              type: 'MANUAL_SYNC'
            });
          }
        });
      }
      
      // Esconder a mensagem de reconexão após 5 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, showReconnected: false }));
      }, 5000);
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOffline: true,
        backendReachable: false
      }));
      
      // Registrar evento de analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'connectivity_change', {
          'event_category': 'network',
          'event_label': 'offline'
        });
      }
      
      // Notificar o usuário com vibração (se disponível)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    };

    // Verificar periodicamente se há dados pendentes para sincronização
    const syncCheckInterval = setInterval(async () => {
      if (navigator.onLine) {
        const syncPending = await checkPendingSync();
        if (syncPending !== state.syncPending) {
          setState(prev => ({ ...prev, syncPending }));
        }
      }
    }, 30000); // Verificar a cada 30 segundos

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar o estado inicial
    handleOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncCheckInterval);
    };
  }, [checkBackendConnectivity, checkPendingSync, state.syncPending]);

  // Ouvir mensagens do service worker sobre sincronização
  useEffect(() => {
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'SYNC_SUCCESS' || event.data.type === 'FORM_SYNC_SUCCESS')) {
        checkPendingSync().then(syncPending => {
          setState(prev => ({ ...prev, syncPending }));
        });
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSyncMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSyncMessage);
      }
    };
  }, [checkPendingSync]);

  if (!state.isOffline && !state.showReconnected && state.backendReachable && !state.syncPending) return null;

  const getStatusInfo = () => {
    if (state.showReconnected) {
      return {
        bg: 'bg-green-500',
        icon: <Wifi className="h-4 w-4 animate-pulse" />,
        message: 'Conexão restabelecida! Sincronizando dados...'
      };
    }
    if (state.isOffline) {
      return {
        bg: 'bg-red-500',
        icon: <WifiOff className="h-4 w-4" />,
        message: 'Você está offline. Os dados serão sincronizados quando a conexão for restabelecida.'
      };
    }
    if (!state.backendReachable) {
      return {
        bg: 'bg-yellow-500',
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        message: 'Problemas de conexão com o servidor. Tentando reconectar...'
      };
    }
    if (state.syncPending) {
      return {
        bg: 'bg-blue-500',
        icon: <Database className="h-4 w-4" />,
        message: 'Sincronizando dados em segundo plano...'
      };
    }
    return null;
  };

  const status = getStatusInfo();
  if (!status) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 ${status.bg} text-white px-4 py-2 text-center flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out z-50`}>
      {status.icon}
      <span className="text-sm">{status.message}</span>
    </div>
  );
}
