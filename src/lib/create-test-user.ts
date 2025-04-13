import { supabase } from './supabase';

// Função para criar um usuário de teste
export async function createTestUser() {
  try {
    // Dados do usuário de teste
    const email = 'teste@exemplo.com';
    const password = 'senha123';
    const fullName = 'Usuário Teste';
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (existingUser && existingUser.user) {
      console.log('Usuário já existe, retornando credenciais');
      return { 
        success: true, 
        user: { email, password, fullName },
        message: 'Usuário já existe. Use as credenciais fornecidas para fazer login.'
      };
    }
    
    // Registrar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return { success: false, error: authError.message };
    }
    
    // Se o usuário foi criado com sucesso, tentar criar o perfil na tabela users_profiles
    if (authData.user) {
      try {
        // Verificar se a tabela users_profiles existe
        const { error: checkTableError } = await supabase
          .from('users_profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!checkTableError) {
          // A tabela existe, podemos inserir o perfil
          const { error: profileError } = await supabase
            .from('users_profiles')
            .insert({
              id: authData.user.id,
              user_id: authData.user.id,
              full_name: fullName
            });
          
          if (profileError) {
            console.warn('Aviso: Erro ao criar perfil do usuário:', profileError);
            // Não falharemos aqui, apenas registramos o aviso
          }
        } else {
          console.warn('Aviso: Tabela users_profiles não existe ou não está acessível');
        }
      } catch (profileErr) {
        console.warn('Exceção ao criar perfil:', profileErr);
        // Não falharemos aqui, apenas registramos o aviso
      }
    }
    
    // Mesmo que haja erro no perfil, retornamos sucesso se o usuário foi criado
    console.log('Usuário de teste criado com sucesso!');
    return { 
      success: true, 
      user: { email, password, fullName },
      message: authData.session ? 'Usuário criado e autenticado com sucesso!' : 'Usuário criado! Verifique seu email para confirmar o registro.'
    };
  } catch (err) {
    console.error('Exceção ao criar usuário de teste:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido ao criar usuário de teste' 
    };
  }
}
