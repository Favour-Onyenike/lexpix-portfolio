import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Image, 
  Calendar, 
  Star, 
  Users, 
  FileText, 
  Edit, 
  LogOut, 
  Menu, 
  X, 
  Home,
  DollarSign,
  ImageIcon,
  HardDrive
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Image, label: 'Gallery', path: '/admin/gallery' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: DollarSign, label: 'Pricing', path: '/admin/pricing' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: Users, label: 'Team', path: '/admin/team' },
    { icon: FileText, label: 'Featured Projects', path: '/admin/featured-projects' },
    { icon: ImageIcon, label: 'About Images', path: '/admin/about-images' },
    { icon: Edit, label: 'Content', path: '/admin/content' },
    { icon: HardDrive, label: 'Storage', path: '/admin/storage' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const goToHome = () => {
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            LexPix<span className="text-yellow-400">.</span>
          </h2>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-yellow-600' : 'text-gray-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-6 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            onClick={goToHome}
            variant="outline"
            className="w-full justify-start"
          >
            <Home className="h-4 w-4 mr-2" />
            View Site
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold">
                LexPix<span className="text-yellow-400">.</span> Admin
              </h1>
              <div className="w-9" /> {/* Spacer for center alignment */}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
