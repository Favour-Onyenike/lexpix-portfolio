
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Mail, Phone, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [activeSection, setActiveSection] = useState('');

  // Track current path from hash - completely independent of React Router
  useEffect(() => {
    const updatePath = () => {
      const hash = window.location.hash;
      const path = hash.replace('#', '') || '/';
      setCurrentPath(path);
      setMobileMenuOpen(false);
    };

    updatePath();
    window.addEventListener('hashchange', updatePath);
    return () => window.removeEventListener('hashchange', updatePath);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (currentPath !== '/') {
      navigateTo('/');
    } else {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (currentPath === '/') {
        const sections = ['hero', 'about', 'stats', 'services', 'projects', 'contact', 'reviews'];
        const current = sections.find(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        
        if (current) {
          setActiveSection(current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath]);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') {
      return activeSection === 'hero';
    }
    if (path === '/gallery' && currentPath === '/gallery') {
      return true;
    }
    if (path === '/events' && currentPath === '/events') {
      return true;
    }
    if (path === '#contact') {
      return activeSection === 'contact';
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="py-6 px-6 md:px-10 border-b border-border sticky top-0 z-10 glass-panel">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <button onClick={handleHomeClick} className="flex items-center">
              <img 
                src="lovable-uploads/02801854-0522-49da-a353-395229e44ac6.png" 
                alt="LexPix Logo" 
                className="h-8 md:h-10"
              />
            </button>
          </motion.div>
          
          {!isMobile && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-8 justify-center"
            >
              <button 
                onClick={handleHomeClick}
                className={`text-sm hover:text-primary/80 transition-colors relative ${
                  isActive('/') ? 'after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-yellow-400' : ''
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => navigateTo('/gallery')}
                className={`text-sm hover:text-primary/80 transition-colors relative ${
                  isActive('/gallery') ? 'after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-yellow-400' : ''
                }`}
              >
                Gallery
              </button>
              <button 
                onClick={() => navigateTo('/events')}
                className={`text-sm hover:text-primary/80 transition-colors relative ${
                  isActive('/events') ? 'after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-yellow-400' : ''
                }`}
              >
                Events
              </button>
              <button 
                onClick={handleContactClick}
                className={`text-sm hover:text-primary/80 transition-colors relative ${
                  isActive('#contact') ? 'after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-yellow-400' : ''
                }`}
              >
                Contact
              </button>
            </motion.nav>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-shrink-0"
          >
            {!isMobile ? (
              <Button 
                onClick={() => navigateTo('/login')}
                variant="outline" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" 
                size="sm"
              >
                Admin
              </Button>
            ) : (
              <button 
                onClick={toggleMobileMenu}
                className="p-2 bg-white border-2 border-yellow-400 rounded-md"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-black" />
                ) : (
                  <Menu className="h-5 w-5 text-black" />
                )}
              </button>
            )}
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 top-[78px] bg-white z-50 flex flex-col overflow-y-auto pb-safe"
            style={{ maxHeight: "calc(100vh - 78px)" }}
          >
            <div className="flex justify-center py-8">
              <img 
                src="lovable-uploads/02801854-0522-49da-a353-395229e44ac6.png" 
                alt="LexPix Logo" 
                className="h-10"
              />
            </div>
            
            <div className="flex flex-col justify-center items-center space-y-8 p-6 flex-1">
              <button 
                className="text-2xl font-medium text-black hover:text-yellow-400 transition-colors py-4 relative"
                onClick={handleHomeClick}
              >
                Home
                {currentPath === '/' && activeSection === 'hero' && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-full" />
                )}
              </button>
              <button 
                className="text-2xl font-medium text-black hover:text-yellow-400 transition-colors py-4 relative"
                onClick={() => navigateTo('/gallery')}
              >
                Gallery
                {currentPath === '/gallery' && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-full" />
                )}
              </button>
              <button 
                className="text-2xl font-medium text-black hover:text-yellow-400 transition-colors py-4 relative"
                onClick={() => navigateTo('/events')}
              >
                Events
                {currentPath === '/events' && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-full" />
                )}
              </button>
              <button 
                onClick={handleContactClick}
                className="text-2xl font-medium text-black hover:text-yellow-400 transition-colors py-4 relative"
              >
                Contact
                {currentPath === '/' && activeSection === 'contact' && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-full" />
                )}
              </button>
              <button 
                className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-4 rounded-md transition-colors"
                onClick={() => navigateTo('/login')}
              >
                Admin
              </button>
            </div>
            
            <div className="flex justify-center items-center space-x-6 py-12">
              <a href="https://www.instagram.com/lexarenpictures?igsh=MWoyZDg2dXQxOGp6cQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-yellow-400 text-white hover:bg-yellow-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:lexarenlogistics@gmail.com" className="p-3 rounded-full bg-yellow-400 text-white hover:bg-yellow-500 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="tel:+18254610429" className="p-3 rounded-full bg-yellow-400 text-white hover:bg-yellow-500 transition-colors">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
      
      <footer className="bg-black text-white py-12 md:py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="mb-4">
                <h2 className="text-2xl">
                  LexPix<span className="text-yellow-400">.</span>
                </h2>
              </div>
              <p className="text-gray-400">Capturing moments with minimalist elegance.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <div className="flex flex-col space-y-4">
                <button onClick={handleHomeClick} className="text-gray-400 hover:text-white transition-colors text-left">Home</button>
                <button onClick={() => navigateTo('/gallery')} className="text-gray-400 hover:text-white transition-colors text-left">Gallery</button>
                <button onClick={() => navigateTo('/events')} className="text-gray-400 hover:text-white transition-colors text-left">Events</button>
                <button onClick={handleContactClick} className="text-gray-400 hover:text-white transition-colors text-left">Contact</button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">lexarenlogistics@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">+1 (825) 461-0429</span>
                </div>
                <div className="mt-6">
                  <a href="https://www.instagram.com/lexarenpictures?igsh=MWoyZDg2dXQxOGp6cQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 hover:bg-yellow-400 transition-colors duration-300">
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center md:text-left">
            <p className="text-gray-500">© 2025 <span>LexPix<span className="text-yellow-400">.</span></span> All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
