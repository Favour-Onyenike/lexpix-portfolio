
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
import { ImageItem } from '@/components/ImageGrid';

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

  useEffect(() => {
    // Load existing events from localStorage
    const savedData = localStorage.getItem('eventsData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setEvents(parsedData.events || []);
    }
  }, []);

  useEffect(() => {
    // Save events data whenever it changes
    localStorage.setItem('eventsData', JSON.stringify({ events }));
  }, [events]);

  const handleCreateEvent = () => {
    if (!newEvent.title) {
      toast.error('Please enter an event title');
      return;
    }

    if (!coverImage) {
      toast.error('Please upload a cover image');
      return;
    }

    // In a real app, we would upload to a server and get back URLs
    // For this demo, we'll use data URLs for the cover image
    const coverImageUrl = URL.createObjectURL(coverImage);
    
    // Create a new event
    const eventId = crypto.randomUUID();
    const newEventData: EventItem = {
      id: eventId,
      title: newEvent.title || 'Untitled Event',
      description: newEvent.description || '',
      coverImage: coverImageUrl,
      date: newEvent.date || format(new Date(), 'yyyy-MM-dd'),
      imageCount: eventImages.length,
    };
    
    setEvents((prev) => [...prev, newEventData]);
    
    // Store event images
    if (eventImages.length > 0) {
      const eventImageItems: ImageItem[] = eventImages.map(file => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        title: file.name.split('.')[0],
      }));
      
      // Save event images in localStorage
      localStorage.setItem(`eventImages_${eventId}`, JSON.stringify({ images: eventImageItems }));
    }
    
    // Reset form and close sheet
    setNewEvent({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setCoverImage(null);
    setEventImages([]);
    setIsCreateOpen(false);
    
    toast.success('Event created successfully');
  };

  const handleCoverImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setCoverImage(files[0]);
      toast.success('Cover image selected');
    }
  };

  const handleEventImagesUpload = (files: File[]) => {
    setEventImages((prev) => [...prev, ...files]);
    toast.success(`${files.length} images added to event`);
  };

  const handleDeleteEvent = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      // Find the event to get its cover image URL
      const eventToDelete = events.find(event => event.id === deleteId);
      
      // Filter out the deleted event
      setEvents(events.filter(event => event.id !== deleteId));
      
      // Revoke the object URL to avoid memory leaks
      if (eventToDelete?.coverImage.startsWith('blob:')) {
        URL.revokeObjectURL(eventToDelete.coverImage);
      }
      
      // Remove event images from localStorage
      localStorage.removeItem(`eventImages_${deleteId}`);
      
      toast.success('Event deleted successfully');
      setDeleteId(null);
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
          <Button onClick={() => setIsCreateOpen(true)}>
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
            <Button onClick={() => setIsCreateOpen(true)}>
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
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Briefly describe this event"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Cover Image</Label>
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
              <Label>Event Images</Label>
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
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleCreateEvent}>Create Event</Button>
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
