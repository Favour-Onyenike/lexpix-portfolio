
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, getCurrentUser, signIn, signOut } from '@/lib/supabase';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status on mount and setup auth listener
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial auth check
    checkUser();

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      // Cleanup auth listener on unmount
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Redirect logic for protected routes
  useEffect(() => {
    if (!isLoading) {
      const isAdminRoute = location.pathname.startsWith('/admin');
      
      if (isAdminRoute && !isAuthenticated && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, navigate, isLoading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Invalid credentials');
        return false;
      }
      
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.info('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
