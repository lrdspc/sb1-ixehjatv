// Declaração para módulos virtuais do Vite
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): () => Promise<void>;
}

// Estender a interface Window para incluir propriedades globais
interface Window {
  UPDATE_SW?: () => Promise<void>;
}

// Definições para componentes ou utilitários personalizados
declare namespace JSX {
  interface IntrinsicElements {
    // Adicionar elementos personalizados aqui, se necessário
  }
}

// Declarações para tipos de arquivos não-JavaScript
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
} 