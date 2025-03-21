
import { supabase } from '@/lib/supabase';
import { ImageItem } from '@/components/ImageGrid';

// Define the database type
export type GalleryImage = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

// Convert from DB type to UI type
const mapToImageItem = (image: GalleryImage): ImageItem => ({
  id: image.id,
  title: image.title,
  url: image.url,
});

// Upload an image to storage
export const uploadImage = async (file: File, folder: string = 'gallery'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const result = await supabase.storage
      .from('images')
      .upload(filePath, file);
    
    // Fixed: Add proper type checking for the result
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      throw result.error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Create a new gallery image
export const createGalleryImage = async (image: { title: string, url: string }): Promise<GalleryImage | null> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([{ title: image.title, url: image.url }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return null;
  }
};

// Get all gallery images
export const getGalleryImages = async (): Promise<ImageItem[]> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select();
    
    if (error) throw error;
    
    // Sort data manually after getting it
    const sortedData = [...(data || [])].sort((a, b) => {
      if (a.created_at < b.created_at) return 1; // Descending order
      if (a.created_at > b.created_at) return -1;
      return 0;
    });
    
    return sortedData.map(mapToImageItem);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};

// Delete a gallery image
export const deleteGalleryImage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return false;
  }
};
