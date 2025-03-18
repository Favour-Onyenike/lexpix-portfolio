
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <div className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <img 
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2764&auto=format&fit=crop"
            alt="Hero" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 flex items-center justify-center flex-col p-6 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center max-w-3xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-md">
                Capturing moments that last forever
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md max-w-2xl mx-auto">
                Professional photography services for weddings, events, and portraits
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="btn-hover">
                  <Link to="/gallery">View Gallery</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 btn-hover">
                  <Link to="/events">Client Events</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Featured Work</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A selection of our best photography across various occasions and styles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Weddings",
                image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2940&auto=format&fit=crop",
                description: "Capturing the magic of your special day with elegance and emotion."
              },
              {
                title: "Portraits",
                image: "https://images.unsplash.com/photo-1611042553484-d61f84d22784?q=80&w=2942&auto=format&fit=crop",
                description: "Personal portraits that tell your unique story and showcase your personality."
              },
              {
                title: "Events",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2940&auto=format&fit=crop",
                description: "Documenting the energy and essence of corporate and social gatherings."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group overflow-hidden rounded-lg"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-white/80 mb-4 max-w-xs">{item.description}</p>
                    <Button size="sm" variant="outline" asChild className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30">
                      <Link to="/gallery">
                        View Work <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild>
              <Link to="/gallery">
                Explore Full Gallery <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional photography services tailored to your specific needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Professional Shoots",
                description: "Studio and on-location photography with professional lighting and equipment."
              },
              {
                icon: Camera,
                title: "Event Coverage",
                description: "Comprehensive documentation of weddings, corporate events, and celebrations."
              },
              {
                icon: Camera,
                title: "Post-Production",
                description: "Expert editing, retouching, and delivery of high-resolution digital images."
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 rounded-full p-3 inline-block mb-4">
                  <service.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary text-primary-foreground rounded-xl overflow-hidden"
          >
            <div className="relative p-12 md:p-16">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-semibold mb-4">Ready to book your session?</h2>
                <p className="opacity-90 mb-8">
                  Let's create memories that will last a lifetime. Contact us to discuss your photography needs and book your session.
                </p>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/40 hover:bg-primary-foreground/10">
                  <a href="mailto:contact@example.com">
                    Get in Touch
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
