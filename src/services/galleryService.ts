
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

// Upload an image to Supabase Storage
export const uploadImage = async (file: File, folder: string = 'gallery'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('images')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      throw uploadError;
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
      .select('*')
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
    // First, get the image URL to delete from storage
    const { data: image } = await supabase
      .from('gallery_images')
      .select('url')
      .eq('id', id)
      .single();
    
    if (image?.url) {
      // Extract path from the URL
      const urlPath = new URL(image.url).pathname;
      const storagePath = urlPath.split('/').slice(2).join('/'); // Remove /storage/v1/object/public/
      
      // Delete from storage
      await supabase.storage
        .from('images')
        .remove([storagePath]);
    }
    
    // Delete from database
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
