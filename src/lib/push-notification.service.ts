import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { messaging } from './firebase';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!messaging || !(await isSupported())) {
      console.warn('Notificações push não são suportadas neste navegador');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão para notificações negada');
      return false;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (token) {
      console.log('Token de notificação obtido:', token);
      return true;
    } else {
      console.warn('Não foi possível obter o token de notificação');
      return false;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
}

export function setupMessageListener(callback: (payload: any) => void) {
  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    console.log('Mensagem recebida:', payload);
    callback(payload);
    
    // Mostrar notificação mesmo com app em primeiro plano
    if (payload.notification) {
      showNotification(
        payload.notification.title || 'Nova Notificação',
        {
          body: payload.notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          data: payload.data
        }
      );
    }
  });
}

export function showNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      ...options
    });
  }
}
