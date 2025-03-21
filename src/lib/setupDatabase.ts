
import { supabase } from './supabase';

// This function can be called once to set up the database tables and storage buckets
export const setupDatabase = async () => {
  console.log('Setting up database...');
  
  try {
    // Create storage bucket for images if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(bucket => bucket.name === 'images')) {
      const { error } = await supabase.storage.createBucket('images', {
        public: true
      });
      if (error) throw error;
      console.log('Created images bucket');
    }
    
    // Create gallery_images table
    const { error: galleryError } = await supabase.rpc('create_gallery_images_if_not_exists');
    if (galleryError && !galleryError.message.includes('already exists')) {
      // If the function doesn't exist, execute the raw SQL
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS gallery_images (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      if (error) throw error;
    }
    
    // Create events table
    const { error: eventsError } = await supabase.rpc('create_events_if_not_exists');
    if (eventsError && !eventsError.message.includes('already exists')) {
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          cover_image TEXT NOT NULL,
          image_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      if (error) throw error;
    }
    
    // Create event_images table
    const { error: eventImagesError } = await supabase.rpc('create_event_images_if_not_exists');
    if (eventImagesError && !eventImagesError.message.includes('already exists')) {
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS event_images (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      if (error) throw error;
    }
    
    // Create reviews table
    const { error: reviewsError } = await supabase.rpc('create_reviews_if_not_exists');
    if (reviewsError && !reviewsError.message.includes('already exists')) {
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          rating INTEGER NOT NULL,
          text TEXT NOT NULL,
          published BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      if (error) throw error;
    }
    
    console.log('Database setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};
