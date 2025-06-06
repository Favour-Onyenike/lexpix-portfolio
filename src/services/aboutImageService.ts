
import { supabase } from '@/integrations/supabase/client';

export interface AboutImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const aboutImageService = {
  async getAboutImages(): Promise<AboutImage[]> {
    const { data, error } = await supabase
      .from('about_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching about images:', error);
      throw error;
    }

    return data || [];
  },

  async createAboutImage(imageData: {
    image_url: string;
    alt_text?: string;
    sort_order: number;
  }): Promise<AboutImage> {
    const { data, error } = await supabase
      .from('about_images')
      .insert([imageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating about image:', error);
      throw error;
    }

    return data;
  },

  async updateAboutImage(id: string, updates: {
    image_url?: string;
    alt_text?: string;
    sort_order?: number;
  }): Promise<AboutImage> {
    const { data, error } = await supabase
      .from('about_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating about image:', error);
      throw error;
    }

    return data;
  },

  async deleteAboutImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('about_images')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting about image:', error);
      throw error;
    }
  }
};
