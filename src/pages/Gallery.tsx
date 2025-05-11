
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ImageGrid, { ImageItem } from '@/components/ImageGrid';
import { getGalleryImages } from '@/services/galleryService';
import { toast } from '@/hooks/use-toast';

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      setIsLoading(true);
      
      try {
        const galleryImages = await getGalleryImages();
        setImages(galleryImages);
      } catch (error) {
        console.error('Error loading gallery:', error);
        toast.error({ title: 'Failed to load gallery images' });
      } finally {
        // Add a small delay to simulate loading for smoother animation
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    loadGallery();
  }, []);

  const handleDownload = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    
    if (image) {
      try {
        // Create a temporary anchor element
        const link = document.createElement('a');
        
        // Fetch the image to create a blob URL (this ensures proper downloading)
        fetch(image.url)
          .then(response => response.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            link.href = blobUrl;
            link.download = image.title || `photo-${imageId}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the blob URL after download is initiated
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            
            toast.success({ title: 'Image download started' });
          })
          .catch(err => {
            console.error('Error downloading image:', err);
            toast.error({ title: 'Failed to download image' });
          });
      } catch (error) {
        console.error('Error initiating download:', error);
        toast.error({ title: 'Failed to download image' });
      }
    }
  };

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
            <h1 className="text-4xl font-semibold mb-4">Photography Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of professional photography showcasing our best work
            </p>
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
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No images yet</h3>
              <p className="text-muted-foreground">
                Check back soon for updates to our gallery
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
