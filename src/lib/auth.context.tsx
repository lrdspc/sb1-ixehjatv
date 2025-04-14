import React, { createContext, useContext, useEffect } from 'react';
import { useClerk, useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { clerkConfig } from './clerk.config';
import { supabase } from './supabase';
import { syncUserProfile } from './user.service';

interface AuthContextType {
  user: ReturnType<typeof useUser>['user'];
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();
  const clerk = useClerk();
  const { getToken } = useClerkAuth();

  // Sincronizar token do Clerk com o Supabase
  useEffect(() => {
    if (isSignedIn && user) {
      const syncAuth = async () => {
        try {
          // 1. Obter o token JWT para o Supabase
          const token = await getToken({ template: 'supabase' });
          if (token) {
            // 2. Definir o token JWT como sessão do Supabase
            const { error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: token, // Não é ideal, mas é uma solução temporária
            });
            
            if (error) {
              console.error('Erro ao sincronizar token com Supabase:', error);
            } else {
              // 3. Sincronizar o perfil do usuário no Supabase
              await syncUserProfile(user.id, {
                fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.primaryEmailAddress?.emailAddress,
                avatarUrl: user.imageUrl
              });
            }
          }
        } catch (error) {
          console.error('Erro ao obter token do Clerk:', error);
        }
      };
      
      syncAuth();
    }
  }, [isSignedIn, user, getToken]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await clerk.client.signIn.create({
        identifier: email,
        password,
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      // Limpar a sessão do Supabase também
      await supabase.auth.signOut();
      await clerk.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      isAuthenticated: isSignedIn || false,
      signIn: handleSignIn,
      signOut: handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
