
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Phone, Mail, MapPin, Star, Calendar, Camera, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import PolaroidImage from '@/components/PolaroidImage';
import ContactForm from '@/components/ContactForm';
import ReviewSection from '@/components/ReviewSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingEvents } from '@/services/eventService';
import { getFeaturedProjects } from '@/services/projectService';
import { getContentSection } from '@/services/contentService';
import { aboutImageService } from '@/services/aboutImageService';
import OptimizedImage from '@/components/OptimizedImage';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [aboutImages, setAboutImages] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [events, projects, hero, about, images] = await Promise.all([
          getUpcomingEvents(),
          getFeaturedProjects(),
          getContentSection('hero'),
          getContentSection('about'),
          aboutImageService.getAboutImages()
        ]);
        
        setUpcomingEvents(events);
        setFeaturedProjects(projects);
        setHeroContent(hero);
        setAboutContent(about);
        setAboutImages(images);
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    };

    loadData();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold"
          >
            LexPix<span className="text-yellow-400">.</span>
          </motion.div>
          
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('gallery')} className="text-foreground hover:text-yellow-400 transition-colors">
              Gallery
            </button>
            <button onClick={() => navigate('/events')} className="text-foreground hover:text-yellow-400 transition-colors">
              Events
            </button>
            <button onClick={() => scrollToSection('about')} className="text-foreground hover:text-yellow-400 transition-colors">
              About
            </button>
            <button onClick={() => navigate('/pricing')} className="text-foreground hover:text-yellow-400 transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-yellow-400 transition-colors">
              Contact
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
                className="text-foreground hover:text-yellow-400"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            <Button onClick={() => scrollToSection('contact')}>
              Get Quote
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary/20"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            {heroContent?.title || "Capturing Life's Most Precious Moments"}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
          >
            {heroContent?.subtitle || "Professional photography that tells your unique story with artistry, passion, and timeless elegance."}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-x-4"
          >
            <Button size="lg" onClick={() => scrollToSection('gallery')}>
              <Camera className="mr-2 h-5 w-5" />
              View Portfolio
            </Button>
            <Button variant="outline" size="lg" onClick={() => scrollToSection('contact')}>
              Book Session
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
        </motion.div>
      </section>

      {/* Featured Gallery Preview */}
      <section id="gallery" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Featured Gallery
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore some of our favorite moments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map(project => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <OptimizedImage
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {aboutContent?.title || "About LexPix"}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {aboutContent?.content || "We believe every moment deserves to be captured with artistry and passion. Our approach combines technical excellence with creative vision to create timeless memories that you'll treasure forever."}
            </p>
          </motion.div>

          {/* About Images Grid */}
          {aboutImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {aboutImages.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    index === 0 ? 'md:col-span-2' : ''
                  }`}
                >
                  <OptimizedImage
                    src={image.image_url}
                    alt={image.alt_text || `About image ${index + 1}`}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-muted-foreground">
                Don't miss out on these exciting events
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <OptimizedImage
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {new Date(event.date).toLocaleDateString()} - {event.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Kind words from happy clients
            </p>
          </motion.div>
          <ReviewSection />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-muted-foreground">
              Let's capture your story together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>(123) 456-7890</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>info@lexpix.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>123 Photography Lane, Cityville</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>5.0 (125 Reviews)</span>
                </div>
              </motion.div>
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LexPix. All rights reserved.
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
