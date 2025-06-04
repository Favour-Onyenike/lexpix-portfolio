
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DatabaseInitializer from "@/components/DatabaseInitializer";
import RequireAuth from "@/components/RequireAuth";

// Import pages
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import EventGallery from "./pages/EventGallery";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InviteSignup from "./pages/InviteSignup";
import NotFound from "./pages/NotFound";

// Import admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminGallery from "./pages/admin/Gallery";
import AdminEvents from "./pages/admin/Events";
import FeaturedProjects from "./pages/admin/FeaturedProjects";
import AboutImages from "./pages/admin/AboutImages";
import Reviews from "./pages/admin/Reviews";
import ContentManager from "./pages/admin/ContentManager";
import TeamManagement from "./pages/admin/TeamManagement";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DatabaseInitializer />
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventGallery />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/invite-signup" element={<InviteSignup />} />
              
              {/* Protected admin routes */}
              <Route path="/admin/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/admin/gallery" element={<RequireAuth><AdminGallery /></RequireAuth>} />
              <Route path="/admin/events" element={<RequireAuth><AdminEvents /></RequireAuth>} />
              <Route path="/admin/featured-projects" element={<RequireAuth><FeaturedProjects /></RequireAuth>} />
              <Route path="/admin/about-images" element={<RequireAuth><AboutImages /></RequireAuth>} />
              <Route path="/admin/reviews" element={<RequireAuth><Reviews /></RequireAuth>} />
              <Route path="/admin/content" element={<RequireAuth><ContentManager /></RequireAuth>} />
              <Route path="/admin/team" element={<RequireAuth><TeamManagement /></RequireAuth>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
