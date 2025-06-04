
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Camera, 
  Star, 
  Calendar,
  Users,
  FileText,
  Settings,
  Image,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/gallery', label: 'Gallery', icon: Camera },
    { path: '/admin/events', label: 'Events', icon: Calendar },
    { path: '/admin/featured-projects', label: 'Featured Projects', icon: FileText },
    { path: '/admin/about-images', label: 'About Images', icon: Image },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
    { path: '/admin/content', label: 'Content Manager', icon: Settings },
    { path: '/admin/team', label: 'Team Management', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <Link to="/" className="text-xl font-bold">
            LexPix<span className="text-yellow-400">.</span> Admin
          </Link>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="w-full justify-start"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
