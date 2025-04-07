
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Export the Supabase client directly from the integration
export const supabase = supabaseClient;

// Auth helper functions with improved error handling
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
    console.log('Attempting to sign in with email:', email);
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (response.error) {
      console.error('Sign in error:', response.error);
      toast.error(response.error.message || 'Failed to sign in');
    } else {
      console.log('Sign in successful:', !!response.data.session);
    }
    
    return response;
  } catch (error: any) {
    console.error('Exception during sign in:', error);
    toast.error(error?.message || 'Network error. Please try again');
    return { 
      data: { session: null, user: null }, 
      error: error instanceof Error ? error : new Error('Failed to connect to authentication service')
    };
  }
};

export const signOut = async () => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Exception during sign out:', error);
    throw error;
  }
};

// Check if user is authenticated (for client-side protection)
export const isAuthenticated = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Exception checking authentication:', error);
    return false;
  }
};

// Make sure we handle auth state properly
export const getSession = async () => {
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    console.error('Exception getting session:', error);
    return { data: { session: null }, error };
  }
};
