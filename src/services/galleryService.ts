
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

// Enhanced URL validation with proper timeout handling
export const checkImageUrlValidity = async (url: string): Promise<boolean> => {
  try {
    // First check if URL is properly formatted
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.startsWith('image/') || false);
  } catch (error) {
    console.error('Error checking image URL validity:', error);
    return false;
  }
};

// Upload an image to storage
export const uploadImage = async (file: File, folder: string = 'gallery'): Promise<string | null> => {
  try {
    // Check storage limit before upload
    const { checkStorageLimit } = await import('./storageService');
    const storageCheck = await checkStorageLimit(file.size);
    
    if (!storageCheck.canUpload) {
      throw new Error(`Storage limit exceeded. You're using ${storageCheck.percentUsed.toFixed(1)}% of your 600MB limit. Please delete some images or compress existing ones to free up space.`);
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    // Make sure the storage bucket exists
    try {
      const { data: bucketExists } = await supabase.storage.getBucket('images');
      if (!bucketExists) {
        await supabase.storage.createBucket('images', { public: true });
        console.log('Created images bucket');
      }
    } catch (bucketError) {
      console.log('Creating images bucket');
      await supabase.storage.createBucket('images', { public: true });
    }
    
    // Upload the file
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file);
    
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error; // Re-throw to let the calling component handle the error message
  }
};

// Create a new gallery image with validation
export const createGalleryImage = async (image: { title: string, url: string }): Promise<GalleryImage | null> => {
  try {
    // Validate URL before saving
    if (!image.url || !image.url.trim()) {
      console.error('Empty URL provided');
      return null;
    }

    try {
      new URL(image.url);
    } catch (error) {
      console.error('Invalid URL format:', image.url);
      return null;
    }

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

// Get all gallery images with better error handling
export const getGalleryImages = async (): Promise<ImageItem[]> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error in getGalleryImages:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No gallery images found');
      return [];
    }

    console.log('Gallery images retrieved:', data.length);
    
    // Filter out any images with invalid URLs
    const validImages = data.filter(image => {
      try {
        new URL(image.url);
        return true;
      } catch {
        console.warn('Filtering out image with invalid URL:', image.url);
        return false;
      }
    });
    
    console.log('Valid images after filtering:', validImages.length);
    return validImages.map(mapToImageItem);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};

// Delete a gallery image from both database and storage
export const deleteGalleryImage = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting gallery image:', id);
    
    // First, get the image to access the URL
    const { data: image, error: fetchError } = await supabase
      .from('gallery_images')
      .select('url')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching image for deletion:', fetchError);
      throw fetchError;
    }
    
    // Delete from storage
    if (image?.url) {
      try {
        // Extract file path from URL
        const url = new URL(image.url);
        const filePath = url.pathname.split('/storage/v1/object/public/images/')[1];
        
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('images')
            .remove([filePath]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', filePath, storageError);
          } else {
            console.log('Deleted image from storage:', filePath);
          }
        }
      } catch (parseError) {
        console.error('Error parsing image URL:', image.url, parseError);
      }
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting image from database:', deleteError);
      throw deleteError;
    }
    
    console.log('Gallery image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return false;
  }
};

// Clean up orphaned gallery images (database records that point to deleted storage files)
export const cleanupOrphanedGalleryImages = async (): Promise<{ deletedCount: number; failedIds: string[] }> => {
  try {
    console.log('Starting cleanup of orphaned gallery images...');
    
    const { data: galleryImages, error: fetchError } = await supabase
      .from('gallery_images')
      .select('id, url');
    
    if (fetchError) {
      console.error('Error fetching gallery images:', fetchError);
      return { deletedCount: 0, failedIds: [] };
    }
    
    if (!galleryImages) {
      return { deletedCount: 0, failedIds: [] };
    }
    
    let deletedCount = 0;
    const failedIds: string[] = [];
    
    for (const image of galleryImages) {
      try {
        // Check if this is a Supabase storage URL
        if (image.url && image.url.includes('/storage/v1/object/public/images/')) {
          // Extract file path from URL
          const url = new URL(image.url);
          const filePath = url.pathname.split('/storage/v1/object/public/images/')[1];
          
          if (filePath) {
            // Check if file exists in storage
            const { data: fileData, error: fileError } = await supabase.storage
              .from('images')
              .list(filePath.split('/')[0], {
                search: filePath.split('/')[1]
              });
            
            // If file doesn't exist in storage, delete the database record
            if (fileError || !fileData || fileData.length === 0) {
              const { error: deleteError } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', image.id);
              
              if (deleteError) {
                console.error(`Failed to delete orphaned record ${image.id}:`, deleteError);
                failedIds.push(image.id);
              } else {
                console.log(`Deleted orphaned gallery image record: ${image.id}`);
                deletedCount++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing image ${image.id}:`, error);
        failedIds.push(image.id);
      }
    }
    
    console.log(`Cleanup completed. Deleted ${deletedCount} orphaned records.`);
    return { deletedCount, failedIds };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return { deletedCount: 0, failedIds: [] };
  }
};

// Delete all images larger than specified size from both storage and database
export const deleteLargeImagesFromGallery = async (sizeThresholdMB: number = 10): Promise<{ storageDeleted: number; databaseDeleted: number; errors: string[] }> => {
  try {
    console.log(`Starting deletion of images larger than ${sizeThresholdMB}MB...`);
    
    // First, delete large files from storage
    const { deleteLargeFiles } = await import('./storageService');
    const { deletedCount: storageDeleted, failedFiles } = await deleteLargeFiles(sizeThresholdMB);
    
    // Then, clean up orphaned database records
    const { deletedCount: databaseDeleted, failedIds } = await cleanupOrphanedGalleryImages();
    
    const errors = [
      ...failedFiles.map(file => `Failed to delete file: ${file}`),
      ...failedIds.map(id => `Failed to delete database record: ${id}`)
    ];
    
    console.log(`Deletion completed. Storage: ${storageDeleted}, Database: ${databaseDeleted}`);
    
    return {
      storageDeleted,
      databaseDeleted,
      errors
    };
  } catch (error) {
    console.error('Error deleting large images:', error);
    return {
      storageDeleted: 0,
      databaseDeleted: 0,
      errors: [`General error: ${error}`]
    };
  }
};
