
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import EventCard, { EventItem } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Calendar, Image, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { createEvent, deleteEvent, getEvents } from '@/services/eventService';

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventItem>>({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const eventsData = await getEvents();
      console.log('Loaded events:', eventsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (!newEvent.title?.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    if (!coverImage) {
      toast.error('Please upload a cover image');
      return;
    }

    setIsLoading(true);
    
    try {
      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description?.trim(),
        date: newEvent.date || format(new Date(), 'yyyy-MM-dd'),
      };
      
      console.log('Creating event with data:', eventData);
      console.log('Cover image:', coverImage.name);
      console.log('Event images count:', eventImages.length);
      
      const createdEvent = await createEvent(
        eventData,
        coverImage,
        eventImages
      );
      
      if (createdEvent) {
        setEvents(prev => [createdEvent, ...prev]);
        
        // Reset form
        setNewEvent({
          title: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
        });
        setCoverImage(null);
        setEventImages([]);
        setIsCreateOpen(false);
        
        toast.success('Event created successfully');
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setCoverImage(files[0]);
      console.log('Cover image selected:', files[0].name);
    }
  };

  const handleEventImagesUpload = (files: File[]) => {
    setEventImages((prev) => [...prev, ...files]);
    console.log(`${files.length} images added to event gallery`);
  };

  const handleDeleteEvent = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      setIsLoading(true);
      
      try {
        const success = await deleteEvent(deleteId);
        
        if (success) {
          setEvents(events.filter(event => event.id !== deleteId));
          toast.success('Event deleted successfully');
        } else {
          toast.error('Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      } finally {
        setIsLoading(false);
        setDeleteId(null);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Event Galleries</h1>
            <p className="text-muted-foreground">Create and manage client event galleries</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} disabled={isLoading}>
            <PlusCircle size={16} className="mr-2" />
            Create Event
          </Button>
        </div>

        {events.length > 0 ? (
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
                <EventCard 
                  event={event} 
                  onDelete={handleDeleteEvent}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event gallery for clients
            </p>
            <Button onClick={() => setIsCreateOpen(true)} disabled={isLoading}>
              Create Event
            </Button>
          </div>
        )}
      </div>

      {/* Create Event Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Create New Event</SheetTitle>
            <SheetDescription>
              Set up a new event gallery for your clients
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Briefly describe this event"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Event Date *</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Cover Image *</Label>
              <div className="border rounded-md p-3">
                {coverImage ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-md">
                    <img 
                      src={URL.createObjectURL(coverImage)} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => setCoverImage(null)}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <ImageUploader 
                    onImageUpload={handleCoverImageUpload} 
                    multiple={false} 
                  />
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Event Images (Optional)</Label>
              <div className="border rounded-md p-3">
                <ImageUploader 
                  onImageUpload={handleEventImagesUpload} 
                  multiple={true}
                />
                {eventImages.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {eventImages.length} images selected
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </SheetClose>
            <Button 
              onClick={handleCreateEvent} 
              disabled={isLoading || !newEvent.title?.trim() || !coverImage}
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event and all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Events;
