import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { get_user_profile } from '../lib/user.service';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['users_profiles']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, set_profile] = useState<Profile | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  useEffect(() => {
    const load_profile = async () => {
      if (!user) {
        set_profile(null);
        set_loading(false);
        return;
      }

      try {
        const user_profile = await get_user_profile(user.id);
        set_profile(user_profile);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao buscar perfil';
        set_error(message);
      } finally {
        set_loading(false);
      }
    };

    load_profile();
  }, [user]);

  return { 
    profile,
    loading,
    error,
    get_profile: async () => {
      if (!user) return null;
      return await get_user_profile(user.id);
    }
  };
}
