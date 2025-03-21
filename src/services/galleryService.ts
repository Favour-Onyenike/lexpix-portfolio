
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

// Mock gallery data in localStorage
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
    
    const { error: uploadError } = await supabase.storage
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
    initializeLocalGallery();
    
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([{ title: image.title, url: image.url }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the galleryData for the UI
    const galleryData = JSON.parse(localStorage.getItem('galleryData') || '{"images":[]}');
    galleryData.images.push({
      id: data.id,
      title: data.title,
      url: data.url
    });
    localStorage.setItem('galleryData', JSON.stringify(galleryData));
    
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
    
    // First check if we have data in the localStorage UI cache
    const galleryData = localStorage.getItem('galleryData');
    if (galleryData) {
      const parsedData = JSON.parse(galleryData);
      if (parsedData.images && parsedData.images.length > 0) {
        return parsedData.images;
      }
    }
    
    // If not in UI cache, get from our mock database
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const images = (data || []).map(mapToImageItem);
    
    // Update the UI cache
    localStorage.setItem('galleryData', JSON.stringify({ images }));
    
    return images;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};

// Delete a gallery image
export const deleteGalleryImage = async (id: string): Promise<boolean> => {
  try {
    initializeLocalGallery();
    
    // First, update the UI cache
    const galleryData = JSON.parse(localStorage.getItem('galleryData') || '{"images":[]}');
    const imageToDelete = galleryData.images.find((img: ImageItem) => img.id === id);
    galleryData.images = galleryData.images.filter((img: ImageItem) => img.id !== id);
    localStorage.setItem('galleryData', JSON.stringify(galleryData));
    
    // Then, delete from our mock database
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    // If the image URL is a blob URL, revoke it
    if (imageToDelete && imageToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.url);
    }
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return false;
  }
};
