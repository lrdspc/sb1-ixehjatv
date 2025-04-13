import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

/**
 * Componente que exibe um indicador quando o usuário está offline
 */
export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-max z-50">
      <div className="bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <WifiOff size={18} />
        <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
      </div>
    </div>
  );
}
