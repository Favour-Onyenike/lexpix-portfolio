
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
  imageCount: event.image_count,
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
    
    if (error) throw error;
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
      .single();
    
    if (error) throw error;
    return mapToEventItem(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

// Create a new event
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
    // Upload cover image
    const coverImageUrl = await uploadImage(coverImageFile, 'events/covers');
    if (!coverImageUrl) throw new Error('Failed to upload cover image');
    
    // Create event record
    const { data: event, error } = await supabase
      .from('events')
      .insert([{
        title: eventData.title,
        description: eventData.description || null,
        date: eventData.date,
        cover_image: coverImageUrl,
        image_count: eventImages.length
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Upload event images
    if (event && eventImages.length > 0) {
      const eventId = event.id;
      
      // Process images in batches of 5 to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < eventImages.length; i += batchSize) {
        const batch = eventImages.slice(i, i + batchSize);
        
        // Upload each image in the batch
        const uploads = await Promise.all(
          batch.map(async (file) => {
            const imageUrl = await uploadImage(file, `events/${eventId}`);
            if (!imageUrl) return null;
            
            return {
              event_id: eventId,
              title: file.name.split('.')[0],
              url: imageUrl
            };
          })
        );
        
        // Filter out any failed uploads
        const validUploads = uploads.filter(Boolean);
        
        // Insert event images into the database
        if (validUploads.length > 0) {
          const { error: insertError } = await supabase
            .from('event_images')
            .insert(validUploads);
          
          if (insertError) throw insertError;
        }
      }
    }
    
    return event ? mapToEventItem(event) : null;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

// Delete an event
export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    // First, get the event to get the cover image URL
    const { data: event } = await supabase
      .from('events')
      .select('cover_image')
      .eq('id', id)
      .single();
    
    // Get all event images
    const { data: eventImages } = await supabase
      .from('event_images')
      .select('url')
      .eq('event_id', id);
    
    // Delete event from database (will cascade to event_images)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Delete images from storage
    // Cover image
    if (event?.cover_image) {
      const coverUrl = new URL(event.cover_image).pathname;
      const coverPath = coverUrl.split('/').slice(2).join('/');
      await supabase.storage
        .from('images')
        .remove([coverPath]);
    }
    
    // Event images
    if (eventImages && eventImages.length > 0) {
      const imagePaths = eventImages.map(img => {
        const url = new URL(img.url).pathname;
        return url.split('/').slice(2).join('/');
      });
      
      await supabase.storage
        .from('images')
        .remove(imagePaths);
    }
    
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
    
    if (error) throw error;
    return (data || []).map(mapToImageItem);
  } catch (error) {
    console.error('Error fetching event images:', error);
    return [];
  }
};
