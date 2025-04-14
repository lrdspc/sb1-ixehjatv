import { useState, useCallback } from 'react';
import { inspectionQueries } from '../lib/supabase-queries';
import { handleError } from '../lib';
import { Inspection, InsertInspection, UpdateInspection } from '../types/inspections';

export function useInspections() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await inspectionQueries.getAll();
      
      if (error) throw error;
      
      return data as Inspection[];
    } catch (err) {
      const message = handleError(err, 'Erro ao buscar vistorias');
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getInspectionById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await inspectionQueries.getById(id);
      
      if (error) throw error;
      
      return data as Inspection;
    } catch (err) {
      const message = handleError(err, 'Erro ao buscar vistoria');
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInspection = useCallback(async (inspection: InsertInspection) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await inspectionQueries.create(inspection);
      
      if (error) throw error;
      
      return data as Inspection;
    } catch (err) {
      const message = handleError(err, 'Erro ao criar vistoria');
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInspection = useCallback(async (id: string, updates: UpdateInspection) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await inspectionQueries.update(id, updates);
      
      if (error) throw error;
      
      return data as Inspection;
    } catch (err) {
      const message = handleError(err, 'Erro ao atualizar vistoria');
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInspectionsByClientId = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await inspectionQueries.getByClientId(clientId);
      
      if (error) throw error;
      
      return data as Inspection[];
    } catch (err) {
      const message = handleError(err, 'Erro ao buscar vistorias do cliente');
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInspections,
    getInspectionById,
    createInspection,
    updateInspection,
    getInspectionsByClientId
  };
}