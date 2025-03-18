
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  date: string;
  imageCount: number;
}

interface EventCardProps {
  event: EventItem;
  onDelete?: (id: string) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete, className }) => {
  const eventDate = new Date(event.date);
  const timeAgo = formatDistanceToNow(eventDate, { addSuffix: true });
  
  return (
    <div className={cn("group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-md", className)}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={event.coverImage} 
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-black/30 text-white border-none backdrop-blur-sm">
            <Calendar size={12} className="mr-1" />
            {timeAgo}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 text-balance">{event.title}</h3>
        
        {event.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center">
            <ImageIcon size={12} className="mr-1" />
            {event.imageCount} photos
          </span>
          
          <div className="flex gap-2">
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(event.id);
                }}
                className="text-xs h-8 text-muted-foreground hover:text-destructive"
              >
                Delete
              </Button>
            )}
            
            <Button variant="default" size="sm" asChild className="text-xs h-8">
              <Link to={`/events/${event.id}`}>
                View Gallery
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
