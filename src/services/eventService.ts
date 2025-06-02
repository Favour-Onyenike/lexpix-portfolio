
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

// Get all events
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
    return (data || []).map(mapToEventItem);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Get a specific event
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
    
    return mapToEventItem(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

// Create a new event with improved image upload handling
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
    
    // Upload cover image
    const coverImageUrl = await uploadImage(coverImageFile, 'events/covers');
    if (!coverImageUrl) throw new Error('Failed to upload cover image');
    
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
    
    console.log('Event created:', data);
    
    // Upload event images with better error handling
    if (data && eventImages.length > 0) {
      const eventId = data.id;
      let successfulUploads = 0;
      let failedUploads = 0;
      
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
        await supabase
          .from('events')
          .update({ image_count: successfulUploads })
          .eq('id', eventId);
        
        console.log(`Updated event image count to ${successfulUploads}`);
      }
    }
    
    return data ? mapToEventItem(data) : null;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

// Delete an event
export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    // Delete event from database
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
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
    return (data || []).map(mapToImageItem);
  } catch (error) {
    console.error('Error fetching event images:', error);
    return [];
  }
};
