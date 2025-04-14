import { useCallback, useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuth } from '../lib/auth.context';

export function useSupabase() {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Verificar conexão com o Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id')
          .limit(1);
        
        setIsConnected(error ? false : true);
      } catch (err) {
        console.error('Erro ao verificar conexão com o Supabase:', err);
        setIsConnected(false);
      }
    };

    if (isAuthenticated) {
      checkConnection();
    }
  }, [isAuthenticated]);

  // Função genérica para buscar dados
  const fetchData = useCallback(async <T>(
    table: string, 
    options?: { 
      columns?: string, 
      filter?: Record<string, any>, 
      orderBy?: string, 
      limit?: number 
    }
  ): Promise<T[]> => {
    if (!isAuthenticated) {
      return [];
    }

    try {
      let query = supabase
        .from(table)
        .select(options?.columns || '*');

      // Aplicar filtros se fornecidos
      if (options?.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          query = query.eq(key, value);
        }
      }

      // Aplicar ordenação
      if (options?.orderBy) {
        query = query.order(options.orderBy);
      }

      // Aplicar limite
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, `Erro ao buscar dados da tabela ${table}`);
      }

      return (data as T[]) || [];
    } catch (error) {
      handleSupabaseError(error, `Exceção ao buscar dados da tabela ${table}`);
    }
  }, [isAuthenticated]);

  // Função genérica para inserir dado
  const insertData = useCallback(async <T>(
    table: string,
    data: Record<string, any>
  ): Promise<T> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `Erro ao inserir dados na tabela ${table}`);
      }

      return result as T;
    } catch (error) {
      handleSupabaseError(error, `Exceção ao inserir dados na tabela ${table}`);
    }
  }, [isAuthenticated]);

  // Função genérica para atualizar dado
  const updateData = useCallback(async <T>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<T> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, `Erro ao atualizar dados na tabela ${table}`);
      }

      return result as T;
    } catch (error) {
      handleSupabaseError(error, `Exceção ao atualizar dados na tabela ${table}`);
    }
  }, [isAuthenticated]);

  // Função genérica para excluir dado
  const deleteData = useCallback(async (
    table: string,
    id: string
  ): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, `Erro ao excluir dados da tabela ${table}`);
      }
    } catch (error) {
      handleSupabaseError(error, `Exceção ao excluir dados da tabela ${table}`);
    }
  }, [isAuthenticated]);

  // Função para upload de arquivo
  const uploadFile = useCallback(async (
    bucket: string,
    path: string,
    file: File,
    options?: { contentType?: string, upsert?: boolean }
  ): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: options?.contentType,
          upsert: options?.upsert || false
        });

      if (error) {
        handleSupabaseError(error, 'Erro ao fazer upload do arquivo');
      }

      // Retorna o caminho completo do arquivo
      return `${supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl}`;
    } catch (error) {
      handleSupabaseError(error, 'Exceção ao fazer upload do arquivo');
    }
  }, [isAuthenticated]);

  return {
    isConnected,
    fetchData,
    insertData,
    updateData,
    deleteData,
    uploadFile,
    supabase
  };
} 