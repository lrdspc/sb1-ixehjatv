import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export function useProfile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar perfil';
      setError(message);
      setLoading(false);
    }
  }, [user]);

  return { 
    profile: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl
    } : null,
    loading,
    error,
    getProfile: () => Promise.resolve(user)
  };
}
