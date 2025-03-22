
import { supabase } from './supabase';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('gallery_images').select('id').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    // Check if invite_tokens table exists, create it if it doesn't
    const { error: schemaError } = await supabase.rpc('check_if_table_exists', {
      table_name: 'invite_tokens'
    });
    
    if (schemaError) {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.invite_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          token TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT false,
          created_by UUID REFERENCES auth.users(id),
          used_by UUID REFERENCES auth.users(id)
        );
      `);
      
      if (createError) {
        console.error('Error creating invite_tokens table:', createError);
      }
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error setting up database connection:', error);
    return false;
  }
};
