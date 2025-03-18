
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import ImageGrid, { ImageItem } from '@/components/ImageGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Image } from 'lucide-react';
import { motion } from 'framer-motion';

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // Load existing gallery images from localStorage
    const savedData = localStorage.getItem('galleryData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setImages(parsedData.images || []);
    }
  }, []);

  useEffect(() => {
    // Save gallery data whenever it changes
    localStorage.setItem('galleryData', JSON.stringify({ images }));
  }, [images]);

  const handleImageUpload = (files: File[]) => {
    const newImages: ImageItem[] = files.map((file) => {
      // In a real app, we would upload to a server and get back a URL
      // For this demo, we'll use data URLs
      const imageUrl = URL.createObjectURL(file);
      return {
        id: crypto.randomUUID(),
        url: imageUrl,
        title: file.name.split('.')[0],
      };
    });
    
    setImages((prev) => [...prev, ...newImages]);
    setActiveTab('manage');
    toast.success(`${files.length} images added to gallery`);
  };

  const handleDeleteImage = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      // Find the image to get its URL
      const imageToDelete = images.find(img => img.id === deleteId);
      
      // Filter out the deleted image
      setImages(images.filter(image => image.id !== deleteId));
      
      // Revoke the object URL to avoid memory leaks
      if (imageToDelete?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      
      toast.success('Image removed from gallery');
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Gallery Management</h1>
          <p className="text-muted-foreground">Upload and manage your portfolio images</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <PlusCircle size={16} />
              Upload Images
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Image size={16} />
              Manage Gallery
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ImageUploader onImageUpload={handleImageUpload} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="manage" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {images.length > 0 ? (
                <ImageGrid 
                  images={images}
                  onDelete={handleDeleteImage}
                />
              ) : (
                <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No images yet</h3>
                  <p className="text-muted-foreground">
                    Upload images to start building your gallery
                  </p>
                  <Button 
                    onClick={() => setActiveTab('upload')} 
                    className="mt-4"
                  >
                    Upload Images
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this image from your gallery.
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

export default Gallery;
