
import { supabase } from '@/lib/supabase';

export type FeaturedProjectImage = {
  id: string;
  project_id: string;
  title: string;
  url: string;
  sort_order: number;
  created_at: string;
};

// Get all images for a specific featured project
export const getFeaturedProjectImages = async (projectId: string): Promise<FeaturedProjectImage[]> => {
  try {
    const { data, error } = await supabase
      .from('featured_project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
      
    if (error) {
      console.error('Error fetching featured project images:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFeaturedProjectImages:', error);
    return [];
  }
};

// Add a new image to a featured project
export const addFeaturedProjectImage = async (
  projectId: string, 
  title: string, 
  url: string,
  sortOrder?: number
): Promise<FeaturedProjectImage | null> => {
  try {
    // If no sort order provided, get the next available one
    if (sortOrder === undefined) {
      const { data: existingImages } = await supabase
        .from('featured_project_images')
        .select('sort_order')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      sortOrder = existingImages && existingImages.length > 0 
        ? existingImages[0].sort_order + 1 
        : 0;
    }

    const { data, error } = await supabase
      .from('featured_project_images')
      .insert({
        project_id: projectId,
        title,
        url,
        sort_order: sortOrder
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding featured project image:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addFeaturedProjectImage:', error);
    return null;
  }
};

// Delete an image from a featured project
export const deleteFeaturedProjectImage = async (imageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('featured_project_images')
      .delete()
      .eq('id', imageId);
      
    if (error) {
      console.error('Error deleting featured project image:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFeaturedProjectImage:', error);
    return false;
  }
};

// Reorder images within a featured project
export const reorderFeaturedProjectImages = async (imageIds: string[]): Promise<boolean> => {
  try {
    const updates = imageIds.map((id, index) => ({
      id,
      sort_order: index,
      // Add dummy values for required fields (won't be used in upsert)
      project_id: '',
      title: '',
      url: ''
    }));
    
    const { error } = await supabase
      .from('featured_project_images')
      .upsert(updates, {
        onConflict: 'id'
      });
      
    if (error) {
      console.error('Error reordering featured project images:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in reorderFeaturedProjectImages:', error);
    return false;
  }
};
