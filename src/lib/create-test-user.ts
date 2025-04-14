import { supabase } from './supabase';

export async function createTestUser() {
  try {
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
    
    // Retornamos sucesso mesmo sem criar o perfil ainda, pois isso será feito após confirmação do email
    console.log('Usuário de teste criado com sucesso!');
    return { 
      success: true, 
      user: { email, password, fullName },
      message: 'Usuário criado! Verifique seu email para confirmar o registro.'
    };
    
  } catch (err) {
    console.error('Exceção ao criar usuário de teste:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido ao criar usuário de teste' 
    };
  }
}
