import { supabase } from '@/lib/supabase';
import { EventItem } from '@/components/EventCard';
import { ImageItem } from '@/components/ImageGrid';
import { uploadImage } from './galleryService';

// Database types
export type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  cover_image: string;
  created_at: string;
  image_count: number;
};

export type EventImage = {
  id: string;
  event_id: string;
  title: string;
  url: string;
  created_at: string;
};

// Map DB event to UI event
const mapToEventItem = (event: Event): EventItem => ({
  id: event.id,
  title: event.title,
  description: event.description || '',
  date: event.date,
  coverImage: event.cover_image,
  imageCount: event.image_count || 0,
});

// Map DB event image to UI image
const mapToImageItem = (image: EventImage): ImageItem => ({
  id: image.id,
  title: image.title,
  url: image.url,
});

// Helper function to update event image count based on actual database records
const updateEventImageCount = async (eventId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('event_images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error counting event images:', error);
      return 0;
    }
    
    const actualCount = count || 0;
    
    // Update the event's image_count field
    const { error: updateError } = await supabase
      .from('events')
      .update({ image_count: actualCount })
      .eq('id', eventId);
    
    if (updateError) {
      console.error('Error updating event image count:', updateError);
    } else {
      console.log(`Updated event ${eventId} image count to ${actualCount}`);
    }
    
    return actualCount;
  } catch (error) {
    console.error('Error in updateEventImageCount:', error);
    return 0;
  }
};

// Get all events with corrected image counts
export const getEvents = async (): Promise<EventItem[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error in getEvents:', error);
      throw error;
    }
    
    console.log('Events retrieved:', data?.length || 0);
    
    // Update image counts for all events to ensure accuracy
    if (data && data.length > 0) {
      for (const event of data) {
        const actualCount = await updateEventImageCount(event.id);
        event.image_count = actualCount;
      }
    }
    
    return (data || []).map(mapToEventItem);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Get a specific event with corrected image count
export const getEvent = async (id: string): Promise<EventItem | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error in getEvent:', error);
      throw error;
    }
    
    if (!data) {
      console.log(`No event found with ID ${id}`);
      return null;
    }
    
    // Update the image count for this specific event
    const actualCount = await updateEventImageCount(id);
    data.image_count = actualCount;
    
    return mapToEventItem(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

// Create a new event with better error handling and authentication check
export const createEvent = async (
  eventData: { 
    title: string; 
    description?: string; 
    date: string;
  },
  coverImageFile: File,
  eventImages: File[]
): Promise<EventItem | null> => {
  try {
    console.log('Creating event:', eventData.title);
    console.log('Total images to upload:', eventImages.length);
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User must be authenticated to create events');
    }
    
    console.log('User authenticated:', user.id);
    
    // Upload cover image
    console.log('Uploading cover image...');
    const coverImageUrl = await uploadImage(coverImageFile, 'events/covers');
    if (!coverImageUrl) {
      throw new Error('Failed to upload cover image');
    }
    console.log('Cover image uploaded:', coverImageUrl);
    
    // Create event record
    const eventRecord = {
      title: eventData.title,
      description: eventData.description || null,
      date: eventData.date,
      cover_image: coverImageUrl,
      image_count: eventImages.length
    };
    
    console.log('Inserting event record:', eventRecord);
    const { data, error } = await supabase
      .from('events')
      .insert([eventRecord])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting event:', error);
      throw error;
    }
    
    console.log('Event created successfully:', data);
    
    // Upload event images with better error handling
    if (data && eventImages.length > 0) {
      const eventId = data.id;
      let successfulUploads = 0;
      let failedUploads = 0;
      
      console.log(`Starting upload of ${eventImages.length} images...`);
      
      // Process images one by one to better track failures
      for (let i = 0; i < eventImages.length; i++) {
        const file = eventImages[i];
        console.log(`Uploading image ${i + 1} of ${eventImages.length}: ${file.name}`);
        
        try {
          // Upload the image file
          const imageUrl = await uploadImage(file, `events/${eventId}`);
          
          if (imageUrl) {
            // Insert into database
            const { error: insertError } = await supabase
              .from('event_images')
              .insert([{
                event_id: eventId,
                title: file.name.split('.')[0],
                url: imageUrl
              }]);
            
            if (insertError) {
              console.error(`Failed to insert image ${i + 1} into database:`, insertError);
              failedUploads++;
            } else {
              console.log(`Successfully uploaded and saved image ${i + 1}`);
              successfulUploads++;
            }
          } else {
            console.error(`Failed to upload image ${i + 1}: ${file.name}`);
            failedUploads++;
          }
        } catch (uploadError) {
          console.error(`Error processing image ${i + 1}:`, uploadError);
          failedUploads++;
        }
      }
      
      console.log(`Upload summary: ${successfulUploads} successful, ${failedUploads} failed`);
      
      // Update the event's image count with actual successful uploads
      if (successfulUploads !== eventImages.length) {
        const { error: updateError } = await supabase
          .from('events')
          .update({ image_count: successfulUploads })
          .eq('id', eventId);
        
        if (updateError) {
          console.error('Error updating event image count:', updateError);
        } else {
          console.log(`Updated event image count to ${successfulUploads}`);
        }
      }
    }
    
    return data ? mapToEventItem(data) : null;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error; // Re-throw to let the UI handle the error
  }
};

// Delete an event and all associated images from storage and database
export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting event:', id);
    
    // First, get the event to access the cover image URL
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('cover_image')
      .eq('id', id)
      .single();
    
    if (eventError) {
      console.error('Error fetching event for deletion:', eventError);
    }
    
    // Get all event images
    const { data: eventImages, error: imagesError } = await supabase
      .from('event_images')
      .select('url')
      .eq('event_id', id);
    
    if (imagesError) {
      console.error('Error fetching event images for deletion:', imagesError);
    }
    
    // Delete all event images from storage
    if (eventImages && eventImages.length > 0) {
      for (const image of eventImages) {
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
    }
    
    // Delete cover image from storage
    if (event?.cover_image) {
      try {
        const url = new URL(event.cover_image);
        const filePath = url.pathname.split('/storage/v1/object/public/images/')[1];
        
        if (filePath) {
          const { error: coverStorageError } = await supabase.storage
            .from('images')
            .remove([filePath]);
          
          if (coverStorageError) {
            console.error('Error deleting cover image from storage:', filePath, coverStorageError);
          } else {
            console.log('Deleted cover image from storage:', filePath);
          }
        }
      } catch (parseError) {
        console.error('Error parsing cover image URL:', event.cover_image, parseError);
      }
    }
    
    // Delete event images from database (cascade should handle this, but let's be explicit)
    const { error: deleteImagesError } = await supabase
      .from('event_images')
      .delete()
      .eq('event_id', id);
    
    if (deleteImagesError) {
      console.error('Error deleting event images from database:', deleteImagesError);
    } else {
      console.log('Deleted event images from database');
    }
    
    // Delete event from database
    const { error: deleteEventError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (deleteEventError) {
      console.error('Error deleting event from database:', deleteEventError);
      throw deleteEventError;
    }
    
    console.log('Event deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

// Get event images
export const getEventImages = async (eventId: string): Promise<ImageItem[]> => {
  try {
    const { data, error } = await supabase
      .from('event_images')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error in getEventImages:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} images for event ${eventId}`);
    
    // Update the event's image count to match actual images
    if (data) {
      await updateEventImageCount(eventId);
    }
    
    return (data || []).map(mapToImageItem);
  } catch (error) {
    console.error('Error fetching event images:', error);
    return [];
  }
};
