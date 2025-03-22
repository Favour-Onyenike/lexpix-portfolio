
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { signIn, signOut, isAuthenticated, getCurrentUser } from '@/lib/supabase';

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
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isUserAuthenticated = await isAuthenticated();
        setIsAuth(isUserAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect logic for protected routes
  useEffect(() => {
    if (!isLoading) {
      const isAdminRoute = location.pathname.startsWith('/admin');
      
      if (isAdminRoute && !isAuth && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, isAuth, navigate, isLoading]);

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

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
