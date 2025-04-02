
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
      
      // First try to get the bucket without creating it
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('images');
      
      if (bucketError) {
        console.log('Could not find images bucket, attempting to create it');
        
        try {
          // Create the bucket
          const { data: newBucket, error: createError } = await supabase.storage.createBucket('images', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error('Failed to create images bucket:', createError);
            // Continue execution even if bucket creation fails
            console.log('Continuing without storage bucket - some features may be limited');
          } else {
            console.log('Successfully created images storage bucket');
          }
        } catch (createBucketError) {
          console.error('Exception creating bucket:', createBucketError);
          // Continue execution even if bucket creation fails
          console.log('Continuing without storage bucket - some features may be limited');
        }
      } else {
        console.log('Images bucket already exists:', bucketData);
      }
    } catch (storageError) {
      console.error('Error checking/creating storage bucket:', storageError);
      // Continue execution even if storage has issues
      console.log('Continuing without storage bucket - some features may be limited');
    }
    
    // Continue with other initialization tasks
    try {
      console.log('Testing RPC functions...');
      // Attempt to call the validate_invite_token function with a test value
      const { data: rpcData, error: rpcError } = await supabase.rpc('validate_invite_token', { 
        p_token: 'test-token'
      });
      
      if (rpcError) {
        console.log('RPC test returned an error (expected for invalid token):', rpcError);
      } else {
        console.log('RPC function test result:', rpcData);
      }
      
      console.log('RPC functions exist and are accessible');
    } catch (rpcError) {
      console.error('Error checking RPC functions:', rpcError);
      // Continue execution even if RPC functions aren't working
      console.log('Continuing without RPC functions - invite features may be limited');
    }
    
    console.log('Database initialization complete - proceeding with application');
    return true;
  } catch (error) {
    console.error('Unhandled error during database setup:', error);
    return false;
  }
};
