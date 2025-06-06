
import { supabase } from '@/lib/supabase';

export interface PricingCard {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const pricingService = {
  async getPricingCards() {
    const { data, error } = await supabase
      .from('pricing_cards')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching pricing cards:', error);
      throw error;
    }
    
    return data;
  },

  async createPricingCard(card: Omit<PricingCard, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pricing_cards')
      .insert([card])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating pricing card:', error);
      throw error;
    }
    
    return data;
  },

  async updatePricingCard(id: string, updates: Partial<Omit<PricingCard, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('pricing_cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating pricing card:', error);
      throw error;
    }
    
    return data;
  },

  async deletePricingCard(id: string) {
    const { error } = await supabase
      .from('pricing_cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting pricing card:', error);
      throw error;
    }
  }
};
