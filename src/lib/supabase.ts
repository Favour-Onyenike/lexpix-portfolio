
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Export the Supabase client directly from the integration
export const supabase = supabaseClient;

// Auth helper functions with simplified error handling
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Exception getting current user:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { data: { session: null, user: null }, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception during sign in:', error);
    toast.error('Network error. Please try again');
    return { 
      data: { session: null, user: null }, 
      error: error instanceof Error ? error : new Error('Login failed') 
    };
  }
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Check if user is authenticated (for client-side protection)
export const isAuthenticated = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Exception checking authentication:', error);
    return false;
  }
};

// Get user session
export const getSession = async () => {
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    console.error('Exception getting session:', error);
    return { data: { session: null }, error };
  }
};
