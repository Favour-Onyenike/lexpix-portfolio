
import { supabase } from '@/lib/supabase';

export interface ContentSection {
  id: string;
  name: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function getContentSection(name: string): Promise<ContentSection | null> {
  const { data, error } = await supabase
    .from('content_sections')
    .select('*')
    .eq('name', name)
    .single();
    
  if (error) {
    console.error('Error fetching content section:', error);
    return null;
  }
  
  return data as ContentSection;
}

export async function getAllContentSections(): Promise<ContentSection[]> {
  const { data, error } = await supabase
    .from('content_sections')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching content sections:', error);
    return [];
  }
  
  return data as ContentSection[];
}

export async function updateContentSection(
  id: string, 
  updates: { title?: string; content?: string }
): Promise<{ success: boolean; error: any }> {
  console.log('Updating content section with ID:', id);
  console.log('Updates:', updates);
  
  try {
    const { error } = await supabase
      .from('content_sections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating content section:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception updating content section:', err);
    return { success: false, error: err };
  }
}
