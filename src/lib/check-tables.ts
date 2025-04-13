import { supabase } from './supabase';

// Função para listar todas as tabelas no esquema public
export async function listTables() {
  try {
    // Consulta para listar todas as tabelas no esquema public
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Erro ao listar tabelas:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Tabelas encontradas:', data);
    return { success: true, tables: data };
  } catch (err) {
    console.error('Exceção ao listar tabelas:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido ao listar tabelas' 
    };
  }
}

// Função para verificar se uma tabela específica existe e tem registros
export async function checkTable(tableName: string) {
  try {
    // Consulta para contar registros em uma tabela
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Erro ao verificar tabela ${tableName}:`, error);
      return { success: false, error: error.message };
    }
    
    console.log(`Tabela ${tableName} encontrada com ${count} registros`);
    return { success: true, count };
  } catch (err) {
    console.error(`Exceção ao verificar tabela ${tableName}:`, err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : `Erro desconhecido ao verificar tabela ${tableName}` 
    };
  }
}

// Função para inserir um cliente de teste
export async function insertTestClient() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: 'Cliente Teste',
        type: 'Comercial',
        address: 'Rua de Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        contact_name: 'João Teste',
        contact_phone: '(11) 98765-4321',
        contact_email: 'joao@teste.com'
      })
      .select();
    
    if (error) {
      console.error('Erro ao inserir cliente de teste:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Cliente de teste inserido com sucesso:', data);
    return { success: true, client: data[0] };
  } catch (err) {
    console.error('Exceção ao inserir cliente de teste:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido ao inserir cliente de teste' 
    };
  }
}
