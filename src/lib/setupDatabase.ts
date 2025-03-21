import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Create storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'images')) {
      // Fixed: createBucket now accepts a name parameter
      await supabase.storage.createBucket('images');
      console.log('Created images bucket');
    }

    // Initialize database tables through RPC calls
    // These will be no-ops if tables already exist
    await supabase.rpc('create_gallery_images_table');
    await supabase.rpc('create_events_table');
    await supabase.rpc('create_event_images_table');
    await supabase.rpc('create_reviews_table');
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// These SQL definitions would be used in a real Supabase setup
// but are included here for reference only
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
