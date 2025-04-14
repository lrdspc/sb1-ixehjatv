import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou chave anônima não configuradas. Verifique seu arquivo .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'brasilit-auth-token',
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'brasilit-inspection-app'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Função para verificar a conexão com o Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao conectar com Supabase:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exceção ao verificar conexão com Supabase:', err);
    return false;
  }
}

// Função para verificar se o usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}