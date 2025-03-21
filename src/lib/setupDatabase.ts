
import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Create storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'images')) {
      await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      console.log('Created images bucket');
    }

    // Create gallery_images table
    const { error: galleryError } = await supabase
      .from('gallery_images')
      .select('id')
      .limit(1);

    if (galleryError && galleryError.code === 'PGRST116') {
      await supabase.rpc('create_gallery_images_table');
      console.log('Created gallery_images table');
    }

    // Create events table
    const { error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    if (eventsError && eventsError.code === 'PGRST116') {
      await supabase.rpc('create_events_table');
      console.log('Created events table');
    }

    // Create event_images table
    const { error: eventImagesError } = await supabase
      .from('event_images')
      .select('id')
      .limit(1);

    if (eventImagesError && eventImagesError.code === 'PGRST116') {
      await supabase.rpc('create_event_images_table');
      console.log('Created event_images table');
    }

    // Create reviews table
    const { error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);

    if (reviewsError && reviewsError.code === 'PGRST116') {
      await supabase.rpc('create_reviews_table');
      console.log('Created reviews table');
    }

    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Create SQL functions for Supabase
// These functions need to be added to your Supabase SQL editor
export const databaseSetupSQL = `
-- Function to create gallery_images table
CREATE OR REPLACE FUNCTION create_gallery_images_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create events table
CREATE OR REPLACE FUNCTION create_events_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    cover_image TEXT NOT NULL,
    image_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create event_images table
CREATE OR REPLACE FUNCTION create_event_images_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS event_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create reviews table
CREATE OR REPLACE FUNCTION create_reviews_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT NOT NULL,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
`;
