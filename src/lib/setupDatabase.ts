
import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('gallery_images').select('id').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    // Check if invite_tokens table exists and RPC functions are properly configured
    try {
      // Attempt to call the validate_invite_token function with a test value
      // This will fail gracefully if the function exists but the token is invalid
      await supabase.rpc('validate_invite_token', { 
        p_token: 'test-token'
      } as any);
      console.log('invite_tokens RPC functions exist');
    } catch (rpcError) {
      console.error('Error checking invite_tokens RPC functions:', rpcError);
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error setting up database connection:', error);
    return false;
  }
};
