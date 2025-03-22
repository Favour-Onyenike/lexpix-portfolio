
import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('gallery_images').select('id').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    // Check if invite_tokens table exists
    // Since we've already created the table via SQL migrations, 
    // we don't need to create it here anymore, just check for its existence
    const { data: inviteTokensData, error: inviteTokensError } = await supabase
      .from('invite_tokens')
      .select('id')
      .limit(1);
    
    if (inviteTokensError) {
      console.error('Error checking invite_tokens table:', inviteTokensError);
    } else {
      console.log('invite_tokens table exists');
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error setting up database connection:', error);
    return false;
  }
};
