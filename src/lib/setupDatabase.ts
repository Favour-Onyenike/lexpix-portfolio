
import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('gallery_images').select('id').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error setting up database connection:', error);
    return false;
  }
};
