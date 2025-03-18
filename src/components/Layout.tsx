
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="py-6 px-6 md:px-10 border-b border-border sticky top-0 z-10 glass-panel">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="text-2xl font-medium tracking-tight">
              PhotoStudio
            </Link>
          </motion.div>
          
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center space-x-8"
          >
            <Link to="/" className="text-sm hover:text-primary/80 transition-colors">
              Home
            </Link>
            <Link to="/gallery" className="text-sm hover:text-primary/80 transition-colors">
              Gallery
            </Link>
            <Link to="/events" className="text-sm hover:text-primary/80 transition-colors">
              Events
            </Link>
            <Link to="/login" className="text-sm hover:text-primary/80 transition-colors">
              Admin
            </Link>
          </motion.nav>
        </div>
      </header>

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
      
      <footer className="py-8 px-6 md:px-10 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} PhotoStudio. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Instagram
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Facebook
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
