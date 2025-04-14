import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

interface ConnectivityState {
  isOffline: boolean;
  backendReachable: boolean;
  showReconnected: boolean;
}

export default function OfflineIndicator() {
  const [state, setState] = useState<ConnectivityState>({
    isOffline: !navigator.onLine,
    backendReachable: true,
    showReconnected: false
  });

  const checkBackendConnectivity = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const handleOnline = async () => {
      const backendReachable = await checkBackendConnectivity();
      setState({
        isOffline: false,
        backendReachable,
        showReconnected: true
      });
      
      // Esconder a mensagem de reconexão após 5 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, showReconnected: false }));
      }, 5000);
    };

    const handleOffline = () => setState(prev => ({
      ...prev,
      isOffline: true,
      backendReachable: false
    }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!state.isOffline && !state.showReconnected && state.backendReachable) return null;

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
    return null;
  };

  const status = getStatusInfo();
  if (!status) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 ${status.bg} text-white px-4 py-2 text-center flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out`}>
      {status.icon}
      <span>{status.message}</span>
    </div>
  );
}
