
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Video, Palette, ArrowRight, Mail, Phone, Building2, Clock, Instagram, Facebook, Twitter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import ReviewSection from '@/components/ReviewSection';
import { getFeaturedProjects, FeaturedProject } from '@/services/projectService';

const Index = () => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const statsData = [
    { target: 25, label: "Satisfied Clients" },
    { target: 20, label: "Projects Completed" },
    { target: 3, label: "Years Experience" },
    { target: 200, label: "Photos Delivered" }
  ];
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await getFeaturedProjects();
        setFeaturedProjects(projects);
      } catch (error) {
        console.error('Error loading featured projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
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
        
        setCounters(statsData.map(stat => Math.floor(progress * stat.target)));
        
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
              asChild
            >
              <a href="#contact">Get in touch</a>
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
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            About <span className="font-normal">LexPix<span className="text-yellow-400">.</span></span>
          </motion.h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mb-12"></div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-md md:text-lg max-w-4xl mx-auto leading-relaxed"
          >
            Founded by Volks "Lucas Uzum" in partnership with Larry "Olanrewaju Lawal Rasaq", LexPix is a creative photography and visual 
            storytelling brand dedicated to capturing life's most meaningful moments. At LexPix, we believe every smile, glance, and milestone 
            tells a story. With a sharp eye for detail and a passion for bringing memories to life, we create stunning images and dynamic visuals 
            that preserve emotions in their purest form. Whether through striking photography or compelling videography, our goal is to bring out 
            the beauty in every scene, turning everyday moments into lasting treasures.
          </motion.p>
        </div>
      </section>

      <section id="stats" ref={statsRef} className="py-16 md:py-20 px-6 md:px-10 bg-yellow-400 text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl md:text-5xl font-bold mb-2">
                  {statsVisible ? counters[index] : 0}{index === 3 ? "+" : index === 2 ? "+" : "+"}
                </h3>
                <p className="text-sm md:text-base">{stat.label}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Camera,
                title: "Photography",
                description: "Professional photography services for all your needs"
              },
              {
                icon: Video,
                title: "Video Editing",
                description: "Professional video editing and post-production services"
              },
              {
                icon: Palette,
                title: "Graphic Design",
                description: "Creative design solutions for your brand and marketing needs"
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
              <form>
                <div className="space-y-6">
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Name" 
                      className="border rounded-md p-4 h-14 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      className="border rounded-md p-4 h-14 focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <Textarea 
                      placeholder="Message" 
                      className="border rounded-md p-4 min-h-[150px] focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <Button 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-14"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </form>
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
