import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

const messaging = getMessaging(app);

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações push');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão de notificação não concedida');
      return false;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (token) {
      console.log('Token de notificação obtido:', token);
      return true;
    }

    console.warn('Não foi possível obter o token de notificação');
    return false;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
}

export function setupMessageListener(callback: (payload: any) => void) {
  return onMessage(messaging, (payload) => {
    console.log('Mensagem recebida:', payload);
    callback(payload);
  });
}

// Função para exibir uma notificação
export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
