import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * Componente que exibe um botão para instalar o PWA
 */
export function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      setIsInstalling(true);
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      setIsInstalling(false);
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setInstallPrompt(null);
    }
  };

  return (
    <div className="pwa-install-container">
      {installPrompt && (
        <div className="pwa-install-banner">
          <p>Instale o aplicativo para uma experiência melhor!</p>
          <button 
            onClick={handleInstallClick} 
            disabled={isInstalling}
            aria-label="Instalar aplicativo"
          >
            {isInstalling ? 'Instalando...' : 'Instalar App'}
          </button>
        </div>
      )}
    </div>
  );
}
