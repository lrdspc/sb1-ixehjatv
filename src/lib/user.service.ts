import { supabase, setSupabaseToken } from './supabase';
import { Database } from './database.types';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

type Profile = Database['public']['Tables']['users_profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['users_profiles']['Insert'];

/**
 * Hook para obter o token JWT do Clerk para o Supabase
 */
export function useSupabaseToken() {
  const { getToken } = useClerkAuth();
  
  const getSupabaseToken = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (token) {
        await setSupabaseToken(token);
      }
      return token;
    } catch (error) {
      console.error('Erro ao obter token para Supabase:', error);
      return null;
    }
  };
  
  return { getSupabaseToken };
}

/**
 * Sincroniza o perfil do usuário no Supabase com os dados do Clerk
 */
export async function syncUserProfile(userId: string, userData: {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<Profile | null> {
  try {
    // Verificar se o perfil já existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = Nenhum resultado encontrado
      console.error('Erro ao buscar perfil:', fetchError);
      return null;
    }

    if (existingProfile) {
      // Atualizar perfil existente
      const profileData: Partial<Profile> = {
        full_name: userData.fullName || null,
        avatar_url: userData.avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users_profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return null;
      }

      return data;
    } else {
      // Criar novo perfil
      const profileData: ProfileInsert = {
        id: userId,
        user_id: userId,
        full_name: userData.fullName || null,
        avatar_url: userData.avatarUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exceção ao sincronizar perfil:', error);
    return null;
  }
}

/**
 * Obtém o perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao obter perfil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exceção ao obter perfil:', error);
    return null;
  }
}

/**
 * Atualiza o perfil do usuário
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exceção ao atualizar perfil:', error);
    return null;
  }
}