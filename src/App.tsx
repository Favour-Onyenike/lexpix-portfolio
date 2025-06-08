
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import DatabaseInitializer from "@/components/DatabaseInitializer";

// Client Pages
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import EventGallery from "./pages/EventGallery";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InviteSignup from "./pages/InviteSignup";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import AdminGallery from "./pages/admin/Gallery";
import AdminEvents from "./pages/admin/Events";
import AdminReviews from "./pages/admin/Reviews";
import TeamManagement from "./pages/admin/TeamManagement";
import FeaturedProjects from "./pages/admin/FeaturedProjects";
import ContentManager from "./pages/admin/ContentManager";
import AdminPricing from "./pages/admin/Pricing";
import AdminAboutImages from "./pages/admin/AboutImages";

import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HashRouter>
        <AuthProvider>
          <DatabaseInitializer />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Client Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<EventGallery />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/invite/:token" element={<InviteSignup />} />
              
              {/* Admin Routes - Protected */}
              <Route element={<RequireAuth />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/team" element={<TeamManagement />} />
                <Route path="/admin/featured-projects" element={<FeaturedProjects />} />
                <Route path="/admin/content" element={<ContentManager />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/admin/about-images" element={<AdminAboutImages />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </HashRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
