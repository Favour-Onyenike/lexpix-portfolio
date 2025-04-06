
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Debug authentication status
  useEffect(() => {
    console.log("RequireAuth - Auth status:", { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    // Redirect to the login page with a return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("Authenticated, rendering outlet");
  return <Outlet />;
};

export default RequireAuth;
