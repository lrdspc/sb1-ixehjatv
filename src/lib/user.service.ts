import { supabase } from './supabase';
import { Database } from './database.types';

type Profile = Database['public']['Tables']['users_profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['users_profiles']['Insert'];

/**
 * Sincroniza o perfil do usuário no Supabase
 */
export async function sync_user_profile(user_id: string, user_data: {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}): Promise<Profile | null> {
  try {
    // Verificar se o perfil já existe
    const { data: existing_profile, error: fetch_error } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (fetch_error && fetch_error.code !== 'PGRST116') { // PGRST116 = Nenhum resultado encontrado
      console.error('Erro ao buscar perfil:', fetch_error);
      return null;
    }

    if (existing_profile) {
      // Atualizar perfil existente
      const profile_data: Partial<Profile> = {
        full_name: user_data.full_name || existing_profile.full_name,
        avatar_url: user_data.avatar_url || existing_profile.avatar_url,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users_profiles')
        .update(profile_data)
        .eq('id', user_id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return null;
      }

      return data;
    } else {
      // Criar novo perfil
      const profile_data: ProfileInsert = {
        id: user_id,
        user_id: user_id,
        full_name: user_data.full_name || null,
        avatar_url: user_data.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users_profiles')
        .insert(profile_data)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return data;
    }
  } catch (err) {
    console.error('Erro ao sincronizar perfil:', err);
    return null;
  }
}

/**
 * Obtém o perfil do usuário
 */
export async function get_user_profile(user_id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (error) {
      console.error('Erro ao obter perfil:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Erro ao obter perfil:', err);
    return null;
  }
}

/**
 * Atualiza o perfil do usuário
 */
export async function update_user_profile(
  user_id: string, 
  updates: Partial<Profile>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('users_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return null;
  }
}