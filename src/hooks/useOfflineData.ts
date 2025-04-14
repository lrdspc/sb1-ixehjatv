import { useState, useEffect } from 'react';
import { useAuth } from '../lib/firebase-auth-context';
import { getOfflineInspections } from '../lib/sync.service';
import type { Inspection } from '../types/inspections';

interface OfflineData {
  inspections: Inspection[];
}

export function useOfflineData() {
  const { is_authenticated } = useAuth();
  const [data, set_data] = useState<OfflineData>({ inspections: [] });
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  useEffect(() => {
    async function load_offline_data() {
      if (!is_authenticated) {
        set_data({ inspections: [] });
        set_loading(false);
        return;
      }

      try {
        const inspections = await getOfflineInspections();
        set_data({ inspections });
      } catch (err) {
        console.error('Erro ao carregar dados offline:', err);
        set_error('Não foi possível carregar os dados offline');
      } finally {
        set_loading(false);
      }
    }

    load_offline_data();
  }, [is_authenticated]);

  return { data, loading, error };
}
