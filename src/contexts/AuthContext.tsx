
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
    setIsLoading(true);
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        const newAuthState = !!session;
        setIsAuth(newAuthState);
        
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
        const { data } = await supabase.auth.getSession();
        const isUserAuthenticated = !!data.session;
        console.log('Initial auth check:', isUserAuthenticated);
        setIsAuth(isUserAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Invalid credentials');
        return false;
      }
      
      setIsAuth(true);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsAuth(false);
      navigate('/login');
      toast.info('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const generateInviteLink = async (): Promise<string | null> => {
    try {
      // Generate a unique token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
      
      const currentUser = await getCurrentUser();
      
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
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast.error('Could not generate invite link');
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuth, login, logout, isLoading, generateInviteLink }}>
      {children}
    </AuthContext.Provider>
  );
};
