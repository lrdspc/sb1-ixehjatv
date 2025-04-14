import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Obter variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou chave anônima não configuradas. Verifique seu arquivo .env');
}

// Criar o cliente Supabase com configurações otimizadas
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Não persistir sessão, pois usamos Clerk
    autoRefreshToken: false // Não atualizar tokens automaticamente
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'brasilit-inspection-app'
    },
    fetch: fetch.bind(globalThis)
  },
  db: {
    schema: 'public'
  }
});

// Função para definir o token JWT do Clerk no Supabase
export async function setSupabaseToken(token: string | null) {
  if (token) {
    // Definir o token JWT do Clerk como header de autorização para o Supabase
    supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    });
  }
}

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

// Função auxiliar para lidar com erros do Supabase
export function handleSupabaseError(error: unknown, message = 'Erro na operação'): never {
  console.error(`${message}:`, error);
  throw new Error(`${message}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
}