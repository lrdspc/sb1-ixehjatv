import { supabase } from './supabase';

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    console.log('Iniciando teste de conexão com o Supabase...');
    
    // Testa autenticação primeiro
    console.log('Testando serviço de autenticação...');
    const authResponse = await supabase.auth.getSession();
    if (authResponse.error) {
      console.error('Erro no serviço de autenticação:', authResponse.error);
      return { success: false, error: 'Erro no serviço de autenticação: ' + authResponse.error.message };
    }
    console.log('Serviço de autenticação OK');

    // Tenta fazer uma consulta simples para verificar a conexão
    console.log('Testando conexão com o banco de dados...');
    const { data, error } = await supabase.from('clients').select('id').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o banco de dados:', error);
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
