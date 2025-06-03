
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ImageGrid, { ImageItem } from '@/components/ImageGrid';
import { getGalleryImages } from '@/services/galleryService';
import { toast } from '@/hooks/use-toast';

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const loadGallery = async (isRetry = false) => {
    setIsLoading(true);
    
    try {
      console.log('Loading gallery images...', isRetry ? `(retry ${retryCount + 1})` : '');
      const galleryImages = await getGalleryImages();
      console.log('Loaded images count:', galleryImages.length);
      setImages(galleryImages);
      
      if (isRetry) {
        toast.success({ title: 'Gallery refreshed successfully' });
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      
      if (retryCount < 2) {
        console.log('Retrying gallery load...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadGallery(true), 2000);
      } else {
        toast.error({ title: 'Failed to load gallery images. Please refresh the page.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleDownload = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    
    if (image) {
      try {
        console.log('Starting download for image:', imageId);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        
        // Fetch the image to create a blob URL (this ensures proper downloading)
        fetch(image.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
          })
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
            toast.error({ title: 'Failed to download image. The image might not be accessible.' });
          });
      } catch (error) {
        console.error('Error initiating download:', error);
        toast.error({ title: 'Failed to download image' });
      }
    }
  };

  const handleRetryLoad = () => {
    setRetryCount(0);
    loadGallery(true);
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {[...Array(12)].map((_, index) => (
                <div 
                  key={index} 
                  className="aspect-[4/3] bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  {images.length} images loaded
                </p>
                <button
                  onClick={handleRetryLoad}
                  className="text-sm text-primary hover:underline"
                >
                  Refresh Gallery
                </button>
              </div>
              <ImageGrid 
                images={images}
                onDownload={handleDownload}
              />
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No images available</h3>
              <p className="text-muted-foreground mb-4">
                {retryCount > 0 
                  ? "Unable to load images after multiple attempts." 
                  : "Check back soon for updates to our gallery"
                }
              </p>
              {retryCount > 0 && (
                <button
                  onClick={handleRetryLoad}
                  className="text-primary hover:underline"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
