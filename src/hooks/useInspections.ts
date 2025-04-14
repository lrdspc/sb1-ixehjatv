import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/firebase-auth-context';
import type { FirestoreInspection } from '../types/firestore';
import { getAllInspections as getAllOfflineInspections } from '../lib/db';

export function useInspections(clientId?: string) {
  const [inspections, set_inspections] = useState<FirestoreInspection[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const { is_authenticated } = useAuth();

  const fetch_inspections = useCallback(async () => {
    if (!is_authenticated) {
      set_inspections([]);
      set_loading(false);
      return;
    }

    try {
      set_loading(true);
      set_error(null);

      // Tentar buscar offline primeiro
      const offline_inspections = await getAllOfflineInspections();
      if (offline_inspections.length > 0) {
        set_inspections(offline_inspections);
        set_loading(false);
        return;
      }

      // Construir query do Firestore
      let inspections_query = collection(db, 'inspections');
      if (clientId) {
        inspections_query = query(
          inspections_query,
          where('client_id', '==', clientId),
          orderBy('created_at', 'desc')
        );
      } else {
        inspections_query = query(
          inspections_query,
          orderBy('created_at', 'desc')
        );
      }

      // Buscar dados do Firestore
      const snapshot = await getDocs(inspections_query);
      const inspections_data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreInspection[];

      set_inspections(inspections_data);
    } catch (err) {
      console.error('Erro ao buscar inspeções:', err);
      set_error('Não foi possível carregar as inspeções');
    } finally {
      set_loading(false);
    }
  }, [is_authenticated, clientId]);

  useEffect(() => {
    fetch_inspections();
  }, [fetch_inspections]);

  return { inspections, loading, error, refresh: fetch_inspections };
}