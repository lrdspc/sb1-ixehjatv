import React, { createContext, useContext } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
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

  // Sincronizar dados do usuário com o Supabase (sem autenticação)
  React.useEffect(() => {
    if (isSignedIn && user) {
      // Apenas sincronizar o perfil do usuário no Supabase
      syncUserProfile(user.id, {
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress,
        avatarUrl: user.imageUrl
      });
    }
  }, [isSignedIn, user]);

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
