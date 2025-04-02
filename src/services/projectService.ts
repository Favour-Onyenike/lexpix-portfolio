
import { supabase } from '@/lib/supabase';

export type FeaturedProject = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
};

// Get all featured projects
export const getFeaturedProjects = async (): Promise<FeaturedProject[]> => {
  try {
    // Use the generic version of from() to specify the return type
    const { data, error } = await supabase
      .from('featured_projects')
      .select('*')
      .order('sort_order', { ascending: true }) as { 
        data: FeaturedProject[] | null; 
        error: any; 
      };
      
    if (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
    
    return (data || []) as FeaturedProject[];
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    return [];
  }
};

// Get a single featured project by ID
export const getFeaturedProject = async (id: string): Promise<FeaturedProject | null> => {
  try {
    const { data, error } = await supabase
      .from('featured_projects')
      .select('*')
      .eq('id', id)
      .single() as {
        data: FeaturedProject | null;
        error: any;
      };
      
    if (error) {
      console.error('Error fetching featured project:', error);
      throw error;
    }
    
    return data as FeaturedProject;
  } catch (error) {
    console.error('Error in getFeaturedProject:', error);
    return null;
  }
};

// Create a new featured project
export const createFeaturedProject = async (project: Omit<FeaturedProject, 'id'>): Promise<FeaturedProject | null> => {
  try {
    const { data, error } = await supabase
      .from('featured_projects')
      .insert([project])
      .select()
      .single() as {
        data: FeaturedProject | null;
        error: any;
      };
      
    if (error) {
      console.error('Error creating featured project:', error);
      throw error;
    }
    
    return data as FeaturedProject;
  } catch (error) {
    console.error('Error in createFeaturedProject:', error);
    return null;
  }
};

// Update an existing featured project
export const updateFeaturedProject = async (id: string, updates: Partial<FeaturedProject>): Promise<FeaturedProject | null> => {
  try {
    const { data, error } = await supabase
      .from('featured_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as {
        data: FeaturedProject | null;
        error: any;
      };
      
    if (error) {
      console.error('Error updating featured project:', error);
      throw error;
    }
    
    return data as FeaturedProject;
  } catch (error) {
    console.error('Error in updateFeaturedProject:', error);
    return null;
  }
};

// Delete a featured project
export const deleteFeaturedProject = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('featured_projects')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting featured project:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFeaturedProject:', error);
    return false;
  }
};

// Reorder featured projects
export const reorderFeaturedProjects = async (projectIds: string[]): Promise<boolean> => {
  try {
    // Create a batch of updates
    const updates = projectIds.map((id, index) => ({
      id,
      sort_order: index,
      // Add required fields with dummy values for TypeScript
      // These won't actually be used in the upsert operation because we specify onConflict
      title: '',
      description: '', 
      image_url: '',
      link: ''
    }));
    
    // Use upsert to update the sort_order for each project
    const { error } = await supabase
      .from('featured_projects')
      .upsert(updates, {
        onConflict: 'id'
      });
      
    if (error) {
      console.error('Error reordering projects:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in reorderFeaturedProjects:', error);
    return false;
  }
};
