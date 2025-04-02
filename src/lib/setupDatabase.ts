
import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection...');
    
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('gallery_images').select('id').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase and queried gallery_images');
    
    // Check if storage bucket exists and create if it doesn't
    try {
      console.log('Checking if images bucket exists...');
      const { data: bucketExists, error: bucketError } = await supabase.storage.getBucket('images');
      
      if (bucketError) {
        console.error('Error checking bucket:', bucketError);
      }
      
      if (!bucketExists) {
        console.log('Images bucket does not exist, creating...');
        const { error: createError } = await supabase.storage.createBucket('images', { 
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError) {
          console.error('Error creating images bucket:', createError);
          return false;
        }
        console.log('Created images storage bucket');
      } else {
        console.log('Images bucket already exists');
      }
    } catch (bucketError) {
      console.log('Error checking bucket, attempting to create:', bucketError);
      try {
        const { error: createError } = await supabase.storage.createBucket('images', { 
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError) {
          console.error('Error creating images bucket:', createError);
          return false;
        }
        console.log('Created images storage bucket');
      } catch (createError) {
        console.error('Failed to create images bucket:', createError);
        return false;
      }
    }
    
    // Check if invite_tokens table exists and RPC functions are properly configured
    try {
      console.log('Testing RPC functions...');
      // Attempt to call the validate_invite_token function with a test value
      // This will fail gracefully if the function exists but the token is invalid
      await supabase.rpc('validate_invite_token', { 
        p_token: 'test-token'
      });
      console.log('invite_tokens RPC functions exist');
    } catch (rpcError) {
      console.error('Error checking invite_tokens RPC functions:', rpcError);
      // We don't want to fail entirely if RPC functions don't work,
      // as they might not be needed right away
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error setting up database connection:', error);
    return false;
  }
};
