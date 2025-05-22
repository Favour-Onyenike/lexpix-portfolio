
import { supabase } from '@/integrations/supabase/client';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Check Supabase connection by making a simple query
    const { data, error } = await supabase
      .from('reviews')
      .select('count()', { count: 'exact', head: true });
      
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Connected to Supabase database successfully');
    return true;
  } catch (error) {
    console.error('Failed to setup database connection:', error);
    return false;
  }
};
