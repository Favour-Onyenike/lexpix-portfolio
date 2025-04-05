
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Grid, Image, Calendar, LogOut, Menu, X, Users, Award, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Grid },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Featured Projects', path: '/admin/featured-projects', icon: Award },
    { name: 'Content', path: '/admin/content', icon: FileText },
    { name: 'Team', path: '/admin/team', icon: Users },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-background relative z-10">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2">
          <ChevronLeft size={18} />
          <img 
            src="/lovable-uploads/1d6b6728-d366-45fd-9011-da3cf0b442b4.png" 
            alt="LexPix Logo" 
            className="h-7 w-auto" 
          />
        </Link>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </Button>
        )}
      </div>

      <nav className="space-y-1 flex-grow">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm
                ${isActive 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6" />
      
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={logout}
      >
        <LogOut size={16} className="mr-2" />
        Logout
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile header */}
      <header className="md:hidden py-4 px-6 border-b border-border sticky top-0 z-20 bg-background">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/1d6b6728-d366-45fd-9011-da3cf0b442b4.png" 
              alt="LexPix Logo" 
              className="h-6 w-auto" 
            />
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-6 border-r border-border">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent 
            side="left" 
            className="w-[80%] max-w-sm p-6 border-r border-border"
            style={{ height: '100dvh', overflow: 'auto' }}
          >
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-grow md:max-h-screen md:overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLayout;
