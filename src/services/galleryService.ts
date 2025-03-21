
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

// Initialize gallery table if it doesn't exist
const initializeLocalGallery = () => {
  if (!localStorage.getItem('supabase_gallery_images')) {
    localStorage.setItem('supabase_gallery_images', JSON.stringify([]));
  }
};

// Upload an image to storage
export const uploadImage = async (file: File, folder: string = 'gallery'): Promise<string | null> => {
  try {
    initializeLocalGallery();
    
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
    initializeLocalGallery();
    
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
    initializeLocalGallery();
    
    const { data, error } = await supabase
      .from('gallery_images')
      .select()
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapToImageItem);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};

// Delete a gallery image
export const deleteGalleryImage = async (id: string): Promise<boolean> => {
  try {
    initializeLocalGallery();
    
    await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return false;
  }
};
