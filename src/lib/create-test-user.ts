import { supabase } from './supabase';

// Função para criar um usuário de teste
export async function createTestUser() {
  try {
    // Dados do usuário de teste
    const email = 'teste@exemplo.com';
    const password = 'senha123';
    const fullName = 'Usuário Teste';
    
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
    
    // Se o usuário foi criado com sucesso, criar o perfil na tabela users_profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users_profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          full_name: fullName
        });
      
      if (profileError) {
        console.error('Erro ao criar perfil do usuário:', profileError);
        return { success: false, error: profileError.message };
      }
    }
    
    console.log('Usuário de teste criado com sucesso!');
    return { 
      success: true, 
      user: { email, password, fullName }
    };
  } catch (err) {
    console.error('Exceção ao criar usuário de teste:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido ao criar usuário de teste' 
    };
  }
}
