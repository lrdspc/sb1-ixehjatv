import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  is_authenticated: boolean;
  loading: boolean;
  sign_in: (email: string, password: string) => Promise<void>;
  sign_up: (email: string, password: string) => Promise<void>;
  sign_out: () => Promise<void>;
  reset_password: (email: string) => Promise<void>;
  update_user_password: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, set_user] = useState<User | null>(null);
  const [loading, set_loading] = useState(true);
  const [is_authenticated, set_is_authenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set_user(user);
      set_is_authenticated(!!user);
      set_loading(false);
    });

    return unsubscribe;
  }, []);

  const sign_in = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const sign_up = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const sign_out = async () => {
    await signOut(auth);
    set_user(null);
    set_is_authenticated(false);
  };

  const reset_password = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const update_user_password = async (password: string) => {
    if (!user) throw new Error('Nenhum usuário autenticado');
    await updatePassword(user, password);
  };

  const value = {
    user,
    is_authenticated,
    loading,
    sign_in,
    sign_up,
    sign_out,
    reset_password,
    update_user_password
  };

  return (
    <AuthContext.Provider value={value}>
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
