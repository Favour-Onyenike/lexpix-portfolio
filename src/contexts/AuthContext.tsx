
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { signIn, signOut, isAuthenticated, getCurrentUser } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  generateInviteLink: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Subscribe to auth changes and handle session state
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    console.log('Setting up auth state change listener');
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        const newAuthState = !!session;
        
        if (mounted) {
          setIsAuth(newAuthState);
        }
        
        // Handle auth state changes
        if (event === 'SIGNED_OUT') {
          // Redirect to login on sign out
          if (location.pathname.startsWith('/admin')) {
            navigate('/login');
          }
        }
      }
    );
    
    // Then check for existing session
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error);
          if (mounted) {
            setIsAuth(false);
            setIsLoading(false);
          }
          return;
        }
        
        const isUserAuthenticated = !!data.session;
        console.log('Initial auth check:', isUserAuthenticated);
        
        if (mounted) {
          setIsAuth(isUserAuthenticated);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Exception checking authentication:', error);
        if (mounted) {
          setIsAuth(false);
          setIsLoading(false);
        }
      }
    };
    
    checkAuthStatus();
    
    // Cleanup subscription and prevent state updates after unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Invalid credentials');
        return false;
      }
      
      if (data.session) {
        setIsAuth(true);
        toast.success('Logged in successfully');
        return true;
      } else {
        toast.error('No session returned after login');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setIsAuth(false);
      navigate('/login');
      toast.info('Logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error?.message || 'Error logging out');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteLink = async (): Promise<string | null> => {
    try {
      // Generate a unique token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
      
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        toast.error('You must be logged in to generate an invite link');
        return null;
      }
      
      // Store the token using the RPC function
      const { error } = await supabase.rpc('insert_invite_token', {
        p_token: token,
        p_expires_at: expiresAt.toISOString(),
        p_created_by: currentUser?.id || null
      } as any); // Use type assertion to bypass the type checking
        
      if (error) {
        console.error('Error creating invite token:', error);
        toast.error('Could not generate invite link');
        return null;
      }
      
      // Return the invite link
      const baseUrl = window.location.origin;
      return `${baseUrl}/invite/${token}`;
    } catch (error: any) {
      console.error('Error generating invite link:', error);
      toast.error(error?.message || 'Could not generate invite link');
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuth, login, logout, isLoading, generateInviteLink }}>
      {children}
    </AuthContext.Provider>
  );
};
