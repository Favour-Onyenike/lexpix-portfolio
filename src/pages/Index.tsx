import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Video, Palette, ArrowRight, Mail, Phone, Building2, Clock, Instagram, Facebook, Twitter, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import ReviewSection from '@/components/ReviewSection';
import ContactForm from '@/components/ContactForm';
import PolaroidImage from '@/components/PolaroidImage';
import { getFeaturedProjects, FeaturedProject } from '@/services/projectService';
import { aboutImageService, AboutImage } from '@/services/aboutImageService';
import { counterService, Counter } from '@/services/counterService';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const [counterData, setCounterData] = useState<Counter[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [aboutImages, setAboutImages] = useState<AboutImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const isMobile = useIsMobile();
  
  // Fixed about content
  const aboutContent = {
    title: 'About',
    subtitle: 'Capturing life through our lens',
    content: "LexPix is a photography and visual storytelling brand built on passion, purpose, and love. Founded by Volks \"Lucas Uzum\", LexPix was born under the Lexaren Corporation, proudly owned by the Uzum family. This venture was made possible through the unwavering love, support, and initial funding from his parents, whose belief laid the foundation for everything LexPix is becoming.\n\nWith a sharp eye for detail and a heart for storytelling, LexPix captures life's most meaningful moments, the smiles, glances, and emotions, all in their purest, most vibrant form. Through high-quality photography and visual content, we aim to help others see the color and beauty in their own stories. Every frame we take is a reflection of the love that birthed this vision, and a commitment to preserving the essence of every moment we touch."
  };
  
  // Remove hardcoded stats data - now using database values

  const handleGetInTouchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load projects, about images, and counters
        const [projects, images, countersData] = await Promise.all([
          getFeaturedProjects(),
          aboutImageService.getAboutImages(),
          counterService.getCounters()
        ]);
        setFeaturedProjects(projects);
        setAboutImages(images);
        setCounterData(countersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsVisible]);
  
  useEffect(() => {
    if (statsVisible) {
      const duration = 2000;
      const interval = 50;
      let startTimestamp = null;
      
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        setCounters(counterData.map(counter => Math.floor(progress * counter.value)));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [statsVisible]);

  const defaultProjects = [
    {
      id: '1',
      title: "Events",
      description: "Capturing memorable moments from special events and celebrations.",
      image_url: "/lovable-uploads/9542efdc-b4b2-4089-9182-5656382dc13b.png",
      link: "/events"
    },
    {
      id: '2',
      title: "Places",
      description: "Stunning photography of landscapes, architecture, and beautiful locations.",
      image_url: "/lovable-uploads/69dafa5b-aeba-4a0a-9c92-889afc34f97b.png",
      link: "/gallery"
    },
    {
      id: '3',
      title: "Portrait Series",
      description: "Professional portraits that capture personality and character in every shot.",
      image_url: "/lovable-uploads/cd67a18b-69d7-4832-a636-436e6e50d793.png",
      link: "/gallery"
    }
  ];

  const displayProjects = featuredProjects.length > 0 ? featuredProjects : defaultProjects;

  // Split content into paragraphs
  const contentParagraphs = aboutContent.content.split('\n\n');
  const firstParagraph = contentParagraphs[0];
  const remainingParagraphs = contentParagraphs.slice(1);

  return (
    <Layout>
      <section id="hero" className="flex flex-col md:flex-row items-center py-16 md:py-24 px-6 md:px-10 bg-white">
        <div className="w-full md:w-1/2 pl-0 md:pl-20 pr-0 md:pr-8 mb-10 md:mb-0">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            less is more<span className="text-yellow-400">.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg mb-8"
          >
            Capturing moments with minimalist elegance. Professional photography that focuses on what matters most.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 transition-colors duration-300 hover:bg-yellow-400 hover:text-black"
              onClick={handleGetInTouchClick}
            >
              Get in touch
            </Button>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="max-w-xl mx-auto">
              <img 
                src="/lovable-uploads/f8361f6e-4625-4ae2-af1c-c08f29a899e4.png" 
                alt="Photographer" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 px-6 md:px-10 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Column - Text Content */}
            <div className="w-full lg:w-1/2">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                {aboutContent.title} <span className="font-normal">LexPix<span className="text-yellow-400">.</span></span>
              </motion.h2>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl text-yellow-400 mb-8 font-light"
              >
                {aboutContent.subtitle}
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-md md:text-lg leading-relaxed"
              >
                <p className="mb-4">{firstParagraph}</p>
                
                {/* Mobile: Show/Hide additional content */}
                {isMobile ? (
                  <>
                    {showFullAbout && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {remainingParagraphs.map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </motion.div>
                    )}
                    <button
                      onClick={() => setShowFullAbout(!showFullAbout)}
                      className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors mt-4"
                    >
                      {showFullAbout ? 'Show Less' : 'Read More'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFullAbout ? 'rotate-180' : ''}`} />
                    </button>
                  </>
                ) : (
                  /* Desktop: Show all content */
                  remainingParagraphs.map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))
                )}
              </motion.div>
            </div>
            
            {/* Right Column - Responsive Image Grid for 3 images */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative"
              >
                {isLoading ? (
                  <div className="flex flex-col gap-4 max-w-md mx-auto">
                    {/* Loading state grid layout */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                      <div className="space-y-4">
                        <div className="aspect-[3/2] bg-gray-800 rounded-lg animate-pulse" />
                        <div className="aspect-[3/2] bg-gray-800 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  </div>
                ) : aboutImages.length > 0 ? (
                  <div className="max-w-md mx-auto">
                    {/* Grid layout for all screen sizes */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* First image - taller, spans full height */}
                      {aboutImages[0] && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          viewport={{ once: true }}
                          className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                          <img
                            src={aboutImages[0].image_url}
                            alt={aboutImages[0].alt_text || "About image 1"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </motion.div>
                      )}
                      
                      {/* Second column - two images stacked with matching proportions */}
                      <div className="space-y-4">
                        {aboutImages[1] && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="aspect-[3/2] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            <img
                              src={aboutImages[1].image_url}
                              alt={aboutImages[1].alt_text || "About image 2"}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </motion.div>
                        )}
                        
                        {aboutImages[2] && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="aspect-[3/2] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            <img
                              src={aboutImages[2].image_url}
                              alt={aboutImages[2].alt_text || "About image 3"}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    {/* Fallback: Grid layout */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="space-y-4">
                        <div className="aspect-[3/2] bg-gray-800 rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="aspect-[3/2] bg-gray-800 rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" ref={statsRef} className="py-16 md:py-20 px-6 md:px-10 bg-yellow-400 text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {counterData.map((counter, index) => (
              <motion.div
                key={counter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl md:text-5xl font-bold mb-2">
                  {statsVisible ? counters[index] : 0}+
                </h3>
                <p className="text-sm md:text-base">{counter.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
          >
            Our Services
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 max-w-4xl mx-auto">
            {[
              {
                icon: Camera,
                title: "Photography",
                description: "Professional photography services capturing life's most meaningful moments with artistic vision and technical excellence"
              },
              {
                icon: Video,
                title: "Video Editing",
                description: "Expert video editing and post-production services that bring your visual stories to life with cinematic quality"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 bg-black rounded-md flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-yellow-400">
                  <service.icon className="h-10 w-10 text-white group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-16 md:py-24 px-6 md:px-10 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            Featured Projects
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-700 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-10 bg-gray-700 rounded animate-pulse w-1/3 mt-4" />
                  </div>
                </motion.div>
              ))
            ) : (
              displayProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-black border border-gray-800 rounded-lg overflow-hidden w-full md:max-w-[95%] mx-auto"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={project.image_url} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <Button 
                      variant="outline" 
                      className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" 
                      asChild
                    >
                      <Link to={project.link}>
                        Explore →
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 md:py-24 px-6 md:px-10 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              Contact Us
            </motion.h2>
            <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-gray-600">Feel free to contact us any time. We will get back to you as soon as we can!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <ContactForm />
            </div>
            
            <div className="bg-black text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-8">Info</h3>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-4 text-yellow-400" />
                  <span>lexarenlogistics@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-4 text-yellow-400" />
                  <span>+1 (825) 461-0429</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-4 text-yellow-400" />
                  <span>Edmonton, AB</span>
                </div>
              </div>
              
              <div className="mt-12">
                <a href="https://www.instagram.com/lexarenpictures?igsh=MWoyZDg2dXQxOGp6cQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 hover:bg-yellow-400 transition-colors duration-300">
                  <Instagram className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews">
        <ReviewSection />
      </section>
    </Layout>
  );
};

export default Index;
