import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/firebase-auth-context';
import type { FirestoreClient } from '../types/firestore';
import { getAllClients as getAllOfflineClients } from '../lib/db';

export function useClients() {
  const [clients, set_clients] = useState<FirestoreClient[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const { is_authenticated } = useAuth();

  const fetch_clients = useCallback(async () => {
    if (!is_authenticated) {
      set_clients([]);
      set_loading(false);
      return;
    }

    try {
      set_loading(true);
      set_error(null);

      // Tentar buscar offline primeiro
      const offline_clients = await getAllOfflineClients();
      if (offline_clients.length > 0) {
        set_clients(offline_clients);
        set_loading(false);
        return;
      }

      // Buscar dados do Firestore
      const clients_query = query(
        collection(db, 'clients'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(clients_query);
      const clients_data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreClient[];

      set_clients(clients_data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      set_error('Não foi possível carregar os clientes');
    } finally {
      set_loading(false);
    }
  }, [is_authenticated]);

  useEffect(() => {
    fetch_clients();
  }, [fetch_clients]);

  return { clients, loading, error, refresh: fetch_clients };
}