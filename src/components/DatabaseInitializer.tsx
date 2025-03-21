
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DatabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const setupMockDatabase = async () => {
      try {
        // Initialize localStorage tables if they don't exist
        if (!localStorage.getItem('supabase_gallery_images')) {
          localStorage.setItem('supabase_gallery_images', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('supabase_events')) {
          localStorage.setItem('supabase_events', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('supabase_event_images')) {
          localStorage.setItem('supabase_event_images', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('supabase_reviews')) {
          localStorage.setItem('supabase_reviews', JSON.stringify([]));
        }
        
        console.log('Mock database initialized');
        setInitialized(true);
      } catch (error) {
        console.error('Error setting up mock database:', error);
        toast.error('Failed to initialize database');
      }
    };

    setupMockDatabase();
  }, []);

  return null;
};

export default DatabaseInitializer;
