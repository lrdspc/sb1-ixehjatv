import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  is_authenticated: boolean;
  loading: boolean;
  sign_out: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, set_user] = useState<User | null>(null);
  const [session, set_session] = useState<Session | null>(null);
  const [is_authenticated, set_is_authenticated] = useState(false);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      set_session(session);
      set_user(session?.user ?? null);
      set_is_authenticated(!!session);
      set_loading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set_session(session);
      set_user(session?.user ?? null);
      set_is_authenticated(!!session);
      set_loading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sign_out = async () => {
    await supabase.auth.signOut();
    set_session(null);
    set_user(null);
    set_is_authenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, is_authenticated, loading, sign_out }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
