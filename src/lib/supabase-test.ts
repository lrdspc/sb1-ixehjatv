import { supabase } from './supabase';

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    // Tenta fazer uma consulta simples para verificar a conexão
    const { data, error } = await supabase.from('clients').select('id').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    return { success: true, data };
  } catch (err) {
    console.error('Exceção ao conectar com o Supabase:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido ao conectar com o Supabase' 
    };
  }
}
