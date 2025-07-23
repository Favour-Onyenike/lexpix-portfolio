
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import PaginatedImageGrid from '@/components/PaginatedImageGrid';
import { ImageItem } from '@/components/ImageGrid';
import { Button } from '@/components/ui/button';
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
import { createGalleryImage, deleteGalleryImage, getGalleryImages, uploadImage } from '@/services/galleryService';

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);

  const loadGalleryImages = async () => {
    try {
      const galleryImages = await getGalleryImages();
      setImages(galleryImages);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      toast.error('Failed to load gallery images');
    }
  };

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      for (const file of files) {
        try {
          console.log('Uploading file:', file.name, 'Size:', file.size);
          
          const imageUrl = await uploadImage(file);
          if (!imageUrl) {
            throw new Error('Failed to get image URL');
          }
          
          const galleryImage = await createGalleryImage({
            title: file.name.split('.')[0],
            url: imageUrl
          });
          
          if (galleryImage) {
            successCount++;
            console.log('Successfully uploaded:', file.name);
          } else {
            failCount++;
            console.error('Failed to create gallery image for:', file.name);
          }
        } catch (error) {
          failCount++;
          console.error('Error uploading file:', file.name, error);
          
          // Show specific error message for storage limit
          if (error instanceof Error && error.message.includes('Storage limit exceeded')) {
            toast.error(error.message);
            break; // Stop processing remaining files
          }
        }
      }
      
      if (successCount > 0) {
        await loadGalleryImages();
        setActiveTab('manage');
        if (failCount === 0) {
          toast.success(`Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}`);
        } else {
          toast.success(`Uploaded ${successCount} image${successCount > 1 ? 's' : ''}, ${failCount} failed`);
        }
      } else if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Upload process error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      setIsLoading(true);
      
      try {
        const success = await deleteGalleryImage(deleteId);
        
        if (success) {
          setImages(images.filter(image => image.id !== deleteId));
          toast.success('Image removed from gallery');
        } else {
          toast.error('Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      } finally {
        setIsLoading(false);
        setDeleteId(null);
      }
    }
  };

  const handleDownload = (id: string) => {
    const image = images.find(img => img.id === id);
    
    if (image) {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.title || `image-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Image download started');
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
              <ImageUploader 
                onImageUpload={handleImageUpload}
                multiple={true} 
              />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="manage" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(20)].map((_, index) => (
                    <div 
                      key={index}
                      className="aspect-[3/4] bg-muted animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <PaginatedImageGrid 
                  images={images}
                  onDelete={handleDeleteImage}
                  onDownload={handleDownload}
                  itemsPerPage={20}
                />
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
