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
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          throw sessionError;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsAuthenticated(!!data.session);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Estado de autenticação alterado:', event);
          
          if (event === 'SIGNED_IN') {
            // Quando o usuário faz login, verificamos se precisamos criar o perfil
            if (session?.user) {
              try {
                const { data: profile, error: profileCheckError } = await supabase
                  .from('users_profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (!profile && !profileCheckError) {
                  // Perfil não existe, vamos criar
                  const { error: createProfileError } = await supabase
                    .from('users_profiles')
                    .insert({
                      user_id: session.user.id,
                      full_name: session.user.user_metadata.full_name || 'Usuário'
                    });
                    
                  if (createProfileError) {
                    console.warn('Erro ao criar perfil após confirmação:', createProfileError);
                  }
                }
              } catch (err) {
                console.warn('Erro ao verificar/criar perfil:', err);
              }
            }
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
        });
        
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

  const getBaseUrl = () => {
    if (import.meta.env.DEV) {
      return 'http://localhost:5173';
    }
    return 'https://projeto-one.lrds.me';
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Iniciando processo de login...');
      
      if (!email || !password) {
        console.log('Campos vazios detectados');
        throw new Error('Por favor, preencha todos os campos');
      }
      
      console.log('Tentando autenticar com o Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('Erro retornado pelo Supabase:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciais incorretas. Verifique seu email e senha.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Por favor, verifique sua caixa de entrada e spam.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Email inválido. Por favor, verifique o formato do email.');
        } else {
          throw error;
        }
      }

      console.log('Login bem-sucedido, atualizando estado...');
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session);
      console.log('Estado atualizado com sucesso');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.';
      console.error('Erro durante o processo de login:', err);
      setError(errorMessage);
      throw err; // Propagar o erro para que o componente possa tratá-lo
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Iniciando processo de registro...');
      
      if (!email || !password || !fullName) {
        throw new Error('Email, senha e nome completo são obrigatórios');
      }
      
      const baseUrl = getBaseUrl();
      console.log('URL base para redirecionamento:', baseUrl);
      
      console.log('Tentando registrar usuário no Supabase...');
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

      console.log('Resposta do Supabase:', { data, signUpError });

      if (signUpError) {
        console.error('Erro retornado pelo Supabase:', signUpError);
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Este email já está registrado. Tente fazer login.');
        } else {
          throw signUpError;
        }
      }
      
      if (data.user) {
        console.log('Usuário criado com sucesso, criando perfil...');
        try {
          const { error: profileError } = await supabase
            .from('users_profiles')
            .insert([
              {
                user_id: data.user.id,
                full_name: fullName,
                role: 'technician'
              }
            ]);

          if (profileError) {
            console.warn('Não foi possível criar o perfil na tabela users_profiles:', profileError);
            console.info('Os dados do usuário foram salvos nos metadados do Auth.');
          } else {
            console.log('Perfil criado com sucesso');
          }
        } catch (profileErr) {
          console.warn('Erro ao acessar a tabela users_profiles:', profileErr);
        }
        
        console.log('Processo de registro concluído com sucesso');
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
      
      if (data.email && user) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });
        
        if (emailError) throw emailError;
      }
      
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