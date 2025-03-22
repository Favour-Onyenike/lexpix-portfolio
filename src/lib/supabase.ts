
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the Supabase client directly from the integration
export const supabase = supabaseClient;

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Check if user is authenticated (for client-side protection)
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Set authentication state - no longer needed with real Supabase
export const setAuthenticated = (isAuth: boolean) => {
  console.log('Using real Supabase authentication instead of mock authentication');
};
