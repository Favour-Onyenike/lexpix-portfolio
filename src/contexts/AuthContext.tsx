
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signIn, signOut, getCurrentUser } from '@/lib/supabase';
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

  // Simple auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setIsAuth(!!session);
        
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );
    
    // Initial session check
    const checkInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuth(!!data.session);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Login failed');
        return false;
      }
      
      if (data.session) {
        setIsAuth(true);
        toast.success('Logged in successfully');
        return true;
      } else {
        toast.error('Login failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred');
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
      toast.error(error?.message || 'Error logging out');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteLink = async (): Promise<string | null> => {
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        toast.error('You must be logged in to generate an invite link');
        return null;
      }
      
      const { error } = await supabase.rpc('insert_invite_token', {
        p_token: token,
        p_expires_at: expiresAt.toISOString(),
        p_created_by: currentUser?.id || null
      } as any);
        
      if (error) {
        toast.error('Could not generate invite link');
        return null;
      }
      
      const baseUrl = window.location.origin;
      return `${baseUrl}/invite/${token}`;
    } catch (error: any) {
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
