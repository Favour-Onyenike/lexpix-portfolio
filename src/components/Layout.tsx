
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                LexPix<span className="text-yellow-400">.</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-yellow-600 border-b-2 border-yellow-400' 
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/gallery"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/gallery') 
                    ? 'text-yellow-600 border-b-2 border-yellow-400' 
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
              >
                Gallery
              </Link>
              <Link
                to="/events"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/events') 
                    ? 'text-yellow-600 border-b-2 border-yellow-400' 
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
              >
                Events
              </Link>
              <Link
                to="/pricing"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/pricing') 
                    ? 'text-yellow-600 border-b-2 border-yellow-400' 
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
              >
                Pricing
              </Link>
              
              {user && (
                <Link
                  to="/admin"
                  className="p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black transition-colors"
                  title="Admin"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-yellow-600 bg-yellow-50' 
                    : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/gallery"
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/gallery') 
                    ? 'text-yellow-600 bg-yellow-50' 
                    : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                to="/events"
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/events') 
                    ? 'text-yellow-600 bg-yellow-50' 
                    : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/pricing"
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/pricing') 
                    ? 'text-yellow-600 bg-yellow-50' 
                    : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              
              {user && (
                <Link
                  to="/admin"
                  className="flex items-center px-3 py-2 text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 transition-colors rounded-md mx-3 mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
