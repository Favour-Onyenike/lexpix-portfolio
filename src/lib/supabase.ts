
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fixed admin credentials for easy authentication
// In a real-world app, this would be handled more securely
const ADMIN_EMAIL = "admin@lexpix.com";
const ADMIN_PASSWORD = "admin123";

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  // For simplicity and because this is a personal site with only one admin user
  // we're using a fixed credential check
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Use a mock successful response
    return {
      data: { user: { email: ADMIN_EMAIL, id: "admin-user-id" }, session: {} },
      error: null
    };
  }
  
  // If credentials don't match, return an error
  return {
    data: { user: null, session: null },
    error: { message: "Invalid login credentials" }
  };
};

export const signOut = async () => {
  // Since we're using fixed authentication, we don't need to call Supabase
  return { error: null };
};

// Check if user is authenticated (for client-side protection)
export const isAuthenticated = () => {
  // For development simplicity, we just check if we have the admin email in local storage
  const storedEmail = localStorage.getItem('admin_email');
  return storedEmail === ADMIN_EMAIL;
};

// Set authentication state
export const setAuthenticated = (isAuth: boolean) => {
  if (isAuth) {
    localStorage.setItem('admin_email', ADMIN_EMAIL);
  } else {
    localStorage.removeItem('admin_email');
  }
};
