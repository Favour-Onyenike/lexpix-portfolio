
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ContentSection {
  id: string;
  name: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function getContentSection(name: string): Promise<ContentSection | null> {
  try {
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
  } catch (error) {
    console.error('Exception fetching content section:', error);
    return null;
  }
}

export async function getAllContentSections(): Promise<ContentSection[]> {
  try {
    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching content sections:', error);
      toast.error('Could not load content sections');
      return [];
    }
    
    return data as ContentSection[];
  } catch (error) {
    console.error('Exception fetching content sections:', error);
    toast.error('Failed to connect to the database');
    return [];
  }
}

export async function updateContentSection(
  id: string, 
  updates: { title?: string; content?: string }
): Promise<{ success: boolean; error: any }> {
  console.log('Updating content section with ID:', id);
  console.log('Updates:', updates);
  
  try {
    // Check if the user is authenticated before attempting the update
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      toast.error('Authentication error. Please log in again.');
      return { 
        success: false, 
        error: { message: 'Authentication required. Please log in again.', code: 'AUTH_REQUIRED' } 
      };
    }
    
    if (!sessionData.session) {
      console.error('No active session found');
      toast.error('You must be logged in to update content');
      return { 
        success: false, 
        error: { message: 'Authentication required. Please log in again.', code: 'AUTH_REQUIRED' } 
      };
    }

    // Proceed with the update
    const { error } = await supabase
      .from('content_sections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating content section:', error);
      
      // Specific error message for permissions issues
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        toast.error('Permission denied. You may not have the right access level.');
        return { 
          success: false, 
          error: { 
            ...error, 
            message: 'Permission denied. This could be due to missing RLS policies on the content_sections table.' 
          } 
        };
      }
      
      toast.error('Failed to update content');
      return { success: false, error };
    }
    
    toast.success('Content updated successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception updating content section:', err);
    toast.error('An unexpected error occurred');
    return { success: false, error: err };
  }
}
