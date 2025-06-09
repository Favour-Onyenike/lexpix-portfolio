
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import DatabaseInitializer from '@/components/DatabaseInitializer';
import RequireAuth from '@/components/RequireAuth';
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import EventGallery from "./pages/EventGallery";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InviteSignup from "./pages/InviteSignup";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import AdminGallery from "./pages/admin/Gallery";
import AdminEvents from "./pages/admin/Events";
import AdminPricing from "./pages/admin/Pricing";
import AdminReviews from "./pages/admin/Reviews";
import TeamManagement from "./pages/admin/TeamManagement";
import FeaturedProjects from "./pages/admin/FeaturedProjects";
import ProjectGallery from "./pages/admin/ProjectGallery";
import AboutImages from "./pages/admin/AboutImages";
import ContentManager from "./pages/admin/ContentManager";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DatabaseInitializer>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:eventId" element={<EventGallery />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/invite/:token" element={<InviteSignup />} />
                <Route path="*" element={<NotFound />} />

                <Route path="/admin" element={<RequireAuth component={Dashboard} />} />
                <Route path="/admin/gallery" element={<RequireAuth component={AdminGallery} />} />
                <Route path="/admin/events" element={<RequireAuth component={AdminEvents} />} />
                <Route path="/admin/pricing" element={<RequireAuth component={AdminPricing} />} />
                <Route path="/admin/reviews" element={<RequireAuth component={AdminReviews} />} />
                <Route path="/admin/team" element={<RequireAuth component={TeamManagement} />} />
                <Route path="/admin/featured-projects" element={<RequireAuth component={FeaturedProjects} />} />
                <Route path="/admin/project-gallery/:projectId" element={<RequireAuth component={ProjectGallery} />} />
                <Route path="/admin/about-images" element={<RequireAuth component={AboutImages} />} />
                <Route path="/admin/content" element={<RequireAuth component={ContentManager} />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </DatabaseInitializer>
        </AuthProvider>
      </QueryClientProvider>
    </TooltipProvider>
  );
}

export default App;
