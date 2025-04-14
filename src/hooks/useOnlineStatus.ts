import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { getDocs, collection, limit, query } from 'firebase/firestore';

export function useOnlineStatus() {
  const [is_online, set_is_online] = useState(navigator.onLine);
  const [is_connected_to_firebase, set_is_connected_to_firebase] = useState(false);

  useEffect(() => {
    const handle_online = () => set_is_online(true);
    const handle_offline = () => set_is_online(false);

    window.addEventListener('online', handle_online);
    window.addEventListener('offline', handle_offline);

    // Verificar conectividade com Firebase
    const check_firebase_connection = async () => {
      try {
        // Tentar buscar um único documento do Firestore
        const test_query = query(collection(db, 'clients'), limit(1));
        await getDocs(test_query);
        set_is_connected_to_firebase(true);
      } catch (err) {
        console.error('Erro ao verificar conexão com Firebase:', err);
        set_is_connected_to_firebase(false);
      }
    };

    const interval = setInterval(check_firebase_connection, 30000); // Verificar a cada 30 segundos
    check_firebase_connection(); // Verificar imediatamente

    return () => {
      window.removeEventListener('online', handle_online);
      window.removeEventListener('offline', handle_offline);
      clearInterval(interval);
    };
  }, []);

  return {
    is_online,
    is_connected_to_firebase,
    is_fully_operational: is_online && is_connected_to_firebase
  };
}
