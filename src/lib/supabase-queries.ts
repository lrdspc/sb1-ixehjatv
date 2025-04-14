import { supabase } from './supabase';
import { Inspection, InsertInspection, UpdateInspection } from '../types/inspections';

export const inspectionQueries = {
  async getAll() {
    return await supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async getById(id: string) {
    return await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .single();
  },

  async create(inspection: InsertInspection) {
    return await supabase
      .from('inspections')
      .insert(inspection)
      .select()
      .single();
  },

  async update(id: string, updates: UpdateInspection) {
    return await supabase
      .from('inspections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async getByClientId(clientId: string) {
    return await supabase
      .from('inspections')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
  }
};
