
import { supabase } from '@/lib/supabase';

export interface AboutImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getAboutImages = async (): Promise<AboutImage[]> => {
  try {
    const { data, error } = await supabase
      .from('about_images')
      .select('*')
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching about images:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAboutImages:', error);
    throw error;
  }
};

export const updateAboutImage = async (
  id: string,
  imageFile: File,
  altText?: string
): Promise<boolean> => {
  try {
    // Upload new image to storage
    const fileName = `about-${id}-${Date.now()}.${imageFile.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    // Update database record
    const { error: updateError } = await supabase
      .from('about_images')
      .update({
        image_url: publicUrl,
        alt_text: altText,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating about image:', updateError);
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAboutImage:', error);
    throw error;
  }
};
