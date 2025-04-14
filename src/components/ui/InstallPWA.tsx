import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallationState {
  isInstallable: boolean;
  wasInstallDismissed: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallationState>({
    isInstallable: false,
    wasInstallDismissed: false,
    platform: 'unknown'
  });

  useEffect(() => {
    // Detectar plataforma
    const detectPlatform = () => {
      const ua = navigator.userAgent.toLowerCase();
      if (/android/.test(ua)) return 'android';
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      return 'desktop';
    };

    setInstallState(prev => ({
      ...prev,
      platform: detectPlatform()
    }));

    // Verificar se já foi descartado anteriormente
    const wasInstallDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    if (wasInstallDismissed) {
      setInstallState(prev => ({ ...prev, wasInstallDismissed: true }));
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallState(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setInstallState(prev => ({ ...prev, isInstallable: false }));
        localStorage.setItem('pwa-installed', 'true');
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true');
        setInstallState(prev => ({ ...prev, wasInstallDismissed: true }));
      }
    } catch (error) {
      console.error('Erro ao tentar instalar o PWA:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setInstallState(prev => ({ ...prev, wasInstallDismissed: true }));
  };

  if (!installState.isInstallable || installState.wasInstallDismissed) return null;

  const getPlatformInstructions = () => {
    switch (installState.platform) {
      case 'ios':
        return 'Toque em "Compartilhar" e depois "Adicionar à Tela Inicial"';
      case 'android':
        return 'Toque em "Instalar" para adicionar à tela inicial';
      default:
        return 'Clique em "Instalar" para ter acesso rápido';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-xl shadow-lg p-4 border border-gray-200">
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
