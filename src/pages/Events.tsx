import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import EventCard, { EventItem } from '@/components/EventCard';
import { getEvents } from '@/services/eventService';
import { toast } from '@/hooks/use-toast';

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        // Add a small delay to simulate loading for smoother animation
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    loadEvents();
  }, []);

  return (
    <Layout>
      <div className="py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-semibold mb-4">Client Events</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access your event photos and download high-resolution images
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-[16/9] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
              <h3 className="text-xl font-medium mb-2">No events available</h3>
              <p className="text-muted-foreground">
                Check back later for your event photos
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Events;
