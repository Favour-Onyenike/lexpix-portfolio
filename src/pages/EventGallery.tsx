
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import ImageGrid, { ImageItem } from '@/components/ImageGrid';
import { EventItem } from '@/components/EventCard';
import { getEvent, getEventImages } from '@/services/eventService';

const EventGallery = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    
    const loadEventData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch event data
        const eventData = await getEvent(eventId);
        if (eventData) {
          setEvent(eventData);
          
          // Fetch event images
          const eventImages = await getEventImages(eventId);
          setImages(eventImages);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        toast.error('Failed to load event');
      } finally {
        // Add a small delay to simulate loading for smoother animation
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    loadEventData();
  }, [eventId]);

  const handleDownload = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    
    if (image) {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.title || `event-photo-${imageId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Image download started');
    }
  };

  if (!eventId) {
    return (
      <Layout>
        <div className="py-12 px-6 text-center">
          <h1 className="text-2xl font-medium mb-4">Event not found</h1>
          <Button asChild>
            <Link to="/events">Return to Events</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button 
              variant="ghost" 
              className="mb-6 p-0 h-8" 
              asChild
            >
              <Link to="/events">
                <ArrowLeft size={16} className="mr-2" />
                Back to Events
              </Link>
            </Button>
            
            {isLoading ? (
              <div className="space-y-4 mb-8">
                <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              </div>
            ) : event ? (
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2">{event.title}</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <Calendar size={16} className="mr-2" />
                  <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                </div>
                {event.description && (
                  <p className="max-w-2xl">{event.description}</p>
                )}
              </div>
            ) : (
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-4">Event Not Found</h1>
                <p className="text-muted-foreground">
                  This event may have been removed or the link is incorrect
                </p>
              </div>
            )}
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <div 
                  key={index} 
                  className="aspect-[3/4] bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : images.length > 0 ? (
            <ImageGrid 
              images={images} 
              onDownload={handleDownload}
            />
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
              <h3 className="text-xl font-medium mb-2">No images available</h3>
              <p className="text-muted-foreground">
                This event doesn't have any photos yet
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventGallery;
