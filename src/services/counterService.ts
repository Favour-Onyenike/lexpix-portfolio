import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Counter = Tables<'counters'>;
export type CounterInsert = TablesInsert<'counters'>;
export type CounterUpdate = TablesUpdate<'counters'>;

export const counterService = {
  async getCounters() {
    const { data, error } = await supabase
      .from('counters')
      .select('*')
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching counters:', error);
      throw error;
    }
    
    return data;
  },

  async updateCounter(id: string, updates: CounterUpdate) {
    const { data, error } = await supabase
      .from('counters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating counter:', error);
      throw error;
    }
    
    return data;
  },

  async createCounter(counter: CounterInsert) {
    const { data, error } = await supabase
      .from('counters')
      .insert(counter)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating counter:', error);
      throw error;
    }
    
    return data;
  },

  async deleteCounter(id: string) {
    const { error } = await supabase
      .from('counters')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting counter:', error);
      throw error;
    }
  }
};