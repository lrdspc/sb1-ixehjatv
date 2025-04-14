import { useEffect } from 'react';

// Define the PushEvent interface
interface PushEvent extends Event {
  data?: {
    json(): {
      title: string;
      body: string;
    };
  };
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function usePushNotifications() {
  useEffect(() => {
    const handlePushNotification = (event: PushEvent) => {
      const data = event.data?.json();
      if (data) {
        new Notification(data.title, {
          body: data.body,
          icon: '/icons/icon-192x192.png',
        });
      }
    };

    window.addEventListener('push', handlePushNotification);

    return () => {
      window.removeEventListener('push', handlePushNotification);
    };
  }, []);
}
