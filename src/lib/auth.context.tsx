import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { fullName?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Função para inicializar a autenticação
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Obter sessão inicial
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          throw sessionError;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsAuthenticated(!!data.session);
        
        // Configurar listener para mudanças de estado de autenticação
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('Estado de autenticação alterado:', _event);
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
        });
        
        // Marcar autenticação como inicializada
        setAuthInitialized(true);
        
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err);
        setError('Erro ao inicializar autenticação');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Função para obter a URL base do aplicativo (sempre a URL de produção)
  const getBaseUrl = () => {
    // Sempre usar a URL de produção para redirecionamentos
    return window.location.origin;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Traduzir mensagens de erro comuns
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciais inválidas. Verifique seu email e senha.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        } else {
          throw error;
        }
      }
      
      // Atualizar estado após login bem-sucedido
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Validar entrada
      if (!email || !password || !fullName) {
        throw new Error('Email, senha e nome completo são obrigatórios');
      }
      
      const baseUrl = getBaseUrl();
      
      // Registrar o usuário no Supabase Auth com os dados do perfil nos metadados
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/login`,
          data: {
            full_name: fullName,
            role: 'technician'
          }
        }
      });

      if (signUpError) {
        // Traduzir mensagens de erro comuns
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Este email já está registrado. Tente fazer login.');
        } else {
          throw signUpError;
        }
      }
      
      if (data.user) {
        try {
          // Tentar criar perfil do usuário na tabela users_profiles
          const { error: profileError } = await supabase
            .from('users_profiles')
            .insert([
              {
                user_id: data.user.id,
                full_name: fullName,
                role: 'technician'
              }
            ]);

          // Se houver erro na criação do perfil, apenas registrar no console
          // mas não impedir o registro do usuário, já que os dados estão nos metadados
          if (profileError) {
            console.warn('Não foi possível criar o perfil na tabela users_profiles:', profileError);
            console.info('Os dados do usuário foram salvos nos metadados do Auth.');
          }
        } catch (profileErr) {
          console.warn('Erro ao acessar a tabela users_profiles:', profileErr);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Falha ao criar usuário' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
      console.error('Erro de registro:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar estado após logout
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
      console.error('Erro de logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!email) {
        throw new Error('Email é obrigatório');
      }
      
      const baseUrl = getBaseUrl();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      console.error('Erro de recuperação de senha:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!newPassword) {
        throw new Error('Nova senha é obrigatória');
      }
      
      if (newPassword.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar senha';
      setError(errorMessage);
      console.error('Erro de atualização de senha:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { fullName?: string; email?: string }) => {
    try {
      setError(null);
      setLoading(true);
      
      // Se tiver email para atualizar
      if (data.email && user) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });
        
        if (emailError) throw emailError;
      }
      
      // Se tiver nome para atualizar
      if (data.fullName && user) {
        const { error: profileError } = await supabase
          .from('users_profiles')
          .update({ full_name: data.fullName })
          .eq('user_id', user.id);
        
        if (profileError) throw profileError;
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      console.error('Erro de atualização de perfil:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Só renderizar os filhos quando a autenticação estiver inicializada
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword, 
      updatePassword, 
      updateProfile, 
      loading, 
      error,
      isAuthenticated
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