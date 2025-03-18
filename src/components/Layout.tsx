
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Mail, Phone } from 'lucide-react';

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
      
      <footer className="bg-black text-white py-12 md:py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">LexPix</h3>
              <p className="text-gray-400">Capturing moments with minimalist elegance.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <div className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
                <Link to="/gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</Link>
                <Link to="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link>
                <Link to="/#contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
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
                  <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 hover:bg-yellow-400 transition-colors duration-300">
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center md:text-left">
            <p className="text-gray-500">© 2025 LexPix Photography. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
