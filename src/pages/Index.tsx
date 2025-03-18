import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Video, Palette, ArrowRight, Mail, Phone, Building2, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';

const Index = () => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  
  const statsData = [
    { target: 25, label: "Satisfied Clients" },
    { target: 20, label: "Projects Completed" },
    { target: 3, label: "Years Experience" },
    { target: 200, label: "Photos Delivered" }
  ];
  
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

  return (
    <Layout>
      <section className="flex flex-col md:flex-row items-center py-16 md:py-24 px-6 md:px-10 bg-white">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-10 md:mb-0">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            less is more.
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
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8"
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
            <div className="bg-yellow-400 rounded-full overflow-hidden aspect-square max-w-xl mx-auto">
              <img 
                src="/lovable-uploads/2d6b9714-58b4-4087-ad68-b2d396684bce.png" 
                alt="Photographer" 
                className="w-full h-full object-cover mix-blend-darken"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-10 bg-black text-white">
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
            {[
              {
                title: "Events",
                description: "Capturing memorable moments from special events and celebrations.",
                image: "/lovable-uploads/9a5b8dd9-88d8-4ed4-bacf-07c70e1bdffe.png",
                link: "/events"
              },
              {
                title: "Portrait Series",
                description: "Professional portraits that capture personality and character in every shot.",
                image: "/lovable-uploads/6cb9671f-5f66-4a21-9e45-d97a2994a1e5.png",
                link: "/gallery"
              },
              {
                title: "Places",
                description: "Stunning photography of landscapes, architecture, and beautiful locations.",
                image: "/lovable-uploads/9d5ac26c-b0f6-4bcf-8420-4e8745b54848.png",
                link: "/gallery"
              }
            ].map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-black border border-gray-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={project.image} 
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
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-16 md:py-20 px-6 md:px-10 bg-yellow-400 text-black">
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

      <section className="py-16 md:py-24 px-6 md:px-10 bg-white">
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

      <section id="contact" className="py-16 md:py-24 px-6 md:px-10 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="p-8 md:p-12 col-span-3 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="mb-2">
                  <div className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center mb-6">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-8">
                  Feel free to contact us any time. We will get back to you as soon as we can!
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Name" 
                      className="border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0"
                    />
                  </div>
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      className="border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0"
                    />
                  </div>
                  <div>
                    <Input 
                      type="text" 
                      placeholder="Message" 
                      className="border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="pt-4">
                    <Button 
                      className="w-full bg-black hover:bg-yellow-400 hover:text-black transition-colors duration-300 text-white"
                    >
                      SEND
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-black text-white p-8 md:p-12 col-span-2">
                <h3 className="text-2xl font-bold mb-8">Info</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-4" />
                    <span>info@photostudio.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-4" />
                    <span>+24 56 89 146</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-4" />
                    <span>14 Greenroad St.</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-4" />
                    <span>09:00 - 18:00</span>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-20 justify-end">
                  <a href="#" className="text-white hover:text-yellow-400 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-white hover:text-yellow-400 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-white hover:text-yellow-400 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
