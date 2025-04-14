import { useState, useEffect } from 'react';
import { useAuth } from '../lib/firebase-auth-context';
import { get_user_profile } from '../lib/user.service';
import type { UserProfile } from '../types/user';

export function useProfile() {
  const { user } = useAuth();
  const [profile, set_profile] = useState<UserProfile | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  useEffect(() => {
    async function load_profile() {
      if (!user) {
        set_profile(null);
        set_loading(false);
        return;
      }

      try {
        const profile_data = await get_user_profile(user.uid);
        set_profile(profile_data);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        set_error('Não foi possível carregar o perfil');
      } finally {
        set_loading(false);
      }
    }

    load_profile();
  }, [user]);

  return { profile, loading, error };
}
