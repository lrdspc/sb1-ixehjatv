import { useState, useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallationState {
  isInstallable: boolean;
  wasInstallDismissed: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  isStandalone: boolean;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallationState>({
    isInstallable: false,
    wasInstallDismissed: false,
    platform: 'unknown',
    isStandalone: false
  });
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    // Detectar se já está instalado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');

    // Detectar plataforma
    const detectPlatform = () => {
      const ua = navigator.userAgent.toLowerCase();
      if (/android/.test(ua)) return 'android';
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      return 'desktop';
    };

    setInstallState(prev => ({
      ...prev,
      platform: detectPlatform() as any,
      isStandalone
    }));

    // Verificar se já foi descartado anteriormente
    const wasInstallDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    if (wasInstallDismissed) {
      setInstallState(prev => ({ ...prev, wasInstallDismissed: true }));
    }

    // Limpar o status de descarte após 3 dias
    const dismissedTimestamp = localStorage.getItem('pwa-install-dismissed-timestamp');
    if (dismissedTimestamp) {
      const dismissedDate = new Date(dismissedTimestamp);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      if (dismissedDate < threeDaysAgo) {
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.removeItem('pwa-install-dismissed-timestamp');
        setInstallState(prev => ({ ...prev, wasInstallDismissed: false }));
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallState(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar quando o app é instalado
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso!');
      setDeferredPrompt(null);
      setInstallState(prev => ({ 
        ...prev, 
        isInstallable: false,
        isStandalone: true 
      }));
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-installed-timestamp', new Date().toISOString());
      
      // Enviar evento de analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          'event_category': 'engagement',
          'event_label': installState.platform
        });
      }
    });

    // Verificar mudanças no modo de exibição
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const displayModeHandler = (e: MediaQueryListEvent) => {
      setInstallState(prev => ({ ...prev, isStandalone: e.matches }));
    };
    
    mediaQueryList.addEventListener('change', displayModeHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mediaQueryList.removeEventListener('change', displayModeHandler);
    };
  }, [installState.platform]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setInstallState(prev => ({ ...prev, isInstallable: false }));
        localStorage.setItem('pwa-installed', 'true');
        localStorage.setItem('pwa-installed-timestamp', new Date().toISOString());
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true');
        localStorage.setItem('pwa-install-dismissed-timestamp', new Date().toISOString());
        setInstallState(prev => ({ ...prev, wasInstallDismissed: true }));
      }
    } catch (error) {
      console.error('Erro ao tentar instalar o PWA:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-timestamp', new Date().toISOString());
    setInstallState(prev => ({ ...prev, wasInstallDismissed: true }));
  };

  // Não mostrar se já estiver instalado, se estiver offline, se não for instalável ou se o usuário já descartou
  if (
    installState.isStandalone || 
    !isOnline || 
    !installState.isInstallable || 
    installState.wasInstallDismissed
  ) {
    return null;
  }

  // Instruções específicas por plataforma
  const getPlatformInstructions = () => {
    switch (installState.platform) {
      case 'ios':
        return (
          <div className="flex flex-col gap-2">
            <p>Para instalar este aplicativo no seu iPhone:</p>
            <ol className="text-xs space-y-1 list-decimal pl-4">
              <li>Toque no ícone <ExternalLink className="inline h-3 w-3" /> de compartilhamento</li>
              <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
              <li>Toque em "Adicionar" no canto superior direito</li>
            </ol>
          </div>
        );
      case 'android':
        return 'Toque em "Instalar" para adicionar este app à sua tela inicial';
      default:
        return 'Instale este aplicativo para acesso rápido mesmo quando estiver offline';
    }
  };

  // Renderização condicional por plataforma
  if (installState.platform === 'ios') {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-white rounded-xl shadow-lg p-4 border border-gray-200 z-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Instalar Aplicativo</h3>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm text-gray-600 mb-3">
          {getPlatformInstructions()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-xl shadow-lg p-4 border border-gray-200 z-50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Instalar Aplicativo</h3>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{getPlatformInstructions()}</p>
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="h-5 w-5" />
        <span>Instalar Agora</span>
      </button>
    </div>
  );
}
